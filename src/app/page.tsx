'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProperties } from '@/lib/data';
import { Property } from '@/types';
// Removed direct imports - using dynamic imports instead
import ClientOnlyMapView from '@/components/ClientOnlyMapView';
import Layout from '@/components/Layout';
import StructuredData from '@/components/StructuredData';
import CreativeLoader from '@/components/CreativeLoader';
import MobileFloatingActions from '@/components/MobileFloatingActions';
import MobileSearchModal from '@/components/MobileSearchModal';
import dynamic from 'next/dynamic';

// Dynamically import interactive components to prevent SSR issues
const DynamicSearchFilters = dynamic(() => import('@/components/SearchFilters'), {
  ssr: false,
  loading: () => <div className="h-32 bg-white rounded-lg shadow-md animate-pulse"></div>
});

const DynamicSearchResults = dynamic(() => import('@/components/SearchResults'), {
  ssr: false,
  loading: () => <div className="h-96 bg-white rounded-lg shadow-md animate-pulse"></div>
});

const PROPERTIES_PER_PAGE = 9; // Show 9 properties per page for better performance
const MAX_INITIAL_LOAD = 18; // Maximum properties to load initially

export default function Home() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const properties = await getProperties();
        // Filter out sold properties from the main page
        const activeProperties = properties.filter(
          property => property.status === 'active' || property.status === 'pending'
        );
        
        // Limit initial load to prevent overwhelming the page
        const limitedProperties = activeProperties.slice(0, MAX_INITIAL_LOAD);
        
        setAllProperties(activeProperties);
        setFilteredProperties(limitedProperties);
        // Show first page of properties
        setDisplayedProperties(limitedProperties.slice(0, PROPERTIES_PER_PAGE));
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleFilteredResults = useCallback((filtered: Property[]) => {
    setFilteredProperties(filtered);
    setDisplayedProperties(filtered.slice(0, PROPERTIES_PER_PAGE));
    setCurrentPage(1);
  }, []);

  const loadMoreProperties = useCallback(() => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * PROPERTIES_PER_PAGE;
      const newDisplayedProperties = filteredProperties.slice(startIndex, endIndex);
      
      setDisplayedProperties(newDisplayedProperties);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }, 500);
  }, [currentPage, filteredProperties, isLoadingMore]);

  const hasMoreProperties = displayedProperties.length < filteredProperties.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <CreativeLoader type="properties" size="lg" />
      </div>
    );
  }

  return (
    <Layout>
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Royal Blue Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
                  🏠 Pasuritë Premium të Tiranës
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Gjeni Shtëpinë e{' '}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Ëndrrave
                  </span>{' '}
                  Tuaja
                </h1>
                <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Zbuloni përzgjedhjen tonë ekskluzive të pasurive premium në Tiranë. 
                  Partneri juaj i besuar për blerje, shitje dhe qira pasurie.
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{allProperties.length}+</div>
                  <div className="text-white/80 text-sm">Pasuri të Disponueshme</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">5★</div>
                  <div className="text-white/80 text-sm">Vlerësim Klientësh</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-white/80 text-sm">Mbështetje</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave Bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12 fill-gray-50">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
            </svg>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Filters */}
          <DynamicSearchFilters 
            properties={allProperties}
            onFilteredResults={handleFilteredResults}
          />

          {/* Performance Notice */}
          {allProperties.length > MAX_INITIAL_LOAD && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">📊 Performancë e optimizuar:</span> Po shfaqen {Math.min(filteredProperties.length, MAX_INITIAL_LOAD)} pasuri nga {allProperties.length} gjithsej për performancë më të mirë. Përdorni filtrat për të gjetur pasuritë që ju interesojnë.
              </p>
            </div>
          )}

          {/* Properties and Map Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Results */}
            <div className="lg:col-span-2">
              <DynamicSearchResults 
                properties={displayedProperties}
                totalProperties={filteredProperties.length}
                hasMore={hasMoreProperties}
                onLoadMore={loadMoreProperties}
                isLoadingMore={isLoadingMore}
              />
            </div>

            {/* Map Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 Lokacionet e Pasurive
                </h3>
                <ClientOnlyMapView 
                  properties={filteredProperties} 
                  height="600px"
                />
                
                {filteredProperties.length !== allProperties.length && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Harta tregon:</span> {filteredProperties.length} pasuri të filtruara
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Kontaktoni Me Ne</h2>
              <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                Jemi këtu për t'ju ndihmuar të gjeni pasurinë perfekte. Kontaktoni me ne sot!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Telefoni</h3>
                <p className="text-blue-200 mb-4">Na telefononi çdo kohë</p>
                <a href="tel:+35569123456" className="text-blue-300 hover:text-white transition-colors">
                  +355 69 123 4567
                </a>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
                <p className="text-blue-200 mb-4">Dërgoni një email</p>
                <a href="mailto:info@realestate-tirana.al" className="text-blue-300 hover:text-white transition-colors">
                  info@realestate-tirana.al
                </a>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Lokacioni</h3>
                <p className="text-blue-200 mb-4">Vizitoni zyrën tonë</p>
                <p className="text-blue-300">
                  Rruga "Dëshmorët e Kombit"<br />
                  Tiranë, Shqipëri
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Components */}
        <MobileFloatingActions 
          onFilterToggle={() => setShowMobileSearch(true)}
          onMapToggle={() => setShowMobileMap(true)}
          showMapToggle={true}
        />

        <MobileSearchModal
          isOpen={showMobileSearch}
          onClose={() => setShowMobileSearch(false)}
          properties={allProperties}
          onFilteredResults={handleFilteredResults}
        />

        {/* Mobile Map Modal */}
        {showMobileMap && (
          <div className="fixed inset-0 z-50 bg-white md:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-lg font-semibold text-white">Harta e Pasurive</h2>
                <button
                  onClick={() => setShowMobileMap(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1">
                <ClientOnlyMapView 
                  properties={filteredProperties} 
                  height="100%"
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  {filteredProperties.length} pasuri në hartë
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}