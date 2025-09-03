import { NextResponse } from 'next/server';

const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID || process.env.NEXT_PUBLIC_FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || process.env.NEXT_PUBLIC_FB_PAGE_ACCESS_TOKEN;

let cache = { ts: 0, data: null };
const CACHE_TTL = 60; // seconds

async function fetchJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`Fetch error ${res.status}: ${text}`);
  return JSON.parse(text);
}

function normalizeFbPosts(raw) {
  if (!raw || !Array.isArray(raw.data)) return [];
  return raw.data.map(item => {
    const attachments = [];
    if (item.attachments && Array.isArray(item.attachments.data)) {
      for (const att of item.attachments.data) {
        if (att.media && att.media.image && att.media.image.src) attachments.push(att.media.image.src);
        else if (att.media_url) attachments.push(att.media_url);
        else if (att.subattachments && Array.isArray(att.subattachments.data)) {
          for (const sub of att.subattachments.data) {
            if (sub.media && sub.media.image && sub.media.image.src) attachments.push(sub.media.image.src);
            else if (sub.media_url) attachments.push(sub.media_url);
          }
        }
      }
    }

    return {
      id: item.id,
      message: item.message || null,
      created_time: item.created_time || null,
      permalink_url: item.permalink_url || null,
      attachments,
    };
  });
}

export async function GET() {
  try {
    if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    if (cache.data && now - cache.ts < CACHE_TTL) {
      return NextResponse.json({ facebook: cache.data.facebook, posts: normalizeFbPosts(cache.data.facebook), cached: true });
    }

    const fbPostsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/posts?fields=message,created_time,permalink_url,attachments{media,media_url,subattachments}&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;

    const facebook = await fetchJson(fbPostsUrl);

    cache = { ts: now, data: { facebook } };

    return NextResponse.json({ facebook, posts: normalizeFbPosts(facebook), cached: true });
    
  } catch (err) {
    console.error('FB posts fetch error:', err);
    const msg = err && err.message ? err.message : 'Unknown error';
    if (msg.toLowerCase().includes('oauth') || msg.includes('190') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('access_token')) {
      return NextResponse.json({ error: 'invalid_token', message: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
                                                