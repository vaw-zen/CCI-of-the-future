/**
 * Enhanced Google Analytics utilities for CCI Services
 * Business-specific tracking functions for cleaning services
 */

// Service types mapping for consistent tracking
export const SERVICE_TYPES = {
  MARBRE: 'marbre',
  TAPIS: 'tapis', 
  MOQUETTE: 'moquette',
  SALON: 'salon',
  TAPISSERIE: 'tapisserie',
  TFC: 'travaux_fin_chantier',
  CONSEIL: 'conseil'
};

// Track service-specific interactions
export const trackServiceInteraction = (serviceType, action, additionalData = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'service_interaction',
      service_type: serviceType,
      page_location: window.location.href,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }
};

// Track quote form progression
export const trackQuoteProgress = (step, serviceType, formData = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_progress', {
      event_category: 'conversion_funnel',
      form_step: step,
      service_type: serviceType,
      form_data: JSON.stringify(formData),
      progress_percentage: getProgressPercentage(step)
    });
  }
};

// Track phone number reveals/clicks
export const trackPhoneReveal = (location = 'header') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'phone_reveal', {
      event_category: 'lead_generation',
      event_label: location,
      value: 5 // Assign value to phone reveals
    });
  }
};

// Track social media interactions
export const trackSocialClick = (platform, action = 'click') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'social_interaction', {
      event_category: 'social',
      social_platform: platform,
      social_action: action,
      page_location: window.location.href
    });
  }
};

// Track file downloads (PDFs, images, etc.)
export const trackFileDownload = (fileName, fileType, fileSize = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'file_download', {
      event_category: 'engagement',
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      download_url: window.location.href
    });
  }
};

// Track gallery image views
export const trackGalleryView = (galleryType, imageIndex, totalImages) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'gallery_view', {
      event_category: 'engagement',
      gallery_type: galleryType,
      image_index: imageIndex,
      total_images: totalImages,
      engagement_depth: Math.round((imageIndex / totalImages) * 100)
    });
  }
};

// Track video interactions
export const trackVideoInteraction = (videoTitle, action, currentTime = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', `video_${action}`, {
      event_category: 'video',
      video_title: videoTitle,
      video_current_time: currentTime,
      page_location: window.location.href
    });
  }
};

// Track consultation bookings
export const trackConsultationBooking = (serviceType, consultationType, timeSlot) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'book_consultation', {
      event_category: 'conversion',
      service_type: serviceType,
      consultation_type: consultationType,
      time_slot: timeSlot,
      value: 50 // Assign high value to consultations
    });
  }
};

// Track error events
export const trackError = (errorType, errorMessage, errorLocation) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      error_location: errorLocation
    });
  }
};

// Track performance metrics
export const trackPerformance = (metricName, value, unit = 'ms') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metricName,
      value: value,
      event_category: 'performance',
      metric_unit: unit
    });
  }
};

// Track user engagement milestones
export const trackEngagementMilestone = (milestone, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'engagement_milestone', {
      event_category: 'user_engagement',
      milestone_type: milestone,
      milestone_value: value,
      session_duration: Date.now() - (window.sessionStartTime || Date.now())
    });
  }
};

// Enhanced ecommerce tracking for service packages
export const trackServicePackageView = (packageName, packagePrice, packageServices = []) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'TND',
      value: packagePrice,
      items: [{
        item_id: packageName.toLowerCase().replace(/\s+/g, '_'),
        item_name: packageName,
        item_category: 'service_package',
        price: packagePrice,
        quantity: 1,
        item_variant: packageServices.join(', ')
      }]
    });
  }
};

// Track service package selection/interest
export const trackServicePackageInterest = (packageName, packagePrice, contactMethod) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'TND',
      value: packagePrice,
      items: [{
        item_id: packageName.toLowerCase().replace(/\s+/g, '_'),
        item_name: packageName,
        item_category: 'service_package',
        price: packagePrice,
        quantity: 1
      }],
      contact_method: contactMethod
    });
  }
};

// Helper function to calculate form progress percentage
const getProgressPercentage = (step) => {
  const stepMap = {
    'start': 0,
    'service_selection': 25,
    'contact_info': 50,
    'details': 75,
    'submit': 100
  };
  return stepMap[step] || 0;
};

// Initialize session tracking
export const initializeAnalyticsSession = () => {
  if (typeof window !== 'undefined') {
    window.sessionStartTime = Date.now();
    
    // Track initial page load performance
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      trackPerformance('page_load_time', loadTime);
    }

    // Track device and browser info
    window.gtag('event', 'session_start', {
      event_category: 'engagement',
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      connection_type: navigator.connection ? navigator.connection.effectiveType : 'unknown'
    });
  }
};