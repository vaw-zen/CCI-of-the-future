const SESSION_ATTRIBUTION_KEY = 'cci_session_attribution';
const QUOTE_CALCULATOR_CONTEXT_KEY = 'cci_quote_calculator_context';
const FORBIDDEN_PARAM_KEYS = new Set([
  'email',
  'emailaddress',
  'email_address',
  'telephone',
  'phone',
  'phonenumber',
  'phone_number',
  'message',
  'useragent',
  'user_agent',
  'form_data',
  'custom_parameters'
]);

export const ANALYTICS_EVENT_ALLOWLIST = [
  'page_view',
  'utm_arrival',
  'utm_captured',
  'session_start',
  'service_interaction',
  'form_progress',
  'phone_click',
  'email_click',
  'whatsapp_click',
  'view_section',
  'scroll_depth',
  'view_promotion',
  'select_promotion',
  'hero_interaction',
  'select_content',
  'gallery_interaction',
  'video_engagement',
  'timing_complete',
  'begin_checkout',
  'checkout_progress',
  'form_field_focus',
  'form_field_complete',
  'form_abandonment',
  'quote_calculator_started',
  'quote_calculator_calculated',
  'generate_lead',
  'conversion_event_contact',
  'article_read_progress',
  'article_complete',
  'faq_expanded',
  'search',
  'navigation_click',
  'social_interaction',
  'file_download',
  'gallery_view',
  'book_consultation',
  'exception',
  'engagement_milestone',
  'view_item',
  'add_to_cart',
  'view_conseils_page',
  'select_article',
  'filter_category',
  'toc_navigation',
  'navigate_article',
  'breadcrumb_click',
  'select_related_service',
  'back_to_conseils',
  'view_reel',
  'reel_video_started',
  'reel_video_paused',
  'reel_video_progress',
  'reel_video_completed',
  'newsletter_signup_started',
  'newsletter_signup_submitted',
  'newsletter_signup_failed',
  'newsletter_signup_verified',
  'form_validation_failed',
  'form_submit_failed',
  'facebook_referral',
  'view_page_type',
  'cta_click',
  'gallery_image_click',
  'email_click_chrome',
  'email_click_simple',
  'form_submit',
  'click',
  'button_click',
  'link_click',
  'view_service_page'
];

const ALLOWED_EVENT_NAMES = new Set(ANALYTICS_EVENT_ALLOWLIST);

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function toSnakeCase(value = '') {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function sanitizeValue(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    const sanitizedItems = value
      .map((item) => sanitizeValue(item))
      .filter((item) => item !== undefined);
    return sanitizedItems.length > 0 ? sanitizedItems : undefined;
  }

  if (typeof value === 'object') {
    const sanitizedObject = sanitizePayload(value);
    return Object.keys(sanitizedObject).length > 0 ? sanitizedObject : undefined;
  }

  return value;
}

export function sanitizePayload(payload = {}) {
  const sanitizedEntries = Object.entries(payload).flatMap(([rawKey, rawValue]) => {
    const normalizedKey = toSnakeCase(rawKey);
    if (!normalizedKey || FORBIDDEN_PARAM_KEYS.has(normalizedKey)) {
      return [];
    }

    const sanitizedValue = sanitizeValue(rawValue);
    if (sanitizedValue === undefined) {
      return [];
    }

    return [[normalizedKey, sanitizedValue]];
  });

  return Object.fromEntries(sanitizedEntries);
}

