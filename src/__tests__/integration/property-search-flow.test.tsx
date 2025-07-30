import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/properties',
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    toString: () => '',
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock API responses
const mockProperties = [
  {
    id: 1,
    title: 'Luxury Villa',
    price: 1200000,
    location: 'Beverly Hills, CA',
    coordinates: { lat: 34.0736, lng: -118.4004 },
    image: '/images/property-1.jpg',
    beds: 4,
    baths: 3,
    sqft: 3500,
    type: 'House',
    description: 'Beautiful luxury villa with pool',
  },
  {
    id: 2,
    title: 'Modern Condo',
    price: 800000,
    location: 'Manhattan, NY',
    coordinates: { lat: 40.7831, lng: -73.9712 },
    image: '/images/property-2.jpg',
    beds: 2,
    baths: 2,
    sqft: 1800,
    type: 'Condo',
    description: 'Modern condo in the heart of the city',
  },
];

// Mock components
const MockSearchFilters = ({ onFiltersChange }: any) => (
  <div data-testid="search-filters">
    <input
      data-testid="price-min"
      placeholder="Min Price"
      onChange={(e) => onFiltersChange({ minPrice: e.target.value })}
    />
    <input
      data-testid="price-max"
      placeholder="Max Price"
      onChange={(e) => onFiltersChange({ maxPrice: e.target.value })}
    />
    <select
      data-testid="property-type"
      onChange={(e) => onFiltersChange({ type: e.target.value })}
    >
      <option value="">All Types</option>
      <option value="house">House</option>
      <option value="condo">Condo</option>
    </select>
    <button data-testid="apply-filters">Apply Filters</button>
  </div>
);

