'use client';

import { useCallback, useEffect } from 'react';
import { getAnalyticsContext, pushAnalyticsEvent } from '@/utils/analyticsGateway';

/**
 * Custom hook for enhanced Google Analytics tracking
 * Provides manual event tracking helpers.
 */
export function useAnalytics() {
  const trackEvent = useCallback((eventName, parameters = {}) => {
    pushAnalyticsEvent(eventName, {
      ...getAnalyticsContext(),
      ...parameters
    });
  }, []);

  // Return tracking functions for manual events
  return {
    trackEvent,

    // Track form submissions
    trackFormSubmission: (formName, formData = {}) => {
      trackEvent('form_submit', {
        event_category: 'engagement',
        event_label: formName,
        form_name: formName,
        field_count: Object.keys(formData || {}).length
      });
    },

    // Track button clicks
    trackButtonClick: (buttonName, buttonLocation = '') => {
      trackEvent('click', {
        event_category: 'ui_interaction',
        event_label: buttonName,
        button_location: buttonLocation
      });
    },

    // Track service page visits (for your cleaning services)
    trackServiceView: (serviceName, serviceCategory = '') => {
      trackEvent('view_item', {
        event_category: 'service',
        event_label: serviceName,
        item_category: serviceCategory
      });
    },

    // Track quote requests
    trackQuoteRequest: (serviceType, contactMethod = '') => {
      trackEvent('generate_lead', {
        event_category: 'conversion',
        event_label: 'quote_request',
        service_type: serviceType,
        contact_method: contactMethod,
        value: 1
      });
    },

    // Track phone calls
    trackPhoneClick: () => {
      trackEvent('click', {
        event_category: 'conversion',
        event_label: 'phone_call',
        transport_type: 'beacon'
      });
    },

    // Track email clicks
    trackEmailClick: () => {
      trackEvent('click', {
        event_category: 'conversion',
        event_label: 'email_click',
        transport_type: 'beacon'
      });
    },

    // Track blog article engagement
    trackArticleEngagement: (articleTitle, engagementType = 'read') => {
      trackEvent(engagementType, {
        event_category: 'content',
        event_label: articleTitle,
        content_type: 'blog_article'
      });
    },

    // Track search queries (if you have search functionality)
    trackSearch: (searchTerm, resultsCount = 0) => {
      trackEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount
      });
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
      trackEvent('view_page_type', {
        page_type: pageType
      });
    }, [trackEvent]);

    return <WrappedComponent {...props} />;
  };
}
