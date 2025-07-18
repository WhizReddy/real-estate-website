'use client';

import { useState, useEffect } from 'react';
import { getProperties } from '@/lib/data';
import Layout from '@/components/Layout';
import PropertyGrid from '@/components/PropertyGrid';
import SearchFilters from '@/components/SearchFilters';
import CreativeLoader from '@/components/CreativeLoader';
import { Property } from '@/types';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const allProperties = await getProperties();
        // Filter out sold properties
        const activeProperties = allProperties.filter(
          property => property.status === 'active' || property.status === 'pending'
        );
        setProperties(activeProperties);
        setFilteredProperties(activeProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleFilteredResults = (filtered: Property[]) => {
    setFilteredProperties(filtered);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Të Gjitha Pasuritë</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <CreativeLoader type="properties" size="lg" />
          </div>
        ) : (
          <>
            <SearchFilters 
              properties={properties} 
              onFilteredResults={handleFilteredResults}
            />
            <PropertyGrid properties={filteredProperties} />
            
            {filteredProperties.length === 0 && properties.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nuk u gjetën pasuri që përputhen me kriteret tuaja të kërkimit.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Provoni të ndryshoni filtrat për të parë më shumë rezultate.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}