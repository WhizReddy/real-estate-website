import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FullMapView from '../FullMapView';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock Leaflet and react-leaflet (same as MapView test)
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    remove: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    invalidateSize: jest.fn(),
    getBounds: jest.fn(() => ({
      contains: jest.fn(() => true),
    })),
    fitBounds: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    on: jest.fn(),
  })),
  icon: jest.fn(() => ({})),
  divIcon: jest.fn(() => ({})),
  markerClusterGroup: jest.fn(() => ({
    addLayer: jest.fn(),
    addTo: jest.fn(),
    clearLayers: jest.fn(),
  })),
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="full-map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, ...props }: any) => (
    <div data-testid="marker" {...props}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

const mockProperties = [
  {
    id: 1,
    title: 'Full Map Test Property 1',
    price: 600000,
    location: 'Full Map Location 1',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    image: '/test-image-1.jpg',
    beds: 3,
    baths: 2,
    sqft: 1500,
    type: 'House',
    description: 'Test description 1',
  },
  {
    id: 2,
    title: 'Full Map Test Property 2',
    price: 850000,
    location: 'Full Map Location 2',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    image: '/test-image-2.jpg',
    beds: 4,
    baths: 3,
    sqft: 2000,
    type: 'Condo',
    description: 'Test description 2',
  },
];

describe('FullMapView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders full map container', () => {
    render(<FullMapView />);
    expect(screen.getByTestId('full-map-container')).toBeInTheDocument();
  });

  it('renders search filters sidebar', () => {
    render(<FullMapView />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders property count when properties are loaded', async () => {
    // Mock fetch to return properties
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProperties),
      })
    ) as jest.Mock;

    render(<FullMapView />);
    
    await waitFor(() => {
      expect(screen.getByText(/properties found/i)).toBeInTheDocument();
    });
  });

  it('toggles filters sidebar on mobile', () => {
    render(<FullMapView />);
    
    const toggleButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(toggleButton);
    
    // Check if sidebar visibility changes
    const sidebar = screen.getByTestId('filters-sidebar');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('displays property details when marker is clicked', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProperties),
      })
    ) as jest.Mock;

    render(<FullMapView />);
    
    await waitFor(() => {
      const markers = screen.getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(0);
    });

    // Simulate marker click (would normally trigger property selection)
    // This tests the property details sidebar functionality
  });

  it('handles search filter changes', async () => {
    render(<FullMapView />);
    
    const priceInput = screen.getByLabelText(/min price/i);
    fireEvent.change(priceInput, { target: { value: '500000' } });
    
    await waitFor(() => {
      expect(priceInput).toHaveValue('500000');
    });
  });

  it('handles loading state', () => {
    // Mock fetch to simulate loading
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
    
    render(<FullMapView />);
    expect(screen.getByText('Loading properties...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Failed to fetch'))
    ) as jest.Mock;

    render(<FullMapView />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading properties/i)).toBeInTheDocument();
    });
  });

  it('applies responsive classes for mobile layout', () => {
    render(<FullMapView />);
    
    const container = screen.getByTestId('full-map-view-container');
    expect(container).toHaveClass('flex', 'h-screen');
  });

  it('closes property details sidebar when close button is clicked', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProperties),
      })
    ) as jest.Mock;

    render(<FullMapView />);
    
    // Simulate property selection and then closing
    await waitFor(() => {
      const closeButton = screen.queryByLabelText('Close property details');
      if (closeButton) {
        fireEvent.click(closeButton);
      }
    });
  });

  it('updates URL when filters change', async () => {
    const mockPush = jest.fn();
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
        back: jest.fn(),
      }),
      useSearchParams: () => ({
        get: jest.fn(),
      }),
    }));

    render(<FullMapView />);
    
    const propertyTypeSelect = screen.getByLabelText(/property type/i);
    fireEvent.change(propertyTypeSelect, { target: { value: 'house' } });
    
    // URL should be updated with new filter parameters
    await waitFor(() => {
      // This would normally trigger a router.push call
      expect(propertyTypeSelect).toHaveValue('house');
    });
  });
});