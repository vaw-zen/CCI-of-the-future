'use client';

import {
  CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_NOTICE_ACKNOWLEDGED,
  OPEN_COOKIE_PREFERENCES_EVENT
} from './consent.constants';

const LEGACY_NOTICE_VALUES = new Set(['accepted', 'rejected']);
const ALLOWED_NOTICE_VALUES = new Set([COOKIE_NOTICE_ACKNOWLEDGED, ...LEGACY_NOTICE_VALUES]);

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

function getGrantedConsentPayload() {
  return {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
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

export function getCookieConsentStatus() {
  const status = getCookieValue(COOKIE_CONSENT_COOKIE_NAME);
  return ALLOWED_NOTICE_VALUES.has(status) ? status : '';
}

export function hasCookieConsentChoice() {
  return Boolean(getCookieConsentStatus());
}

export function isCookieConsentAccepted() {
  return hasCookieConsentChoice();
}

export function getCookieConsentState() {
  const status = getCookieConsentStatus();
  const hasAcknowledged = Boolean(status);

  return {
    status,
    hasChoice: hasAcknowledged,
    hasAcknowledged,
    acknowledged: hasAcknowledged
  };
}

export function applyGoogleConsentStatus() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'update', getGrantedConsentPayload());
}

export function setCookieConsent(status = COOKIE_NOTICE_ACKNOWLEDGED) {
  const normalizedStatus = ALLOWED_NOTICE_VALUES.has(status) ? COOKIE_NOTICE_ACKNOWLEDGED : '';

  if (!normalizedStatus) {
    return;
  }

  setCookieValue(COOKIE_CONSENT_COOKIE_NAME, normalizedStatus, COOKIE_CONSENT_MAX_AGE);
  dispatchConsentChange();
}

export function acknowledgeCookieNotice() {
  setCookieConsent(COOKIE_NOTICE_ACKNOWLEDGED);
}

export function acceptCookieConsent() {
  acknowledgeCookieNotice();
}

export function rejectCookieConsent() {
  acknowledgeCookieNotice();
}

export function openCookiePreferences() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}

export function shouldLoadOptionalTracking() {
  return true;
}
