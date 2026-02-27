'use client';

import { useState } from 'react';
import { Property } from '@/types';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface ViewOnMapButtonProps {
  property: Property;
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  openInNewTab?: boolean;
  className?: string;
}

export default function ViewOnMapButton({
  property,
  variant = 'primary',
  size = 'md',
  showIcon = true,
  showText = true,
  openInNewTab = true,
  className = ''
}: ViewOnMapButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-transparent shadow-md hover:shadow-lg';
      case 'secondary':
        return 'bg-gray-600 text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 border-transparent shadow-md hover:shadow-lg';
      case 'outline':
        return 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-md';
      case 'minimal':
        return 'bg-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent';
      default:
        return 'bg-blue-600 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-transparent shadow-md hover:shadow-lg';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const handleClick = () => {
    const mapUrl = `/map?property=${property.id}&lat=${property.address.coordinates.lat}&lng=${property.address.coordinates.lng}`;

    if (openInNewTab) {
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = mapUrl;
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.address.coordinates.lat},${property.address.coordinates.lng}`;
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          inline-flex items-center gap-2 font-medium rounded-lg border transition-all duration-200 
          ${getVariantClasses()} 
          ${getSizeClasses()} 
          ${className}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transform hover:scale-105 active:scale-95
        `}
        title={`View ${property.title} on map`}
      >
        {showIcon && (
          <MapPin className={`${getIconSize()} ${isHovered ? 'animate-bounce' : ''}`} />
        )}
        {showText && (
          <span>
            {size === 'sm' ? 'Map' : 'View on Map'}
          </span>
        )}
        {openInNewTab && showText && (
          <ExternalLink className={`${getIconSize()} opacity-60`} />
        )}
      </button>

      {/* Dropdown for additional actions on hover */}
      {isHovered && size !== 'sm' && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
          <div className="py-1">
            <button
              onClick={handleClick}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-blue-600" />
              View on Map
            </button>
            <button
              onClick={handleDirections}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Navigation className="h-4 w-4 text-green-600" />
              Get Directions
            </button>
            <button
              onClick={() => {
                const fullMapUrl = `/map?center=${property.address.coordinates.lat},${property.address.coordinates.lng}&zoom=16`;
                window.open(fullMapUrl, '_blank', 'noopener,noreferrer');
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4 text-purple-600" />
              Full Map View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for use in property cards
export function ViewOnMapButtonCompact({
  property,
  className = ''
}: {
  property: Property;
  className?: string;
}) {
  return (
    <ViewOnMapButton
      property={property}
      variant="outline"
      size="sm"
      showText={false}
      className={className}
    />
  );
}

// Full-width version for property detail pages
export function ViewOnMapButtonFull({
  property,
  className = ''
}: {
  property: Property;
  className?: string;
}) {
  return (
    <ViewOnMapButton
      property={property}
      variant="primary"
      size="lg"
      className={`w-full justify-center ${className}`}
    />
  );
}

// Floating action button version
export function ViewOnMapFAB({
  property,
  className = ''
}: {
  property: Property;
  className?: string;
}) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <ViewOnMapButton
        property={property}
        variant="primary"
        size="lg"
        showText={false}
        className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl"
      />
    </div>
  );
}