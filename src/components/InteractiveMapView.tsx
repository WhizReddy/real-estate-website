'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types';
import { ExternalLink, Home } from 'lucide-react';

interface InteractiveMapViewProps {
  mode: 'view' | 'edit';
  properties?: Property[];
  selectedLocation?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

function ensureLeafletStyles() {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const existingLink = document.getElementById('leaflet-css') as HTMLLinkElement | null;

    if (existingLink) {
      if (existingLink.dataset.loaded === 'true' || existingLink.sheet) {
        existingLink.dataset.loaded = 'true';
        resolve();
        return;
      }

      existingLink.addEventListener(
        'load',
        () => {
          existingLink.dataset.loaded = 'true';
          resolve();
        },
        { once: true }
      );
      existingLink.addEventListener('error', () => resolve(), { once: true });
      return;
    }

    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = '/leaflet.css';
    link.addEventListener(
      'load',
      () => {
        link.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    link.addEventListener('error', () => resolve(), { once: true });
    document.head.appendChild(link);
  });
}

export default function InteractiveMapView({
  mode = 'view',
  properties = [],
  selectedLocation,
  onLocationSelect,
  height = '400px',
  center = [41.3275, 19.8187],
  zoom = 13,
}: InteractiveMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const selectedMarkerRef = useRef<any>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const initMap = async () => {
      try {
        setMapError(null);
        setIsMapReady(false);
        await ensureLeafletStyles();

        const L = await import('leaflet');
        if (cancelled || !mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        map.setView(center, zoom, { animate: false });

        if (mode === 'edit') {
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;

            if (selectedMarkerRef.current) {
              map.removeLayer(selectedMarkerRef.current);
            }

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

            selectedMarkerRef.current = L.marker([lat, lng], {
              icon: customIcon,
              draggable: false,
            }).addTo(map);

            onLocationSelectRef.current?.(
              parseFloat(lat.toFixed(6)),
              parseFloat(lng.toFixed(6))
            );
          });

          map.getContainer().style.cursor = 'crosshair';
        }

        mapInstanceRef.current = map;

        map.whenReady(() => {
          setTimeout(() => {
            map.invalidateSize();
            setTimeout(() => map.invalidateSize(), 120);
            setIsMapReady(true);
          }, 0);
        });
      } catch (error) {
        console.error('Interactive map failed to initialize:', error);
        if (!cancelled) {
          setMapError('Harta nuk u ngarkua. Rifresko faqen dhe provo përsëri.');
        }
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      selectedMarkerRef.current = null;
      setIsMapReady(false);
    };
  }, [center, mode, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation || mode !== 'edit') return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      if (selectedMarkerRef.current) {
        map.removeLayer(selectedMarkerRef.current);
      }

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

      map.setView([selectedLocation.lat, selectedLocation.lng], zoom, { animate: false });
      setTimeout(() => map.invalidateSize(), 60);
    });
  }, [mode, selectedLocation, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || mode !== 'view') return;
    import('leaflet').then((L) => {
      addPropertyMarkers(L, mapInstanceRef.current, properties);
    });
  }, [properties, mode]);

  const addPropertyMarkers = (L: any, map: any, list: Property[]) => {
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    list.forEach((property) => {
      if (property.address.coordinates.lat && property.address.coordinates.lng) {
        const marker = L.marker([
          property.address.coordinates.lat,
          property.address.coordinates.lng,
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

    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white p-2">
        {mode === 'edit' ? (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="h-3 w-3 rounded-full bg-blue-600" />
            <span>Kliko në hartë për të zgjedhur lokacionin</span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                try {
                  mapInstanceRef.current.invalidateSize();
                } catch {}
                mapInstanceRef.current.setView(center, zoom, { animate: false });
              }
            }}
            className="rounded-md border border-gray-200 bg-white p-2 shadow-sm transition-colors duration-200 hover:bg-blue-50"
            title="Kthehu në Tiranë"
            aria-label="Centero hartën në Tiranë"
          >
            <Home className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </button>

          {selectedLocation && (
            <a
              href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-gray-200 bg-white p-2 shadow-sm transition-colors duration-200 hover:bg-blue-50"
              title="Hap në Google Maps"
              aria-label="Hap në Google Maps"
            >
              <ExternalLink className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      <div ref={mapRef} style={{ height, minHeight: height, width: '100%' }} />

      {mapError ? (
        <div className="border-t border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
          {mapError}
        </div>
      ) : !isMapReady ? (
        <div className="border-t border-gray-200 bg-gray-50 p-3 text-center text-sm text-gray-600">
          Duke ngarkuar hartën...
        </div>
      ) : null}
    </div>
  );
}
