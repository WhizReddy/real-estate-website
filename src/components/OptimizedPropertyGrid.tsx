"use client";

import { useMemo, useState, useCallback } from 'react';
import { Property } from '@/types';
import { useVirtualScrolling, useIntersectionObserver } from '@/utils/performance-optimizations';
import PropertyCard from './PropertyCard';
import { Loader2 } from 'lucide-react';

interface OptimizedPropertyGridProps {
  properties: Property[];
  itemsPerPage?: number;
  enableVirtualScrolling?: boolean;
  className?: string;
}

export default function OptimizedPropertyGrid({
  properties,
  itemsPerPage = 12,
  enableVirtualScrolling = false,
  className = '',
}: OptimizedPropertyGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = properties.slice(0, endIndex);

  // Intersection observer for infinite scroll
  const { elementRef: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Load more properties when intersection is detected
  const loadMore = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCurrentPage(prev => prev + 1);
    setIsLoadingMore(false);
  }, [isLoadingMore, currentPage, totalPages]);

  // Trigger load more when intersection is detected
  useMemo(() => {
    if (isIntersecting && !isLoadingMore && currentPage < totalPages) {
      loadMore();
    }
  }, [isIntersecting, isLoadingMore, currentPage, totalPages, loadMore]);

  // Virtual scrolling setup (for very large lists)
  const itemHeight = 400; // Approximate height of PropertyCard
  const containerHeight = 800; // Height of the scrollable container
  
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  } = useVirtualScrolling(
    enableVirtualScrolling ? properties : [],
    itemHeight,
    containerHeight
  );

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No properties found</div>
        <p className="text-gray-400">Try adjusting your search filters</p>
      </div>
    );
  }

  if (enableVirtualScrolling && properties.length > 100) {
    return (
      <div
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleItems.map((property, index) => (
                <div key={property.id} style={{ height: itemHeight }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Load More Trigger */}
      {currentPage < totalPages && (
        <div
          ref={loadMoreRef as React.RefObject<HTMLDivElement>}
          className="flex items-center justify-center py-8"
        >
          {isLoadingMore ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more properties...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Load More Properties
            </button>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-8 text-center text-gray-600">
        <p>
          Showing {Math.min(currentProperties.length, properties.length)} of{' '}
          {properties.length} properties
        </p>
        {currentPage < totalPages && (
          <p className="text-sm mt-1">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>
    </div>
  );
}