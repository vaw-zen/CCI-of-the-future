import { NextResponse } from 'next/server';

const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const IG_USER_ID = process.env.IG_USER_ID || process.env.NEXT_PUBLIC_IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || process.env.NEXT_PUBLIC_IG_ACCESS_TOKEN;
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
    // Basic validation for Instagram; try to resolve IG_USER_ID from FB page if missing
    let igUserId = IG_USER_ID;
    if (!igUserId) {
      if (FB_PAGE_ID && FB_PAGE_ACCESS_TOKEN) {
        const pageUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}?fields=instagram_business_account&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
        try {
          const pageInfo = await fetchJson(pageUrl);
          if (pageInfo && pageInfo.instagram_business_account && pageInfo.instagram_business_account.id) {
            igUserId = pageInfo.instagram_business_account.id;
          }
        } catch (e) {
          console.warn('Could not resolve IG_USER_ID from FB page:', e.message || e);
        }
      }
    }

    if (!igUserId || !IG_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing IG_USER_ID or IG_ACCESS_TOKEN' }, { status: 400 });
    }

    // Return cached if recent
    const now = Math.floor(Date.now() / 1000);
    if (cache.data && now - cache.ts < CACHE_TTL) {
      return NextResponse.json({ instagram: cache.data.instagram, cached: true });
    }

    // Instagram media: request richer fields and children for carousel posts
    const igUrl = `https://graph.facebook.com/${FB_API_VERSION}/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{ id,media_type,media_url,thumbnail_url,permalink }&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`;
  const instagram = await fetchJson(igUrl.replace(`/${FB_API_VERSION}/${IG_USER_ID}/`, `/${FB_API_VERSION}/${igUserId}/`));

    // Normalize to a compact posts array for the frontend
    const posts = (instagram && instagram.data && Array.isArray(instagram.data))
      ? instagram.data.map(item => ({
          id: item.id,
          caption: item.caption || null,
          media_type: item.media_type || null,
          media_url: item.media_url || null,
          thumbnail_url: item.thumbnail_url || null,
          permalink: item.permalink || null,
          timestamp: item.timestamp || null,
          children: (item.children && item.children.data && Array.isArray(item.children.data))
            ? item.children.data.map(c => ({ id: c.id, media_type: c.media_type, media_url: c.media_url, thumbnail_url: c.thumbnail_url, permalink: c.permalink }))
            : []
        }))
      : [];

    cache = { ts: now, data: { instagram } };

    return NextResponse.json({ instagram: { raw: instagram, posts }, cached: false });
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
