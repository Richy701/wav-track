import React from 'react';
import { generateSrcSet, generateSizes } from '@/lib/image-utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  widths?: number[];
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  sizes,
  priority = false,
  quality = 80,
  widths = [480, 768, 1024, 1920],
  fetchPriority = 'auto',
}: ResponsiveImageProps) {
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
      <img
        src={src}
        srcSet={jpgSrcSet}
        sizes={sizesAttr}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={effectiveFetchPriority}
      />
    </picture>
  );
} 