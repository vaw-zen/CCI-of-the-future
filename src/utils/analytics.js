import {
  clearQuoteCalculatorContext,
  getAnalyticsContext,
  getQuoteCalculatorContext,
  pushAnalyticsEvent,
  setQuoteCalculatorContext
} from './analyticsGateway';
import { getStoredUTMParameters } from './utmGenerator';

export const SERVICE_TYPES = {
  MARBRE: 'marbre',
  TAPIS: 'tapis',
  MOQUETTE: 'moquette',
  SALON: 'salon',
  TAPISSERIE: 'tapisserie',
  TFC: 'tfc',
  CONSEIL: 'conseil',
  CONVENTION: 'convention'
};

export const ARTICLE_CATEGORIES = {
  TAPIS: 'tapis',
  MARBRE: 'marbre',
  SALON: 'salon',
  TAPISSERIE: 'tapisserie',
  POST_CHANTIER: 'post-chantier',
  ALL: 'all'
};

function emitEvent(name, payload = {}) {
  return pushAnalyticsEvent(name, payload);
}

function normalizeCtaConfig(input, legacyConfig = {}) {
  if (typeof input === 'object' && input !== null) {
    return {
      ctaText: input.ctaText || input.label || input.ctaId || 'CTA',
      ctaId: input.ctaId || '',
      ctaLocation: input.ctaLocation || input.location || '',
      ctaType: input.ctaType || input.type || 'primary',
      ctaDestination: input.ctaDestination || input.destination || '',
      value: input.value || 0,
      additionalData: input.additionalData || {}
    };
  }

  return {
    ctaText: input || 'CTA',
    ctaId: legacyConfig.ctaId || '',
    ctaLocation: legacyConfig.ctaLocation || '',
    ctaType: legacyConfig.ctaType || 'primary',
    ctaDestination: legacyConfig.ctaDestination || '',
    value: legacyConfig.value || 0,
    additionalData: legacyConfig.additionalData || {}
  };
}

function persistWhatsAppClick(location = 'general') {
  if (typeof window === 'undefined') {
    return;
  }

  const context = getAnalyticsContext();
  const payload = {
    ga_client_id: context.ga_client_id,
    event_label: location,
    page_path: context.entry_path || context.page_path || window.location.pathname,
    landing_page: context.landing_page || window.location.pathname,
    session_source: context.session_source,
    session_medium: context.session_medium,
    session_campaign: context.session_campaign,
    referrer_host: context.referrer_host
  };

  const serializedPayload = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([serializedPayload], { type: 'application/json' });
    if (navigator.sendBeacon('/api/analytics/whatsapp-click', blob)) {
      return;
    }
  }

  fetch('/api/analytics/whatsapp-click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: serializedPayload,
    keepalive: true
  }).catch(() => {});
}

function removeEmptyValues(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

const getLeadContext = (additionalData = {}) => removeEmptyValues(getAnalyticsContext(additionalData));

const getContactLinkDetails = (href = '') => {
  if (!href) {
    return null;
  }

  if (href.startsWith('mailto:')) {
    return {
      method: 'email',
      value: (href.match(/mailto:([^?]+)/i) || [])[1] || ''
    };
  }

  if (href.startsWith('tel:')) {
    return {
      method: 'phone',
      value: href.replace(/^tel:/i, '').trim()
    };
  }

  if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp')) {
    return {
      method: 'whatsapp',
      value: (href.match(/(?:wa\.me\/|phone=)(\d+)/i) || [])[1] || ''
    };
  }

  return null;
};

const getProgressPercentage = (step) => {
  const stepMap = {
    start: 0,
    service_selection: 25,
    contact_info: 50,
    details: 75,
    submit: 100
  };

  return stepMap[step] || 0;
};

