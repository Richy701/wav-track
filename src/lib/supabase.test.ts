import fetch from 'node-fetch';
global.fetch = fetch as any;
import { supabase } from './supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', process.env.VITE_SUPABASE_URL);
  
  try {
    console.log('Attempting to query profiles table...');
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('Data:', data);
    return true;
  } catch (err) {
    console.error('❌ Error testing connection:', err);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    return false;
  }
}

testSupabaseConnection(); 