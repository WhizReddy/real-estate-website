import { notFound } from 'next/navigation';
import { getProperty } from '@/lib/data';
import PropertyDetailMap from '@/components/PropertyDetailMap';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return notFound();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumbs/Back */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kthehu te Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{property.title}</h1>
            <p className="mt-2 text-lg text-blue-600 font-bold">{property.price.toLocaleString()} €</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/properties/${property.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <Edit className="h-4 w-4 mr-2" />
              Ndrysho
            </Link>
            <button
              className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 shadow-sm transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Fshi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Images and Description) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="aspect-[16/9] relative bg-gray-100">
                <PropertyImageGallery images={property.images} title={property.title} />
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">Përshkrimi</h2>
              <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                {property.description}
              </div>
            </div>
          </div>

          {/* Sidebar (Map and Info) */}
          <div className="space-y-8">
            {/* Map Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                <h3 className="font-bold text-gray-900">Lokacioni</h3>
              </div>
              <div className="h-80 relative">
                <Suspense fallback={<div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Duke ngarkuar hartën...</div>}>
                  <PropertyDetailMap property={property} />
                </Suspense>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Detajet</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Dhoma</p>
                  <p className="text-lg font-bold text-gray-900">{property.details.bedrooms}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Banjo</p>
                  <p className="text-lg font-bold text-gray-900">{property.details.bathrooms}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Sipërfaqja</p>
                  <p className="text-lg font-bold text-gray-900">{property.details.squareFootage}m²</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Viti</p>
                  <p className="text-lg font-bold text-gray-900">{property.details.yearBuilt || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
