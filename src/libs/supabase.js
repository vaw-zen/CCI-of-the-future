import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build time, we might not have these variables, so we create a mock client
if (!supabaseUrl || !supabaseAnonKey) {
  // Only throw error at runtime, not during build
  if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production') {
    console.warn('Missing Supabase environment variables - using mock client for build');
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null; // Mock client for build time

// For server-side operations that need elevated permissions
export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error('Missing Supabase service role key or URL');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};