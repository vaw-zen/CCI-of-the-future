/**
 * Facebook Pixel Helper - Enhanced event tracking
 * This file ensures all important events are properly tracked in Facebook Pixel
 */

// Test if Facebook Pixel is loaded and working
export const testFacebookPixel = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      // Fire a test event to verify tracking
      window.fbq('trackCustom', 'PixelTest', { 
        test_timestamp: new Date().toISOString(),
        page: window.location.pathname 
      });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Enhanced PageView tracking with additional context
export const trackPageView = (additionalData = {}) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'PageView', {
        page_title: document.title,
        page_url: window.location.href,
        page_path: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        ...additionalData
      });
    }
  } catch (error) {
    // Silent fail in production
  }
};

// Track when users spend significant time on page (engagement indicator)
export const trackEngagement = (timeSpent = 30) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('trackCustom', 'TimeSpentOnPage', {
        time_spent_seconds: timeSpent,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // Silent fail in production
  }
};

// Track content views (articles, services, galleries)
export const trackViewContent = (contentType, contentName, contentId = null) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'ViewContent', {
        content_type: contentType,
        content_name: contentName,
        content_id: contentId,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // Silent fail in production
  }
};

// Track lead generation activities
export const trackLead = (method, location = '', additionalData = {}) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Lead', {
        method: method, // 'phone', 'email', 'whatsapp', 'form'
        location: location,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...additionalData
      });
    }
  } catch (error) {
    // Silent fail in production
  }
};

// Track when users initiate contact/quote process
export const trackInitiateCheckout = (serviceType = '', estimatedValue = null) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      const eventData = {
        content_type: 'service_quote',
        service_type: serviceType,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      };
      
      if (estimatedValue) {
        eventData.value = estimatedValue;
        eventData.currency = 'TND';
      }
      
      window.fbq('track', 'InitiateCheckout', eventData);
    }
  } catch (error) {
    // Silent fail in production
  }
};

// Track searches within the site
export const trackSearch = (searchTerm, searchLocation = '') => {
  if (typeof window === 'undefined') return;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Search', {
        search_string: searchTerm,
        search_location: searchLocation,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // Silent fail in production
  }
};

// Track video interactions
export const trackVideoView = (videoTitle, videoId = '', duration = null) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      const eventData = {
        content_type: 'video',
        content_name: videoTitle,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      };
      
      if (videoId) eventData.content_id = videoId;
      if (duration) eventData.duration = duration;
      
      window.fbq('trackCustom', 'VideoView', eventData);
    }
  } catch (error) {
    // Silent fail in production
  }
};

// Track custom events for CCI-specific actions
export const trackCustomEvent = (eventName, eventData = {}) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('trackCustom', eventName, {
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...eventData
      });
    }
  } catch (error) {
    // Silent fail in production
  }
};

// Initialize Facebook Pixel tracking with automatic page view
export const initializeFacebookPixelTracking = () => {
  if (typeof window === 'undefined') return;
  
  // Test if pixel is working
  const pixelWorking = testFacebookPixel();
  
  if (pixelWorking) {
    // Track initial page view with enhanced data
    setTimeout(() => {
      trackPageView({
        initial_load: true,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
      });
    }, 1000);
    
    // Set up engagement tracking (track after 30 seconds on page)
    let engagementTracked = false;
    setTimeout(() => {
      if (!engagementTracked) {
        trackEngagement(30);
        engagementTracked = true;
      }
    }, 30000);
    
    // Track longer engagement after 60 seconds
    setTimeout(() => {
      trackEngagement(60);
    }, 60000);
    
    // Track scroll depth as engagement indicator
    let scrollTracked = false;
    const trackScrollEngagement = () => {
      if (scrollTracked) return;
      
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent >= 50) {
        trackCustomEvent('ScrollDepth50', { scroll_percentage: scrollPercent });
        scrollTracked = true;
      }
    };
    
    window.addEventListener('scroll', trackScrollEngagement);
  }
};

// Debug function to check pixel status (development only)
export const debugFacebookPixel = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;
  
  console.log('🔍 Facebook Pixel Debug Information:');
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('🌐 Current URL:', window.location.href);
  console.log('🔗 Referrer:', document.referrer);
  console.log('📏 Viewport:', `${window.innerWidth}x${window.innerHeight}`);
  
  if (typeof window.fbq !== 'undefined') {
    console.log('✅ window.fbq is available');
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    console.log('🎯 Pixel ID:', pixelId);
    
    try {
      window.fbq('trackCustom', 'DebugTest', {
        test_time: new Date().toISOString(),
        debug_mode: true
      });
      console.log('✅ Test event fired successfully');
    } catch (error) {
      console.error('❌ Test event failed:', error);
    }
  } else {
    console.error('❌ window.fbq is not available');
    const fbScript = document.querySelector('script[src*="fbevents.js"]');
    if (fbScript) {
      console.log('📜 Facebook script found in DOM');
    } else {
      console.error('📜 Facebook script NOT found in DOM');
    }
  }
};