"use client";

import { useState, useEffect, useCallback } from "react";
import { Property } from "@/types";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import StructuredData from "@/components/StructuredData";
import CreativeLoader from "@/components/CreativeLoader";
import MobileFloatingActions from "@/components/MobileFloatingActions";
import MobileSearchModal from "@/components/MobileSearchModal";
import Link from "next/link";
import { Home as HomeIcon, MapPin, Map, Phone } from "lucide-react";
import { createDynamicImport, logChunkError } from "@/lib/dynamicImport";
import { getTranslation } from "@/lib/i18n";

// Dynamically import map component to avoid SSR issues with Leaflet
const SimpleMapView = dynamic(
  () => import("@/components/SimpleMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-slate-100  rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-gray-400 text-sm">Duke ngarkuar hartën...</div>
      </div>
    )
  }
);

const MobileStaticMap = dynamic(
  () => import("@/components/StaticMapPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-slate-100  rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-gray-400 text-sm">Ngarkimi i hartës...</div>
      </div>
    )
  }
);

const DynamicSearchFilters = createDynamicImport(
  () => import("@/components/SearchFilters"),
  {
    ssr: false,
    loading: () => <div className="h-32 bg-white rounded-xl shadow-sm animate-pulse" />,
    retryAttempts: 3,
    onError: (error) => logChunkError(error, 'SearchFilters'),
  }
);

const DynamicSearchResults = createDynamicImport(
  () => import("@/components/SearchResults"),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-white rounded-xl shadow-sm animate-pulse" />,
    retryAttempts: 3,
    onError: (error) => logChunkError(error, 'SearchResults'),
  }
);

const PROPERTIES_PER_PAGE = 9;
const MAX_INITIAL_LOAD = 18;

