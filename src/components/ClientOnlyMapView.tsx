'use client';

import dynamic from 'next/dynamic';
import { Property } from '@/types';
import CreativeLoader from '@/components/CreativeLoader';
import MapErrorBoundary from '@/components/MapErrorBoundary';

interface ClientOnlyMapViewProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Dynamically import MapView with no SSR to prevent hydration issues
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '400px' }} className="w-full rounded-lg shadow-md border border-gray-200 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <CreativeLoader type="map" size="md" />
    </div>
  ),
});

export default function ClientOnlyMapView(props: ClientOnlyMapViewProps) {
  return (
    <MapErrorBoundary fallbackHeight={props.height}>
      <MapView {...props} />
    </MapErrorBoundary>
  );
}