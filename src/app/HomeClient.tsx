'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import { getTranslation } from '@/lib/i18n';
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
    const [locale, setLocale] = useState('sq');

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith("/en")) {
            setLocale('en');
        }
    }, []);

    const t = (key: string) => getTranslation(key, locale as any);

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

            {/* Refined Premium Light/Dark Hero */}
            <div className="w-full relative bg-[var(--background)]">
                <section className="relative overflow-hidden pt-16 pb-24 sm:pt-20 sm:pb-32">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03]">
                        <div className="w-full h-full" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E378D' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                    </div>

                    <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center w-full sm:max-w-5xl md:max-w-6xl mx-auto">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-[var(--primary-dark)] text-sm font-semibold mb-6 animate-fadeIn">
                                <HomeIcon className="h-4 w-4 mr-2" />
                                {t('exclusiveAgency')}
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] mb-6 leading-tight tracking-tight">
                                {t('findYourPerfectHome').split(' ')[0]}{" "}
                                <span className="text-[var(--primary)] bg-blue-50 px-2 rounded-lg italic">
                                    {t('findYourPerfectHome').split(' ').slice(1).join(' ')}
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl text-[var(--foreground)] opacity-80 mb-10 leading-relaxed w-full sm:max-w-3xl mx-auto">
                                {t('heroDescription')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
                                <a
                                    href="#properties"
                                    className="btn-primary w-full sm:w-auto px-8 py-4 text-lg rounded-2xl shadow-xl shadow-primary/20"
                                >
                                    {t('viewListings')}
                                </a>
                                <Link
                                    href="/map"
                                    className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg border-2 rounded-2xl flex items-center justify-center gap-2"
                                >
                                    <Map className="h-5 w-5 text-[var(--primary)]" />
                                    {t('interactiveMap')}
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-8 md:gap-12">
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{allProperties.length}+</div>
                                    <div className="text-sm text-slate-500">{t('activeProperties')}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">5★</div>
                                    <div className="text-sm text-slate-500">{t('reliability')}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">24/7</div>
                                    <div className="text-sm text-slate-500">{t('support')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Search Section Transition */}
                <div className="bg-[var(--background)] relative pb-20">
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
                                    <div className="card p-5">
                                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-[var(--primary)]" />
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
                                    <div className="bg-blue-50 p-6 rounded-2xl text-[var(--foreground)] shadow-lg overflow-hidden relative">
                                        <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10">
                                            <Sparkles className="h-32 w-32 text-[var(--primary)]" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 relative z-10">{t('readyToMove') || 'Keni nevojë për ndihmë?'}</h3>
                                        <p className="text-slate-600 mb-4 text-sm relative z-10">
                                            {t('teamHelpDescription') || 'Agjentët tanë janë të gatshëm t\'ju ndihmojnë në zgjedhjen e pronës ideale.'}
                                        </p>
                                        <Link
                                            href="/contact"
                                            className="inline-flex items-center px-4 py-2 bg-white text-[var(--primary)] border border-blue-100 text-sm font-bold rounded-lg hover:bg-white/80 transition-colors relative z-10"
                                        >
                                            {t('contactUs') || 'Na Kontaktoni'}
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
