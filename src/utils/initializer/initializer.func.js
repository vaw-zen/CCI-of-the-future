import Lenis from '@studio-freight/lenis'
import { createRef } from 'react'


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

const resizeEvent = (setVw, setVh) => () => {
    setVw(window.innerWidth);
    setVh(window.innerHeight);
};

export const useInitializerLogic = () => {
    const initializeLenis = (isDesktop) => {
        if (typeof window === 'undefined' || !isDesktop) return null;

        return new Lenis({
            duration: 1.2,
            easing: easings.parallaxEase,
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 1.2,
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });
    };

    const startLenisRaf = (lenis) => {
        if (!lenis) return null;

        const rafCallback = (time) => {
            lenis.raf(time);
            return requestAnimationFrame(rafCallback);
        };

        const rafId = requestAnimationFrame(rafCallback);
        return rafId;
    };

    return {
        resizeEvent,
        initializeLenis,
        startLenisRaf,
        lenisRef,
        rafIdRef
    };
};