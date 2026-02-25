import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';
import { formatPrice, formatAddress } from '@/lib/utils';
import { Bed, Bath, Square, MapPin, Star, Map, Navigation, Phone, Mail } from 'lucide-react';
import { memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
const PropertyImageGallery = dynamic(() => import('./PropertyImageGallery'), { ssr: false });
import { ViewOnMapButtonCompact } from './ViewOnMapButton';
import FavoriteButton from './FavoriteButton';
import Badge from './Badge';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const getPropertyTypeLabel = useCallback((type: string) => {
    const labels = {
      house: 'Shtëpi',
      apartment: 'Apartament',
      condo: 'Kondo',
      townhouse: 'Shtëpi në Qytet'
    };
    return labels[type as keyof typeof labels] || type;
  }, []);

  const getListingTypeLabel = useCallback((type: string) => {
    return type === 'sale' ? 'Për Shitje' : 'Me Qira';
  }, []);

  return (
    <Link href={`/properties/${property.id}`} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl block">
      <div
        className="card-interactive"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Property Image with Mobile Swipe Support */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <PropertyImageGallery images={property.images} title={property.title} />
          ) : (
            // Fallback placeholder
            <div className="w-full h-full bg-white flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <Square className="h-12 w-12 mx-auto mb-2" />
                <span className="text-sm">Nuk ka imazh</span>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>

          {/* Status Badges - Top Left */}
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[calc(100%-2rem)] z-10">
            <Badge variant="primary">
              {getListingTypeLabel(property.listingType)}
            </Badge>
            {property.isPinned && (
              <Badge variant="warning" icon={Star}>
                I Zgjedhur
              </Badge>
            )}
            <Badge variant="glass-dark">
              {getPropertyTypeLabel(property.details.propertyType)}
            </Badge>
          </div>

          {/* Favorite Button - Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton propertyId={property.id} />
          </div>
        </div>

        {/* Property Details */}
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          {/* Price - prominent, full width */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors duration-300 flex-1 mr-2">
              {property.title}
            </h3>
            <span className="text-xl font-black text-primary whitespace-nowrap">
              {formatPrice(property.price)}
            </span>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
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
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-white text-xs font-semibold">
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
                    aria-label={`Call ${property.agent.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `tel:${property.agent.phone}`;
                    }}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    title="Call agent"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Email ${property.agent.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `mailto:${property.agent.email}`;
                    }}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    title="Email agent"
                  >
                    <Mail className="h-4 w-4" />
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
                className="z-10 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <button
                aria-label="Merr udhëzime"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.address.coordinates.lat},${property.address.coordinates.lng}`;
                  window.open(directionsUrl, '_blank', 'noopener,noreferrer');
                }}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-200 hover:border-green-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                title="Merr udhëzime"
              >
                <Navigation className="h-4 w-4" />
              </button>
            </div>

            <span className="btn-primary py-1.5 text-sm group-hover:scale-105">
              Shiko Detajet
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
export default memo(PropertyCard);