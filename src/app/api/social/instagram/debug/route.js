import { NextResponse } from 'next/server';

const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;

async function fetchWithDetails(url, label) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    return {
      method: label,
      status: res.status,
      success: res.ok,
      url: url.replace(IG_ACCESS_TOKEN, 'HIDDEN_TOKEN'),
      response: res.ok ? JSON.parse(text) : text
    };
  } catch (err) {
    return {
      method: label,
      success: false,
      error: err.message,
      url: url.replace(IG_ACCESS_TOKEN, 'HIDDEN_TOKEN')
    };
  }
}

export async function GET() {
  const results = [];

  // Test 1: Check access token validity
  results.push(await fetchWithDetails(
    `https://graph.facebook.com/me?access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`,
    'Token Validation'
  ));

  // Test 2: Try direct user ID approach
  if (IG_USER_ID) {
    results.push(await fetchWithDetails(
      `https://graph.facebook.com/${FB_API_VERSION}/${IG_USER_ID}?access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`,
      'User ID Info'
    ));

    results.push(await fetchWithDetails(
      `https://graph.facebook.com/${FB_API_VERSION}/${IG_USER_ID}/media?fields=id,caption&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`,
      'User ID Media'
    ));
  }

  // Test 3: Try Facebook Page approach
  if (FB_PAGE_ID) {
    results.push(await fetchWithDetails(
      `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}?fields=instagram_business_account&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`,
      'Page Info'
    ));
  }

  // Test 4: Try Instagram Basic Display API
  results.push(await fetchWithDetails(
    `https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`,
    'Instagram Basic Display'
  ));

  // Test 5: Check token permissions
  results.push(await fetchWithDetails(
    `https://graph.facebook.com/me/permissions?access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`,
    'Token Permissions'
  ));

  return NextResponse.json({
    debug: true,
    environment: {
      hasUserID: !!IG_USER_ID,
      hasPageID: !!FB_PAGE_ID,
      hasToken: !!IG_ACCESS_TOKEN,
      apiVersion: FB_API_VERSION
    },
    tests: results
  });
}