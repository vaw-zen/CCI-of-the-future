import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import styles from './services.module.css'
import scrollTrigger from '@/libs/vz/scrollInteraction/scrollTrigger';
import { dimensionsStore } from '@/utils/store/store';

// Internal custom hook used by client components
export function useServicesSI() {
    const pathname = usePathname();
    const { isMobile } = dimensionsStore();
    
    useEffect(() => {
        initServiceAnimations(pathname, isMobile())
        
        // Return cleanup function
        return () => {
            if (typeof window === 'undefined') return;
            cleanupServiceAnimations(pathname);
        };
    }, [pathname, isMobile]);
}

// Exported function that can be called from initializers
export function servicesSI() {
    // Get the current pathname from the window location
    // This is safe to call directly from non-component code
    if (typeof window === 'undefined') return;
    
    const pathname = window.location.pathname;
    const { isMobile } = dimensionsStore.getState();
    
    // Log for debugging
    console.log('servicesSI called');
    console.log('Current path:', pathname);
    console.log('Is mobile:', isMobile);
    console.log('Should apply effect:', pathname === '/' || (pathname === '/services' && isMobile));
    
    // Initialize animations based on current state
    initServiceAnimations(pathname, isMobile);
}

// Helper function to initialize animations (used by both methods)
function initServiceAnimations(pathname, isMobile) {
    // Make sure we're on the client side
    if (typeof window === 'undefined') return;
    
    // Apply effect when on home page OR on services page when in mobile view
    if (pathname === '/' || (pathname === '/services' && isMobile)) {
        const cards = Array.from(document.getElementsByClassName(styles.serviceCard));
        
        // Log for debugging
        console.log('Found service cards:', cards.length);
        
        if (cards.length === 0) {
            console.log('No service cards found, might be too early in render cycle');
            // Wait a bit to ensure DOM is ready
            setTimeout(() => {
                const retryCards = Array.from(document.getElementsByClassName(styles.serviceCard));
                console.log('Retry found cards:', retryCards.length);
                
                retryCards.forEach((element, index) => {
                    scrollTrigger.createInstance('service-card-' + pathname + '-' + index, element, {
                        values: [[100, 0]],
                        startPoint: [0],
                        endPoint: [0.9],
                        callback: ({ v }) => {
                            element.style.transform = `translate3d(${v[0]}%, 0, 0)`;
                        }
                    });
                });
            }, 500);
            return;
        }
        
        cards.forEach((element, index) => {
            // Use unique IDs that include the pathname to avoid conflicts
            scrollTrigger.createInstance('service-card-' + pathname + '-' + index, element, {
                values: [[100, 0]],
                startPoint: [0],
                endPoint: [0.9],
                callback: ({ v }) => {
                    element.style.transform = `translate3d(${v[0]}%, 0, 0)`;
                }
            });
        });
    }
}

// Helper function to clean up animations
function cleanupServiceAnimations(pathname) {
    if (typeof window === 'undefined') return;
    
    const cards = Array.from(document.getElementsByClassName(styles.serviceCard));
    
    cards.forEach((_, index) => {
        scrollTrigger.removeInstance('service-card-' + pathname + '-' + index);
    });
}
