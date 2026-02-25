import PropertyGridSkeleton from '@/components/PropertyGridSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-4"></div>
            <div className="h-6 bg-white/20 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse mb-8">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        </div>
        
        <PropertyGridSkeleton count={6} />
      </div>
    </div>
  );
}