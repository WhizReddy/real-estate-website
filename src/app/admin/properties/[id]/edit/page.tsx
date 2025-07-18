'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Property } from '@/types';
import { getCurrentTimestamp } from '@/lib/utils';
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import { getProperty, deleteProperty } from '@/lib/data';
import InteractiveMapView from '@/components/InteractiveMapView';

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: 'house' | 'condo' | 'townhouse' | 'apartment';
  yearBuilt?: number;
  features: string;
  status: 'active' | 'inactive' | 'pending' | 'sold';
  listingType: 'sale' | 'rent';
  isPinned: boolean;
}

export default function EditProperty({ params }: { params: Promise<{ id: string }> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PropertyFormData>();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminSession');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Load property data
    const loadProperty = async () => {
      try {
        const resolvedParams = await params;
        const propertyData = await getProperty(resolvedParams.id);
        if (propertyData) {
          setProperty(propertyData);
          setFeaturesList(propertyData.features);
          setPropertyImages(propertyData.images);
          
          // Populate form
          reset({
            title: propertyData.title,
            description: propertyData.description,
            price: propertyData.price,
            street: propertyData.address.street,
            city: propertyData.address.city,
            state: propertyData.address.state,
            zipCode: propertyData.address.zipCode,
            lat: propertyData.address.coordinates.lat,
            lng: propertyData.address.coordinates.lng,
            bedrooms: propertyData.details.bedrooms,
            bathrooms: propertyData.details.bathrooms,
            squareFootage: propertyData.details.squareFootage,
            propertyType: propertyData.details.propertyType,
            yearBuilt: propertyData.details.yearBuilt,
            status: propertyData.status,
            listingType: propertyData.listingType,
            isPinned: propertyData.isPinned,
            features: '',
          });
        } else {
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [params, router, reset]);

  const addFeature = () => {
    if (featureInput.trim() && !featuresList.includes(featureInput.trim())) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!property) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedProperty: Property = {
        ...property,
        title: data.title,
        description: data.description,
        price: Number(data.price),
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          coordinates: {
            lat: Number(data.lat),
            lng: Number(data.lng),
          },
        },
        details: {
          bedrooms: Number(data.bedrooms),
          bathrooms: Number(data.bathrooms),
          squareFootage: Number(data.squareFootage),
          propertyType: data.propertyType,
          yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
        },
        images: propertyImages,
        features: featuresList,
        status: data.status,
        listingType: data.listingType,
        isPinned: data.isPinned,
        updatedAt: getCurrentTimestamp(),
      };

      // Save to database using the API
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProperty),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }
      
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Gabim gjatë përditësimit të pasurisë. Ju lutem provoni përsëri.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!property) return;
    
    if (confirm('A jeni të sigurt që doni të fshini këtë pasuri? Ky veprim nuk mund të kthehet.')) {
      setIsDeleting(true);
      
      try {
        await deleteProperty(property.id);
        router.push('/admin/dashboard');
      } catch (error) {
        console.error('Failed to delete property:', error);
        alert('Gabim gjatë fshirjes së pasurisë. Ju lutem provoni përsëri.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Kthehu
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Ndrysho Pasurinë
              </h1>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Duke fshirë...' : 'Fshi Pasurinë'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informacione Bazë
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Titulli i Pasurisë *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Titulli është i detyrueshëm' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Përshkrimi *
                </label>
                <textarea
                  rows={4}
                  {...register('description', { required: 'Përshkrimi është i detyrueshëm' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Çmimi (€) *
                </label>
                <input
                  type="number"
                  {...register('price', { required: 'Çmimi është i detyrueshëm', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lloji i Shitjes *
                </label>
                <select
                  {...register('listingType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="sale">Për Shitje</option>
                  <option value="rent">Me Qira</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Imazhet e Pasurisë *
            </h2>
            <ImageUploader
              images={propertyImages}
              onImagesChange={setPropertyImages}
              maxImages={10}
              maxSizePerImage={5}
            />
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Adresa dhe Lokacioni
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rruga *
                </label>
                <input
                  type="text"
                  {...register('street', { required: 'Rruga është e detyrueshme' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.street && (
                  <p className="text-red-600 text-sm mt-1">{errors.street.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qyteti *
                </label>
                <input
                  type="text"
                  {...register('city', { required: 'Qyteti është i detyrueshëm' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kodi Postar
                </label>
                <input
                  type="text"
                  {...register('zipCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('lat', { required: 'Latitude është e detyrueshme' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.lat && (
                  <p className="text-red-600 text-sm mt-1">{errors.lat.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('lng', { required: 'Longitude është e detyrueshme' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.lng && (
                  <p className="text-red-600 text-sm mt-1">{errors.lng.message}</p>
                )}
              </div>
            </div>

            {/* Interactive Map for Location Selection */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                Përditëso Lokacionin në Hartë
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Kliko në hartë për të ndryshuar lokacionin e pasurisë. Koordinatat do të përditësohen automatikisht.
              </p>
              <InteractiveMapView
                mode="edit"
                selectedLocation={watch('lat') && watch('lng') ? { lat: watch('lat'), lng: watch('lng') } : undefined}
                onLocationSelect={(lat, lng) => {
                  setValue('lat', lat);
                  setValue('lng', lng);
                }}
                height="400px"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detajet e Pasurisë
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dhoma Gjumi
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('bedrooms', { min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banjo *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  {...register('bathrooms', { required: 'Numri i banjove është i detyrueshëm', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.bathrooms && (
                  <p className="text-red-600 text-sm mt-1">{errors.bathrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sipërfaqja (m²) *
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('squareFootage', { required: 'Sipërfaqja është e detyrueshme', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.squareFootage && (
                  <p className="text-red-600 text-sm mt-1">{errors.squareFootage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lloji i Pasurisë *
                </label>
                <select
                  {...register('propertyType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="apartment">Apartament</option>
                  <option value="house">Shtëpi</option>
                  <option value="condo">Kondo</option>
                  <option value="townhouse">Vila</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Viti i Ndërtimit
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  {...register('yearBuilt')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statusi *
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="active">Aktive</option>
                  <option value="inactive">Jo-aktive</option>
                  <option value="pending">Në Pritje</option>
                  <option value="sold">E Shitur</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Karakteristikat
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Shto karakteristikë"
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {featuresList.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-gray-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cilësimet
            </h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPinned')}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Pin në faqen kryesore (do të shfaqet në krye të listës)
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Anulo
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}