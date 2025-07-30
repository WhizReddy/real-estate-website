import { Property } from '@/types';
import PropertyCard from './PropertyCard';
import PropertyGridSkeleton from './PropertyGridSkeleton';

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
}

export default function PropertyGrid({ properties, loading = false }: PropertyGridProps) {
  if (loading) {
    return <PropertyGridSkeleton count={6} />;
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No properties found</div>
        <p className="text-gray-400">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 property-grid">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}