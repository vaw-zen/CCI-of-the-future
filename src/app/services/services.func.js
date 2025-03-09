import { servicesSI } from "../home/sections/3-services/services.func";

// Keep track of initialized state
let isInitialized = false;
const instances = [];

export function servicesScrollTriggers() {
    // Clean up any existing animations first
    cleanupAnimations();
    
    // Only apply if we're on the services page
    if (typeof window !== 'undefined' && (
        window.location.pathname === '/services' || 
        window.location.pathname.includes('/services')
    )) {
        
        try {
            const animationInstances = servicesSI();
            
            // Store the animation instances for later cleanup
            if (Array.isArray(animationInstances)) {
                instances.push(...animationInstances);
            } else if (animationInstances) {
                instances.push(animationInstances);
            }
            
            isInitialized = true;
        } catch (error) {
            console.error('Error initializing services animations:', error);
        }
    } 
    
    return instances;
}

// Function to clean up animations when page changes or on responsive breakpoint changes
function cleanupAnimations() {
    if (isInitialized && instances.length > 0) {
        
        // Properly clean up each animation instance
        instances.forEach(instance => {
            try {
                if (instance && typeof instance.kill === 'function') {
                    instance.kill();
                } else if (instance && typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            } catch (err) {
                console.error('Error cleaning up animation instance:', err);
            }
        });
        
        // Clear the instances array
        instances.length = 0;
        isInitialized = false;
    }
} 