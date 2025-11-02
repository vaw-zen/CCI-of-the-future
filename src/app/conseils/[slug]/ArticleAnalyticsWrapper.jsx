'use client';

import { useEffect, useRef } from 'react';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { trackArticleReadProgress, trackArticleComplete } from '@/utils/analytics';

/**
 * Client-side wrapper for article pages to track reading engagement
 */
export default function ArticleAnalyticsWrapper({ children, articleTitle }) {
  const startTime = useRef(Date.now());
  const trackedMilestones = useRef(new Set());
  
  // Track scroll and time
  useScrollTracking(`article_${articleTitle}`);
  useTimeTracking(`article_${articleTitle}`);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Track article read progress at milestones
      const milestones = [25, 50, 75, 90, 100];
      
      milestones.forEach(milestone => {
        if (
          scrollPercentage >= milestone &&
          !trackedMilestones.current.has(milestone)
        ) {
          trackedMilestones.current.add(milestone);
          trackArticleReadProgress(articleTitle, milestone);

          // Track article completion at 90%
          if (milestone === 90) {
            const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
            trackArticleComplete(articleTitle, timeSpent);
          }
        }
      });
    };

    // Throttled scroll listener
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
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  }, [articleTitle]);

  return <>{children}</>;
}
