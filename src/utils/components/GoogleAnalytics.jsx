'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { applyGoogleConsentStatus } from '@/utils/consent/consent';
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  GTAG_CONVERSION_ID,
  GTAG_INIT_ID,
  GTAG_LOADER_ID,
  GTM_CONTAINER_ID,
  GTM_LOADER_ID,
  SESSION_ATTRIBUTION_KEY
} from '@/utils/consent/consent.constants';

function getCurrentPagePath() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.pathname}${window.location.search}`;
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

function inferSessionAttribution() {
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

  return {
    source,
    medium: medium || '(none)',
    campaign: utmCampaign || undefined,
    content: urlParams.get('utm_content') || undefined,
    term: urlParams.get('utm_term') || undefined,
    landingPage: window.location.pathname,
    landingLocation: window.location.href,
    referrerHost: referrerHost || undefined,
    capturedAt: new Date().toISOString()
  };
}

function persistSessionAttribution() {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = window.sessionStorage.getItem(SESSION_ATTRIBUTION_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (error) {
      window.sessionStorage.removeItem(SESSION_ATTRIBUTION_KEY);
    }
  }

  const attribution = inferSessionAttribution();
  if (attribution) {
    window.sessionStorage.setItem(
      SESSION_ATTRIBUTION_KEY,
      JSON.stringify(attribution)
    );
  }

  return attribution;
}

function trackUtmArrival() {
  if (typeof window === 'undefined' || typeof window.gtag === 'undefined') {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');

  if (!utmSource) {
    return;
  }

  window.gtag('event', 'utm_arrival', {
    event_category: 'traffic_source',
    utm_source: utmSource,
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
    page_location: window.location.href,
    page_path: getCurrentPagePath()
  });
}

function ensureGoogleScriptsLoaded() {
  if (typeof document === 'undefined' || document.getElementById(GTAG_LOADER_ID)) {
    return;
  }

  const loaderScript = document.createElement('script');
  loaderScript.id = GTAG_LOADER_ID;
  loaderScript.async = true;
  loaderScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

  const initScript = document.createElement('script');
  initScript.id = GTAG_INIT_ID;
  initScript.text = `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      page_path: window.location.pathname + window.location.search,
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: false
    });
    gtag('config', '${GOOGLE_ADS_ID}');
  `;

  const conversionScript = document.createElement('script');
  conversionScript.id = GTAG_CONVERSION_ID;
  conversionScript.text = `
    function gtag_report_conversion(url) {
      var callback = function () {
        if (typeof(url) !== 'undefined') {
          window.location = url;
        }
      };
      gtag('event', 'conversion', {
        send_to: '${GOOGLE_ADS_ID}/oZpbCJfSzrgbEJXBsPZB',
        value: 1.0,
        currency: 'USD',
        event_callback: callback
      });
      return false;
    }
  `;

  document.head.appendChild(loaderScript);
  document.head.appendChild(initScript);
  document.head.appendChild(conversionScript);
}

function ensureTagManagerLoaded() {
  if (typeof document === 'undefined' || document.getElementById(GTM_LOADER_ID)) {
    return;
  }

  const gtmScript = document.createElement('script');
  gtmScript.id = GTM_LOADER_ID;
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`;

  document.head.appendChild(gtmScript);
}

function trackPageView(path) {
  if (typeof window === 'undefined' || typeof window.gtag === 'undefined') {
    return;
  }

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path
  });
}

export default function GoogleAnalytics() {
  const { accepted, eligible } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef('');
  const scriptsLoadedRef = useRef(false);

  useEffect(() => {
    applyGoogleConsentStatus(accepted ? 'accepted' : 'rejected');

    if (!(accepted && eligible)) {
      scriptsLoadedRef.current = false;
      lastTrackedPathRef.current = '';
      return;
    }

    ensureGoogleScriptsLoaded();
    ensureTagManagerLoaded();
    scriptsLoadedRef.current = true;

    const currentPath = getCurrentPagePath();
    persistSessionAttribution();
    lastTrackedPathRef.current = currentPath;
    trackPageView(currentPath);
    trackUtmArrival();
  }, [accepted, eligible]);

  useEffect(() => {
    if (!(accepted && eligible) || !scriptsLoadedRef.current || typeof window === 'undefined') {
      return;
    }

    persistSessionAttribution();

    const currentPath = `${pathname || window.location.pathname}${
      searchParams?.toString() ? `?${searchParams.toString()}` : ''
    }`;

    if (!currentPath) {
      return;
    }

    if (!lastTrackedPathRef.current) {
      lastTrackedPathRef.current = currentPath;
      return;
    }

    if (lastTrackedPathRef.current === currentPath) {
      return;
    }

    lastTrackedPathRef.current = currentPath;
    trackPageView(currentPath);
    trackUtmArrival();
  }, [accepted, eligible, pathname, searchParams]);

  return null;
}
