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

// Article categories for blog tracking
export const ARTICLE_CATEGORIES = {
  TAPIS: 'tapis',
  MARBRE: 'marbre',
  SALON: 'salon',
  TAPISSERIE: 'tapisserie',
  POST_CHANTIER: 'post-chantier',
  ALL: 'all'
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
  // Forward to Facebook Pixel when available
  try {
    if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
      const payload = { service_type: serviceType, page_location: typeof window !== 'undefined' ? window.location.href : undefined, ...additionalData };
      // Use a custom event name for service interactions
      window.fbq('trackCustom', action, payload);
    }
  } catch (e) {
    // swallow
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

// Track phone number reveals/clicks with Google Ads conversion
export const trackPhoneReveal = (location = 'header') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'phone_reveal', {
      event_category: 'lead_generation',
      event_label: location,
      value: 5 // Assign value to phone reveals
    });
    
    // Trigger Google Ads conversion for phone clicks
    if (typeof window.gtag_report_conversion === 'function') {
      window.gtag_report_conversion();
    }
  }
  try {
    if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Lead', { method: 'phone', location });
    }
  } catch (e) {}
};

// Track email link clicks with Google Ads conversion
export const trackEmailClick = (location = 'general', emailAddress = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'email_click', {
      event_category: 'lead_generation',
      event_label: location,
      email_address: emailAddress,
      value: 5 // Assign value to email clicks
    });
    
    // Trigger Google Ads conversion for email clicks
    if (typeof window.gtag_report_conversion === 'function') {
      window.gtag_report_conversion();
    }
  }
  try {
    if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Lead', { method: 'email', location, email: emailAddress });
    }
  } catch (e) {}
};

// Track WhatsApp link clicks with Google Ads conversion
export const trackWhatsAppClick = (location = 'general', phoneNumber = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'whatsapp_click', {
      event_category: 'lead_generation',
      event_label: location,
      phone_number: phoneNumber,
      value: 5 // Assign value to WhatsApp clicks
    });
    
    // Trigger Google Ads conversion for WhatsApp clicks
    if (typeof window.gtag_report_conversion === 'function') {
      window.gtag_report_conversion();
    }
  }
  try {
    if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Lead', { method: 'whatsapp', phone: phoneNumber, location });
    }
  } catch (e) {}
};

// ============================================================================
// VISIBILITY & REACH TRACKING
// ============================================================================

// Track when key sections become visible (scroll depth/viewport entry)
export const trackSectionView = (sectionName, sectionType = 'content', pageContext = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_section', {
      event_category: 'visibility',
      section_name: sectionName,
      section_type: sectionType,
      page_context: pageContext,
      scroll_depth: Math.round((window.scrollY / document.documentElement.scrollHeight) * 100)
    });
  }
};

// Track scroll depth milestones
export const trackScrollDepth = (percentage, pageName = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'scroll_depth', {
      event_category: 'engagement',
      event_label: `${percentage}%`,
      page_name: pageName,
      scroll_percentage: percentage
    });
  }
};

// Track CTA button visibility and impressions
export const trackCTAImpression = (ctaText, ctaLocation, ctaType = 'primary') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_promotion', {
      event_category: 'visibility',
      promotion_name: ctaText,
      creative_slot: ctaLocation,
      promotion_type: ctaType
    });
  }
};

// Track CTA button clicks
export const trackCTAClick = (ctaText, ctaLocation, ctaDestination = '', value = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_promotion', {
      event_category: 'engagement',
      promotion_name: ctaText,
      creative_slot: ctaLocation,
      cta_destination: ctaDestination,
      value: value
    });
  }
};

// ============================================================================
// ENGAGEMENT TRACKING
// ============================================================================

// Track hero section interactions
export const trackHeroInteraction = (actionType, actionValue = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'hero_interaction', {
      event_category: 'engagement',
      interaction_type: actionType,
      interaction_value: actionValue,
      page_location: window.location.pathname
    });
  }
};

// Track service card clicks/views
export const trackServiceCardClick = (serviceName, serviceUrl, cardPosition = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_content', {
      event_category: 'engagement',
      content_type: 'service_card',
      item_id: serviceName.toLowerCase().replace(/\s+/g, '_'),
      item_name: serviceName,
      item_list_name: 'services_grid',
      index: cardPosition
    });
  }
};

