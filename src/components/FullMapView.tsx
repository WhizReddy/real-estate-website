'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { 
  MapPin, 
  AlertCircle, 
  RefreshCw, 
  Home, 
  Navigation,
  Phone,
  Mail,
  Bed,
  Bath,
  Square,
  Calendar,
  X
} from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';
import LocationSearch from '@/components/LocationSearch';
import Link from 'next/link';
import Image from 'next/image';

// MapFilters removed as filters UI has been simplified and props are no longer used

interface FullMapViewProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  selectedProperty?: Property | null;
}

export default function FullMapView({
  properties,
  onPropertySelect,
  selectedProperty,
}: FullMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  // Location search circle is drawn directly on the map; no local state needed

  const initializeMap = async () => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    try {
      setIsLoading(true);
      setHasError(false);

      // Dynamically import Leaflet with timeout
      const L = await Promise.race([
        import('leaflet'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Leaflet loading timeout')), 10000)
        )
      ]) as any;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear existing markers
      markersRef.current = [];

      // Default to Tirana, Albania
      const mapCenter = calculateCenter(properties);

      // Initialize map with full-screen performance-optimized settings
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        minZoom: 8,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true,
        boxZoom: false,
        keyboard: true,
        attributionControl: false,
        preferCanvas: true, // Use canvas for better performance
        renderer: L.canvas(), // Force canvas renderer for better performance
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        maxBoundsViscosity: 1.0,
      });

      // Move default zoom controls to bottom-left to avoid overlapping the top-left search/filters
      try {
        // Leaflet adds zoomControl when zoomControl: true; reposition it after map init
        map.zoomControl?.setPosition('bottomleft');
      } catch {}

      // Add tile layer
      addTileLayer(L, map, mapLayer);
      mapInstanceRef.current = map;

      // Wait for map to be ready before adding markers
      map.whenReady(() => {
        try {
          addPropertyMarkers(L, map, properties);
          
          // Fit bounds to show all properties
          if (properties.length > 0 && markersRef.current.length > 0) {
            const group = new L.featureGroup(markersRef.current);
            map.fitBounds(group.getBounds().pad(0.1));
          }
          // Ensure correct sizing after initial render
          setTimeout(() => {
            try { map.invalidateSize(); } catch {}
          }, 0);
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error adding markers:', error);
          setIsLoading(false);
        }
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setHasError(true);
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
  }, [retryCount]);

  // When the details panel opens/closes, reserve space on the right and reflow the map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    try {
      mapInstanceRef.current.invalidateSize();
    } catch {}
  }, [selectedProperty, showPropertyDetails]);

  // Keep filteredProperties in sync with incoming properties (filters removed for simplicity)
  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

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

        // Add new markers for filtered properties
        await addPropertyMarkers(L, mapInstanceRef.current, filteredProperties);

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
  }, [filteredProperties]);

  // Highlight selected property
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;

    try {
      const coords = selectedProperty.address.coordinates;
      mapInstanceRef.current.setView([coords.lat, coords.lng], 16, {
        animate: true,
        duration: 1
      });
      setShowPropertyDetails(true);
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

  const addTileLayer = (L: any, map: any, layer: string) => {
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

    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
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
  };

  const addPropertyMarkers = async (L: any, map: any, props: Property[]) => {
    // Performance optimization: batch marker creation and validate coordinates
    const validProperties = props.filter((property) => {
      try {
        if (!property || !property.address || !property.address.coordinates) return false;
        const coords = property.address.coordinates;
        if (
          typeof coords.lat !== 'number' ||
          typeof coords.lng !== 'number' ||
          isNaN(coords.lat) ||
          isNaN(coords.lng) ||
          coords.lat === 0 ||
          coords.lng === 0
        ) {
          console.warn('Invalid coordinates for property:', property.id);
          return false;
        }
        if (!property.title || !property.price || !property.details) return false;
        return true;
      } catch (err) {
        console.warn('Error validating property for map:', property, err);
        return false;
      }
    });

    validProperties.forEach((property) => {
      try {
        const coords = property.address.coordinates;
        // Create custom marker icon with enhanced styling
        const markerIcon = L.divIcon({
          html: `
            <div class="property-marker-full bg-linear-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-lg border-2 border-white hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer transform hover:scale-105 z-10">
              ${formatPrice(property.price)}
            </div>
          `,
          className: 'custom-marker-full',
          iconSize: [120, 40],
          iconAnchor: [60, 40],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon })
          .addTo(map);

        // Create enhanced tooltip for hover
        const tooltipContent = `
          <div class="p-3 min-w-[200px] max-w-[280px]">
            <h3 class="font-semibold text-gray-900 mb-2 text-sm">${property.title}</h3>
            <p class="text-xs text-gray-600 mb-2">${property.address.street}, ${property.address.city}</p>
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-blue-600 text-sm">${formatPrice(property.price)}</span>
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">${property.details.propertyType}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-600">
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                </svg>
                ${property.details.bedrooms} dhoma
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 2v2H6V2H4v2H2v2h2v10h2V6h2V4H6V2h2z"/>
                </svg>
                ${property.details.bathrooms} banjo
              </span>
              <span>${property.details.squareFootage ? property.details.squareFootage.toLocaleString() : ''} m²</span>
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          permanent: false,
          direction: 'top',
          offset: [0, -15],
          className: 'custom-tooltip-full'
        });

        // Add click handler for property selection
        marker.on('click', () => {
          onPropertySelect(property);
        });

        // Show tooltip on hover
        marker.on('mouseover', function() {
          this.openTooltip();
        });

        marker.on('mouseout', function() {
          this.closeTooltip();
        });

        markersRef.current.push(marker);
      } catch (err) {
        console.warn('Error creating marker for property:', property, err);
      }
    });
  }

  const changeMapLayer = (layer: 'street' | 'satellite' | 'terrain') => {
    setMapLayer(layer);
    if (mapInstanceRef.current) {
      // Remove existing tile layers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof (window as any).L?.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add new tile layer
      import('leaflet').then((L) => {
        addTileLayer(L, mapInstanceRef.current, layer);
      });
    }
  };

  const resetMapView = () => {
    if (mapInstanceRef.current && properties.length > 0) {
      const mapCenter = calculateCenter(properties);
      mapInstanceRef.current.setView(mapCenter, 12);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Handle location search
  const handleLocationSearch = (location: {
    address: string;
    coordinates: { lat: number; lng: number };
    radius: number;
  }) => {
    // Center map on searched location
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.coordinates.lat, location.coordinates.lng], 14);
      
      // Add search radius circle
      import('leaflet').then((L) => {
        // Remove existing search circle
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer.options && layer.options.className === 'search-radius-circle') {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Add new search circle
        L.circle([location.coordinates.lat, location.coordinates.lng], {
          radius: location.radius * 1000, // Convert km to meters
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          color: '#3b82f6',
          weight: 2,
          className: 'search-radius-circle'
        }).addTo(mapInstanceRef.current);
      });
    }
  };

  // Clear location search
  const handleClearLocationSearch = () => {
    // Remove search radius circle
    if (mapInstanceRef.current) {
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.className === 'search-radius-circle') {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
    }
  };

  return (
    <div className="relative h-full w-full">
    {/* Search (simplified) */}
    <div className="absolute left-4 top-4 z-1000 map-filters-overlay max-w-xs sm:max-w-sm w-full">
      <div className="bg-white/95 backdrop-blur rounded-lg shadow border border-gray-200 p-2">
        <LocationSearch
          onLocationSelect={handleLocationSearch}
          onClear={handleClearLocationSearch}
          placeholder="Kërko pranë një vendndodhjeje..."
          className="w-full"
        />
      </div>
    </div>

      <div
        ref={mapRef}
        className="h-full w-full bg-gray-50"
        style={{ marginRight: selectedProperty && showPropertyDetails ? '20rem' : 0 }}
      />

    {/* Map Controls */}
    <div
      className="absolute right-4 top-4 z-1000 map-controls-overlay"
      style={{ right: selectedProperty && showPropertyDetails ? '22rem' : '1rem' }}
    >
      <div className="flex items-center gap-2">
        {/* Compact Layer Toggle */}
        <div className="bg-white rounded-md shadow border border-gray-200 p-1 flex items-center gap-1">
          <button
            onClick={() => changeMapLayer('street')}
            className={`px-2 py-1 text-[11px] rounded-sm transition-colors ${
              mapLayer === 'street' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Rrugë"
          >
            🗺️ Rrugë
          </button>
          <button
            onClick={() => changeMapLayer('satellite')}
            className={`px-2 py-1 text-[11px] rounded-sm transition-colors ${
              mapLayer === 'satellite' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Satelit"
          >
            🛰️ Satelit
          </button>
          <button
            onClick={() => changeMapLayer('terrain')}
            className={`px-2 py-1 text-[11px] rounded-sm transition-colors ${
              mapLayer === 'terrain' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Teren"
          >
            🏔️ Teren
          </button>
        </div>

        {/* Compact Reset Button */}
        <button
          onClick={resetMapView}
          className="bg-white hover:bg-blue-50 p-2 rounded-md shadow border border-gray-200 transition-colors"
          title="Rivendos pamjen"
        >
          <Home className="h-3 w-3 text-blue-600" />
        </button>
      </div>
    </div>

      {/* Property Details Sidebar */}
    {selectedProperty && showPropertyDetails && (
  <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl border-l border-gray-200 z-1001 map-details-overlay overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detajet e Pasurisë</h3>
              <button
                onClick={() => {
                  setShowPropertyDetails(false);
                  onPropertySelect(null as any);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Property Images */}
            {selectedProperty.images.length > 0 && (
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Property Title and Price */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {selectedProperty.title}
              </h4>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {formatPrice(selectedProperty.price)}
              </p>
              <p className="text-sm text-gray-600">
                {selectedProperty.address.street}, {selectedProperty.address.city}
              </p>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bed className="h-4 w-4" />
                <span>{selectedProperty.details.bedrooms} dhoma</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bath className="h-4 w-4" />
                <span>{selectedProperty.details.bathrooms} banjo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Square className="h-4 w-4" />
                <span>{selectedProperty.details.squareFootage.toLocaleString()} m²</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{selectedProperty.details.yearBuilt}</span>
              </div>
            </div>

            {/* Property Description */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Përshkrimi</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedProperty.description}
              </p>
            </div>

            {/* Property Features */}
            {Array.isArray(selectedProperty.features) && selectedProperty.features.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Karakteristikat</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.features.filter(f => typeof f === 'string' && f.trim().length > 0).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Information */}
            <div className="border-t border-gray-200 pt-4">
              <h5 className="font-semibold text-gray-900 mb-2">Agjenti</h5>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {selectedProperty.agent.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedProperty.agent.name}</p>
                  <p className="text-sm text-gray-600">{selectedProperty.agent.email}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href={`tel:${selectedProperty.agent.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Phone className="h-4 w-4" />
                  Telefono
                </a>
                <a
                  href={`mailto:${selectedProperty.agent.email}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <Link
                href={`/properties/${selectedProperty.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
              >
                📋 Shiko Detajet e Plota
              </Link>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.address.coordinates.lat},${selectedProperty.address.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 transition-all font-medium"
              >
                <Navigation className="h-4 w-4" />
                Navigim
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
  <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-green-50 bg-opacity-95 flex items-center justify-center">
          <CreativeLoader type="map" size="lg" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem me hartën</h3>
            <p className="text-gray-600 text-sm mb-4">
              Nuk mund të ngarkohet harta. Ju lutem provoni përsëri.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Provo Përsëri
            </button>
          </div>
        </div>
      )}

      {/* No Properties State */}
      {!isLoading && !hasError && properties.length === 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
          <div className="text-center p-6">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nuk ka pasuri</h3>
            <p className="text-gray-600 text-sm">
              Nuk ka pasuri që përputhen me filtrat tuaj.
            </p>
          </div>
        </div>
      )}

      {/* Map Info */}
      {!isLoading && !hasError && filteredProperties.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-sm text-gray-600 shadow-md">
          📍 {filteredProperties.length} pasuri në hartë • Kliko në marker për detaje
        </div>
      )}
    </div>
  );
}