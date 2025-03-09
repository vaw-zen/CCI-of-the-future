'use client';

import { useSuppressHydrationWarnings } from './suppressHydrationWarnings';

/**
 * This component is used to activate the hydration warning suppression
 * across the entire application. Add it to your layout once.
 */
export default function HydrationSuppressor() {
  // Use the hook to suppress hydration warnings
  useSuppressHydrationWarnings();
  
  // This component doesn't render anything
  return null;
} 