// Track gallery interactions
export const trackGalleryInteraction = (galleryType, imageIndex, action = 'view') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'gallery_interaction', {
      event_category: 'engagement',
      gallery_type: galleryType,
      image_index: imageIndex,
      action_type: action
    });
  }
};

// Track video interactions (play, pause, complete)
export const trackVideoEngagement = (videoTitle, action, progress = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', `video_${action}`, {
      event_category: 'engagement',
      video_title: videoTitle,
      video_progress: progress,
      page_location: window.location.pathname
    });
  }
};

// Track time on page milestones
export const trackTimeOnPage = (duration, pageName = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      event_category: 'engagement',
      name: 'time_on_page',
      value: duration,
      event_label: pageName
    });
  }
};

// ============================================================================
// CONVERSION FUNNEL TRACKING
// ============================================================================

// Track funnel step entry
export const trackFunnelStep = (funnelName, stepName, stepNumber, stepData = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      event_category: 'conversion_funnel',
      funnel_name: funnelName,
      step_name: stepName,
      step_number: stepNumber,
      ...stepData
    });
  }
};

// Track funnel step completion
export const trackFunnelComplete = (funnelName, stepName, stepNumber) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'checkout_progress', {
      event_category: 'conversion_funnel',
      funnel_name: funnelName,
      step_name: stepName,
      step_number: stepNumber
    });
  }
};

// Track form field interactions
export const trackFormFieldFocus = (formName, fieldName, fieldType = 'text') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_field_focus', {
      event_category: 'form_interaction',
      form_name: formName,
      field_name: fieldName,
      field_type: fieldType
    });
  }
};

// Track form field completion
export const trackFormFieldComplete = (formName, fieldName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_field_complete', {
      event_category: 'form_interaction',
      form_name: formName,
      field_name: fieldName
    });
  }
};

// Track form abandonment
export const trackFormAbandonment = (formName, lastCompletedField, completionPercentage) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_abandonment', {
      event_category: 'conversion_funnel',
      form_name: formName,
      last_field: lastCompletedField,
      completion_rate: completionPercentage
    });
  }
};

// Track devis/quote calculator interactions
export const trackDevisCalculation = (serviceType, calculatedValue, optionsSelected = []) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'devis_calculated', {
      event_category: 'conversion',
      service_type: serviceType,
      estimated_value: calculatedValue,
      options: optionsSelected.join(','),
      value: calculatedValue * 0.1 // Assign conversion value (10% of quote)
    });
  }
};

// Track devis submission
export const trackDevisSubmission = (serviceType, estimatedValue, contactMethod = 'form') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'conversion',
      event_label: 'devis_submission',
      service_type: serviceType,
      estimated_value: estimatedValue,
      contact_method: contactMethod,
      value: estimatedValue * 0.2 // Higher conversion value for actual submission
    });
  }
  try {
    if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
      window.fbq('track', 'Lead', { service_type: serviceType, estimated_value: estimatedValue, contact_method: contactMethod });
    }
  } catch (e) {}
};

// ============================================================================
// CONTENT ENGAGEMENT TRACKING
// ============================================================================

// Track blog article read progress
export const trackArticleReadProgress = (articleTitle, progressPercentage) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'article_read_progress', {
      event_category: 'content_engagement',
      article_title: articleTitle,
      read_progress: progressPercentage
    });
  }
};

// Track blog article complete read
export const trackArticleComplete = (articleTitle, timeSpent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'article_complete', {
      event_category: 'content_engagement',
      article_title: articleTitle,
      time_spent: timeSpent,
      value: 2 // Assign value to complete article reads
    });
  }
};

// Track FAQ interaction
export const trackFAQInteraction = (question, wasHelpful = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'faq_interaction', {
      event_category: 'content_engagement',
      question: question,
      helpful: wasHelpful
    });
  }
};

// ============================================================================
// SEARCH & NAVIGATION TRACKING
// ============================================================================

// Track internal search
export const trackInternalSearch = (searchTerm, resultsCount, searchLocation = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount,
      search_location: searchLocation
    });
  }
};

