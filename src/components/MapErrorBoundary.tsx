'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MapPin, RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallbackHeight?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export default class MapErrorBoundary extends Component<Props, State> {
  private maxRetries = 2;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map Error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log map errors for debugging
    this.logMapError(error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logMapError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: 'map_error',
      mapContext: {
        leafletAvailable: typeof window !== 'undefined' && !!(window as any).L,
        geolocationSupported: typeof navigator !== 'undefined' && !!navigator.geolocation,
      },
    };

    console.error('Map Error Report:', errorReport);
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleRefreshPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      const height = this.props.fallbackHeight || '400px';
      
      return (
        <div 
          className="w-full rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center"
          style={{ height }}
        >
          <div className="text-center p-6 max-w-sm">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Map Loading Failed
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {this.state.error?.message?.includes('Leaflet') 
                  ? 'Map library failed to load. Please check your internet connection.'
                  : 'Unable to load the map. This might be due to network issues or browser compatibility.'}
              </p>
            </div>

            <div className="space-y-2">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - this.state.retryCount} left)
                </button>
              )}
              
              <button
                onClick={this.handleRefreshPage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <Home className="h-4 w-4" />
                Refresh Page
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                You can still browse properties using the list view below.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-24">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}