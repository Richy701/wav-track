import { supabase } from './supabase';

/**
 * Check if an email is already on the waitlist
 * @param email The email to check
 * @returns True if the email exists, false otherwise
 */
export async function isEmailOnWaitlist(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking waitlist:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking waitlist:', error);
    return false;
  }
}

/**
 * Add an email to the waitlist
 * @param email The email to add to the waitlist
 * @returns The result of the operation
 */
export async function addToWaitlist(email: string) {
  try {
    // Check if email is already on waitlist first
    const isAlreadyOnWaitlist = await isEmailOnWaitlist(email);
    if (isAlreadyOnWaitlist) {
      return { 
        data: null, 
        error: { 
          message: 'This email is already on the waitlist!',
          code: 'DUPLICATE_EMAIL',
          status: 409
        } 
      };
    }

    // Generate a UUID for the id field
    const id = crypto.randomUUID();
    
    // Insert the email into the waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email, id }]);
    
    // If there's an error, check if it's a unique constraint violation (409)
    if (error) {
      // Check if this is a unique constraint violation (email already exists)
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        // Return a specific error for duplicate email
        return { 
          data: null, 
          error: { 
            message: 'This email is already on the waitlist!',
            code: 'DUPLICATE_EMAIL',
            status: 409
          } 
        };
      }
      return { data, error };
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return { data: null, error };
  }
} 