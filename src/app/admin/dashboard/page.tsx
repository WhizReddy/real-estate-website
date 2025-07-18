'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Property } from '@/types';
import { getProperties, deleteProperty } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, LogOut, MessageCircle } from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminSession');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Load properties
    loadProperties();
  }, [router]);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear session from both localStorage and cookies
    localStorage.removeItem('adminSession');
    document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <CreativeLoader type="properties" size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Paneli i Administrimit
              </h1>
              <p className="text-gray-600">Menaxhoni pasuritë tuaja</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/inquiries"
                className="text-gray-600 hover:text-gray-900"
              >
                <MessageCircle className="h-5 w-5 inline mr-1" />
                Pyetjet
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                <Eye className="h-5 w-5 inline mr-1" />
                Shiko Faqen
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-red-600 hover:text-red-700"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Dil
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totali i Pasurive</p>
                <p className="text-2xl font-semibold text-gray-900">{properties.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {properties.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Në Pritje</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {properties.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Pasuritë</h2>
          <Link
            href="/admin/properties/new"
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Shto Pasuri të Re
          </Link>
        </div>

        {/* Properties Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pasuria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokacioni
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Çmimi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statusi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            🏠
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.details.bedrooms > 0 ? `${property.details.bedrooms}+` : ''}
                            {property.details.bathrooms} • {property.details.squareFootage}m²
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.address.city}</div>
                      <div className="text-sm text-gray-500">{property.address.street}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        property.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : property.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {property.status === 'active' ? 'Aktive' : 
                         property.status === 'pending' ? 'Në Pritje' : 'E Shitur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Shiko"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/properties/${property.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                          title="Ndrysho"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(property.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Fshi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">Nuk ka pasuri të regjistruara</div>
            <Link
              href="/admin/properties/new"
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Shto Pasurinë e Parë
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Konfirmo Fshirjen</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  A jeni të sigurt që doni të fshini këtë pasuri? Ky veprim nuk mund të kthehet.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Anulo
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Fshi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}