'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Filter, X, MapPin, Home, Euro, Bed, Bath } from 'lucide-react';
import { Property } from '@/types';

interface SearchFiltersProps {
  properties: Property[];
  onFilteredResults: (filteredProperties: Property[]) => void;
}

interface FilterState {
  searchTerm: string;
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  listingType: string;
  agent: string;
}

export default function SearchFilters({ properties, onFilteredResults }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    priceRange: { min: 0, max: 1000000 },
    location: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    listingType: '',
    agent: '',
  });

  // Use ref to store the callback to prevent infinite loops
  const onFilteredResultsRef = useRef(onFilteredResults);
  onFilteredResultsRef.current = onFilteredResults;

  // Get unique values for filter options - memoized to prevent recalculation
  const uniqueCities = useMemo(() => 
    [...new Set(properties.map(p => p.address.city))].sort(), 
    [properties]
  );
  const uniquePropertyTypes = useMemo(() => 
    [...new Set(properties.map(p => p.details.propertyType))].sort(), 
    [properties]
  );
  const uniqueAgents = useMemo(() => {
    const agentMap = new Map();
    properties.forEach(p => {
      if (p.agent && p.agent.id && p.agent.name) {
        agentMap.set(p.agent.id, p.agent);
      }
    });
    return Array.from(agentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [properties]);
  const maxPrice = useMemo(() => 
    Math.max(...properties.map(p => p.price)), 
    [properties]
  );

  // Memoized filter function to prevent recreation on every render
  const filterProperties = useCallback((properties: Property[], filters: FilterState) => {
    return properties.filter(property => {
      // Search term filter (title, description, address)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          property.title.toLowerCase().includes(searchLower) ||
          property.description.toLowerCase().includes(searchLower) ||
          property.address.street.toLowerCase().includes(searchLower) ||
          property.address.city.toLowerCase().includes(searchLower) ||
          property.features.some(feature => feature.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Price range filter
      if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) {
        return false;
      }

      // Location filter
      if (filters.location && property.address.city !== filters.location) {
        return false;
      }

      // Property type filter
      if (filters.propertyType && property.details.propertyType !== filters.propertyType) {
        return false;
      }

      // Bedrooms filter
      if (filters.bedrooms) {
        const bedroomCount = parseInt(filters.bedrooms);
        if (bedroomCount === 4 && property.details.bedrooms < 4) return false;
        if (bedroomCount !== 4 && property.details.bedrooms !== bedroomCount) return false;
      }

      // Bathrooms filter
      if (filters.bathrooms) {
        const bathroomCount = parseInt(filters.bathrooms);
        if (bathroomCount === 3 && property.details.bathrooms < 3) return false;
        if (bathroomCount !== 3 && property.details.bathrooms !== bathroomCount) return false;
      }

      // Listing type filter
      if (filters.listingType && property.listingType !== filters.listingType) {
        return false;
      }

      // Agent filter
      if (filters.agent && property.agent && property.agent.id !== filters.agent) {
        return false;
      }

      return true;
    });
  }, []);

  // Debounced effect to prevent excessive filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = filterProperties(properties, filters);
      onFilteredResultsRef.current(filtered);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, properties, filterProperties]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      priceRange: { min: 0, max: maxPrice },
      location: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      listingType: '',
      agent: '',
    });
  };

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < maxPrice ||
    filters.location ||
    filters.propertyType ||
    filters.bedrooms ||
    filters.bathrooms ||
    filters.listingType ||
    filters.agent;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
        <input
          type="text"
          placeholder="Kërkoni pasuri..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
        >
          <Filter className="h-5 w-5 mr-2" />
          <span className="font-medium">Filtrat e Avancuara</span>
          <span className="ml-2 text-sm text-gray-500">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center text-red-600 hover:text-red-700 text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Pastro Filtrat
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-gray-200">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Euro className="inline h-4 w-4 mr-1 text-red-600" />
              Çmimi (€)
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max === maxPrice ? '' : filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value) || maxPrice)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="text-xs text-gray-500">
                Nga €{filters.priceRange.min.toLocaleString()} deri €{filters.priceRange.max.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <MapPin className="inline h-4 w-4 mr-1 text-red-600" />
              Lokacioni
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Të gjitha qytetet</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Home className="inline h-4 w-4 mr-1 text-red-600" />
              Lloji i Pasurisë
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Të gjitha llojet</option>
              <option value="house">Shtëpi</option>
              <option value="apartment">Apartament</option>
              <option value="condo">Kondo</option>
              <option value="townhouse">Shtëpi në Qytet</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Bed className="inline h-4 w-4 mr-1 text-red-600" />
              Dhomat e Gjumit
            </label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Çdo numër</option>
              <option value="1">1 dhomë</option>
              <option value="2">2 dhoma</option>
              <option value="3">3 dhoma</option>
              <option value="4">4+ dhoma</option>
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Bath className="inline h-4 w-4 mr-1 text-red-600" />
              Banjot
            </label>
            <select
              value={filters.bathrooms}
              onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Çdo numër</option>
              <option value="1">1 banjo</option>
              <option value="2">2 banjo</option>
              <option value="3">3+ banjo</option>
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              💰 Lloji i Shitjes
            </label>
            <select
              value={filters.listingType}
              onChange={(e) => handleFilterChange('listingType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Të gjitha</option>
              <option value="sale">Për Shitje</option>
              <option value="rent">Me Qira</option>
            </select>
          </div>

          {/* Agent Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              👤 Agjenti
            </label>
            <select
              value={filters.agent}
              onChange={(e) => handleFilterChange('agent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Të gjithë agjentët</option>
              {uniqueAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}