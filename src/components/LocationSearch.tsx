'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Target, Navigation, X } from 'lucide-react';

interface LocationSearchProps {
  onLocationSelect: (location: {
    address: string;
    coordinates: { lat: number; lng: number };
    radius: number;
  }) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  id: string;
  address: string;
  coordinates: { lat: number; lng: number };
  type: 'address' | 'poi' | 'city';
  description?: string;
}

export default function LocationSearch({
  onLocationSelect,
  onClear,
  placeholder = "Search for a location...",
  className = ''
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [radius, setRadius] = useState(5);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock search results (in real app, this would use a geocoding API)
  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      address: 'Sheshi Skënderbej, Tiranë',
      coordinates: { lat: 41.3275, lng: 19.8187 },
      type: 'poi',
      description: 'Main square of Tirana'
    },
    {
      id: '2',
      address: 'Rruga e Durrësit, Tiranë',
      coordinates: { lat: 41.3317, lng: 19.8114 },
      type: 'address',
      description: 'Major street in Tirana'
    },
    {
      id: '3',
      address: 'Qendra Tregtare \"Tirana East Gate\"',
      coordinates: { lat: 41.3456, lng: 19.8543 },
      type: 'poi',
      description: 'Shopping center'
    },
    {
      id: '4',
      address: 'Universiteti i Tiranës',
      coordinates: { lat: 41.3193, lng: 19.8225 },
      type: 'poi',
      description: 'University of Tirana'
    },
    {
      id: '5',
      address: 'Parku i Madh, Tiranë',
      coordinates: { lat: 41.3167, lng: 19.8333 },
      type: 'poi',
      description: 'Grand Park of Tirana'
    }
  ];

  // Simulate search with debouncing
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const filteredResults = mockSearchResults.filter(result =>
          result.address.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
        );
        
        setResults(filteredResults);
        setShowResults(true);
        setIsLoading(false);
      }, 300);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (result: SearchResult) => {
    setSelectedLocation(result.address);
    setQuery(result.address);
    setShowResults(false);
    
    onLocationSelect({
      address: result.address,
      coordinates: result.coordinates,
      radius
    });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // In a real app, you'd reverse geocode to get the address
          const address = `Current Location (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`;
          
          setSelectedLocation(address);
          setQuery(address);
          setIsLoading(false);
          
          onLocationSelect({
            address,
            coordinates,
            radius
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
          alert('Unable to get your current location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedLocation('');
    setResults([]);
    setShowResults(false);
    if (onClear) {
      onClear();
    }
  };

  const getLocationIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'poi':
        return '📍';
      case 'city':
        return '🏙️';
      case 'address':
        return '🏠';
      default:
        return '📍';
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {selectedLocation && (
            <button
              onClick={handleClear}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear location"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleCurrentLocation}
            className="p-2 mr-1 text-blue-600 hover:text-blue-700 transition-colors"
            title="Use current location"
            disabled={isLoading}
          >
            <Target className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Radius Selector */}
      {selectedLocation && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700 font-medium">Search radius:</span>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => {
              const newRadius = parseInt(e.target.value);
              setRadius(newRadius);
              if (selectedLocation) {
                // Re-trigger the location selection with new radius
                const result = results.find(r => r.address === selectedLocation);
                if (result) {
                  onLocationSelect({
                    address: result.address,
                    coordinates: result.coordinates,
                    radius: newRadius
                  });
                }
              }
            }}
            className="flex-1 max-w-32"
          />
          <span className="text-sm text-blue-700 font-medium min-w-[3rem]">{radius} km</span>
        </div>
      )}

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleLocationSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{getLocationIcon(result.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {result.address}
                  </div>
                  {result.description && (
                    <div className="text-sm text-gray-500 truncate">
                      {result.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}
                  </div>
                </div>
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center">
          <div className="text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No locations found for "{query}"</p>
            <p className="text-xs text-gray-400 mt-1">Try searching for a different location</p>
          </div>
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Searching within {radius}km of: {selectedLocation}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}