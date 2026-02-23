import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// Mock Next.js components and hooks
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn(), replace: jest.fn(), prefetch: jest.fn() })
}));

jest.mock('next/dynamic', () => {
  return function mockDynamic(importFunc: any, options: any) {
    const React = require('react');
    return function DynamicComponent(props: any) {
      const [{ Component }, setComponent] = React.useState({ Component: null });

      React.useEffect(() => {
        let mounted = true;
        Promise.resolve(importFunc()).then((mod: any) => {
          if (mounted) {
            setComponent({ Component: mod.default || mod });
          }
        }).catch(() => { });
        return () => { mounted = false; };
      }, []);

      if (!Component) return options?.loading ? options.loading() : null;
      return <Component {...props} />;
    };
  };
});

// Mock the data functions

const mockPropertiesConfig = [
    {
      id: 'prop-1',
      title: 'Modern Apartment in Tirana',
      description: 'Beautiful apartment',
      price: 150000,
      address: {
        street: 'Main St 123',
        city: 'Tirana',
        state: 'Tirana',
        zipCode: '1001',
        coordinates: { lat: 41.3275, lng: 19.8187 }
      },
      details: {
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 85,
        propertyType: 'apartment',
        yearBuilt: 2020
      },
      images: ['/test1.jpg'],
      features: ['parking', 'balcony'],
      status: 'active',
      listingType: 'sale',
      isPinned: true,
      agent: {
        id: 'agent-1',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '+1234567890'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prop-2',
      title: 'Family House in Durres',
      description: 'Spacious house',
      price: 250000,
      address: {
        street: 'Oak Ave 456',
        city: 'Durres',
        state: 'Durres',
        zipCode: '2001',
        coordinates: { lat: 41.3247, lng: 19.4564 }
      },
      details: {
        bedrooms: 4,
        bathrooms: 2,
        squareFootage: 150,
        propertyType: 'house',
        yearBuilt: 2018
      },
      images: ['/test2.jpg'],
      features: ['garden', 'garage'],
      status: 'active',
      listingType: 'sale',
      isPinned: false,
      agent: {
        id: 'agent-2',
        name: 'Jane Smith',
        email: 'jane@test.com',
        phone: '+1234567891'
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];
global.fetch = jest.fn((url) => {
  if (url.includes('/api/properties')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ properties: mockPropertiesConfig, pagination: { total: mockPropertiesConfig.length, hasMore: false } }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as jest.Mock;


// Mock dynamic components
const MockSearchFilters = ({ properties, onFilteredResults }: any) => (
  <div data-testid="search-filters">
    <input
      data-testid="search-input"
      placeholder="Search properties..."
      onChange={(e) => {
        const filtered = properties.filter((p: any) =>
          p.title.toLowerCase().includes(e.target.value.toLowerCase())
        );
        onFilteredResults(filtered);
      }}
    />
  </div>
);

const MockSearchResults = ({ properties }: any) => (
  <div data-testid="search-results">
    {properties.map((property: any) => (
      <div key={property.id} data-testid={`property-${property.id}`}>
        {property.title}
      </div>
    ))}
  </div>
);

const MockMapView = ({ properties }: any) => (
  <div data-testid="map-view">
    Map showing {properties.length} properties
  </div>
);

jest.mock('@/components/SearchFilters', () => MockSearchFilters);
jest.mock('@/components/SearchResults', () => MockSearchResults);
jest.mock('@/components/SimpleMapView', () => MockMapView);

jest.mock('@/components/Layout', () => {
  return function MockLayout({ children }: any) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock('@/components/StructuredData', () => {
  return function MockStructuredData() {
    return null;
  };
});

jest.mock('@/components/CreativeLoader', () => {
  return function MockCreativeLoader() {
    return <div data-testid="loader">Loading...</div>;
  };
});

jest.mock('@/components/MobileFloatingActions', () => {
  return function MockMobileFloatingActions() {
    return <div data-testid="mobile-actions">Mobile Actions</div>;
  };
});

jest.mock('@/components/MobileSearchModal', () => {
  return function MockMobileSearchModal() {
    return <div data-testid="mobile-search">Mobile Search</div>;
  };
});

describe('Property Search Integration', () => {
  it('renders the home page with properties', async () => {
    render(<Home />);

    // Wait for loading to complete
    await screen.findByTestId('search-input');
    await screen.findByTestId('map-view');

    // Check that properties are displayed
    expect(screen.getByTestId('search-results')).toBeInTheDocument();
    expect(screen.getByTestId('property-prop-1')).toBeInTheDocument();
    expect(screen.getByTestId('property-prop-2')).toBeInTheDocument();
  });

  it('filters properties based on search input', async () => {
    render(<Home />);

    // Wait for loading to complete
    await screen.findByTestId('search-input');
    await screen.findByTestId('map-view');

    // Search for "apartment"
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'apartment' } });

    // Check that only the apartment is shown
    await waitFor(() => {
      expect(screen.getByTestId('property-prop-1')).toBeInTheDocument();
      expect(screen.queryByTestId('property-prop-2')).not.toBeInTheDocument();
    });
  });

  it('updates map when properties are filtered', async () => {
    render(<Home />);

    // Wait for loading to complete
    await screen.findByTestId('search-input');
    await screen.findByTestId('map-view');

    // Initially shows all properties on map
    await screen.findByText('Map showing 2 properties');

    // Filter properties
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'apartment' } });

    // Map should update to show filtered properties
    await waitFor(() => {
      expect(screen.getByText('Map showing 1 properties')).toBeInTheDocument();
    });
  });

  it('displays hero section with property statistics', async () => {
    render(<Home />);

    // Wait for loading to complete
    await screen.findByTestId('search-input');
    await screen.findByTestId('map-view');

    // Check hero section content
    expect(screen.getByText(/Gjeni Shtëpinë Tuaj të/)).toBeInTheDocument();
    expect(screen.getByText(/Përsosur/)).toBeInTheDocument();
  });

  it('shows mobile components', async () => {
    render(<Home />);

    // Wait for loading to complete
    await screen.findByTestId('search-input');
    await screen.findByTestId('map-view');

    // Check mobile components are rendered
    expect(screen.getByTestId('mobile-actions')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-search')).toBeInTheDocument();
  });

  it('handles empty search results', async () => {
    render(<Home />);

    // Wait for loading to complete
    await screen.findByTestId('search-input');
    await screen.findByTestId('map-view');

    // Search for something that doesn't exist
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Check that no properties are shown
    await waitFor(() => {
      expect(screen.queryByTestId('property-prop-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('property-prop-2')).not.toBeInTheDocument();
    });

    // Map should show 0 properties
    await screen.findByText('Map showing 0 properties');
  });
});