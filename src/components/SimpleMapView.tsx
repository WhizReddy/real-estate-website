"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Layer, Map as LeafletMap, TileLayer as LeafletTileLayer } from 'leaflet';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import MapFallback from './MapFallback';
import { getTranslation } from '@/lib/i18n';

// Props for the simple map view.  Consumers provide a list of property objects
// and can optionally specify a custom height.  The component is client-side
// only to avoid SSR issues with Leaflet.
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
  const [retryCount, setRetryCount] = useState(0);

  // Determine locale using the browser language as a heuristic.  Default
  // gracefully to Albanian if the language cannot be determined or is not
  // explicitly English.  Supported locales are defined in src/lib/i18n.ts.
  const locale: 'sq' | 'en' =
    typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')
      ? 'en'
      : 'sq';
  const t = (key: string) => getTranslation(key, locale);

  // Cleanup function to properly destroy the map instance and remove layers.
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        // Remove all layers and markers
        if (typeof mapInstanceRef.current.eachLayer === 'function') {
          mapInstanceRef.current.eachLayer((layer: Layer) => {
            mapInstanceRef.current?.removeLayer(layer as Layer);
          });
        }
        // Remove the map instance
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        // Clear the container HTML
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
      } catch (cleanupError) {
        console.warn('Error during map cleanup:', cleanupError);
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
        mapInstanceRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      // No properties to display; the render function will show the empty state.
      return;
    }

    // Helper: wait until container has a real, visible size.  Leaflet can
    // misbehave if the container has zero dimensions when the map is
    // instantiated.
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

        // Fallback timeout to ensure we don't wait indefinitely
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

      // Two requestAnimationFrame calls ensure that any layout and paint
      // processes have settled before we proceed.
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    };

    let canceled = false;
    const initMap = async () => {
      if (!mapRef.current) return;
      // Clean up any existing map before initializing a new one
      cleanupMap();

      try {
        setIsLoading(true);
        setError(null);

        // Dynamically load Leaflet CSS if not already present.  Without this
        // the map will render incorrectly in many environments.
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = '/leaflet.css';
          document.head.appendChild(link);
        }

        const L = await import('leaflet');

        // Create custom marker icon for individual property markers.  This
        // matches the blue theme used throughout the website and aligns
        // correctly on the map.
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
          popupAnchor: [0, -24],
        });

        // Override default Leaflet icons so that fallbacks load correctly.
        // @ts-expect-error Accessing private Leaflet property to override default icons
        delete (L.Icon.Default.prototype as unknown)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Clear any previous content and assign a unique ID to the container
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
          mapRef.current.id = containerIdRef.current;
        }

        // Wait until the container has dimensions before creating the map
        await waitForVisibleContainer(mapRef.current, 1200);

        // Bail if the container no longer exists or if a map was already created
        if (!mapRef.current || mapInstanceRef.current) {
          return;
        }

        // Disable animations on small/mobile screens to reduce flicker and tile
        // gaps, as recommended in prior map improvement notes.
        const isSmallScreen =
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(max-width: 640px)').matches;

        const map = L.map(mapRef.current, {
          center: [41.3275, 19.8187],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false,
          fadeAnimation: !isSmallScreen,
          zoomAnimation: !isSmallScreen,
          markerZoomAnimation: !isSmallScreen,
          preferCanvas: true,
        });
        try {
          map.zoomControl?.setPosition('bottomleft');
        } catch {}

        // Define multiple tile providers, including satellite imagery.  If a
        // provider fails to load tiles, the component will automatically
        // fallback to the next provider in the list.  A toggle control lets
        // users cycle between providers on demand.
        type ProviderSpec = { url: string; attribution: string; options?: Parameters<typeof L.tileLayer>[1] };
        const providers: ProviderSpec[] = [
          {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors',
            options: { maxZoom: 19 },
          },
          {
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            attribution: '&copy; OpenStreetMap & CARTO',
            options: { maxZoom: 20, subdomains: 'abcd' as unknown as string[] },
          },
          {
            url:
              'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles © Esri',
            options: { maxZoom: 20 },
          },
        ];
        const providerIndexRef = { current: 0 };

        const attachTiles = (index: number) => {
          const spec = providers[index];
          if (!spec) return;
          if (tileLayerRef.current) {
            try {
              map.removeLayer(tileLayerRef.current);
            } catch {}
            tileLayerRef.current = null;
          }
          const tl = L.tileLayer(spec.url, {
            attribution: spec.attribution,
            detectRetina: true,
            crossOrigin: true,
            updateWhenIdle: true,
            keepBuffer: 2,
            ...(spec.options || {}),
          }).addTo(map);
          tileLayerRef.current = tl;
          let errCount = 0;
          tl.on('tileerror', () => {
            errCount += 1;
            try {
              map.invalidateSize();
            } catch {}
            if (errCount >= 3 && providerIndexRef.current + 1 < providers.length) {
              providerIndexRef.current += 1;
              attachTiles(providerIndexRef.current);
            }
          });
        };
        attachTiles(0);

        // Add a toggle control that cycles through tile providers.  The control
        // appears in the top-right corner of the map and uses a simple emoji
        // to indicate map switching.
        const toggleControl = L.control({ position: 'topright' });
        toggleControl.onAdd = function () {
          const button = L.DomUtil.create('button', 'leaflet-bar');
          button.innerHTML = '🗺️';
          button.title = 'Switch map view';
          button.style.backgroundColor = '#2563eb';
          button.style.color = '#fff';
          button.style.padding = '4px 8px';
          button.style.border = 'none';
          button.style.cursor = 'pointer';
          L.DomEvent.on(button, 'click', (e: any) => {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            providerIndexRef.current = (providerIndexRef.current + 1) % providers.length;
            attachTiles(providerIndexRef.current);
          });
          return button;
        };
        toggleControl.addTo(map);

        // Filter out any properties lacking valid coordinates.  Invalid values
        // cause Leaflet errors if passed directly to markers.
        const validProperties = properties.filter((property) => {
          const coords = property.address.coordinates;
          return coords.lat && coords.lng && !isNaN(coords.lat) && !isNaN(coords.lng);
        });

        const markers: Array<ReturnType<typeof L.marker>> = [];
        const clusterThreshold = 50;
        const useCluster = validProperties.length > clusterThreshold;

        if (useCluster) {
          // Manual clustering: group properties by rounding their coordinates to
          // two decimal places (~1 km).  Each cluster is represented either by
          // a single marker (if only one property falls into the cell) or a
          // cluster marker showing the count.  Cluster popups list up to five
          // property links and indicate if more exist.
          type Cluster = { lat: number; lng: number; properties: Property[] };
          const clusters: Record<string, Cluster> = {};
          validProperties.forEach((property) => {
            const { lat, lng } = property.address.coordinates;
            const keyLat = Math.round(lat * 100) / 100;
            const keyLng = Math.round(lng * 100) / 100;
            const key = `${keyLat}_${keyLng}`;
            if (!clusters[key]) {
              clusters[key] = { lat: 0, lng: 0, properties: [] };
            }
            clusters[key].properties.push(property);
          });
          // Compute the average lat/lng for each cluster to position the marker.
          Object.values(clusters).forEach((cluster) => {
            let sumLat = 0;
            let sumLng = 0;
            cluster.properties.forEach((p) => {
              sumLat += p.address.coordinates.lat;
              sumLng += p.address.coordinates.lng;
            });
            cluster.lat = sumLat / cluster.properties.length;
            cluster.lng = sumLng / cluster.properties.length;
          });
          // Create markers for each cluster
          Object.values(clusters).forEach((cluster) => {
            if (cluster.properties.length === 1) {
              const property = cluster.properties[0];
              const marker = L.marker([cluster.lat, cluster.lng], {
                icon: customIcon,
              }).addTo(map);
              const coords = property.address.coordinates;
              marker.bindPopup(
                `
                <div style="min-width: 240px; max-width: 280px; padding: 12px;">
                  <div style="margin-bottom: 8px;">
                    <h3 style="font-weight: 700; font-size: 15px; line-height: 1.3; margin: 0 0 8px 0; color: #1f2937;">${property.title}</h3>
                    <p style="font-weight: 600; font-size: 16px; color: #2563eb; margin: 0 0 8px 0;">${formatPrice(
                  property.price
                )}</p>
                  </div>
                  <div style="display: flex; gap: 8px; font-size: 12px; color: #6b7280; margin-bottom: 10px; flex-wrap: wrap;">
                    <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${property.details.bedrooms} ${t(
                  'bedrooms'
                )}</span>
                    <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${property.details.bathrooms} ${t(
                  'bathrooms'
                )}</span>
                    <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${property.details.squareFootage}${t(
                  'squareMeters'
                )}</span>
                  </div>
                  <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <a href="/properties/${property.id}" style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">${t(
                  'viewDetails'
                )}</a>
                    <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords.lat},${coords.lng}" target="_blank" rel="noopener" style="display: inline-block; background: #f3f4f6; color: #2563eb; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">${t(
                  'streetView'
                )}</a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}" target="_blank" rel="noopener" style="display: inline-block; background: #f3f4f6; color: #2563eb; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">${t(
                  'directions'
                )}</a>
                  </div>
                </div>
              `,
                {
                  maxWidth: 300,
                  className: 'custom-popup',
                }
              );
              marker.on('click', () => {
                try {
                  map.setView([coords.lat, coords.lng], Math.min(map.getZoom() + 3, 18));
                } catch {}
              });
              markers.push(marker);
            } else {
              // Build a custom cluster marker showing the count.  The style
              // matches the overall aesthetic of the application.
              const count = cluster.properties.length;
              const clusterIcon = L.divIcon({
                html: `
                  <div style="
                    position: relative;
                    width: 32px;
                    height: 32px;
                    line-height: 32px;
                    border-radius: 50%;
                    background: #2563eb;
                    color: #fff;
                    text-align: center;
                    font-weight: bold;
                    font-size: 13px;
                    border: 3px solid #fff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  ">
                    ${count}
                  </div>
                `,
                className: 'cluster-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              });
              const marker = L.marker([cluster.lat, cluster.lng], {
                icon: clusterIcon,
              }).addTo(map);
              // Build popup listing up to five property links and showing if more
              let content = `<div style="min-width: 200px; max-width: 280px; padding: 8px;">`;
              content += `<div style="font-weight: 600; margin-bottom: 6px;">${count} ${t('properties')}</div><ul style="padding-left: 16px; margin: 0;">`;
              const list = cluster.properties.slice(0, 5);
              list.forEach((p) => {
                content += `<li style="margin-bottom: 4px;"><a href="/properties/${p.id}" style="color: #2563eb; text-decoration: none;">${p.title}</a></li>`;
              });
              if (cluster.properties.length > list.length) {
                const more = cluster.properties.length - list.length;
                content += `<li style="color: #6b7280;">… ${more} ${t('clusterMore')}</li>`;
              }
              content += `</ul></div>`;
              marker.bindPopup(content);
              marker.on('click', () => {
                try {
                  map.setView([cluster.lat, cluster.lng], Math.min(map.getZoom() + 2, 18));
                } catch {}
              });
              markers.push(marker);
            }
          });
        } else {
          // Standard markers without clustering.  Each property marker uses the
          // custom icon and binds a detailed popup containing property
          // information and map/direction links.
          validProperties.forEach((property) => {
            try {
              const coords = property.address.coordinates;
              const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
              marker.bindPopup(
                `
                <div style="min-width: 240px; max-width: 280px; padding: 12px;">
                  <div style="margin-bottom: 8px;">
                    <h3 style="font-weight: 700; font-size: 15px; line-height: 1.3; margin: 0 0 8px 0; color: #1f2937;">${property.title}</h3>
                    <p style="font-weight: 600; font-size: 16px; color: #2563eb; margin: 0 0 8px 0;">${formatPrice(
                  property.price
                )}</p>
                  </div>
                  <div style="display: flex; gap: 8px; font-size: 12px; color: #6b7280; margin-bottom: 10px; flex-wrap: wrap;">
                    <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${property.details.bedrooms} ${t(
                  'bedrooms'
                )}</span>
                    <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${property.details.bathrooms} ${t(
                  'bathrooms'
                )}</span>
                    <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${property.details.squareFootage}${t(
                  'squareMeters'
                )}</span>
                  </div>
                  <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <a href="/properties/${property.id}" style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">${t(
                  'viewDetails'
                )}</a>
                    <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords.lat},${coords.lng}" target="_blank" rel="noopener" style="display: inline-block; background: #f3f4f6; color: #2563eb; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">${t(
                  'streetView'
                )}</a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}" target="_blank" rel="noopener" style="display: inline-block; background: #f3f4f6; color: #2563eb; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">${t(
                  'directions'
                )}</a>
                  </div>
                </div>
              `,
                {
                  maxWidth: 300,
                  className: 'custom-popup',
                }
              );
              marker.on('click', () => {
                try {
                  map.setView([coords.lat, coords.lng], Math.min(map.getZoom() + 3, 18));
                } catch {}
              });
              markers.push(marker);
            } catch (markerError) {
              console.warn('Error adding marker for property:', property.id, markerError);
            }
          });
        }

        // Helper to fit the map bounds around all markers.  Waits for the
        // internal Leaflet panes to be ready before performing fitBounds.
        const safeFitBounds = (attempt = 0) => {
          try {
            if (canceled || !map) return;
            const size = map.getSize?.();
            const pane = map.getPane?.('mapPane');
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
              requestAnimationFrame(() => {
                if (canceled) return;
                try {
                  const stillOk =
                    !!(map as unknown as { _mapPane?: HTMLElement })._mapPane &&
                    !!(map as unknown as { _loaded?: boolean })._loaded;
                  if (stillOk) {
                    map.fitBounds(group.getBounds().pad(0.1), {
                      animate: false,
                      maxZoom: 15,
                    });
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
          const scheduleFit = () => {
            const id = window.setTimeout(() => safeFitBounds(0), 120);
            timeoutsRef.current.push(id);
          };
          try {
            map.once('load', scheduleFit);
          } catch {}
          try {
            map.whenReady(scheduleFit);
          } catch {}
        }

        mapInstanceRef.current = map;
        setIsLoading(false);
        setError(null);

        // Force map to recalculate its size shortly after mount and whenever
        // properties change.  Without this invalidation the map can appear
        // misaligned in certain responsive layouts.
        {
          const id = window.setTimeout(() => {
            try {
              if (map && map.getPane?.('mapPane')) map.invalidateSize();
            } catch {}
          }, 200);
          timeoutsRef.current.push(id);
        }

        // Keep the map responsive to container resizes and orientation changes.
        map.on('resize', () => {
          try {
            if (map.getPane?.('mapPane')) map.invalidateSize();
          } catch {}
        });

        const onWinResize = () => {
          try {
            map.invalidateSize();
          } catch {}
        };
        window.addEventListener('resize', onWinResize);
        window.addEventListener('orientationchange', onWinResize);
        (map as unknown as { __onWinResize?: () => void }).__onWinResize = onWinResize;
      } catch (initError) {
        console.error('Map initialization error:', initError);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    // Debounce map initialization to avoid thrashing when properties change
    const timeoutId = window.setTimeout(initMap, 50);
    timeoutsRef.current.push(timeoutId);

    return () => {
      canceled = true;
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch {}
        observerRef.current = null;
      }
      clearTimeout(timeoutId);
      cleanupMap();
      try {
        const handler = (mapInstanceRef.current as unknown as { __onWinResize?: () => void })
          ?.__onWinResize;
        if (handler) {
          window.removeEventListener('resize', handler);
          window.removeEventListener('orientationchange', handler);
        }
      } catch {}
    };
  }, [properties, height, cleanupMap, retryCount]);

  // Retry button handler.  After three attempts the page will reload.
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      setError(null);
      setIsLoading(true);
      containerIdRef.current = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    } else {
      window.location.reload();
    }
  }, [retryCount]);

  // Render empty state when there are no properties.  Uses the translation
  // helper defined in src/lib/i18n.ts.
  if (!Array.isArray(properties) || properties.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
        <span className="text-gray-500 text-sm">{t('noProperties')}</span>
      </div>
    );
  }

  // Show fallback loader while the map is being initialized.
  if (isLoading) {
    return (
      <div className="w-full" style={{ minHeight: height }}>
        <MapFallback />
      </div>
    );
  }

  // Display an error message with a retry option if initialization fails.
  if (error) {
    return (
      <div className="w-full" style={{ minHeight: height }}>
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <p className="mb-2"> {error} </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // The map container; Leaflet will take over this element.  Note: an empty
  // div is required for Leaflet to mount the map.
  return (
    <div
      ref={mapRef}
      id={containerIdRef.current}
      className="relative w-full rounded-lg overflow-hidden"
      style={{ height }}
    ></div>
  );
}