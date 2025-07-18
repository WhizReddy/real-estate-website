import Layout from '@/components/Layout';
import CreativeLoader from '@/components/CreativeLoader';

export default function PropertyLoading() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          {/* Property title skeleton */}
          <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-8"></div>
          
          {/* Image gallery skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-44 bg-gray-200 rounded-lg"></div>
              <div className="h-44 bg-gray-200 rounded-lg"></div>
              <div className="h-44 bg-gray-200 rounded-lg"></div>
              <div className="h-44 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          
          {/* Property details skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-4"></div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-200 rounded-md"></div>
                <div className="h-4 bg-gray-200 rounded-md"></div>
                <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
              </div>
              
              <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="h-4 bg-gray-200 rounded-md"></div>
                <div className="h-4 bg-gray-200 rounded-md"></div>
                <div className="h-4 bg-gray-200 rounded-md"></div>
                <div className="h-4 bg-gray-200 rounded-md"></div>
              </div>
            </div>
            
            <div>
              <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <CreativeLoader type="property" size="md" />
        </div>
      </div>
    </Layout>
  );
}