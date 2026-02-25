'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Phone, User } from 'lucide-react';


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
    if (!mounted) return false;
    const currentPath = pathname || '/';
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  return (
    <nav aria-label="Kryesore" className="sticky top-0 z-[100] border-b border-white/10" style={{ background: '#0d2b6b', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 py-2 group">
            <div className="relative">
              <div className="p-2 bg-white rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  <path d="M12 1l11 9h-3v10h-6v-6h-4v6H4V10H1L12 1z" opacity="0.3" />
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Real Estate Tiranë
              </h1>
              <p className="text-white/60 text-xs font-medium">Premium Properties • {new Date().getFullYear()}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? 'text-white bg-white/15'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
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
              className="flex items-center space-x-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ml-2"
            >
              <User className="h-4 w-4" />
              <span>Hyrje për Agjentë</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 touch-manipulation min-h-[44px] min-w-[44px]"
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
        <div className="px-4 pt-4 pb-6 space-y-2 bg-[var(--background)] border-t border-gray-100 shadow-xl">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${isActive(item.href)
                  ? 'text-[var(--primary-dark)] bg-blue-50'
                  : 'text-slate-600 hover:text-[var(--foreground)] hover:bg-slate-50'
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
            className="flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-base font-medium mt-4 shadow-sm"
          >
            <User className="h-5 w-5" />
            <span>Hyrje për Agjentë</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}