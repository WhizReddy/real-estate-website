'use client';

import { useState, useCallback } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  retryCount: number;
}

interface UseErrorHandlerOptions {
  maxRetries?: number;
  onError?: (error: Error, errorId: string) => void;
  onRetry?: (retryCount: number) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { maxRetries = 3, onError, onRetry } = options;
  
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: '',
    retryCount: 0,
  });

  const generateErrorId = useCallback(() => {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const handleError = useCallback((error: Error) => {
    const errorId = generateErrorId();
    
    setErrorState(prev => ({
      hasError: true,
      error,
      errorId,
      retryCount: prev.retryCount,
    }));

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by useErrorHandler:', error);
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorId);
    }

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      logErrorToService(error, errorId);
    }
  }, [generateErrorId, onError]);

  const retry = useCallback(() => {
    if (errorState.retryCount >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) exceeded`);
      return false;
    }

    setErrorState(prev => ({
      hasError: false,
      error: null,
      errorId: '',
      retryCount: prev.retryCount + 1,
    }));

    if (onRetry) {
      onRetry(errorState.retryCount + 1);
    }

    return true;
  }, [errorState.retryCount, maxRetries, onRetry]);

  const reset = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0,
    });
  }, []);

  const canRetry = errorState.retryCount < maxRetries;

  return {
    ...errorState,
    handleError,
    retry,
    reset,
    canRetry,
  };
}

// Async operation wrapper with error handling
export function useAsyncError() {
  const errorHandler = useErrorHandler();

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T | null> => {
    try {
      const result = await asyncFn();
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errorHandler.handleError(err);
      if (options?.onError) {
        options.onError(err);
      }
      return null;
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    executeAsync,
  };
}

// Network error detection
export function useNetworkError() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const checkNetworkError = useCallback((error: Error) => {
    // Check for common network error patterns
    const networkErrorPatterns = [
      /network/i,
      /fetch/i,
      /connection/i,
      /timeout/i,
      /cors/i,
    ];

    const isNetworkError = networkErrorPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );

    if (isNetworkError || !navigator.onLine) {
      setNetworkError(error.message);
      setIsOnline(false);
      return true;
    }

    return false;
  }, []);

  const clearNetworkError = useCallback(() => {
    setNetworkError(null);
    setIsOnline(navigator.onLine);
  }, []);

  return {
    isOnline,
    networkError,
    checkNetworkError,
    clearNetworkError,
  };
}

// Error logging service
function logErrorToService(error: Error, errorId: string) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    errorId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: null, // Add user ID if available
  };

  // In a real application, send to your error tracking service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  try {
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    }).catch(console.error);
  } catch (logError) {
    console.error('Failed to log error to service:', logError);
  }
}

// Error boundary hook for functional components
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return {
    captureError,
    resetError,
  };
}