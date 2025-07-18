import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-red-600 mb-4">404</div>
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Faqja nuk u gjet
        </h1>
        
        <p className="text-gray-600 mb-8">
          Faqja që po kërkoni nuk ekziston ose është zhvendosur. 
          Ju lutem kontrolloni adresën ose kthehuni në faqen kryesore.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Kthehu në Faqen Kryesore
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kthehu Mbrapa
          </button>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Faqet më të popullarizuara
          </h2>
          <div className="space-y-2">
            <Link
              href="/"
              className="block text-red-600 hover:text-red-800 transition-colors"
            >
              Pasuritë e disponueshme
            </Link>
            <Link
              href="/admin/login"
              className="block text-red-600 hover:text-red-800 transition-colors"
            >
              Hyrja e administratorit
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            Nëse mendoni se kjo është një gabim, ju lutem na kontaktoni:
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <div>📧 info@pasuritëtiranës.al</div>
            <div>📞 +355 69 123 4567</div>
          </div>
        </div>
      </div>
    </div>
  );
}