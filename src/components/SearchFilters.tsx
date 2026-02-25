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
import { getTranslation } from "@/lib/i18n";

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
    // Use a generous default; will sync to dataset maxPrice below
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

  const locale: "sq" | "en" =
    typeof navigator !== "undefined" &&
      navigator.language?.toLowerCase().startsWith("en")
      ? "en"
      : "sq";
  const t = (key: string) => getTranslation(key, locale);

  // Use ref to store the callback to prevent infinite loops
  const onFilteredResultsRef = useRef(onFilteredResults);
  onFilteredResultsRef.current = onFilteredResults;

  // Get unique values for filter options - memoized to prevent recalculation
  const uniqueCities = useMemo(
    () => [...new Set(properties.map((p) => p.address.city))].sort(),
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

  // Ensure initial priceRange.max aligns with dataset max to avoid pre-applied filtering
  useEffect(() => {
    if (!Number.isFinite(maxPrice) || maxPrice <= 0) return;
    setFilters((prev) => {
      // If max was the generic default (1,000,000) or larger than available max,
      // align it with the dataset so we don't inadvertently filter on first load.
      if (prev.priceRange.max === 1000000 || prev.priceRange.max > maxPrice) {
        return {
          ...prev,
          priceRange: { ...prev.priceRange, max: maxPrice },
        };
      }
      return prev;
    });
  }, [maxPrice]);

  // Memoized sorting function
  const sortProperties = useCallback(
    (properties: Property[], sortBy: string, sortOrder: "asc" | "desc") => {
      if (!sortBy) return properties;

      return [...properties].sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

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
          const comparison = (aValue as string).localeCompare(bValue as string);
          return sortOrder === "asc" ? comparison : -comparison;
        } else {
          // Numeric comparison for price, date, size
          const numA = aValue as number;
          const numB = bValue as number;
          if (numA < numB) return sortOrder === "asc" ? -1 : 1;
          if (numA > numB) return sortOrder === "asc" ? 1 : -1;
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

  // Optimized debounced effect with performance monitoring
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const startTime = performance.now();

      const filtered = filterProperties(properties, filters);
      const sorted = sortProperties(
        filtered,
        filters.sortBy,
        filters.sortOrder
      );

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Log performance for large datasets
      if (properties.length > 1000 && processingTime > 100) {
        console.warn(`Slow filter operation: ${processingTime.toFixed(2)}ms for ${properties.length} properties`);
      }

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
    <div className="card p-5 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 bg-[var(--background)]/95 backdrop-blur-xl transition-shadow duration-500 hover:shadow-2xl">
      {/* Search Bar */}
      <div className="relative mb-4">
        <label htmlFor="property-search" className="sr-only">
          Search properties
        </label>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        <input
          id="property-search"
          type="text"
          placeholder="Kërkoni pasuri..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          className="input-field pl-9 sm:pl-10"
          aria-label="Search properties by title, description, or location"
        />
      </div>

      {/* Filter Toggle Button and Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-[var(--foreground)] hover:text-[var(--primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 rounded-md px-2 py-1"
          aria-expanded={isExpanded}
          aria-controls="advanced-filters"
          aria-label={isExpanded ? t('advancedFilters') : t('advancedFilters')}
        >
          <Filter className="h-5 w-5 mr-2" aria-hidden="true" />
          <span className="font-medium">{t('advancedFilters')}</span>
          <span className="ml-2 text-sm text-gray-500" aria-hidden="true">
            {isExpanded ? "▲" : "▼"}
          </span>
        </button>

        <div className="flex items-center gap-4">
          {/* Sorting Controls */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <select
              id="sort-by"
              name="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-700 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-[var(--background)] text-[var(--foreground)]"
            >
              <option value="">{t('sortBy')}</option>
              <option value="price">{t('price')}</option>
              <option value="date">{t('dateAdded')}</option>
              <option value="size">{t('size')}</option>
              <option value="location">{t('locations')}</option>
            </select>

            {filters.sortBy && (
              <select
                id="sort-order"
                name="sortOrder"
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange(
                    "sortOrder",
                    e.target.value as "asc" | "desc"
                  )
                }
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-700 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="asc">
                  {filters.sortBy === "price"
                    ? t('cheapest')
                    : filters.sortBy === "date"
                      ? t('oldest')
                      : filters.sortBy === "size"
                        ? t('smallest')
                        : "A-Z"}
                </option>
                <option value="desc">
                  {filters.sortBy === "price"
                    ? t('mostExpensive')
                    : filters.sortBy === "date"
                      ? t('newest')
                      : filters.sortBy === "size"
                        ? t('largest')
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
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div
          id="advanced-filters"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-gray-200 dark:border-slate-800"
          role="region"
          aria-label="Advanced search filters"
        >
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              <Euro className="inline h-4 w-4 mr-1 text-[var(--primary)]" />
              {t('price')} (€)
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
                  className="input-field py-2 px-3"
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
                  className="input-field py-2 px-3"
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
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              <MapPin className="inline h-4 w-4 mr-1 text-[var(--primary)]" />
              {t('locations')}
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="input-field py-2 text-sm"
            >
              <option value="">{t('allCities')}</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              <Home className="inline h-4 w-4 mr-1 text-[var(--primary)]" />
              {t('allTypes')}
            </label>
            <select
              value={filters.propertyType[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleFilterChange("propertyType", val ? [val] : []);
              }}
              className="input-field py-2 text-sm"
            >
              <option value="">{t('allTypes')}</option>
              <option value="house">{t('house')}</option>
              <option value="apartment">{t('apartment')}</option>
              <option value="condo">{t('condo')}</option>
              <option value="townhouse">{t('townhouse')}</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              <Bed className="inline h-4 w-4 mr-1 text-[var(--primary)]" />
              {t('bedrooms')}
            </label>
            <select
              value={filters.bedrooms[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleFilterChange("bedrooms", val ? [val] : []);
              }}
              className="input-field py-2 text-sm"
            >
              <option value="">{t('anyNumber')}</option>
              <option value="1">{t('rooms1')}</option>
              <option value="2">{t('rooms2')}</option>
              <option value="3">{t('rooms3')}</option>
              <option value="4">{t('rooms4Plus')}</option>
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              <Bath className="inline h-4 w-4 mr-1 text-[var(--primary)]" />
              {t('bathrooms')}
            </label>
            <select
              value={filters.bathrooms[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleFilterChange("bathrooms", val ? [val] : []);
              }}
              className="input-field py-2 text-sm"
            >
              <option value="">{t('anyNumber')}</option>
              <option value="1">{t('baths1')}</option>
              <option value="2">{t('baths2')}</option>
              <option value="3">{t('baths3Plus')}</option>
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              💰 {t('allListings')}
            </label>
            <select
              value={filters.listingType[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleFilterChange("listingType", val ? [val] : []);
              }}
              className="input-field py-2 text-sm"
            >
              <option value="">{t('allListings')}</option>
              <option value="sale">{t('forSale')}</option>
              <option value="rent">{t('forRent')}</option>
            </select>
          </div>

          {/* Agent Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              👤 Agent
            </label>
            <select
              value={filters.agent}
              onChange={(e) => handleFilterChange("agent", e.target.value)}
              className="input-field py-2 text-sm"
            >
              <option value="">{t('allAgents')}</option>
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
