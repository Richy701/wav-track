import { supabase } from './supabase';

/**
 * Add an email to the waitlist
 * @param email The email to add to the waitlist
 * @returns The result of the operation
 */
export async function addToWaitlist(email: string) {
  try {
    // Generate a UUID for the id field
    const id = crypto.randomUUID();
    
    // Insert the email into the waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email, id }]);
    
    return { data, error };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return { data: null, error };
  }
} 