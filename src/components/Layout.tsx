'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { useResponsive } from '@/hooks/useResponsive';

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
  const { isMobile } = useResponsive();

  const getLayoutClasses = () => {
    const baseClasses = 'min-h-dvh flex flex-col';

    switch (variant) {
      case 'fullmap':
        return 'min-h-dvh flex flex-col';
      case 'property':
        return `${baseClasses} ${isMobile ? 'pb-20' : ''}`; // Extra padding for mobile floating actions
      case 'admin':
        return `${baseClasses} bg-gray-100`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`${getLayoutClasses()} overflow-x-hidden ${className}`}>
      {showNavigation && <Navigation />}
      
      <main className="flex-grow min-h-0">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}