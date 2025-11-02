'use client';

import { useEffect, useRef } from 'react';
import { trackTimeOnPage } from '@/utils/analytics';

/**
 * Hook to track time spent on page
 * Tracks at 30s, 60s, 120s, and 300s milestones
 */
export function useTimeTracking(pageName = '') {
  const startTime = useRef(Date.now());
  const trackedMilestones = useRef(new Set());
  const intervalRef = useRef(null);

  useEffect(() => {
    const milestones = [30, 60, 120, 300]; // seconds

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);

      milestones.forEach(milestone => {
        if (elapsed >= milestone && !trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone);
          trackTimeOnPage(
            milestone,
            pageName || window.location.pathname
          );
        }
      });
    }, 10000); // Check every 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pageName]);
}
