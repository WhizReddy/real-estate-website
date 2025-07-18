'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      // In a real app, you'd send this to your analytics service
      console.log('Web Vital:', metric);
      
      // Example: Send to Google Analytics
      // gtag('event', metric.name, {
      //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      //   event_category: 'Web Vitals',
      //   event_label: metric.id,
      //   non_interaction: true,
      // });
    };

    // Dynamically import web-vitals to avoid affecting bundle size
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    }).catch(() => {
      // web-vitals not available, skip monitoring
    });

    // Performance observer for custom metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Monitor long tasks
          if (entry.entryType === 'longtask') {
            console.warn('Long task detected:', entry.duration);
          }
          
          // Monitor layout shifts
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            console.log('Layout shift:', entry.value);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['longtask', 'layout-shift'] });
      } catch (e) {
        // Some browsers might not support all entry types
      }

      return () => observer.disconnect();
    }
  }, []);

  return null; // This component doesn't render anything
}