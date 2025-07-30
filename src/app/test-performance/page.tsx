"use client";

import { useState, useEffect } from "react";
import SearchFilters from "@/components/SearchFilters";
import PropertyCard from "@/components/PropertyCard";
import { Property } from "@/types";
import { generateLargePropertyDataset, runPerformanceTests, PerformanceMonitor } from "@/utils/performance";

export default function PerformanceTestPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [datasetSize, setDatasetSize] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  const generateDataset = async (size: number) => {
    setIsLoading(true);
    
    const startTime = performance.now();
    const dataset = generateLargePropertyDataset(size);
    const endTime = performance.now();
    
    console.log(`Generated ${size} properties in ${(endTime - startTime).toFixed(2)}ms`);
    
    setProperties(dataset);
    setFilteredProperties(dataset);
    setIsLoading(false);
  };

  const runTests = async () => {
    setIsLoading(true);
    PerformanceMonitor.clearMeasurements();
    
    await runPerformanceTests();
    setPerformanceStats(PerformanceMonitor.getAllStats());
    
    setIsLoading(false);
  };

  useEffect(() => {
    generateDataset(datasetSize);
  }, [datasetSize]);

  const handleFilteredResults = (filtered: Property[]) => {
    setFilteredProperties(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Performance Testing Dashboard
          </h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Dataset Controls</h2>
            
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dataset Size
                </label>
                <select
                  value={datasetSize}
                  onChange={(e) => setDatasetSize(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value={100}>100 properties</option>
                  <option value={500}>500 properties</option>
                  <option value={1000}>1,000 properties</option>
                  <option value={2500}>2,500 properties</option>
                  <option value={5000}>5,000 properties</option>
                  <option value={10000}>10,000 properties</option>
                </select>
              </div>
              
              <button
                onClick={() => generateDataset(datasetSize)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate Dataset"}
              </button>
              
              <button
                onClick={runTests}
                disabled={isLoading || properties.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "Running Tests..." : "Run Performance Tests"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-700">Total Properties</div>
                <div className="text-2xl font-bold text-blue-600">
                  {properties.length.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-700">Filtered Results</div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredProperties.length.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-700">Filter Efficiency</div>
                <div className="text-2xl font-bold text-purple-600">
                  {properties.length > 0 
                    ? ((filteredProperties.length / properties.length) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            </div>
          </div>

          {performanceStats && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Performance Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(performanceStats).map(([key, stats]: [string, any]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded">
                    <div className="font-medium text-gray-700 mb-2">{key}</div>
                    <div className="space-y-1 text-sm">
                      <div>Count: {stats.count}</div>
                      <div>Avg: {stats.average.toFixed(2)}ms</div>
                      <div>Min: {stats.min.toFixed(2)}ms</div>
                      <div>Max: {stats.max.toFixed(2)}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Filters */}
        <SearchFilters
          properties={properties}
          onFilteredResults={handleFilteredResults}
        />

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Search Results ({filteredProperties.length.toLocaleString()} properties)
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.slice(0, 20).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
          
          {filteredProperties.length > 20 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Showing first 20 of {filteredProperties.length.toLocaleString()} results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}