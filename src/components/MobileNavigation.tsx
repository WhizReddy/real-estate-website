"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Search, MapPin, Phone, User, Mail } from "lucide-react";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Ballina", icon: Home },
    { href: "/properties", label: "Pasuritë", icon: Search },
    { href: "/contact", label: "Kontakti", icon: Phone },
    { href: "/admin", label: "Admin", icon: User },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all duration-200 active:scale-95"
        style={{ touchAction: 'manipulation' }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-gray-700" />
        ) : (
          <Menu className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Real Estate</h2>
                    <p className="text-blue-200 text-sm">Tirana, Albania</p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 py-6">
                <ul className="space-y-2 px-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95 ${isActive
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Contact Info */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="space-y-3">
                  <a
                    href="tel:+35569123456"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors active:scale-95"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">+355 69 123 4567</span>
                  </a>

                  <a
                    href="mailto:info@realestate-tirana.al"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors active:scale-95"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">info@realestate-tirana.al</span>
                  </a>

                  <div className="flex items-center space-x-3 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Rruga "Dëshmorët e Kombit", Tiranë</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}