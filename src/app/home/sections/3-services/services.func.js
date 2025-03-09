import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import styles from './services.module.css'
import scrollTrigger from '@/libs/vz/scrollInteraction/scrollTrigger';
import { dimensionsStore } from '@/utils/store/store';

// Track active animation instances globally to allow for proper cleanup
const activeInstances = {
  instances: new Map(),
  add(id, instance) {
    this.instances.set(id, instance);
    return instance;
  },
  remove(id) {
    if (this.instances.has(id)) {
      this.instances.delete(id);
    }
  },
  getAll() {
    return Array.from(this.instances.values());
  },
  getAllIds() {
    return Array.from(this.instances.keys());
  },
  clear() {
    this.instances.clear();
  }
};

// Flag to track if we're currently trying to initialize
let isInitializing = false;

// Internal custom hook used by client components
export function useServicesSI() {
    const pathname = usePathname();
    const { isMobile, vw } = dimensionsStore();

    useEffect(() => {
        // Clean up existing animations before reinitializing
        cleanupServiceAnimations();
        
        // Initialize animations with current state
        initServiceAnimations(pathname, isMobile());

        // Return cleanup function
        return () => {
            if (typeof window === 'undefined') return;
            cleanupServiceAnimations();
        };
    }, [pathname, vw]);
}

// Exported function that can be called from initializers
export function servicesSI() {
    // Prevent multiple simultaneous initialization attempts
    if (isInitializing) {
        return [];
    }
    
    // Set initializing flag
    isInitializing = true;
    
    // Clean up existing animations first
    cleanupServiceAnimations();
    
    // Get the current pathname from the window location
    if (typeof window === 'undefined') {
        isInitializing = false;
        return [];
    }

    const pathname = window.location.pathname;
    // Use function call for isMobile instead of direct access
    const isMobileView = dimensionsStore.getState().isMobile();

    try {
        // Initialize animations based on current state
        const instances = initServiceAnimations(pathname, isMobileView);
        
        // Return the animation instances for external tracking
        isInitializing = false;
        return instances;
    } catch (error) {
        isInitializing = false;
        return [];
    }
}

// Function to get service card elements
function getServiceCards() {
    if (typeof window === 'undefined') return [];
    
    // Try both by class name and other selectors
    let cards = Array.from(document.getElementsByClassName(styles.serviceCard));
    
    // If cards not found by class, try alternative selectors
    if (cards.length === 0) {
        // Try by data attribute if available
        cards = Array.from(document.querySelectorAll('[data-type="service-card"]'));
        
        // If still not found, try by element structure/pattern
        if (cards.length === 0) {
            // Look for elements that match the expected structure
            cards = Array.from(document.querySelectorAll('.services *'));
            cards = cards.filter(el => {
                // Filter for likely service card elements
                return el.clientWidth > 200 && el.clientHeight > 100;
            });
        }
    }
    
    return cards;
}

// Helper function to initialize animations (used by both methods)
function initServiceAnimations(pathname, isMobileView) {
    // Make sure we're on the client side
    if (typeof window === 'undefined') return [];
    
    const createdInstances = [];

    // Check if we're on home page or services page
    const isHomePage = pathname === '/' || pathname.includes('/home');
    const isServicesPage = pathname.includes('/services');
    
    // Always apply animations on both pages, but with different timings/behaviors if needed
    if (isHomePage || isServicesPage) {
        // Get service cards using the enhanced function
        const cards = getServiceCards();

        if (cards.length === 0) {
            // Return empty for now - retries will be handled by the initializer
            return createdInstances;
        }

        cards.forEach((element, index) => {
            const instanceId = `service-card-${pathname}-${index}-${Date.now()}`; // Unique ID with timestamp
            
            // Reset any existing transform to ensure clean state
            element.style.transform = 'translate3d(100%, 0, 0)';
            
            // Create animation with appropriate settings for viewport size
            const instance = scrollTrigger.createInstance(instanceId, element, {
                values: [[100, 0]],
                startPoint: [0], 
                endPoint: [window.innerWidth <= 480 ? 0.8 : 0.9], // Different timing for mobile
                callback: ({ v }) => {
                    element.style.transform = `translate3d(${v[0]}%, 0, 0)`;
                }
            });
            
            // Store instance for later cleanup and return value
            if (instance) {
                const storedInstance = activeInstances.add(instanceId, instance);
                if (storedInstance) {
                    createdInstances.push(storedInstance);
                }
            }
        });
    }
    
    return createdInstances;
}

// Helper function to clean up animations
function cleanupServiceAnimations() {
    if (typeof window === 'undefined') return;

    try {
        // Get all instance IDs and remove them
        const instances = activeInstances.getAll();
        instances.forEach(instance => {
            if (instance && typeof instance.remove === 'function') {
                instance.remove();
            }
        });
        
        // Get all IDs for manual removal
        const instanceIds = activeInstances.getAllIds();
        instanceIds.forEach(id => {
            if (id && id.startsWith('service-card-')) {
                try {
                    // Remove each instance individually
                    scrollTrigger.removeInstance(id);
                } catch (error) {
                    // Silent fail
                }
            }
        });
        
        // Clear the tracking map
        activeInstances.clear();
        
        // Also manually reset any cards that might still be in the DOM
        const cards = getServiceCards();
        cards.forEach((element) => {
            // Reset the transform to ensure clean state
            element.style.transform = '';
        });
    } catch (error) {
        // Silent fail
    }
}
