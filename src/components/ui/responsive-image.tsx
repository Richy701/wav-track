import React, { useState, useEffect } from 'react';
import { generateSrcSet, generateSizes } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  widths?: number[];
  fetchPriority?: 'high' | 'low' | 'auto';
  blurUrl?: string;
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  sizes,
  priority = false,
  quality = 75,
  widths = [480, 768, 1024, 1920],
  fetchPriority = 'auto',
  blurUrl,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isBlurLoaded, setIsBlurLoaded] = useState(false);

  // Generate WebP and AVIF versions of the URL
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const avifSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  
  // Use the utility functions to generate srcset and sizes
  const webpSrcSet = generateSrcSet(src, widths, 'webp', quality);
  const avifSrcSet = generateSrcSet(src, widths, 'avif', quality);
  const jpgSrcSet = generateSrcSet(src, widths, 'jpg', quality);
  
  // Use provided sizes or generate default sizes
  const sizesAttr = sizes || generateSizes();
  
  // Set fetchpriority based on priority prop if not explicitly provided
  const effectiveFetchPriority = fetchPriority === 'auto' 
    ? (priority ? 'high' : 'low') 
    : fetchPriority;

  // Create a safe img props object that includes fetchpriority as a data attribute
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    srcSet: jpgSrcSet,
    sizes: sizesAttr,
    alt,
    className: cn(
      className,
      isLoading && blurUrl ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0',
      'transition-all duration-300'
    ),
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    'data-fetchpriority': effectiveFetchPriority,
    onLoad: () => setIsLoading(false),
  };

  // Preload blur image if provided
  useEffect(() => {
    if (blurUrl) {
      const img = new Image();
      img.src = blurUrl;
      img.onload = () => setIsBlurLoaded(true);
    }
  }, [blurUrl]);

  return (
    <picture>
      {/* AVIF format (best compression) */}
      <source
        type="image/avif"
        srcSet={avifSrcSet}
        sizes={sizesAttr}
      />
      {/* WebP format (good compression, wide support) */}
      <source
        type="image/webp"
        srcSet={webpSrcSet}
        sizes={sizesAttr}
      />
      {/* Fallback image (JPG/PNG) */}
      <img {...imgProps} />
    </picture>
  );
} 