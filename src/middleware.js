/**
 * Next.js Middleware — merged from root + src middleware
 * Handles: CSS caching, CORS for API routes, admin auth via Supabase,
 * and analytics gating for Tunisia-only traffic.
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

const ANALYTICS_COOKIE_NAME = 'cci_analytics';
const ANALYTICS_ALLOWED_COUNTRIES = new Set(['TN']);
const BOT_USER_AGENT_PATTERN = /(bot|crawler|spider|crawling|headless|facebookexternalhit|whatsapp|telegrambot|slackbot|discordbot|linkedinbot|skypeuripreview|google-inspectiontool|adsbot|apis-google|mediapartners-google|lighthouse|pagespeed|pingdom|curl|wget|python-requests|axios|node-fetch|go-http-client)/i;

function getVisitorCountry(request) {
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code') ||
    '';

  return country.toUpperCase();
}

function isBotTraffic(request) {
  const userAgent = request.headers.get('user-agent') || '';
  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

function shouldEnableAnalytics(request) {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return ANALYTICS_ALLOWED_COUNTRIES.has(getVisitorCountry(request)) && !isBotTraffic(request);
}

function attachAnalyticsCookie(request, response) {
  response.cookies.set({
    name: ANALYTICS_COOKIE_NAME,
    value: shouldEnableAnalytics(request) ? '1' : '0',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export async function middleware(request) {
  // 1. Aggressive caching for CSS files (mobile perf)
  if (request.nextUrl.pathname.includes('/_next/static/css/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // 2. CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/articles') || 
      request.nextUrl.pathname.startsWith('/api/rebuild')) {
    
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

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
    return response;
  }

  // 3. Admin routes auth (except login page)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    try {
      const supabaseResponse = NextResponse.next();
      const supabase = createMiddlewareClient({ req: request, res: supabaseResponse });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      const adminResponse = NextResponse.next();
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if ((error && error.code !== 'PGRST116') || !adminData) {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      return adminResponse;
    } catch (error) {
      console.error('Middleware auth error:', error);
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return attachAnalyticsCookie(request, NextResponse.next());
}

export const config = {
  matcher: [
    '/_next/static/css/:path*',
    '/api/articles/:path*',
    '/api/rebuild',
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\..*).*)',
  ],
};
