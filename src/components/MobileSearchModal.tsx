'use client';

import { useState, useEffect } from 'react';
import { X, Search, Filter, MapPin, Home, Euro, Bed, Bath } from 'lucide-react';
import { Property } from '@/types';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onFilteredResults: (filteredProperties: Property[]) => void;
}

interface MobileFilterState {
  searchTerm: string;
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  propertyType: string[];
  bedrooms: string[];
  bathrooms: string[];
  listingType: string[];
}

export default function MobileSearchModal({
  isOpen,
  onClose,
  properties,
  onFilteredResults,
}: MobileSearchModalProps) {
  const [filters, setFilters] = useState<MobileFilterState>({
    searchTerm: '',
    priceRange: { min: 0, max: 1000000 },
    location: '',
    propertyType: [],
    bedrooms: [],
    bathrooms: [],
    listingType: [],
  });

  const [activeTab, setActiveTab] = useState<'search' | 'filters'>('search');

  const maxPrice = Math.max(...properties.map((p) => p.price));

  // Apply filters
  useEffect(() => {
    if (!isOpen) return;

    const filtered = properties.filter((property) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          property.title.toLowerCase().includes(searchLower) ||
          property.description.toLowerCase().includes(searchLower) ||
          property.address.street.toLowerCase().includes(searchLower) ||
          property.address.city.toLowerCase().includes(searchLower) ||
          property.features.some((feature) =>
            feature.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Price range filter
      if (
        property.price < filters.priceRange.min ||
        property.price > filters.priceRange.max
      ) {
        return false;
      }

      // Location filter
      if (filters.location && property.address.city !== filters.location) {
        return false;
      }

      // Property type filter
      if (filters.propertyType.length > 0) {
        if (!filters.propertyType.includes(property.details.propertyType)) {
          return false;
        }
      }

      // Bedrooms filter
      if (filters.bedrooms.length > 0) {
        const matchesBedrooms = filters.bedrooms.some((bedroomFilter) => {
          const bedroomCount = parseInt(bedroomFilter);
          if (bedroomCount === 4) {
            return property.details.bedrooms >= 4;
          }
          return property.details.bedrooms === bedroomCount;
        });
        if (!matchesBedrooms) return false;
      }

      // Bathrooms filter
      if (filters.bathrooms.length > 0) {
        const matchesBathrooms = filters.bathrooms.some((bathroomFilter) => {
          const bathroomCount = parseInt(bathroomFilter);
          if (bathroomCount === 3) {
            return property.details.bathrooms >= 3;
          }
          return property.details.bathrooms === bathroomCount;
        });
        if (!matchesBathrooms) return false;
      }

      // Listing type filter
      if (filters.listingType.length > 0) {
        if (!filters.listingType.includes(property.listingType)) {
          return false;
        }
      }

      return true;
    });

    onFilteredResults(filtered);
  }, [filters, properties, onFilteredResults, isOpen]);

  const handleMultiSelectChange = (key: keyof MobileFilterState, value: string) => {
    setFilters((prev) => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [key]: newArray,
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      priceRange: { min: 0, max: maxPrice },
      location: '',
      propertyType: [],
      bedrooms: [],
      bathrooms: [],
      listingType: [],
    });
  };

  const uniqueCities = [...new Set(properties.map((p) => p.address.city))].sort();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute inset-x-0 top-0 bg-white rounded-b-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-lg font-semibold text-white">Kërkimi dhe Filtrat</h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            Kërkimi
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'filters'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Filter className="h-4 w-4 inline mr-2" />
            Filtrat
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kërkoni pasuri
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Shkruani fjalën kyçe..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Euro className="inline h-4 w-4 mr-1 text-blue-600" />
                  Çmimi (€)
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: {
                            ...prev.priceRange,
                            min: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={
                        filters.priceRange.max === maxPrice
                          ? ''
                          : filters.priceRange.max
                      }
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: {
                            ...prev.priceRange,
                            max: parseInt(e.target.value) || maxPrice,
                          },
                        }))
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Nga €{filters.priceRange.min.toLocaleString()} deri €
                    {filters.priceRange.max.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1 text-blue-600" />
                  Lokacioni
                </label>
                <select
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Të gjitha qytetet</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'filters' && (
            <div className="space-y-6">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Home className="inline h-4 w-4 mr-1 text-blue-600" />
                  Lloji i Pasurisë
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'house', label: 'Shtëpi' },
                    { value: 'apartment', label: 'Apartament' },
                    { value: 'condo', label: 'Kondo' },
                    { value: 'townhouse', label: 'Shtëpi në Qytet' },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        filters.propertyType.includes(type.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.propertyType.includes(type.value)}
                        onChange={() =>
                          handleMultiSelectChange('propertyType', type.value)
                        }
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Bed className="inline h-4 w-4 mr-1 text-blue-600" />
                  Dhomat e Gjumit
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '1', label: '1 dhomë' },
                    { value: '2', label: '2 dhoma' },
                    { value: '3', label: '3 dhoma' },
                    { value: '4', label: '4+ dhoma' },
                  ].map((bedroom) => (
                    <label
                      key={bedroom.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        filters.bedrooms.includes(bedroom.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.bedrooms.includes(bedroom.value)}
                        onChange={() =>
                          handleMultiSelectChange('bedrooms', bedroom.value)
                        }
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{bedroom.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Bath className="inline h-4 w-4 mr-1 text-blue-600" />
                  Banjot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '1', label: '1 banjo' },
                    { value: '2', label: '2 banjo' },
                    { value: '3', label: '3+ banjo' },
                  ].map((bathroom) => (
                    <label
                      key={bathroom.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        filters.bathrooms.includes(bathroom.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.bathrooms.includes(bathroom.value)}
                        onChange={() =>
                          handleMultiSelectChange('bathrooms', bathroom.value)
                        }
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{bathroom.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  💰 Lloji i Shitjes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'sale', label: 'Për Shitje' },
                    { value: 'rent', label: 'Me Qira' },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        filters.listingType.includes(type.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.listingType.includes(type.value)}
                        onChange={() =>
                          handleMultiSelectChange('listingType', type.value)
                        }
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={clearFilters}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Pastro Filtrat
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
            >
              Apliko Filtrat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}