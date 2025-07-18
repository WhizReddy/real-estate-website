'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
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

  // Update markers when properties change
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

        // Add new markers
        await addPropertyMarkers(L, mapInstanceRef.current, properties, onPropertySelect);

        // Fit bounds to show all properties
        if (properties.length > 0 && markersRef.current.length > 0) {
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
  }, [properties, onPropertySelect]);

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
      
      // Create custom marker icon with Albanian styling
      const markerIcon = L.divIcon({
        html: `
          <div class="property-marker bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg border-2 border-white hover:bg-red-700 transition-colors cursor-pointer">
            ${formatPrice(property.price)}
          </div>
        `,
        className: 'custom-marker',
        iconSize: [100, 32],
        iconAnchor: [50, 32],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon })
        .addTo(map);

      // Create tooltip content for hover (simpler than popup)
      const tooltipContent = `
        <div class="p-2 min-w-[180px]">
          <h3 class="font-semibold text-gray-900 mb-1 text-sm">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-1">${property.address.street}</p>
          <div class="flex justify-between items-center">
            <span class="font-bold text-red-600 text-sm">${formatPrice(property.price)}</span>
            <span class="text-xs bg-gray-100 px-2 py-1 rounded">${property.details.propertyType}</span>
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

      // Create detailed popup for click
      const popupContent = `
        <div class="p-3 min-w-[220px]">
          <h3 class="font-semibold text-gray-900 mb-2 text-sm">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${property.address.street}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-red-600 text-sm">${formatPrice(property.price)}</span>
            <span class="text-xs bg-gray-100 px-2 py-1 rounded capitalize">${property.details.propertyType}</span>
          </div>
          <div class="text-xs text-gray-600 mb-3">
            ${property.details.bedrooms > 0 ? `${property.details.bedrooms} dhoma • ` : ''}${property.details.bathrooms} banjo • ${property.details.squareFootage.toLocaleString()} m²
          </div>
          <a href="/properties/${property.id}" class="inline-block bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors">
            Shiko Detajet
          </a>
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

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg shadow-md border border-gray-200 touch-pan-x touch-pan-y bg-gray-50"
      />
      
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
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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