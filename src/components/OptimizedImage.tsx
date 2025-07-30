'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate blur placeholder for better UX
  const generateBlurDataURL = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  };

  // Handle base64 images
  const isBase64 = src.startsWith('data:');

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <div className="text-gray-400 text-center">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <span className="text-sm">Image not available</span>
        </div>
      </div>
    );
  }

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={fill ? {} : { width, height }}
      />
    );
  }

  if (isBase64) {
    // Handle base64 images with regular img tag
    return (
      <div ref={imgRef} className={`relative ${className}`}>
        {isLoading && (
          <div
            className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
            style={fill ? {} : { width, height }}
          >
            <div className="text-gray-400">
              <ImageIcon className="h-6 w-6 animate-pulse" />
            </div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : { width, height }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
    );
  }

  // Handle regular URLs with Next.js Image optimization
  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10"
          style={fill ? {} : { width, height }}
        >
          <div className="text-gray-400">
            <ImageIcon className="h-6 w-6 animate-pulse" />
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined)}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

// Utility function to create optimized image URLs
export function createOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  quality: number = 85
): string {
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // For external URLs, you might want to use a service like Cloudinary or similar
  // For now, we'll rely on Next.js Image optimization
  return src;
}

// Utility function to generate responsive image sizes
export function generateResponsiveSizes(breakpoints: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const { mobile = '100vw', tablet = '50vw', desktop = '33vw' } = breakpoints;
  return `(max-width: 768px) ${mobile}, (max-width: 1200px) ${tablet}, ${desktop}`;
}