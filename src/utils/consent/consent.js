'use client';

import {
  CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_CONSENT_REJECTED,
  FACEBOOK_PIXEL_SCRIPT_ID,
  FACEBOOK_REFERRALS_KEY,
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  GTAG_CONVERSION_ID,
  GTAG_INIT_ID,
  GTAG_LOADER_ID,
  GTM_LOADER_ID,
  OPEN_COOKIE_PREFERENCES_EVENT,
  SESSION_ATTRIBUTION_KEY,
  TRACKING_ELIGIBLE_COOKIE_NAME,
  UTM_HISTORY_KEY,
  UTM_SESSION_KEY
} from './consent.constants';

const ALLOWED_CONSENT_VALUES = new Set([COOKIE_CONSENT_ACCEPTED, COOKIE_CONSENT_REJECTED]);
const OPTIONAL_COOKIE_PATTERNS = [/^_ga/, /^_gid$/, /^_gat/, /^_gcl_/, /^_fbp$/, /^_fbc$/];

function getCookieValue(name) {
  if (typeof document === 'undefined') {
    return '';
  }

  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const match = cookies.find((entry) => entry.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

function setCookieValue(name, value, maxAge) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function getDomainVariants(hostname) {
  if (!hostname || hostname === 'localhost' || hostname.includes(':')) {
    return [''];
  }

  const segments = hostname.split('.');
  const domains = new Set(['', hostname, `.${hostname}`]);

  for (let index = 1; index < segments.length - 1; index += 1) {
    const domain = segments.slice(index).join('.');
    domains.add(domain);
    domains.add(`.${domain}`);
  }

  return Array.from(domains);
}

function deleteCookie(name) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const domains = getDomainVariants(window.location.hostname);

  domains.forEach((domain) => {
    const domainPart = domain ? `; domain=${domain}` : '';
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}; samesite=lax`;
  });
}

function removeOptionalTrackingArtifacts() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  [GTAG_LOADER_ID, GTAG_INIT_ID, GTAG_CONVERSION_ID, GTM_LOADER_ID, FACEBOOK_PIXEL_SCRIPT_ID].forEach((id) => {
    document.getElementById(id)?.remove();
  });

  document
    .querySelectorAll('script[src*="googletagmanager.com"], script[src*="facebook.net"], iframe[src*="googletagmanager.com"]')
    .forEach((element) => element.remove());

  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  window[`ga-disable-${GOOGLE_ADS_ID}`] = true;
  window.__cciConsentGranted = false;
  window.gtag_report_conversion = undefined;
  window.fbq = undefined;
  window._fbq = undefined;
}

export function clearOptionalTrackingCookies() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const cookieNames = document.cookie
    .split('; ')
    .map((entry) => entry.split('=')[0])
    .filter(Boolean);

  cookieNames.forEach((name) => {
    if (OPTIONAL_COOKIE_PATTERNS.some((pattern) => pattern.test(name))) {
      deleteCookie(name);
    }
  });

  deleteCookie('cci_analytics');

  window.sessionStorage.removeItem(SESSION_ATTRIBUTION_KEY);
  window.sessionStorage.removeItem(UTM_SESSION_KEY);
  window.localStorage.removeItem(UTM_HISTORY_KEY);
  window.localStorage.removeItem(FACEBOOK_REFERRALS_KEY);

  removeOptionalTrackingArtifacts();
}

function getConsentPayload(isGranted) {
  return {
    analytics_storage: isGranted ? 'granted' : 'denied',
    ad_storage: isGranted ? 'granted' : 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  };
}

function dispatchConsentChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGE_EVENT, {
      detail: getCookieConsentState()
    })
  );
}

export function getTrackingEligibility() {
  return getCookieValue(TRACKING_ELIGIBLE_COOKIE_NAME) === '1';
}

export function getCookieConsentStatus() {
  const status = getCookieValue(COOKIE_CONSENT_COOKIE_NAME);
  return ALLOWED_CONSENT_VALUES.has(status) ? status : '';
}

export function hasCookieConsentChoice() {
  return Boolean(getCookieConsentStatus());
}

export function isCookieConsentAccepted() {
  return getCookieConsentStatus() === COOKIE_CONSENT_ACCEPTED;
}

export function getCookieConsentState() {
  const status = getCookieConsentStatus();
  const eligible = getTrackingEligibility();

  return {
    eligible,
    status,
    hasChoice: Boolean(status),
    accepted: status === COOKIE_CONSENT_ACCEPTED,
    rejected: status === COOKIE_CONSENT_REJECTED
  };
}

export function applyGoogleConsentStatus(status) {
  if (typeof window === 'undefined') {
    return;
  }

  const isGranted = status === COOKIE_CONSENT_ACCEPTED && getTrackingEligibility();

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window[`ga-disable-${GA_MEASUREMENT_ID}`] = !isGranted;
  window[`ga-disable-${GOOGLE_ADS_ID}`] = !isGranted;
  window.__cciConsentGranted = isGranted;

  window.gtag('consent', 'update', getConsentPayload(isGranted));
}

export function setCookieConsent(status) {
  if (!ALLOWED_CONSENT_VALUES.has(status)) {
    return;
  }

  setCookieValue(COOKIE_CONSENT_COOKIE_NAME, status, COOKIE_CONSENT_MAX_AGE);
  applyGoogleConsentStatus(status);

  if (status === COOKIE_CONSENT_REJECTED) {
    clearOptionalTrackingCookies();
  }

  dispatchConsentChange();
}

export function acceptCookieConsent() {
  setCookieConsent(COOKIE_CONSENT_ACCEPTED);
}

export function rejectCookieConsent(options = {}) {
  const previousStatus = getCookieConsentStatus();

  setCookieConsent(COOKIE_CONSENT_REJECTED);

  if (previousStatus === COOKIE_CONSENT_ACCEPTED && options.reload !== false && typeof window !== 'undefined') {
    window.setTimeout(() => {
      window.location.reload();
    }, 120);
  }
}

export function openCookiePreferences() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}

export function shouldLoadOptionalTracking() {
  return getTrackingEligibility() && isCookieConsentAccepted();
}
