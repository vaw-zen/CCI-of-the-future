'use client'

import { useEffect, useRef, useCallback } from "react"
import { dimensionsStore } from "../store/store";
import { useInitializerLogic } from "./initializer.func";
import { homeScrollTriggers } from "@/app/home/home.func";
import { servicesScrollTriggers } from "@/app/services/services.func";
import { headerSI } from "@/layout/header/header.func";
import { usePathname } from "next/navigation";
import { storeUTMParameters } from "../utmGenerator";
import { trackContactLinkClick } from "@/utils/analytics";

export default function Initializer() {
    // Get the current path for route change detection
    const pathname = usePathname();
    
    // Always call hooks in the same order - never conditionally
    const { setVw, setVh, isDesktop, isTablet, isMobile } = dimensionsStore();
    const { resizeEvent, initializeLenis, startLenisRaf, lenisRef, rafIdRef } = useInitializerLogic();
    
    // Track previous device type to detect responsive breakpoint changes
    const prevDeviceTypeRef = useRef("");
    
    // Ref to track initialization attempts for current page
    const initAttemptsRef = useRef(0);
    const currentPathRef = useRef(pathname || "");

    const initializePageAnimations = useCallback((isRetry = false) => {
        if (pathname === "/" || pathname.includes("/home")) {
            try {
                homeScrollTriggers();
            } catch (error) {
                // Silent fail
            }
        }
        
        if (pathname.includes("/services")) {
            try {
                servicesScrollTriggers();
            } catch (error) {
                // Silent fail
            }
        }
    }, [pathname])
  
    useEffect(() => {
        storeUTMParameters();
    }, [pathname]);

    useEffect(() => {
        const handleTrackedLinkClick = (event) => {
            const anchor = event.target?.closest?.('a[href]');
            if (!anchor) return;
            if (anchor.dataset.analyticsHandled === 'true') return;

            const href = anchor.getAttribute('href') || '';
            const fallbackText = (anchor.textContent || '').replace(/\s+/g, ' ').trim();
            const eventLabel =
                anchor.dataset.analyticsLabel ||
                anchor.getAttribute('aria-label') ||
                anchor.getAttribute('title') ||
                fallbackText ||
                'contact_link';

            trackContactLinkClick(href, eventLabel, {
                tracking_source: 'global_link_listener',
                page_path: window.location.pathname
            });
        };

        document.addEventListener('click', handleTrackedLinkClick, true);

        return () => {
            document.removeEventListener('click', handleTrackedLinkClick, true);
        };
    }, [pathname]);
    
    // Effect for handling route changes 
    useEffect(() => {
        if (!pathname) return;
        
        // If the path changed, update and re-initialize animations
        if (currentPathRef.current !== pathname) {
            currentPathRef.current = pathname;
            initAttemptsRef.current = 0; // Reset attempts counter
            
            // Short delay to let the new page start rendering
            setTimeout(() => {
                // Try to initialize immediately after navigation
                initializePageAnimations();
                
                // Set up progressive retry mechanism
                const retryTimes = [300, 500, 1000]; // Try again after these delays
                retryTimes.forEach((delay) => {
                    setTimeout(() => {
                        initAttemptsRef.current++;
                        initializePageAnimations(true); // Pass true to indicate this is a retry
                    }, delay);
                });
            }, 100);
        }
    }, [pathname, initializePageAnimations]);
    
    // Monitor viewport size changes
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Update viewport measurements in the store
            setVw(width);
            setVh(height);

            // Determine current device type
            let currentDeviceType = "";
            if (isDesktop()) currentDeviceType = "desktop";
            else if (isTablet()) currentDeviceType = "tablet";
            else if (isMobile()) currentDeviceType = "mobile";
            
            // Check if device type changed (crossed a breakpoint)
            if (prevDeviceTypeRef.current && prevDeviceTypeRef.current !== currentDeviceType) {
                // Reinitialize animations after a brief delay
                setTimeout(() => {
                    // Re-initialize Lenis for the new viewport
                    if (lenisRef.current) {
                        lenisRef.current.destroy();
                    }
                    
                    const isDesktopView = isDesktop();
                    lenisRef.current = initializeLenis(isDesktopView);

                    if (lenisRef.current) {
                        rafIdRef.current = startLenisRaf(lenisRef.current);
                    }
                    
                    // Initialize animations with progressive retries
                    initializePageAnimations();
                    
                    // Retry a few times to ensure DOM is ready
                    [300, 600].forEach((delay, index) => {
                        setTimeout(() => {
                            initAttemptsRef.current++;
                            initializePageAnimations(true);
                        }, delay);
                    });
                }, 200);
            }
            
            // Update the previous device type
            prevDeviceTypeRef.current = currentDeviceType;
        };
        
        // Initial resize event
        handleResize();
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', headerSI);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', headerSI);
        };
    }, [setVw, setVh, isDesktop, isTablet, isMobile, initializePageAnimations, initializeLenis, lenisRef, rafIdRef, startLenisRaf]);

    // Initialize Lenis and other effects on initial load
    useEffect(() => {
        try {
            // Initialize Lenis only on client-side
            const isDesktopView = isDesktop();
            lenisRef.current = initializeLenis(isDesktopView);

            // Start RAF if Lenis is initialized
            if (lenisRef.current) {
                rafIdRef.current = startLenisRaf(lenisRef.current);
            }
            
            // Initialize animations for the initial page load with progressive retries
            initializePageAnimations();
            
            // Retry with increasing delays to ensure DOM is ready
            [300, 600, 1000].forEach((delay, index) => {
                setTimeout(() => {
                    initAttemptsRef.current++;
                    initializePageAnimations(true);
                }, delay);
            });
        } catch (error) {
            // Silent fail
        }
        
        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
        };
    }, [isDesktop, initializeLenis, initializePageAnimations, lenisRef, rafIdRef, startLenisRaf]);

    return null;
}
