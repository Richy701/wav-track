# Image Optimization Guide

This guide explains how to use the image optimization features in WavTrack to improve performance and user experience.

## Overview

WavTrack uses several image optimization techniques to ensure fast loading times and optimal performance:

- Serving appropriately sized images for different devices
- Using modern formats (WebP, AVIF) with fallbacks
- Preloading critical images
- Lazy loading non-critical images
- Using fetchpriority for critical images

## Using the ResponsiveImage Component

The `ResponsiveImage` component provides a simple way to use responsive images with support for modern formats.

### Basic Usage

```tsx
<ResponsiveImage
  src="https://example.com/image.jpg"
  alt="Description"
  className="w-full h-full object-cover"
/>
```

### Priority Loading

For critical images like hero images that are likely to be the Largest Contentful Paint (LCP) element:

```tsx
<ResponsiveImage
  src="https://example.com/hero.jpg"
  alt="Hero Image"
  className="w-full h-full object-cover"
  priority={true}
  fetchPriority="high"
  sizes="100vw"
  quality={85}
/>
```

### Custom Sizes

```tsx
<ResponsiveImage
  src="https://example.com/image.jpg"
  alt="Description"
  className="w-full h-full object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Custom Quality Settings

```tsx
<ResponsiveImage
  src="https://example.com/image.jpg"
  alt="Description"
  className="w-full h-full object-cover"
  quality={75} // Lower quality for smaller file size
/>
```

## How the ResponsiveImage Component Works

The `ResponsiveImage` component:

1. Uses the `<picture>` element to provide multiple image formats
2. Generates `srcset` values for different widths
3. Supports lazy loading for non-critical images
4. Supports priority loading for critical images
5. Uses the `fetchpriority` attribute to indicate high-priority images

## Preloading Critical Images

For the best LCP performance, critical images should be preloaded in the HTML head:

```html
<!-- AVIF format (best compression) -->
<link rel="preload" as="image" href="https://example.com/image.avif" media="(max-width: 480px)" type="image/avif" fetchpriority="high" />

<!-- WebP format (good compression, wide support) -->
<link rel="preload" as="image" href="https://example.com/image.webp" media="(max-width: 480px)" type="image/webp" fetchpriority="high" />

<!-- Fallback JPG format -->
<link rel="preload" as="image" href="https://example.com/image.jpg" media="(max-width: 480px)" fetchpriority="high" />
```

## Converting Images to WebP and AVIF

For local images, you'll need to convert them to WebP and AVIF formats. Here are some options:

### Using Command Line Tools

#### WebP Conversion

```bash
# Install cwebp
brew install webp  # macOS
apt-get install webp  # Ubuntu/Debian

# Convert a single image
cwebp -q 80 input.jpg -o output.webp

# Batch convert all JPG files in a directory
find ./images -name "*.jpg" -exec sh -c 'cwebp -q 80 "$1" -o "${1%.jpg}.webp"' sh {} \;
```

#### AVIF Conversion

```bash
# Install avifenc
brew install libavif  # macOS
apt-get install libavif-bin  # Ubuntu/Debian

# Convert a single image
avifenc --min 0 --max 63 input.jpg output.avif

# Batch convert all JPG files in a directory
find ./images -name "*.jpg" -exec sh -c 'avifenc --min 0 --max 63 "$1" "${1%.jpg}.avif"' sh {} \;
```

### Using Online Tools

- [Squoosh](https://squoosh.app/) - Google's online image optimization tool
- [Cloudinary](https://cloudinary.com/) - Cloud-based image optimization service
- [Imgix](https://www.imgix.com/) - Real-time image optimization service

## Best Practices

1. **Appropriate Image Sizes**: Use the smallest image size that still looks good on the target device
2. **Quality Settings**: Balance quality and file size (80-85% is usually a good compromise)
3. **Preloading**: Preload critical images, especially the LCP element
4. **Lazy Loading**: Use lazy loading for images below the fold
5. **Meaningful Alt Text**: Always provide descriptive alt text for accessibility
6. **Descriptive File Names**: Use meaningful file names for better caching and debugging
7. **Fetch Priority**: Use `fetchpriority="high"` for critical images like the LCP element

## Performance Impact

Using these optimization techniques can:

- Reduce image file sizes by 25-80% compared to unoptimized images
- Improve page load times by 20-40%
- Improve Core Web Vitals scores
- Improve SEO rankings

## Troubleshooting

If images aren't loading as expected:

1. Check browser console for errors
2. Verify that the image URLs are correct
3. Ensure that the image formats are supported by the browser
4. Check that the preload tags are correctly formatted
5. Verify that the fetchpriority attribute is set correctly for critical images 