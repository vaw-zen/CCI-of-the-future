'use client';

import { useEffect } from 'react';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { trackReelView } from '@/utils/analytics';

/**
 * Client wrapper for reel page analytics tracking
 * Tracks scroll depth, time on page, and video views
 */
export default function ReelAnalyticsWrapper({ children, reelId, reelTitle }) {
  // Track page engagement
  useScrollTracking('reel_page');
  useTimeTracking('reel_page');

  useEffect(() => {
    trackReelView(reelId, reelTitle || 'Untitled reel');
  }, [reelId, reelTitle]);

  return <>{children}</>;
}
