/**
 * Performance monitoring utilities for tracking authentication flows,
 * CSS loading, and map rendering performance
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'auth' | 'css' | 'map' | 'general';
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric({
                name: 'page_load_time',
                value: navEntry.loadEventEnd - navEntry.loadEventStart,
                timestamp: Date.now(),
                type: 'general',
                metadata: {
                  domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                  firstPaint: navEntry.responseEnd - navEntry.requestStart,
                }
              });
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Observe resource timing for CSS and JS
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('.css')) {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.recordMetric({
                name: 'css_load_time',
                value: resourceEntry.responseEnd - resourceEntry.requestStart,
                timestamp: Date.now(),
                type: 'css',
                metadata: {
                  resource: entry.name,
                  size: resourceEntry.transferSize || 0,
                }
              });
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && metric.value > 1000) {
      console.warn(`Slow operation detected: ${metric.name} took ${metric.value}ms`);
    }
  }

  /**
   * Track authentication flow performance
   */
  trackAuthFlow(flowName: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.recordMetric({
      name: `auth_${flowName}`,
      value: duration,
      timestamp: Date.now(),
      type: 'auth',
      metadata: {
        flow: flowName,
      }
    });
  }

  /**
   * Track map rendering performance
   */
  trackMapPerformance(operation: string, startTime: number, metadata?: Record<string, any>) {
    const duration = performance.now() - startTime;
    this.recordMetric({
      name: `map_${operation}`,
      value: duration,
      timestamp: Date.now(),
      type: 'map',
      metadata: {
        operation,
        ...metadata,
      }
    });
  }

  /**
   * Track CSS loading and style conflicts
   */
  trackCSSPerformance() {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    
    // Check for style recalculations
    const observer = new MutationObserver((mutations) => {
      let hasStyleChanges = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          hasStyleChanges = true;
        }
      });

      if (hasStyleChanges) {
        const duration = performance.now() - startTime;
        this.recordMetric({
          name: 'css_recalculation',
          value: duration,
          timestamp: Date.now(),
          type: 'css',
          metadata: {
            mutationCount: mutations.length,
          }
        });
      }
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style']
    });

    // Stop observing after 10 seconds to prevent memory leaks
    setTimeout(() => observer.disconnect(), 10000);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const summary = {
      auth: this.metrics.filter(m => m.type === 'auth'),
      css: this.metrics.filter(m => m.type === 'css'),
      map: this.metrics.filter(m => m.type === 'map'),
      general: this.metrics.filter(m => m.type === 'general'),
    };

    return {
      ...summary,
      averages: {
        auth: this.calculateAverage(summary.auth),
        css: this.calculateAverage(summary.css),
        map: this.calculateAverage(summary.map),
        general: this.calculateAverage(summary.general),
      },
      slowOperations: this.metrics.filter(m => m.value > 1000),
    };
  }

  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Optimize performance based on collected metrics
   */
  optimizePerformance() {
    const summary = this.getPerformanceSummary();
    
    // CSS optimization suggestions
    if (summary.averages.css > 500) {
      console.warn('CSS loading is slow. Consider:');
      console.warn('- Reducing CSS bundle size');
      console.warn('- Using critical CSS');
      console.warn('- Implementing CSS code splitting');
    }

    // Map optimization suggestions
    if (summary.averages.map > 2000) {
      console.warn('Map rendering is slow. Consider:');
      console.warn('- Reducing marker count');
      console.warn('- Implementing marker clustering');
      console.warn('- Using canvas renderer');
    }

    // Auth optimization suggestions
    if (summary.averages.auth > 3000) {
      console.warn('Authentication is slow. Consider:');
      console.warn('- Optimizing session validation');
      console.warn('- Implementing request caching');
      console.warn('- Reducing redirect chains');
    }
  }

  /**
   * Clean up observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utility functions
export const trackAuthFlow = (flowName: string, startTime: number) => 
  performanceMonitor.trackAuthFlow(flowName, startTime);

export const trackMapPerformance = (operation: string, startTime: number, metadata?: Record<string, any>) => 
  performanceMonitor.trackMapPerformance(operation, startTime, metadata);

export const trackCSSPerformance = () => 
  performanceMonitor.trackCSSPerformance();

export const getPerformanceSummary = () => 
  performanceMonitor.getPerformanceSummary();

export const optimizePerformance = () => 
  performanceMonitor.optimizePerformance();