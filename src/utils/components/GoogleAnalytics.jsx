'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { applyGoogleConsentStatus } from '@/utils/consent/consent';
import { GTM_CONTAINER_ID, GTM_LOADER_ID } from '@/utils/consent/consent.constants';
import { persistSessionAttribution, pushAnalyticsEvent } from '@/utils/analyticsGateway';

function getCurrentPagePath() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.pathname}${window.location.search}`;
}

function ensureTagManagerLoaded() {
  if (typeof document === 'undefined' || document.getElementById(GTM_LOADER_ID) || !GTM_CONTAINER_ID) {
    return;
  }

  const gtmScript = document.createElement('script');
  gtmScript.id = GTM_LOADER_ID;
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`;

  document.head.appendChild(gtmScript);
}

function trackPageView(path) {
  if (typeof window === 'undefined') {
    return;
  }

  pushAnalyticsEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path
  });
}

function trackUtmArrival() {
  if (typeof window === 'undefined') {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');

  if (!utmSource) {
    return;
  }

  pushAnalyticsEvent('utm_arrival', {
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
