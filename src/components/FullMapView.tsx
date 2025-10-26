/* eslint-disable react-hooks/exhaustive-deps */

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
import type { Map as LeafletMap, Marker as LeafletMarker, Layer, TileLayer as LeafletTileLayer } from 'leaflet';

// MapFilters removed as filters UI has been simplified and props are no longer used

interface FullMapViewProps {
  properties: Property[];
  onPropertySelect: (property: Property | null) => void;
  selectedProperty?: Property | null;
}

export default function FullMapView({
  properties,
  onPropertySelect,
  selectedProperty,
}: FullMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [mobilePreview, setMobilePreview] = useState<Property | null>(null);
  const [mobilePreviewPosition, setMobilePreviewPosition] = useState<'top' | 'bottom'>('bottom');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const MAX_MARKERS = 800; // soft cap for performance on very large datasets
  // Location search circle is drawn directly on the map; no local state needed
  const tileLayerRef = useRef<LeafletTileLayer | null>(null);
  const tileProviderIndexRef = useRef<number>(0);

  // Detect mobile viewport on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileViewport(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
        if (!resolved && isVisible()) {
          resolved = true;
          ro.disconnect();
          observerRef.current = null;
          resolve();
        }
      });
      observerRef.current = ro;
      ro.observe(el);
      const id = window.setTimeout(() => {
        if (!resolved) {
          ro.disconnect();
          observerRef.current = null;
          resolved = true;
          resolve();
        }
      }, Math.max(300, Math.min(maxMs, 1500)));
      timeoutsRef.current.push(id);
    });
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  };

  const ensureContainerSafe = () => {
    if (!mapRef.current) return;
    try {
      // Force strict container bounds to prevent oversize on mobile
      mapRef.current.style.width = '100%';
      mapRef.current.style.height = '100%';
      mapRef.current.style.maxHeight = '100vh';
      mapRef.current.style.maxWidth = '100vw';
      mapRef.current.style.overflow = 'hidden';
      mapRef.current.style.position = 'absolute';
      mapRef.current.style.top = '0';
      mapRef.current.style.left = '0';
    } catch {}
  };

  const initializeMap = async () => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    try {
      setIsLoading(true);
      setHasError(false);

      // Ensure Leaflet CSS is available
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = '/leaflet.css';
        document.head.appendChild(link);
      }

      // Wait for container to be sized/visible (fixes zero-size init on mobile)
      await waitForVisibleContainer(mapRef.current, 1500);

      // Ensure container is strictly bounded to prevent mobile layout issues
      ensureContainerSafe();

      // Dynamically import Leaflet with timeout
      const Leaflet = await import('leaflet');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear existing markers
      markersRef.current = [];

      // Default to Tirana, Albania
      const mapCenter = calculateCenter(properties);

      // Initialize map with full-screen performance-optimized settings
      const map = Leaflet.map(mapRef.current, {
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
        renderer: Leaflet.canvas(), // Force canvas renderer for better performance
        // Aggressively disable animations on all screens to prevent jank
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        maxBoundsViscosity: 1.0,
      });      // Move default zoom controls to bottom-left to avoid overlapping the top-left search/filters
      try {
        // Leaflet adds zoomControl when zoomControl: true; reposition it after map init
        map.zoomControl?.setPosition('bottomleft');
      } catch {}

      // Add tile layer
    addTileLayer(Leaflet, map, mapLayer);
      mapInstanceRef.current = map;

      // Close any existing popups on mobile to prevent errors
      if (isMobileViewport) {
        try {
          map.closePopup();
        } catch (error) {
          console.warn('Failed to close popup:', error);
        }
      }

      // Wait for map to be ready before adding markers
      map.whenReady(() => {
        try {
          addPropertyMarkers(Leaflet, map, properties);
          
          // Fit bounds to show all properties
          const safeFitBounds = (attempt = 0) => {
            try {
              if (!map) return;
              const size = map.getSize?.();
              const pane = map.getPane?.('mapPane');
              if (!pane || !size || size.x === 0 || size.y === 0) {
                if (attempt < 10) {
                  const id = window.setTimeout(() => safeFitBounds(attempt + 1), 120);
                  timeoutsRef.current.push(id);
                }
                return;
              }
              if (properties.length > 0 && markersRef.current.length > 0) {
                const group = Leaflet.featureGroup(markersRef.current);
                try { if (pane) map.invalidateSize(); } catch {}
                map.fitBounds(group.getBounds().pad(0.1), { animate: false, maxZoom: 15 });
              }
            } catch (err) {
              console.warn('FullMapView bounds fit error:', err);
            }
          };
          const id = window.setTimeout(() => safeFitBounds(0), 120);
          timeoutsRef.current.push(id);
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

      // Re-cluster markers when zoom or move ends (for large datasets)
      map.on('zoomend moveend', () => {
        try {
          if (!mapInstanceRef.current) return;
          addPropertyMarkers(Leaflet, mapInstanceRef.current, filteredProperties);
        } catch {}
      });

      // Prevent popup operations on mobile
      if (isMobileViewport) {
        map.on('popupopen', () => {
          try {
            // Immediately close any popup that tries to open on mobile
            map.closePopup();
          } catch (error) {
            console.warn('Failed to close popup on mobile:', error);
          }
        });
      }

      map.on('resize', () => {
        try { map.invalidateSize(); } catch {}
      });

      // Recalculate fallback height on viewport changes
      const onWindowResize = () => {
        ensureContainerSafe();
        try { map.invalidateSize(); } catch {}
      };
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('orientationchange', onWindowResize);
      // Store cleanup by pushing a timeout-like token using negative number convention
      // We'll remove listeners explicitly in the cleanup below
      (map as unknown as { __onWindowResize?: () => void }).__onWindowResize = onWindowResize;

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
      // Clear timeouts and observers
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
      if (observerRef.current) {
        try { observerRef.current.disconnect(); } catch {}
        observerRef.current = null;
      }
      // Remove window listeners if we attached them
      try {
        const resizeHandler = (mapInstanceRef.current as unknown as { __onWindowResize?: () => void })?.__onWindowResize;
        if (resizeHandler) {
          window.removeEventListener('resize', resizeHandler);
          window.removeEventListener('orientationchange', resizeHandler);
        }
      } catch {}
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

  // Show property details appropriately per viewport
  useEffect(() => {
    if (!selectedProperty) {
      setShowPropertyDetails(false);
      setMobilePreview(null);
      return;
    }

    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth >= 640;
    if (isDesktop) {
      setMobilePreview(null);
      setShowPropertyDetails(true);
    } else {
      setShowPropertyDetails(false);
      setMobilePreview(selectedProperty);
    }
  }, [selectedProperty]);

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

        // Fit bounds safely to show all filtered properties
        if (filteredProperties.length > 0 && markersRef.current.length > 0) {
          try {
            const group = L.featureGroup(markersRef.current);
            const safeFit = () => {
              try {
                const pane = mapInstanceRef.current?.getPane?.('mapPane');
                const size = mapInstanceRef.current?.getSize?.();
                if (!pane || !size || size.x === 0 || size.y === 0) return false;
                mapInstanceRef.current?.invalidateSize();
                mapInstanceRef.current?.fitBounds(group.getBounds().pad(0.1), { animate: false, maxZoom: 15 });
                return true;
              } catch { return true; }
            };
            if (!safeFit()) {
              const id = window.setTimeout(safeFit, 120);
              timeoutsRef.current.push(id);
            }
          } catch (error) {
            console.warn('Error fitting bounds on update:', error);
          }
        }
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    };

    updateMarkers();
  }, [filteredProperties, isMobileViewport]); // Re-create markers when viewport changes

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

  type ProviderSpec = { url: string; attribution: string; options?: Parameters<typeof import('leaflet')['tileLayer']>[1] };
  const getProviders = (layer: 'street' | 'satellite' | 'terrain'): ProviderSpec[] => {
    switch (layer) {
      case 'satellite':
        return [
          {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Esri',
            options: { maxZoom: 19 }
          },
          // Fallback to OSM if imagery is unavailable
          {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: 'OpenStreetMap',
            options: { maxZoom: 19 }
          }
        ];
      case 'terrain':
        return [
          {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attribution: 'OpenTopoMap',
            options: { maxZoom: 17, maxNativeZoom: 17 }
          },
          {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: 'OpenStreetMap',
            options: { maxZoom: 19 }
          }
        ];
      default:
        return [
          {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: 'OpenStreetMap',
            options: { maxZoom: 19 }
          },
          {
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            options: { maxZoom: 20, subdomains: 'abcd' as unknown as string[] }
          }
        ];
    }
  };

  const addTileLayer = (
    L: typeof import('leaflet'),
    map: LeafletMap,
    layer: 'street' | 'satellite' | 'terrain'
  ) => {
    const providers = getProviders(layer);
    tileProviderIndexRef.current = 0;

    const attachLayer = (providerIndex: number) => {
      const spec = providers[providerIndex];
      if (!spec) return;

      // Remove existing tile layer if any
      if (tileLayerRef.current) {
        try { map.removeLayer(tileLayerRef.current); } catch {}
      }

      const tileLayer = L.tileLayer(spec.url, {
        attribution: spec.attribution,
        detectRetina: true,
        crossOrigin: true,
        updateWhenIdle: true,
        keepBuffer: 3,
        errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCI+VGlsZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+',
        ...(spec.options || {})
      });

      let recentErrors = 0;
      let switchTimeout: number | null = null;

      const tryFallback = () => {
        if (switchTimeout) return;
        // debounce multiple tile errors; if many occur in a short time, switch provider
        switchTimeout = window.setTimeout(() => {
          switchTimeout = null;
          if (recentErrors >= 4) {
            const next = tileProviderIndexRef.current + 1;
            if (next < providers.length) {
              tileProviderIndexRef.current = next;
              attachLayer(next);
              try { map.invalidateSize(); } catch {}
            }
          }
          recentErrors = 0;
        }, 1200);
      };

      tileLayer.on('tileerror', () => {
        recentErrors += 1;
        // Nudge Leaflet to redraw; some mobile browsers keep tiles blank after a transform
        try { map.invalidateSize(); } catch {}
        tryFallback();
      });

      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;
    };

    attachLayer(0);
  };

  type ClusterItem = { type: 'cluster'; lat: number; lng: number; count: number };
  type PointItem = { type: 'point'; property: Property };
  const addPropertyMarkers = async (
    L: typeof import('leaflet'),
    map: LeafletMap,
    props: Property[]
  ) => {
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

    // Clear existing markers
    markersRef.current.forEach((m) => {
      try { m.remove(); } catch {}
    });
    markersRef.current = [];

    // If the dataset is large, cluster by a simple zoom-based grid for performance
    const zoom = map.getZoom?.() ?? 12;
    const useClustering = validProperties.length > MAX_MARKERS;
    const items: Array<ClusterItem | PointItem> = useClustering
      ? clusterize(validProperties, zoom)
      : validProperties.map<PointItem>(p => ({ type: 'point', property: p }));

    items.forEach((item) => {
      try {
        if (item.type === 'cluster') {
          const { lat, lng, count } = item;
          const icon = L.divIcon({
            html: `
              <div class="rounded-full bg-white shadow-lg border-2 border-blue-600 text-blue-700 font-bold text-xs w-10 h-10 flex items-center justify-center">
                ${count}
              </div>
            `,
            className: 'cluster-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          const marker = L.marker([lat, lng], { icon }).addTo(map);
          marker.on('click', () => {
            try {
              map.setView([lat, lng], Math.min((map.getZoom?.() ?? 12) + 2, 18), { animate: true });
            } catch {}
          });
          markersRef.current.push(marker);
        } else {
          const property = item.property as Property;
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

          const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon }).addTo(map);

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

          // Bind a compact popup for mobile with a quick CTA
          const popupContent = `
            <div class="p-0 min-w-[240px] max-w-[280px] overflow-hidden rounded-xl shadow-lg border border-blue-100 bg-white">
              ${property.images && property.images[0]
                ? `<div class="relative h-32 overflow-hidden">
                     <img src="${property.images[0]}" alt="${property.title}" class="w-full h-full object-cover" />
                     <div class="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent"></div>
                     <span class="absolute bottom-2 left-2 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                       ${property.details.propertyType}
                     </span>
                   </div>`
                : ''}
              <div class="p-4 space-y-3">
                <div>
                  <h3 class="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">${property.title}</h3>
                  <p class="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    ${property.address.street}, ${property.address.city}
                  </p>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-600">
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/></svg>
                    ${property.details.bedrooms} dhoma
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M8 2v2H6V2H4v2H2v2h2v10h2V6h2V4H6V2h2z"/></svg>
                    ${property.details.bathrooms} banjo
                  </span>
                  <span>${property.details.squareFootage ? property.details.squareFootage.toLocaleString() : ''} m²</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-base font-semibold text-blue-600">${formatPrice(property.price)}</span>
                  <a href="/properties/${property.id}" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Shiko detajet
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          `;
          
          // NEVER bind popup on mobile - use custom preview instead
          // Only bind on desktop to prevent Leaflet errors
          if (!isMobileViewport) {
            try {
              marker.bindPopup(popupContent, {
                className: 'custom-popup-full',
                offset: [0, -10],
                maxWidth: 280,
                closeButton: true,
                autoPan: false, // Prevent auto-pan issues
              });
            } catch (error) {
              console.warn('Failed to bind popup:', error);
            }
          }
          
          // Remove ALL default Leaflet click handlers
          marker.off('click');
          marker.off('dblclick');

          // Add custom click handler that prevents popup on mobile
          marker.on('click', (e) => {
            // Stop event propagation
            L.DomEvent.stopPropagation(e);
            
            if (isMobileViewport) {
              // Mobile: Show custom preview card ONLY, no Leaflet popup
              try {
                // Close any open popups
                const map = mapInstanceRef.current;
                if (map) {
                  map.closePopup();
                  
                  // Determine if marker is in top or bottom half of screen
                  const latLng = marker.getLatLng();
                  const point = map.latLngToContainerPoint(latLng);
                  const mapSize = map.getSize();
                  
                  // If marker is in top half, show preview at bottom
                  // If marker is in bottom half, show preview at top
                  const isTopHalf = point.y < mapSize.y / 2;
                  setMobilePreviewPosition(isTopHalf ? 'bottom' : 'top');
                  
                  // Pan to marker with offset based on preview position
                  const offsetY = isTopHalf ? -80 : 80; // Offset away from preview
                  const newPoint = L.point([point.x, point.y + offsetY]);
                  const newLatLng = map.containerPointToLatLng(newPoint);
                  map.panTo(newLatLng, { animate: true, duration: 0.3 });
                }
                
                setMobilePreview(property);
                onPropertySelect(property);
              } catch (error) {
                console.warn('Failed to show mobile preview:', error);
                setMobilePreview(property);
                onPropertySelect(property);
              }
            } else {
              // Desktop: Show popup (already bound) and update state
              onPropertySelect(property);
            }
          });
          
          // Only enable hover tooltips on desktop (not touch devices)
          if (!isMobileViewport) {
            marker.on('mouseover', function() { 
              try {
                this.openTooltip(); 
              } catch (error) {
                console.warn('Failed to open tooltip:', error);
              }
            });
            marker.on('mouseout', function() { 
              try {
                this.closeTooltip(); 
              } catch (error) {
                console.warn('Failed to close tooltip:', error);
              }
            });
          }
          
          markersRef.current.push(marker);
        }
      } catch (err) {
        console.warn('Error creating marker for item:', item, err);
      }
    });
  }

  // Simple grid-based clustering to handle very large datasets without extra deps
  const clusterize = (props: Property[], zoom: number): Array<ClusterItem | PointItem> => {
    // Derive a cell size in degrees based on zoom; higher zoom => smaller cells
    const baseCell = 360 / Math.pow(2, zoom);
    const cellSize = baseCell * 2; // tweak factor for reasonable cluster sizes
    const buckets = new Map<string, { latSum: number; lngSum: number; count: number; sample: Property }>();

    for (const p of props) {
      const { lat, lng } = p.address.coordinates;
      const keyLat = Math.floor(lat / cellSize);
      const keyLng = Math.floor(lng / cellSize);
      const key = `${keyLat}:${keyLng}`;
      const cur = buckets.get(key);
      if (cur) {
        cur.latSum += lat;
        cur.lngSum += lng;
        cur.count += 1;
      } else {
        buckets.set(key, { latSum: lat, lngSum: lng, count: 1, sample: p });
      }
    }

  const clusters: Array<ClusterItem | PointItem> = [];
    buckets.forEach((v) => {
      if (v.count === 1) {
        clusters.push({ type: 'point', property: v.sample });
      } else {
        clusters.push({ type: 'cluster', lat: v.latSum / v.count, lng: v.lngSum / v.count, count: v.count });
      }
    });

    return clusters;
  };

  const changeMapLayer = (layer: 'street' | 'satellite' | 'terrain') => {
    setMapLayer(layer);
    if (mapInstanceRef.current) {
      // Remove existing tile layer if present
      if (tileLayerRef.current) {
        try { mapInstanceRef.current.removeLayer(tileLayerRef.current); } catch {}
        tileLayerRef.current = null;
      }

      // Add new tile layer
      import('leaflet').then((L) => {
        if (mapInstanceRef.current) {
          addTileLayer(L, mapInstanceRef.current, layer);
          // Nudge layout after provider switch to avoid glitches
          try { mapInstanceRef.current.invalidateSize(); } catch {}
          const id = window.setTimeout(() => {
            try { mapInstanceRef.current?.invalidateSize(); } catch {}
          }, 120);
          timeoutsRef.current.push(id as unknown as number);
        }
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
        mapInstanceRef.current?.eachLayer((layer: Layer) => {
          const l = layer as unknown as { options?: { className?: string } };
          if (l.options?.className === 'search-radius-circle') {
            mapInstanceRef.current?.removeLayer(layer);
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
        }).addTo(mapInstanceRef.current as LeafletMap);
      });
    }
  };

  // Clear location search
  const handleClearLocationSearch = () => {
    // Remove search radius circle
    if (mapInstanceRef.current) {
      mapInstanceRef.current.eachLayer((layer: Layer) => {
        const l = layer as unknown as { options?: { className?: string } };
        if (l.options?.className === 'search-radius-circle') {
          mapInstanceRef.current?.removeLayer(layer);
        }
      });
    }
  };

  return (
    <div className="relative h-full w-full">
    {/* Search (simplified) */}
    <div className="absolute left-4 top-4 z-50 map-filters-overlay pointer-events-none w-full max-w-[min(92vw,360px)] sm:w-auto sm:max-w-sm">
      <div className="pointer-events-auto bg-white/95 backdrop-blur rounded-lg shadow border border-gray-200 p-2">
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

      {mobilePreview && (
        <div 
          className={`sm:hidden fixed inset-x-2 z-1100 pointer-events-auto transition-all duration-300 ${
            mobilePreviewPosition === 'top' ? 'top-2' : 'bottom-2'
          }`}
        >
          <div className="relative rounded-lg shadow-lg bg-white/95 backdrop-blur-sm max-w-xs mx-auto border border-gray-200">
            <button
              onClick={() => {
                setMobilePreview(null);
                onPropertySelect(null);
              }}
              className="absolute right-1.5 top-1.5 z-20 rounded-full bg-gray-100 p-0.5 hover:bg-gray-200"
              aria-label="Mbyll"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>

            <div className="p-2 pr-6">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                  <Home className="h-2 w-2" />
                  {mobilePreview.details.propertyType}
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {formatPrice(mobilePreview.price)}
                </span>
              </div>
              
              <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1">
                {mobilePreview.title}
              </h3>
              
              <div className="flex items-center gap-2 text-[9px] text-gray-600 mb-1.5">
                <span className="flex items-center gap-0.5">
                  <Bed className="h-2.5 w-2.5" />
                  {mobilePreview.details.bedrooms}
                </span>
                <span className="flex items-center gap-0.5">
                  <Bath className="h-2.5 w-2.5" />
                  {mobilePreview.details.bathrooms}
                </span>
                <span className="flex items-center gap-0.5">
                  <Square className="h-2.5 w-2.5" />
                  {mobilePreview.details.squareFootage?.toLocaleString()} m²
                </span>
              </div>
              
              <button
                onClick={() => {
                  // Open property in full screen detail view
                  onPropertySelect(mobilePreview);
                  setShowPropertyDetails(true);
                  setMobilePreview(null);
                }}
                className="w-full inline-flex items-center justify-center gap-1 rounded bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-blue-700"
              >
                Shiko detajet
                <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls - Bottom Right on mobile, Top Right on desktop */}
    <div
      className="absolute z-50 map-controls-overlay"
      style={{
        right: selectedProperty && showPropertyDetails ? '22rem' : '1rem',
        bottom: 'auto',
        top: '1rem',
      }}
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

      {/* Property Details Modal/Popup - Compact and centered */}
    {/* Property Details Modal/Popup - Right side on desktop, full screen on mobile */}
    {selectedProperty && showPropertyDetails && (
  <>
  {/* Mobile: Full screen modal */}
  <div className="sm:hidden fixed inset-0 z-1000 flex flex-col bg-white overflow-y-auto">
      <div className="p-4 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Detajet e Pasurisë</h3>
        <button
          onClick={() => {
            setShowPropertyDetails(false);
            onPropertySelect(null);
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
      </div>

      {/* Mobile: Sticky Action Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] shrink-0">
        <div className="space-y-2">
          <Link
            href={`/properties/${selectedProperty.id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm"
          >
            📋 Shiko Detajet e Plota
          </Link>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.address.coordinates.lat},${selectedProperty.address.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 transition-all font-medium text-sm"
          >
            <Navigation className="h-4 w-4" />
            Navigim
          </a>
        </div>
      </div>
    </div>

    {/* Desktop: Right-side panel */}
  <div className="hidden sm:flex fixed right-0 top-0 bottom-0 z-1000 w-80 bg-white shadow-2xl flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Detajet e Pasurisë</h3>
        <button
          onClick={() => {
            setShowPropertyDetails(false);
            onPropertySelect(null);
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
          <h4 className="text-lg font-bold text-gray-900 mb-1">
            {selectedProperty.title}
          </h4>
          <p className="text-xl font-bold text-blue-600 mb-2">
            {formatPrice(selectedProperty.price)}
          </p>
          <p className="text-xs text-gray-600">
            {selectedProperty.address.street}, {selectedProperty.address.city}
          </p>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Bed className="h-3 w-3" />
            <span>{selectedProperty.details.bedrooms} dhoma</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Bath className="h-3 w-3" />
            <span>{selectedProperty.details.bathrooms} banjo</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Square className="h-3 w-3" />
            <span>{(selectedProperty.details.squareFootage).toLocaleString()} m²</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{selectedProperty.details.yearBuilt}</span>
          </div>
        </div>

        {/* Property Description */}
        <div>
          <h5 className="font-semibold text-gray-900 mb-2 text-sm">Përshkrimi</h5>
          <p className="text-xs text-gray-600 leading-relaxed">
            {selectedProperty.description}
          </p>
        </div>

        {/* Property Features */}
        {Array.isArray(selectedProperty.features) && selectedProperty.features.length > 0 && (
          <div>
            <h5 className="font-semibold text-gray-900 mb-2 text-sm">Karakteristikat</h5>
            <div className="flex flex-wrap gap-1">
              {selectedProperty.features.filter(f => typeof f === 'string' && f.trim().length > 0).map((feature, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Agent Information */}
        <div className="border-t border-gray-200 pt-3">
          <h5 className="font-semibold text-gray-900 mb-2 text-sm">Agjenti</h5>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-semibold text-xs">
                {selectedProperty.agent.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-xs">{selectedProperty.agent.name}</p>
              <p className="text-xs text-gray-600 truncate">{selectedProperty.agent.email}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <a
              href={`tel:${selectedProperty.agent.phone}`}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              <Phone className="h-3 w-3" />
              Telefono
            </a>
            <a
              href={`mailto:${selectedProperty.agent.email}`}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-3 w-3" />
              Email
            </a>
          </div>
        </div>
      </div>

      {/* Desktop: Sticky Action Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 shrink-0">
        <div className="space-y-2">
          <Link
            href={`/properties/${selectedProperty.id}`}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded text-sm hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
          >
            📋 Shiko Detajet
          </Link>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.address.coordinates.lat},${selectedProperty.address.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-linear-to-r from-green-600 to-green-700 text-white rounded text-sm hover:from-green-700 hover:to-green-800 transition-all font-medium"
          >
            <Navigation className="h-3 w-3" />
            Navigim
          </a>
        </div>
      </div>
    </div>

    {/* Backdrop - click to close */}
    <div
  className="hidden sm:block fixed inset-0 z-950 bg-black/30"
      onClick={() => {
        setShowPropertyDetails(false);
        onPropertySelect(null);
      }}
    />
  </>
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