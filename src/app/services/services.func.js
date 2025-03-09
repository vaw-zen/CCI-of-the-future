import { servicesSI } from "../home/sections/3-services/services.func";

export function servicesScrollTriggers() {
    // Only apply if we're on the services page
    if (typeof window !== 'undefined' && window.location.pathname === '/services') {
        console.log('servicesScrollTriggers initialized');
        servicesSI();
    }
} 