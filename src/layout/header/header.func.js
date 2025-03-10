import { createRef, useCallback, useState, useEffect } from 'react';
import styles from './header.module.css'
import { throttle } from '@/libs/vz/utils';
import { dimensionsStore } from '@/utils/store/store';
import { lenisRef } from '@/utils/initializer/initializer.func';

// Safe check for window to prevent hydration errors
const isBrowser = typeof window !== 'undefined';

const prevScroll = createRef(0)
const direction = createRef('down')

let closeDropdownGlobal;

export function useHeaderLogic() {
    const [active, setActive] = useState(-1)
    const [menu, setMenu] = useState(false)
    const [isClientSide, setIsClientSide] = useState(false)

    // Use this safe version of isDesktop to prevent hydration issues
    const safeIsDesktop = useCallback(() => {
        if (!isClientSide) return false;
        return dimensionsStore.getState().vw >= 1024;
    }, [isClientSide]);

    // Set client-side flag after first render
    useEffect(() => {
        setIsClientSide(true);
    }, []);

    const toggleDropdown = useCallback((index) => {
        setActive((prev) => (prev === index ? -1 : index));
    }, []);

    const isActive = useCallback((index) => active === index, [active]);

    const closeDropdown = useCallback(() => {
        setActive(-1);
        setMenu(false);
    }, []);

    // Set the global reference for use in scroll handler
    useEffect(() => {
        closeDropdownGlobal = closeDropdown;
        return () => {
            closeDropdownGlobal = null;
        };
    }, [closeDropdown]);

    // Close dropdowns when page URL changes
    useEffect(() => {
        if (!isBrowser) return;
        
        let currentPath = window.location.pathname;
        
        // Function to check for URL changes
        const checkForNavigation = () => {
            if (currentPath !== window.location.pathname) {
                currentPath = window.location.pathname;
                closeDropdown();
            }
        };
        
        // Set up a MutationObserver to detect DOM changes which might indicate navigation
        const observer = new MutationObserver(checkForNavigation);
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also check periodically as a fallback
        const interval = setInterval(checkForNavigation, 300);
        
        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, [closeDropdown]);

    const handleDropdownBlur = useCallback((event) => {
        if (!safeIsDesktop()) return;
        if (event.currentTarget.contains(event.relatedTarget)) {
            return;
        }
        setActive(-1);
    }, [safeIsDesktop]);

    const handleNavBlur = useCallback((event) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
            return;
        }
        if (safeIsDesktop()) return;
        setActive(-1);
        setMenu(false);
    }, [safeIsDesktop]);

    const handleMenuButton = useCallback(() => {
        if (menu) {
            setMenu(false);
            setActive(-1);
        } else {
            setMenu(true);
        }
    }, [menu]);

    const handleMenuStyles = useCallback((normal, active) => {
        if (safeIsDesktop()) return normal;
        return menu ? normal + ' ' + active : normal;
    }, [safeIsDesktop, menu]);

    const desktopMenuStyles = useCallback((normal, active) => {
        if (!safeIsDesktop()) return normal;
        return menu ? normal + ' ' + active : normal;
    }, [safeIsDesktop, menu]);

    const scrollToTop = useCallback(() => {
        if (!isBrowser) return;
        if (window.scrollY === 0) return;
    
        if (lenisRef.current) {
          requestAnimationFrame(() => {
            const currentPosition = window.scrollY || document.documentElement.scrollTop;
            if (currentPosition > 0) {
              lenisRef.current.scrollTo(0, {
                duration: 0.8,
                easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
                force: true,
                lock: false,
                immediate: false
              });
            }
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);
      
    return { 
        handleMenuButton, 
        handleDropdownBlur, 
        toggleDropdown, 
        isActive, 
        handleMenuStyles, 
        handleNavBlur, 
        scrollToTop, 
        desktopMenuStyles 
    };
}

const nav = createRef()
const container = createRef()
const topBTN = createRef()

// Modified headerSI function to safely handle DOM operations
export function headerSI() {
    // Early return if not in browser environment
    if (!isBrowser) return;
    
    // Safely get top button element
    if (!topBTN.current) {
        topBTN.current = document.querySelector('.' + styles.topButton)
    }
    
    // Only manipulate the DOM if we have the element
    if (topBTN.current) {
        if (window.scrollY > window.innerHeight * 0.25) {
            topBTN.current.style.transform = 'scale(1)'
        } else {
            topBTN.current.style.transform = 'scale(0)'
        }
    }

    // Safely get nav elements
    if (!nav.current) {
        nav.current = document.querySelector('.' + styles.nav)
        if (nav.current) {
            container.current = nav.current.children[0]
        }
    }
    
    // Only proceed if we have nav elements
    if (!nav.current || !container.current) return;
    
    if (window.scrollY <= nav.current.clientHeight) {
        nav.current.style.transform = 'translateY(0px)'
        direction.current = 'up'
        container.current.style.background = 'rgba(0, 0, 0, 0)'
        container.current.style.backdropFilter = 'none'
    } else {
        container.current.style.background = 'rgba(0, 0, 0, .5)'
        container.current.style.backdropFilter = 'blur(5px)'

        if (!direction.current) {
            nav.current.style.transform = 'translateY(-100%)'
            if (typeof closeDropdownGlobal === 'function') {
                closeDropdownGlobal();
            }
            direction.current = 'down'
        } else {
            if (prevScroll.current < window.scrollY) {
                if (direction.current === 'up') {
                    nav.current.style.transform = 'translateY(-100%)'
                    if (typeof closeDropdownGlobal === 'function') {
                        closeDropdownGlobal();
                    }
                }
                direction.current = 'down'
            } else if (prevScroll.current > window.scrollY) {
                if (direction.current === 'down') {
                    nav.current.style.transform = 'translateY(0px)'
                }
                direction.current = 'up'
            }
        }
    }
    prevScroll.current = window.scrollY
}



