'use client';

import { useEffect, useState } from 'react';
import { Home, MapPin, Key, Heart } from 'lucide-react';

interface CreativeLoaderProps {
  message?: string;
  type?: 'properties' | 'map' | 'images' | 'general';
  size?: 'sm' | 'md' | 'lg';
}

export default function CreativeLoader({ 
  message = 'Po ngarkohet...', 
  type = 'general',
  size = 'md' 
}: CreativeLoaderProps) {
  const [currentIcon, setCurrentIcon] = useState(0);
  
  const icons = [
    { Icon: Home, color: 'text-red-500' },
    { Icon: MapPin, color: 'text-blue-500' },
    { Icon: Key, color: 'text-yellow-500' },
    { Icon: Heart, color: 'text-pink-500' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 600);

    return () => clearInterval(interval);
  }, [icons.length]);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerSizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const getTypeSpecificMessage = () => {
    switch (type) {
      case 'properties':
        return 'Po ngarkohen pasuritë...';
      case 'map':
        return 'Po ngarkohet harta...';
      case 'images':
        return 'Po ngarkohen imazhet...';
      default:
        return message;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]}`}>
      {/* Animated Icon Container */}
      <div className="relative mb-4">
        {/* Pulsing Background Circle */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-blue-100 rounded-full animate-pulse"></div>
        
        {/* Rotating Border */}
        <div className="relative bg-white rounded-full p-4 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 rounded-full animate-spin opacity-20"></div>
          
          {/* Icon */}
          <div className="relative z-10">
            {icons.map(({ Icon, color }, index) => (
              <Icon
                key={index}
                className={`${sizeClasses[size]} ${color} transition-all duration-300 ${
                  index === currentIcon 
                    ? 'opacity-100 scale-110 transform' 
                    : 'opacity-0 scale-90 absolute inset-0'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Loading Dots */}
      <div className="flex space-x-1 mb-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>

      {/* Message */}
      <p className="text-gray-700 text-sm font-medium text-center">
        {getTypeSpecificMessage()}
      </p>

      {/* Progress Bar */}
      <div className="w-32 h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-500 to-blue-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}