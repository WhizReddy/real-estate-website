'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Property } from '@/types';
import { getProperties, deleteProperty } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, LogOut, MessageCircle, Search, Filter, X } from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    propertyType: 'all',
    listingType: 'all',
    location: 'all'
  });
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
      setAllProperties(data);
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filter options
  const uniqueCities = [...new Set(allProperties.map(p => p.address.city))].sort();
  const uniquePropertyTypes = [...new Set(allProperties.map(p => p.details.propertyType))].sort();

  // Apply filters
  const applyFilters = () => {
    let filtered = allProperties;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.address.street.toLowerCase().includes(searchLower) ||
        property.address.city.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Property type filter
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(p => p.details.propertyType === filters.propertyType);
    }

    // Listing type filter
    if (filters.listingType !== 'all') {
      filtered = filtered.filter(p => p.listingType === filters.listingType);
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(p => p.address.city === filters.location);
    }

    setProperties(filtered);
  };

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters, allProperties, applyFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      propertyType: 'all',
      listingType: 'all',
      location: 'all'
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.status !== 'all' ||
    filters.propertyType !== 'all' ||
    filters.listingType !== 'all' ||
    filters.location !== 'all';

  const handleLogout = () => {
    // Clear session from both localStorage and cookies
    localStorage.removeItem('adminSession');
    document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id);
      // Update both filtered and all properties
      setAllProperties(prev => prev.filter(p => p.id !== id));
      setProperties(prev => prev.filter(p => p.id !== id));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Paneli i Administrimit
              </h1>
              <p className="text-blue-200">Menaxhoni pasuritë tuaja</p>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/admin/inquiries"
                className="flex items-center text-blue-100 hover:text-white transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Pyetjet</span>
              </Link>
              <Link
                href="/"
                className="flex items-center text-blue-100 hover:text-white transition-colors duration-200"
              >
                <Eye className="h-5 w-5 mr-2" />
                <span className="font-medium">Shiko Faqen</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span className="font-medium">Dil</span>
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
                <p className="text-2xl font-semibold text-gray-900">{allProperties.length}</p>
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
                  {allProperties.filter(p => p.status === 'active').length}
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
                  {allProperties.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Kërkoni pasuri..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              id="search-properties"
              name="search"
              autoComplete="search"
            />
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2" />
              <span className="font-medium">Filtrat e Avancuara</span>
              <span className="ml-2 text-sm text-gray-500">
                {showFilters ? '▲' : '▼'}
              </span>
            </button>

            <div className="flex items-center space-x-4">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center text-red-600 hover:text-red-700 text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Pastro Filtrat
                </button>
              )}
              
              <Link
                href="/admin/properties/new"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Shto Pasuri të Re
              </Link>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-900 mb-2">
                  📊 Statusi
                </label>
                <select
                  id="status-filter"
                  name="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoComplete="off"
                >
                  <option value="all">Të gjitha</option>
                  <option value="active">Aktive</option>
                  <option value="pending">Në Pritje</option>
                  <option value="inactive">Jo Aktive</option>
                </select>
              </div>

              {/* Property Type Filter */}
              <div>
                <label htmlFor="property-type-filter" className="block text-sm font-medium text-gray-900 mb-2">
                  🏠 Lloji i Pasurisë
                </label>
                <select
                  id="property-type-filter"
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoComplete="off"
                >
                  <option value="all">Të gjitha llojet</option>
                  <option value="house">Shtëpi</option>
                  <option value="apartment">Apartament</option>
                  <option value="condo">Kondo</option>
                  <option value="townhouse">Shtëpi në Qytet</option>
                </select>
              </div>

              {/* Listing Type Filter */}
              <div>
                <label htmlFor="listing-type-filter" className="block text-sm font-medium text-gray-900 mb-2">
                  💰 Lloji i Shitjes
                </label>
                <select
                  id="listing-type-filter"
                  name="listingType"
                  value={filters.listingType}
                  onChange={(e) => handleFilterChange('listingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoComplete="off"
                >
                  <option value="all">Të gjitha</option>
                  <option value="sale">Për Shitje</option>
                  <option value="rent">Me Qira</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label htmlFor="location-filter" className="block text-sm font-medium text-gray-900 mb-2">
                  📍 Lokacioni
                </label>
                <select
                  id="location-filter"
                  name="location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoComplete="off"
                >
                  <option value="all">Të gjitha qytetet</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pasuritë ({properties.length} nga {allProperties.length})
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-gray-600 mt-1">
                Filtrat janë aktive - po shfaqen rezultatet e filtruara
              </p>
            )}
          </div>
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