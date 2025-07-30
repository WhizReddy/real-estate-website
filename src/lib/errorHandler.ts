// Global error handling utilities

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  errorId: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Error severity classification
export function classifyError(error: Error): 'low' | 'medium' | 'high' | 'critical' {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Critical errors
  if (
    message.includes('network error') ||
    message.includes('failed to fetch') ||
    message.includes('database') ||
    message.includes('auth')
  ) {
    return 'critical';
  }

  // High severity errors
  if (
    message.includes('cannot read property') ||
    message.includes('undefined is not a function') ||
    message.includes('permission denied') ||
    stack.includes('react')
  ) {
    return 'high';
  }

  // Medium severity errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('not found')
  ) {
    return 'medium';
  }

  // Default to low severity
  return 'low';
}

// Generate unique error ID
export function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create error report
export function createErrorReport(
  error: Error,
  context?: string,
  userId?: string
): ErrorReport {
  return {
    message: error.message,
    stack: error.stack,
    errorId: generateErrorId(),
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userId,
    context,
    severity: classifyError(error),
  };
}

// Global error handler
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private isOnline = true;

  private constructor() {
    this.setupGlobalHandlers();
    this.setupNetworkMonitoring();
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  private setupGlobalHandlers() {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = new Error(event.reason?.message || 'Unhandled promise rejection');
      error.stack = event.reason?.stack;
      this.handleError(error, 'unhandled_promise_rejection');
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      const error = new Error(event.message);
      error.stack = event.error?.stack;
      this.handleError(error, 'global_javascript_error');
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const error = new Error(`Resource failed to load: ${(event.target as any)?.src || 'unknown'}`);
        this.handleError(error, 'resource_loading_error');
      }
    }, true);
  }

  private setupNetworkMonitoring() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  handleError(error: Error, context?: string, userId?: string) {
    const errorReport = createErrorReport(error, context, userId);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error Handler:', errorReport);
    }

    // Queue error for reporting
    this.errorQueue.push(errorReport);

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }

    // Show user notification for critical errors
    if (errorReport.severity === 'critical') {
      this.showErrorNotification(errorReport);
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendErrorReports(errorsToSend);
    } catch (error) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errorsToSend);
      console.warn('Failed to send error reports:', error);
    }
  }

  private async sendErrorReports(errors: ErrorReport[]) {
    // In a real application, send to your error reporting service
    // For now, we'll just log them
    
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to error reporting service
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ errors }),
        // });

        console.log('Error reports sent:', errors.length);
      } catch (error) {
        throw new Error('Failed to send error reports');
      }
    }
  }

  private showErrorNotification(errorReport: ErrorReport) {
    // Show a user-friendly notification for critical errors
    if (typeof window === 'undefined') return;

    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="font-medium">Ndodhi një gabim</p>
          <p class="text-sm opacity-90">Ju lutem rifreskoni faqen</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-auto">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.parentElement.removeChild(notification);
      }
    }, 5000);
  }

  // Get error statistics
  getErrorStats() {
    return {
      queueLength: this.errorQueue.length,
      isOnline: this.isOnline,
    };
  }
}

// Initialize global error handler
export function initializeErrorHandler() {
  if (typeof window !== 'undefined') {
    GlobalErrorHandler.getInstance();
  }
}

// Utility function for handling async errors
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: string
): Promise<T | null> {
  return promise.catch((error) => {
    GlobalErrorHandler.getInstance().handleError(error, context);
    return null;
  });
}

// Utility function for wrapping functions with error handling
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          GlobalErrorHandler.getInstance().handleError(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      GlobalErrorHandler.getInstance().handleError(error as Error, context);
      throw error;
    }
  }) as T;
}