export const trackServiceInteraction = (serviceType, action, additionalData = {}) => {
  emitEvent('service_interaction', {
    event_category: 'service_interaction',
    service_type: serviceType,
    action_name: action,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackQuoteProgress = (step, serviceType, formData = {}) => {
  emitEvent('form_progress', {
    event_category: 'conversion_funnel',
    form_step: step,
    service_type: serviceType,
    progress_percentage: getProgressPercentage(step),
    ...formData
  });
};

export const trackPhoneReveal = (location = 'header', additionalData = {}) => {
  emitEvent('phone_click', {
    event_category: 'lead_generation',
    event_label: location,
    value: 5,
    cta_location: additionalData.cta_location || location,
    ...getLeadContext(additionalData)
  });
};

export const trackEmailClick = (location = 'general', emailAddress = '', additionalData = {}) => {
  emitEvent('email_click', {
    event_category: 'lead_generation',
    event_label: location,
    value: 5,
    cta_location: additionalData.cta_location || location,
    ...getLeadContext(additionalData)
  });
};

export const trackWhatsAppClick = (location = 'general', phoneNumber = '', additionalData = {}, options = {}) => {
  const { persistServerClick = true } = options;
  const leadContext = getLeadContext(additionalData);

  emitEvent('whatsapp_click', {
    event_category: 'lead_generation',
    event_label: location,
    value: 5,
    cta_location: additionalData.cta_location || location,
    ...leadContext
  });

  if (persistServerClick) {
    persistWhatsAppClick(location);
  }
};

export const trackContactLinkClick = (href, location = 'contact_link', additionalData = {}) => {
  const contactDetails = getContactLinkDetails(href);
  if (!contactDetails) {
    return false;
  }

  const payload = {
    contact_method: contactDetails.method,
    link_destination: href,
    ...additionalData
  };

  if (contactDetails.method === 'email') {
    trackEmailClick(location, contactDetails.value, payload);
  } else if (contactDetails.method === 'phone') {
    trackPhoneReveal(location, payload);
  } else if (contactDetails.method === 'whatsapp') {
    trackWhatsAppClick(location, contactDetails.value, payload);
  }

  return true;
};

export const trackSectionView = (sectionName, sectionType = 'content', pageContext = '') => {
  emitEvent('view_section', {
    event_category: 'visibility',
    section_name: sectionName,
    section_type: sectionType,
    page_context: pageContext,
    scroll_depth: typeof window !== 'undefined'
      ? Math.round((window.scrollY / document.documentElement.scrollHeight) * 100)
      : 0
  });
};

export const trackScrollDepth = (percentage, pageName = '') => {
  emitEvent('scroll_depth', {
    event_category: 'engagement',
    event_label: `${percentage}%`,
    page_name: pageName,
    scroll_percentage: percentage
  });
};

export const trackCTAImpression = (ctaTextOrConfig, ctaLocation, ctaType = 'primary', additionalData = {}) => {
  const config = normalizeCtaConfig(ctaTextOrConfig, {
    ctaLocation,
    ctaType,
    additionalData
  });

  emitEvent('view_promotion', {
    event_category: 'visibility',
    promotion_name: config.ctaText,
    creative_slot: config.ctaLocation,
    promotion_type: config.ctaType,
    cta_id: config.ctaId,
    cta_location: config.ctaLocation,
    cta_type: config.ctaType,
    ...getAnalyticsContext(config.additionalData)
  });
};

export const trackCTAClick = (ctaTextOrConfig, ctaLocation, ctaDestination = '', value = 0, additionalData = {}) => {
  const config = normalizeCtaConfig(ctaTextOrConfig, {
    ctaLocation,
    ctaDestination,
    value,
    additionalData
  });

  emitEvent('cta_click', {
    event_category: 'engagement',
    promotion_name: config.ctaText,
    creative_slot: config.ctaLocation,
    cta_destination: config.ctaDestination,
    link_destination: config.ctaDestination,
    cta_id: config.ctaId,
    cta_location: config.ctaLocation,
    cta_type: config.ctaType,
    value: config.value,
    ...getAnalyticsContext(config.additionalData)
  });
};

export const trackHeroInteraction = (actionType, actionValue = '') => {
  emitEvent('hero_interaction', {
    event_category: 'engagement',
    interaction_type: actionType,
    interaction_value: actionValue,
    ...getAnalyticsContext()
  });
};

export const trackServiceCardClick = (serviceName, serviceUrl, cardPosition = 0) => {
  emitEvent('select_content', {
    event_category: 'engagement',
    content_type: 'service_card',
    item_id: serviceName.toLowerCase().replace(/\s+/g, '_'),
    item_name: serviceName,
    item_list_name: 'services_grid',
    index: cardPosition
  });
};

export const trackGalleryInteraction = (galleryType, imageIndex, action = 'view') => {
  emitEvent('gallery_interaction', {
    event_category: 'engagement',
    gallery_type: galleryType,
    image_index: imageIndex,
    action_type: action
  });
};

export const trackVideoEngagement = (videoTitle, action, progress = 0) => {
  emitEvent('video_engagement', {
    event_category: 'engagement',
    video_title: videoTitle,
    action_name: action,
    video_progress: progress,
    ...getAnalyticsContext()
  });
};

export const trackTimeOnPage = (duration, pageName = '') => {
  emitEvent('timing_complete', {
    event_category: 'engagement',
    name: 'time_on_page',
    value: duration,
    event_label: pageName,
    ...getAnalyticsContext()
  });
};

export const trackFunnelStep = (funnelName, stepName, stepNumber, stepData = {}) => {
  emitEvent('begin_checkout', {
    event_category: 'conversion_funnel',
    funnel_name: funnelName,
    step_name: stepName,
    step_number: stepNumber,
    ...getAnalyticsContext(stepData)
  });
};

export const trackFunnelComplete = (funnelName, stepName, stepNumber, stepData = {}) => {
  emitEvent('checkout_progress', {
    event_category: 'conversion_funnel',
    funnel_name: funnelName,
    step_name: stepName,
    step_number: stepNumber,
    ...getAnalyticsContext(stepData)
  });
};

export const trackFormFieldFocus = (formName, fieldName, fieldType = 'text', additionalData = {}) => {
  emitEvent('form_field_focus', {
    event_category: 'form_interaction',
    form_name: formName,
    field_name: fieldName,
    field_type: fieldType,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackFormFieldComplete = (formName, fieldName, additionalData = {}) => {
  emitEvent('form_field_complete', {
    event_category: 'form_interaction',
    form_name: formName,
    field_name: fieldName,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackFormAbandonment = (formName, lastCompletedField, completionPercentage, additionalData = {}) => {
  emitEvent('form_abandonment', {
    event_category: 'conversion_funnel',
    form_name: formName,
    last_field: lastCompletedField,
    completion_rate: completionPercentage,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackFormValidationFailed = (formName, fieldNames = [], failureType = 'client_validation', additionalData = {}) => {
  emitEvent('form_validation_failed', {
    event_category: 'form_interaction',
    form_name: formName,
    failure_type: failureType,
    field_names: fieldNames,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackFormSubmitFailed = (formName, failureType = 'unknown_error', additionalData = {}) => {
  emitEvent('form_submit_failed', {
    event_category: 'conversion',
    form_name: formName,
    failure_type: failureType,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackNewsletterSignupStarted = (placement = 'unknown', additionalData = {}) => {
  emitEvent('newsletter_signup_started', {
    placement,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackNewsletterSignupSubmitted = (placement = 'unknown', additionalData = {}) => {
  emitEvent('newsletter_signup_submitted', {
    placement,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackNewsletterSignupFailed = (placement = 'unknown', failureType = 'unknown_error', additionalData = {}) => {
  emitEvent('newsletter_signup_failed', {
    placement,
    failure_type: failureType,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackQuoteCalculatorStarted = (serviceType = '', additionalData = {}) => {
  emitEvent('quote_calculator_started', {
    service_type: serviceType,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackDevisCalculation = (serviceType, calculatedValue, optionsSelected = []) => {
  const selectedServices = Array.isArray(optionsSelected) ? optionsSelected : [];
  const normalizedValue = Number(calculatedValue) || 0;

  if (normalizedValue <= 0) {
    clearQuoteCalculatorContext();
    return;
  }

  setQuoteCalculatorContext({
    calculator_estimate: Math.round(normalizedValue),
    selected_services: selectedServices,
    primary_service: serviceType || selectedServices[0] || ''
  });

  emitEvent('quote_calculator_calculated', {
    event_category: 'conversion',
    service_type: serviceType,
    estimated_value: normalizedValue,
    selected_services: selectedServices,
    value: normalizedValue * 0.1,
    ...getAnalyticsContext()
  });
};

export const trackDevisSubmission = (serviceType, estimatedValue, contactMethod = 'form', additionalData = {}) => {
  const normalizedValue = Number(estimatedValue) || 0;
  const calculatorContext = getQuoteCalculatorContext() || {};
  const payload = getLeadContext({
    lead_type: 'quote_request',
    business_line: 'b2c',
    calculator_estimate: calculatorContext.calculator_estimate,
    selected_services: calculatorContext.selected_services,
    ...additionalData
  });

  emitEvent('generate_lead', {
    event_category: 'conversion',
    event_label: 'devis_submission',
    service_type: serviceType,
    estimated_value: normalizedValue,
    contact_method: contactMethod,
    value: normalizedValue > 0 ? normalizedValue * 0.2 : 1,
    ...payload
  });

  emitEvent('conversion_event_contact', {
    event_category: 'contact',
    event_label: 'devis_request',
    service_type: serviceType,
    contact_method: contactMethod,
    value: 1,
    ...payload
  });
};

export const trackConventionSubmission = ({
  secteur = '',
  nombreSites = 1,
  servicesCount = 0,
  frequence = '',
  duree = '',
  surfaceTotale = 0,
  ...additionalData
} = {}) => {
  const normalizedSites = Number(nombreSites) || 1;
  const normalizedSurface = Number(surfaceTotale) || 0;
  const leadValue = Math.max(20, (normalizedSites * 10) + (servicesCount * 5));
  const payload = getLeadContext({
    lead_type: 'convention_request',
    business_line: 'b2b',
    company_sector: secteur,
    number_of_sites: normalizedSites,
    services_count: servicesCount,
    contract_frequency: frequence,
    contract_duration: duree,
    surface_total: normalizedSurface || undefined,
    ...additionalData
  });

  emitEvent('generate_lead', {
    event_category: 'conversion',
    event_label: 'convention_submission',
    service_type: SERVICE_TYPES.CONVENTION,
    contact_method: 'form',
    value: leadValue,
    ...payload
  });
};

export const trackArticleReadProgress = (articleTitle, progressPercentage) => {
  emitEvent('article_read_progress', {
    event_category: 'content_engagement',
    article_title: articleTitle,
    read_progress: progressPercentage,
    content_type: 'article',
    ...getAnalyticsContext({
      business_line: 'content'
    })
  });
};

export const trackArticleComplete = (articleTitle, timeSpent) => {
  emitEvent('article_complete', {
    event_category: 'content_engagement',
    article_title: articleTitle,
    time_spent: timeSpent,
    value: 2,
    content_type: 'article',
    ...getAnalyticsContext({
      business_line: 'content'
    })
  });
};

export const trackFAQInteraction = (question, wasHelpful = null, additionalData = {}) => {
  emitEvent('faq_expanded', {
    faq_question: question,
    helpful: wasHelpful,
    ...getAnalyticsContext(additionalData)
  });
};

export const trackInternalSearch = (searchTerm, resultsCount, searchLocation = '') => {
  emitEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    search_location: searchLocation
  });
};

export const trackNavigationClick = (linkText, linkDestination, navLocation = 'header') => {
  emitEvent('navigation_click', {
    event_category: 'navigation',
    link_text: linkText,
    link_destination: linkDestination,
    nav_location: navLocation
  });
};

export const trackSocialClick = (platform, action = 'click') => {
  emitEvent('social_interaction', {
    event_category: 'social',
    social_platform: platform,
    social_action: action,
    ...getAnalyticsContext()
  });
};

export const trackFileDownload = (fileName, fileType, fileSize = null) => {
  emitEvent('file_download', {
    event_category: 'engagement',
    file_name: fileName,
    file_type: fileType,
    file_size: fileSize,
    ...getAnalyticsContext()
  });
};

export const trackGalleryView = (galleryType, imageIndex, totalImages) => {
  emitEvent('gallery_view', {
    event_category: 'engagement',
    gallery_type: galleryType,
    image_index: imageIndex,
    total_images: totalImages,
    engagement_depth: Math.round((imageIndex / totalImages) * 100)
  });
};

export const trackVideoInteraction = (videoTitle, action, currentTime = 0) => {
  emitEvent('video_engagement', {
    event_category: 'video',
    video_title: videoTitle,
    action_name: action,
    video_current_time: currentTime,
    ...getAnalyticsContext()
  });
};

export const trackConsultationBooking = (serviceType, consultationType, timeSlot) => {
  emitEvent('book_consultation', {
    event_category: 'conversion',
    service_type: serviceType,
    consultation_type: consultationType,
    time_slot: timeSlot,
    value: 50
  });
};

export const trackError = (errorType, errorMessage, errorLocation) => {
  emitEvent('exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: false,
    error_location: errorLocation
  });
};

export const trackPerformance = (metricName, value, unit = 'ms') => {
  emitEvent('timing_complete', {
    name: metricName,
    value,
    event_category: 'performance',
    metric_unit: unit
  });
};

export const trackEngagementMilestone = (milestone, value) => {
  emitEvent('engagement_milestone', {
    event_category: 'user_engagement',
    milestone_type: milestone,
    milestone_value: value,
    session_duration: typeof window !== 'undefined'
      ? Date.now() - (window.sessionStartTime || Date.now())
      : 0
  });
};

export const trackServicePackageView = (packageName, packagePrice, packageServices = []) => {
  emitEvent('view_item', {
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
};

export const trackServicePackageInterest = (packageName, packagePrice, contactMethod) => {
  emitEvent('add_to_cart', {
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
};

export const initializeAnalyticsSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStartTime = Date.now();

  if (window.performance?.timing) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    if (loadTime > 0) {
      trackPerformance('page_load_time', loadTime);
    }
  }

  emitEvent('session_start', {
    event_category: 'engagement',
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    connection_type: navigator.connection ? navigator.connection.effectiveType : 'unknown'
  });
};

export const trackConseilsView = (activeFilter = 'all', articleCount = 0) => {
  emitEvent('view_conseils_page', {
    event_category: 'content_visibility',
    active_filter: activeFilter,
    article_count: articleCount,
    ...getAnalyticsContext()
  });
};

export const trackArticleClick = (articleData = {}) => {
  const { title, slug, category, categoryLabel, featured = false, position = null } = articleData;

  emitEvent('select_article', {
    event_category: 'content_engagement',
    article_title: title,
    article_slug: slug,
    article_category: category,
    category_label: categoryLabel,
    is_featured: featured,
    article_position: position,
    ...getAnalyticsContext()
  });
};

export const trackCategoryFilter = (category, categoryLabel, resultCount = 0) => {
  emitEvent('filter_category', {
    event_category: 'content_discovery',
    filter_category: category,
    filter_label: categoryLabel,
    result_count: resultCount,
    ...getAnalyticsContext()
  });
};

export const trackTableOfContentsClick = (sectionId, sectionTitle, articleTitle) => {
  emitEvent('toc_navigation', {
    event_category: 'content_navigation',
    section_id: sectionId,
    section_title: sectionTitle,
    article_title: articleTitle,
    ...getAnalyticsContext()
  });
};

export const trackArticleNavigation = (direction, targetArticle) => {
  const { title, slug, category } = targetArticle;

  emitEvent('navigate_article', {
    event_category: 'content_navigation',
    navigation_direction: direction,
    target_article_title: title,
    target_article_slug: slug,
    target_article_category: category,
    ...getAnalyticsContext()
  });
};

export const trackBreadcrumbClick = (linkText, linkHref, position) => {
  emitEvent('breadcrumb_click', {
    event_category: 'content_navigation',
    link_text: linkText,
    link_href: linkHref,
    breadcrumb_position: position,
    ...getAnalyticsContext()
  });
};

export const trackRelatedServiceClick = (serviceTitle, serviceLink, articleTitle) => {
  emitEvent('select_related_service', {
    event_category: 'conversion_opportunity',
    service_title: serviceTitle,
    service_link: serviceLink,
    source_article: articleTitle,
    ...getAnalyticsContext()
  });
};

export const trackBackToConseilsClick = (articleTitle, articleCategory) => {
  emitEvent('back_to_conseils', {
    event_category: 'content_navigation',
    source_article: articleTitle,
    source_category: articleCategory,
    ...getAnalyticsContext()
  });
};

export const trackReelView = (reelId, reelTitle = '') => {
  emitEvent('view_reel', {
    event_category: 'content_engagement',
    reel_id: reelId,
    reel_title: reelTitle,
    ...getAnalyticsContext()
  });
};

export const trackVideoPlay = (reelId, reelTitle = '') => {
  emitEvent('reel_video_started', {
    reel_id: reelId,
    reel_title: reelTitle,
    ...getAnalyticsContext()
  });
};

export const trackVideoPause = (reelId, currentTime = 0) => {
  emitEvent('reel_video_paused', {
    reel_id: reelId,
    watch_time_seconds: Math.round(currentTime),
    ...getAnalyticsContext()
  });
};

export const trackVideoComplete = (reelId, reelTitle = '', watchTime = 0) => {
  emitEvent('reel_video_completed', {
    reel_id: reelId,
    reel_title: reelTitle,
    watch_time_seconds: Math.round(watchTime),
    progress_percent: 100,
    ...getAnalyticsContext()
  });
};

export const trackVideoProgress = (reelId, percentage, watchTime = 0) => {
  emitEvent('reel_video_progress', {
    reel_id: reelId,
    progress_percent: percentage,
    watch_time_seconds: Math.round(watchTime),
    ...getAnalyticsContext()
  });
};

export { getQuoteCalculatorContext };
