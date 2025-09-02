import { NextResponse } from 'next/server';

const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID || process.env.NEXT_PUBLIC_FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || process.env.NEXT_PUBLIC_FB_PAGE_ACCESS_TOKEN;

let cache = { ts: 0, data: null };
const CACHE_TTL = 60; // seconds

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function GET() {
  try {
    // Basic validation for Facebook page fetch
    if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN' }, { status: 400 });
    }

    // Return cached if recent
    const now = Math.floor(Date.now() / 1000);
    if (cache.data && now - cache.ts < CACHE_TTL) {
      return NextResponse.json({ facebook: cache.data.facebook, cached: true });
    }

    // Facebook page posts
    const fbUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/posts?fields=message,created_time,permalink_url,attachments{media_type,media_url,subattachments}&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
    const facebook = await fetchJson(fbUrl);

    cache = { ts: now, data: { facebook } };

    return NextResponse.json({ facebook, cached: false });
  } catch (err) {
    console.error('Social fetch error:', err);
    const msg = (err && err.message) ? err.message : 'Unknown error';

    // Map common OAuth/token errors to a clearer response
    const lower = msg.toLowerCase();
    if (lower.includes('oauth') || lower.includes('190') || lower.includes('invalid') || lower.includes('access_token')) {
      return NextResponse.json({ error: 'invalid_token', message: msg }, { status: 401 });
    }

    // GraphMethodException: unsupported get request / missing permissions
    if (lower.includes('unsupported get request') || (err && err.code === 100 && err.error_subcode === 33)) {
      return NextResponse.json({ error: 'unsupported_request', message: msg }, { status: 404 });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
