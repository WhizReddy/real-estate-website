'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { MapPin, AlertCircle, RefreshCw, Home, Navigation, Layers, Maximize2, Minimize2, Filter, Search } from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';

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
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [showClusters, setShowClusters] = useState(true);
  const [mapFilters, setMapFilters] = useState({
    priceRange: 'all',
    propertyType: 'all'
  });

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

      // Default to Tirana, Albania if no center provided
      const mapCenter = center || calculateCenter(properties);

      // Initialize map with minimal, stable settings
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
      });

      // Use a single, reliable tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18,
        timeout: 10000,
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

  // Update markers when properties or filters change
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
            const group = new L.featureGroup(markersRef.current);
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
  }, [properties, onPropertySelect, mapFilters]);

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
    props.forEach((property) => {
      const coords = property.address.coordinates;
      
      // Create custom marker icon with blue styling
      const markerIcon = L.divIcon({
        html: `
          <div class="property-marker bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-lg border-2 border-white hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer transform hover:scale-105">
            ${formatPrice(property.price)}
          </div>
        `,
        className: 'custom-marker',
        iconSize: [110, 36],
        iconAnchor: [55, 36],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon })
        .addTo(map);

      // Create tooltip content for hover (simpler than popup)
      const tooltipContent = `
        <div class="p-2 min-w-[180px]">
          <h3 class="font-semibold text-gray-900 mb-1 text-sm">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-1">${property.address.street}</p>
          <div class="flex justify-between items-center">
            <span class="font-bold text-blue-600 text-sm">${formatPrice(property.price)}</span>
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${property.details.propertyType}</span>
          </div>
        </div>
      `;

      // Use tooltip instead of popup for hover
      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'custom-tooltip'
      });

      // Create detailed popup for click with navigation
      const popupContent = `
        <div class="p-4 min-w-[260px]">
          <h3 class="font-semibold text-gray-900 mb-2 text-sm">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${property.address.street}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-blue-600 text-sm">${formatPrice(property.price)}</span>
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">${property.details.propertyType}</span>
          </div>
          <div class="text-xs text-gray-600 mb-3">
            ${property.details.bedrooms > 0 ? `${property.details.bedrooms} dhoma • ` : ''}${property.details.bathrooms} banjo • ${property.details.squareFootage.toLocaleString()} m²
          </div>
          <div class="flex gap-2">
            <a href="/properties/${property.id}" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded text-xs hover:from-blue-700 hover:to-blue-800 transition-all text-center font-medium">
              📋 Detajet
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}" target="_blank" class="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded text-xs hover:from-green-700 hover:to-green-800 transition-all text-center font-medium">
              🧭 Navigim
            </a>
          </div>
          <button onclick="window.location.href='/'" class="w-full mt-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-2 rounded text-xs hover:from-gray-700 hover:to-gray-800 transition-all font-medium">
            🏠 Kryesore
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup',
        closeButton: true,
        autoClose: true,
        closeOnClick: true
      });

      // Show tooltip on hover, popup on click
      marker.on('mouseover', function() {
        this.openTooltip();
      });

      marker.on('mouseout', function() {
        this.closeTooltip();
      });

      marker.on('click', function() {
        this.openPopup();
      });

      // Add click handler for property selection
      if (onSelect) {
        marker.on('click', () => onSelect(property));
      }

      markersRef.current.push(marker);
    });
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
          timeout: 10000,
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

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div
        ref={mapRef}
        style={{ height: isFullscreen ? '100vh' : height }}
        className="w-full rounded-lg shadow-md border border-gray-200 touch-pan-x touch-pan-y bg-gray-50"
      />

      {/* Enhanced Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="bg-white hover:bg-blue-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors duration-200"
          title={isFullscreen ? "Dil nga ekrani i plotë" : "Ekran i plotë"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 text-blue-600" />
          ) : (
            <Maximize2 className="h-4 w-4 text-blue-600" />
          )}
        </button>

        {/* Map Layer Selector */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <button
            onClick={() => changeMapLayer('street')}
            className={`p-2 w-full text-xs transition-colors ${
              mapLayer === 'street' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-blue-600'
            }`}
            title="Harta e rrugëve"
          >
            🗺️
          </button>
          <button
            onClick={() => changeMapLayer('satellite')}
            className={`p-2 w-full text-xs transition-colors ${
              mapLayer === 'satellite' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-blue-600'
            }`}
            title="Pamja satelitore"
          >
            🛰️
          </button>
          <button
            onClick={() => changeMapLayer('terrain')}
            className={`p-2 w-full text-xs transition-colors ${
              mapLayer === 'terrain' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-blue-600'
            }`}
            title="Terreni"
          >
            🏔️
          </button>
        </div>

        {/* Reset View Button */}
        <button
          onClick={resetMapView}
          className="bg-white hover:bg-blue-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors duration-200"
          title="Kthehu në pamjen fillestare"
        >
          <Home className="h-4 w-4 text-blue-600" />
        </button>
      </div>

      {/* Mobile-Friendly Map Filters */}
      <div className="absolute top-3 left-3 z-[1000]">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 max-w-xs">
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
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 bg-opacity-95 flex items-center justify-center rounded-lg">
          <CreativeLoader type="map" size="md" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem me hartën</h3>
            <p className="text-gray-600 text-sm mb-4">
              Nuk mund të ngarkohet harta. Ju lutem provoni përsëri.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Provo Përsëri
            </button>
          </div>
        </div>
      )}

      {/* No Properties State */}
      {!isLoading && !hasError && properties.length === 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nuk ka pasuri</h3>
            <p className="text-gray-600 text-sm">
              Nuk ka pasuri për t'u shfaqur në hartë.
            </p>
          </div>
        </div>
      )}
      
      {/* Map controls info - only show when map is loaded */}
      {!isLoading && !hasError && properties.length > 0 && (
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