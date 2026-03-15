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
        <header className="relative isolate flex min-h-[680px] items-center overflow-hidden bg-[linear-gradient(180deg,#07111f_0%,#0d2140_48%,#1f4f89_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(147,197,253,0.25),_transparent_24%),radial-gradient(circle_at_left_center,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_transparent_0%,_rgba(2,6,23,0.18)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
          <div className="absolute left-[8%] top-[16%] h-32 w-32 rounded-full bg-blue-300/10 blur-3xl" />
          <div className="absolute right-[10%] top-[12%] h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64">
            <div className="absolute inset-x-0 bottom-0 h-20 bg-slate-50" />
            <div className="absolute bottom-20 left-[-4%] h-28 w-[26%] rounded-t-[2.5rem] bg-slate-100/95 shadow-[0_-16px_50px_rgba(148,163,184,0.18)]" />
            <div className="absolute bottom-20 left-[16%] h-40 w-[16%] rounded-t-[2.5rem] bg-blue-50/95 shadow-[0_-24px_60px_rgba(191,219,254,0.2)]" />
            <div className="absolute bottom-20 left-[29%] h-24 w-[14%] rounded-t-[2rem] bg-slate-200/95" />
            <div className="absolute bottom-20 left-[42%] h-48 w-[17%] rounded-t-[3rem] bg-white/90 shadow-[0_-24px_70px_rgba(255,255,255,0.14)]" />
            <div className="absolute bottom-20 right-[28%] h-32 w-[14%] rounded-t-[2.2rem] bg-blue-100/90" />
            <div className="absolute bottom-20 right-[14%] h-44 w-[18%] rounded-t-[3rem] bg-slate-100/95 shadow-[0_-24px_70px_rgba(148,163,184,0.16)]" />
            <div className="absolute bottom-20 right-[-3%] h-28 w-[20%] rounded-t-[2.4rem] bg-blue-50/95" />
            <div className="absolute bottom-40 left-[19%] h-2 w-2 rounded-full bg-white/60" />
            <div className="absolute bottom-48 left-[48%] h-2 w-2 rounded-full bg-blue-200/70" />
            <div className="absolute bottom-36 right-[20%] h-2 w-2 rounded-full bg-white/60" />
          </div>

          <div className="relative z-10 container-custom py-20 pb-32 sm:py-32 sm:pb-40">
            <div className="w-full sm:max-w-5xl md:max-w-6xl mx-auto text-center sm:text-left">
              <div className="mb-6 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur-sm">
                <HomeIcon className="h-4 w-4 mr-2" />
                {t('exclusiveAgency')}
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {t('findYourPerfectHome').split(' ')[0]}{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(90deg, #93c5fd, #e0f2fe)' }}
                >
                  {t('findYourPerfectHome').split(' ').slice(1).join(' ')}
                </span>
              </h1>
              <p className="mb-10 w-full break-words text-lg leading-relaxed text-blue-100/80 sm:mx-0 sm:max-w-3xl sm:text-xl md:text-2xl">
                {t('heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-wrap">
                <a
                  href="#properties"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                  {t('viewListings')}
                </a>
                <Link
                  href="/map"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/30 font-semibold transition-all"
                >
                  <Map className="h-5 w-5" />
                  {t('interactiveMap')}
                </Link>
              </div>

              <div className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-3 sm:mx-0 sm:grid-cols-3 sm:gap-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                    <div className="text-xl font-bold text-white">{totalProperties || allProperties.length}+</div>
                    <div className="mt-1 text-xs leading-tight text-blue-100/75">{t('activeProperties')}</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                    <div className="text-xl font-bold text-white">5★</div>
                    <div className="mt-1 text-xs leading-tight text-blue-100/75">{t('reliability')}</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                    <div className="text-xl font-bold text-white">24/7</div>
                    <div className="mt-1 text-xs leading-tight text-blue-100/75">{t('support')}</div>
                </div>
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
        <section id="contact" className="bg-slate-50 py-20 border-t border-gray-100 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.03]"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-[var(--primary-dark)] text-xs font-semibold mb-4">
                  {t('contact')}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-6">{t('readyToMove')}</h2>
                <p className="text-slate-600 text-lg mb-8 w-full sm:max-w-3xl">
                  {t('teamHelpDescription')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">{t('callUs')}</div>
                      <div className="font-bold text-[var(--foreground)]">+355 69 123 4567</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-2xl relative">
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{t('contactUs')}</h3>
                <p className="text-slate-600 mb-6 text-sm">
                  {t('contactDescription')}
                </p>
                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-gray-200 rounded-xl text-[var(--foreground)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  <input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-gray-200 rounded-xl text-[var(--foreground)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  <textarea
                    placeholder={t('messagePlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-gray-200 rounded-xl text-[var(--foreground)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none"
                  />
                </div>
                <button
                  className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-center transition-all hover:bg-[var(--primary-dark)] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
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
