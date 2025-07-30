'use client';

import { useEffect, useState } from 'react';
import { analytics } from '@/lib/analytics';

interface PerformanceMonitorProps {
  children?: React.ReactNode;
  componentName?: string;
  trackRenderTime?: boolean;
  trackMemoryUsage?: boolean;
}

interface PerformanceData {
  renderTime?: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

export default function PerformanceMonitor({
  children,
  componentName = 'Unknown',
  trackRenderTime = true,
  trackMemoryUsage = false,
}: PerformanceMonitorProps) {
  const [renderStartTime] = useState(Date.now());

  useEffect(() => {
    if (trackRenderTime) {
      const renderTime = Date.now() - renderStartTime;
      analytics.trackPerformanceMetric(`Component Render Time - ${componentName}`, renderTime);
    }

    if (trackMemoryUsage && 'memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        analytics.trackPerformanceMetric(`Memory Usage - ${componentName}`, memoryInfo.usedJSHeapSize);
      }
    }
  }, [componentName, renderStartTime, trackRenderTime, trackMemoryUsage]);

  return <>{children}</>;
}

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    return (
      <PerformanceMonitor 
        componentName={componentName || Component.displayName || Component.name}
        trackRenderTime={true}
      >
        <Component {...props} />
      </PerformanceMonitor>
    );
  };
}

// Performance metrics display component (for development/admin)
export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/analytics/performance');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Failed to load performance metrics</p>
      </div>
    );
  }

  const getScoreColor = (score: number, thresholds: { good: number; needs_improvement: number }) => {
    if (score <= thresholds.good) return 'text-green-600 bg-green-100';
    if (score <= thresholds.needs_improvement) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Core Web Vitals */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Core Web Vitals</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">LCP (Largest Contentful Paint)</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getScoreColor(metrics.averageLCP * 1000, { good: 2500, needs_improvement: 4000 })
            }`}>
              {metrics.averageLCP}s
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">FID (First Input Delay)</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getScoreColor(metrics.averageFID, { good: 100, needs_improvement: 300 })
            }`}>
              {metrics.averageFID}ms
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">CLS (Cumulative Layout Shift)</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getScoreColor(metrics.averageCLS, { good: 0.1, needs_improvement: 0.25 })
            }`}>
              {metrics.averageCLS}
            </span>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Loading Metrics</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">FCP (First Contentful Paint)</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getScoreColor(metrics.averageFCP * 1000, { good: 1800, needs_improvement: 3000 })
            }`}>
              {metrics.averageFCP}s
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">TTFB (Time to First Byte)</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getScoreColor(metrics.averageTTFB, { good: 800, needs_improvement: 1800 })
            }`}>
              {metrics.averageTTFB}ms
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Average Load Time</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getScoreColor(metrics.averageLoadTime * 1000, { good: 3000, needs_improvement: 5000 })
            }`}>
              {metrics.averageLoadTime}s
            </span>
          </div>
        </div>

        {/* User Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">User Metrics</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Page Views</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {metrics.totalPageViews.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Bounce Rate</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getScoreColor(metrics.bounceRate * 100, { good: 40, needs_improvement: 70 })
            }`}>
              {(metrics.bounceRate * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Real-time performance monitor for development
export function RealTimePerformanceMonitor() {
  const [currentMetrics, setCurrentMetrics] = useState<{
    memory?: number;
    fps?: number;
    loadTime?: number;
  }>({});

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const updateMetrics = () => {
      const now = performance.now();
      frameCount++;

      // Calculate FPS every second
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        setCurrentMetrics(prev => ({
          ...prev,
          fps,
          memory: (performance as any).memory?.usedJSHeapSize,
          loadTime: performance.timing ? 
            performance.timing.loadEventEnd - performance.timing.navigationStart : 
            undefined,
        }));
      }

      animationId = requestAnimationFrame(updateMetrics);
    };

    if (process.env.NODE_ENV === 'development') {
      animationId = requestAnimationFrame(updateMetrics);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>FPS: {currentMetrics.fps || 0}</div>
        {currentMetrics.memory && (
          <div>Memory: {(currentMetrics.memory / 1024 / 1024).toFixed(1)}MB</div>
        )}
        {currentMetrics.loadTime && (
          <div>Load: {currentMetrics.loadTime}ms</div>
        )}
      </div>
    </div>
  );
}