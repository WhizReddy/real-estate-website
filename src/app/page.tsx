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
import { Home as HomeIcon, BarChart3, MapPin, Map, Phone } from "lucide-react";
import { createDynamicImport, logChunkError } from "@/lib/dynamicImport";

// Force dynamic rendering to avoid SSR issues with Leaflet
export const runtime = 'edge'; // Use edge runtime or 'nodejs'
export const dynamicParams = true;

// Dynamically import map component to avoid SSR issues with Leaflet
const SimpleMapView = dynamic(
  () => import("@/components/SimpleMapView"),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

// Static map preview for mobile (Google Static Maps)
const MobileStaticMap = dynamic(
  () => import("@/components/StaticMapPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading map preview...</div>
      </div>
    )
  }
);

// Enhanced dynamic imports with retry mechanism for chunk loading failures
const DynamicSearchFilters = createDynamicImport(
  () => import("@/components/SearchFilters"),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-white rounded-lg shadow-md animate-pulse flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 text-sm">Loading search filters...</span>
        </div>
      </div>
    ),
    retryAttempts: 3,
    onError: (error) => logChunkError(error, 'SearchFilters'),
  }
);

const DynamicSearchResults = createDynamicImport(
  () => import("@/components/SearchResults"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-white rounded-lg shadow-md animate-pulse flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 text-sm">Loading search results...</span>
        </div>
      </div>
    ),
    retryAttempts: 3,
    onError: (error) => logChunkError(error, 'SearchResults'),
  }
);

const PROPERTIES_PER_PAGE = 9; // Show 9 properties per page for better performance
const MAX_INITIAL_LOAD = 18; // Maximum properties to load initially

