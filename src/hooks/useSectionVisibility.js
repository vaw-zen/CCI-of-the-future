'use client';

import { useEffect, useRef } from 'react';
import { trackSectionView } from '@/utils/analytics';

/**
 * Hook to track when a section becomes visible in the viewport
 * Uses Intersection Observer API for efficient visibility detection
 */
export function useSectionVisibility(sectionName, sectionType = 'content', options = {}) {
  const sectionRef = useRef(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || hasTracked.current) return;

    const observerOptions = {
      threshold: options.threshold || 0.5, // 50% visible by default
      rootMargin: options.rootMargin || '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTracked.current) {
          hasTracked.current = true;
          trackSectionView(
            sectionName,
            sectionType,
            options.pageContext || window.location.pathname
          );
        }
      });
    }, observerOptions);

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [sectionName, sectionType, options]);

  return sectionRef;
}
