// Asset optimization utilities for production deployment

// Preload critical resources
export function preloadCriticalAssets() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontPreloads = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-var-latin.woff2',
  ];

  fontPreloads.forEach((fontUrl) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Preload critical images
  const criticalImages = [
    '/images/hero-bg.webp',
    '/images/logo.svg',
  ];

  criticalImages.forEach((imageUrl) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = imageUrl;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

// Lazy load non-critical assets
export function lazyLoadAssets() {
  if (typeof window === 'undefined') return;

  // Lazy load Leaflet CSS and JS only when needed
  // Note: Leaflet is loaded directly in map components to avoid SSR issues
  // This function is kept for future use with other assets
  const loadLeafletAssets = () => {
    return Promise.all([
      // import('leaflet/dist/leaflet.css'), // CSS imports not supported in dynamic imports
      // import('leaflet'), // Commented out to prevent server-side bundling
    ]);
  };

  // Store the loader for reuse
  (window as any).__loadLeafletAssets = loadLeafletAssets;
}

// Optimize images for different screen sizes
export function getOptimizedImageSrc(
  src: string,
  width: number,
  quality: number = 85
): string {
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // For production, you might want to use a CDN or image optimization service
  // For now, we'll rely on Next.js Image optimization
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  });

  return `/_next/image?${params.toString()}`;
}

// Generate responsive image srcset
export function generateSrcSet(src: string, sizes: number[]): string {
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  return sizes
    .map((size) => `${getOptimizedImageSrc(src, size)} ${size}w`)
    .join(', ');
}

// Compress and optimize images client-side (for user uploads)
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(blob || new Blob());
        },
        'image/webp',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

// Performance monitoring utilities
export function measurePerformance() {
  if (typeof window === 'undefined') return;

  // Measure Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
      if (entry.entryType === 'first-input') {
        console.log('FID:', (entry as any).processingStart - entry.startTime);
      }
      if (entry.entryType === 'layout-shift') {
        if (!(entry as any).hadRecentInput) {
          console.log('CLS:', (entry as any).value);
        }
      }
    });
  });

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
}

// Resource hints for better loading
export function addResourceHints() {
  if (typeof window === 'undefined') return;

  // DNS prefetch for external domains
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'tile.openstreetmap.org',
  ];

  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical origins
  const criticalOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  criticalOrigins.forEach((origin) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Initialize all optimizations
export function initializeAssetOptimizations() {
  if (typeof window === 'undefined') return;

  // Run optimizations after page load
  window.addEventListener('load', () => {
    preloadCriticalAssets();
    lazyLoadAssets();
    addResourceHints();
    measurePerformance();
  });
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      if (process.env.NODE_ENV === 'production') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
      }
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  });
}