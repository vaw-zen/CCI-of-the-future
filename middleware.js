import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Add aggressive caching for CSS files on mobile (applies to all requests)
  if (request.nextUrl.pathname.includes('/_next/static/css/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }
  
  // Check if the request is for admin routes (but not login page)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    try {
      // Create a Supabase client configured to use cookies
      const supabaseResponse = NextResponse.next();
      const supabase = createMiddlewareClient({ req: request, res: supabaseResponse });

      // Refresh session if expired - required for Server Components
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No session, redirect to login
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user is admin by querying admin_users table
      const adminResponse = NextResponse.next();
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

      return adminResponse;
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