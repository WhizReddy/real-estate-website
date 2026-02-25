'use client';

import { Property } from '@/types';
import PropertyGrid from './PropertyGrid';
import { Search, Home } from 'lucide-react';

interface SearchResultsProps {
  properties: Property[];
  totalProperties: number;
  searchTerm?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export default function SearchResults({
  properties,
  totalProperties,
  searchTerm,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false
}: SearchResultsProps) {
  const hasResults = properties.length > 0;
  const isFiltered = properties.length !== totalProperties;

  return (
    <div>
      {/* Results Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {hasResults ? (
                <>
                  {isFiltered ? (
                    <>
                      <Search className="inline h-5 w-5 mr-2 text-[var(--primary)]" />
                      Rezultatet e Kërkimit
                    </>
                  ) : (
                    <>
                      <Home className="inline h-5 w-5 mr-2 text-[var(--primary)]" />
                      Të Gjitha Pasuritë
                    </>
                  )}
                </>
              ) : (
                <>
                  <Search className="inline h-5 w-5 mr-2 text-gray-400 " />
                  Nuk u gjetën rezultate
                </>
              )}
            </h2>
            <p className="text-gray-600  mt-1">
              {hasResults ? (
                <>
                  {properties.length} pasuri{properties.length !== 1 ? '' : ''}
                  {isFiltered && ` nga ${totalProperties} gjithsej`}
                  {searchTerm && (
                    <span className="text-[var(--primary)] font-medium">
                      {' '}për "{searchTerm}"
                    </span>
                  )}
                </>
              ) : (
                'Provoni të ndryshoni kriteret e kërkimit'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Results Content */}
      {hasResults ? (
        <>
          <PropertyGrid properties={properties} />

          {/* Load More Button */}
          {hasMore && onLoadMore && (
            <div className="mt-8 sm:mt-12 text-center">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                aria-label="Ngarko më shumë pasuri"
                className="btn-primary inline-flex items-center px-6 py-3 sm:px-8 sm:py-3 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Po ngarkohen më shumë...
                  </>
                ) : (
                  <>
                    <Home className="h-4 w-4 mr-2" />
                    Shiko më shumë pasuri
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <NoResultsMessage searchTerm={searchTerm} />
      )}
    </div>
  );
}

function NoResultsMessage({ searchTerm }: { searchTerm?: string }) {
  return (
    <div className="text-center py-16 card shadow-sm">
      <div className="w-full px-4 sm:px-0 sm:max-w-md mx-auto">
        <div className="mb-6">
          <Search className="h-16 w-16 text-gray-300  mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Nuk u gjetën pasuritë
          </h3>
          <p className="text-gray-600 ">
            {searchTerm ? (
              <>
                Nuk gjetëm asnjë pasuri që përputhet me kërkimin tuaj për{' '}
                <span className="font-medium text-[var(--primary)]">"{searchTerm}"</span>
              </>
            ) : (
              'Nuk gjetëm asnjë pasuri që përputhet me kriteret e zgjedhura.'
            )}
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-500 ">
          <p className="font-medium">Sugjerime për kërkimin:</p>
          <ul className="space-y-1">
            <li>• Kontrolloni drejtshkrimin e fjalëve</li>
            <li>• Përdorni fjalë më të përgjithshme</li>
            <li>• Hiqni disa filtra për të zgjeruar kërkimin</li>
            <li>• Provoni të kërkoni sipas qytetit ose zonës</li>
          </ul>
        </div>

        <div className="mt-8">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-[var(--primary)]/30 text-[var(--primary)] rounded-md hover:bg-[var(--primary)]/10 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Shiko të gjitha pasuritë
          </button>
        </div>
      </div>
    </div>
  );
}
