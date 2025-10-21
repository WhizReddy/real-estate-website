'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Search, Phone, User } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Kryesore', href: '/', icon: Home },
    { name: 'Kontakti', href: '/#contact', icon: Phone },
  ];

  const isActive = (href: string) => {
    if (!mounted) return false; // Prevent hydration mismatch
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-2xl sticky top-0 z-[100] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 py-2 group">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  <path d="M12 1l11 9h-3v10h-6v-6h-4v6H4V10H1L12 1z" opacity="0.3"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight">
                Real Estate Tiranë
              </h1>
              <p className="text-blue-200 text-sm font-medium">Premium Properties • {new Date().getFullYear()}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-white bg-blue-700 shadow-lg'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Admin Link */}
            <Link
              href="/admin/login"
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <User className="h-4 w-4" />
              <span>Hyrje për Agjentë</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-lg text-blue-100 hover:text-white hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 touch-manipulation min-h-[44px] min-w-[44px]"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Mbyll menunë" : "Hap menunë kryesore"}
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 pt-4 pb-6 space-y-2 bg-gradient-to-b from-blue-800 to-blue-900 border-t border-blue-700">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-white bg-blue-700 shadow-lg'
                    : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          {/* Mobile Admin Link */}
          <Link
            href="/admin/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-base font-medium mt-4 shadow-lg"
          >
            <User className="h-5 w-5" />
            <span>Hyrje për Agjentë</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}