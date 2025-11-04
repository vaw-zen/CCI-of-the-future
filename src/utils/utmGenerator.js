/**
 * UTM Parameter Generator for Marketing Campaigns
 * Ensures consistent UTM tracking across all marketing channels
 */

/**
 * Generate a URL with UTM parameters
 * @param {string} baseUrl - The base URL (e.g., 'https://cciservices.online/services')
 * @param {Object} params - UTM parameters
 * @param {string} params.source - utm_source (e.g., 'facebook', 'google', 'instagram')
 * @param {string} params.medium - utm_medium (e.g., 'social', 'cpc', 'email', 'organic')
 * @param {string} params.campaign - utm_campaign (e.g., 'summer_promo', 'new_service_launch')
 * @param {string} [params.content] - utm_content (optional - for A/B testing)
 * @param {string} [params.term] - utm_term (optional - for paid keywords)
 * @returns {string} URL with UTM parameters
 */
export function generateUTMUrl(baseUrl, params) {
  const { source, medium, campaign, content, term } = params;
  
  // Validate required parameters
  if (!source || !medium || !campaign) {
    console.warn('UTM Generator: source, medium, and campaign are required');
    return baseUrl;
  }
  
  // Clean and format parameters
  const utmParams = new URLSearchParams();
  utmParams.set('utm_source', source.toLowerCase().trim());
  utmParams.set('utm_medium', medium.toLowerCase().trim());
  utmParams.set('utm_campaign', campaign.toLowerCase().replace(/\s+/g, '_').trim());
  
  if (content) {
    utmParams.set('utm_content', content.toLowerCase().replace(/\s+/g, '_').trim());
  }
  
  if (term) {
    utmParams.set('utm_term', term.toLowerCase().replace(/\s+/g, '_').trim());
  }
  
  // Combine with base URL
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${utmParams.toString()}`;
}

/**
 * Predefined UTM configurations for common campaigns
 */
export const UTM_PRESETS = {
  // Facebook Campaigns
  FACEBOOK_POST: {
    source: 'facebook',
    medium: 'social',
    campaign: 'organic_post'
  },
  FACEBOOK_REEL: {
    source: 'facebook',
    medium: 'social',
    campaign: 'reels'
  },
  FACEBOOK_AD: {
    source: 'facebook',
    medium: 'cpc',
    campaign: 'facebook_ads'
  },
  FACEBOOK_STORY: {
    source: 'facebook',
    medium: 'social',
    campaign: 'stories'
  },
  
  // Instagram Campaigns
  INSTAGRAM_POST: {
    source: 'instagram',
    medium: 'social',
    campaign: 'organic_post'
  },
  INSTAGRAM_REEL: {
    source: 'instagram',
    medium: 'social',
    campaign: 'reels'
  },
  INSTAGRAM_STORY: {
    source: 'instagram',
    medium: 'social',
    campaign: 'stories'
  },
  INSTAGRAM_BIO: {
    source: 'instagram',
    medium: 'social',
    campaign: 'bio_link'
  },
  
  // Google Campaigns
  GOOGLE_ADS: {
    source: 'google',
    medium: 'cpc',
    campaign: 'google_ads'
  },
  GOOGLE_ORGANIC: {
    source: 'google',
    medium: 'organic',
    campaign: 'seo'
  },
  
  // Email Campaigns
  EMAIL_NEWSLETTER: {
    source: 'email',
    medium: 'email',
    campaign: 'newsletter'
  },
  EMAIL_PROMO: {
    source: 'email',
    medium: 'email',
    campaign: 'promotional'
  },
  
  // WhatsApp
  WHATSAPP: {
    source: 'whatsapp',
    medium: 'messaging',
    campaign: 'direct_message'
  },
  
  // Direct/Referral
  DIRECT: {
    source: 'direct',
    medium: 'none',
    campaign: 'direct_traffic'
  },
  REFERRAL: {
    source: 'referral',
    medium: 'referral',
    campaign: 'website_referral'
  }
};

/**
 * Generate URLs for all main pages with specific campaign
 * @param {Object} preset - UTM preset from UTM_PRESETS
 * @param {string} [content] - Optional content identifier
 * @returns {Object} Object with all main page URLs
 */
export function generateCampaignURLs(preset, content = '') {
  const baseUrls = {
    home: 'https://cciservices.online',
    services: 'https://cciservices.online/services',
    marbre: 'https://cciservices.online/marbre',
    salon: 'https://cciservices.online/salon',
    tapis: 'https://cciservices.online/tapis',
    tfc: 'https://cciservices.online/tfc',
    conseils: 'https://cciservices.online/conseils',
    contact: 'https://cciservices.online/contact',
    devis: 'https://cciservices.online/devis'
  };
  
  const campaignUrls = {};
  
  for (const [key, url] of Object.entries(baseUrls)) {
    const params = { ...preset };
    if (content) {
      params.content = content;
    }
    campaignUrls[key] = generateUTMUrl(url, params);
  }
  
  return campaignUrls;
}

/**
 * Extract UTM parameters from current URL
 * @returns {Object|null} Object with UTM parameters or null if none found
 */
export function extractUTMParameters() {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('utm_source');
  
  if (!source) return null;
  
  return {
    source: source,
    medium: urlParams.get('utm_medium'),
    campaign: urlParams.get('utm_campaign'),
    content: urlParams.get('utm_content'),
    term: urlParams.get('utm_term'),
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
    pagePath: window.location.pathname
  };
}

/**
 * Store UTM parameters in session storage for attribution
 */
export function storeUTMParameters() {
  if (typeof window === 'undefined') return;
  
  const utmData = extractUTMParameters();
  if (utmData) {
    // Store in sessionStorage for current session
    sessionStorage.setItem('utm_data', JSON.stringify(utmData));
    
    // Also store in localStorage with timestamp for historical tracking
    const historicalUTM = JSON.parse(localStorage.getItem('utm_history') || '[]');
    historicalUTM.push(utmData);
    // Keep only last 20 entries
    if (historicalUTM.length > 20) {
      historicalUTM.shift();
    }
    localStorage.setItem('utm_history', JSON.stringify(historicalUTM));
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'utm_captured', {
        event_category: 'attribution',
        utm_source: utmData.source,
        utm_medium: utmData.medium,
        utm_campaign: utmData.campaign,
        utm_content: utmData.content || 'none',
        utm_term: utmData.term || 'none'
      });
    }
  }
}

/**
 * Get stored UTM parameters from current session
 */
export function getStoredUTMParameters() {
  if (typeof window === 'undefined') return null;
  
  const stored = sessionStorage.getItem('utm_data');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Generate Facebook-specific URLs with proper UTM
 */
export function generateFacebookLinks(postType = 'post', contentDescription = '') {
  const preset = postType === 'reel' ? UTM_PRESETS.FACEBOOK_REEL : UTM_PRESETS.FACEBOOK_POST;
  const content = contentDescription.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'social_post';
  
  return generateCampaignURLs(preset, content);
}

/**
 * Generate Instagram-specific URLs with proper UTM
 */
export function generateInstagramLinks(postType = 'post', contentDescription = '') {
  const presetMap = {
    'post': UTM_PRESETS.INSTAGRAM_POST,
    'reel': UTM_PRESETS.INSTAGRAM_REEL,
    'story': UTM_PRESETS.INSTAGRAM_STORY,
    'bio': UTM_PRESETS.INSTAGRAM_BIO
  };
  
  const preset = presetMap[postType] || UTM_PRESETS.INSTAGRAM_POST;
  const content = contentDescription.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'social_post';
  
  return generateCampaignURLs(preset, content);
}

/**
 * Generate Google Ads URLs with proper UTM
 */
export function generateGoogleAdsLinks(campaignName, adGroupName = '', keyword = '') {
  const params = {
    source: 'google',
    medium: 'cpc',
    campaign: campaignName.toLowerCase().replace(/\s+/g, '_'),
    content: adGroupName ? adGroupName.toLowerCase().replace(/\s+/g, '_') : undefined,
    term: keyword ? keyword.toLowerCase().replace(/\s+/g, '_') : undefined
  };
  
  return generateCampaignURLs(params);
}

/**
 * Validate if URL has proper UTM parameters
 */
export function validateUTMUrl(url) {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    return {
      isValid: params.has('utm_source') && params.has('utm_medium') && params.has('utm_campaign'),
      hasSource: params.has('utm_source'),
      hasMedium: params.has('utm_medium'),
      hasCampaign: params.has('utm_campaign'),
      hasContent: params.has('utm_content'),
      hasTerm: params.has('utm_term'),
      parameters: {
        source: params.get('utm_source'),
        medium: params.get('utm_medium'),
        campaign: params.get('utm_campaign'),
        content: params.get('utm_content'),
        term: params.get('utm_term')
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
}

/**
 * Quick link generators for common use cases
 */
export const QuickLinks = {
  // For Facebook posts about specific services
  facebookServicePost(service) {
    const baseUrl = `https://cciservices.online/${service}`;
    return generateUTMUrl(baseUrl, {
      source: 'facebook',
      medium: 'social',
      campaign: 'service_promotion',
      content: service
    });
  },
  
  // For Instagram bio link
  instagramBio() {
    return generateUTMUrl('https://cciservices.online', {
      source: 'instagram',
      medium: 'social',
      campaign: 'bio_link'
    });
  },
  
  // For WhatsApp status
  whatsappStatus(service = 'general') {
    return generateUTMUrl('https://cciservices.online', {
      source: 'whatsapp',
      medium: 'messaging',
      campaign: 'status',
      content: service
    });
  },
  
  // For email signature
  emailSignature() {
    return generateUTMUrl('https://cciservices.online', {
      source: 'email',
      medium: 'signature',
      campaign: 'email_signature'
    });
  }
};

// Default export for convenience
export default {
  generateUTMUrl,
  generateCampaignURLs,
  extractUTMParameters,
  storeUTMParameters,
  getStoredUTMParameters,
  generateFacebookLinks,
  generateInstagramLinks,
  generateGoogleAdsLinks,
  validateUTMUrl,
  UTM_PRESETS,
  QuickLinks
};