function getCookieValue(name) {
  if (typeof document === 'undefined') {
    return '';
  }

  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const match = cookies.find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

function getReferrerHost(referrer = '') {
  if (!referrer) {
    return '';
  }

  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch (error) {
    return '';
  }
}

export function getGaClientId() {
  const gaCookie = getCookieValue('_ga');
  if (!gaCookie) {
    return '';
  }

  const parts = gaCookie.split('.');
  if (parts.length < 4) {
    return '';
  }

  return `${parts[2]}.${parts[3]}`;
}

export function readSessionAttribution() {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.sessionStorage.getItem(SESSION_ATTRIBUTION_KEY);
  if (!stored) {
    return null;
  }

  const parsed = safeJsonParse(stored);
  if (!parsed) {
    window.sessionStorage.removeItem(SESSION_ATTRIBUTION_KEY);
    return null;
  }

  return parsed;
}

export function inferSessionAttribution() {
  if (typeof window === 'undefined') {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const currentHost = window.location.hostname.replace(/^www\./, '');
  const referrerHost = getReferrerHost(document.referrer);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');

  let source = utmSource;
  let medium = utmMedium;

  if (!source) {
    if (referrerHost.includes('google.')) {
      source = 'google';
      medium = 'organic';
    } else if (referrerHost.includes('bing.')) {
      source = 'bing';
      medium = 'organic';
    } else if (referrerHost.includes('facebook.')) {
      source = 'facebook';
      medium = 'social';
    } else if (referrerHost.includes('instagram.')) {
      source = 'instagram';
      medium = 'social';
    } else if (referrerHost.includes('linkedin.')) {
      source = 'linkedin';
      medium = 'social';
    } else if (referrerHost && referrerHost !== currentHost) {
      source = referrerHost;
      medium = 'referral';
    } else {
      source = 'direct';
      medium = '(none)';
    }
  }

  return sanitizePayload({
    source,
    medium: medium || '(none)',
    campaign: utmCampaign || undefined,
    content: urlParams.get('utm_content') || undefined,
    term: urlParams.get('utm_term') || undefined,
    landing_page: window.location.pathname,
    landing_location: window.location.href,
    referrer_host: referrerHost || undefined,
    captured_at: new Date().toISOString()
  });
}

export function persistSessionAttribution() {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = readSessionAttribution();
  if (existing) {
    return existing;
  }

  const inferred = inferSessionAttribution();
  if (inferred) {
    window.sessionStorage.setItem(SESSION_ATTRIBUTION_KEY, JSON.stringify(inferred));
  }

  return inferred;
}

export function getQuoteCalculatorContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.sessionStorage.getItem(QUOTE_CALCULATOR_CONTEXT_KEY);
  if (!stored) {
    return null;
  }

  const parsed = safeJsonParse(stored);
  if (!parsed) {
    window.sessionStorage.removeItem(QUOTE_CALCULATOR_CONTEXT_KEY);
    return null;
  }

  return parsed;
}

export function setQuoteCalculatorContext(context = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitized = sanitizePayload({
    ...context,
    updated_at: new Date().toISOString()
  });

  if (Object.keys(sanitized).length === 0) {
    window.sessionStorage.removeItem(QUOTE_CALCULATOR_CONTEXT_KEY);
    return;
  }

  window.sessionStorage.setItem(QUOTE_CALCULATOR_CONTEXT_KEY, JSON.stringify(sanitized));
}

export function clearQuoteCalculatorContext() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(QUOTE_CALCULATOR_CONTEXT_KEY);
}

export function getAnalyticsContext(additionalData = {}) {
  if (typeof window === 'undefined') {
    return sanitizePayload(additionalData);
  }

  const sessionAttribution = persistSessionAttribution() || {};
  const utmData = safeJsonParse(window.sessionStorage.getItem('utm_data'), {}) || {};

  return sanitizePayload({
    ga_client_id: getGaClientId(),
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    landing_page: sessionAttribution.landing_page || window.location.pathname,
    landing_location: sessionAttribution.landing_location,
    session_source: utmData.source || sessionAttribution.source,
    session_medium: utmData.medium || sessionAttribution.medium,
    session_campaign: utmData.campaign || sessionAttribution.campaign,
    referrer_host: sessionAttribution.referrer_host || getReferrerHost(document.referrer),
    entry_path: `${window.location.pathname}${window.location.search}`,
    ...additionalData
  });
}

function pushToDataLayer(payload) {
  if (typeof window === 'undefined') {
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  return true;
}

export function pushAnalyticsEvent(name, payload = {}) {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!ALLOWED_EVENT_NAMES.has(name)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[analytics] blocked unknown event "${name}"`);
    }
    return false;
  }

  const sanitizedPayload = sanitizePayload(payload);
  return pushToDataLayer({
    event: name,
    event_name: name,
    ...sanitizedPayload
  });
}

export function pushConsentEvent(command, action, payload = {}) {
  return pushToDataLayer([command, action, payload]);
}
