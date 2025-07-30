'use client';

import { useState } from 'react';
import { Property } from '@/types';
import { 
  School, 
  ShoppingCart, 
  Hospital, 
  Coffee,
  Car,
  Train,
  MapPin,
  Star,
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

interface NeighborhoodPlace {
  id: string;
  name: string;
  type: 'school' | 'shopping' | 'hospital' | 'restaurant' | 'transport' | 'park';
  distance: number;
  walkTime: number;
  driveTime: number;
  rating?: number;
  address: string;
  phone?: string;
  hours?: string;
  description?: string;
  coordinates: { lat: number; lng: number };
}

interface NeighborhoodStats {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  crimeRate: 'low' | 'medium' | 'high';
  schoolRating: number;
  averageCommute: number;
}

export default function NeighborhoodInfo({ property, className = '' }: NeighborhoodInfoProps) {
  const [activeCategory, setActiveCategory] = useState<string>('overview');
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null);

  // Mock data - in real app, this would come from APIs
  const neighborhoodStats: NeighborhoodStats = {
    walkScore: 78,
    transitScore: 65,
    bikeScore: 72,
    crimeRate: 'low',
    schoolRating: 4.2,
    averageCommute: 25
  };

  const nearbyPlaces: NeighborhoodPlace[] = [
    {
      id: '1',
      name: 'Shkolla e Mesme \"Fan Noli\"',
      type: 'school',
      distance: 0.3,
      walkTime: 4,
      driveTime: 2,
      rating: 4.2,
      address: 'Rruga Dëshmorët e Kombit, Tiranë',
      phone: '+355 4 123 4567',
      hours: '8:00 - 16:00',
      description: 'Shkollë e mesme me reputacion të mirë dhe programe të avancuara.',
      coordinates: { lat: property.address.coordinates.lat + 0.002, lng: property.address.coordinates.lng + 0.001 }
    },
    {
      id: '2',
      name: 'Qendra Tregtare \"Tirana East Gate\"',
      type: 'shopping',
      distance: 0.8,
      walkTime: 10,
      driveTime: 4,
      rating: 4.5,
      address: 'Autostrada Tiranë-Durrës, Tiranë',
      phone: '+355 4 234 5678',
      hours: '10:00 - 22:00',
      description: 'Qendër tregtare moderne me dyqane, restorante dhe kinema.',
      coordinates: { lat: property.address.coordinates.lat - 0.005, lng: property.address.coordinates.lng + 0.003 }
    },
    {
      id: '3',
      name: 'Spitali Amerikan',
      type: 'hospital',
      distance: 1.2,
      walkTime: 15,
      driveTime: 6,
      rating: 4.7,
      address: 'Rruga Dibres, Tiranë',
      phone: '+355 4 345 6789',
      hours: '24/7',
      description: 'Spital privat me shërbime mjekësore të specializuara.',
      coordinates: { lat: property.address.coordinates.lat + 0.008, lng: property.address.coordinates.lng - 0.002 }
    },
    {
      id: '4',
      name: 'Mulliri Vjeter',
      type: 'restaurant',
      distance: 0.5,
      walkTime: 6,
      driveTime: 3,
      rating: 4.3,
      address: 'Rruga Pjetër Bogdani, Tiranë',
      phone: '+355 4 456 7890',
      hours: '12:00 - 24:00',
      description: 'Restorant tradicional me kuzhinë shqiptare dhe atmosferë të ngrohtë.',
      coordinates: { lat: property.address.coordinates.lat - 0.003, lng: property.address.coordinates.lng - 0.001 }
    },
    {
      id: '5',
      name: 'Stacioni i Autobusëve',
      type: 'transport',
      distance: 0.7,
      walkTime: 9,
      driveTime: 4,
      rating: 3.8,
      address: 'Sheshi Skënderbej, Tiranë',
      hours: '5:00 - 23:00',
      description: 'Stacion kryesor i transportit publik me lidhje për të gjithë qytetin.',
      coordinates: { lat: property.address.coordinates.lat + 0.004, lng: property.address.coordinates.lng + 0.002 }
    }
  ];

  const categories = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'school', label: 'Schools', icon: School },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'hospital', label: 'Healthcare', icon: Hospital },
    { id: 'restaurant', label: 'Dining', icon: Coffee },
    { id: 'transport', label: 'Transport', icon: Train }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCrimeRateColor = (rate: string) => {
    switch (rate) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Neighborhood Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Walk Score</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(neighborhoodStats.walkScore)}`}>
              {neighborhoodStats.walkScore}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${neighborhoodStats.walkScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Transit Score</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(neighborhoodStats.transitScore)}`}>
              {neighborhoodStats.transitScore}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${neighborhoodStats.transitScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bike Score</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(neighborhoodStats.bikeScore)}`}>
              {neighborhoodStats.bikeScore}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${neighborhoodStats.bikeScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Safety</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCrimeRateColor(neighborhoodStats.crimeRate)}`}>
              {neighborhoodStats.crimeRate} Crime
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Based on local crime statistics
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Education</h4>
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">Average School Rating:</span>
            <span className="font-medium">{neighborhoodStats.schoolRating}/5</span>
          </div>
          <p className="text-xs text-gray-500">
            Based on {nearbyPlaces.filter(p => p.type === 'school').length} nearby schools
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Commute</h4>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">Average Commute:</span>
            <span className="font-medium">{neighborhoodStats.averageCommute} min</span>
          </div>
          <p className="text-xs text-gray-500">
            To Tirana city center during peak hours
          </p>
        </div>
      </div>

      {/* Top Places */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Nearby Highlights</h4>
        <div className="space-y-3">
          {nearbyPlaces.slice(0, 3).map((place) => {
            const IconComponent = getPlaceIcon(place.type);
            return (
              <div key={place.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconComponent className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{place.name}</span>
                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-gray-600">{place.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{place.distance} km away</span>
                    <span>{place.walkTime} min walk</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

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
                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">{place.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {place.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {place.walkTime} min walk
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      {place.driveTime} min drive
                    </span>
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
                  <p className="text-sm text-gray-600">{place.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{place.address}</span>
                    </div>
                    
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
                      href={`https://www.google.com/search?q=${encodeURIComponent(place.name + ' ' + place.address)}`}
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