import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';
import { formatPrice, formatAddress } from '@/lib/utils';
import { Bed, Bath, Square, MapPin, Star } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
        {/* Property Image */}
        <div className="relative h-56 w-full overflow-hidden">
          {property.images[0] ? (
            property.images[0].startsWith('data:') ? (
              // Handle base64 images with regular img tag
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              // Handle regular URLs with Next.js Image
              <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
            )
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
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
            <span className="line-clamp-1 font-medium">{formatAddress(property.address)}</span>
          </div>

          <p className="text-gray-700 text-sm mb-6 line-clamp-2 leading-relaxed">
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

          {/* View Details Button */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                ID: {property.id.slice(0, 8)}
              </span>
              <span className="text-blue-600 text-sm font-semibold group-hover:text-blue-700 transition-colors duration-300">
                Kontakto Agjentin →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}