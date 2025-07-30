'use client';

import { ReactNode } from 'react';
import { Loader2, MapPin, Home, Search } from 'lucide-react';

// Generic loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Full page loading screen
interface PageLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export function PageLoading({ message = 'Po ngarkohet...', showLogo = true }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        {showLogo && (
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg mx-auto mb-4 flex items-center justify-center">
              <Home className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Real Estate Tiranë</h1>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <LoadingSpinner size="lg" className="text-blue-600" />
          <span className="text-lg text-gray-700 font-medium">{message}</span>
        </div>
        
        <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Property card skeleton
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 sm:h-56 bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4 sm:p-6">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        
        {/* Address */}
        <div className="flex items-center mb-4">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 rounded flex-1"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-3">
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Property grid skeleton
interface PropertyGridSkeletonProps {
  count?: number;
}

export function PropertyGridSkeleton({ count = 6 }: PropertyGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Map loading skeleton
export function MapLoadingSkeleton() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center animate-pulse">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <MapPin className="h-8 w-8 text-blue-500" />
        </div>
        <p className="text-blue-600 font-medium">Po ngarkohet harta...</p>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Search loading state
export function SearchLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-300" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      {/* Results skeleton */}
      <PropertyGridSkeleton count={9} />
    </div>
  );
}

// Button loading state
interface LoadingButtonProps {
  children: ReactNode;
  isLoading: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function LoadingButton({ 
  children, 
  isLoading, 
  disabled = false, 
  className = '', 
  onClick 
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 ${className} ${
        (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}

// Form loading overlay
interface FormLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function FormLoadingOverlay({ isLoading, message = 'Po ruhet...' }: FormLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-blue-600 mb-2" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Infinite scroll loading
export function InfiniteScrollLoading() {
  return (
    <div className="flex justify-center py-8">
      <div className="flex items-center gap-3">
        <LoadingSpinner className="text-blue-600" />
        <span className="text-gray-600">Po ngarkohen më shumë pasuri...</span>
      </div>
    </div>
  );
}

// Image loading placeholder
interface ImageLoadingPlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ImageLoadingPlaceholder({ 
  width, 
  height, 
  className = '' 
}: ImageLoadingPlaceholderProps) {
  return (
    <div 
      className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-gray-400">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

// Suspense fallback components
export function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
        <p className="text-gray-600">Po ngarkohet përmbajtja...</p>
      </div>
    </div>
  );
}

// Component loading wrapper
interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function LoadingWrapper({ 
  isLoading, 
  children, 
  fallback, 
  className = '' 
}: LoadingWrapperProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {fallback || <SuspenseFallback />}
      </div>
    );
  }

  return <>{children}</>;
}