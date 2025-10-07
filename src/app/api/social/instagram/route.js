import { NextResponse } from 'next/server';

const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_USER_ACCESS_TOKEN = process.env.FB_USER_ACCESS_TOKEN; // User token with Instagram permissions

let cache = { ts: 0, data: null };
const CACHE_TTL = 60; // seconds

async function fetchJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`Fetch error ${res.status}: ${text}`);
  return JSON.parse(text);
}

function normalizeIgPosts(raw) {
  if (!raw || !Array.isArray(raw.data)) return [];
  return raw.data.map(item => ({
    id: item.id,
    message: item.caption || null,
    created_time: item.timestamp || null,
    permalink_url: item.permalink || null,
    attachments: item.media_url ? [item.media_url] : (item.thumbnail_url ? [item.thumbnail_url] : []),
    likes: item.like_count || 0,
    comments: item.comments_count || 0,
    media_type: item.media_type || null,
    insights: item.insights || null,
    children: (item.children && item.children.data) ? item.children.data.map(c => ({ 
      id: c.id, 
      media_type: c.media_type, 
      media_url: c.media_url || c.thumbnail_url 
    })) : []
  }));
}

export async function GET(request) {
  try {
    if (!FB_PAGE_ID) {
      return NextResponse.json({ error: 'Missing FB_PAGE_ID' }, { status: 400 });
    }

    if (!FB_USER_ACCESS_TOKEN && !FB_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing FB_USER_ACCESS_TOKEN or FB_PAGE_ACCESS_TOKEN' }, { status: 400 });
    }

    const sp = request?.nextUrl?.searchParams;
    const postsLimitParam = sp?.get('posts_limit');
    const postsAfter = sp?.get('posts_after') || null;
    const postsLimit = postsLimitParam ? Math.max(1, Math.min(50, parseInt(postsLimitParam, 10) || 0)) : null;

    const now = Math.floor(Date.now() / 1000);
    const canUseCache = !postsLimit && !postsAfter; // only cache for default (non-paginated) requests
    if (canUseCache && cache.data && now - cache.ts < CACHE_TTL) {
      return NextResponse.json({ 
        posts: cache.data.posts, 
        posts_paging: cache.data.posts_paging || null,
        account_metadata: cache.data.account_metadata || null,
        cached: true 
      });
    }

    let igAccount = null;
    let instagram = null;
    let method = 'unknown';
    let tokenUsed = 'none';

    // Method 1: Try with User Access Token (most likely to work for Instagram)
    if (FB_USER_ACCESS_TOKEN) {
      try {
        console.log('🔍 Getting Instagram accounts using User Access Token...');
        const accountsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/instagram_accounts?access_token=${encodeURIComponent(FB_USER_ACCESS_TOKEN)}`;
        const accountsResponse = await fetch(accountsUrl);
        
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          if (accountsData.data && accountsData.data.length > 0) {
            igAccount = accountsData.data[0];
            console.log('✅ Instagram account found with User Token:', igAccount.id);
            
            const mediaFields = [
              'id',
              'caption',
              'media_type',
              'media_url', 
              'thumbnail_url',
              'permalink',
              'timestamp',
              'like_count',
              'comments_count',
              'children{id,media_type,media_url,thumbnail_url}'
            ].join(',');

            let mediaUrl = `https://graph.facebook.com/${FB_API_VERSION}/${igAccount.id}/media?fields=${mediaFields}&access_token=${encodeURIComponent(FB_USER_ACCESS_TOKEN)}`;
            if (postsLimit) mediaUrl += `&limit=${postsLimit}`;
            if (postsAfter) mediaUrl += `&after=${encodeURIComponent(postsAfter)}`;

            instagram = await fetchJson(mediaUrl);
            method = 'user_token_instagram_accounts';
            tokenUsed = 'user_token';
          }
        } else {
          const accountsError = await accountsResponse.text();
          console.log('User token failed:', accountsError);
        }
      } catch (err) {
        console.log('User Access Token method failed:', err.message);
      }
    }

    // Method 2: Fallback to Page Access Token
    if (!instagram && FB_PAGE_ACCESS_TOKEN) {
      try {
        console.log('🔍 Fallback: Getting Instagram accounts using Page Access Token...');
        const accountsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/instagram_accounts?access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
        const accountsResponse = await fetch(accountsUrl);
        
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          if (accountsData.data && accountsData.data.length > 0) {
            igAccount = accountsData.data[0];
            console.log('✅ Instagram account found with Page Token:', igAccount.id);
            
            const mediaFields = [
              'id',
              'caption',
              'media_type',
              'media_url', 
              'thumbnail_url',
              'permalink',
              'timestamp',
              'like_count',
              'comments_count',
              'children{id,media_type,media_url,thumbnail_url}'
            ].join(',');

            let mediaUrl = `https://graph.facebook.com/${FB_API_VERSION}/${igAccount.id}/media?fields=${mediaFields}&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
            if (postsLimit) mediaUrl += `&limit=${postsLimit}`;
            if (postsAfter) mediaUrl += `&after=${encodeURIComponent(postsAfter)}`;

            instagram = await fetchJson(mediaUrl);
            method = 'page_token_instagram_accounts';
            tokenUsed = 'page_token';
          }
        } else {
          const accountsError = await accountsResponse.text();
          console.log('Page token failed:', accountsError);
        }
      } catch (err) {
        console.log('Page Access Token method failed:', err.message);
      }
    }

    if (!instagram) {
      return NextResponse.json({ 
        error: 'no_instagram_account', 
        message: 'No Instagram accounts found. The Page Access Token may not have Instagram permissions. Please ensure your Instagram Business Account is connected and the access token has the required permissions.',
        debug: { 
          pageId: FB_PAGE_ID,
          hasPageToken: !!FB_PAGE_ACCESS_TOKEN,
          hasUserToken: !!FB_USER_ACCESS_TOKEN,
          recommendedAction: 'Generate a User Access Token with instagram_basic and pages_show_list permissions'
        }
      }, { status: 404 });
    }

    const posts = normalizeIgPosts(instagram);
    const posts_paging = instagram?.paging || null;

    if (canUseCache) {
      cache = { ts: now, data: { posts, posts_paging, account_metadata: igAccount } };
    }

    return NextResponse.json({ 
      posts, 
      posts_paging, 
      account_metadata: igAccount,
      method: method,
      token_used: tokenUsed,
      cached: false
    });

  } catch (err) {
    console.error('IG posts fetch error:', err);
    const msg = err?.message || 'Unknown error';
    if (msg.toLowerCase().includes('oauth') || msg.includes('190') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('access_token')) {
      return NextResponse.json({ error: 'invalid_token', message: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
