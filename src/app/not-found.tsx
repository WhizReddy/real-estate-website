import Link from 'next/link';
import Layout from '@/components/Layout';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="mx-auto h-24 w-24 text-red-500 mb-6">
              <Home className="h-full w-full" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Faqja nuk u gjet
            </h2>
            <p className="text-gray-600 mb-8">
              Na vjen keq, por faqja që po kërkoni nuk ekziston ose është zhvendosur.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kthehu në Faqen Kryesore
            </Link>
            
            <Link
              href="/properties"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="h-5 w-5 mr-2" />
              Shiko Të Gjitha Pasuritë
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Nëse mendoni se kjo është një gabim, ju lutemi kontaktoni me ne.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}