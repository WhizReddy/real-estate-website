'use client';

// Analytics and performance monitoring utilities

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'search' | 'filter' | 'map_interaction' | 'property_view';
  element?: string;
  data?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean;
  private queue: AnalyticsEvent[] = [];
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'production';
    
    if (this.isEnabled) {
      this.initializePerformanceMonitoring();
      this.setupErrorTracking();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize performance monitoring for Core Web Vitals
  private initializePerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor custom performance metrics
    this.observeCustomMetrics();
    
    // Monitor navigation timing
    this.trackNavigationTiming();
  }

  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entry: any) => {
      this.trackPerformanceMetric('LCP', entry.startTime);
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entry: any) => {
      this.trackPerformanceMetric('FID', entry.processingStart - entry.startTime);
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        this.trackPerformanceMetric('CLS', entry.value);
      }
    });

    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entry: any) => {
      if (entry.name === 'first-contentful-paint') {
        this.trackPerformanceMetric('FCP', entry.startTime);
      }
    });

    // Time to First Byte (TTFB)
    this.observeMetric('navigation', (entry: any) => {
      this.trackPerformanceMetric('TTFB', entry.responseStart - entry.requestStart);
    });
  }

  private observeMetric(type: string, callback: (entry: any) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type, buffered: true });
    } catch (error) {
      console.warn(`Failed to observe ${type} metrics:`, error);
    }
  }

  private observeCustomMetrics() {
    // Monitor long tasks
    this.observeMetric('longtask', (entry: any) => {
      this.trackPerformanceMetric('Long Task', entry.duration);
    });

    // Monitor resource loading
    this.observeMetric('resource', (entry: any) => {
      if (entry.name.includes('map') || entry.name.includes('tile')) {
        this.trackPerformanceMetric('Map Resource Load', entry.duration);
      }
    });
  }

  private trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformanceMetric('DOM Content Loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          this.trackPerformanceMetric('Load Complete', navigation.loadEventEnd - navigation.loadEventStart);
          this.trackPerformanceMetric('Total Page Load', navigation.loadEventEnd - navigation.fetchStart);
        }
      }, 0);
    });
  }

  private setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    });
  }

  // Public methods for tracking events
  public trackEvent(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        url: window.location.href,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    if (this.isEnabled) {
      this.sendEvent(event);
    } else {
      console.log('Analytics Event:', event);
    }
  }

  public trackUserInteraction(interaction: Omit<UserInteraction, 'timestamp' | 'sessionId'>) {
    const fullInteraction: UserInteraction = {
      ...interaction,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.trackEvent('user_interaction', fullInteraction);
  }

  public trackPerformanceMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    if (this.isEnabled) {
      this.sendPerformanceMetric(metric);
    } else {
      console.log('Performance Metric:', metric);
    }
  }

  public trackError(error: {
    type: string;
    message: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    stack?: string;
  }) {
    this.trackEvent('error', {
      ...error,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }

  // Map-specific tracking methods
  public trackMapInteraction(action: string, data?: Record<string, any>) {
    this.trackUserInteraction({
      type: 'map_interaction',
      element: 'map',
      data: {
        action,
        ...data,
      },
    });
  }

  public trackMapPerformance(metric: string, value: number, additionalData?: Record<string, any>) {
    this.trackEvent('map_performance', {
      metric,
      value,
      ...additionalData,
    });
  }

  public trackPropertyView(propertyId: string, source?: string) {
    this.trackUserInteraction({
      type: 'property_view',
      element: 'property_card',
      data: {
        propertyId,
        source,
      },
    });
  }

  public trackSearch(query: string, filters?: Record<string, any>, resultCount?: number) {
    this.trackUserInteraction({
      type: 'search',
      element: 'search_form',
      data: {
        query,
        filters,
        resultCount,
      },
    });
  }

  public trackFilter(filterType: string, filterValue: any, resultCount?: number) {
    this.trackUserInteraction({
      type: 'filter',
      element: 'filter_control',
      data: {
        filterType,
        filterValue,
        resultCount,
      },
    });
  }

  // Set user ID for tracking
  public setUserId(userId: string) {
    this.userId = userId;
  }

  // Send events to analytics service
  private async sendEvent(event: AnalyticsEvent) {
    try {
      // In a real application, you would send this to your analytics service
      // Examples: Google Analytics, Mixpanel, Amplitude, etc.
      
      // Example implementation:
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
      // Queue for retry
      this.queue.push(event);
    }
  }

  private async sendPerformanceMetric(metric: PerformanceMetric) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  // Retry queued events
  public retryQueuedEvents() {
    const eventsToRetry = [...this.queue];
    this.queue = [];
    
    eventsToRetry.forEach(event => {
      this.sendEvent(event);
    });
  }

  // Get session info
  public getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
    };
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.trackEvent(name, properties);
};

export const trackUserInteraction = (interaction: Omit<UserInteraction, 'timestamp' | 'sessionId'>) => {
  analytics.trackUserInteraction(interaction);
};

export const trackPerformanceMetric = (name: string, value: number) => {
  analytics.trackPerformanceMetric(name, value);
};

export const trackMapInteraction = (action: string, data?: Record<string, any>) => {
  analytics.trackMapInteraction(action, data);
};

export const trackMapPerformance = (metric: string, value: number, additionalData?: Record<string, any>) => {
  analytics.trackMapPerformance(metric, value, additionalData);
};

export const trackPropertyView = (propertyId: string, source?: string) => {
  analytics.trackPropertyView(propertyId, source);
};

export const trackSearch = (query: string, filters?: Record<string, any>, resultCount?: number) => {
  analytics.trackSearch(query, filters, resultCount);
};

export const trackFilter = (filterType: string, filterValue: any, resultCount?: number) => {
  analytics.trackFilter(filterType, filterValue, resultCount);
};

export default analytics;