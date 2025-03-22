import { supabase } from '@/lib/supabase';

export async function uploadCoverArt(file: File): Promise<{ url: string | null; prompt: string | null }> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Get file extension from mime type
    let fileExt = file.type.split('/')[1] || 'jpg';
    if (fileExt === 'jpeg') fileExt = 'jpg';
    
    // Create a unique filename
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const fileName = `${uniqueId}.${fileExt}`;

    console.log('Uploading file:', fileName, 'Type:', file.type, 'Size:', file.size);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('cover-art')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    console.log('Upload successful:', data);

    // Try to get a signed URL first (more reliable for access control)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('cover-art')
      .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days expiry
    
    if (signedUrlData?.signedUrl) {
      console.log('Generated signed URL:', signedUrlData.signedUrl);
      return {
        url: signedUrlData.signedUrl,
        prompt: `Uploaded cover art: ${file.name}`
      };
    } else {
      console.warn('Could not generate signed URL, falling back to public URL:', signedUrlError);
      
      // Fallback to public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cover-art')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);
      
      return {
        url: publicUrl,
        prompt: `Uploaded cover art: ${file.name}`
      };
    }
  } catch (error) {
    console.error('Error uploading cover art:', error);
    throw error;
  }
}

/**
 * Gets a valid URL for an existing cover art image
 * Attempts to get a signed URL, then falls back to public URL
 */
export async function getCoverArtUrl(filePath: string): Promise<string | null> {
  try {
    // Extract file path from public URL if that's what was stored
    const fileName = filePath.includes('/') 
      ? filePath.split('/').pop() || filePath
      : filePath;

    // Try signed URL first
    const { data, error } = await supabase.storage
      .from('cover-art')
      .createSignedUrl(fileName, 60 * 60 * 24); // 1 day expiry
    
    if (data?.signedUrl) {
      return data.signedUrl;
    }
    
    // Fallback to public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cover-art')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error getting cover art URL:', error);
    return null;
  }
}

// Helper function to decode base64
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
} 