"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Search,
  Filter,
  X,
  MapPin,
  Home,
  Euro,
  Bed,
  Bath,
  ArrowUpDown,
} from "lucide-react";
import { Property } from "@/types";

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
  propertyType: string[]; // Changed to array for multiple selection
  bedrooms: string[]; // Changed to array for multiple selection
  bathrooms: string[]; // Changed to array for multiple selection
  listingType: string[]; // Changed to array for multiple selection
  agent: string;
  sortBy: "price" | "date" | "size" | "location" | "";
  sortOrder: "asc" | "desc";
}

export default function SearchFilters({
  properties,
  onFilteredResults,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    priceRange: { min: 0, max: 1000000 },
    location: "",
    propertyType: [],
    bedrooms: [],
    bathrooms: [],
    listingType: [],
    agent: "",
    sortBy: "",
    sortOrder: "desc",
  });

  // Use ref to store the callback to prevent infinite loops
  const onFilteredResultsRef = useRef(onFilteredResults);
  onFilteredResultsRef.current = onFilteredResults;

  // Get unique values for filter options - memoized to prevent recalculation
  const uniqueCities = useMemo(
    () => [...new Set(properties.map((p) => p.address.city))].sort(),
    [properties]
  );
  const uniquePropertyTypes = useMemo(
    () => [...new Set(properties.map((p) => p.details.propertyType))].sort(),
    [properties]
  );
  const uniqueAgents = useMemo(() => {
    const agentMap = new Map();
    properties.forEach((p) => {
      if (p.agent && p.agent.id && p.agent.name) {
        agentMap.set(p.agent.id, p.agent);
      }
    });
    return Array.from(agentMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [properties]);
  const maxPrice = useMemo(
    () => Math.max(...properties.map((p) => p.price)),
    [properties]
  );

  // Memoized sorting function
  const sortProperties = useCallback(
    (properties: Property[], sortBy: string, sortOrder: "asc" | "desc") => {
      if (!sortBy) return properties;

      return [...properties].sort((a, b) => {
        let aValue: any;
        let bValue: unknown;

        switch (sortBy) {
          case "price":
            aValue = a.price;
            bValue = b.price;
            break;
          case "date":
            // Assuming createdAt exists, fallback to id for demo
            aValue = a.createdAt
              ? new Date(a.createdAt).getTime()
              : parseInt(a.id);
            bValue = b.createdAt
              ? new Date(b.createdAt).getTime()
              : parseInt(b.id);
            break;
          case "size":
            aValue = a.details.squareFootage || 0;
            bValue = b.details.squareFootage || 0;
            break;
          case "location":
            aValue = a.address.city;
            bValue = b.address.city;
            break;
          default:
            return 0;
        }

        if (sortBy === "location") {
          // String comparison for location
          const comparison = aValue.localeCompare(bValue);
          return sortOrder === "asc" ? comparison : -comparison;
        } else {
          // Numeric comparison for price, date, size
          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }
      });
    },
    []
  );

  // Memoized filter function to prevent recreation on every render
  const filterProperties = useCallback(
    (properties: Property[], filters: FilterState) => {
      return properties.filter((property) => {
        // Search term filter (title, description, address)
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

        // Property type filter (multiple selection)
        if (filters.propertyType.length > 0) {
          if (!filters.propertyType.includes(property.details.propertyType)) {
            return false;
          }
        }

        // Bedrooms filter (multiple selection)
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

        // Bathrooms filter (multiple selection)
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

        // Listing type filter (multiple selection)
        if (filters.listingType.length > 0) {
          if (!filters.listingType.includes(property.listingType)) {
            return false;
          }
        }

        // Agent filter
        if (
          filters.agent &&
          property.agent &&
          property.agent.id !== filters.agent
        ) {
          return false;
        }

        return true;
      });
    },
    []
  );

  // Debounced effect to prevent excessive filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = filterProperties(properties, filters);
      const sorted = sortProperties(
        filtered,
        filters.sortBy,
        filters.sortOrder
      );
      onFilteredResultsRef.current(sorted);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, properties, filterProperties, sortProperties]);

  const handleFilterChange = (key: keyof FilterState, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Helper function for handling multiple selections
  const handleMultiSelectChange = (key: keyof FilterState, value: string) => {
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

  const handlePriceRangeChange = (type: "min" | "max", value: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value,
      },
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      priceRange: { min: 0, max: maxPrice },
      location: "",
      propertyType: [],
      bedrooms: [],
      bathrooms: [],
      listingType: [],
      agent: "",
      sortBy: "",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < maxPrice ||
    filters.location ||
    filters.propertyType.length > 0 ||
    filters.bedrooms.length > 0 ||
    filters.bathrooms.length > 0 ||
    filters.listingType.length > 0 ||
    filters.agent;

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
        <input
          type="text"
          placeholder="Kërkoni pasuri..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle Button and Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Filter className="h-5 w-5 mr-2" />
          <span className="font-medium">Filtrat e Avancuara</span>
          <span className="ml-2 text-sm text-gray-500">
            {isExpanded ? "▲" : "▼"}
          </span>
        </button>

        <div className="flex items-center gap-4">
          {/* Sorting Controls */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Renditja</option>
              <option value="price">Çmimi</option>
              <option value="date">Data e Shtimit</option>
              <option value="size">Madhësia</option>
              <option value="location">Lokacioni</option>
            </select>

            {filters.sortBy && (
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange(
                    "sortOrder",
                    e.target.value as "asc" | "desc"
                  )
                }
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">
                  {filters.sortBy === "price"
                    ? "Më i lirë"
                    : filters.sortBy === "date"
                    ? "Më i vjetër"
                    : filters.sortBy === "size"
                    ? "Më i vogël"
                    : "A-Z"}
                </option>
                <option value="desc">
                  {filters.sortBy === "price"
                    ? "Më i shtrenjtë"
                    : filters.sortBy === "date"
                    ? "Më i ri"
                    : filters.sortBy === "size"
                    ? "Më i madh"
                    : "Z-A"}
                </option>
              </select>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Pastro Filtrat
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-gray-200">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Euro className="inline h-4 w-4 mr-1 text-blue-600" />
              Çmimi (€)
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min || ""}
                  onChange={(e) =>
                    handlePriceRangeChange("min", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={
                    filters.priceRange.max === maxPrice
                      ? ""
                      : filters.priceRange.max
                  }
                  onChange={(e) =>
                    handlePriceRangeChange(
                      "max",
                      parseInt(e.target.value) || maxPrice
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <MapPin className="inline h-4 w-4 mr-1 text-blue-600" />
              Lokacioni
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Të gjitha qytetet</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Home className="inline h-4 w-4 mr-1 text-blue-600" />
              Lloji i Pasurisë
            </label>
            <div className="space-y-2">
              {[
                { value: "house", label: "Shtëpi" },
                { value: "apartment", label: "Apartament" },
                { value: "condo", label: "Kondo" },
                { value: "townhouse", label: "Shtëpi në Qytet" },
              ].map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.propertyType.includes(type.value)}
                    onChange={() =>
                      handleMultiSelectChange("propertyType", type.value)
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Bed className="inline h-4 w-4 mr-1 text-blue-600" />
              Dhomat e Gjumit
            </label>
            <div className="space-y-2">
              {[
                { value: "1", label: "1 dhomë" },
                { value: "2", label: "2 dhoma" },
                { value: "3", label: "3 dhoma" },
                { value: "4", label: "4+ dhoma" },
              ].map((bedroom) => (
                <label key={bedroom.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.bedrooms.includes(bedroom.value)}
                    onChange={() =>
                      handleMultiSelectChange("bedrooms", bedroom.value)
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{bedroom.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Bath className="inline h-4 w-4 mr-1 text-blue-600" />
              Banjot
            </label>
            <div className="space-y-2">
              {[
                { value: "1", label: "1 banjo" },
                { value: "2", label: "2 banjo" },
                { value: "3", label: "3+ banjo" },
              ].map((bathroom) => (
                <label key={bathroom.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.bathrooms.includes(bathroom.value)}
                    onChange={() =>
                      handleMultiSelectChange("bathrooms", bathroom.value)
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {bathroom.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              💰 Lloji i Shitjes
            </label>
            <div className="space-y-2">
              {[
                { value: "sale", label: "Për Shitje" },
                { value: "rent", label: "Me Qira" },
              ].map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.listingType.includes(type.value)}
                    onChange={() =>
                      handleMultiSelectChange("listingType", type.value)
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Agent Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              👤 Agjenti
            </label>
            <select
              value={filters.agent}
              onChange={(e) => handleFilterChange("agent", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Të gjithë agjentët</option>
              {uniqueAgents.map((agent) => (
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
