'use client';

import React, { ComponentType, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ErrorFallback } from './ErrorComponents';

interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean;
}

export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = (props: P) => {
    const { fallback, onError, isolate = false } = options;

    return (
      <ErrorBoundary
        onError={onError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default withErrorBoundary;