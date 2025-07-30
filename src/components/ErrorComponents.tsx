'use client';

import { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MapPin, Wifi, Server } from 'lucide-react';

// Generic Error Message Component
interface ErrorMessageProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorMessage({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  action,
  className = ''
}: ErrorMessageProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}

// Map Error Component
interface MapErrorProps {
  onRetry?: () => void;
  error?: string;
}

export function MapError({ onRetry, error }: MapErrorProps) {
  return (
    <div className="h-full w-full bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
      <div className="text-center p-6">
        <div className="relative mb-4">
          <MapPin className="h-16 w-16 text-blue-500 mx-auto" />
          <AlertTriangle className="h-6 w-6 text-blue-600 absolute -top-1 -right-1" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Map Failed to Load</h3>
        <p className="text-blue-700 mb-4 text-sm">
          {error || 'Unable to load the map. Please check your connection and try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Loading Map
          </button>
        )}
      </div>
    </div>
  );
}

// Network Error Component
interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message }: NetworkErrorProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
      <Wifi className="h-12 w-12 text-orange-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-orange-900 mb-2">Connection Problem</h3>
      <p className="text-orange-700 mb-4">
        {message || 'Please check your internet connection and try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

// Server Error Component
interface ServerErrorProps {
  onRetry?: () => void;
  statusCode?: number;
}

export function ServerError({ onRetry, statusCode }: ServerErrorProps) {
  const getErrorMessage = () => {
    switch (statusCode) {
      case 404:
        return 'The requested page or resource was not found.';
      case 500:
        return 'Internal server error. Our team has been notified.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Server error occurred. Please try again.';
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <Server className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Server Error {statusCode && `(${statusCode})`}
      </h3>
      <p className="text-red-700 mb-4">{getErrorMessage()}</p>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Home className="h-4 w-4" />
          Go Home
        </button>
      </div>
    </div>
  );
}

// Property Not Found Component
export function PropertyNotFound() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Home className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        The property you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.href = '/properties'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Properties
        </button>
      </div>
    </div>
  );
}

// Search No Results Component
interface SearchNoResultsProps {
  query?: string;
  onClearFilters?: () => void;
}

export function SearchNoResults({ query, onClearFilters }: SearchNoResultsProps) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Home className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        No Properties Found
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {query 
          ? `No properties match your search for "${query}". Try adjusting your filters or search terms.`
          : 'No properties match your current filters. Try adjusting your search criteria.'
        }
      </p>
      <div className="flex gap-4 justify-center">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
        <button
          onClick={() => window.location.href = '/properties'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View All Properties
        </button>
      </div>
    </div>
  );
}

// Error Boundary Fallback Component
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorId?: string;
}

export function ErrorFallback({ error, resetError, errorId }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] bg-red-50 border border-red-200 rounded-lg flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-xl font-bold text-red-900 mb-4">Something went wrong</h2>
        <p className="text-red-700 mb-6">
          An unexpected error occurred. Our team has been notified and is working on a fix.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left bg-red-100 rounded p-4">
            <summary className="cursor-pointer font-medium text-red-800 mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
        
        {errorId && (
          <p className="text-xs text-red-600 mb-4">Error ID: {errorId}</p>
        )}
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetError}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Retry Wrapper Component
interface RetryWrapperProps {
  children: ReactNode;
  onRetry: () => void;
  error?: boolean;
  errorMessage?: string;
}

export function RetryWrapper({ 
  children, 
  onRetry, 
  error = false, 
  errorMessage 
}: RetryWrapperProps) {
  if (error) {
    return (
      <ErrorMessage
        message={errorMessage}
        action={{
          label: 'Retry',
          onClick: onRetry
        }}
      />
    );
  }

  return <>{children}</>;
}