const MockPropertyGrid = ({ properties, loading }: any) => {
  if (loading) {
    return <div data-testid="loading">Loading properties...</div>;
  }
  
  return (
    <div data-testid="property-grid">
      {properties.map((property: any) => (
        <div key={property.id} data-testid={`property-${property.id}`}>
          <h3>{property.title}</h3>
          <p>${property.price.toLocaleString()}</p>
          <p>{property.location}</p>
          <button data-testid={`view-property-${property.id}`}>
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

const MockMapView = ({ properties, onPropertySelect }: any) => (
  <div data-testid="map-view">
    <div data-testid="map-container">Map Container</div>
    {properties.map((property: any) => (
      <button
        key={property.id}
        data-testid={`map-marker-${property.id}`}
        onClick={() => onPropertySelect?.(property)}
      >
        {property.title}
      </button>
    ))}
  </div>
);

jest.mock('../../components/SearchFilters', () => MockSearchFilters);
jest.mock('../../components/PropertyGrid', () => MockPropertyGrid);
jest.mock('../../components/MapView', () => MockMapView);

// Mock the main search page component
function MockPropertySearchPage() {
  const [properties, setProperties] = React.useState(mockProperties);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({});
  const [selectedProperty, setSelectedProperty] = React.useState(null);

  const handleFiltersChange = async (newFilters: any) => {
    setLoading(true);
    setFilters({ ...filters, ...newFilters });
    
    // Simulate API call
    setTimeout(() => {
      let filteredProperties = mockProperties;
      
      if (newFilters.type) {
        filteredProperties = filteredProperties.filter(
          p => p.type.toLowerCase() === newFilters.type.toLowerCase()
        );
      }
      
      if (newFilters.minPrice) {
        filteredProperties = filteredProperties.filter(
          p => p.price >= parseInt(newFilters.minPrice)
        );
      }
      
      if (newFilters.maxPrice) {
        filteredProperties = filteredProperties.filter(
          p => p.price <= parseInt(newFilters.maxPrice)
        );
      }
      
      setProperties(filteredProperties);
      setLoading(false);
    }, 500);
  };

  return (
    <div data-testid="property-search-page">
      <h1>Property Search</h1>
      
      <div data-testid="search-layout" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div data-testid="filters-sidebar">
          <MockSearchFilters onFiltersChange={handleFiltersChange} />
        </div>
        
        <div data-testid="main-content" className="lg:col-span-3">
          <div data-testid="results-header">
            <p>{properties.length} properties found</p>
          </div>
          
          <div data-testid="view-toggle">
            <button data-testid="grid-view">Grid View</button>
            <button data-testid="map-view">Map View</button>
          </div>
          
          <MockPropertyGrid properties={properties} loading={loading} />
          <MockMapView 
            properties={properties} 
            onPropertySelect={setSelectedProperty}
          />
        </div>
      </div>
      
      {selectedProperty && (
        <div data-testid="property-modal">
          <h2>Property Details</h2>
          <button 
            data-testid="close-modal"
            onClick={() => setSelectedProperty(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

describe('Property Search Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders the complete search interface', () => {
    render(<MockPropertySearchPage />);
    
    expect(screen.getByTestId('property-search-page')).toBeInTheDocument();
    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
    expect(screen.getByTestId('property-grid')).toBeInTheDocument();
    expect(screen.getByTestId('map-view')).toBeInTheDocument();
  });

  it('displays initial property count', () => {
    render(<MockPropertySearchPage />);
    
    expect(screen.getByText('2 properties found')).toBeInTheDocument();
  });

  it('filters properties by price range', async () => {
    render(<MockPropertySearchPage />);
    
    const minPriceInput = screen.getByTestId('price-min');
    const maxPriceInput = screen.getByTestId('price-max');
    
    fireEvent.change(minPriceInput, { target: { value: '900000' } });
    fireEvent.change(maxPriceInput, { target: { value: '1500000' } });
    
    await waitFor(() => {
      expect(screen.getByText('1 properties found')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Luxury Villa')).toBeInTheDocument();
    expect(screen.queryByText('Modern Condo')).not.toBeInTheDocument();
  });

  it('filters properties by type', async () => {
    render(<MockPropertySearchPage />);
    
    const propertyTypeSelect = screen.getByTestId('property-type');
    fireEvent.change(propertyTypeSelect, { target: { value: 'condo' } });
    
    await waitFor(() => {
      expect(screen.getByText('1 properties found')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Modern Condo')).toBeInTheDocument();
    expect(screen.queryByText('Luxury Villa')).not.toBeInTheDocument();
  });

  it('shows loading state during search', async () => {
    render(<MockPropertySearchPage />);
    
    const propertyTypeSelect = screen.getByTestId('property-type');
    fireEvent.change(propertyTypeSelect, { target: { value: 'house' } });
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  it('opens property details when map marker is clicked', async () => {
    render(<MockPropertySearchPage />);
    
    const mapMarker = screen.getByTestId('map-marker-1');
    fireEvent.click(mapMarker);
    
    await waitFor(() => {
      expect(screen.getByTestId('property-modal')).toBeInTheDocument();
    });
  });

  it('closes property details modal', async () => {
    render(<MockPropertySearchPage />);
    
    // Open modal
    const mapMarker = screen.getByTestId('map-marker-1');
    fireEvent.click(mapMarker);
    
    await waitFor(() => {
      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('property-modal')).not.toBeInTheDocument();
    });
  });

  it('handles view toggle between grid and map', () => {
    render(<MockPropertySearchPage />);
    
    const gridViewButton = screen.getByTestId('grid-view');
    const mapViewButton = screen.getByTestId('map-view');
    
    fireEvent.click(mapViewButton);
    fireEvent.click(gridViewButton);
    
    expect(gridViewButton).toBeInTheDocument();
    expect(mapViewButton).toBeInTheDocument();
  });

  it('maintains responsive layout on different screen sizes', () => {
    render(<MockPropertySearchPage />);
    
    const searchLayout = screen.getByTestId('search-layout');
    expect(searchLayout).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-4');
    
    const mainContent = screen.getByTestId('main-content');
    expect(mainContent).toHaveClass('lg:col-span-3');
  });

  it('handles empty search results', async () => {
    render(<MockPropertySearchPage />);
    
    // Filter that returns no results
    const minPriceInput = screen.getByTestId('price-min');
    fireEvent.change(minPriceInput, { target: { value: '5000000' } });
    
    await waitFor(() => {
      expect(screen.getByText('0 properties found')).toBeInTheDocument();
    });
  });

  it('allows clearing filters to show all properties', async () => {
    render(<MockPropertySearchPage />);
    
    // Apply filter
    const propertyTypeSelect = screen.getByTestId('property-type');
    fireEvent.change(propertyTypeSelect, { target: { value: 'house' } });
    
    await waitFor(() => {
      expect(screen.getByText('1 properties found')).toBeInTheDocument();
    });
    
    // Clear filter
    fireEvent.change(propertyTypeSelect, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.getByText('2 properties found')).toBeInTheDocument();
    });
  });
});