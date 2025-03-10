'use client';

import { useSuppressHydrationWarnings } from './suppressHydrationWarnings';
import { useEffect } from 'react';

/**
 * This component is used to activate the hydration warning suppression
 * across the entire application. Add it to your layout once.
 */
export default function HydrationSuppressor() {
  // Use the hook to suppress hydration warnings
  useSuppressHydrationWarnings();
  
  // Additional suppression for specific React hydration warnings
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Patch React's console error for hydration warnings
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('Warning: Text content did not match') || 
         args[0].includes('Warning: Prop `className` did not match') ||
         args[0].includes('Warning: Expected server HTML to contain') ||
         args[0].includes('A tree hydrated but some attributes') ||
         args[0].includes('Hydration failed because') ||
         args[0].includes('header-module__JXv2oG__'))
      ) {
        // Suppress specific React hydration warnings
        return;
      }
      return originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);
  
  // This component doesn't render anything
  return null;
} 