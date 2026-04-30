import { getAnalyticsContext, pushAnalyticsEvent } from './analyticsGateway';

/**
 * Legacy compatibility layer for pages still importing the old Facebook helper.
 * Browser tracking now flows through GTM/dataLayer only.
 */

function emitEvent(name, payload = {}) {
  return pushAnalyticsEvent(name, {
    ...getAnalyticsContext(),
    ...payload
  });
}

export const testFacebookPixel = () => {
  return typeof window !== 'undefined' && Array.isArray(window.dataLayer);
};

export const trackPageView = (additionalData = {}) => {
  emitEvent('page_view', additionalData);
};

export const trackEngagement = (timeSpent = 30) => {
  emitEvent('engagement_milestone', {
    milestone_type: 'time_spent',
    milestone_value: timeSpent,
    time_spent_seconds: timeSpent
  });
};

export const trackViewContent = (contentType, contentName, contentId = null) => {
  emitEvent('view_item', {
    content_type: contentType,
    content_name: contentName,
    content_id: contentId,
    item_name: contentName,
    item_id: contentId || contentName
  });
};

export const trackLead = (method, location = '', additionalData = {}) => {
  emitEvent('generate_lead', {
    method,
    location,
    ...additionalData
  });
};

export const trackInitiateCheckout = (serviceType = '', estimatedValue = null) => {
  emitEvent('begin_checkout', {
    content_type: 'service_quote',
    service_type: serviceType,
    value: estimatedValue || undefined,
    currency: estimatedValue ? 'TND' : undefined
  });
};

export const trackSearch = (searchTerm, searchLocation = '') => {
  emitEvent('search', {
    search_string: searchTerm,
    search_location: searchLocation
  });
};

export const trackVideoView = (videoTitle, videoId = '', duration = null) => {
  emitEvent('video_engagement', {
    content_type: 'video',
    content_name: videoTitle,
    content_id: videoId || undefined,
    duration: duration || undefined
  });
};

export const trackCustomEvent = (eventName, eventData = {}) => {
  emitEvent(eventName, eventData);
};

export const initializeFacebookPixelTracking = () => {
  return testFacebookPixel();
};

export const debugFacebookPixel = () => {
  return testFacebookPixel();
};
