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
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Property Image */}
        <div className="relative h-48 w-full">
          {property.images[0] ? (
            property.images[0].startsWith('data:') ? (
              // Handle base64 images with regular img tag
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              // Handle regular URLs with Next.js Image
              <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
            )
          ) : (
            // Fallback placeholder
            <Image
              src="/images/placeholder-property.jpg"
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          )}
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
            {formatPrice(property.price)}
          </div>
          <div className="absolute top-2 left-2 flex space-x-1">
            <span className="bg-white/90 text-red-800 text-xs font-medium px-2 py-1 rounded">
              {getListingTypeLabel(property.listingType)}
            </span>
            {property.isPinned && (
              <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded flex items-center">
                <Star className="h-3 w-3 mr-1" />
                I Zgjedhur
              </span>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{formatAddress(property.address)}</span>
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>

          {/* Property Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-3">
              {property.details.bedrooms > 0 && (
                <div className="flex items-center space-x-1">
                  <Bed className="h-4 w-4 text-red-600" />
                  <span>{property.details.bedrooms}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Bath className="h-4 w-4 text-red-600" />
                <span>{property.details.bathrooms}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Square className="h-4 w-4 text-red-600" />
                <span>{property.details.squareFootage} m²</span>
              </div>
            </div>
          </div>

          {/* Property Type Badge */}
          <div className="flex justify-between items-center">
            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              {getPropertyTypeLabel(property.details.propertyType)}
            </span>
            <span className="text-xs text-gray-500">
              ID: {property.id.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}