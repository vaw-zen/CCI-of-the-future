import { create } from '../../libs/vz/store/provider';

// Default values that match both server and client initial render
// Using specific values rather than 0s to prevent hydration mismatches
const DEFAULT_WIDTH = 1920;  // Desktop default for consistent initial render
const DEFAULT_HEIGHT = 1080;

// Safe check for browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize with these defaults to ensure consistent server/client initial render
export const dimensionsStore = create((set, get) => ({
    // Initialize with consistent defaults
    vw: DEFAULT_WIDTH,
    vh: DEFAULT_HEIGHT,
    
    // Update methods
    setVw: (width) => set({ vw: width }),
    setVh: (height) => set({ vh: height }),
    
    // Safe getters that work in both client and server
    isMobile: () => {
        // If not in browser, assume desktop for consistent server render
        if (!isBrowser) return false;
        return get().vw <= 480;
    },
    
    isTablet: () => {
        // If not in browser, assume desktop for consistent server render
        if (!isBrowser) return false;
        return get().vw > 480 && get().vw <= 1024;
    },
    
    isDesktop: () => {
        // If not in browser, assume desktop for consistent server render
        if (!isBrowser) return true;
        return get().vw >= 1024;
    }
}));
