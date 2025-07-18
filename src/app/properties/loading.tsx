import Layout from '@/components/Layout';
import CreativeLoader from '@/components/CreativeLoader';

export default function PropertiesLoading() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          {/* Page title skeleton */}
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-8"></div>
          
          {/* Search filters skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
          </div>
          
          {/* Property grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded-md mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <CreativeLoader type="properties" size="lg" />
        </div>
      </div>
    </Layout>
  );
}