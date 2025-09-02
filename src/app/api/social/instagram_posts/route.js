import { NextResponse } from 'next/server';

const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const IG_USER_ID = process.env.IG_USER_ID || process.env.NEXT_PUBLIC_IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || process.env.NEXT_PUBLIC_IG_ACCESS_TOKEN;

let cache = { ts: 0, data: null };
const CACHE_TTL = 60; // seconds

async function fetchJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`Fetch error ${res.status}: ${text}`);
  return JSON.parse(text);
}

function normalizeIg(raw) {
  if (!raw || !Array.isArray(raw.data)) return [];
  return raw.data.map(item => ({
    id: item.id,
    caption: item.caption || null,
    media_type: item.media_type || null,
    media_url: item.media_url || item.thumbnail_url || null,
    permalink: item.permalink || null,
    timestamp: item.timestamp || null,
    children: (item.children && item.children.data) ? item.children.data.map(c => ({ id: c.id, media_type: c.media_type, media_url: c.media_url || c.thumbnail_url })) : []
  }));
}

export async function GET() {
  try {
    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing IG_USER_ID or IG_ACCESS_TOKEN' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    if (cache.data && now - cache.ts < CACHE_TTL) {
      return NextResponse.json({ instagram: cache.data.instagram, posts: normalizeIg(cache.data.instagram), cached: true });
    }

    const igUrl = `https://graph.facebook.com/${FB_API_VERSION}/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{ id,media_type,media_url,thumbnail_url }&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`;
    const instagram = await fetchJson(igUrl);

    cache = { ts: now, data: { instagram } };

    return NextResponse.json({ instagram, posts: normalizeIg(instagram), cached: false });
  } catch (err) {
    console.error('IG posts fetch error:', err);
    const msg = err && err.message ? err.message : 'Unknown error';
    if (msg.toLowerCase().includes('oauth') || msg.includes('190') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('access_token')) {
      return NextResponse.json({ error: 'invalid_token', message: msg }, { status: 401 });
    }
    if (msg.toLowerCase().includes('unsupported get request') || (err && err.code === 100 && err.error_subcode === 33)) {
      return NextResponse.json({ error: 'unsupported_request', message: msg }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
