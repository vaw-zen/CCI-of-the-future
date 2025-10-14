'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function GoogleAnalytics() {
  useEffect(() => {
    // Initialize dataLayer only on client side
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-0RDH6DH7TS');
      
      // Make gtag available globally
      window.gtag = gtag;
    }
  }, []);

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-0RDH6DH7TS"
        strategy="afterInteractive"
      />
    </>
  );
}