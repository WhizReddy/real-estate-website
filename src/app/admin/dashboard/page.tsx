'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getCurrentUser, isAdmin, isAgent, clearSession, UserData } from '@/lib/auth-utils';
import { Plus, Edit, Trash2, Eye, LogOut, MessageCircle, Search, Filter, X, User, MoreVertical } from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';
import DatabaseStatusMonitor from '@/components/DatabaseStatusMonitor';

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<'ADMIN' | 'AGENT' | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    propertyType: 'all',
    listingType: 'all',
    location: 'all'
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [banner, setBanner] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminSession');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Get current user info
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setUserRole(user.role);
    }
  }, [router]);

  // Show success banner based on URL flags and then clean up the URL
  useEffect(() => {
    const created = searchParams.get('created');
    const updated = searchParams.get('updated');
    const deleted = searchParams.get('deleted');
    if (created === '1') {
      setBanner({ type: 'success', message: 'Pasuria u krijua me sukses.' });
    } else if (updated === '1') {
      setBanner({ type: 'success', message: 'Ndryshimet u ruajtën me sukses.' });
    } else if (deleted === '1') {
      setBanner({ type: 'info', message: 'Pasuria u fshi.' });
    }
    if (created || updated || deleted) {
      // Remove query params to keep URL clean
      const url = new URL(window.location.href);
      url.searchParams.delete('created');
      url.searchParams.delete('updated');
      url.searchParams.delete('deleted');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    if (!userRole) return;
    const loadProperties = async () => {
      try {
        let data: Property[] = [];
        if (userRole === 'ADMIN') {
          const res = await fetch('/api/properties', { cache: 'no-store' });
          const json = await res.json();
          data = json.properties || [];
        } else if (userRole === 'AGENT') {
          const res = await fetch('/api/properties/user', { cache: 'no-store' });
          const json = await res.json();
          data = json.data || [];
        }
        setAllProperties(data);
        setProperties(data);
      } catch (error) {
        console.error('Error loading properties:', error);
        setAllProperties([]);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, [userRole]);

  // Get unique values for filter options
  const uniqueCities = [...new Set(allProperties.map(p => p.address.city))].sort();
  const uniquePropertyTypes = [...new Set(allProperties.map(p => p.details.propertyType))].sort(); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Apply filters with useCallback to prevent infinite re-renders
  const applyFilters = useCallback(() => {
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
  }, [allProperties, filters]);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
      await fetch(`/api/properties/${id}`, { method: 'DELETE' });
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
      <div className="min-h-[60vh] bg-[var(--background)] flex items-center justify-center">
        <CreativeLoader type="properties" size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--background)] overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 relative pt-[env(safe-area-inset-top)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {userRole === 'ADMIN' ? 'Paneli i Administrimit' : 'Paneli i Agjentit'}
              </h1>
              <p className="text-blue-200">
                {userRole === 'ADMIN' ? 'Menaxhoni pasuritë tuaja' : `Mirë se erdhe, ${currentUser?.name || 'Agjent'}`}
              </p>
              {currentUser && (
                <p className="text-blue-300 text-sm">
                  {currentUser?.email} • {userRole === 'ADMIN' ? 'Administrator' : 'Agjent'}
                </p>
              )}
            </div>
            {/* Desktop actions */}
            <div className="hidden sm:flex items-center space-x-6">
              {userRole === 'ADMIN' && <DatabaseStatusMonitor />}
              {userRole === 'ADMIN' && (
                <Link
                  href="/admin/agents"
                  className="flex items-center text-white/90 hover:text-white transition-colors duration-200"
                >
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium">Agjentët</span>
                </Link>
              )}
              <Link
                href="/admin/inquiries"
                className="flex items-center text-white/90 hover:text-white transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Pyetjet</span>
              </Link>
              <Link
                href="/"
                className="flex items-center text-white/90 hover:text-white transition-colors duration-200"
              >
                <Eye className="h-5 w-5 mr-2" />
                <span className="font-medium">Shiko Faqen</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-white text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span className="font-medium">Dil</span>
              </button>
            </div>
          </div>
          {/* Mobile actions: compact menu */}
          <div className="sm:hidden absolute right-4 top-2">
            <button
              aria-label="Hap menunë"
              onClick={() => setMobileMenuOpen(v => !v)}
              className="inline-flex items-center justify-center p-2 rounded-md bg-white/10 text-white hover:bg-white/15"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          {mobileMenuOpen && (
            <>
              {/* backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-4 top-12 z-50 w-56 rounded-lg border border-gray-200  bg-[var(--background)]/95 text-[var(--foreground)] shadow-xl backdrop-blur">
                <div className="py-1">
                  {userRole === 'ADMIN' && (
                    <Link
                      href="/admin/agents"
                      className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2 text-blue-700" />
                      Agjentët
                    </Link>
                  )}
                  <Link
                    href="/admin/inquiries"
                    className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 text-blue-700" />
                    Pyetjet
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Eye className="h-4 w-4 mr-2 text-blue-700" />
                    Shiko faqen
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2 text-blue-700" />
                    Dil
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
        {banner && (
          <div className={`mb-6 rounded-md border p-4 ${banner.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : banner.type === 'info' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-yellow-200 bg-yellow-50 text-yellow-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{banner.message}</span>
              <button className="text-sm opacity-70 hover:opacity-100" onClick={() => setBanner(null)}>Mbyll</button>
            </div>
          </div>
        )}
        {/* Database Status Panel - Admin Only */}
        {userRole === 'ADMIN' && (
          <div className="mb-8">
            <DatabaseStatusMonitor showDetails={true} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card border-none p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 30 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 ">Totali i Pasurive</p>
                <p className="text-2xl font-semibold text-[var(--foreground)]">{allProperties.length}</p>
              </div>
            </div>
          </div>

          <div className="card border-none p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 30 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 ">Aktive</p>
                <p className="text-2xl font-semibold text-[var(--foreground)]">
                  {allProperties.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card border-none p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 30 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 ">Në Pritje</p>
                <p className="text-2xl font-semibold text-[var(--foreground)]">
                  {allProperties.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card border-none p-4 sm:p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Kërkoni pasuri..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="search-properties"
              name="search"
              autoComplete="search"
            />
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
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
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Pastro Filtrat
                </button>
              )}

              <Link
                href="/admin/properties/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Shto Pasuri të Re
              </Link>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 ">
              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-slate-900  mb-2">
                  📊 Statusi
                </label>
                <select
                  id="status-filter"
                  name="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300  bg-[var(--background)] text-[var(--foreground)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Pasuritë ({properties.length} nga {allProperties.length})
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-slate-600  mt-1">
                Filtrat janë aktive - po shfaqen rezultatet e filtruara
              </p>
            )}
          </div>
        </div>

        {/* Properties Table */}
        <div className="card overflow-hidden border-none text-[var(--foreground)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 ">
              <thead className="bg-slate-50 50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                    Pasuria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                    Lokacioni
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                    Çmimi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                    Statusi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500  uppercase tracking-wider">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)] divide-y divide-gray-200 ">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50 :bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            🏠
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-[var(--text-scale-base)] font-medium text-[var(--foreground)]">
                            {property.title}
                          </div>
                          <div className="text-[var(--text-scale-sm)] text-slate-500 ">
                            {property.details.bedrooms > 0 ? `${property.details.bedrooms}+` : ''}
                            {property.details.bathrooms} • {property.details.squareFootage}m²
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[var(--text-scale-base)] text-[var(--foreground)]">{property.address.city}</div>
                      <div className="text-[var(--text-scale-sm)] text-slate-500 ">{property.address.street}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[var(--text-scale-base)] font-medium text-[var(--foreground)]">
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-[var(--text-scale-sm)] font-semibold rounded-full ${property.status === 'active'
                        ? 'bg-green-100 20 text-green-800 '
                        : property.status === 'pending'
                          ? 'bg-yellow-100 20 text-yellow-800 '
                          : 'bg-slate-100  text-slate-800 '
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
                          className="text-blue-600 hover:text-blue-900"
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
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Shto Pasurinë e Parë
            </Link>
          </div>
        )}
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-7xl">
          <div className="bg-[var(--background)]/90 backdrop-blur border border-primary/20 shadow-md rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-[var(--foreground)]">Veprime të shpejta</span>
            <Link
              href="/admin/properties/new"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Shto Pasuri
            </Link>
          </div>
        </div>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
