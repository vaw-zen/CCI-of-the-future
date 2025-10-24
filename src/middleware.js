/**
 * API Middleware for Next.js 14 App Router
 * Handles CORS for API routes
 * Note: API key validation is handled in individual routes for better error handling
 */

import { NextResponse } from 'next/server';

export function middleware(request) {
  // Handle API routes separately
  if (request.nextUrl.pathname.startsWith('/api/articles') || 
      request.nextUrl.pathname.startsWith('/api/rebuild')) {
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to all API responses
    const response = NextResponse.next();
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    return response;
  }

  // Handle admin routes authentication (existing logic)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    try {
      // Create a Supabase client configured to use cookies
      const response = NextResponse.next();
      const supabase = createMiddlewareClient({ req: request, res: response });

      // ... existing admin auth logic would go here
      return response;
    } catch (error) {
      console.error('Middleware auth error:', error);
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/articles/:path*',
    '/api/rebuild',
    '/admin/((?!login).*)',
    '/admin'
  ]
};