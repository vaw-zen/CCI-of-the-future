'use client'

import { useEffect, useState, useRef } from "react"
import { dimensionsStore } from "../store/store";
import { useInitializerLogic } from "./initializer.func";
import { homeScrollTriggers } from "@/app/home/home.func";
import { servicesScrollTriggers } from "@/app/services/services.func";
import { headerSI } from "@/layout/header/header.func";
import { usePathname } from "next/navigation";

export default function Initializer() {
    // Add state to track if we're in client-side rendering
    const [isClient, setIsClient] = useState(false);
    const [currentPath, setCurrentPath] = useState("");
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const [navigationOccurred, setNavigationOccurred] = useState(false);
    
    // Get the current path for route change detection
    const pathname = usePathname();
    
    // Always call hooks in the same order - never conditionally
    const { setVw, setVh, isDesktop, isTablet, isMobile } = dimensionsStore();
    const { resizeEvent, initializeLenis, startLenisRaf, lenisRef, rafIdRef } = useInitializerLogic();
    
    // Track previous device type to detect responsive breakpoint changes
    const prevDeviceTypeRef = useRef("");
    
    // Ref to track initialization attempts for current page
    const initAttemptsRef = useRef(0);
  
    useEffect(() => {
        // Mark that we're now on the client
        setIsClient(true);
    }, []);
    
    // Effect for handling route changes 
    useEffect(() => {
        if (!isClient || !pathname) return;
        
        // If the path changed, update and re-initialize animations
        if (currentPath !== pathname) {
            setCurrentPath(pathname);
            setNavigationOccurred(true);
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
    }, [pathname, isClient]);
    
    // Reset navigation flag when it's processed
    useEffect(() => {
        if (navigationOccurred) {
            const timer = setTimeout(() => {
                setNavigationOccurred(false);
            }, 1500); // Reset flag after all retries are done
            
            return () => clearTimeout(timer);
        }
    }, [navigationOccurred]);
    
    // Function to initialize page-specific animations
    const initializePageAnimations = (isRetry = false) => {
        // Check if we're on the home page
        if (pathname === "/" || pathname.includes("/home")) {
            try {
                homeScrollTriggers();
            } catch (error) {
                // Silent fail
            }
        }
        
        // Check if we're on the services page
        if (pathname.includes("/services")) {
            try {
                servicesScrollTriggers();
            } catch (error) {
                // Silent fail
            }
        }
    };
    
    // Monitor viewport size changes
    useEffect(() => {
        if (!isClient) return;

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Update viewport measurements in the store
            setVw(width);
            setVh(height);
            
            // Track viewport size changes
            setViewportSize({ width, height });
            
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
    }, [isClient, setVw, setVh, isDesktop, isTablet, isMobile]);

    // Initialize Lenis and other effects on initial load
    useEffect(() => {
        if (!isClient) return;
        
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
    }, [isClient, isDesktop]);

    return null;
}