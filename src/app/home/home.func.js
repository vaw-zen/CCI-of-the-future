import { servicesSI } from "./sections/3-services/services.func";

// Keep track of initialized state
let isInitialized = false;
let isInitializing = false;
const instances = [];

export function homeScrollTriggers() {
    // Prevent multiple simultaneous initialization attempts
    if (isInitializing) {
        return instances;
    }
    
    // Set initializing flag
    isInitializing = true;
    
    // Clean up any existing animations first
    cleanupAnimations();
    
    // Only apply if we're on the home page
    if (typeof window !== 'undefined' && (
        window.location.pathname === '/' || 
        window.location.pathname === '/home' ||
        window.location.pathname.includes('/home')
    )) {
        try {
            // Call servicesSI for home page animations
            const animationInstances = servicesSI();
            
            // Store the animation instances for later cleanup
            if (Array.isArray(animationInstances) && animationInstances.length > 0) {
                instances.push(...animationInstances);
                isInitialized = true;
            }
        } catch (error) {
            // Silent fail
        } finally {
            // Clear initializing flag even if there was an error
            isInitializing = false;
        }
    } else {
        isInitializing = false;
    }
    
    return instances;
}

// Function to clean up animations when page changes or on responsive breakpoint changes
function cleanupAnimations() {
    if (typeof window === 'undefined') return;
    
    try {
        if (isInitialized && instances.length > 0) {
            // Properly clean up each animation instance
            instances.forEach(instance => {
                try {
                    if (instance && typeof instance.kill === 'function') {
                        instance.kill();
                    } else if (instance && typeof instance.destroy === 'function') {
                        instance.destroy();
                    } else if (instance && typeof instance.remove === 'function') {
                        instance.remove();
                    }
                } catch (err) {
                    // Silent fail
                }
            });
            
            // Clear the instances array
            instances.length = 0;
        }
        
        // Always reset the initialization state
        isInitialized = false;
    } catch (error) {
        // Reset state even in case of error
        instances.length = 0;
        isInitialized = false;
    }
}
