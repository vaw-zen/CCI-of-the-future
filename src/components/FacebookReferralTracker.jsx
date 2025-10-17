'use client';

import { useEffect } from 'react';

export default function FacebookReferralTracker() {
  useEffect(() => {
    // Function to detect and track Facebook referrals
    const trackFacebookReferral = () => {
      const referrer = document.referrer;
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check various Facebook referrer patterns
      const facebookDomains = [
        'facebook.com',
        'm.facebook.com', 
        'l.facebook.com',
        'lm.facebook.com',
        'fb.me'
      ];
      
      const isFacebookReferrer = facebookDomains.some(domain => 
        referrer.includes(domain)
      );
      
      const isUTMFacebook = urlParams.get('utm_source') === 'facebook';
      const hasFbclid = urlParams.has('fbclid'); // Facebook Click Identifier
      
      if (isFacebookReferrer || isUTMFacebook || hasFbclid) {
        const referralData = {
          source: 'facebook',
          referrer: referrer,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          utm_source: urlParams.get('utm_source'),
          utm_medium: urlParams.get('utm_medium'),
          utm_campaign: urlParams.get('utm_campaign'),
          utm_content: urlParams.get('utm_content'),
          fbclid: urlParams.get('fbclid'),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          detection_method: isFacebookReferrer ? 'referrer' : isUTMFacebook ? 'utm' : 'fbclid'
        };
        
        // Log to our API
        fetch('/api/analytics/referral', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(referralData)
        }).catch(error => {
          console.error('Failed to log Facebook referral:', error);
        });
        
        // Store in localStorage for debugging
        try {
          const existingReferrals = JSON.parse(localStorage.getItem('fb_referrals') || '[]');
          existingReferrals.push(referralData);
          localStorage.setItem('fb_referrals', JSON.stringify(existingReferrals.slice(-20)));
        } catch (error) {
          console.error('Failed to store referral in localStorage:', error);
        }
        
        // Track in Google Analytics if available
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'facebook_referral', {
            page_title: document.title,
            page_location: window.location.href,
            referrer: referrer,
            detection_method: referralData.detection_method
          });
        }
        
        console.log('Facebook referral detected:', referralData);
      }
    };
    
    // Track on initial load
    trackFacebookReferral();
    
    // Also track on popstate (back/forward navigation)
    window.addEventListener('popstate', trackFacebookReferral);
    
    return () => {
      window.removeEventListener('popstate', trackFacebookReferral);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

// Hook for manual tracking
export function useFacebookReferralTracking() {
  const trackCustomEvent = (eventName, data = {}) => {
    if (typeof window === 'undefined') return;
    
    const eventData = {
      source: 'facebook',
      event: eventName,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    fetch('/api/analytics/referral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    }).catch(console.error);
  };
  
  return { trackCustomEvent };
}