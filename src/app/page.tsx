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
import { Home as HomeIcon, BarChart3, MapPin, Map } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  // (Removed) viewport height state used by deleted map modal
  // const [viewportHeight, setViewportHeight] = useState<number>(0);
  // Removed isMapUpdating as it was unused

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await fetch("/api/properties/active", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        const activeProperties: Property[] = data.properties || [];
        const limitedProperties = activeProperties.slice(0, MAX_INITIAL_LOAD);
        setAllProperties(activeProperties);
        setFilteredProperties(limitedProperties);
        setDisplayedProperties(limitedProperties.slice(0, PROPERTIES_PER_PAGE));
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

  const loadMoreProperties = useCallback(() => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * PROPERTIES_PER_PAGE;
      const newDisplayedProperties = filteredProperties.slice(
        startIndex,
        endIndex
      );

      setDisplayedProperties(newDisplayedProperties);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }, 500);
  }, [currentPage, filteredProperties, isLoadingMore]);

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
  <div className="bg-linear-to-br from-slate-50 to-blue-50 min-h-screen">
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
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/15 backdrop-blur font-medium transition-colors"
                  >
                    Shiko Pasuritë
                  </a>
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

        {/* Main Content */}
        <section id="properties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Filters */}
          <DynamicSearchFilters
            properties={allProperties}
            onFilteredResults={handleFilteredResults}
          />

          {/* Performance Notice */}
          {allProperties.length > MAX_INITIAL_LOAD && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Performancë e optimizuar:
                </span>{" "}
                Po shfaqen{" "}
                {Math.min(filteredProperties.length, MAX_INITIAL_LOAD)} pasuri
                nga {allProperties.length} gjithsej për performancë më të mirë.
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

        {/* Contact Section */}
        <section
          id="contact"
          className="bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 mobile-contact py-12 sm:py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Kontaktoni Me Ne
              </h2>
              <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto px-4">
                Jemi këtu për t&apos;ju ndihmuar të gjeni pasurinë perfekte.
                Kontaktoni me ne sot!
              </p>
            </div>

            <div className="grid mobile-contact-grid md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center gpu-accelerated complex-shadow">
                <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Telefoni
                </h3>
                <p className="text-blue-200 mb-4">Na telefononi çdo kohë</p>
                <a
                  href="tel:+35569123456"
                  className="text-blue-300 hover:text-white transition-colors mobile-button inline-block"
                >
                  +355 69 123 4567
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center gpu-accelerated complex-shadow">
                <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
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
                <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
                <p className="text-blue-200 mb-4">Dërgoni një email</p>
                <a
                  href="mailto:info@realestate-tirana.al"
                  className="text-blue-300 hover:text-white transition-colors mobile-button inline-block break-all"
                >
                  info@realestate-tirana.al
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center gpu-accelerated complex-shadow">
                <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Lokacioni
                </h3>
                <p className="text-blue-200 mb-4">Vizitoni zyrën tonë</p>
                <p className="text-blue-300 text-sm sm:text-base">
                  Rruga &quot;Dëshmorët e Kombit&quot;
                  <br />
                  Tiranë, Shqipëri
                </p>
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
