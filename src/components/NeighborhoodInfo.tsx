'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/types';
import { fetchNearbyPlacesCached, OSMPlace } from '@/lib/openstreetmap';
import { 
  School, 
  ShoppingCart, 
  Hospital, 
  Coffee,
  Car,
  Train,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface NeighborhoodInfoProps {
  property: Property;
  className?: string;
}

// Use OSMPlace from openstreetmap.ts, but extend with optional UI fields
interface NeighborhoodPlace extends OSMPlace {
  walkTime?: number;
  driveTime?: number;
  phone?: string;
  hours?: string;
  description?: string;
}

export default function NeighborhoodInfo({ property, className = '' }: NeighborhoodInfoProps) {
  const [activeCategory, setActiveCategory] = useState<string>('overview');
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NeighborhoodPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real nearby places from OpenStreetMap on mount
  useEffect(() => {
    const loadNearbyPlaces = async () => {
      setIsLoading(true);
      try {
        const places = await fetchNearbyPlacesCached(
          property.address.coordinates.lat,
          property.address.coordinates.lng,
          2, // 2km radius
          5  // 5 places per category
        );
        
        // Convert OSMPlace to NeighborhoodPlace with estimated walk/drive times
        const enhancedPlaces: NeighborhoodPlace[] = places.map(place => ({
          ...place,
          walkTime: Math.ceil(place.distance * 12), // ~12 min per km walking
          driveTime: Math.ceil(place.distance * 2),  // ~2 min per km driving
        }));
        
        setNearbyPlaces(enhancedPlaces);
      } catch (error) {
        console.error('Failed to load nearby places:', error);
        setNearbyPlaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNearbyPlaces();
  }, [property.address.coordinates.lat, property.address.coordinates.lng]);

  const categories = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'school', label: 'Schools', icon: School },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'hospital', label: 'Healthcare', icon: Hospital },
    { id: 'restaurant', label: 'Dining', icon: Coffee },
    { id: 'transport', label: 'Transport', icon: Train }
  ];

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'school': return School;
      case 'shopping': return ShoppingCart;
      case 'hospital': return Hospital;
      case 'restaurant': return Coffee;
      case 'transport': return Train;
      default: return MapPin;
    }
  };

  const filteredPlaces = activeCategory === 'overview' 
    ? nearbyPlaces 
    : nearbyPlaces.filter(place => place.type === activeCategory);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-50 ${className}`}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading neighborhood data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no places found
  if (nearbyPlaces.length === 0) {
    return (
      <div className={`bg-gray-50 ${className}`}>
        <div className="p-6 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No nearby places found</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => {
    // Calculate stats from real data
    const schoolPlaces = nearbyPlaces.filter(p => p.type === 'school');
    const avgDistance = nearbyPlaces.length > 0
      ? (nearbyPlaces.reduce((sum, p) => sum + p.distance, 0) / nearbyPlaces.length).toFixed(1)
      : 0;

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Education</h4>
            <div className="flex items-center gap-2 mb-2">
              <School className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Nearby Schools:</span>
              <span className="font-medium">{schoolPlaces.length}</span>
            </div>
            <p className="text-xs text-gray-500">
              Within 2km radius
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Accessibility</h4>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Avg. Distance:</span>
              <span className="font-medium">{avgDistance} km</span>
            </div>
            <p className="text-xs text-gray-500">
              To key amenities
            </p>
          </div>
        </div>

        {/* Top Places */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Nearby Highlights</h4>
          <div className="space-y-3">
            {nearbyPlaces.slice(0, 5).map((place) => {
              const IconComponent = getPlaceIcon(place.type);
              return (
                <div key={place.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <IconComponent className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{place.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{place.distance} km away</span>
                      {place.walkTime && <span>{place.walkTime} min walk</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPlacesList = () => (
    <div className="space-y-3">
      {filteredPlaces.map((place) => {
        const IconComponent = getPlaceIcon(place.type);
        const isExpanded = expandedPlace === place.id;
        
        return (
          <div key={place.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedPlace(isExpanded ? null : place.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{place.name}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {place.distance} km
                    </span>
                    {place.walkTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {place.walkTime} min walk
                      </span>
                    )}
                    {place.driveTime && (
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {place.driveTime} min drive
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-3 space-y-3">
                  {place.description && <p className="text-sm text-gray-600">{place.description}</p>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {place.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{place.address}</span>
                      </div>
                    )}
                    
                    {place.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{place.phone}</span>
                      </div>
                    )}
                    
                    {place.hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{place.hours}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Directions
                    </a>
                    
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(place.name + (place.address ? ' ' + place.address : ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      More Info
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`bg-gray-50 ${className}`}>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Neighborhood Information</h3>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.id;
              const count = category.id === 'overview' ? 0 : nearbyPlaces.filter(p => p.type === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.label}
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {activeCategory === 'overview' ? renderOverview() : renderPlacesList()}
      </div>
    </div>
  );
}