export default function Home() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  // (Removed) viewport height state used by deleted map modal
  // const [viewportHeight, setViewportHeight] = useState<number>(0);
  // Removed isMapUpdating as it was unused

  useEffect(() => {
    const loadProperties = async () => {
      try {
        // Use paginated endpoint for better performance with large datasets
        const res = await fetch(`/api/properties/paginated?page=1&limit=${MAX_INITIAL_LOAD}`, { 
          next: { revalidate: 60 } // Cache for 60 seconds
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
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

  // (Removed) body scroll lock for map modal — modal no longer used

  // Warm up the map chunk so opening the modal feels instant on mobile
  useEffect(() => {
    // Prefetch SimpleMapView dynamically on idle
    const id = window.requestIdleCallback?.(
      () => {
        import('@/components/SimpleMapView').catch(() => {});
      },
      { timeout: 2000 }
    );
    return () => {
      if (id && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(id);
      }
    };
  }, []);

  // (Removed) viewport height tracking for deleted modal

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
      const startIndex = 0;
      const endIndex = nextPage * PROPERTIES_PER_PAGE;
      
      // Check if we need to fetch more data from API
      if (endIndex > allProperties.length && hasMore) {
        // Fetch next batch of properties
        const apiPage = Math.ceil(allProperties.length / MAX_INITIAL_LOAD) + 1;
        const res = await fetch(`/api/properties/paginated?page=${apiPage}&limit=${MAX_INITIAL_LOAD}`);
        
        if (res.ok) {
          const data = await res.json();
          const newProperties = data.properties || [];
          const updatedAll = [...allProperties, ...newProperties];
          setAllProperties(updatedAll);
          setFilteredProperties(updatedAll);
          setHasMore(data.pagination?.hasMore || false);
          
          setDisplayedProperties(updatedAll.slice(startIndex, endIndex));
        }
      } else {
        // Use existing data
        const newDisplayedProperties = filteredProperties.slice(startIndex, endIndex);
        setDisplayedProperties(newDisplayedProperties);
      }
      
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more properties:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, filteredProperties, allProperties, hasMore, isLoadingMore]);

  const hasMoreProperties =
    displayedProperties.length < filteredProperties.length;

  if (isLoading) {
    return (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <CreativeLoader type="properties" size="lg" />
      </div>
    );
  }

  return (
    <Layout variant="homepage">
      <StructuredData type="website" />
      <StructuredData type="organization" />
  <div className="min-h-screen" style={{ background: '#1E378D' }}>
        {/* Royal Blue Hero Section */}
  <section className="relative overflow-hidden bg-linear-to-br from-indigo-950 via-blue-900 to-blue-700">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            ></div>
          </div>

          {/* Optional radial glow for depth */}
          <div
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(closest-side, rgba(59,130,246,0.25), transparent)",
              filter: "blur(30px)",
            }}
          />

          <div className="relative max-w-7xl mx-auto hero-section px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center">
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-4 sm:mb-6">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Pasuritë Premium të Tiranës
                </div>
                <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  Gjeni Shtëpinë e{" "}
                  <span className="bg-linear-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Ëndrrave
                  </span>{" "}
                  Tuaja
                </h1>
                <p className="hero-subtitle text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
                  Zbuloni përzgjedhjen tonë ekskluzive të pasurive premium në
                  Tiranë. Partneri juaj i besuar për blerje, shitje dhe qira
                  pasurie.
                </p>

                {/* Quick actions (mobile-first) */}
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="#properties"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 hover:bg-white/90 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Shiko Pasuritë
                  </a>
                  <Link
                    href="/map"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/30 font-semibold transition-all"
                  >
                    <Map className="h-5 w-5" />
                    Shiko në Hartë
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid mobile-grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto">
                <div className="text-center gpu-accelerated">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {allProperties.length}+
                  </div>
                  <div className="text-white/80 text-sm">
                    Pasuri të Disponueshme
                  </div>
                </div>
                <div className="text-center gpu-accelerated">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    5★
                  </div>
                  <div className="text-white/80 text-sm">
                    Vlerësim Klientësh
                  </div>
                </div>
                <div className="text-center gpu-accelerated">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    24/7
                  </div>
                  <div className="text-white/80 text-sm">Mbështetje</div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative bottom: collage of flats + subtle city skyline (replaces white gradient) */}
          {/* eslint-disable @next/next/no-img-element */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 sm:h-28 overflow-hidden">
            {/* City skyline background layer */}
            <div className="absolute inset-0 opacity-30">
              <div
                className="absolute -bottom-4 left-0 right-0 h-24 sm:h-28 animate-[marquee_90s_linear_infinite] will-change-transform"
                style={{
                  backgroundImage: "url('/images/properties/city-skyline.svg')",
                  backgroundRepeat: 'repeat-x',
                  backgroundSize: 'auto 100%',
                  filter: 'blur(0.2px)'
                }}
              />
            </div>

            {/* Flats layers */}
            <div className="absolute inset-0 opacity-25">
              <div className="absolute -bottom-2 left-0 right-0 flex gap-6 animate-[marquee_40s_linear_infinite] will-change-transform">
                {[
                  '/images/properties/apartment-1-main.svg',
                  '/images/properties/apartment-1-living.svg',
                  '/images/properties/house-1-main.svg',
                  '/images/properties/house-1-living.svg',
                  '/images/properties/studio-1-main.svg',
                  '/images/properties/penthouse-1-main.svg',
                  '/images/properties/villa-1-main.svg',
                ].map((src, idx) => (
                  <img
                    key={`row1-${idx}`}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-20 sm:h-24 object-contain opacity-90"
                  />
                ))}
                {/* duplicate for seamless loop */}
                {[
                  '/images/properties/apartment-1-main.svg',
                  '/images/properties/apartment-1-living.svg',
                  '/images/properties/house-1-main.svg',
                  '/images/properties/house-1-living.svg',
                  '/images/properties/studio-1-main.svg',
                  '/images/properties/penthouse-1-main.svg',
                  '/images/properties/villa-1-main.svg',
                ].map((src, idx) => (
                  <img
                    key={`row1b-${idx}`}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-20 sm:h-24 object-contain opacity-90"
                  />
                ))}
              </div>
              <div className="absolute -bottom-2 left-0 right-0 flex gap-6 animate-[marqueeReverse_50s_linear_infinite] will-change-transform opacity-80">
                {[
                  '/images/properties/villa-1-terrace.svg',
                  '/images/properties/penthouse-1-terrace.svg',
                  '/images/properties/house-1-kitchen.svg',
                  '/images/properties/apartment-1-kitchen.svg',
                  '/images/properties/studio-1-kitchen.svg',
                  '/images/properties/villa-1-garden.svg',
                ].map((src, idx) => (
                  <img
                    key={`row2-${idx}`}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-16 sm:h-20 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
                  />
                ))}
                {[
                  '/images/properties/villa-1-terrace.svg',
                  '/images/properties/penthouse-1-terrace.svg',
                  '/images/properties/house-1-kitchen.svg',
                  '/images/properties/apartment-1-kitchen.svg',
                  '/images/properties/studio-1-kitchen.svg',
                  '/images/properties/villa-1-garden.svg',
                ].map((src, idx) => (
                  <img
                    key={`row2b-${idx}`}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-16 sm:h-20 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* eslint-enable @next/next/no-img-element */}
        </section>

        {/* Main Content with light background */}
        <div className="bg-linear-to-br from-slate-50 to-blue-50">
        <section id="properties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">

          {/* Search Filters */}
          <DynamicSearchFilters
            properties={allProperties}
            onFilteredResults={handleFilteredResults}
          />

          {/* Performance Notice */}
          {totalProperties > MAX_INITIAL_LOAD && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Performancë e optimizuar:
                </span>{" "}
                Po shfaqen{" "}
                {displayedProperties.length} pasuri
                nga {totalProperties} gjithsej për performancë më të mirë.
                Përdorni filtrat për të gjetur pasuritë që ju interesojnë.
              </p>
            </div>
          )}

          {/* Properties and Map Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Search Results */}
            <div className="lg:col-span-2 property-grid">
              <DynamicSearchResults
                properties={displayedProperties}
                totalProperties={filteredProperties.length}
                hasMore={hasMoreProperties}
                onLoadMore={loadMoreProperties}
                isLoadingMore={isLoadingMore}
              />
            </div>

            {/* Map Sidebar - Hidden on mobile, shown on desktop */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Lokacionet e Pasurive
                  </h3>
                  <Link
                    href="/map"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Harta e Plotë →
                  </Link>
                </div>
                <div className="map-container">
                  <SimpleMapView
                    properties={filteredProperties.slice(0, 10)}
                    height="600px"
                  />
                </div>

                {filteredProperties.length !== allProperties.length && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Harta tregon:</span>{" "}
                      {filteredProperties.length} pasuri të filtruara nga {allProperties.length} gjithsej
                    </p>
                    {filteredProperties.length === 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Ndryshoni filtrat për të parë më shumë pasuri në hartë
                      </p>
                    )}
                  </div>
                )}

                {/* Full Map CTA */}
                <div className="mt-4">
                  <Link
                    href="/map"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm gpu-accelerated"
                  >
                    <Map className="h-4 w-4" />
                    Shiko Hartën e Plotë
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Map Preview - Only shown on mobile (static image to avoid heavy Leaflet) */}
            <div className="lg:hidden">
              <div className="bg-white rounded-lg complex-shadow p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Lokacionet
                  </h3>
                  <a
                    href="/map"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors mobile-button"
                  >
                    Shiko Hartën →
                  </a>
                </div>
                <div className="mobile-map">
                  {/** Use StaticMapPreview to avoid large scroll and rendering issues on mobile */}
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore - dynamic import below */}
                  <MobileStaticMap properties={filteredProperties.slice(0, 5)} />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {filteredProperties.length} pasuri në hartë
                  </p>
                  <a
                    href="/map"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium text-sm mobile-button gpu-accelerated"
                  >
                    <Map className="h-4 w-4" />
                    Hap Hartën e Plotë
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>

        {/* Contact Section */}
        <section
          id="contact"
          className="mobile-contact py-16 sm:py-20 pb-16 sm:pb-20"
          style={{ background: '#1E378D' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="max-w-3xl mx-auto space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
                  <div className="w-1 h-8 bg-linear-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                  Kontaktoni Me Ne
                </h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                  Jemi këtu për t&apos;ju ndihmuar të gjeni pasurinë perfekte. Kontaktoni me ne sot!
                </p>
              </div>
            </div>

            <div className="grid mobile-contact-grid md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-blue-600/10 transition-all gpu-accelerated shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Telefoni
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">Na telefononi çdo kohë</p>
                    <a
                      href="tel:+35569123456"
                      className="text-blue-400 hover:text-blue-300 transition-colors mobile-button font-medium"
                    >
                      +355 69 123 4567
                    </a>
                    <p className="text-xs text-gray-500 mt-1">24/7 Mbështetje</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-blue-600/10 transition-all gpu-accelerated shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shrink-0">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                    <p className="text-gray-400 text-sm mb-3">Dërgoni një email</p>
                    <a
                      href="mailto:info@realestate-tirana.al"
                      className="text-blue-400 hover:text-blue-300 transition-colors mobile-button font-medium break-all text-sm"
                    >
                      info@realestate-tirana.al
                    </a>
                    <p className="text-xs text-gray-500 mt-1">Përgjigje brenda 1 ore</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-blue-600/10 transition-all gpu-accelerated shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Lokacioni
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">Vizitoni zyrën tonë</p>
                    <p className="text-gray-300 text-sm">
                      Rruga &quot;Dëshmorët e Kombit&quot;
                      <br />
                      Tiranë 1001, Shqipëri
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Components */}
        <MobileFloatingActions
          onFilterToggle={() => setShowMobileSearch(true)}
          onMapToggle={() => {}}
          showMapToggle={false}
        />

        <MobileSearchModal
          isOpen={showMobileSearch}
          onClose={() => setShowMobileSearch(false)}
          properties={allProperties}
          onFilteredResults={handleFilteredResults}
        />

        {/* Mobile Map Modal removed */}
      </div>
    </Layout>
  );
}
