import { createRef, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import styles from './header.module.css'
import { dimensionsStore } from '@/utils/store/store';
import { lenisRef } from '@/utils/initializer/initializer.func';
import content from './header.json'
import { usePathname } from 'next/navigation';

// Safe check for window to prevent hydration errors
const isBrowser = typeof window !== 'undefined';

const prevScroll = createRef(0)
const direction = createRef('down')

let closeDropdownGlobal;

// Memoize the content data structure to avoid recreating it on each render
const memoizedContent = content;

export function useHeaderLogic() {
    const [active, setActive] = useState(-1)
    const [menu, setMenu] = useState(false)
    const [isClientSide, setIsClientSide] = useState(false)
    const [showTopButton, setShowTopButton] = useState(false)
    
    // Use Next.js pathname hook instead of manually tracking
    const currentPath = usePathname();
    const prevPathRef = useRef(currentPath);

    // Use this safe version of isDesktop to prevent hydration issues
    const safeIsDesktop = useCallback(() => {
        if (!isClientSide) return false;
        return dimensionsStore.getState().vw >= 1024;
    }, [isClientSide]);

    // Set client-side flag after first render
    useEffect(() => {
        setIsClientSide(true);
    }, []);

    // Handle scroll for top button visibility
    useEffect(() => {
        if (!isClientSide) return;

        const handleScroll = () => {
            const shouldShow = window.scrollY > window.innerHeight * 0.25;
            setShowTopButton(shouldShow);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isClientSide]);

    // Close menu when navigating to a different page
    useEffect(() => {
        if (isClientSide && menu && prevPathRef.current !== currentPath) {
            setMenu(false);
            setActive(-1);
        }
        prevPathRef.current = currentPath;
    }, [currentPath, isClientSide, menu]);

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

    // Memoize the active link calculations to avoid recalculating on every render
    const activeLinks = useMemo(() => {
        if (!currentPath) return { mainLink: null, parentIndex: null, subLinkIndex: null };
        
        let mainLink = null;
        let parentIndex = null;
        let subLinkIndex = null;
        
        for (let i = 0; i < memoizedContent.length; i++) {
            const element = memoizedContent[i];
            const { subLinks, link } = element;
            
            if (link && link === currentPath) {
                mainLink = i;
                break;
            } else if (subLinks) {
                const subIndex = subLinks.findIndex(subLink => subLink.link === currentPath);
                if (subIndex !== -1) {
                    parentIndex = i;
                    subLinkIndex = subIndex;
                    break;
                }
            }
        }
        
        return { mainLink, parentIndex, subLinkIndex };
    }, [currentPath]);

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
        setMenu(prevMenu => {
            if (prevMenu) {
                setActive(-1);
            }
            return !prevMenu;
        });
    }, []);

    // Modified to ensure consistent string format between server and client
    const handleMenuStyles = useCallback((normal, active) => {
        if (!isClientSide) return normal;
        if (safeIsDesktop()) return normal;
        return menu ? `${normal} ${active}` : normal;
    }, [safeIsDesktop, menu, isClientSide]);

    // Modified to ensure consistent string format between server and client
    const desktopMenuStyles = useCallback((normal, active) => {
        if (!isClientSide) return normal;
        if (!safeIsDesktop()) return normal;
        return menu ? `${normal} ${active}` : normal;
    }, [safeIsDesktop, menu, isClientSide]);

    const scrollToTop = useCallback(() => {
        if (!isBrowser || !isClientSide || window.scrollY === 0) return;
    
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
    }, [isClientSide]);

    // Memoized helper functions that depend on currentPath
    // Modified to ensure consistent behavior between server and client
    const isLinkActive = useCallback((link) => {
        if (!isClientSide) return false;
        return currentPath === link;
    }, [currentPath, isClientSide]);
    
    // Modified to ensure consistent behavior between server and client
    const hasActiveSublink = useCallback((subLinks) => {
        if (!isClientSide) return false;
        if (!subLinks) return false;
        return subLinks.some(subLink => currentPath === subLink.link);
    }, [currentPath, isClientSide]);

    const findActiveSublink = useCallback((subLinks) => {
        if (!subLinks) return null;
        return subLinks.find(subLink => currentPath === subLink.link);
    }, [currentPath]);

    return {
        handleMenuButton,
        handleDropdownBlur,
        toggleDropdown,
        isActive,
        handleMenuStyles,
        handleNavBlur,
        scrollToTop,
        desktopMenuStyles,
        isLinkActive,
        hasActiveSublink,
        findActiveSublink,
        activeLinks,
        currentPath,
        menu,
        showTopButton
    };
}

const nav = createRef()
const container = createRef()

// Modified headerSI function to safely handle DOM operations
export function headerSI() {
    // Early return if not in browser environment
    if (typeof window === 'undefined') return;

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



