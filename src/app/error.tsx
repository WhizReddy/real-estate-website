'use client';

import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="mx-auto h-24 w-24 text-red-500 mb-6">
              <AlertTriangle className="h-full w-full" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Diçka shkoi keq
            </h1>
            <p className="text-gray-600 mb-8">
              Na vjen keq, por ndodhi një gabim i papritur. Ju lutemi provoni përsëri ose kthehuni në faqen kryesore.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">Detajet e gabimit:</h3>
                <pre className="text-xs text-red-700 overflow-auto whitespace-pre-wrap">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Provo Përsëri
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Kthehu në Faqen Kryesore
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}