"use client";

import { useState } from "react";
import { Search, Map, Filter, Phone, MessageCircle } from "lucide-react";

interface MobileFloatingActionsProps {
  onFilterToggle: () => void;
  onMapToggle: () => void;
  showMapToggle?: boolean;
}

export default function MobileFloatingActions({
  onFilterToggle,
  onMapToggle,
  showMapToggle = true,
}: MobileFloatingActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainButtonClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: () => void) => {
    action();
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
          {/* Filter Button */}
          <button
            onClick={() => handleActionClick(onFilterToggle)}
            className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <Filter className="h-5 w-5" />
          </button>

          {/* Map Button */}
          {showMapToggle && (
            <button
              onClick={() => handleActionClick(onMapToggle)}
              className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 hover:scale-110 active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              <Map className="h-5 w-5" />
            </button>
          )}

          {/* Call Button */}
          <a
            href="tel:+35569123456"
            className="flex items-center justify-center w-12 h-12 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <Phone className="h-5 w-5" />
          </a>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/35569123456"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      )}

      {/* Main Action Button */}
      <button
        onClick={handleMainButtonClick}
        className={`flex items-center justify-center w-14 h-14 bg-white text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
        style={{ touchAction: 'manipulation' }}
        aria-label={isExpanded ? "Close actions" : "Open actions"}
      >
        <Search className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? 'rotate-45' : 'rotate-0'}`} />
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}