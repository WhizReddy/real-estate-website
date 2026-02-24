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

// Dynamically import map component to avoid SSR issues with Leaflet
const SimpleMapView = dynamic(
  () => import("@/components/SimpleMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="h-[300px] bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <CreativeLoader type="properties" size="lg" />
      </div>
    );
  }

  return (
    <Layout variant="homepage">
      <StructuredData type="website" />
      <StructuredData type="organization" />

      {/* Hero with Albania background */}
      <div className="w-full relative">
        <section className="relative overflow-hidden min-h-[600px] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/albania-hero.png"
              alt="Albania aerial view"
              className="w-full h-full object-cover"
            />
            {/* Light overlay for text readability - keep the blue tones visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-gray-50" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-semibold mb-6">
                <HomeIcon className="h-4 w-4 mr-2" />
                Agjencia Ekskluzive e Tiranës
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                Gjeni Shtëpinë Tuaj të{" "}
                <span className="text-blue-400">
                  Përsosur
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed max-w-lg">
                Zbulimi i pasurive premium në lokacionet më të kërkuara të Tiranës.
                Shërbim elitar për klientë që kërkojnë përsosmërinë.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a
                  href="#properties"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  Shiko Shpalljet
                </a>
                <Link
                  href="/map"
                  className="w-full sm:w-auto px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/25 transition-all flex items-center justify-center gap-2"
                >
                  <Map className="h-5 w-5" />
                  Harta Interaktive
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-14 flex gap-10">
                <div>
                  <div className="text-2xl font-bold text-white">{allProperties.length}+</div>
                  <div className="text-sm text-white/60">Pasuri Aktive</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">5★</div>
                  <div className="text-sm text-white/60">Besueshmëri</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-white/60">Mbështetje</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Properties Section */}
        <div className="bg-gray-50 relative pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
            <DynamicSearchFilters
              properties={allProperties}
              onFilteredResults={handleFilteredResults}
            />
          </div>

          <section id="properties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
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
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Lokacionet
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                      <SimpleMapView
                        properties={filteredProperties.slice(0, 10)}
                        height="400px"
                      />
                    </div>
                    <Link
                      href="/map"
                      className="mt-4 w-full py-3 text-center bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors block text-sm"
                    >
                      Hap Hartën e Plotë
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Contact Section */}
        <section id="contact" className="bg-slate-900 py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold mb-4">
                  Kontaktoni
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Gati për të Lëvizur?</h2>
                <p className="text-slate-300 text-lg mb-8 max-w-md">
                  Ekipi ynë i ekspertëve është gati t&apos;ju ndihmojë në çdo hap të procesit të pasurive të patundshme.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="p-3 bg-blue-600 rounded-xl text-white">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Na telefononi</div>
                      <div className="font-bold text-white">+355 69 123 4567</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl relative">
                <h3 className="text-xl font-bold text-white mb-2">Na Kontaktoni</h3>
                <p className="text-slate-300 mb-6 text-sm">
                  Na tregoni se çfarë po kërkoni dhe ne do t&apos;ju kontaktojmë me ofertat më të mira.
                </p>
                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    placeholder="Emri juaj"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email-i juaj"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                  />
                  <textarea
                    placeholder="Mesazhi juaj..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all resize-none"
                  />
                </div>
                <button
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-center transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/30"
                >
                  Dërgo Mesazh
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <MobileFloatingActions
        onFilterToggle={() => setShowMobileSearch(true)}
        onMapToggle={() => { }}
        showMapToggle={false}
      />

      <MobileSearchModal
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        properties={allProperties}
        onFilteredResults={handleFilteredResults}
      />
    </Layout>
  );
}
