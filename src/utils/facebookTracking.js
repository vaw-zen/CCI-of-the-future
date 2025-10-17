/**
 * Facebook Referral Tracking Setup
 * This script helps set up proper tracking for Facebook referrals
 */

// 1. UTM Parameter Generator for Facebook Posts
export function generateFacebookUTM(baseUrl, postType = 'post', content = '') {
  const utmParams = new URLSearchParams({
    utm_source: 'facebook',
    utm_medium: 'social',
    utm_campaign: postType === 'reel' ? 'facebook_reels' : 'facebook_posts',
    utm_content: content.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'social_post'
  });
  
  return `${baseUrl}?${utmParams.toString()}`;
}

// 2. Facebook Open Graph Meta Tags for Better Tracking
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
    // Add tracking pixel
    'fb:pages': process.env.FB_PAGE_ID || ''
  };
}

// 3. Facebook Pixel Events for Conversion Tracking
export function initFacebookPixel() {
  if (typeof window === 'undefined') return;
  
  // Facebook Pixel Code
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);
  fbq('track', 'PageView');
}

// 4. Track Facebook Referrals with Custom Events
export function trackFacebookReferral(source, content) {
  if (typeof window === 'undefined') return;
  
  // Google Analytics 4 Event
  if (window.gtag) {
    window.gtag('event', 'facebook_referral', {
      source: source,
      content: content,
      referrer: document.referrer
    });
  }
  
  // Facebook Pixel Event
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      source: 'facebook',
      content_name: content
    });
  }
}

// 5. Detect and Log Facebook Referrals
export function detectFacebookReferral() {
  if (typeof window === 'undefined') return null;
  
  const referrer = document.referrer;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for Facebook referrer
  const isFacebookReferrer = referrer.includes('facebook.com') || 
                            referrer.includes('m.facebook.com') ||
                            referrer.includes('l.facebook.com');
  
  // Check for UTM parameters
  const isUTMFacebook = urlParams.get('utm_source') === 'facebook';
  
  if (isFacebookReferrer || isUTMFacebook) {
    const fbReferral = {
      source: 'facebook',
      referrer: referrer,
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_content: urlParams.get('utm_content'),
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };
    
    // Send to analytics
    trackFacebookReferral('facebook', window.location.pathname);
    
    // Store in localStorage for debugging
    const existingReferrals = JSON.parse(localStorage.getItem('fb_referrals') || '[]');
    existingReferrals.push(fbReferral);
    localStorage.setItem('fb_referrals', JSON.stringify(existingReferrals.slice(-50))); // Keep last 50
    
    return fbReferral;
  }
  
  return null;
}

// 6. Client-side script to be added to pages
export const facebookTrackingScript = `
<script>
  // Detect Facebook referrals on page load
  window.addEventListener('DOMContentLoaded', function() {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (referrer.includes('facebook.com') || urlParams.get('utm_source') === 'facebook') {
      // Track in Google Analytics
      if (window.gtag) {
        window.gtag('event', 'facebook_referral', {
          page_title: document.title,
          page_location: window.location.href,
          referrer: referrer
        });
      }
      
      // Send custom event to our API for logging
      fetch('/api/analytics/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'facebook',
          referrer: referrer,
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        })
      }).catch(console.error);
    }
  });
</script>
`;

// 7. Server-side Facebook link validation
export async function validateFacebookLinks() {
  const links = [
    'https://cciservices.online',
    'https://cciservices.online/conseils',
    'https://cciservices.online/services',
    'https://cciservices.online/reels'
  ];
  
  const results = [];
  
  for (const link of links) {
    try {
      // Test Facebook's URL debugger
      const debuggerUrl = `https://developers.facebook.com/tools/debug/sharing/?q=${encodeURIComponent(link)}`;
      
      results.push({
        url: link,
        debugger_url: debuggerUrl,
        status: 'ready_for_testing'
      });
    } catch (error) {
      results.push({
        url: link,
        error: error.message
      });
    }
  }
  
  return results;
}

// 8. Generate Facebook-optimized URLs for posts
export function generateFacebookPostUrls() {
  const baseUrls = [
    { url: 'https://cciservices.online', type: 'homepage' },
    { url: 'https://cciservices.online/conseils', type: 'articles' },
    { url: 'https://cciservices.online/services', type: 'services' },
    { url: 'https://cciservices.online/devis', type: 'quote' }
  ];
  
  return baseUrls.map(item => ({
    ...item,
    facebook_url: generateFacebookUTM(item.url, 'post', item.type),
    short_url: item.url // Could integrate with URL shortener
  }));
}