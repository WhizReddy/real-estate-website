'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { fetchNearbyPlacesCached, OSMPlace } from '@/lib/openstreetmap';
import { 
  MapPin, 
  Navigation, 
  Maximize2,
  Minimize2,
  Layers
} from 'lucide-react';

interface PropertyDetailMapProps {
  property: Property;
  nearbyProperties?: Property[];
  height?: string;
  showNeighborhood?: boolean;
  showDirections?: boolean;
  className?: string;
}

// Use OSMPlace type from openstreetmap.ts
type NeighborhoodPlace = OSMPlace;

export default function PropertyDetailMap({
  property,
  nearbyProperties = [],
  height = '400px',
  showNeighborhood = false, // Disabled until real API integration
  showDirections = true,
  className = ''
}: PropertyDetailMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const innerContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<ReturnType<typeof Object> | null>(null);
  const markersRef = useRef<Array<ReturnType<typeof Object>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false); // Disabled
  const [selectedPlace, setSelectedPlace] = useState<NeighborhoodPlace | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock nearby places data - DISABLED FOR NOW
  // TODO: Replace with real API integration (Google Places or OpenStreetMap)
  const nearbyPlaces = useMemo<NeighborhoodPlace[]>(() => ([
    // Commented out mock data - enable when real API is integrated
    /*
    {
      id: '1',
      name: 'Shkolla e Mesme "Fan Noli"',
      type: 'school',
      distance: 0.3,
      coordinates: { lat: property.address.coordinates.lat + 0.002, lng: property.address.coordinates.lng + 0.001 },
      rating: 4.2,
      address: 'Rruga Dëshmorët e Kombit'
    },
    */
  ]), []);

  const initializeMap = async () => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const L = await import('leaflet');

      // Completely clean up previous map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error removing previous map:', e);
        }
        mapInstanceRef.current = null;
      }

      // Force remove Leaflet markers from DOM to prevent "already initialized" error
      if (mapRef.current) {
        // Remove all Leaflet-specific attributes and properties
        const el = mapRef.current as HTMLDivElement & { _leaflet_id?: string };
        
        // Delete Leaflet's internal ID
        if (el._leaflet_id) {
          delete el._leaflet_id;
        }
        
        // Remove all child elements and listeners
        mapRef.current.innerHTML = '';
        while (mapRef.current.firstChild) {
          mapRef.current.removeChild(mapRef.current.firstChild);
        }
        
        // Clear all data attributes and event listeners
        Array.from(mapRef.current.attributes).forEach(attr => {
          if (attr.name.startsWith('data-leaflet')) {
            mapRef.current.removeAttribute(attr.name);
          }
        });
        
        // Remove any inline styles that might interfere
        const classes = mapRef.current.className || '';
        mapRef.current.className = classes.replace(/leaflet-\S+/g, '');
      }

      markersRef.current = [];

      // Ensure container has a visible size before creating the map (prevents _leaflet_pos issues)
      const waitForVisibleContainer = async (el: HTMLDivElement, maxMs = 1500) => {
        const isVisible = () => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) return true;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          return rect.width > 0 && rect.height > 0;
        };
        if (isVisible()) return;
        await new Promise<void>((resolve) => {
          let resolved = false;
          const ro = new ResizeObserver(() => {
            if (isVisible() && !resolved) {
              resolved = true;
              try { ro.disconnect(); } catch {}
              resolve();
            }
          });
          ro.observe(el);
          window.setTimeout(() => {
            if (!resolved) {
              try { ro.disconnect(); } catch {}
              resolved = true;
              resolve();
            }
          }, Math.max(250, Math.min(maxMs, 1500)));
          // no need to store timeout here; short-lived
        });
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      };

      // Mobile fallback: ensure a decent height
      try {
        const rect = mapRef.current.getBoundingClientRect();
        const top = Math.max(0, rect.top);
        const available = Math.floor(window.innerHeight - top);
        const desired = isFullscreen ? window.innerHeight : parseInt((height || '400px').toString());
        if (available > 0 && rect.height < Math.max(200, Math.min(available, desired || 400))) {
          mapRef.current.style.minHeight = Math.max(280, Math.min(available, desired || 400)) + 'px';
        }
      } catch {}

      await waitForVisibleContainer(mapRef.current, 1200);

      // Create a fresh inner container for Leaflet so we never reuse a DOM node
      // that may still have _leaflet_id set by another instance.
      if (!mapRef.current) throw new Error('Map container missing');
      // Clean any previously created inner container
      if (innerContainerRef.current && innerContainerRef.current.parentElement === mapRef.current) {
        try { innerContainerRef.current.remove(); } catch {}
        innerContainerRef.current = null;
      }

      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      // Give it a unique id so debugging is easier and Leaflet won't reuse
      inner.id = `leaflet-container-${property.id}-${Date.now()}`;
      // ensure no stray leaflet props
      try {
        // remove any stray leaflet id if present
        const maybe = inner as unknown as { _leaflet_id?: unknown };
        if (maybe && maybe._leaflet_id) {
          try { delete maybe._leaflet_id; } catch {}
        }
      } catch {}
      mapRef.current.appendChild(inner);
      innerContainerRef.current = inner;

      const map = L.map(inner, {
        center: [property.address.coordinates.lat, property.address.coordinates.lng],
        zoom: 15,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true,
        maxBounds: null,
        maxBoundsViscosity: 0.0,
        // Disable animations to mitigate white tile flashes on both mobile and detail view transitions
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false,
        preferCanvas: true,
      });
      try { map.zoomControl?.setPosition('bottomleft'); } catch {}

      // Add tile layer
      type ProviderSpec = { url: string; attribution: string; options?: Parameters<typeof L.tileLayer>[1] };
      const streetProviders: ProviderSpec[] = [
        { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap contributors', options: { maxZoom: 19 } },
        { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: '&copy; OpenStreetMap & CARTO', options: { maxZoom: 20, subdomains: 'abcd' as unknown as string[] } },
      ];
      const satelliteProviders: ProviderSpec[] = [
        { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Esri', options: { maxZoom: 19 } },
      ];

      const providers = mapLayer === 'satellite' ? satelliteProviders : streetProviders;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tileLayer: any = null;
      const attachTiles = (index: number) => {
        const spec = providers[index];
        if (!spec) return;
        if (tileLayer) {
          try { map.removeLayer(tileLayer); } catch {}
          tileLayer = null;
        }
        tileLayer = L.tileLayer(spec.url, {
          attribution: spec.attribution,
          detectRetina: true,
          crossOrigin: true,
          updateWhenIdle: true,
          updateWhenZooming: false,
          keepBuffer: 2,
          tileSize: 256,
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3MzgwIiBmb250LXNpemU9IjE0Ij5NYXAgVGlsZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==',
          ...(spec.options || {}),
        }).addTo(map);
        let errCount = 0;
        tileLayer.on('tileerror', () => {
          errCount += 1;
          try { map.invalidateSize(); } catch {}
          if (errCount >= 3 && index + 1 < providers.length) {
            attachTiles(index + 1);
          }
        });
      };
      attachTiles(0);

      mapInstanceRef.current = map;

  // Attach a reference to the inner container so we can clean it later
  try { (map as unknown as Record<string, unknown>)._containerElement = innerContainerRef.current; } catch {}

      // Force map to invalidate size after a short delay to ensure proper rendering
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 100);

      // Keep responsive on resize/orientation
      const onWinResize = () => {
        try { map.invalidateSize(); } catch {}
      };
      window.addEventListener('resize', onWinResize);
      window.addEventListener('orientationchange', onWinResize);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (map as any).__onWinResize = onWinResize;

      // Add main property marker
      addPropertyMarker(L, map, property);

      // Add nearby properties
      if (nearbyProperties.length > 0) {
        addNearbyPropertyMarkers(L, map, nearbyProperties);
      }

      // Add neighborhood places
      if (showNeighborhood && showNearbyPlaces) {
        addNeighborhoodMarkers(L, map, nearbyPlaces);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Property map initialization error:', error);
      setError('Failed to load map');
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addPropertyMarker = (L: any, map: any, prop: Property) => {
    const coords = prop.address.coordinates;
    
    // Create custom marker for main property
    const mainMarkerIcon = L.divIcon({
      html: `
  <div class="main-property-marker bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg text-sm font-bold shadow-xl border-3 border-white relative">
          <div class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          ${formatPrice(prop.price)}
        </div>
      `,
      className: 'main-property-marker-container',
      iconSize: [120, 40],
      iconAnchor: [60, 40],
    });

    const marker = L.marker([coords.lat, coords.lng], { icon: mainMarkerIcon })
      .addTo(map);

    const popupContent = `
      <div class="p-4 min-w-[280px]">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
          <div>
            <h3 class="font-bold text-gray-900 mb-1">${prop.title}</h3>
            <p class="text-sm text-gray-600 mb-2">${prop.address.street}, ${prop.address.city}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div class="text-center p-2 bg-gray-50 rounded">
            <div class="font-semibold text-gray-900">${prop.details.bedrooms}</div>
            <div class="text-gray-600">Dhoma</div>
          </div>
          <div class="text-center p-2 bg-gray-50 rounded">
            <div class="font-semibold text-gray-900">${prop.details.bathrooms}</div>
            <div class="text-gray-600">Banjo</div>
          </div>
          <div class="text-center p-2 bg-gray-50 rounded">
            <div class="font-semibold text-gray-900">${prop.details.squareFootage}</div>
            <div class="text-gray-600">m²</div>
          </div>
        </div>
        
        <div class="flex justify-between items-center mb-3">
          <span class="text-lg font-bold text-blue-600">${formatPrice(prop.price)}</span>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">${prop.details.propertyType}</span>
        </div>
        
        <div class="flex gap-2">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}" 
             target="_blank" 
             class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-all text-center font-medium">
            🧭 Navigim
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'main-property-popup',
      closeButton: true,
    });

    markersRef.current.push(marker);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addNearbyPropertyMarkers = (L: any, map: any, properties: Property[]) => {
    properties.forEach((prop) => {
      const coords = prop.address.coordinates;
      
      const nearbyMarkerIcon = L.divIcon({
        html: `
          <div class="nearby-property-marker bg-linear-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-lg border-2 border-white hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer">
            ${formatPrice(prop.price)}
          </div>
        `,
        className: 'nearby-property-marker-container',
        iconSize: [100, 32],
        iconAnchor: [50, 32],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: nearbyMarkerIcon })
        .addTo(map);

      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h4 class="font-semibold text-gray-900 mb-1 text-sm">${prop.title}</h4>
          <p class="text-xs text-gray-600 mb-2">${prop.address.street}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-blue-600 text-sm">${formatPrice(prop.price)}</span>
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${prop.details.propertyType}</span>
          </div>
          <a href="/properties/${prop.id}" class="block w-full bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-all text-center font-medium">
            Shiko Detajet
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 220,
        className: 'nearby-property-popup',
      });

      markersRef.current.push(marker);
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addNeighborhoodMarkers = (L: any, map: any, places: NeighborhoodPlace[]) => {
    places.forEach((place) => {
      const icon = getPlaceIcon(place.type);
      
      const placeMarkerIcon = L.divIcon({
        html: `
          <div class="neighborhood-marker bg-white border-2 border-gray-500 rounded-full p-2 shadow-lg hover:shadow-xl transition-all cursor-pointer">
            <div class="text-gray-600 text-sm">${icon}</div>
          </div>
        `,
        className: 'neighborhood-marker-container',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { 
        icon: placeMarkerIcon 
      }).addTo(map);

      const popupContent = `
        <div class="p-3 min-w-[180px]">
          <div class="flex items-center gap-2 mb-2">
            <div class="text-gray-600">${icon}</div>
            <h4 class="font-semibold text-gray-900 text-sm">${place.name}</h4>
          </div>
          <p class="text-xs text-gray-600 mb-2">${place.address}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-gray-500">${place.distance} km larg</span>
            ${place.rating ? `<div class="flex items-center gap-1">
              <span class="text-yellow-500 text-xs">⭐</span>
              <span class="text-xs text-gray-600">${place.rating}</span>
            </div>` : ''}
          </div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}" 
             target="_blank" 
             class="block w-full bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-all text-center font-medium">
            Navigim
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 200,
        className: 'neighborhood-popup',
      });

      marker.on('click', () => {
        setSelectedPlace(place);
      });

      markersRef.current.push(marker);
    });
  };

  const getPlaceIcon = (type: NeighborhoodPlace['type']) => {
    switch (type) {
      case 'school': return '🏫';
      case 'shopping': return '🛒';
      case 'hospital': return '🏥';
      case 'restaurant': return '🍽️';
      case 'transport': return '🚌';
      default: return '📍';
    }
  };

  useEffect(() => {
    let canceled = false;
    const hostRef = mapRef.current;
    const init = async () => {
      if (canceled) return;
      await initializeMap();
    };
    init();

    return () => {
      canceled = true;
      const host = hostRef;
      if (mapInstanceRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handler = (mapInstanceRef.current as any).__onWinResize;
          if (handler) {
            window.removeEventListener('resize', handler);
            window.removeEventListener('orientationchange', handler);
          }
        } catch {}
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error cleaning up property map:', error);
        }
        // Also remove the inner container element if present
        try {
          const innerEl = innerContainerRef.current;
          if (innerEl && host && innerEl.parentElement === host) {
            innerEl.remove();
          }
        } catch {}
        innerContainerRef.current = null;
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLayer, showNearbyPlaces, nearbyPlaces, nearbyProperties, property]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
  };

  const toggleMapLayer = () => {
    setMapLayer(prev => prev === 'street' ? 'satellite' : 'street');
  };

  if (error) {
    return (
      <div className={`relative ${className}`} style={{ height }}>
        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Failed to load map</p>
            <button 
              onClick={initializeMap}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className={`${isFullscreen ? 'fixed inset-0 z-200 bg-white' : 'relative'} ${className}`}>
      <div
        ref={mapRef}
        style={{ height: isFullscreen ? '100vh' : height }}
        className={`w-full ${isFullscreen ? '' : 'rounded-lg shadow-md border border-gray-200 overflow-hidden'} touch-pan-x touch-pan-y bg-gray-50`}
      />

      {/* Map Controls */}
  <div className={`absolute top-3 right-3 flex flex-col gap-2 ${isFullscreen ? 'z-1000' : 'z-10'}`}>
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 text-gray-600" />
          ) : (
            <Maximize2 className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Layer Toggle */}
        <button
          onClick={toggleMapLayer}
          className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors"
          title={mapLayer === 'street' ? 'Satellite View' : 'Street View'}
        >
          <Layers className="h-4 w-4 text-gray-600" />
        </button>

        {/* Neighborhood Toggle */}
        {showNeighborhood && (
          <button
            onClick={() => setShowNearbyPlaces(!showNearbyPlaces)}
            className={`p-2 rounded-lg shadow-md border border-gray-200 transition-colors ${
              showNearbyPlaces 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title="Toggle Neighborhood Places"
          >
            <MapPin className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Directions Button */}
      {showDirections && (
  <div className={`absolute bottom-3 right-3 ${isFullscreen ? 'z-1000' : 'z-10'}`}>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${property.address.coordinates.lat},${property.address.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </a>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Neighborhood Legend */}
      {showNeighborhood && showNearbyPlaces && !isLoading && !error && (
  <div className={`absolute bottom-3 left-3 bg-white rounded-lg shadow-md border border-gray-200 p-3 max-w-xs ${isFullscreen ? 'z-1000' : 'z-10'}`}>
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Nearby Places</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span>🏫</span>
              <span className="text-gray-600">Schools</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🛒</span>
              <span className="text-gray-600">Shopping</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏥</span>
              <span className="text-gray-600">Healthcare</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}