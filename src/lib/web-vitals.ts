/**
 * Web Vitals integration with graceful fallback
 * Handles cases where web-vitals package might not be available
 */

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

export type ReportHandler = (metric: WebVitalsMetric) => void;

/**
 * Safely import and use web-vitals with fallback
 */
export async function reportWebVitals(onPerfEntry?: ReportHandler) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    try {
      // Try to dynamically import web-vitals
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    } catch (error) {
      // Fallback: Use basic performance API if web-vitals is not available
      console.warn('web-vitals package not available, using fallback performance tracking');
      
      // Basic performance tracking fallback
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Track basic metrics using Performance Observer
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'largest-contentful-paint') {
                onPerfEntry({
                  id: 'lcp-fallback',
                  name: 'LCP',
                  value: entry.startTime,
                  rating: entry.startTime < 2500 ? 'good' : entry.startTime < 4000 ? 'needs-improvement' : 'poor',
                  delta: entry.startTime,
                  entries: [entry]
                });
              }
            }
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (observerError) {
          console.warn('Performance Observer not supported');
        }
      }
    }
  }
}

/**
 * Initialize web vitals tracking
 */
export function initWebVitals() {
  if (typeof window !== 'undefined') {
    reportWebVitals((metric) => {
      // Send metrics to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric);
      }
    });
  }
}