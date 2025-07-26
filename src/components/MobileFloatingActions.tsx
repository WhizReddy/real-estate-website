'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, ArrowUp, Filter, Search } from 'lucide-react';

interface MobileFloatingActionsProps {
  onFilterToggle?: () => void;
  onMapToggle?: () => void;
  showMapToggle?: boolean;
}

export default function MobileFloatingActions({ 
  onFilterToggle, 
  onMapToggle, 
  showMapToggle = false 
}: MobileFloatingActionsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const callPhone = () => {
    window.location.href = 'tel:+35569123456';
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/35569123456?text=Përshëndetje! Jam i interesuar për pasuritë tuaja.', '_blank');
  };

  return (
    <>
      {/* Main Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <div className="flex flex-col items-end space-y-3">
          {/* Secondary Actions */}
          {isExpanded && (
            <div className="flex flex-col space-y-3 animate-in slide-in-from-bottom-2 duration-300">
              {/* Scroll to Top */}
              {showScrollTop && (
                <button
                  onClick={scrollToTop}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="Kthehu lart"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              )}

              {/* Map Toggle */}
              {showMapToggle && onMapToggle && (
                <button
                  onClick={onMapToggle}
                  className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="Shiko hartën"
                >
                  <MapPin className="h-5 w-5" />
                </button>
              )}

              {/* Filter Toggle */}
              {onFilterToggle && (
                <button
                  onClick={onFilterToggle}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="Filtrat"
                >
                  <Filter className="h-5 w-5" />
                </button>
              )}

              {/* WhatsApp */}
              <button
                onClick={openWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                title="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </button>

              {/* Phone */}
              <button
                onClick={callPhone}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                title="Telefono"
              >
                <Phone className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Main Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-xl transition-all duration-300 transform ${
              isExpanded ? 'rotate-45 scale-110' : 'hover:scale-110'
            }`}
            title={isExpanded ? 'Mbyll' : 'Veprime të shpejta'}
          >
            {isExpanded ? (
              <div className="h-6 w-6 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-0.5 h-4 bg-white absolute"></div>
              </div>
            ) : (
              <Phone className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}