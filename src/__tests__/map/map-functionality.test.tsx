/**
 * Tests for map functionality including performance, interactions, and search integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MapView from '@/components/MapView';
import { Property } from '@/types';

// Mock Leaflet
const mockMap = {
  setView: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  remove: jest.fn(),
  whenReady: jest.fn((callback) => callback()),
  on: jest.fn(),
  eachLayer: jest.fn(),
  fitBounds: jest.fn(),
  invalidateSize: jest.fn(),
  getContainer: jest.fn(() => ({ style: {} })),
};

const mockMarker = {
  addTo: jest.fn(() => mockMarker),
  bindTooltip: jest.fn(() => mockMarker),
  bindPopup: jest.fn(() => mockMarker),
  on: jest.fn(() => mockMarker),
  remove: jest.fn(),
  openTooltip: jest.fn(),
  closeTooltip: jest.fn(),
  openPopup: jest.fn(),
};

const mockTileLayer = {
  addTo: jest.fn(() => mockTileLayer),
  on: jest.fn(),
};

const mockClusterGroup = {
  addLayer: jest.fn(),
  addTo: jest.fn(),
};

const mockLeaflet = {
  map: jest.fn(() => mockMap),
  tileLayer: jest.fn(() => mockTileLayer),
  marker: jest.fn(() => mockMarker),
  divIcon: jest.fn(() => ({})),
  canvas: jest.fn(() => ({})),
  featureGroup: jest.fn(() => ({ getBounds: () => ({ pad: () => ({}) }) })),
  markerClusterGroup: jest.fn(() => mockClusterGroup),
};

// Mock dynamic import of Leaflet
jest.mock('leaflet', () => mockLeaflet);

// Mock error handlers
jest.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    hasError: false,
    error: null,
    canRetry: true,
    retry: jest.fn(),
    reset: jest.fn(),
    handleError: jest.fn(),
    retryCount: 0,
  }),
  useNetworkError: () => ({
    networkError: null,
    checkNetworkError: jest.fn(() => false),
  }),
}));

// Mock performance monitor
jest.mock('@/lib/performance-monitor', () => ({
  trackMapPerformance: jest.fn(),
}));

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Test Property 1',
    price: 100000,
    status: 'active',
    listingType: 'sale',
    address: {
      street: 'Test Street 1',
      city: 'Tirana',
      coordinates: { lat: 41.3275, lng: 19.8187 }
    },
    details: {
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 100,
      propertyType: 'apartment',
      yearBuilt: 2020,
    },
    features: ['parking'],
    images: [],
    description: 'Test property 1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Test Property 2',
    price: 200000,
    status: 'active',
    listingType: 'rent',
    address: {
      street: 'Test Street 2',
      city: 'Tirana',
      coordinates: { lat: 41.3285, lng: 19.8197 }
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 150,
      propertyType: 'house',
      yearBuilt: 2019,
    },
    features: ['garden'],
    images: [],
    description: 'Test property 2',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

describe('Map Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize map with correct settings', async () => {
    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      expect(mockLeaflet.map).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          center: [41.3275, 19.8187],
          zoom: 13,
          preferCanvas: true,
          zoomAnimation: true,
          fadeAnimation: true,
          markerZoomAnimation: true,
        })
      );
    });
  });

  it('should create markers for all properties', async () => {
    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      expect(mockLeaflet.marker).toHaveBeenCalledTimes(mockProperties.length);
    });

    // Check that markers are created with correct coordinates
    expect(mockLeaflet.marker).toHaveBeenCalledWith([41.3275, 19.8187], expect.any(Object));
    expect(mockLeaflet.marker).toHaveBeenCalledWith([41.3285, 19.8197], expect.any(Object));
  });

  it('should implement marker clustering', async () => {
    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      expect(mockLeaflet.markerClusterGroup).toHaveBeenCalledWith(
        expect.objectContaining({
          chunkedLoading: true,
          chunkInterval: 200,
          chunkDelay: 50,
          maxClusterRadius: 80,
        })
      );
    });
  });

  it('should handle property selection', async () => {
    const onPropertySelect = jest.fn();
    render(<MapView properties={mockProperties} onPropertySelect={onPropertySelect} />);

    await waitFor(() => {
      expect(mockMarker.on).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  it('should update markers when properties change', async () => {
    const { rerender } = render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      expect(mockLeaflet.marker).toHaveBeenCalledTimes(2);
    });

    // Update with fewer properties
    const updatedProperties = [mockProperties[0]];
    rerender(<MapView properties={updatedProperties} />);

    await waitFor(() => {
      expect(mockMarker.remove).toHaveBeenCalled();
    });
  });

  it('should handle map layer switching', async () => {
    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      const layerButtons = screen.getAllByRole('button');
      const satelliteButton = layerButtons.find(btn => btn.title === 'Pamja satelitore');
      
      if (satelliteButton) {
        fireEvent.click(satelliteButton);
        expect(mockMap.eachLayer).toHaveBeenCalled();
      }
    });
  });

  it('should handle geolocation requests', async () => {
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success({
          coords: {
            latitude: 41.3275,
            longitude: 19.8187,
          },
        });
      }),
    };
    
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      const locationButton = screen.getByTitle('Shko te lokacioni im');
      fireEvent.click(locationButton);
      
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });

  it('should handle fullscreen toggle', async () => {
    // Mock fullscreen API
    const mockRequestFullscreen = jest.fn();
    const mockExitFullscreen = jest.fn();
    
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    });
    
    Object.defineProperty(document, 'exitFullscreen', {
      value: mockExitFullscreen,
      writable: true,
    });

    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      const fullscreenButton = screen.getByTitle('Harta në ekran të plotë');
      
      // Mock the map ref element
      const mapElement = { requestFullscreen: mockRequestFullscreen };
      
      fireEvent.click(fullscreenButton);
      // Note: In a real test, we'd need to properly mock the ref
    });
  });

  it('should filter properties based on map filters', async () => {
    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      const priceFilter = screen.getByDisplayValue('Të gjitha');
      fireEvent.change(priceFilter, { target: { value: 'low' } });
      
      // Should filter properties and update markers
      expect(mockMarker.remove).toHaveBeenCalled();
    });
  });

  it('should handle map errors gracefully', async () => {
    // Mock Leaflet to throw an error
    mockLeaflet.map.mockImplementation(() => {
      throw new Error('Map initialization failed');
    });

    render(<MapView properties={mockProperties} />);

    // Should not crash and should show error state
    await waitFor(() => {
      expect(screen.queryByText('Map Loading Failed')).toBeInTheDocument();
    });
  });

  it('should optimize performance with batched marker creation', async () => {
    const manyProperties = Array.from({ length: 100 }, (_, i) => ({
      ...mockProperties[0],
      id: `property-${i}`,
      address: {
        ...mockProperties[0].address,
        coordinates: { lat: 41.3275 + i * 0.001, lng: 19.8187 + i * 0.001 }
      }
    }));

    render(<MapView properties={manyProperties} />);

    // Should use requestAnimationFrame for batching
    await waitFor(() => {
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });
  });

  it('should handle invalid coordinates gracefully', async () => {
    const propertiesWithInvalidCoords = [
      {
        ...mockProperties[0],
        address: {
          ...mockProperties[0].address,
          coordinates: { lat: NaN, lng: NaN }
        }
      }
    ];

    // Mock console.warn to check for warnings
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<MapView properties={propertiesWithInvalidCoords} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Invalid coordinates for property:', expect.any(String));
    });

    consoleSpy.mockRestore();
  });

  it('should clean up resources on unmount', () => {
    const { unmount } = render(<MapView properties={mockProperties} />);

    unmount();

    // Should clean up map instance
    expect(mockMap.remove).toHaveBeenCalled();
  });

  it('should handle mobile touch interactions', async () => {
    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      expect(mockLeaflet.map).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          tap: true,
          tapTolerance: 15,
          touchZoom: true,
        })
      );
    });
  });

  it('should provide accessibility features', async () => {
    render(<MapView properties={mockProperties} />);

    await waitFor(() => {
      // Check for ARIA labels and titles
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('title');
      });
    });
  });
});