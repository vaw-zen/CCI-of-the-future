'use client';
import { useRef, useEffect } from 'react';

/**
 * Animate an element's height between 0 and its "auto" height.
 * @param {boolean} isOpen – when true, expand; when false, collapse.
 * @param {Object} options
 * @param {number} options.duration – ms to animate (default 200)
 * @param {string} options.easing – CSS easing (default 'ease')
 * @returns {React.MutableRefObject} ref – attach to the container you want to animate.
 */
export default function useAutoHeightTransition(isOpen, { duration = 200, easing = 'ease' } = {}) {
    const ref = useRef(null);
    const firstRender = useRef(true);
    const animating = useRef(false);
    const timeoutRef = useRef(null);
    const lastState = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || !document.contains(el)) return;
        
        // Set base styles
        el.style.overflow = 'hidden';

        // Handle first render differently - just set the height without animation
        if (firstRender.current) {
            el.style.height = isOpen ? 'auto' : '0';
            firstRender.current = false;
            lastState.current = isOpen;
            return;
        }

        // Prevent multiple animations from running simultaneously
        if (animating.current) {
            return;
        }

        // Skip if state hasn't actually changed
        if (lastState.current === isOpen) {
            return;
        }
        
        lastState.current = isOpen;
        
        animating.current = true;
        
        // For animation we need explicit pixel heights
        const computeHeight = () => {
            // Save current styles
            const originalHeight = el.style.height;
            const originalTransition = el.style.transition;
            
            // Temporarily set to auto to measure
            el.style.transition = 'none';
            el.style.height = 'auto';
            
            // Force layout and measure
            const height = el.offsetHeight;
            
            // Restore original styles
            el.style.height = originalHeight;
            el.style.transition = originalTransition;
            
            return height;
        };

        if (isOpen) {
            // EXPANDING: Start from 0, animate to content height, then set to auto
            el.style.transition = '';
            el.style.height = '0';
            
            // Force a browser reflow (repaint) to make sure height: 0 is applied
            void el.offsetHeight;
            
            // Compute target height when fully expanded
            const contentHeight = computeHeight();
            
            // If content height is 0, just set to auto immediately
            if (contentHeight === 0) {
                el.style.height = 'auto';
                animating.current = false;
                return;
            }
            
            // Set back to 0 height and add transition
            el.style.height = '0';
            el.style.transition = `height ${duration}ms ${easing}`;
            
            // Trigger animation by setting target height in pixels
            requestAnimationFrame(() => {
                if (el && document.contains(el)) {
                    el.style.height = `${contentHeight}px`;
                }
            });

            // Once expanded, switch to auto height to handle content changes
            const onExpandEnd = (event) => {
                // Only handle events from the target element
                if (event.target === el && ref.current && isOpen && document.contains(ref.current)) {
                    ref.current.style.height = 'auto';
                }
                animating.current = false;
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            };
            el.addEventListener('transitionend', onExpandEnd, { once: true });

            // Fallback timeout in case transitionend doesn't fire
            timeoutRef.current = setTimeout(() => {
                if (ref.current && isOpen && document.contains(ref.current)) {
                    ref.current.style.height = 'auto';
                }
                animating.current = false;
                timeoutRef.current = null;
            }, duration + 50);
        } else {
            // COLLAPSING: Start at current height, animate to 0
            
            // Capture current height in pixels
            const startHeight = el.offsetHeight;
            el.style.height = `${startHeight}px`;
            
            // Force a browser reflow (repaint)
            void el.offsetHeight;
            
            // Apply transition and animate to 0
            el.style.transition = `height ${duration}ms ${easing}`;
            requestAnimationFrame(() => {
                if (el && document.contains(el)) {
                    el.style.height = '0';
                }
            });

            // Reset when collapse is complete
            const onCollapseEnd = (event) => {
                // Only handle events from the target element
                if (event.target === el) {
                    animating.current = false;
                }
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            };
            el.addEventListener('transitionend', onCollapseEnd, { once: true });

            // Fallback timeout in case transitionend doesn't fire
            timeoutRef.current = setTimeout(() => {
                animating.current = false;
                timeoutRef.current = null;
            }, duration + 50);
        }

        // Cleanup function
        return () => {
            // Clear any pending timeouts
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            
            // Reset state
            animating.current = false;
            lastState.current = null;
            
            // Clear any pending transitions if the element still exists
            if (el && document.contains(el)) {
                try {
                    el.style.transition = '';
                } catch (error) {
                    console.warn('Error during cleanup in useAutoHeightTransition:', error);
                }
            }
        };
    }, [isOpen, duration, easing]);

    return ref;
}