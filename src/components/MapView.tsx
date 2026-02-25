'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { MapPin, Home, Filter, Maximize, Navigation } from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';
import { MapError, NetworkError } from '@/components/ErrorComponents';
import { useErrorHandler, useNetworkError } from '@/hooks/useErrorHandler';

interface MapViewProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function MapView({
  properties,
  selectedProperty,
  onPropertySelect,
  height = '400px',
  center,
  zoom = 13,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const errorHandler = useErrorHandler({
    maxRetries: 3,
    onError: (error, errorId) => {
      console.error('Map error:', error, errorId);
    },
    onRetry: (retryCount) => {
      console.log('Map retry attempt:', retryCount);
    }
  });
  const networkError = useNetworkError();

  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'terrain'>('street');
  // Removed clustering functionality
  const [mapFilters, setMapFilters] = useState({
    priceRange: 'all',
    propertyType: 'all'
  });
  // Removed markerClusterGroup state - using simple layer groups instead
  // const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = async () => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    try {
      setIsLoading(true);
      errorHandler.reset();

      // Dynamically import Leaflet with timeout
      const L = await Promise.race([
        import('leaflet'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Leaflet loading timeout')), 10000)
        )
      ]) as any;

      // Note: Using simple layer groups instead of clustering

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear existing markers
      markersRef.current = [];

      // Default to Tirana, Albania if no center provided
      const mapCenter = center || calculateCenter(properties);

      // Initialize map with performance-optimized settings
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: zoom,
        minZoom: 8,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true,
        boxZoom: false,
        keyboard: false,
        attributionControl: false,
        preferCanvas: true, // Use canvas for better performance
        renderer: L.canvas(), // Force canvas renderer for better performance
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        maxBoundsViscosity: 1.0,
        // Mobile optimizations
        tap: true,
        tapTolerance: 15,
        bounceAtZoomLimits: false,
        worldCopyJump: false,
        closePopupOnClick: true,
        // Performance optimizations
        zoomAnimationThreshold: 4,
        inertia: true,
        inertiaDeceleration: 3000,
        inertiaMaxSpeed: 1500,
      });

      // Use optimized tile layer with error handling
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18,
        timeout: 10000,
        errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCI+VGlsZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+',
        retryDelay: 1000,
        retryLimit: 3,
      });

      // Add error handling for tile loading
      tileLayer.on('tileerror', (e: any) => {
        console.warn('Tile loading error:', e);
        // Retry with exponential backoff
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 2000);
      });

      tileLayer.addTo(map);
      mapInstanceRef.current = map;

      // Wait for map to be ready before adding markers
      map.whenReady(() => {
        try {
          addPropertyMarkers(L, map, properties, onPropertySelect);

          // Simple view setting without complex bounds fitting
          if (properties.length > 0) {
            map.setView(mapCenter, zoom);
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Error adding markers:', error);
          setIsLoading(false);
        }
      });

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Map initialization error:', err);

      // Check if it's a network error
      if (networkError.checkNetworkError(err)) {
        // Handle network error specifically
      }

      errorHandler.handleError(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error cleaning up map:', error);
        }
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
    // initializeMap is intentionally not added to deps to avoid reinitialization loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorHandler.retryCount]);

  // Precompute filtered properties before effects that depend on it
  const filteredProperties = properties.filter(property => {
    if (mapFilters.priceRange !== 'all') {
      const price = property.price;
      switch (mapFilters.priceRange) {
        case 'low':
          if (price > 100000) return false;
          break;
        case 'medium':
          if (price < 100000 || price > 300000) return false;
          break;
        case 'high':
          if (price < 300000) return false;
          break;
      }
    }

    if (mapFilters.propertyType !== 'all') {
      if (property.details.propertyType !== mapFilters.propertyType) return false;
    }

    return true;
  });

  // Update markers when filtered properties change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      try {
        const L = await import('leaflet');

        // Clear existing markers
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (error) {
            console.warn('Error removing marker:', error);
          }
        });
        markersRef.current = [];

        // Add new markers with filtered properties
        await addPropertyMarkers(L, mapInstanceRef.current, filteredProperties, onPropertySelect);

        // Fit bounds to show all filtered properties
        if (filteredProperties.length > 0 && markersRef.current.length > 0) {
          try {
            const group = L.featureGroup(markersRef.current);
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
          } catch (error) {
            console.warn('Error fitting bounds on update:', error);
          }
        }
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    };

    updateMarkers();
  }, [filteredProperties, onPropertySelect]);

  // Highlight selected property
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;

    try {
      const coords = selectedProperty.address.coordinates;
      mapInstanceRef.current.setView([coords.lat, coords.lng], 16, {
        animate: true,
        duration: 1
      });
    } catch (error) {
      console.warn('Error highlighting selected property:', error);
    }
  }, [selectedProperty]);

  const calculateCenter = (props: Property[]): [number, number] => {
    // Default to Tirana, Albania
    if (props.length === 0) return [41.3275, 19.8187];

    const avgLat = props.reduce((sum, p) => sum + p.address.coordinates.lat, 0) / props.length;
    const avgLng = props.reduce((sum, p) => sum + p.address.coordinates.lng, 0) / props.length;

    return [avgLat, avgLng];
  };

  const addPropertyMarkers = async (L: any, map: any, props: Property[], onSelect?: (property: Property) => void) => {
    // Use simple layer group (no clustering to avoid dependency issues)
    const layerGroup = L.layerGroup();

    // Performance optimization: batch marker creation with requestAnimationFrame
    const createMarkersInBatches = (properties: Property[], batchSize = 10) => {
      let index = 0;

      const processBatch = () => {
        const endIndex = Math.min(index + batchSize, properties.length);

        for (let i = index; i < endIndex; i++) {
          const property = properties[i];
          const coords = property.address.coordinates;

          // Skip invalid coordinates
          if (!coords.lat || !coords.lng || isNaN(coords.lat) || isNaN(coords.lng)) {
            console.warn('Invalid coordinates for property:', property.id);
            continue;
          }

          // Create mobile-friendly marker icon
          const markerIcon = L.divIcon({
            html: `
              <div class="property-marker bg-white text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg border-2 border-white cursor-pointer">
                ${formatPrice(property.price)}
              </div>
            `,
            className: 'custom-marker',
            iconSize: [80, 28],
            iconAnchor: [40, 28],
          });

          const marker = L.marker([coords.lat, coords.lng], {
            icon: markerIcon,
            // Add property data to marker for easy access
            propertyData: property
          });

          // Mobile-friendly tooltip content (smaller and simpler)
          const tooltipContent = `
            <div class="p-1 min-w-[120px] max-w-[160px]">
              <h3 class="font-medium text-gray-900 text-xs truncate">${property.title}</h3>
              <span class="font-bold text-blue-600 text-xs">${formatPrice(property.price)}</span>
            </div>
          `;

          // Only bind tooltip on non-touch devices to avoid mobile issues
          if (!('ontouchstart' in window)) {
            marker.bindTooltip(tooltipContent, {
              permanent: false,
              direction: 'top',
              offset: [0, -5],
              className: 'custom-tooltip-mobile'
            });
          }

          // Mobile-friendly popup with essential info only
          const popupContent = `
            <div class="p-3 min-w-[200px] max-w-[250px] animate-fadeIn">
              <h3 class="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">${property.title}</h3>
              <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-blue-600 text-sm">${formatPrice(property.price)}</span>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${property.details.propertyType}</span>
              </div>
              <div class="text-xs text-gray-600 mb-3">
                ${property.details.bedrooms > 0 ? `${property.details.bedrooms} dhoma • ` : ''}${property.details.bathrooms} banjo • ${property.details.squareFootage.toLocaleString()} m²
              </div>
              <div class="flex gap-1 mb-2">
                <a href="/properties/${property.id}" class="flex-1 bg-blue-600 text-white px-2 py-2 rounded text-xs text-center font-medium touch-manipulation">
                  📋 Detajet
                </a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}" target="_blank" class="flex-1 bg-green-600 text-white px-2 py-2 rounded text-xs text-center font-medium touch-manipulation">
                  🧭 Navigim
                </a>
              </div>
              <div class="flex gap-1">
                <button onclick="navigator.share ? navigator.share({title: '${property.title}', text: 'Shiko këtë pasuri: ${property.title}', url: window.location.origin + '/properties/${property.id}'}) : navigator.clipboard.writeText(window.location.origin + '/properties/${property.id}').then(() => alert('Linku u kopjua!'))" class="flex-1 bg-purple-600 text-white px-2 py-2 rounded text-xs text-center font-medium touch-manipulation">
                  📤 Ndaj
                </button>
                <button onclick="window.open('tel:+35569123456', '_self')" class="flex-1 bg-orange-600 text-white px-2 py-2 rounded text-xs text-center font-medium touch-manipulation">
                  📞 Tel
                </button>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 280,
            className: 'custom-popup',
            closeButton: true,
            autoClose: true,
            closeOnClick: true
          });

          // Optimized event handlers - only on non-touch devices
          if (!('ontouchstart' in window)) {
            marker.on('mouseover', function () {
              this.openTooltip();
            });

            marker.on('mouseout', function () {
              this.closeTooltip();
            });
          }

          marker.on('click', function () {
            this.openPopup();
            // Add click handler for property selection
            if (onSelect) {
              onSelect(property);
            }
          });

          // Add marker to layer group
          layerGroup.addLayer(marker);
          markersRef.current.push(marker);
        }

        index = endIndex;

        // Continue processing if there are more properties
        if (index < properties.length) {
          requestAnimationFrame(processBatch);
        } else {
          // All markers processed, add layer group to map
          map.addLayer(layerGroup);
        }
      };

      // Start processing
      requestAnimationFrame(processBatch);
    };

    // Start creating markers in batches for better performance
    createMarkersInBatches(props);
  };

  const handleRetry = () => {
    if (errorHandler.canRetry) {
      errorHandler.retry();
    }
  };



  const changeMapLayer = (layer: 'street' | 'satellite' | 'terrain') => {
    setMapLayer(layer);
    if (mapInstanceRef.current) {
      // Remove existing tile layers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof (window as any).L?.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add new tile layer based on selection
      import('leaflet').then((L) => {
        let tileUrl = '';
        let attribution = '';

        switch (layer) {
          case 'satellite':
            tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            attribution = 'Esri';
            break;
          case 'terrain':
            tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
            attribution = 'OpenTopoMap';
            break;
          default:
            tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            attribution = 'OpenStreetMap';
        }

        L.tileLayer(tileUrl, {
          attribution,
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
      });
    }
  };

  const resetMapView = () => {
    if (mapInstanceRef.current && properties.length > 0) {
      const mapCenter = center || calculateCenter(properties);
      mapInstanceRef.current.setView(mapCenter, zoom);
    }
  };



  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg shadow-md border border-gray-200 touch-pan-x touch-pan-y bg-gray-50"
      />

      {/* Mobile-Optimized Map Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-1000">

        {/* Map Layer Selector - Smaller for mobile */}
        <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
          <button
            onClick={() => changeMapLayer('street')}
            className={`p-1.5 w-full text-xs transition-colors ${mapLayer === 'street' ? 'bg-blue-600 text-white' : 'text-blue-600'
              }`}
            title="Harta e rrugëve"
          >
            🗺️
          </button>
          <button
            onClick={() => changeMapLayer('satellite')}
            className={`p-1.5 w-full text-xs transition-colors ${mapLayer === 'satellite' ? 'bg-blue-600 text-white' : 'text-blue-600'
              }`}
            title="Pamja satelitore"
          >
            🛰️
          </button>
          <button
            onClick={() => changeMapLayer('terrain')}
            className={`p-1.5 w-full text-xs transition-colors ${mapLayer === 'terrain' ? 'bg-blue-600 text-white' : 'text-blue-600'
              }`}
            title="Terreni"
          >
            🏔️
          </button>
        </div>

        {/* Reset View Button - Smaller */}
        <button
          onClick={resetMapView}
          className="bg-white p-1.5 rounded-md shadow-md border border-gray-200 transition-colors duration-200"
          title="Kthehu në pamjen fillestare"
        >
          <Home className="h-3 w-3 text-blue-600" />
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={() => {
            if (mapRef.current) {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                mapRef.current.requestFullscreen().then(() => {
                  // Force map resize after fullscreen
                  setTimeout(() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.invalidateSize();
                    }
                  }, 100);
                }).catch(err => {
                  console.log('Fullscreen not supported:', err);
                });
              }
            }
          }}
          className="bg-white hover:bg-blue-50 p-1.5 rounded-md shadow-md border border-gray-200 transition-colors duration-200"
          title="Harta në ekran të plotë"
        >
          <Maximize className="h-4 w-4 text-blue-600" aria-hidden="true" />
        </button>

        {/* My Location Button */}
        <button
          onClick={() => {
            if (navigator.geolocation && mapInstanceRef.current) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  mapInstanceRef.current.setView([latitude, longitude], 15);

                  // Add a temporary marker for user location
                  import('leaflet').then((L) => {
                    const userMarker = L.marker([latitude, longitude], {
                      icon: L.divIcon({
                        html: '<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
                        className: 'user-location-marker',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                      })
                    }).addTo(mapInstanceRef.current);

                    // Remove the marker after 5 seconds
                    setTimeout(() => {
                      mapInstanceRef.current.removeLayer(userMarker);
                    }, 5000);
                  });
                },
                (error) => {
                  console.error('Geolocation error:', error);
                  alert('Nuk mund të gjej lokacionin tuaj. Ju lutemi aktivizoni GPS-in.');
                }
              );
            } else {
              alert('Geolocation nuk është i mbështetur nga shfletuesi juaj.');
            }
          }}
          className="bg-white p-1.5 rounded-md shadow-md border border-gray-200 transition-colors duration-200"
          title="Shko te lokacioni im"
        >
          <Navigation className="h-4 w-4 text-blue-600" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile-Friendly Map Filters */}
      <div className="absolute top-3 left-3 z-1000">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Filtrat e Hartës</span>
          </div>

          <div className="space-y-2">
            {/* Price Range Filter */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Çmimi</label>
              <select
                value={mapFilters.priceRange}
                onChange={(e) => setMapFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 touch-manipulation"
              >
                <option value="all">Të gjitha</option>
                <option value="low">Deri €100,000</option>
                <option value="medium">€100,000 - €300,000</option>
                <option value="high">Mbi €300,000</option>
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Lloji</label>
              <select
                value={mapFilters.propertyType}
                onChange={(e) => setMapFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 touch-manipulation"
              >
                <option value="all">Të gjitha</option>
                <option value="house">Shtëpi</option>
                <option value="apartment">Apartament</option>
                <option value="condo">Kondo</option>
                <option value="townhouse">Shtëpi në Qytet</option>
              </select>
            </div>
          </div>

          {/* Properties Count */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-600">
              {filteredProperties.length} pasuri në hartë
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
          <CreativeLoader type="map" size="md" />
        </div>
      )}

      {/* Network Error State */}
      {networkError.networkError && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
          <NetworkError
            onRetry={handleRetry}
            message={networkError.networkError}
          />
        </div>
      )}

      {/* General Error State */}
      {errorHandler.hasError && !networkError.networkError && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
          <MapError
            onRetry={handleRetry}
            error={errorHandler.error?.message}
          />
        </div>
      )}

      {/* No Properties State */}
      {!isLoading && !errorHandler.hasError && !networkError.networkError && properties.length === 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nuk ka pasuri</h3>
            <p className="text-gray-600 text-sm">
              Nuk ka pasuri për t&#39;u shfaqur në hartë.
            </p>
          </div>
        </div>
      )}

      {/* Map controls info - only show when map is loaded */}
      {!isLoading && !errorHandler.hasError && !networkError.networkError && properties.length > 0 && (
        <>
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 hidden sm:block">
            Lëviz hartën • Zoom me scroll • Hover për info • Klik për detaje
          </div>

          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 sm:hidden">
            Lëviz • Zoom • Prek për detaje
          </div>
        </>
      )}
    </div>
  );
}