'use client';

import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { MapPin, Home, RefreshCw } from 'lucide-react';

interface MapFallbackProps {
  properties: Property[];
  height?: string;
  onRetry?: () => void;
}

export default function MapFallback({ properties, height = '400px', onRetry }: MapFallbackProps) {
  const validProperties = properties.filter(property => {
    const coords = property.address.coordinates;
    return coords.lat && coords.lng && !isNaN(coords.lat) && !isNaN(coords.lng);
  });

  return (
    <div className="relative">
      <div
        style={{ height }}
        className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden"
      >
        {validProperties.length > 0 ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Property Locations</h3>
                </div>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry Map
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {validProperties.length} properties available
              </p>
            </div>

            {/* Property List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {validProperties.slice(0, 6).map((property) => (
                <div
                  key={property.id}
                  className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Home className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {property.title}
                      </h4>
                      <p className="text-blue-600 font-semibold text-sm">
                        {formatPrice(property.price)}
                      </p>
                      <div className="text-xs text-gray-600 mt-1">
                        {property.details.bedrooms} dhoma • {property.details.bathrooms} banjo • {property.details.squareFootage}m²
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.address.street}, {property.address.city}
                      </div>
                    </div>
                    <a
                      href={`/properties/${property.id}`}
                      className="flex-shrink-0 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
              
              {validProperties.length > 6 && (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500">
                    And {validProperties.length - 6} more properties...
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="text-center">
              <div className="mb-4">
                <MapPin className="w-12 h-12 mx-auto text-blue-400" />
              </div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                No properties with location data
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Properties will appear here when location information is available
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors mx-auto"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry Map
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}