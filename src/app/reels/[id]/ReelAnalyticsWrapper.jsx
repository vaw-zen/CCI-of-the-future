'use client';

import { useEffect } from 'react';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';

/**
 * Client wrapper for reel page analytics tracking
 * Tracks scroll depth, time on page, and video views
 */
export default function ReelAnalyticsWrapper({ children, reelId, reelTitle }) {
  // Track page engagement
  useScrollTracking('reel_page');
  useTimeTracking('reel_page');

  useEffect(() => {
    // Track reel page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_reel', {
        event_category: 'content_engagement',
        reel_id: reelId,
        reel_title: reelTitle || 'Untitled reel',
        page_location: window.location.href
      });
    }
  }, [reelId, reelTitle]);

  return <>{children}</>;
}
