'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Property } from '@/types';

type LatLng = { lat: number; lng: number };

interface StaticMapPreviewProps {
  properties?: Property[];
  center?: LatLng;
  zoom?: number; // default 14
  height?: number; // px, default 300
  width?: number; // px for the requested static map image, default 640
  ctaHref?: string; // where to go on click (e.g., '/map')
  className?: string;
}

/**
 * Lightweight static map preview for mobile using Google Static Maps.
 * Falls back to a simple placeholder if no API key is available.
 */
export default function StaticMapPreview({
  properties = [],
  center,
  zoom = 14,
  height = 300,
  width = 640,
  ctaHref = '/map',
  className = ''
}: StaticMapPreviewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const primaryCenter = useMemo<LatLng>(() => {
    if (center) return center;
    const first = properties[0]?.address?.coordinates;
    return first && first.lat && first.lng
      ? { lat: first.lat, lng: first.lng }
      : { lat: 41.3275, lng: 19.8187 }; // Tirana default
  }, [center, properties]);

  const markersParam = useMemo(() => {
    const pts = (properties || [])
      .filter(p => p?.address?.coordinates?.lat && p?.address?.coordinates?.lng)
      .slice(0, 8) // cap markers for URL length
      .map(p => `${p.address.coordinates.lat},${p.address.coordinates.lng}`);
    if (pts.length === 0) return '';
    const color = '0x2563eb'; // blue
    return `&markers=color:${color}|${pts.join('|')}`;
  }, [properties]);

  const mapUrl = useMemo(() => {
    if (!apiKey) return null;
    const params = new URLSearchParams();
    params.set('center', `${primaryCenter.lat},${primaryCenter.lng}`);
    params.set('zoom', `${zoom}`);
    params.set('size', `${width}x${height}`);
    params.set('scale', '2');
    params.set('maptype', 'roadmap');
    // Build base and append markers manually because URLSearchParams encodes pipes
    let url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
    if (markersParam) url += markersParam;
    url += `&key=${apiKey}`;
    return url;
  }, [apiKey, primaryCenter, zoom, width, height, markersParam]);

  return (
    <div className={`relative w-full overflow-hidden rounded-lg border border-gray-200 ${className}`} style={{ height }}>
      {mapUrl ? (
        <Link href={ctaHref} className="block w-full h-full">
          {/* Use fill layout with object-cover for responsiveness */}
          <Image
            src={mapUrl}
            alt="Map preview"
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            priority={false}
            className="object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded shadow">
            Hap hartën →
          </div>
        </Link>
      ) : (
        <Link href={ctaHref} className="block w-full h-full">
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Map preview unavailable</div>
              <div className="text-xs text-blue-600">Tap to open interactive map</div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
