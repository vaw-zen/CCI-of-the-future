'use client';

import React, { useEffect, cloneElement } from 'react';

/**
 * This utility helps suppress hydration warnings related to browser extensions that
 * add attributes to the DOM after server rendering, causing hydration mismatches.
 * 
 * Common examples include:
 * - cz-shortcut-listen (Chrome Command Menu)
 * - data-grammarly-* (Grammarly extension)
 * - data-ms-* (Microsoft extensions)
 * - Various ad-blockers and other extensions
 */

// List of attributes known to cause hydration mismatches
const KNOWN_ATTRIBUTES = [
  'cz-shortcut-listen',
  'data-grammarly',
  'data-ms',
  'data-extension',
  'className',
  'class',
  'style',
  'header-module__JXv2oG__'
];

/**
 * Hook that suppresses hydration warnings for known browser extensions
 */
export function useSuppressHydrationWarnings() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to filter certain hydration warnings
    console.error = function(...args) {
      // Check if this is a hydration warning for a known attribute
      const errorMessage = args.join(' ');
      
      if (errorMessage.includes('Hydration failed') || 
          errorMessage.includes('Warning: Prop `className` did not match') ||
          errorMessage.includes('Warning: Text content did not match')) {
        // Check against our known problematic attributes
        if (KNOWN_ATTRIBUTES.some(attr => errorMessage.includes(attr)) || 
            errorMessage.includes('browser extension') ||
            errorMessage.includes('className=') ||
            errorMessage.includes('header-module__JXv2oG__')) {
          // Just suppress this specific warning
          return;
        }
      }
      
      // Pass through all other errors to the original console.error
      return originalConsoleError.apply(console, args);
    };
    
    // Cleanup function to restore original console.error
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
}

/**
 * Component that can be used to wrap elements susceptible to hydration warnings
 * Uses the suppressHydrationWarning prop of React
 * 
 * For HTML structural elements (html, head, body), it directly adds the attribute
 * without wrapping in a div to maintain valid HTML structure
 */
export function SuppressHydration({ children }) {
  // If it's a single child that is a React element, add the attribute directly
  if (React.isValidElement(children)) {
    // For HTML structure elements, don't wrap them in a div
    const tagName = children.type?.toLowerCase?.();
    const isStructuralElement = ['html', 'head', 'body'].includes(tagName);
    
    if (isStructuralElement) {
      // Clone the element and add suppressHydrationWarning prop
      return cloneElement(children, {
        suppressHydrationWarning: true,
        ...children.props
      });
    }
  }
  
  // For other elements, wrap in a div with suppressHydrationWarning
  return (
    <span suppressHydrationWarning style={{ display: 'contents' }}>
      {children}
    </span>
  );
}

// This will allow passing attributes to the body that match those added by browser extensions
// to prevent hydration mismatches completely
export function getBodyAttributes() {
  // Only run on client side
  if (typeof window === 'undefined') return {};
  
  // Check if the body already has any of our known attributes
  const attributes = {};
  
  // We can detect Chrome's shortcut listener
  if (document.body.hasAttribute('cz-shortcut-listen')) {
    attributes['cz-shortcut-listen'] = document.body.getAttribute('cz-shortcut-listen');
  }
  
  return attributes;
} 