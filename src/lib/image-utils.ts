export function generatePlaceholder(width: number, height: number, color = '#f0f0f0'): string {
  // Create a small SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  
  // Convert SVG to base64
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = src;
  });
}

export const imageLoader = (src: string, size?: { width?: number; height?: number }) => {
  const url = new URL(src);
  
  if (size?.width) {
    url.searchParams.set('w', size.width.toString());
  }
  if (size?.height) {
    url.searchParams.set('h', size.height.toString());
  }
  
  // Add quality parameter for WebP format
  url.searchParams.set('q', '75');
  url.searchParams.set('format', 'webp');
  
  return url.toString();
}; 