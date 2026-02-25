'use client';

import React, { ReactNode } from 'react';

interface ResponsiveLayoutProps {
  children: ReactNode;
  variant?: 'homepage' | 'fullmap' | 'property' | 'admin';
  showMobileNav?: boolean;
  showFloatingActions?: boolean;
  className?: string;
}

export default function ResponsiveLayout({
  children,
  variant = 'homepage',
  showMobileNav = true,
  showFloatingActions = true,
  className = '',
}: ResponsiveLayoutProps) {
  const getLayoutClasses = () => {
    const baseClasses = 'min-h-screen bg-white';
    
    switch (variant) {
      case 'fullmap':
        return 'h-screen flex flex-col bg-gray-50';
      case 'property':
        return `${baseClasses} pb-20 sm:pb-0`; // Extra padding for mobile floating actions
      case 'admin':
        return 'min-h-screen bg-gray-100';
      default:
        return `${baseClasses} ${showFloatingActions ? 'pb-20 sm:pb-0' : ''}`;
    }
  };

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: string;
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-6',
  className = '',
}: ResponsiveGridProps) {
  const getGridClasses = () => {
    const mobileClass = `grid-cols-${cols.mobile}`;
    const tabletClass = `md:grid-cols-${cols.tablet}`;
    const desktopClass = `lg:grid-cols-${cols.desktop}`;
    
    return `grid ${mobileClass} ${tabletClass} ${desktopClass} ${gap}`;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Container Component
interface ResponsiveContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveContainer({
  children,
  size = 'xl',
  padding = 'md',
  className = '',
}: ResponsiveContainerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-2xl';
      case 'md':
        return 'max-w-4xl';
      case 'lg':
        return 'max-w-6xl';
      case 'xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-7xl';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'px-4 sm:px-6';
      case 'md':
        return 'px-4 sm:px-6 lg:px-8';
      case 'lg':
        return 'px-6 sm:px-8 lg:px-12';
      default:
        return 'px-4 sm:px-6 lg:px-8';
    }
  };

  return (
    <div className={`${getSizeClasses()} mx-auto ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  className?: string;
}

export function ResponsiveText({
  children,
  variant = 'body',
  className = '',
}: ResponsiveTextProps) {
  const getTextClasses = () => {
    switch (variant) {
      case 'h1':
        return 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold';
      case 'h2':
        return 'text-2xl sm:text-3xl md:text-4xl font-bold';
      case 'h3':
        return 'text-xl sm:text-2xl md:text-3xl font-semibold';
      case 'h4':
        return 'text-lg sm:text-xl md:text-2xl font-semibold';
      case 'body':
        return 'text-sm sm:text-base';
      case 'caption':
        return 'text-xs sm:text-sm';
      default:
        return 'text-sm sm:text-base';
    }
  };

  const Component = variant.startsWith('h') ? variant as keyof React.JSX.IntrinsicElements : 'p';

  return (
    <Component className={`${getTextClasses()} ${className}`}>
      {children}
    </Component>
  );
}

// Responsive Button Component
interface ResponsiveButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: ResponsiveButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-white text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
      case 'outline':
        return 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500';
      case 'ghost':
        return 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500';
      default:
        return 'bg-white text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base';
      case 'lg':
        return 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg';
      default:
        return 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base';
    }
  };

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}

// Responsive Card Component
interface ResponsiveCardProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveCard({
  children,
  padding = 'md',
  shadow = 'md',
  className = '',
}: ResponsiveCardProps) {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm':
        return 'p-3 sm:p-4';
      case 'md':
        return 'p-4 sm:p-6';
      case 'lg':
        return 'p-6 sm:p-8';
      default:
        return 'p-4 sm:p-6';
    }
  };

  const getShadowClasses = () => {
    switch (shadow) {
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-md';
    }
  };

  return (
    <div className={`bg-white rounded-lg ${getShadowClasses()} ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
}