export default function Home() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  // translation helper
  const t = (key: string) => getTranslation(key);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await fetch(`/api/properties/paginated?page=1&limit=${MAX_INITIAL_LOAD}`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        const activeProperties: Property[] = data.properties || [];
        setAllProperties(activeProperties);
        setFilteredProperties(activeProperties);
        setDisplayedProperties(activeProperties.slice(0, PROPERTIES_PER_PAGE));
        setTotalProperties(data.pagination?.total || 0);
        setHasMore(data.pagination?.hasMore || false);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProperties();
  }, []);

  const handleFilteredResults = useCallback((filtered: Property[]) => {
    setFilteredProperties(filtered);
    setDisplayedProperties(filtered.slice(0, PROPERTIES_PER_PAGE));
    setCurrentPage(1);
  }, []);

  const loadMoreProperties = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const endIndex = nextPage * PROPERTIES_PER_PAGE;

      if (endIndex > allProperties.length && hasMore) {
        const apiPage = Math.ceil(allProperties.length / MAX_INITIAL_LOAD) + 1;
        const res = await fetch(`/api/properties/paginated?page=${apiPage}&limit=${MAX_INITIAL_LOAD}`);
        if (res.ok) {
          const data = await res.json();
          const newProperties = data.properties || [];
          const updatedAll = [...allProperties, ...newProperties];
          setAllProperties(updatedAll);
          setFilteredProperties(updatedAll);
          setHasMore(data.pagination?.hasMore || false);
          setDisplayedProperties(updatedAll.slice(0, endIndex));
        }
      } else {
        setDisplayedProperties(filteredProperties.slice(0, endIndex));
      }
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more properties:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, filteredProperties, allProperties, hasMore, isLoadingMore]);

  const hasMoreProperties = displayedProperties.length < filteredProperties.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <CreativeLoader type="properties" size="lg" />
      </div>
    );
  }

  return (
    <Layout variant="homepage">
      <StructuredData type="website" />
      <StructuredData type="organization" />

      <main className="w-full relative">
        {/* Hero - white apartments + blue sky */}
        <header
          className="relative overflow-hidden min-h-[640px] flex items-center"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(10,30,80,0.75) 0%, rgba(10,30,80,0.35) 50%, rgba(10,30,80,0.1) 100%),
              url('/images/hero-bg.png')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="relative z-10 container-custom py-16 sm:py-32">
            <div className="w-full sm:max-w-4xl mx-auto text-center sm:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-blue-200 text-sm font-semibold mb-6">
                <HomeIcon className="h-4 w-4 mr-2" />
                {t('exclusiveAgency')}
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {/* Split translation string to emphasise last words */}
                {t('findYourPerfectHome').split(' ')[0]}{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>
                  {t('findYourPerfectHome').split(' ').slice(1).join(' ')}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-100/80 mb-10 leading-relaxed w-full sm:max-w-2xl mx-auto sm:mx-0">
                {t('heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a
                  href="#properties"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('viewListings')}
                </a>
                <Link
                  href="/map"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/25 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Map className="h-5 w-5" />
                  {t('interactiveMap')}
                </Link>
              </div>

              {/* Trust badges — glassmorphism cards */}
              <div className="mt-14 flex flex-wrap gap-4">
                {[
                  { value: `${allProperties.length}+`, label: t('activeProperties') },
                  { value: '5★', label: t('reliability') },
                  { value: '24/7', label: t('support') },
                ].map((badge) => (
                  <div key={badge.label} className="px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                    <div className="text-xl font-bold text-white">{badge.value}</div>
                    <div className="text-xs text-blue-200/70">{badge.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Properties Section */}
        <section className="bg-[var(--background)] relative pb-20">
          <div className="container-custom -mt-12 relative z-20">
            <DynamicSearchFilters
              properties={allProperties}
              onFilteredResults={handleFilteredResults}
            />
          </div>

          <div id="properties" className="container-custom mt-16 sm:mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DynamicSearchResults
                  properties={displayedProperties}
                  totalProperties={filteredProperties.length}
                  hasMore={hasMoreProperties}
                  onLoadMore={loadMoreProperties}
                  isLoadingMore={isLoadingMore}
                />
              </div>

              {/* Sticky Sidebar Map */}
              <div className="hidden lg:block">
                <div className="sticky top-6 space-y-6">
                  <div className="card p-5">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[var(--primary)]" />
                      {t('locations')}
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                      <SimpleMapView
                        properties={filteredProperties.slice(0, 10)}
                        height="400px"
                      />
                    </div>
                    <Link
                      href="/map"
                      className="btn-primary mt-4 w-full py-3 text-center rounded-xl font-semibold transition-colors block text-sm"
                    >
                      {t('openFullMap')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-slate-900 py-20 overflow-hidden">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold mb-4">
                  {t('contact')}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{t('readyToMove')}</h2>
                <p className="text-slate-300 text-lg mb-8 max-w-md">
                  {t('teamHelpDescription')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="p-3 bg-blue-600 rounded-xl text-white">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">{t('callUs')}</div>
                      <div className="font-bold text-white">+355 69 123 4567</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl relative">
                <h3 className="text-xl font-bold text-white mb-2">{t('contactUs')}</h3>
                <p className="text-slate-300 mb-6 text-sm">
                  {t('contactDescription')}
                </p>
                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                  />
                  <input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                  />
                  <textarea
                    placeholder={t('messagePlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all resize-none"
                  />
                </div>
                <button
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-center transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/30"
                >
                  {t('sendMessage')}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MobileFloatingActions
        onFilterToggle={() => setShowMobileSearch(true)}
        onMapToggle={() => setShowMobileMap((prev) => !prev)}
        showMapToggle={true}
      />

      <MobileSearchModal
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        properties={allProperties}
        onFilteredResults={handleFilteredResults}
      />

      {/* Mobile map preview toggle */}
      {showMobileMap && (
        <div className="md:hidden">
          <div className="container-custom mt-4">
            <MobileStaticMap
              properties={filteredProperties.slice(0, 10)}
              height={300}
              className="mb-6"
              ctaHref="/map"
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
