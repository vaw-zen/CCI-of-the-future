import Lenis from '@studio-freight/lenis'
import { createRef, useCallback } from 'react'


export const lenisRef = createRef(null)
export const rafIdRef = createRef(null)

const easings = {
    parallaxEase: (t) => {
        const c4 = (2 * Math.PI) / 3
        return t === 0
            ? 0
            : t === 1
                ? 1
                : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }
}

// Safe check for window to prevent hydration errors
const isBrowser = typeof window !== 'undefined';

// Safe resize function that checks browser context
const createResizeEvent = (setVw, setVh) => {
    return () => {
        if (!isBrowser) return;
        setVw(window.innerWidth);
        setVh(window.innerHeight);
    };
};

export const useInitializerLogic = () => {
    // Wrap functions in useCallback to maintain reference stability
    const initializeLenis = useCallback((isDesktop) => {
        // Additional check to ensure we're in the browser
        if (!isBrowser) return null;
        
        // If not desktop, we might want different settings or no Lenis at all
        // In this implementation, we'll still initialize Lenis but with different settings
        const options = {
            duration: isDesktop ? 1.2 : 1.0,  // Shorter duration on mobile
            easing: easings.parallaxEase,
            lerp: isDesktop ? 0.1 : 0.15,     // Different lerp value for mobile
            smoothWheel: true,
            wheelMultiplier: isDesktop ? 1.2 : 1.0,  // Different multiplier for mobile
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: isDesktop ? false : true,   // Enable smooth touch on mobile
            touchMultiplier: isDesktop ? 2 : 1.5,    // Different touch multiplier for mobile
        };
        
        try {
            return new Lenis(options);
        } catch (error) {
            return null;
        }
    }, []);

    const startLenisRaf = useCallback((lenis) => {
        if (!isBrowser || !lenis) return null;

        try {
            const rafCallback = (time) => {
                lenis.raf(time);
                return requestAnimationFrame(rafCallback);
            };

            const rafId = requestAnimationFrame(rafCallback);
            return rafId;
        } catch (error) {
            return null;
        }
    }, []);
    
    const resizeEvent = useCallback((setVw, setVh) => {
        return createResizeEvent(setVw, setVh);
    }, []);

    return {
        resizeEvent,
        initializeLenis,
        startLenisRaf,
        lenisRef,
        rafIdRef
    };
};