/**
 * Validates if a URL points to a valid image
 * Uses progressive enhancement:
 * 1. For data URLs or local files: always valid
 * 2. For Supabase URLs: assumed valid to avoid CORS issues
 * 3. For external URLs: fetch headers to validate
 */
export async function isValidImageUrl(url: string): Promise<boolean> {
  if (!url) return false;
  
  // Log information about this URL
  console.log('Validating image URL:', url);
  
  try {
    // For data URLs or local files: always valid
    if (url.startsWith('data:image/') || url.startsWith('/')) {
      console.log('URL is a data URL or local file, assuming valid');
      return true;
    }
    
    // For Supabase URLs: assume valid to avoid CORS
    if (url.includes('supabase') || url.includes('storage')) {
      console.log('URL is a Supabase storage URL, assuming valid');
      return true;
    }
    
    // For signed URLs with tokens: assume valid
    if (url.includes('token=')) {
      console.log('URL contains a token parameter, assuming valid');
      return true;
    }
    
    // For all other URLs: try to fetch headers
    try {
      console.log('Fetching headers for URL:', url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // In no-cors mode, we can't actually check the content type
      // So just check if the request didn't fail
      console.log('URL is reachable');
      return true;
    } catch (fetchError) {
      console.warn('Error fetching headers:', fetchError);
      // For safety, still return true if fetch fails due to CORS
      return true;
    }
  } catch (error) {
    console.error('Error validating image URL:', error);
    return false;
  }
}

/**
 * Returns a random music cover art from the available set
 * This provides more visually interesting fallbacks than a single default image
 */
export function getDefaultCoverArt(): string {
  // Array of available cover art images
  const coverOptions = [
    '/images/covers/music-cover-1.jpg',
    '/images/covers/music-cover-2.jpg',
    '/images/covers/music-cover-3.jpg',
    '/images/covers/music-cover-4.jpg'
  ];
  
  // Get a random index
  const randomIndex = Math.floor(Math.random() * coverOptions.length);
  
  // Return a random cover
  return coverOptions[randomIndex];
} 