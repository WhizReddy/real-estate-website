import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

interface DynamicImportOptions {
  ssr?: boolean;
  loading?: () => JSX.Element;
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

interface RetryableImport<T = any> {
  (): Promise<{ default: ComponentType<T> }>;
}

/**
 * Enhanced dynamic import wrapper with retry mechanism for chunk loading failures
 */
export function createDynamicImport<T = any>(
  importFn: RetryableImport<T>,
  options: DynamicImportOptions = {}
) {
  const {
    ssr = false,
    loading = () => (
      <div className="h-32 bg-white rounded-lg shadow-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    ),
    retryAttempts = 3,
    retryDelay = 1000,
    onError,
  } = options;

  // Create a wrapper function that implements retry logic
  const retryableImport = async (): Promise<{ default: ComponentType<T> }> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        // Attempt to load the component
        const module = await importFn();
        return module;
      } catch (error) {
        lastError = error as Error;
        
        // Log the error for debugging
        console.warn(`Dynamic import attempt ${attempt}/${retryAttempts} failed:`, error);
        
        // If this is a chunk loading error, wait before retrying
        if (error instanceof Error && error.message.includes('chunk')) {
          if (attempt < retryAttempts) {
            // Exponential backoff: wait longer for each retry
            const delay = retryDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else {
          // For non-chunk errors, fail immediately
          break;
        }
      }
    }
    
    // All retries failed, call error handler if provided
    if (onError) {
      onError(lastError);
    }
    
    // Throw the last error to trigger fallback
    throw lastError;
  };

  return dynamic(retryableImport, {
    ssr,
    loading,
  });
}

/**
 * Default loading component for dynamic imports
 */
export const DefaultLoadingComponent = () => (
  <div className="h-32 bg-white rounded-lg shadow-md animate-pulse flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span className="text-gray-500 text-sm">Loading component...</span>
    </div>
  </div>
);

/**
 * Error fallback component for when dynamic imports fail completely
 */
export const DynamicImportErrorFallback = ({ 
  componentName = 'Component',
  onRetry 
}: { 
  componentName?: string;
  onRetry?: () => void;
}) => (
  <div className="h-32 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
    <div className="text-center p-4">
      <div className="text-red-600 text-sm font-medium mb-2">
        Failed to load {componentName}
      </div>
      <div className="text-red-500 text-xs mb-3">
        There was an error loading this component
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

/**
 * Utility function to check if an error is a chunk loading error
 */
export function isChunkLoadingError(error: Error): boolean {
  return (
    error.message.includes('chunk') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to load chunk') ||
    error.message.includes('ChunkLoadError')
  );
}

/**
 * Enhanced error logging for chunk loading issues
 */
export function logChunkError(error: Error, componentName: string) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    componentName,
    errorMessage: error.message,
    errorStack: error.stack,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    isChunkError: isChunkLoadingError(error),
  };
  
  console.error('Dynamic import error:', errorInfo);
  
  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, errorInfo);
  }
}