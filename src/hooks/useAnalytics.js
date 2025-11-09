'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Custom hook for enhanced Google Analytics tracking
 * Provides manual event tracking and ensures SPA navigation is captured
 */
export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      window.gtag('config', 'G-0RDH6DH7TS', {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [pathname, searchParams]);

  // Return tracking functions for manual events
  return {
    // Track custom events
    trackEvent: (eventName, parameters = {}) => {
      console.log('🔍 useAnalytics.trackEvent called:', {
        eventName,
        parameters,
        gtagExists: typeof window !== 'undefined' && typeof window.gtag !== 'undefined'
      });

      if (typeof window !== 'undefined' && window.gtag) {
        console.log('✅ Calling window.gtag with:', eventName, parameters);
        window.gtag('event', eventName, parameters);
        console.log('📈 Event sent to Google Analytics');
      } else {
        console.log('❌ window.gtag not available:', {
          windowExists: typeof window !== 'undefined',
          gtagExists: typeof window !== 'undefined' ? typeof window.gtag : 'N/A'
        });
      }
        
        // Also forward important events to Facebook Pixel if available
        try {
          if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
            const mapToFb = (name) => {
              const n = name.toLowerCase();
              if (n.includes('lead') || n === 'generate_lead' || n === 'quote_request' || n === 'form_submit') return { standard: true, name: 'Lead' };
              if (n.includes('view') || n === 'view_item' || n === 'view_item_list' || n === 'page_view') return { standard: true, name: 'ViewContent' };
              if (n.includes('purchase') || n.includes('order') || n === 'purchase') return { standard: true, name: 'Purchase' };
              if (n.includes('search')) return { standard: true, name: 'Search' };
              // fallback to custom event
              return { standard: false, name };
            };

            const fbMap = mapToFb(eventName);
            const fbPayload = Object.assign({}, parameters, {
              page_location: typeof window !== 'undefined' ? window.location.href : undefined
            });

            if (fbMap.standard) {
              window.fbq('track', fbMap.name, fbPayload);
              console.log('📘 FB Pixel tracked', fbMap.name, fbPayload);
            } else {
              // use trackCustom for arbitrary events
              window.fbq('trackCustom', fbMap.name, fbPayload);
              console.log('📘 FB Pixel tracked custom', fbMap.name, fbPayload);
            }
          }
        } catch (e) {
          // don't block analytics on fbq errors
          console.warn('FB tracking error', e);
        }
        },

    // Track form submissions
    trackFormSubmission: (formName, formData = {}) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'form_submit', {
          event_category: 'engagement',
          event_label: formName,
          custom_parameters: formData
        });
      }
    },

    // Track button clicks
    trackButtonClick: (buttonName, buttonLocation = '') => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'click', {
          event_category: 'ui_interaction',
          event_label: buttonName,
          button_location: buttonLocation
        });
      }
    },

    // Track service page visits (for your cleaning services)
    trackServiceView: (serviceName, serviceCategory = '') => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'view_item', {
          event_category: 'service',
          event_label: serviceName,
          item_category: serviceCategory,
          page_location: window.location.href
        });
      }
    },

    // Track quote requests
    trackQuoteRequest: (serviceType, contactMethod = '') => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          event_category: 'conversion',
          event_label: 'quote_request',
          service_type: serviceType,
          contact_method: contactMethod,
          value: 1
        });
      }
    },

    // Track phone calls
    trackPhoneClick: () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'click', {
          event_category: 'conversion',
          event_label: 'phone_call',
          transport_type: 'beacon'
        });
      }
    },

    // Track email clicks
    trackEmailClick: () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'click', {
          event_category: 'conversion',
          event_label: 'email_click',
          transport_type: 'beacon'
        });
      }
    },

    // Track blog article engagement
    trackArticleEngagement: (articleTitle, engagementType = 'read') => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', engagementType, {
          event_category: 'content',
          event_label: articleTitle,
          content_type: 'blog_article'
        });
      }
    },

    // Track search queries (if you have search functionality)
    trackSearch: (searchTerm, resultsCount = 0) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'search', {
          search_term: searchTerm,
          results_count: resultsCount
        });
      }
    }
  };
}

/**
 * Higher-order component to automatically track page views
 * Wrap your page components with this for automatic tracking
 */
export function withAnalytics(WrappedComponent, pageType = 'page') {
  return function AnalyticsWrapper(props) {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
      // Track page type on mount
      trackEvent('page_view', {
        page_type: pageType,
        page_location: window.location.href
      });
    }, [trackEvent]);

    return <WrappedComponent {...props} />;
  };
}