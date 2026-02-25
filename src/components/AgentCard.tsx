"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Agent } from '@/types';
import { Phone, Mail, Star, MapPin } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  showContactInfo?: boolean;
  compact?: boolean;
}

export default function AgentCard({ 
  agent, 
  showContactInfo = true, 
  compact = false 
}: AgentCardProps) {
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {agent.photo ? (
            <Image
              src={agent.photo}
              alt={agent.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center text-white font-semibold text-sm">
              {agent.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{agent.name}</h3>
          <p className="text-sm text-gray-600 truncate">
            {agent.specialties.slice(0, 2).join(', ')}
          </p>
        </div>
        
        {showContactInfo && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleCall(agent.phone)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Call agent"
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEmail(agent.email)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Email agent"
            >
              <Mail className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Agent Photo */}
      <div className="relative h-48 w-full overflow-hidden bg-white">
        {agent.photo ? (
          <Image
            src={agent.photo}
            alt={agent.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-sm opacity-80">No Photo</div>
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
          <Star className="h-3 w-3 text-yellow-500 fill-current" />
          <span>4.9</span>
        </div>
      </div>

      {/* Agent Details */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
          
          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mb-3">
            {agent.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
              >
                {specialty}
              </span>
            ))}
            {agent.specialties.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{agent.specialties.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {agent.bio && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
            {agent.bio}
          </p>
        )}

        {/* Contact Information */}
        {showContactInfo && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <a
                href={`tel:${agent.phone}`}
                className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                {agent.phone}
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <a
                href={`mailto:${agent.email}`}
                className="text-sm text-gray-700 hover:text-blue-600 transition-colors truncate"
              >
                {agent.email}
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex space-x-3">
            <button
              onClick={() => handleCall(agent.phone)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </button>
            
            <button
              onClick={() => handleEmail(agent.email)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}