// Track navigation clicks
export const trackNavigationClick = (linkText, linkDestination, navLocation = 'header') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'navigation_click', {
      event_category: 'navigation',
      link_text: linkText,
      link_destination: linkDestination,
      nav_location: navLocation
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

// ============================================================================
// CONSEILS/BLOG TRACKING FUNCTIONS
// ============================================================================

/**
 * Track conseils page view with filters applied
 */
export const trackConseilsView = (activeFilter = 'all', articleCount = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_conseils_page', {
      event_category: 'content_visibility',
      active_filter: activeFilter,
      article_count: articleCount,
      page_location: window.location.href
    });
  }
};

/**
 * Track article card click from conseils listing
 */
export const trackArticleClick = (articleData = {}) => {
  const { title, slug, category, categoryLabel, featured = false, position = null } = articleData;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_article', {
      event_category: 'content_engagement',
      article_title: title,
      article_slug: slug,
      article_category: category,
      category_label: categoryLabel,
      is_featured: featured,
      article_position: position,
      page_location: window.location.href
    });
  }
};

/**
 * Track category filter change
 */
export const trackCategoryFilter = (category, categoryLabel, resultCount = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'filter_category', {
      event_category: 'content_discovery',
      filter_category: category,
      filter_label: categoryLabel,
      result_count: resultCount,
      page_location: window.location.href
    });
  }
};

/**
 * Track table of contents link click in article
 */
export const trackTableOfContentsClick = (sectionId, sectionTitle, articleTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'toc_navigation', {
      event_category: 'content_navigation',
      section_id: sectionId,
      section_title: sectionTitle,
      article_title: articleTitle,
      page_location: window.location.href
    });
  }
};

/**
 * Track article navigation (prev/next)
 */
export const trackArticleNavigation = (direction, targetArticle) => {
  const { title, slug, category } = targetArticle;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'navigate_article', {
      event_category: 'content_navigation',
      navigation_direction: direction, // 'previous' or 'next'
      target_article_title: title,
      target_article_slug: slug,
      target_article_category: category,
      page_location: window.location.href
    });
  }
};

/**
 * Track breadcrumb navigation click
 */
export const trackBreadcrumbClick = (linkText, linkHref, position) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'breadcrumb_click', {
      event_category: 'content_navigation',
      link_text: linkText,
      link_href: linkHref,
      breadcrumb_position: position,
      page_location: window.location.href
    });
  }
};

/**
 * Track related service click from article page
 */
export const trackRelatedServiceClick = (serviceTitle, serviceLink, articleTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_related_service', {
      event_category: 'conversion_opportunity',
      service_title: serviceTitle,
      service_link: serviceLink,
      source_article: articleTitle,
      page_location: window.location.href
    });
  }
};

/**
 * Track "back to conseils" CTA click
 */
export const trackBackToConseilsClick = (articleTitle, articleCategory) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'back_to_conseils', {
      event_category: 'content_navigation',
      source_article: articleTitle,
      source_category: articleCategory,
      page_location: window.location.href
    });
  }
};

// ============================================================================
// REELS/VIDEO TRACKING FUNCTIONS
// ============================================================================

/**
 * Track reel/video view
 */
export const trackReelView = (reelId, reelTitle = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_reel', {
      event_category: 'content_engagement',
      reel_id: reelId,
      reel_title: reelTitle,
      page_location: window.location.href
    });
  }
};

/**
 * Track video play interaction
 */
export const trackVideoPlay = (reelId, reelTitle = '') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'play_video', {
      event_category: 'video_engagement',
      reel_id: reelId,
      reel_title: reelTitle,
      page_location: window.location.href
    });
  }
};

/**
 * Track video pause interaction
 */
export const trackVideoPause = (reelId, currentTime = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'pause_video', {
      event_category: 'video_engagement',
      reel_id: reelId,
      video_time: Math.round(currentTime),
      page_location: window.location.href
    });
  }
};

/**
 * Track video completion
 */
export const trackVideoComplete = (reelId, reelTitle = '', watchTime = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'complete_video', {
      event_category: 'video_engagement',
      reel_id: reelId,
      reel_title: reelTitle,
      watch_time: Math.round(watchTime),
      page_location: window.location.href
    });
  }
};

/**
 * Track video progress milestones (25%, 50%, 75%)
 */
export const trackVideoProgress = (reelId, percentage) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', `video_progress_${percentage}`, {
      event_category: 'video_engagement',
      reel_id: reelId,
      progress_percentage: percentage,
      page_location: window.location.href
    });
  }
};