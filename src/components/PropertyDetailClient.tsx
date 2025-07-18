'use client';

import Link from 'next/link';
import { Property } from '@/types';
import ImageGallery from '@/components/ImageGallery';
import MapView from '@/components/MapView';
import ContactForm from '@/components/ContactForm';
import Layout from '@/components/Layout';
import StructuredData from '@/components/StructuredData';
import { ArrowLeft, MapPin, Home, Bed, Bath, Square, Calendar, Euro, Star } from 'lucide-react';

interface PropertyDetailClientProps {
  property: Property;
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sq-AL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
    <Layout>
      <StructuredData property={property} type="property" />
      <div className="bg-gray-50">
        {/* Breadcrumb Header */}
        <section className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Kthehu
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address.street}, {property.address.city}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ImageGallery images={property.images} alt={property.title} />
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {getListingTypeLabel(property.listingType)}
                      </span>
                      {property.isPinned && (
                        <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          I Zgjedhur
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                      <Euro className="h-8 w-8 mr-2 text-red-600" />
                      {formatPrice(property.price)}
                    </h2>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{property.details.bedrooms}</div>
                    <div className="text-sm text-gray-600">Dhoma Gjumi</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{property.details.bathrooms}</div>
                    <div className="text-sm text-gray-600">Banjo</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Square className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{property.details.squareFootage}</div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Home className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-sm font-bold text-gray-900">{getPropertyTypeLabel(property.details.propertyType)}</div>
                    <div className="text-sm text-gray-600">Lloji</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Përshkrimi</h3>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>

                {/* Features */}
                {property.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Karakteristikat</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                          <span className="capitalize">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Detaje Shtesë</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adresa e plotë:</span>
                      <span className="font-medium">{property.address.street}, {property.address.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kodi postar:</span>
                      <span className="font-medium">{property.address.zipCode}</span>
                    </div>
                    {property.details.yearBuilt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Viti i ndërtimit:</span>
                        <span className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {property.details.yearBuilt}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statusi:</span>
                      <span className="font-medium capitalize">{property.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 Lokacioni
                </h3>
                <MapView 
                  properties={[property]} 
                  height="400px"
                  showSingleProperty={true}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ContactForm 
                propertyId={property.id}
                propertyTitle={property.title}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}