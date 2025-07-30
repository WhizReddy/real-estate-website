'use client';

import { useEffect, useCallback, useRef } from 'react';
import { analytics, trackEvent, trackUserInteraction, trackMapInteraction, trackPropertyView, trackSearch, trackFilter } from '@/lib/analytics';

interface UseAnalyticsOptions {
  trackPageView?: boolean;
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    trackPageView = true,
    trackScrollDepth = true,
    trackTimeOnPage = true,
  } = options;

  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const scrollDepthTracked = useRef<Set<number>>(new Set());

  // Track page view
  useEffect(() => {
    if (trackPageView) {
      trackEvent('page_view', {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
      });
    }
  }, [trackPageView]);

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercentage > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercentage;
      }

      // Track scroll milestones (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !scrollDepthTracked.current.has(milestone)) {
          scrollDepthTracked.current.add(milestone);
          trackEvent('scroll_depth', {
            percentage: milestone,
            url: window.location.href,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);

  // Track time on page
  useEffect(() => {
    if (!trackTimeOnPage) return;

    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - pageStartTime.current;
      trackEvent('time_on_page', {
        duration: timeOnPage,
        maxScrollDepth: maxScrollDepth.current,
        url: window.location.href,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackTimeOnPage]);

  // Return tracking functions
  return {
    trackEvent,
    trackUserInteraction,
    trackMapInteraction,
    trackPropertyView,
    trackSearch,
    trackFilter,
    analytics,
  };
}

// Hook for tracking map performance
export function useMapAnalytics() {
  const mapLoadStartTime = useRef<number | null>(null);
  const mapInteractionCount = useRef<number>(0);

  const trackMapLoadStart = useCallback(() => {
    mapLoadStartTime.current = Date.now();
    trackEvent('map_load_start', {
      timestamp: mapLoadStartTime.current,
    });
  }, []);

  const trackMapLoadComplete = useCallback((markerCount?: number) => {
    if (mapLoadStartTime.current) {
      const loadTime = Date.now() - mapLoadStartTime.current;
      trackEvent('map_load_complete', {
        loadTime,
        markerCount,
      });
      analytics.trackMapPerformance('load_time', loadTime, { markerCount });
    }
  }, []);

  const trackMapInteractionEvent = useCallback((action: string, data?: Record<string, any>) => {
    mapInteractionCount.current += 1;
    trackMapInteraction(action, {
      ...data,
      interactionCount: mapInteractionCount.current,
    });
  }, []);

  const trackMapError = useCallback((error: string, details?: Record<string, any>) => {
    trackEvent('map_error', {
      error,
      ...details,
      timestamp: Date.now(),
    });
  }, []);

  return {
    trackMapLoadStart,
    trackMapLoadComplete,
    trackMapInteraction: trackMapInteractionEvent,
    trackMapError,
  };
}

// Hook for tracking search and filter analytics
export function useSearchAnalytics() {
  const searchStartTime = useRef<number | null>(null);

  const trackSearchStart = useCallback((query: string) => {
    searchStartTime.current = Date.now();
    trackEvent('search_start', {
      query,
      timestamp: searchStartTime.current,
    });
  }, []);

  const trackSearchComplete = useCallback((query: string, resultCount: number, filters?: Record<string, any>) => {
    const searchTime = searchStartTime.current ? Date.now() - searchStartTime.current : 0;
    
    trackSearch(query, filters, resultCount);
    trackEvent('search_complete', {
      query,
      resultCount,
      searchTime,
      filters,
    });
  }, []);

  const trackFilterApplied = useCallback((filterType: string, filterValue: any, resultCount: number) => {
    trackFilter(filterType, filterValue, resultCount);
    trackEvent('filter_applied', {
      filterType,
      filterValue,
      resultCount,
      timestamp: Date.now(),
    });
  }, []);

  const trackNoResults = useCallback((query: string, filters?: Record<string, any>) => {
    trackEvent('search_no_results', {
      query,
      filters,
      timestamp: Date.now(),
    });
  }, []);

  return {
    trackSearchStart,
    trackSearchComplete,
    trackFilterApplied,
    trackNoResults,
  };
}

// Hook for tracking property interactions
export function usePropertyAnalytics() {
  const trackPropertyClick = useCallback((propertyId: string, source: string, position?: number) => {
    trackPropertyView(propertyId, source);
    trackEvent('property_click', {
      propertyId,
      source,
      position,
      timestamp: Date.now(),
    });
  }, []);

  const trackPropertyImageView = useCallback((propertyId: string, imageIndex: number) => {
    trackEvent('property_image_view', {
      propertyId,
      imageIndex,
      timestamp: Date.now(),
    });
  }, []);

  const trackPropertyContact = useCallback((propertyId: string, contactMethod: 'phone' | 'email' | 'form') => {
    trackEvent('property_contact', {
      propertyId,
      contactMethod,
      timestamp: Date.now(),
    });
  }, []);

  const trackPropertyShare = useCallback((propertyId: string, platform: string) => {
    trackEvent('property_share', {
      propertyId,
      platform,
      timestamp: Date.now(),
    });
  }, []);

  const trackPropertyFavorite = useCallback((propertyId: string, action: 'add' | 'remove') => {
    trackEvent('property_favorite', {
      propertyId,
      action,
      timestamp: Date.now(),
    });
  }, []);

  return {
    trackPropertyClick,
    trackPropertyImageView,
    trackPropertyContact,
    trackPropertyShare,
    trackPropertyFavorite,
  };
}

// Hook for tracking user engagement
export function useEngagementAnalytics() {
  const sessionStartTime = useRef<number>(Date.now());
  const interactionCount = useRef<number>(0);

  const trackInteraction = useCallback((type: string, element?: string, data?: Record<string, any>) => {
    interactionCount.current += 1;
    trackUserInteraction({
      type: type as any,
      element,
      data: {
        ...data,
        sessionInteractionCount: interactionCount.current,
        sessionDuration: Date.now() - sessionStartTime.current,
      },
    });
  }, []);

  const trackEngagementMilestone = useCallback((milestone: string, value?: number) => {
    trackEvent('engagement_milestone', {
      milestone,
      value,
      sessionDuration: Date.now() - sessionStartTime.current,
      totalInteractions: interactionCount.current,
    });
  }, []);

  return {
    trackInteraction,
    trackEngagementMilestone,
    getSessionInfo: () => ({
      sessionDuration: Date.now() - sessionStartTime.current,
      interactionCount: interactionCount.current,
    }),
  };
}

export default useAnalytics;