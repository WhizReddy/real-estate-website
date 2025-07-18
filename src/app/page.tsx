'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProperties } from '@/lib/data';
import { Property } from '@/types';
import SearchFilters from '@/components/SearchFilters';
import SearchResults from '@/components/SearchResults';
import MapView from '@/components/MapView';
import Layout from '@/components/Layout';
import StructuredData from '@/components/StructuredData';

export default function Home() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const properties = await getProperties();
        setAllProperties(properties);
        setFilteredProperties(properties);
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
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Duke ngarkuar pasuritë...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Gjeni Shtëpinë e <span className="text-red-600">Ëndrrave</span> Tuaja
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Zbuloni përzgjedhjen tonë ekskluzive të pasurive premium në Tiranë. 
                Partneri juaj i besuar për blerje, shitje dhe qira pasurie.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Filters */}
          <SearchFilters 
            properties={allProperties}
            onFilteredResults={handleFilteredResults}
          />

          {/* Properties and Map Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Results */}
            <div className="lg:col-span-2">
              <SearchResults 
                properties={filteredProperties}
                totalProperties={allProperties.length}
              />
            </div>

            {/* Map Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 Lokacionet e Pasurive
                </h3>
                <MapView 
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
      </div>
    </Layout>
  );
}