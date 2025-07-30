'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ErrorFallback } from './ErrorComponents';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export default function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: `global_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        }).catch(console.error);
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}

// Specific error boundaries for different sections of the app

// Layout Error Boundary
export function LayoutErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Layout error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Page Error Boundary
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Page error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Component Error Boundary (for individual components)
export function ComponentErrorBoundary({ 
  children, 
  componentName = 'Component' 
}: { 
  children: React.ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`${componentName} error:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}