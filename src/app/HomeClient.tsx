'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import Layout from '@/components/Layout';
import StructuredData from '@/components/StructuredData';
import SimpleMapView from '@/components/SimpleMapView';
import { createDynamicImport, logChunkError } from '@/lib/dynamicImport';
import {
    MapPin,
    ArrowRight,
    Sparkles,
    Map,
    Home as HomeIcon
} from 'lucide-react';

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

interface HomeClientProps {
    initialProperties: Property[];
    initialTotal: number;
    maxInitialLoad: number;
}

export default function HomeClient({ initialProperties, initialTotal, maxInitialLoad }: HomeClientProps) {
    const [allProperties, setAllProperties] = useState<Property[]>(initialProperties);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>(initialProperties);
    const [displayedProperties, setDisplayedProperties] = useState<Property[]>(initialProperties.slice(0, PROPERTIES_PER_PAGE));
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialTotal > initialProperties.length);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

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
                const apiPage = Math.ceil(allProperties.length / maxInitialLoad) + 1;
                const res = await fetch(`/api/properties/paginated?page=${apiPage}&limit=${maxInitialLoad}`);

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
    }, [currentPage, filteredProperties, allProperties, hasMore, isLoadingMore, maxInitialLoad]);

    const hasMoreProperties = displayedProperties.length < filteredProperties.length;

    return (
        <Layout variant="homepage">
            <StructuredData type="website" />
            <StructuredData type="organization" />

            {/* Refined Premium Light Hero */}
            <div className="w-full relative bg-white">
                <section className="relative overflow-hidden pt-16 pb-24 sm:pt-20 sm:pb-32">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03]">
                        <div className="w-full h-full" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E378D' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-semibold mb-6 animate-fadeIn">
                                <HomeIcon className="h-4 w-4 mr-2" />
                                Agjencia Ekskluzive e Tiranës
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.15] tracking-tight">
                                Gjeni Shtëpinë Tuaj të{" "}
                                <span className="text-blue-600 bg-blue-50 px-2 rounded-lg italic">
                                    Përsosur
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                                Zbulimi i pasurive premium në lokacionet më të kërkuara të Tiranës.
                                Shërbim elitar për klientë që kërkojnë përsosmërinë.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="#properties"
                                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Shiko Shpalljet
                                </a>
                                <Link
                                    href="/map"
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Map className="h-5 w-5 text-blue-600" />
                                    Harta Interaktive
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-16 pt-8 border-t border-slate-100 grid grid-cols-3 gap-8">
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{allProperties.length}+</div>
                                    <div className="text-sm text-slate-500">Pasuri Aktive</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">5★</div>
                                    <div className="text-sm text-slate-500">Besueshmëri</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">24/7</div>
                                    <div className="text-sm text-slate-500">Mbështetje</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Search Section Transition */}
                <div className="bg-slate-50 relative pb-20">
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
                                                height="300px"
                                            />
                                        </div>
                                        <div className="mt-4 text-center">
                                            <Link
                                                href="/map"
                                                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                Hap Hartën e Plotë
                                                <ArrowRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Quick Highlight Box */}
                                    <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
                                        <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10">
                                            <Sparkles className="h-32 w-32" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 relative z-10">Keni nevojë për ndihmë?</h3>
                                        <p className="text-blue-100 mb-4 text-sm relative z-10">
                                            Agjentët tanë janë të gatshëm t'ju ndihmojnë në zgjedhjen e pronës ideale.
                                        </p>
                                        <Link
                                            href="/contact"
                                            className="inline-flex items-center px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors relative z-10"
                                        >
                                            Na Kontaktoni
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
