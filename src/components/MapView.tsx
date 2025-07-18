'use client';

import { useEffect, useRef } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Default to Tirana, Albania if no center provided
      const mapCenter = center || calculateCenter(properties);

      // Define tight bounds around Tirana to prevent getting lost
      const tiranaBounds = L.latLngBounds(
        L.latLng(41.2, 19.6), // Southwest corner (tighter around Tirana)
        L.latLng(41.5, 20.0)  // Northeast corner (tighter around Tirana)
      );

      // Initialize map with very restricted bounds and mobile-friendly controls
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: zoom,
        minZoom: 10,
        maxZoom: 18,
        maxBounds: tiranaBounds,
        maxBoundsViscosity: 0.8, // Strong bounce back when hitting bounds
        zoomControl: true,
        scrollWheelZoom: 'center', // Always zoom to center
        doubleClickZoom: true,
        dragging: true,
        touchZoom: 'center', // Mobile-friendly zoom
        boxZoom: false,
        keyboard: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 100, // Slower zoom for better control
      });

      // Add multiple tile layer options for better coverage
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      });

      const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 18,
      });

      // Add default layer
      cartoLayer.addTo(map);

      // Add layer control
      const baseLayers = {
        'Harta Standarde': osmLayer,
        'Harta Moderne': cartoLayer,
      };
      L.control.layers(baseLayers).addTo(map);

      // Add scale control
      L.control.scale({
        metric: true,
        imperial: false,
        position: 'bottomleft'
      }).addTo(map);

      // Add reset view button
      const resetControl = L.control({position: 'topleft'});
      resetControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-control-reset');
        div.innerHTML = '<button class="bg-white border border-gray-300 rounded p-2 shadow hover:bg-gray-50" title="Kthehu në pamjen fillestare">🏠</button>';
        div.onclick = function() {
          if (properties.length > 0) {
            const group = new L.featureGroup(markersRef.current);
            map.fitBounds(group.getBounds().pad(0.1));
          } else {
            map.setView([41.3275, 19.8187], 13);
          }
        };
        return div;
      };
      resetControl.addTo(map);

      mapInstanceRef.current = map;

      // Add property markers
      addPropertyMarkers(L, map, properties, onPropertySelect);

      // Fit bounds to show all properties if available
      if (properties.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      addPropertyMarkers(L, mapInstanceRef.current, properties, onPropertySelect);

      // Fit bounds to show all properties
      if (properties.length > 0 && markersRef.current.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    });
  }, [properties, onPropertySelect]);

  // Highlight selected property
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;

    const coords = selectedProperty.address.coordinates;
    mapInstanceRef.current.setView([coords.lat, coords.lng], 16, {
      animate: true,
      duration: 1
    });
  }, [selectedProperty]);

  const calculateCenter = (props: Property[]): [number, number] => {
    // Default to Tirana, Albania
    if (props.length === 0) return [41.3275, 19.8187];

    const avgLat = props.reduce((sum, p) => sum + p.address.coordinates.lat, 0) / props.length;
    const avgLng = props.reduce((sum, p) => sum + p.address.coordinates.lng, 0) / props.length;

    return [avgLat, avgLng];
  };

  const addPropertyMarkers = (L: any, map: any, props: Property[], onSelect?: (property: Property) => void) => {
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

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg shadow-md border border-gray-200 touch-pan-x touch-pan-y"
      />
      
      {/* Map controls info - responsive text */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 hidden sm:block">
        Lëviz hartën • Zoom me scroll • Hover për info • Klik për detaje
      </div>
      
      {/* Mobile-friendly controls info */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 sm:hidden">
        Lëviz • Zoom • Prek për detaje
      </div>
    </div>
  );
}