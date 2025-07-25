'use client';

import Link from 'next/link';
import { Property } from '@/types';
import ImageGallery from '@/components/ImageGallery';
import ClientOnlyMapView from '@/components/ClientOnlyMapView';
import ContactForm from '@/components/ContactForm';
import Layout from '@/components/Layout';
import StructuredData from '@/components/StructuredData';
import { ArrowLeft, MapPin, Home, Bed, Bath, Square, Calendar, Euro, Star } from 'lucide-react';

interface PropertyDetailClientProps {
  property: Property;
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const formatPrice = (price: number) => {
    // Use a consistent format that works the same on server and client
    return `€${price.toLocaleString('en-US')}`;
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
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Breadcrumb Header */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-blue-100 hover:text-white mr-6 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-medium">Kthehu</span>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
                <div className="flex items-center text-blue-200">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg">{property.address.street}, {property.address.city}</span>
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
              <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full border border-blue-200">
                        {getListingTypeLabel(property.listingType)}
                      </span>
                      {property.isPinned && (
                        <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full border border-yellow-200 flex items-center">
                          <Star className="h-4 w-4 mr-2 fill-current" />
                          I Zgjedhur
                        </span>
                      )}
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center">
                      <Euro className="h-10 w-10 mr-3 text-blue-600" />
                      {formatPrice(property.price)}
                    </h2>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-200">
                    <Bed className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-blue-900">{property.details.bedrooms}</div>
                    <div className="text-sm text-blue-700 font-medium">Dhoma Gjumi</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-200">
                    <Bath className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-blue-900">{property.details.bathrooms}</div>
                    <div className="text-sm text-blue-700 font-medium">Banjo</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-200">
                    <Square className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-blue-900">{property.details.squareFootage}</div>
                    <div className="text-sm text-blue-700 font-medium">m²</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-200">
                    <Home className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-lg font-bold text-blue-900">{getPropertyTypeLabel(property.details.propertyType)}</div>
                    <div className="text-sm text-blue-700 font-medium">Lloji</div>
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
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
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
                <ClientOnlyMapView 
                  properties={[property]} 
                  height="400px"
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
