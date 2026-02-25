'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Property } from '@/types';
import ImageGallery from '@/components/ImageGallery';
import PropertyDetailMap from '@/components/PropertyDetailMap';
import StaticMapPreview from '@/components/StaticMapPreview';
import NeighborhoodInfo from '@/components/NeighborhoodInfo';
import ViewOnMapButton, { ViewOnMapFAB } from '@/components/ViewOnMapButton';
import ContactForm from '@/components/ContactForm';
import MortgageCalculator from '@/components/MortgageCalculator';
import Layout from '@/components/Layout';
import StructuredData from '@/components/StructuredData';
import PropertyBadge from '@/components/PropertyBadge';
import Badge from '@/components/Badge';
import { ArrowLeft, MapPin, Home, Bed, Bath, Square, Calendar, Euro, Star, Navigation, Map } from 'lucide-react';

interface PropertyDetailClientProps {
  property: Property;
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [activeMapTab, setActiveMapTab] = useState<'location' | 'neighborhood'>('location');
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Mock nearby properties (in real app, this would come from an API)
  useEffect(() => {
    // Simulate fetching nearby properties
    const mockNearbyProperties: Property[] = [
      // This would be fetched from your API based on the current property's location
    ];
    setNearbyProperties(mockNearbyProperties);
  }, [property.id]);

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
    <Layout variant="property">
      <StructuredData property={property} type="property" />
      <article className="bg-[var(--background)] min-h-screen text-[var(--foreground)] transition-colors duration-300">
        {/* Breadcrumb Header */}
        <header className="bg-primary/5 dark:bg-primary/10 border-b border-primary/20">
          <div className="container-custom py-[var(--spacing-lg)]">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-primary-dark hover:text-primary dark:text-primary-light dark:hover:text-white mr-[var(--spacing-md)] transition-colors duration-200"
                aria-label="Kthehu mbrapa"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-medium text-[var(--text-scale-base)]">Kthehu</span>
              </Link>
              <div>
                <h1 className="text-[var(--text-scale-hero)] font-bold text-[var(--foreground)] leading-tight mb-2">{property.title}</h1>
                <div className="flex items-center text-[var(--text-scale-lg)] text-slate-600 dark:text-slate-400">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.address.street}, {property.address.city}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container-custom py-[var(--spacing-xl)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-lg)]">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-[var(--spacing-lg)]">
              {/* Image Gallery */}
              <div className="card overflow-hidden">
                <ImageGallery images={property.images} title={property.title} />
              </div>

              {/* Property Details */}
              <section className="card p-[var(--spacing-xl)]">
                <div className="flex items-center justify-between mb-[var(--spacing-xl)]">
                  <div>
                    <div className="flex items-center space-x-[var(--spacing-xs)] mb-[var(--spacing-sm)]">
                      <Badge variant="primary" className="px-4 py-2 text-[var(--text-scale-sm)] font-semibold">
                        {getListingTypeLabel(property.listingType)}
                      </Badge>
                      {property.isPinned && (
                        <Badge variant="warning" icon={Star} className="px-4 py-2 border border-amber-200 dark:border-amber-800 text-[var(--text-scale-sm)] font-semibold">
                          I Zgjedhur
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-[var(--text-scale-h1)] font-bold text-primary dark:text-primary-light flex items-center">
                      <Euro className="h-8 w-8 mr-3" />
                      {formatPrice(property.price)}
                    </h2>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
                  <PropertyBadge icon={Bed} value={property.details.bedrooms} label="Dhoma Gjumi" />
                  <PropertyBadge icon={Bath} value={property.details.bathrooms} label="Banjo" />
                  <PropertyBadge icon={Square} value={property.details.squareFootage} label="m²" />
                  <PropertyBadge icon={Home} value={getPropertyTypeLabel(property.details.propertyType)} label="Lloji" />
                </div>

                {/* Description */}
                <div className="mb-[var(--spacing-xl)]">
                  <h3 className="text-[var(--text-scale-h3)] font-semibold text-[var(--foreground)] mb-[var(--spacing-sm)]">Përshkrimi</h3>
                  <p className="text-[var(--text-scale-base)] text-slate-600 dark:text-slate-400 leading-relaxed">{property.description}</p>
                </div>

                {/* Features */}
                {property.features.length > 0 && (
                  <div className="mb-[var(--spacing-xl)]">
                    <h3 className="text-[var(--text-scale-h3)] font-semibold text-[var(--foreground)] mb-[var(--spacing-sm)]">Karakteristikat</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--spacing-sm)]">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-[var(--text-scale-base)] text-slate-600 dark:text-slate-400">
                          <div className="w-2 h-2 bg-[var(--primary)] rounded-full mr-3"></div>
                          <span className="capitalize">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div className="border-t border-gray-200 dark:border-slate-800 pt-[var(--spacing-lg)]">
                  <h3 className="text-[var(--text-scale-h3)] font-semibold text-[var(--foreground)] mb-[var(--spacing-sm)]">Detaje Shtesë</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] text-[var(--text-scale-base)]">
                    <div className="flex justify-between p-[var(--spacing-sm)] bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-slate-500 dark:text-slate-400">Adresa e plotë:</span>
                      <span className="font-medium text-[var(--foreground)]">{property.address.street}, {property.address.city}</span>
                    </div>
                    <div className="flex justify-between p-[var(--spacing-sm)] bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-slate-500 dark:text-slate-400">Kodi postar:</span>
                      <span className="font-medium text-[var(--foreground)]">{property.address.zipCode}</span>
                    </div>
                    {property.details.yearBuilt && (
                      <div className="flex justify-between p-[var(--spacing-sm)] bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="text-slate-500 dark:text-slate-400">Viti i ndërtimit:</span>
                        <span className="font-medium text-[var(--foreground)] flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-[var(--primary)]" />
                          {property.details.yearBuilt}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between p-[var(--spacing-sm)] bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-slate-500 dark:text-slate-400">Statusi:</span>
                      <span className="font-medium text-[var(--foreground)] capitalize">{property.status}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Enhanced Map and Location Section */}
              <div className="card border-none">
                {/* Map Tabs - Neighborhood now powered by OpenStreetMap */}
                <div className="border-b border-gray-200 dark:border-slate-800">
                  <div className="flex">
                    <button
                      onClick={() => setActiveMapTab('location')}
                      className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeMapTab === 'location'
                        ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'text-gray-500 hover:text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location & Map
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveMapTab('neighborhood')}
                      className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeMapTab === 'neighborhood'
                        ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'text-gray-500 hover:text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Home className="h-4 w-4" />
                        Neighborhood
                      </div>
                    </button>
                  </div>
                </div>

                {/* Map Content */}
                {activeMapTab === 'location' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[var(--primary)]" />
                        Property Location
                      </h3>
                      <div className="flex gap-2">
                        <ViewOnMapButton
                          property={property}
                          variant="primary"
                          size="sm"
                        />
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${property.address.coordinates.lat},${property.address.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 rounded-lg shadow-sm hover:shadow-md transition-all"
                        >
                          <Navigation className="h-4 w-4" />
                          Directions
                        </a>
                      </div>
                    </div>

                    {/* Mobile: lightweight static map preview to avoid heavy rendering and scroll */}
                    <div className="lg:hidden">
                      <StaticMapPreview
                        properties={[property, ...nearbyProperties].slice(0, 5)}
                        height={300}
                        width={640}
                        ctaHref="/map"
                      />
                    </div>

                    {/* Desktop: full interactive map */}
                    <div className="hidden lg:block">
                      <PropertyDetailMap
                        key={property.id}
                        property={property}
                        nearbyProperties={nearbyProperties}
                        height="500px"
                        showNeighborhood={true}
                        showDirections={true}
                      />
                    </div>
                  </div>
                )}

                {/* Neighborhood Content */}
                {activeMapTab === 'neighborhood' && (
                  <NeighborhoodInfo property={property} />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ContactForm
                propertyId={property.id}
                propertyTitle={property.title}
              />
              <div className="mt-8 sticky top-24">
                <MortgageCalculator price={property.price} />
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Floating Action Button */}
        <ViewOnMapFAB property={property} className="lg:hidden" />
      </article>
    </Layout>
  );
}
