'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import MapFallback from './MapFallback';

interface SimpleMapViewProps {
  properties: Property[];
  height?: string;
}

export default function SimpleMapView({ properties, height = '400px' }: SimpleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const containerIdRef = useRef<string>(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Cleanup function to properly destroy map instance
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        // Remove all layers and markers
        mapInstanceRef.current.eachLayer((layer: any) => {
          mapInstanceRef.current.removeLayer(layer);
        });
        
        // Remove the map instance
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        
        // Clear the container HTML
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
        
        setIsMapReady(false);
      } catch (error) {
        console.warn('Error during map cleanup:', error);
        // Force clear the container even if cleanup fails
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    }
  }, []);

  useEffect(() => {
    const initMap = async () => {
      // Ensure we have a valid container
      if (!mapRef.current) return;

      // Cleanup any existing map first
      cleanupMap();

      try {
        setIsLoading(true);
        setError(null);

        const L = await import('leaflet');
        
        // Create custom marker icon to fix display issues
        const customIcon = L.divIcon({
          html: `
            <div style="
              background-color: #2563eb;
              width: 24px;
              height: 24px;
              border-radius: 50% 50% 50% 0;
              border: 3px solid #ffffff;
              transform: rotate(-45deg);
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background-color: #ffffff;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24]
        });

        // Also fix default Leaflet icons as fallback
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Ensure container is completely clean
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
          // Set unique ID to prevent container reuse
          mapRef.current.id = containerIdRef.current;
        }

        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify container still exists and is clean
        if (!mapRef.current || mapInstanceRef.current) {
          return;
        }

        // Create map with unique container
        const map = L.map(mapRef.current, {
          center: [41.3275, 19.8187],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: true
        });
        
        // Add tile layer with error handling
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3MzgwIiBmb250LXNpemU9IjE0Ij5NYXAgVGlsZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
        });
        
        tileLayer.addTo(map);

        // Add markers with error handling
        const validProperties = properties.filter(property => {
          const coords = property.address.coordinates;
          return coords.lat && coords.lng && !isNaN(coords.lat) && !isNaN(coords.lng);
        });

        validProperties.forEach(property => {
          try {
            const coords = property.address.coordinates;
            // Use the custom icon for the marker
            const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
            
            marker.bindPopup(`
              <div class="p-3 min-w-[200px]">
                <h3 class="font-bold text-sm mb-2">${property.title}</h3>
                <p class="text-blue-600 font-semibold mb-2">${formatPrice(property.price)}</p>
                <div class="text-xs text-gray-600 mb-2">
                  ${property.details.bedrooms} dhoma • ${property.details.bathrooms} banjo • ${property.details.squareFootage}m²
                </div>
                <a href="/properties/${property.id}" class="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                  Shiko Detajet
                </a>
              </div>
            `);
          } catch (markerError) {
            console.warn('Error adding marker for property:', property.id, markerError);
          }
        });

        // Fit bounds if we have properties
        if (validProperties.length > 0) {
          try {
            const group = new L.featureGroup(map.getLayers().filter((layer: any) => layer instanceof L.Marker));
            if (group.getLayers().length > 0) {
              map.fitBounds(group.getBounds().pad(0.1));
            }
          } catch (boundsError) {
            console.warn('Error fitting bounds:', boundsError);
          }
        }

        mapInstanceRef.current = map;
        setIsMapReady(true);
        setIsLoading(false);
        setError(null);

      } catch (error) {
        console.error('Map initialization error:', error);
        setError('Failed to load map');
        setIsLoading(false);
        setIsMapReady(false);
      }
    };

    // Debounce map initialization to prevent rapid re-initialization
    const timeoutId = setTimeout(initMap, 50);

    return () => {
      clearTimeout(timeoutId);
      cleanupMap();
    };
  }, [properties, cleanupMap, retryCount]);

  // Retry function for map initialization
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setIsLoading(true);
      // Generate new container ID to ensure fresh start
      containerIdRef.current = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    } else {
      // After 3 retries, reload the page
      window.location.reload();
    }
  }, [retryCount]);

  if (error) {
    return (
      <MapFallback 
        properties={properties} 
        height={height} 
        onRetry={retryCount < 3 ? handleRetry : undefined}
      />
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg border border-gray-200"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-gray-600 text-sm">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  );
}