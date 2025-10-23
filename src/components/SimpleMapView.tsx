
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Layer, Map as LeafletMap, TileLayer as LeafletTileLayer } from 'leaflet';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import MapFallback from './MapFallback';

interface SimpleMapViewProps {
  properties: Property[];
  height?: string;
}

export default function SimpleMapView({ properties, height = '400px' }: SimpleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const containerIdRef = useRef<string>(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const timeoutsRef = useRef<number[]>([]);
  const observerRef = useRef<ResizeObserver | null>(null);
  const tileLayerRef = useRef<LeafletTileLayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed isMapReady as it's unused
  const [retryCount, setRetryCount] = useState(0);

  // Cleanup function to properly destroy map instance
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        // Remove all layers and markers
        if (typeof mapInstanceRef.current.eachLayer === 'function') {
          mapInstanceRef.current.eachLayer((layer: Layer) => {
            mapInstanceRef.current.removeLayer(layer as Layer);
          });
        }
        
        // Remove the map instance
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        
        // Clear the container HTML
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
        
        // no-op
      } catch (error) {
        console.warn('Error during map cleanup:', error);
        // Force clear the container even if cleanup fails
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
        mapInstanceRef.current = null;
        // no-op
      }
    }
  }, []);

  useEffect(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      console.warn('SimpleMapView: No properties to display on map.', properties);
    }
    // Helper: wait until container has a real, visible size
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
            ro.disconnect();
            observerRef.current = null;
            resolve();
          }
        });
        observerRef.current = ro;
        ro.observe(el);

        // Fallback timeout
        const id = window.setTimeout(() => {
          if (!resolved) {
            ro.disconnect();
            observerRef.current = null;
            resolved = true;
            resolve();
          }
        }, Math.max(250, Math.min(maxMs, 1500)));
        timeoutsRef.current.push(id);
      });

      // Two RAFs to ensure layout/paint settled (modal animations etc.)
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    };

    let canceled = false;
    const initMap = async () => {
      // Ensure we have a valid container
      if (!mapRef.current) return;

      // Cleanup any existing map first
      cleanupMap();

      try {
        setIsLoading(true);
        setError(null);

        // Dynamically load Leaflet CSS if not already loaded
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = '/leaflet.css';
          document.head.appendChild(link);
        }

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
  // @ts-expect-error Accessing private Leaflet property to override default icons
  delete (L.Icon.Default.prototype as unknown)._getIconUrl;
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

        // Wait until container is visible and has size (prevents _leaflet_pos issues)
        await waitForVisibleContainer(mapRef.current, 1200);

        // Mobile fallback: ensure the element has at least the requested height
        try {
          const isSmallScreen = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
          const cap = isSmallScreen ? 320 : 480; // avoid tall containers on mobile to reduce scroll
          const numericHeight = typeof height === 'string' && height.endsWith('px')
            ? parseInt(height)
            : 0;
          if (numericHeight > 0 && mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            const top = Math.max(0, rect.top);
            const available = Math.floor(window.innerHeight - top);
            if (available > 0 && rect.height < Math.max(numericHeight, available) - 8) {
              mapRef.current.style.minHeight = Math.max(numericHeight, Math.min(available, cap)) + 'px';
            }
          }
        } catch {}

        // Verify container still exists and is clean
        if (!mapRef.current || mapInstanceRef.current) {
          return;
        }

        // Determine if we should disable animations on small/mobile screens to reduce flicker/white tiles
        const isSmallScreen = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;

        // Create map with unique container
        const map = L.map(mapRef.current, {
          center: [41.3275, 19.8187],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false,
          // Disable animations on smaller screens where they can cause tile gaps/flicker
          fadeAnimation: !isSmallScreen,
          zoomAnimation: !isSmallScreen,
          markerZoomAnimation: !isSmallScreen,
          preferCanvas: true,
        });
        try { map.zoomControl?.setPosition('bottomleft'); } catch {}
        
        // Add tile layer with error handling and fallback providers
        type ProviderSpec = { url: string; attribution: string; options?: Parameters<typeof L.tileLayer>[1] };
        const providers: ProviderSpec[] = [
          { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap contributors', options: { maxZoom: 19 } },
          { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: '&copy; OpenStreetMap & CARTO', options: { maxZoom: 20, subdomains: 'abcd' as unknown as string[] } },
        ];

        const attachTiles = (index: number) => {
          const spec = providers[index];
          if (!spec) return;
          if (tileLayerRef.current) {
            try { map.removeLayer(tileLayerRef.current); } catch {}
            tileLayerRef.current = null;
          }
          const tl = L.tileLayer(spec.url, {
            attribution: spec.attribution,
            detectRetina: true,
            crossOrigin: true,
            updateWhenIdle: true,
            keepBuffer: 2,
            errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3MzgwIiBmb250LXNpemU9IjE0Ij5NYXAgVGlsZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==',
            ...(spec.options || {})
          }).addTo(map);
          tileLayerRef.current = tl;
          let errCount = 0;
          tl.on('tileerror', () => {
            errCount += 1;
            try { map.invalidateSize(); } catch {}
            if (errCount >= 3 && index + 1 < providers.length) {
              attachTiles(index + 1);
            }
          });
        };
        attachTiles(0);

        // Add markers with error handling
        const validProperties = properties.filter(property => {
          const coords = property.address.coordinates;
          return coords.lat && coords.lng && !isNaN(coords.lat) && !isNaN(coords.lng);
        });

  const markers: Array<ReturnType<typeof L.marker>> = [];

        validProperties.forEach(property => {
          try {
            const coords = property.address.coordinates;
            // Use the custom icon for the marker
            const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
            
            // Improved popup with better styling
            marker.bindPopup(`
              <div style="min-width: 240px; max-width: 280px; padding: 12px;">
                <div style="margin-bottom: 8px;">
                  <h3 style="font-weight: 700; font-size: 15px; line-height: 1.3; margin: 0 0 8px 0; color: #1f2937;">${property.title}</h3>
                  <p style="font-weight: 600; font-size: 16px; color: #2563eb; margin: 0 0 8px 0;">${formatPrice(property.price)}</p>
                </div>
                <div style="display: flex; gap: 8px; font-size: 12px; color: #6b7280; margin-bottom: 10px; flex-wrap: wrap;">
                  <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">🛏️ ${property.details.bedrooms} dhoma</span>
                  <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">🚿 ${property.details.bathrooms} banjo</span>
                  <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">📐 ${property.details.squareFootage}m²</span>
                </div>
                <div style="margin-top: 12px;">
                  <a 
                    href="/properties/${property.id}" 
                    style="
                      display: inline-block;
                      background: #2563eb;
                      color: white;
                      padding: 8px 16px;
                      border-radius: 6px;
                      text-decoration: none;
                      font-size: 13px;
                      font-weight: 500;
                      transition: background 0.2s;
                      width: 100%;
                      text-align: center;
                    "
                    onmouseover="this.style.background='#1d4ed8'"
                    onmouseout="this.style.background='#2563eb'"
                  >
                    Shiko Detajet →
                  </a>
                </div>
              </div>
            `, {
              maxWidth: 300,
              className: 'custom-popup'
            });

            markers.push(marker);
          } catch (markerError) {
            console.warn('Error adding marker for property:', property.id, markerError);
          }
        });

        // Safely fit bounds only when the map container has a real size
        const safeFitBounds = (attempt = 0) => {
          try {
            if (canceled || !map) return;
            const size = map.getSize?.();
            const pane = map.getPane?.('mapPane');
            // Ensure internal pane exists and map is loaded before attempting view changes
            const internalPaneOk = !!(map as unknown as { _mapPane?: HTMLElement })._mapPane;
            const loaded = !!(map as unknown as { _loaded?: boolean })._loaded;
            if (!pane || !internalPaneOk || !loaded || !size || size.x === 0 || size.y === 0) {
              if (attempt < 10) {
                const id = window.setTimeout(() => safeFitBounds(attempt + 1), 120);
                timeoutsRef.current.push(id);
              }
              return;
            }
            if (markers.length > 0) {
              const group = L.featureGroup(markers);
              try {
                const hasPane = !!map.getPane?.('mapPane');
                if (hasPane) map.invalidateSize();
              } catch {}
              // Defer to next frame to avoid layout thrash on initial paint
              requestAnimationFrame(() => {
                if (canceled) return;
                try {
                  const stillOk = !!(map as unknown as { _mapPane?: HTMLElement })._mapPane && !!(map as unknown as { _loaded?: boolean })._loaded;
                  if (stillOk) {
                    map.fitBounds(group.getBounds().pad(0.1), { animate: false, maxZoom: 15 });
                  }
                } catch (err) {
                  console.warn('fitBounds deferred error:', err);
                }
              });
            }
          } catch (boundsError) {
            console.warn('Error fitting bounds:', boundsError);
          }
        };

        if (markers.length > 0) {
          // Use both 'load' and 'whenReady' to be extra sure on mobile
          const scheduleFit = () => {
            const id = window.setTimeout(() => safeFitBounds(0), 120);
            timeoutsRef.current.push(id);
          };
          try { map.once('load', scheduleFit); } catch {}
          try { map.whenReady(scheduleFit); } catch {}
        }

  mapInstanceRef.current = map;
  // no-op
        setIsLoading(false);
        setError(null);
        // Force map to recalculate size after mount and after properties change
        {
          const id = window.setTimeout(() => {
            try {
              if (map && map.getPane?.('mapPane')) map.invalidateSize();
            } catch {}
          }, 200);
          timeoutsRef.current.push(id);
        }

        // Keep map responsive to container size changes
        map.on('resize', () => {
          try {
            if (map.getPane?.('mapPane')) map.invalidateSize();
          } catch {}
        });

        const onWinResize = () => {
          try { map.invalidateSize(); } catch {}
        };
        window.addEventListener('resize', onWinResize);
        window.addEventListener('orientationchange', onWinResize);
        // Store handler on map instance for cleanup
        (map as unknown as { __onWinResize?: () => void }).__onWinResize = onWinResize;

      } catch (error) {
        console.error('Map initialization error:', error);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    // Debounce map initialization to prevent rapid re-initialization
    const timeoutId = window.setTimeout(initMap, 50);
    timeoutsRef.current.push(timeoutId);

    return () => {
      canceled = true;
      // Clear scheduled timeouts
      timeoutsRef.current.forEach(id => window.clearTimeout(id));
      timeoutsRef.current = [];
      if (observerRef.current) {
        try { observerRef.current.disconnect(); } catch {}
        observerRef.current = null;
      }
      clearTimeout(timeoutId);
      cleanupMap();
      try {
        const handler = (mapInstanceRef.current as unknown as { __onWinResize?: () => void })?.__onWinResize;
        if (handler) {
          window.removeEventListener('resize', handler);
          window.removeEventListener('orientationchange', handler);
        }
      } catch {}
    };
  }, [properties, height, cleanupMap, retryCount]);

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

  if (!Array.isArray(properties) || properties.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
        <span className="text-gray-500 text-sm">Nuk ka pasuri për të shfaqur në hartë.</span>
      </div>
    );
  }
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
        className="w-full rounded-lg border border-gray-200 overflow-hidden"
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