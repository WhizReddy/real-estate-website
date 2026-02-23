'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  variant?: 'homepage' | 'fullmap' | 'property' | 'admin';
  className?: string;
}

export default function Layout({
  children,
  showNavigation = true,
  showFooter = true,
  variant = 'homepage',
  className = ''
}: LayoutProps) {
  const getLayoutClasses = () => {
    const baseClasses = 'min-h-dvh flex flex-col';

    switch (variant) {
      case 'admin':
        return `${baseClasses} bg-gray-100`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`${getLayoutClasses()} overflow-x-hidden ${className}`}>
      {showNavigation && <Navigation />}

      <main className="flex-grow min-h-0 bg-transparent">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}