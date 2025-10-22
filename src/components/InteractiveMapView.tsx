'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types';
import { ExternalLink, Home, Navigation } from 'lucide-react';

interface InteractiveMapViewProps {
  mode: 'view' | 'edit';
  properties?: Property[];
  selectedLocation?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function InteractiveMapView({
  mode = 'view',
  properties = [],
  selectedLocation,
  onLocationSelect,
  height = '400px',
  center = [41.3275, 19.8187], // Tirana coordinates
  zoom = 13,
}: InteractiveMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const selectedMarkerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Create map
      const map = L.map(mapRef.current);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Set initial view and ensure size/position are initialized
      map.setView(center, zoom, { animate: false });

      // Add click handler for edit mode
      if (mode === 'edit') {
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          
          // Remove existing selected marker
          if (selectedMarkerRef.current) {
            map.removeLayer(selectedMarkerRef.current);
          }

          // Create custom marker icon (blue theme)
          const customIcon = L.divIcon({
            className: 'selected-location-marker',
            html: `
              <div style="
                background: #2563eb;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                position: relative;
                transform: translate(-50%, -50%);
              ">
                <div style="
                  position: absolute;
                  top: -10px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 8px solid transparent;
                  border-right: 8px solid transparent;
                  border-bottom: 10px solid #2563eb;
                "></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          // Add new marker at clicked location
          selectedMarkerRef.current = L.marker([lat, lng], {
            icon: customIcon,
            draggable: false
          }).addTo(map);

          // Call the callback with coordinates
          if (onLocationSelect) {
            onLocationSelect(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
          }
        });

        // Set cursor style for edit mode
        map.getContainer().style.cursor = 'crosshair';
      }

      mapInstanceRef.current = map;

      // Once ready, invalidate size to ensure proper pane positioning
      map.whenReady(() => {
        setTimeout(() => {
          map.invalidateSize();
          setIsMapReady(true);
        }, 0);
      });
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [mode]);

  // Update selected location marker when selectedLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation || mode !== 'edit') return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Remove existing selected marker
      if (selectedMarkerRef.current) {
        map.removeLayer(selectedMarkerRef.current);
      }

      // Add new marker at selected location
      selectedMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: L.divIcon({
          className: 'selected-location-marker',
          html: `
            <div style="
              background: #2563eb;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 8px solid #2563eb;
              "></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(map);

      // Center map on selected location (disable animation to avoid _leaflet_pos issues)
      map.setView([selectedLocation.lat, selectedLocation.lng], zoom, { animate: false });
    });
  }, [selectedLocation, zoom, mode]);

  // Update property markers when in view mode and the list changes
  useEffect(() => {
    if (!mapInstanceRef.current || mode !== 'view') return;
    import('leaflet').then((L) => {
      addPropertyMarkers(L, mapInstanceRef.current, properties);
    });
  }, [properties, mode]);

  // Add property markers function
  const addPropertyMarkers = (L: any, map: any, properties: Property[]) => {
    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    properties.forEach((property) => {
      if (property.address.coordinates.lat && property.address.coordinates.lng) {
        const marker = L.marker([
          property.address.coordinates.lat,
          property.address.coordinates.lng
        ]).addTo(map);

        marker.bindPopup(`
          <div class="p-2 min-w-[200px]">
            <h3 class="font-semibold text-sm mb-1">${property.title}</h3>
            <p class="text-xs text-gray-600 mb-2">${property.address.street}, ${property.address.city}</p>
            <p class="text-sm font-bold text-blue-600">€${property.price.toLocaleString()}</p>
            <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>${property.details.bedrooms} dhoma</span>
              <span>•</span>
              <span>${property.details.bathrooms} banjo</span>
              <span>•</span>
              <span>${property.details.squareFootage}m²</span>
            </div>
          </div>
        `);

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all properties if available
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden border border-gray-300"
      />
      
      {/* Map Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-[1000]">
        {/* Home Navigation Button */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              // Ensure map layout is up to date, then recenter without animation
              try { mapInstanceRef.current.invalidateSize(); } catch {}
              mapInstanceRef.current.setView(center, zoom, { animate: false });
            }
          }}
          className="bg-white hover:bg-blue-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors duration-200"
          title="Kthehu në Tiranë"
        >
          <Home className="h-4 w-4 text-blue-600" />
        </button>

        {/* Google Maps Link */}
        {selectedLocation && (
          <a
            href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-blue-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors duration-200"
            title="Hap në Google Maps"
          >
            <ExternalLink className="h-4 w-4 text-blue-600" />
          </a>
        )}
      </div>

      {mode === 'edit' && (
        <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-md shadow-md text-sm text-gray-700 z-[1000]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Kliko në hartë për të zgjedhur lokacionin</span>
          </div>
        </div>
      )}

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Duke ngarkuar hartën...</p>
          </div>
        </div>
      )}
    </div>
  );
}