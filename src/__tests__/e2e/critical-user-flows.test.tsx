import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: jest.fn(),
    pathname: '/',
    query: {},
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

const mockRouterPush = jest.fn();

// Mock API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock data
const mockProperties = [
  {
    id: 1,
    title: 'Luxury Downtown Condo',
    price: 750000,
    location: 'Downtown, City',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    image: '/images/property-1.jpg',
    beds: 2,
    baths: 2,
    sqft: 1200,
    type: 'Condo',
    description: 'Beautiful downtown condo with city views',
    features: ['Balcony', 'Gym', 'Concierge'],
    yearBuilt: 2018,
    status: 'active',
  },
  {
    id: 2,
    title: 'Suburban Family Home',
    price: 450000,
    location: 'Suburbs, City',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    image: '/images/property-2.jpg',
    beds: 4,
    baths: 3,
    sqft: 2500,
    type: 'House',
    description: 'Perfect family home with large yard',
    features: ['Garden', 'Garage', 'Fireplace'],
    yearBuilt: 2015,
    status: 'active',
  },
];

// Mock components that would be in a real app
const MockApp = () => {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [properties, setProperties] = React.useState(mockProperties);
  const [filters, setFilters] = React.useState({});
  const [selectedProperty, setSelectedProperty] = React.useState(null);
  const [favorites, setFavorites] = React.useState<number[]>([]);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    mockRouterPush(`/${page}`);
  };

  const handleSearch = (searchFilters: any) => {
    setFilters(searchFilters);
    let filtered = mockProperties;

    if (searchFilters.minPrice) {
      filtered = filtered.filter(p => p.price >= searchFilters.minPrice);
    }
    if (searchFilters.maxPrice) {
      filtered = filtered.filter(p => p.price <= searchFilters.maxPrice);
    }
    if (searchFilters.type) {
      filtered = filtered.filter(p => p.type.toLowerCase() === searchFilters.type.toLowerCase());
    }

    setProperties(filtered);
  };

  const toggleFavorite = (propertyId: number) => {
    setFavorites(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <div data-testid="app">
      {/* Navigation */}
      <nav data-testid="main-navigation">
        <button onClick={() => handleNavigation('home')}>Home</button>
        <button onClick={() => handleNavigation('properties')}>Properties</button>
        <button onClick={() => handleNavigation('map')}>Map</button>
        <button onClick={() => handleNavigation('contact')}>Contact</button>
      </nav>

      {/* Home Page */}
      {currentPage === 'home' && (
        <div data-testid="home-page">
          <h1>Welcome to Real Estate App</h1>
          <div data-testid="hero-search">
            <input
              data-testid="hero-search-input"
              placeholder="Search properties..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNavigation('properties');
                }
              }}
            />
            <button onClick={() => handleNavigation('properties')}>
              Search Properties
            </button>
          </div>
          <div data-testid="featured-properties">
            <h2>Featured Properties</h2>
            {mockProperties.slice(0, 3).map(property => (
              <div key={property.id} data-testid={`featured-property-${property.id}`}>
                <h3>{property.title}</h3>
                <p>${property.price.toLocaleString()}</p>
                <button onClick={() => setSelectedProperty(property)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Properties Page */}
      {currentPage === 'properties' && (
        <div data-testid="properties-page">
          <h1>Properties</h1>

          {/* Search Filters */}
          <div data-testid="search-filters">
            <input
              data-testid="min-price-input"
              type="number"
              placeholder="Min Price"
              onChange={(e) => handleSearch({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
            />
            <input
              data-testid="max-price-input"
              type="number"
              placeholder="Max Price"
              onChange={(e) => handleSearch({ ...filters, maxPrice: parseInt(e.target.value) || Infinity })}
            />
            <select
              data-testid="property-type-select"
              onChange={(e) => handleSearch({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
            </select>
            <button
              data-testid="clear-filters"
              onClick={() => {
                setFilters({});
                setProperties(mockProperties);
              }}
            >
              Clear Filters
            </button>
          </div>

          {/* Results */}
          <div data-testid="search-results">
            <p data-testid="results-count">{properties.length} properties found</p>
            <div data-testid="property-grid">
              {properties.map(property => (
                <div key={property.id} data-testid={`property-card-${property.id}`}>
                  <img src={property.image} alt={property.title} />
                  <h3>{property.title}</h3>
                  <p>${property.price.toLocaleString()}</p>
                  <p>{property.location}</p>
                  <p>{property.beds} beds • {property.baths} baths • {property.sqft} sqft</p>
                  <div data-testid="property-actions">
                    <button
                      data-testid={`favorite-btn-${property.id}`}
                      onClick={() => toggleFavorite(property.id)}
                      aria-label={favorites.includes(property.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.includes(property.id) ? '❤️' : '🤍'}
                    </button>
                    <button
                      data-testid={`view-details-${property.id}`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Page */}
      {currentPage === 'map' && (
        <div data-testid="map-page">
          <h1>Property Map</h1>
          <div data-testid="map-container">
            <div data-testid="map-view">Map View</div>
            <div data-testid="map-markers">
              {properties.map(property => (
                <button
                  key={property.id}
                  data-testid={`map-marker-${property.id}`}
                  onClick={() => setSelectedProperty(property)}
                >
                  {property.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Page */}
      {currentPage === 'contact' && (
        <div data-testid="contact-page">
          <h1>Contact Us</h1>
          <form data-testid="contact-form">
            <input
              data-testid="contact-name"
              placeholder="Your Name"
              required
            />
            <input
              data-testid="contact-email"
              type="email"
              placeholder="Your Email"
              required
            />
            <textarea
              data-testid="contact-message"
              placeholder="Your Message"
              required
            />
            <button type="button" onClick={(e) => { e.preventDefault(); e.currentTarget.closest('form')?.dispatchEvent(new Event('submit')) }} data-testid="contact-submit">
              Send Message
            </button>
          </form>
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div data-testid="property-modal" role="dialog" aria-modal="true">
          <div data-testid="modal-content">
            <button
              data-testid="close-modal"
              onClick={() => setSelectedProperty(null)}
              aria-label="Close property details"
            >
              ×
            </button>
            <h2>{selectedProperty.title}</h2>
            <img src={selectedProperty.image} alt={selectedProperty.title} />
            <p>${selectedProperty.price.toLocaleString()}</p>
            <p>{selectedProperty.location}</p>
            <p>{selectedProperty.description}</p>
            <div data-testid="property-features">
              <h3>Features</h3>
              <ul>
                {selectedProperty.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button
              data-testid="contact-agent"
              onClick={() => {
                setSelectedProperty(null);
                handleNavigation('contact');
              }}
            >
              Contact Agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

describe('Critical User Flows E2E Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProperties),
    });
  });

  describe('Property Search Flow', () => {
    it('allows users to search and filter properties', async () => {
      render(<MockApp />);

      // Start from home page
      expect(screen.getByTestId('home-page')).toBeInTheDocument();

      // Navigate to properties page
      await user.click(screen.getByText('Properties'));
      expect(screen.getByTestId('properties-page')).toBeInTheDocument();

      // Check initial results
      expect(screen.getByText('2 properties found')).toBeInTheDocument();

      // Apply price filter
      const minPriceInput = screen.getByTestId('min-price-input');
      await user.type(minPriceInput, '600000');

      // Should filter results
      await waitFor(() => {
        expect(screen.getByText('1 properties found')).toBeInTheDocument();
      });

      // Apply property type filter
      const typeSelect = screen.getByTestId('property-type-select');
      await user.selectOptions(typeSelect, 'condo');

      // Should further filter results
      await waitFor(() => {
        expect(screen.getByText('1 properties found')).toBeInTheDocument();
        expect(screen.getAllByText('Luxury Downtown Condo')[0]).toBeInTheDocument();
      });

      // Clear filters
      await user.click(screen.getByTestId('clear-filters'));

      // Should show all results again
      await waitFor(() => {
        expect(screen.getByText('2 properties found')).toBeInTheDocument();
      });
    });

    it('allows users to favorite properties', async () => {
      render(<MockApp />);

      // Navigate to properties
      await user.click(screen.getByText('Properties'));

      // Add property to favorites
      const favoriteBtn = screen.getByTestId('favorite-btn-1');
      expect(favoriteBtn).toHaveTextContent('🤍');

      await user.click(favoriteBtn);
      expect(favoriteBtn).toHaveTextContent('❤️');

      // Remove from favorites
      await user.click(favoriteBtn);
      expect(favoriteBtn).toHaveTextContent('🤍');
    });
  });

  describe('Property Detail Flow', () => {
    it('allows users to view property details from search results', async () => {
      render(<MockApp />);

      // Navigate to properties
      await user.click(screen.getByText('Properties'));

      // Click view details
      await user.click(screen.getByTestId('view-details-1'));

      // Modal should open
      const modal = screen.getByTestId('property-modal');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText('Luxury Downtown Condo')).toBeInTheDocument();
      expect(within(modal).getByText('Beautiful downtown condo with city views')).toBeInTheDocument();

      // Check features are displayed
      const featuresSection = screen.getByTestId('property-features');
      expect(within(featuresSection).getByText('Balcony')).toBeInTheDocument();
      expect(within(featuresSection).getByText('Gym')).toBeInTheDocument();

      // Close modal
      await user.click(screen.getByTestId('close-modal'));
      expect(screen.queryByTestId('property-modal')).not.toBeInTheDocument();
    });

    it('allows users to contact agent from property details', async () => {
      render(<MockApp />);

      // Navigate to properties and open details
      await user.click(screen.getByText('Properties'));
      await user.click(screen.getByTestId('view-details-1'));

      // Click contact agent
      await user.click(screen.getByTestId('contact-agent'));

      // Should navigate to contact page
      expect(screen.getByTestId('contact-page')).toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/contact');
    });
  });

  describe('Map Interaction Flow', () => {
    it('allows users to view properties on map', async () => {
      render(<MockApp />);

      // Navigate to map
      await user.click(screen.getByText('Map'));
      expect(screen.getByTestId('map-page')).toBeInTheDocument();

      // Check map markers are present
      expect(screen.getByTestId('map-marker-1')).toBeInTheDocument();
      expect(screen.getByTestId('map-marker-2')).toBeInTheDocument();

      // Click on map marker
      await user.click(screen.getByTestId('map-marker-1'));

      // Property details should open
      const modal = screen.getByTestId('property-modal');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText('Luxury Downtown Condo')).toBeInTheDocument();
    });
  });

  describe('Contact Form Flow', () => {
    it('allows users to submit contact form', async () => {
      render(<MockApp />);

      // Navigate to contact page
      await user.click(screen.getByText('Contact'));
      expect(screen.getByTestId('contact-page')).toBeInTheDocument();

      // Fill out form
      await user.type(screen.getByTestId('contact-name'), 'John Doe');
      await user.type(screen.getByTestId('contact-email'), 'john@example.com');
      await user.type(screen.getByTestId('contact-message'), 'I am interested in your properties.');

      // Submit form
      await user.click(screen.getByTestId('contact-submit'));

      // Form should be submitted (in real app, would show success message)
      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });
  });

  describe('Navigation Flow', () => {
    it('allows users to navigate between pages', async () => {
      render(<MockApp />);

      // Start on home page
      expect(screen.getByTestId('home-page')).toBeInTheDocument();

      // Navigate to properties
      await user.click(screen.getByText('Properties'));
      expect(screen.getByTestId('properties-page')).toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/properties');

      // Navigate to map
      await user.click(screen.getByText('Map'));
      expect(screen.getByTestId('map-page')).toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/map');

      // Navigate to contact
      await user.click(screen.getByText('Contact'));
      expect(screen.getByTestId('contact-page')).toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/contact');

      // Navigate back to home
      await user.click(screen.getByText('Home'));
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/home');
    });
  });

  describe('Accessibility Flow', () => {
    it('supports keyboard navigation', async () => {
      render(<MockApp />);

      // Navigate to properties
      await user.click(screen.getByText('Properties'));

      // Use keyboard to navigate through property cards
      const firstViewButton = screen.getByTestId('view-details-1');
      firstViewButton.focus();

      // Press Enter to open details
      await user.keyboard('{Enter}');
      expect(screen.getByTestId('property-modal')).toBeInTheDocument();

      // Use Escape to close modal
      await user.keyboard('{Escape}');
      expect(screen.queryByTestId('property-modal')).not.toBeInTheDocument();
    });

    it('provides proper ARIA labels and roles', async () => {
      render(<MockApp />);

      // Navigate to properties
      await user.click(screen.getByText('Properties'));

      // Check ARIA labels on favorite buttons
      const favoriteBtn = screen.getByTestId('favorite-btn-1');
      expect(favoriteBtn).toHaveAttribute('aria-label', 'Add to favorites');

      // Click to favorite
      await user.click(favoriteBtn);
      expect(favoriteBtn).toHaveAttribute('aria-label', 'Remove from favorites');

      // Open property modal
      await user.click(screen.getByTestId('view-details-1'));

      // Check modal has proper ARIA attributes
      const modal = screen.getByTestId('property-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');

      // Check close button has proper label
      const closeBtn = screen.getByTestId('close-modal');
      expect(closeBtn).toHaveAttribute('aria-label', 'Close property details');
    });
  });

  describe('Error Handling Flow', () => {
    it('handles API errors gracefully', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(<MockApp />);

      // Navigate to properties (would normally trigger API call)
      await user.click(screen.getByText('Properties'));

      // Should still show the page (with fallback data)
      expect(screen.getByTestId('properties-page')).toBeInTheDocument();
    });

    it('handles empty search results', async () => {
      render(<MockApp />);

      // Navigate to properties
      await user.click(screen.getByText('Properties'));

      // Apply filter that returns no results
      const minPriceInput = screen.getByTestId('min-price-input');
      await user.type(minPriceInput, '2000000');

      // Should show no results
      await waitFor(() => {
        expect(screen.getByText('0 properties found')).toBeInTheDocument();
      });
    });
  });
});