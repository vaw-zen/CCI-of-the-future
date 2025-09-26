import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Check if the request is for admin routes (but not login page)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    try {
      // Create a Supabase client configured to use cookies
      const response = NextResponse.next();
      const supabase = createMiddlewareClient({ req: request, res: response });

      // Refresh session if expired - required for Server Components
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No session, redirect to login
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user is admin by querying admin_users table
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116' || !adminData) {
        // Not an admin, redirect to login
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      return response;
    } catch (error) {
      console.error('Middleware auth error:', error);
      // On error, redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/((?!login).*)',
    '/admin'
  ]
};