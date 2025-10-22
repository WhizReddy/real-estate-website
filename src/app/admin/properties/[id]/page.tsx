import { notFound } from 'next/navigation';
import { getProperty } from '@/lib/data';
import PropertyDetailMap from '@/components/PropertyDetailMap';
import { Suspense } from 'react';

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);
  if (!property) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
      <div className="mb-6">
        <span className="text-blue-600 font-semibold text-lg">{property.price.toLocaleString()} €</span>
      </div>
      <div className="mb-8">
        <Suspense fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" /> }>
          <PropertyDetailMap property={property} />
        </Suspense>
      </div>
      <div className="prose max-w-none">
        <p>{property.description}</p>
      </div>
    </div>
  );
}
