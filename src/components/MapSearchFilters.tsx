'use client';

import { useState, useEffect, useCallback } from 'react';
import { Property } from '@/types';
import { 
  Search, 
  DollarSign, 
  ChevronDown,
  ChevronUp,
  Target,
  Bookmark,
  Sparkles,
  Users,
  Building2,
  TrendingUp
} from 'lucide-react';

interface MapSearchFiltersProps {
  properties: Property[];
  onFilteredPropertiesChange: (filteredProperties: Property[]) => void;
  onSearchLocationChange?: (location: { lat: number; lng: number; radius: number }) => void;
  className?: string;
}

interface FilterState {
  searchQuery: string;
  priceRange: {
    min: number;
    max: number;
  };
  propertyType: string[];
  bedrooms: {
    min: number;
    max: number;
  };
  bathrooms: {
    min: number;
    max: number;
  };
  squareFootage: {
    min: number;
    max: number;
  };
  yearBuilt: {
    min: number;
    max: number;
  };
  listingType: string[];
  features: string[];
  locationSearch: {
    enabled: boolean;
    center: { lat: number; lng: number } | null;
    radius: number; // in kilometers
  };
}

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<FilterState>;
  icon: string;
}

export default function MapSearchFilters({
  properties,
  onFilteredPropertiesChange,
  onSearchLocationChange,
  className = ''
}: MapSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<FilterPreset[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    priceRange: {
      min: 0,
      max: 1000000
    },
    propertyType: [],
    bedrooms: {
      min: 0,
      max: 10
    },
    bathrooms: {
      min: 0,
      max: 10
    },
    squareFootage: {
      min: 0,
      max: 1000
    },
    yearBuilt: {
      min: 1900,
      max: new Date().getFullYear()
    },
    listingType: [],
    features: [],
    locationSearch: {
      enabled: false,
      center: null,
      radius: 5
    }
  });

  // Predefined filter presets
  const filterPresets: FilterPreset[] = [
    {
      id: 'affordable',
      name: 'Affordable Homes',
      description: 'Properties under €150,000',
      icon: 'DollarSign',
      filters: {
        priceRange: { min: 0, max: 150000 },
        propertyType: ['house', 'apartment']
      }
    },
    {
      id: 'luxury',
      name: 'Luxury Properties',
      description: 'High-end properties over €500,000',
      icon: 'Sparkles',
      filters: {
        priceRange: { min: 500000, max: 1000000 },
        squareFootage: { min: 200, max: 1000 },
        bedrooms: { min: 3, max: 10 }
      }
    },
    {
      id: 'family',
      name: 'Family Homes',
      description: '3+ bedrooms, family-friendly',
      icon: 'Users',
      filters: {
        bedrooms: { min: 3, max: 10 },
        bathrooms: { min: 2, max: 10 },
        propertyType: ['house', 'townhouse']
      }
    },
    {
      id: 'modern',
      name: 'Modern Properties',
      description: 'Recently built (2010+)',
      icon: 'Building2',
      filters: {
        yearBuilt: { min: 2010, max: new Date().getFullYear() },
        features: ['modern kitchen', 'air conditioning']
      }
    },
    {
      id: 'investment',
      name: 'Investment Properties',
      description: 'Great for rental income',
      icon: 'TrendingUp',
      filters: {
        propertyType: ['apartment', 'condo'],
        priceRange: { min: 100000, max: 300000 },
        squareFootage: { min: 50, max: 150 }
      }
    }
  ];

  // Get unique values from properties for filter options
  const getUniquePropertyTypes = () => {
    return [...new Set(properties.map(p => p.details.propertyType))];
  };

  const getUniqueFeatures = () => {
    return [...new Set(properties.flatMap(p => p.features))];
  };

  const getPriceRange = () => {
    const prices = properties.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  const getSquareFootageRange = () => {
    const sizes = properties.map(p => p.details.squareFootage);
    return {
      min: Math.min(...sizes),
      max: Math.max(...sizes)
    };
  };

  // Sync initial range filters with actual data whenever the properties list changes
  useEffect(() => {
    if (!properties || properties.length === 0) return;
    const priceValues = properties.map(p => p.price);
    const sizeValues = properties.map(p => p.details.squareFootage);
    const yearValues = properties.map(p => p.details.yearBuilt || new Date().getFullYear());

    const priceMin = Math.min(...priceValues);
    const priceMax = Math.max(...priceValues);
    const sizeMin = Math.min(...sizeValues);
    const sizeMax = Math.max(...sizeValues);
    const yearMin = Math.min(...yearValues);
    const yearMax = Math.max(...yearValues);

    setFilters(prev => ({
      ...prev,
      priceRange: { min: priceMin, max: priceMax },
      squareFootage: { min: sizeMin, max: sizeMax },
      yearBuilt: { min: yearMin, max: yearMax }
    }));
  }, [properties]);

  // Filter properties based on current filter state
  const filterProperties = useCallback((filterState: FilterState) => {
    let filtered = properties;

    // Text search
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query) ||
        property.address.street.toLowerCase().includes(query) ||
        property.address.city.toLowerCase().includes(query) ||
        property.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Price range
    filtered = filtered.filter(property => 
      property.price >= filterState.priceRange.min && 
      property.price <= filterState.priceRange.max
    );

    // Property type
    if (filterState.propertyType.length > 0) {
      filtered = filtered.filter(property => 
        filterState.propertyType.includes(property.details.propertyType)
      );
    }

    // Bedrooms
    filtered = filtered.filter(property => 
      property.details.bedrooms >= filterState.bedrooms.min && 
      property.details.bedrooms <= filterState.bedrooms.max
    );

    // Bathrooms
    filtered = filtered.filter(property => 
      property.details.bathrooms >= filterState.bathrooms.min && 
      property.details.bathrooms <= filterState.bathrooms.max
    );

    // Square footage
    filtered = filtered.filter(property => 
      property.details.squareFootage >= filterState.squareFootage.min && 
      property.details.squareFootage <= filterState.squareFootage.max
    );

    // Year built
    if (filterState.yearBuilt.min > 1900 || filterState.yearBuilt.max < new Date().getFullYear()) {
      filtered = filtered.filter(property => {
        const year = property.details.yearBuilt || new Date().getFullYear();
        return year >= filterState.yearBuilt.min && year <= filterState.yearBuilt.max;
      });
    }

    // Listing type
    if (filterState.listingType.length > 0) {
      filtered = filtered.filter(property => 
        filterState.listingType.includes(property.listingType)
      );
    }

    // Features
    if (filterState.features.length > 0) {
      filtered = filtered.filter(property => 
        filterState.features.every(feature => 
          property.features.some(pFeature => 
            pFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    // Location-based search
    if (filterState.locationSearch.enabled && filterState.locationSearch.center) {
      filtered = filtered.filter(property => {
        const distance = calculateDistance(
          filterState.locationSearch.center!,
          property.address.coordinates
        );
        return distance <= filterState.locationSearch.radius;
      });
    }

    return filtered;
  }, [properties]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Update filtered properties when filters change
  useEffect(() => {
    const filteredProperties = filterProperties(filters);
    onFilteredPropertiesChange(filteredProperties);
  }, [filters, filterProperties, onFilteredPropertiesChange]);

  // Handle filter changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setActivePreset(null); // Clear active preset when manually changing filters
  };

  // Apply preset filters
  const applyPreset = (preset: FilterPreset) => {
    setFilters(prev => ({
      ...prev,
      ...preset.filters
    }));
    setActivePreset(preset.id);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      priceRange: {
        min: 0,
        max: 1000000
      },
      propertyType: [],
      bedrooms: {
        min: 0,
        max: 10
      },
      bathrooms: {
        min: 0,
        max: 10
      },
      squareFootage: {
        min: 0,
        max: 1000
      },
      yearBuilt: {
        min: 1900,
        max: new Date().getFullYear()
      },
      listingType: [],
      features: [],
      locationSearch: {
        enabled: false,
        center: null,
        radius: 5
      }
    });
    setActivePreset(null);
  };

  // Save current filters as preset
  const saveCurrentFilters = () => {
    const name = prompt('Enter a name for this filter preset:');
    if (name) {
      const newPreset: FilterPreset = {
        id: `custom_${Date.now()}`,
        name,
        description: 'Custom saved filter',
        icon: 'Bookmark',
        filters: { ...filters }
      };
      setSavedFilters(prev => [...prev, newPreset]);
    }
  };

  // Enable location search
  const enableLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          updateFilter('locationSearch', {
            enabled: true,
            center,
            radius: filters.locationSearch.radius
          });
          if (onSearchLocationChange) {
            onSearchLocationChange({
              ...center,
              radius: filters.locationSearch.radius
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const filteredCount = filterProperties(filters).length;

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Advanced Search & Filters</h3>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {filteredCount} properties
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            id="search-query"
            name="searchQuery"
            placeholder="Search by title, description, location, or features..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Presets */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          {filterPresets.map((preset) => {
            const IconComponent = {
              'DollarSign': DollarSign,
              'Sparkles': Sparkles,
              'Users': Users,
              'Building2': Building2,
              'TrendingUp': TrendingUp
            }[preset.icon] || DollarSign;
            
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePreset === preset.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={preset.description}
              >
                <IconComponent className="h-4 w-4" />
                {preset.name}
              </button>
            );
          })}
          {savedFilters.map((preset) => {
            const SavedIconComponent = {
              'Bookmark': Bookmark,
              'DollarSign': DollarSign,
              'Sparkles': Sparkles,
              'Users': Users,
              'Building2': Building2,
              'TrendingUp': TrendingUp
            }[preset.icon] || Bookmark;
            
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePreset === preset.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
                title={preset.description}
              >
                <SavedIconComponent className="h-4 w-4" />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Location Search */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Location Search</label>
              <button
                onClick={enableLocationSearch}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Target className="h-3 w-3" />
                Use My Location
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="location-search-enabled"
                  name="locationSearchEnabled"
                  checked={filters.locationSearch.enabled}
                  onChange={(e) => updateFilter('locationSearch', {
                    ...filters.locationSearch,
                    enabled: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Enable location-based search</span>
              </label>
              {filters.locationSearch.enabled && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Radius:</span>
                  <input
                    type="range"
                    id="location-radius"
                    name="locationRadius"
                    min="1"
                    max="50"
                    value={filters.locationSearch.radius}
                    onChange={(e) => updateFilter('locationSearch', {
                      ...filters.locationSearch,
                      radius: parseInt(e.target.value)
                    })}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">{filters.locationSearch.radius} km</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range: €{filters.priceRange.min.toLocaleString()} - €{filters.priceRange.max.toLocaleString()}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="price-min"
                name="priceMin"
                min={getPriceRange().min}
                max={getPriceRange().max}
                value={filters.priceRange.min}
                onChange={(e) => updateFilter('priceRange', {
                  ...filters.priceRange,
                  min: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <input
                type="range"
                id="price-max"
                name="priceMax"
                min={getPriceRange().min}
                max={getPriceRange().max}
                value={filters.priceRange.max}
                onChange={(e) => updateFilter('priceRange', {
                  ...filters.priceRange,
                  max: parseInt(e.target.value)
                })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {getUniquePropertyTypes().map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`property-type-${type}`}
                    name="propertyType"
                    checked={filters.propertyType.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilter('propertyType', [...filters.propertyType, type]);
                      } else {
                        updateFilter('propertyType', filters.propertyType.filter(t => t !== type));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Listing Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="listing-type-sale"
                  name="listingType"
                  checked={filters.listingType.includes('sale')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFilter('listingType', [...filters.listingType, 'sale']);
                    } else {
                      updateFilter('listingType', filters.listingType.filter(t => t !== 'sale'));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">For Sale</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="listing-type-rent"
                  name="listingType"
                  checked={filters.listingType.includes('rent')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFilter('listingType', [...filters.listingType, 'rent']);
                    } else {
                      updateFilter('listingType', filters.listingType.filter(t => t !== 'rent'));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">For Rent</span>
              </label>
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Bedrooms: {filters.bedrooms.min} - {filters.bedrooms.max}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id="bedrooms-min"
                  name="bedroomsMin"
                  min="0"
                  max="10"
                  value={filters.bedrooms.min}
                  onChange={(e) => updateFilter('bedrooms', {
                    ...filters.bedrooms,
                    min: parseInt(e.target.value)
                  })}
                  className="flex-1"
                />
                <input
                  type="range"
                  id="bedrooms-max"
                  name="bedroomsMax"
                  min="0"
                  max="10"
                  value={filters.bedrooms.max}
                  onChange={(e) => updateFilter('bedrooms', {
                    ...filters.bedrooms,
                    max: parseInt(e.target.value)
                  })}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Bathrooms: {filters.bathrooms.min} - {filters.bathrooms.max}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id="bathrooms-min"
                  name="bathroomsMin"
                  min="0"
                  max="10"
                  value={filters.bathrooms.min}
                  onChange={(e) => updateFilter('bathrooms', {
                    ...filters.bathrooms,
                    min: parseInt(e.target.value)
                  })}
                  className="flex-1"
                />
                <input
                  type="range"
                  id="bathrooms-max"
                  name="bathroomsMax"
                  min="0"
                  max="10"
                  value={filters.bathrooms.max}
                  onChange={(e) => updateFilter('bathrooms', {
                    ...filters.bathrooms,
                    max: parseInt(e.target.value)
                  })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Square Footage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Square Footage: {filters.squareFootage.min}m² - {filters.squareFootage.max}m²
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="square-footage-min"
                name="squareFootageMin"
                min={getSquareFootageRange().min}
                max={getSquareFootageRange().max}
                value={filters.squareFootage.min}
                onChange={(e) => updateFilter('squareFootage', {
                  ...filters.squareFootage,
                  min: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <input
                type="range"
                id="square-footage-max"
                name="squareFootageMax"
                min={getSquareFootageRange().min}
                max={getSquareFootageRange().max}
                value={filters.squareFootage.max}
                onChange={(e) => updateFilter('squareFootage', {
                  ...filters.squareFootage,
                  max: parseInt(e.target.value)
                })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Year Built */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Year Built: {filters.yearBuilt.min} - {filters.yearBuilt.max}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="year-built-min"
                name="yearBuiltMin"
                min="1900"
                max={new Date().getFullYear()}
                value={filters.yearBuilt.min}
                onChange={(e) => updateFilter('yearBuilt', {
                  ...filters.yearBuilt,
                  min: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <input
                type="range"
                id="year-built-max"
                name="yearBuiltMax"
                min="1900"
                max={new Date().getFullYear()}
                value={filters.yearBuilt.max}
                onChange={(e) => updateFilter('yearBuilt', {
                  ...filters.yearBuilt,
                  max: parseInt(e.target.value)
                })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {getUniqueFeatures().slice(0, 20).map((feature) => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`feature-${feature}`}
                    name="features"
                    checked={filters.features.includes(feature)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilter('features', [...filters.features, feature]);
                      } else {
                        updateFilter('features', filters.features.filter(f => f !== feature));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 capitalize">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Filters */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={saveCurrentFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Bookmark className="h-4 w-4" />
              Save Current Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}