"use client";

import { useState, useEffect } from "react";
import { X, Search, Filter } from "lucide-react";
import { Property } from "@/types";
import SearchFilters from "./SearchFilters";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onFilteredResults: (properties: Property[]) => void;
}

export default function MobileSearchModal({
  isOpen,
  onClose,
  properties,
  onFilteredResults,
}: MobileSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleQuickSearch = (term: string) => {
    const filtered = properties.filter(property =>
      property.title.toLowerCase().includes(term.toLowerCase()) ||
      property.description.toLowerCase().includes(term.toLowerCase()) ||
      property.address.city.toLowerCase().includes(term.toLowerCase())
    );
    onFilteredResults(filtered);
    onClose();
  };

  const quickSearchTerms = [
    "Apartament",
    "Shtëpi", 
    "Tirana",
    "Durres",
    "2 dhoma",
    "3 dhoma",
    "Me qira",
    "Për shitje"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-lg font-semibold text-white">Kërkoni Pasuri</h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Kërkoni pasuri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  handleQuickSearch(searchTerm.trim());
                }
              }}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
            />
          </div>

          {/* Quick Search Terms */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Kërkime të shpejta:</p>
            <div className="flex flex-wrap gap-2">
              {quickSearchTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors active:scale-95"
                  style={{ touchAction: 'manipulation' }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <Filter className="h-5 w-5 mr-2" />
            {showFilters ? 'Fshih Filtrat' : 'Filtrat e Avancuara'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <SearchFilters
                properties={properties}
                onFilteredResults={(filtered) => {
                  onFilteredResults(filtered);
                  onClose();
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              Anulo
            </button>
            {searchTerm.trim() && (
              <button
                onClick={() => handleQuickSearch(searchTerm.trim())}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
                style={{ touchAction: 'manipulation' }}
              >
                Kërko
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}