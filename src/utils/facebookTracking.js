import { getAnalyticsContext, pushAnalyticsEvent } from './analyticsGateway';

/**
 * Facebook referral helpers kept for URL generation and legacy imports.
 * Vendor delivery is delegated to GTM; no direct fbq/gtag calls remain here.
 */

export function generateFacebookUTM(baseUrl, postType = 'post', content = '') {
  const utmParams = new URLSearchParams({
    utm_source: 'facebook',
    utm_medium: 'social',
    utm_campaign: postType === 'reel' ? 'facebook_reels' : 'facebook_posts',
    utm_content: content.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'social_post'
  });

  return `${baseUrl}?${utmParams.toString()}`;
}

export function generateFacebookOGTags(url, title, description, image) {
  return {
    'og:url': url,
    'og:type': 'website',
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:site_name': 'CCI Services',
    'og:locale': 'fr_TN',
    'fb:app_id': process.env.FACEBOOK_APP_ID || '',
    'fb:pages': process.env.FB_PAGE_ID || ''
  };
}

export function initFacebookPixel() {
  return false;
}

export function trackFacebookReferral(source, content) {
  pushAnalyticsEvent('facebook_referral', {
    ...getAnalyticsContext(),
    source,
    content
  });
}

export function detectFacebookReferral() {
  if (typeof window === 'undefined') {
    return null;
  }

  const referrer = document.referrer;
  const urlParams = new URLSearchParams(window.location.search);

  const isFacebookReferrer = referrer.includes('facebook.com')
    || referrer.includes('m.facebook.com')
    || referrer.includes('l.facebook.com');
  const isUtmFacebook = urlParams.get('utm_source') === 'facebook';

  if (!isFacebookReferrer && !isUtmFacebook) {
    return null;
  }

  const fbReferral = {
    source: 'facebook',
    referrer,
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    timestamp: new Date().toISOString(),
    page: window.location.pathname
  };

  trackFacebookReferral('facebook', window.location.pathname);

  try {
    const existingReferrals = JSON.parse(localStorage.getItem('fb_referrals') || '[]');
    existingReferrals.push(fbReferral);
    localStorage.setItem('fb_referrals', JSON.stringify(existingReferrals.slice(-50)));
  } catch (error) {
    // Ignore local debugging storage failures.
  }

  return fbReferral;
}

export const facebookTrackingScript = '';

export async function validateFacebookLinks() {
  const links = [
    'https://cciservices.online',
    'https://cciservices.online/conseils',
    'https://cciservices.online/services',
    'https://cciservices.online/reels'
  ];

  return links.map((link) => ({
    url: link,
    debugger_url: `https://developers.facebook.com/tools/debug/sharing/?q=${encodeURIComponent(link)}`,
    status: 'ready_for_testing'
  }));
}

export function generateFacebookPostUrls() {
  const baseUrls = [
    { url: 'https://cciservices.online', type: 'homepage' },
    { url: 'https://cciservices.online/conseils', type: 'articles' },
    { url: 'https://cciservices.online/services', type: 'services' },
    { url: 'https://cciservices.online/devis', type: 'quote' }
  ];

  return baseUrls.map((item) => ({
    ...item,
    facebook_url: generateFacebookUTM(item.url, 'post', item.type),
    short_url: item.url
  }));
}
