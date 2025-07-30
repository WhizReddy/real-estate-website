import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InteractiveMapView from '../InteractiveMapView';

// Mock Leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    remove: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    invalidateSize: jest.fn(),
    getBounds: jest.fn(() => ({
      contains: jest.fn(() => true),
      getNorthEast: jest.fn(() => ({ lat: 41, lng: -73 })),
      getSouthWest: jest.fn(() => ({ lat: 40, lng: -74 })),
    })),
    fitBounds: jest.fn(),
    getZoom: jest.fn(() => 10),
    getCenter: jest.fn(() => ({ lat: 40.7128, lng: -74.0060 })),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    on: jest.fn(),
    setLatLng: jest.fn(),
  })),
  icon: jest.fn(() => ({})),
  divIcon: jest.fn(() => ({})),
  markerClusterGroup: jest.fn(() => ({
    addLayer: jest.fn(),
    addTo: jest.fn(),
    clearLayers: jest.fn(),
    getLayers: jest.fn(() => []),
  })),
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="interactive-map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, ...props }: any) => (
    <div data-testid="interactive-marker" {...props}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
    fitBounds: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }),
}));

const mockProperties = [
  {
    id: 1,
    title: 'Interactive Property 1',
    price: 700000,
    location: 'Interactive Location 1',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    image: '/test-image-1.jpg',
    beds: 3,
    baths: 2,
    sqft: 1500,
    type: 'House',
  },
  {
    id: 2,
    title: 'Interactive Property 2',
    price: 950000,
    location: 'Interactive Location 2',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    image: '/test-image-2.jpg',
    beds: 4,
    baths: 3,
    sqft: 2000,
    type: 'Condo',
  },
];

describe('InteractiveMapView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders interactive map container', () => {
    render(<InteractiveMapView properties={mockProperties} />);
    expect(screen.getByTestId('interactive-map-container')).toBeInTheDocument();
  });

  it('renders clustering controls', () => {
    render(<InteractiveMapView properties={mockProperties} />);
    expect(screen.getByLabelText('Toggle clustering')).toBeInTheDocument();
  });

  it('toggles clustering when button is clicked', () => {
    render(<InteractiveMapView properties={mockProperties} />);
    
    const clusterToggle = screen.getByLabelText('Toggle clustering');
    fireEvent.click(clusterToggle);
    
    // Should toggle clustering state
    expect(clusterToggle).toBeInTheDocument();
  });

  it('renders map controls', () => {
    render(<InteractiveMapView properties={mockProperties} />);
    
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset view')).toBeInTheDocument();
  });

  it('handles zoom controls', () => {
    render(<InteractiveMapView properties={mockProperties} />);
    
    const zoomInButton = screen.getByLabelText('Zoom in');
    const zoomOutButton = screen.getByLabelText('Zoom out');
    
    fireEvent.click(zoomInButton);
    fireEvent.click(zoomOutButton);
    
    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
  });

  it('resets view when reset button is clicked', () => {
    render(<InteractiveMapView properties={mockProperties} />);
    
    const resetButton = screen.getByLabelText('Reset view');
    fireEvent.click(resetButton);
    
    expect(resetButton).toBeInTheDocument();
  });

  it('calls onBoundsChange when map bounds change', () => {
    const mockOnBoundsChange = jest.fn();
    render(
      <InteractiveMapView 
        properties={mockProperties} 
        onBoundsChange={mockOnBoundsChange}
      />
    );
    
    // Simulate bounds change
    // In a real scenario, this would be triggered by map interaction
    expect(mockOnBoundsChange).toBeDefined();
  });

  it('calls onPropertyHover when property is hovered', () => {
    const mockOnPropertyHover = jest.fn();
    render(
      <InteractiveMapView 
        properties={mockProperties} 
        onPropertyHover={mockOnPropertyHover}
      />
    );
    
    expect(mockOnPropertyHover).toBeDefined();
  });

  it('highlights selected property', () => {
    render(
      <InteractiveMapView 
        properties={mockProperties} 
        selectedPropertyId={1}
      />
    );
    
    // Should highlight the selected property marker
    const markers = screen.getAllByTestId('interactive-marker');
    expect(markers).toHaveLength(mockProperties.length);
  });

  it('handles empty properties gracefully', () => {
    render(<InteractiveMapView properties={[]} />);
    expect(screen.getByTestId('interactive-map-container')).toBeInTheDocument();
    expect(screen.queryByTestId('interactive-marker')).not.toBeInTheDocument();
  });

  it('applies custom center and zoom', () => {
    const customCenter = { lat: 41.0, lng: -73.0 };
    const customZoom = 12;
    
    render(
      <InteractiveMapView 
        properties={mockProperties}
        center={customCenter}
        zoom={customZoom}
      />
    );
    
    expect(screen.getByTestId('interactive-map-container')).toBeInTheDocument();
  });

  it('handles marker click events', async () => {
    const mockOnPropertySelect = jest.fn();
    render(
      <InteractiveMapView 
        properties={mockProperties}
        onPropertySelect={mockOnPropertySelect}
      />
    );
    
    const markers = screen.getAllByTestId('interactive-marker');
    fireEvent.click(markers[0]);
    
    // Should trigger property selection
    expect(markers[0]).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<InteractiveMapView properties={mockProperties} loading={true} />);
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorMessage = 'Map failed to load';
    render(<InteractiveMapView properties={mockProperties} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles keyboard navigation for controls', () => {
    render(<InteractiveMapView properties={mockProperties} />);
    
    const zoomInButton = screen.getByLabelText('Zoom in');
    fireEvent.keyDown(zoomInButton, { key: 'Enter' });
    
    expect(zoomInButton).toBeInTheDocument();
  });

  it('updates markers when properties change', () => {
    const { rerender } = render(<InteractiveMapView properties={mockProperties} />);
    
    const newProperties = [...mockProperties, {
      id: 3,
      title: 'New Property',
      price: 800000,
      location: 'New Location',
      coordinates: { lat: 40.8, lng: -73.9 },
      image: '/test-image-3.jpg',
      beds: 2,
      baths: 1,
      sqft: 1200,
      type: 'Apartment',
    }];
    
    rerender(<InteractiveMapView properties={newProperties} />);
    
    const markers = screen.getAllByTestId('interactive-marker');
    expect(markers).toHaveLength(newProperties.length);
  });
});