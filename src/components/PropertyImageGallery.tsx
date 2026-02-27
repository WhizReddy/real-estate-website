'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // Auto-advance slides (optional)
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex < images.length - 1 ? prevIndex + 1 : 0
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [images.length, currentIndex]);

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main Image */}
      {currentImage.startsWith('data:') ? (
        // Handle base64 images with regular img tag
        <img
          src={currentImage}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      ) : (
        // Handle regular URLs with Next.js Image
        <Image
          src={currentImage}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
      )}

      {/* Navigation Arrows - Only show if multiple images */}
      {images.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-2.5 rounded-full opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 z-10 touch-manipulation active:scale-90"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-2.5 rounded-full opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 z-10 touch-manipulation active:scale-90"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-8 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-1 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(index, e)}
                className={`rounded-full transition-all duration-300 touch-manipulation ${index === currentIndex
                    ? 'w-4 h-1.5 sm:w-2 sm:h-2 bg-white sm:scale-125'
                    : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/50 hover:bg-white/75'
                  }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          {/* Swipe Indicator for Mobile */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 text-xs font-medium bg-black/50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:hidden">
            Swipe për më shumë
          </div>
        </>
      )}

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-gray-200 animate-pulse -z-10" />
    </div>
  );
}