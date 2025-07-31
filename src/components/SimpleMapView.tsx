'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';

interface SimpleMapViewProps {
  properties: Property[];
  height?: string;
}

export default function SimpleMapView({ properties, height = '400px' }: SimpleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const L = await import('leaflet');
        
        // Clean up existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Create simple map
        const map = L.map(mapRef.current).setView([41.3275, 19.8187], 13);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add simple markers
        properties.forEach(property => {
          const coords = property.address.coordinates;
          if (coords.lat && coords.lng) {
            const marker = L.marker([coords.lat, coords.lng]).addTo(map);
            marker.bindPopup(`
              <div class="p-2">
                <h3 class="font-bold text-sm">${property.title}</h3>
                <p class="text-blue-600 font-semibold">${formatPrice(property.price)}</p>
                <a href="/properties/${property.id}" class="text-blue-500 text-xs">View Details</a>
              </div>
            `);
          }
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (error) {
        console.error('Map error:', error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [properties]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg border border-gray-200"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
    </div>
  );
}