'use client';

import { useEffect } from 'react';

export default function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources only when needed
    // Icons are loaded on-demand, no need to preload them

    // Prefetch likely next pages
    const prefetchPages = [
      '/properties',
      '/admin/login',
    ];

    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

    // Register service worker for caching
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Optimize third-party scripts loading
    const loadThirdPartyScripts = () => {
      // Example: Load analytics after user interaction
      // const script = document.createElement('script');
      // script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      // script.async = true;
      // document.head.appendChild(script);
    };

    // Load third-party scripts after user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const loadScriptsOnce = () => {
      loadThirdPartyScripts();
      events.forEach(event => {
        document.removeEventListener(event, loadScriptsOnce, { passive: true });
      });
    };

    events.forEach(event => {
      document.addEventListener(event, loadScriptsOnce, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, loadScriptsOnce);
      });
    };
  }, []);

  return null;
}