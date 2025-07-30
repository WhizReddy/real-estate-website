"use client";

import { useState, useEffect, useCallback } from "react";
import { getProperties } from "@/lib/data";
import { Property } from "@/types";
import Layout from "@/components/Layout";
import StructuredData from "@/components/StructuredData";
import CreativeLoader from "@/components/CreativeLoader";
import Breadcrumbs from "@/components/Breadcrumbs";
import dynamic from "next/dynamic";
import { ArrowLeft, Filter, Search, MapPin, Home, Navigation } from "lucide-react";
import Link from "next/link";

// Dynamically import the FullMapView component
const DynamicFullMapView = dynamic(
  () => import("@/components/FullMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <CreativeLoader type="map" size="lg" />
      </div>
    ),
  }
);

interface MapFilters {
  priceRange: {
    min: number;
    max: number;
  };
  propertyType: string[];
  bedrooms: number[];
  bathrooms: number[];
  location: string;
  features: string[];
}

const defaultFilters: MapFilters = {
  priceRange: { min: 0, max: 1000000 },
  propertyType: [],
  bedrooms: [],
  bathrooms: [],
  location: "",
  features: [],
};

export default function MapPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState<MapFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const properties = await getProperties();
        // Filter out sold properties
        const activeProperties = properties.filter(
          (property) =>
            property.status === "active" || property.status === "pending"
        );

        setAllProperties(activeProperties);
        setFilteredProperties(activeProperties);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const applyFilters = useCallback((newFilters: MapFilters) => {
    const filtered = allProperties.filter((property) => {
      // Price range filter
      if (
        property.price < newFilters.priceRange.min ||
        property.price > newFilters.priceRange.max
      ) {
        return false;
      }

      // Property type filter
      if (
        newFilters.propertyType.length > 0 &&
        !newFilters.propertyType.includes(property.details.propertyType)
      ) {
        return false;
      }

      // Bedrooms filter
      if (
        newFilters.bedrooms.length > 0 &&
        !newFilters.bedrooms.includes(property.details.bedrooms)
      ) {
        return false;
      }

      // Bathrooms filter
      if (
        newFilters.bathrooms.length > 0 &&
        !newFilters.bathrooms.includes(property.details.bathrooms)
      ) {
        return false;
      }

      // Location filter
      if (
        newFilters.location &&
        !property.address.city.toLowerCase().includes(newFilters.location.toLowerCase()) &&
        !property.address.street.toLowerCase().includes(newFilters.location.toLowerCase())
      ) {
        return false;
      }

      // Features filter
      if (
        newFilters.features.length > 0 &&
        !newFilters.features.some((feature) =>
          property.features.includes(feature)
        )
      ) {
        return false;
      }

      return true;
    });

    setFilteredProperties(filtered);
  }, [allProperties]);

  const handleFilterChange = useCallback((newFilters: MapFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  }, [applyFilters]);

  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

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
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Kryesore</span>
              </Link>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">
                  Harta e Pasurive
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <span>{filteredProperties.length} pasuri</span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtrat</span>
              </button>
            </div>
          </div>
          
          {/* Breadcrumbs */}
          <Breadcrumbs />
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filtrat</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Çmimi (€)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          priceRange: {
                            ...filters.priceRange,
                            min: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max === 1000000 ? "" : filters.priceRange.max}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          priceRange: {
                            ...filters.priceRange,
                            max: parseInt(e.target.value) || 1000000,
                          },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lloji i Pasurisë
                  </label>
                  <div className="space-y-2">
                    {["house", "apartment", "condo", "townhouse"].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.propertyType.includes(type)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...filters.propertyType, type]
                              : filters.propertyType.filter((t) => t !== type);
                            handleFilterChange({
                              ...filters,
                              propertyType: newTypes,
                            });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {type === "house" && "Shtëpi"}
                          {type === "apartment" && "Apartament"}
                          {type === "condo" && "Kondo"}
                          {type === "townhouse" && "Shtëpi në Qytet"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dhoma Gjumi
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          const newBedrooms = filters.bedrooms.includes(num)
                            ? filters.bedrooms.filter((b) => b !== num)
                            : [...filters.bedrooms, num];
                          handleFilterChange({
                            ...filters,
                            bedrooms: newBedrooms,
                          });
                        }}
                        className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                          filters.bedrooms.includes(num)
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokacioni
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Kërko sipas qytetit ose rrugës..."
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          location: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setFilters(defaultFilters);
                    handleFilterChange(defaultFilters);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Pastro Filtrat
                </button>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 relative">
            <DynamicFullMapView
              properties={filteredProperties}
              filters={filters}
              onFilterChange={handleFilterChange}
              onPropertySelect={handlePropertySelect}
              selectedProperty={selectedProperty}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}