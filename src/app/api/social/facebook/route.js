import { NextResponse } from 'next/server';
import { getVideoPlaceholderDataUrl } from '@/utils/videoPlaceholder';

const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

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
        if (att.media?.image?.src) attachments.push(att.media.image.src);
        else if (att.media_url) attachments.push(att.media_url);
        else if (att.subattachments?.data) {
          for (const sub of att.subattachments.data) {
            if (sub.media?.image?.src) attachments.push(sub.media.image.src);
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
function normalizeFbReels(raw) {
  if (!raw || !Array.isArray(raw.data)) return [];

  return raw.data.map(item => {
    let views = 0;
    let engaged = 0;

    // Parse insights data
    if (item.insights?.data) {
      for (const metric of item.insights.data) {
        if (metric.name === "video_views") {
          views = metric.values?.[0]?.value || 0;
        }
        if (metric.name === "post_engaged_users") {
          engaged = metric.values?.[0]?.value || 0;
        }
      }
    }

    // Ensure we always have a valid thumbnail URL
    let thumbnail = item.picture || item.thumbnails?.data?.[0]?.uri || null;
    
    // If no thumbnail from Facebook, create a fallback using our video icon
    if (!thumbnail) {
      thumbnail = getVideoPlaceholderDataUrl();
    }

    // Validate that the thumbnail is a proper URL or data URL
    if (thumbnail && !thumbnail.startsWith('http') && !thumbnail.startsWith('data:')) {
      thumbnail = getVideoPlaceholderDataUrl();
    }

    return {
      id: item.id,
      message: item.description || null,
      created_time: item.created_time || null,
      permalink_url: item.perma_link || item.permalink_url || null, // Use perma_link first (full URL)
      video_url: item.source || null, // direct video link
      thumbnail: thumbnail, // Always provide a valid thumbnail URL
      views:item.views?.summary?.total_count || views,
      engaged_users: engaged,
      likes: item.likes?.summary?.total_count || 0,
      comments: item.comments?.summary?.total_count || 0,
      shares: item.shares?.count || 0,
      length: item.length || null, // video duration in seconds
    };
  });
}
export async function GET(request) {
  try {
    if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN' }, { status: 400 });
    }

    const sp = request?.nextUrl?.searchParams;
    const reelsLimitParam = sp?.get('reels_limit');
    const reelsAfter = sp?.get('reels_after') || null;
    const reelsLimit = reelsLimitParam ? Math.max(1, Math.min(50, parseInt(reelsLimitParam, 10) || 0)) : null;

    const postsLimitParam = sp?.get('posts_limit');
    const postsAfter = sp?.get('posts_after') || null;
    const postsLimit = postsLimitParam ? Math.max(1, Math.min(50, parseInt(postsLimitParam, 10) || 0)) : null;

    const now = Math.floor(Date.now() / 1000);
    const canUseCache = !reelsLimit && !reelsAfter && !postsLimit && !postsAfter; // only cache for default (non-paginated) requests
    if (canUseCache && cache.data && now - cache.ts < CACHE_TTL) {
      return NextResponse.json({ 
        posts: cache.data.posts, 
        posts_paging: cache.data.posts_paging || null,
        reels: cache.data.reels, 
        reels_paging: cache.data.reels_paging || null,
        cached: true 
      });
    }

    let fbPostsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/posts?fields=message,created_time,permalink_url,attachments{media,media_url,subattachments},thumbnails&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
    if (postsLimit) fbPostsUrl += `&limit=${postsLimit}`;
    if (postsAfter) fbPostsUrl += `&after=${encodeURIComponent(postsAfter)}`;
    let fbReelsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/video_reels?fields=id,created_time,permalink_url,perma_link,source,description,thumbnails,insights.metric(video_views,post_engaged_users),likes.summary(true)&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
    if (reelsLimit) fbReelsUrl += `&limit=${reelsLimit}`;
    if (reelsAfter) fbReelsUrl += `&after=${encodeURIComponent(reelsAfter)}`;

    // Fetch both in parallel
    const [facebookPosts, facebookReels] = await Promise.all([
      fetchJson(fbPostsUrl),
      fetchJson(fbReelsUrl)
    ]);

    const posts = normalizeFbPosts(facebookPosts);
    const reels = normalizeFbReels(facebookReels);
    const posts_paging = facebookPosts?.paging || null;
    const reels_paging = facebookReels?.paging || null;

    if (canUseCache) {
      cache = { ts: now, data: { posts, posts_paging, reels, reels_paging } };
    }

    return NextResponse.json({ posts, posts_paging, reels, reels_paging, cached: false });

  } catch (err) {
    console.error('FB fetch error:', err);
    const msg = err?.message || 'Unknown error';
    if (msg.toLowerCase().includes('oauth') || msg.includes('190') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('access_token')) {
      return NextResponse.json({ error: 'invalid_token', message: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
