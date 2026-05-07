export const DEFAULT_WHATSAPP_PHONE_NUMBER = '21698557766';
export const SESSION_ATTRIBUTION_COOKIE_KEY = 'cci_session_attribution';
export const WHATSAPP_REDIRECT_PATH = '/out/whatsapp';

function normalizeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeNullableText(value) {
  const text = normalizeText(value, '');
  return text || null;
}

function toUrlInstance(value = '') {
  const cleanValue = normalizeText(value, '');
  if (!cleanValue) {
    return null;
  }

  try {
    return new URL(cleanValue);
  } catch (error) {
    try {
      return new URL(cleanValue, 'https://cciservices.online');
    } catch (fallbackError) {
      return null;
    }
  }
}

function getSanitizedAttributionFields(rawValue = {}) {
  return Object.fromEntries(
    Object.entries({
      source: normalizeNullableText(rawValue?.source || rawValue?.session_source),
      medium: normalizeNullableText(rawValue?.medium || rawValue?.session_medium),
      campaign: normalizeNullableText(rawValue?.campaign || rawValue?.session_campaign),
      landing_page: normalizeNullableText(rawValue?.landing_page || rawValue?.landingPage),
      referrer_host: normalizeNullableText(rawValue?.referrer_host || rawValue?.referrerHost),
      captured_at: normalizeNullableText(rawValue?.captured_at || rawValue?.capturedAt)
    }).filter(([, value]) => value !== null)
  );
}

export function normalizeWhatsAppPhoneNumber(value = '', fallback = DEFAULT_WHATSAPP_PHONE_NUMBER) {
  const digitsOnly = String(value || '').replace(/\D+/g, '');
  return digitsOnly || fallback;
}

export function buildWhatsAppDestinationUrl({
  phoneNumber = DEFAULT_WHATSAPP_PHONE_NUMBER,
  message = ''
} = {}) {
  const cleanPhoneNumber = normalizeWhatsAppPhoneNumber(phoneNumber);
  const cleanMessage = normalizeText(message, '');
  const query = new URLSearchParams();

  if (cleanMessage) {
    query.set('text', cleanMessage);
  }

  return `https://wa.me/${cleanPhoneNumber}${query.toString() ? `?${query.toString()}` : ''}`;
}

export function parseWhatsAppHref(href = '') {
  const url = toUrlInstance(href);
  if (!url) {
    return {
      phoneNumber: DEFAULT_WHATSAPP_PHONE_NUMBER,
      message: ''
    };
  }

  const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
  let phoneNumber = '';

  if (hostname === 'wa.me') {
    phoneNumber = url.pathname.split('/').filter(Boolean)[0] || '';
  } else if (hostname === 'api.whatsapp.com' || hostname.endsWith('.whatsapp.com')) {
    phoneNumber = url.searchParams.get('phone') || '';
  }

  return {
    phoneNumber: normalizeWhatsAppPhoneNumber(phoneNumber),
    message: normalizeText(url.searchParams.get('text'), '')
  };
}

export function buildTrackedWhatsAppHref({
  href = '',
  phoneNumber = '',
  message = '',
  eventLabel = 'unknown',
  pagePath = '',
  landingPage = ''
} = {}) {
  const parsedLink = href ? parseWhatsAppHref(href) : null;
  const cleanPhoneNumber = normalizeWhatsAppPhoneNumber(parsedLink?.phoneNumber || phoneNumber);
  const cleanMessage = normalizeText(parsedLink?.message || message, '');
  const cleanEventLabel = normalizeText(eventLabel, 'unknown');
  const cleanPagePath = normalizeText(pagePath, '');
  const cleanLandingPage = normalizeText(landingPage, '');
  const query = new URLSearchParams({
    phone: cleanPhoneNumber,
    label: cleanEventLabel
  });

  if (cleanMessage) {
    query.set('text', cleanMessage);
  }

  if (cleanPagePath) {
    query.set('pagePath', cleanPagePath);
  }

  if (cleanLandingPage) {
    query.set('landingPage', cleanLandingPage);
  }

  return `${WHATSAPP_REDIRECT_PATH}?${query.toString()}`;
}

export function serializeSessionAttributionCookie(value = {}) {
  const sanitized = getSanitizedAttributionFields(value);
  if (Object.keys(sanitized).length === 0) {
    return '';
  }

  return encodeURIComponent(JSON.stringify(sanitized));
}

export function parseSessionAttributionCookie(value = '') {
  if (!value) {
    return {};
  }

  try {
    return getSanitizedAttributionFields(JSON.parse(decodeURIComponent(value)));
  } catch (error) {
    return {};
  }
}

export function extractGaClientIdFromGaCookie(value = '') {
  const parts = String(value || '').split('.');
  if (parts.length < 4) {
    return null;
  }

  return `${parts[2]}.${parts[3]}`;
}

export function getPathFromUrl(value = '') {
  const url = toUrlInstance(value);
  if (!url) {
    return '';
  }

  return `${url.pathname}${url.search}`;
}

export function getPathnameFromUrl(value = '') {
  const url = toUrlInstance(value);
  return url?.pathname || '';
}

export function getHostnameFromUrl(value = '') {
  const url = toUrlInstance(value);
  return url?.hostname ? url.hostname.replace(/^www\./, '').toLowerCase() : '';
}
