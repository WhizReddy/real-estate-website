'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 text-red-500 mb-6">
            <AlertTriangle className="h-full w-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Diçka shkoi keq
          </h1>
          <p className="text-gray-600 mb-8">
            Na vjen keq, por ndodhi një gabim i papritur. Ju lutemi provoni përsëri.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-red-800 mb-2">Detajet e gabimit:</h3>
              <pre className="text-xs text-red-700 overflow-auto">
                {error.message}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={resetError}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Provo Përsëri
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Kthehu në Faqen Kryesore
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;