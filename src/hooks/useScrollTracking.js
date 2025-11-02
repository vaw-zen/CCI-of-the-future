'use client';

import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '@/utils/analytics';

/**
 * Hook to track scroll depth milestones
 * Tracks 25%, 50%, 75%, 90%, and 100% scroll depths
 */
export function useScrollTracking(pageName = '') {
  const trackedMilestones = useRef(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Define milestones to track
      const milestones = [25, 50, 75, 90, 100];

      milestones.forEach(milestone => {
        if (
          scrollPercentage >= milestone &&
          !trackedMilestones.current.has(milestone)
        ) {
          trackedMilestones.current.add(milestone);
          trackScrollDepth(milestone, pageName || window.location.pathname);
        }
      });
    };

    // Add scroll listener with throttling
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  }, [pageName]);
}
