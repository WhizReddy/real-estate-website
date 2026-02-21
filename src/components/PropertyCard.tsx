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
        className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-1.5 border border-gray-100 ring-1 ring-transparent hover:ring-blue-500/10 active:scale-[0.98] touch-manipulation"
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

          {/* Status Badges - Top Left */}
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[calc(100%-2rem)]">
            <span className="bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ring-1 ring-black/5">
              {getListingTypeLabel(property.listingType)}
            </span>
            {property.isPinned && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-md ring-1 ring-white/20">
                <Star className="h-3.5 w-3.5 mr-1" />
                I Zgjedhur
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
              {getPropertyTypeLabel(property.details.propertyType)}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 h-full">
          <div className="flex justify-between items-start mb-2 gap-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
              {property.title}
            </h3>
            <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 whitespace-nowrap tracking-tight">
              {formatPrice(property.price)}
            </span>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="line-clamp-1 font-medium">{formatAddress(property.address)}</span>
          </div>

          {/* Property Stats */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-5 pb-5 border-b border-gray-100">
            {property.details.bedrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{property.details.bedrooms} <span className="hidden sm:inline">Dhoma</span></span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">{property.details.bathrooms} <span className="hidden sm:inline">Banjo</span></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Square className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">{property.details.squareFootage}m²</span>
            </div>
          </div>

          {/* Agent Information */}
          {property.agent && (
            <div className="mb-4">
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
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ViewOnMapButtonCompact
                property={property}
                className="z-10 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-gray-200"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.address.coordinates.lat},${property.address.coordinates.lng}`;
                  window.open(directionsUrl, '_blank', 'noopener,noreferrer');
                }}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-200 hover:border-green-200"
                title="Merr udhëzime"
              >
                <Navigation className="h-4 w-4" />
              </button>
            </div>

            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              Shiko Detajet
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}