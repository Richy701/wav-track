/**
 * Image optimization utilities
 * 
 * This file contains utility functions for working with images,
 * including format conversion and responsive image generation.
 */

/**
 * Generates a responsive image URL with the specified parameters
 * 
 * @param url - The original image URL
 * @param width - The desired width
 * @param height - The desired height (optional)
 * @param format - The desired format (jpg, webp, avif)
 * @param quality - The desired quality (1-100)
 * @returns A formatted URL with the specified parameters
 */
export function generateImageUrl(
  url: string,
  width: number,
  height?: number,
  format: 'jpg' | 'webp' | 'avif' = 'jpg',
  quality: number = 80
): string {
  // If it's an Unsplash URL, use their API parameters
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    
    params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('fit', 'crop');
    params.append('q', quality.toString());
    
    // Add format parameter if not jpg
    if (format !== 'jpg') {
      params.append('fm', format);
    }
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  // For other URLs, we'll assume they support similar parameters
  // This is a simplified approach and may need adjustment for different image services
  const baseUrl = url.split('?')[0];
  const params = new URLSearchParams();
  
  params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  
  // Add format parameter if not jpg
  if (format !== 'jpg') {
    params.append('fm', format);
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates a srcset string for responsive images
 * 
 * @param url - The original image URL
 * @param widths - Array of widths to generate
 * @param format - The desired format (jpg, webp, avif)
 * @param quality - The desired quality (1-100)
 * @returns A formatted srcset string
 */
export function generateSrcSet(
  url: string,
  widths: number[] = [480, 768, 1024, 1920],
  format: 'jpg' | 'webp' | 'avif' = 'jpg',
  quality: number = 80
): string {
  return widths
    .map(width => {
      const imageUrl = generateImageUrl(url, width, undefined, format, quality);
      return `${imageUrl} ${width}w`;
    })
    .join(',\n    ');
}

/**
 * Generates a sizes attribute for responsive images
 * 
 * @param breakpoints - Array of breakpoint objects with maxWidth and size
 * @returns A formatted sizes string
 */
export function generateSizes(
  breakpoints: Array<{ maxWidth: number; size: string }> = [
    { maxWidth: 480, size: '100vw' },
    { maxWidth: 768, size: '100vw' },
    { maxWidth: 1024, size: '80vw' },
    { maxWidth: Infinity, size: '50vw' }
  ]
): string {
  return breakpoints
    .map(({ maxWidth, size }) => {
      if (maxWidth === Infinity) {
        return size;
      }
      return `(max-width: ${maxWidth}px) ${size}`;
    })
    .join(', ');
}

/**
 * Generates preload tags for critical images
 * 
 * @param url - The original image URL
 * @param widths - Array of widths to generate
 * @param formats - Array of formats to generate (jpg, webp, avif)
 * @param quality - The desired quality (1-100)
 * @returns An array of preload tag objects
 */
export function generatePreloadTags(
  url: string,
  widths: number[] = [480, 768, 1024, 1920],
  formats: Array<'jpg' | 'webp' | 'avif'> = ['jpg', 'webp', 'avif'],
  quality: number = 80
): Array<{
  href: string;
  as: string;
  type?: string;
  media?: string;
  fetchpriority?: 'high' | 'low' | 'auto';
}> {
  const preloadTags = [];
  
  // Generate preload tags for each format and width
  for (const format of formats) {
    for (const width of widths) {
      const imageUrl = generateImageUrl(url, width, undefined, format, quality);
      const media = width === Math.max(...widths)
        ? `(min-width: ${width}px)`
        : `(max-width: ${width}px)`;
      
      preloadTags.push({
        href: imageUrl,
        as: 'image',
        type: format === 'jpg' ? undefined : `image/${format}`,
        media,
        fetchpriority: 'high'
      });
    }
  }
  
  return preloadTags;
}

/**
 * Command line instructions for converting images to WebP and AVIF
 * 
 * For WebP:
 * cwebp -q 80 input.jpg -o output.webp
 * 
 * For AVIF:
 * avifenc --min 0 --max 63 --target-size 100000 input.jpg output.avif
 * 
 * For batch conversion:
 * find . -name "*.jpg" -exec sh -c 'cwebp -q 80 "$1" -o "${1%.jpg}.webp"' sh {} \;
 * find . -name "*.jpg" -exec sh -c 'avifenc --min 0 --max 63 "$1" "${1%.jpg}.avif"' sh {} \;
 */

export function generatePlaceholder(width: number, height: number, color = '#f0f0f0'): string {
  // Create a small SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `

  // Convert SVG to base64
  const base64 = btoa(svg)
  return `data:image/svg+xml;base64,${base64}`
}

export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = reject
    img.src = src
  })
}

export const imageLoader = (src: string, size?: { width?: number; height?: number }) => {
  const url = new URL(src)

  if (size?.width) {
    url.searchParams.set('w', size.width.toString())
  }
  if (size?.height) {
    url.searchParams.set('h', size.height.toString())
  }

  // Add quality parameter for WebP format
  url.searchParams.set('q', '75')
  url.searchParams.set('format', 'webp')

  return url.toString()
}
