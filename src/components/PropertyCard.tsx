import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';
import { formatPrice, formatAddress } from '@/lib/utils';
import { Bed, Bath, Square, MapPin, Star, Map, Navigation } from 'lucide-react';
import PropertyImageGallery from './PropertyImageGallery';
import { ViewOnMapButtonCompact } from './ViewOnMapButton';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      house: 'Shtëpi',
      apartment: 'Apartament', 
      condo: 'Kondo',
      townhouse: 'Shtëpi në Qytet'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getListingTypeLabel = (type: string) => {
    return type === 'sale' ? 'Për Shitje' : 'Me Qira';
  };

  return (
    <Link href={`/properties/${property.id}`} className="group">
      <div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 active:scale-95 touch-manipulation"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Property Image with Mobile Swipe Support */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          {property.images.length > 0 ? (
            <PropertyImageGallery images={property.images} title={property.title} />
          ) : (
            // Fallback placeholder
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <Square className="h-12 w-12 mx-auto mb-2" />
                <span className="text-sm">Nuk ka imazh</span>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
            {formatPrice(property.price)}
          </div>
          
          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            <span className="bg-white/95 backdrop-blur-sm text-blue-800 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              {getListingTypeLabel(property.listingType)}
            </span>
            {property.isPinned && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow-md">
                <Star className="h-3 w-3 mr-1" />
                I Zgjedhur
              </span>
            )}
          </div>

          {/* Property Type Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
              {getPropertyTypeLabel(property.details.propertyType)}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-3 sm:mb-4">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
            <span className="line-clamp-1 font-medium">{formatAddress(property.address)}</span>
          </div>

          <p className="text-gray-700 text-sm mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
            {property.description}
          </p>

          {/* Property Stats */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {property.details.bedrooms > 0 && (
              <div className="flex items-center space-x-1 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                <Bed className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">{property.details.bedrooms}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
              <Bath className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">{property.details.bathrooms}</span>
            </div>
            
            <div className="flex items-center space-x-1 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
              <Square className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">{property.details.squareFootage}m²</span>
            </div>
          </div>

          {/* Agent Information */}
          {property.agent && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {property.agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {property.agent.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Real Estate Agent
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `tel:${property.agent.phone}`;
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Call agent"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `mailto:${property.agent.email}`;
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Email agent"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ViewOnMapButtonCompact 
                  property={property}
                  className="z-10"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.address.coordinates.lat},${property.address.coordinates.lng}`;
                    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors border border-green-200 hover:border-green-300"
                  title="Get directions"
                >
                  <Navigation className="h-3 w-3" />
                </button>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  ID: {property.id.slice(0, 8)}
                </div>
                <span className="text-blue-600 text-sm font-semibold group-hover:text-blue-700 transition-colors duration-300">
                  View Details →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}