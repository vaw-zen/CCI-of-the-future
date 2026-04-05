import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('⚠️ Supabase configuration missing. Check your .env.local file.');
  }
}

const isBrowser = typeof window !== 'undefined';

// Browser client uses the auth helpers cookie adapter so middleware and client
// share the same session source for admin routes.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? (isBrowser
      ? createPagesBrowserClient({
          supabaseUrl,
          supabaseKey: supabaseAnonKey,
          options: {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true,
            },
          },
        })
      : null)
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
