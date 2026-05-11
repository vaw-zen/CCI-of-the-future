'use client';

import { useAnalytics } from '../../../hooks/useAnalytics';
import { trackServiceInteraction, trackPhoneReveal, trackEmailClick, trackWhatsAppClick, trackSocialClick, SERVICE_TYPES } from '../../analytics';
import { buildTrackedWhatsAppHref, parseWhatsAppHref } from '@/libs/whatsappTracking.mjs';
import ResponsiveImage from '@/utils/components/Image/Image';

/**
 * Enhanced analytics-aware components for common UI elements
 */

// Analytics-enhanced button component
export function AnalyticsButton({ 
  children, 
  onClick, 
  eventName = 'button_click',
  eventCategory = 'ui_interaction',
  eventLabel = '',
  className = '',
  ...props 
}) {
  const { trackEvent } = useAnalytics();

  const handleClick = (e) => {
    // Call the original onClick handler first (don't block user interaction)
    if (onClick) {
      onClick(e);
    }

    // Track analytics asynchronously (non-blocking)
    if (typeof window !== 'undefined') {
      const performTracking = () => {
        trackEvent(eventName, {
          event_category: eventCategory,
          event_label: eventLabel || (typeof children === 'string' ? children : 'button'),
          button_text: typeof children === 'string' ? children : 'button',
          page_location: window.location.href
        });
      };

      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        requestIdleCallback(performTracking);
      } else {
        setTimeout(performTracking, 0);
      }
    }
  };

  return (
    <button 
      className={className} 
      onClick={handleClick} 
      {...props}
    >
      {children}
    </button>
  );
}

// Analytics-enhanced link component
export function AnalyticsLink({ 
  children, 
  href, 
  onClick,
  eventName = 'link_click',
  eventCategory = 'navigation',
  eventLabel = '',
  eventData = {},
  className = '',
  ...props 
}) {
  const { trackEvent } = useAnalytics();
  const originalHref = href || '';

  const handleClick = (e) => {
    // Only track on client-side
    if (typeof window === 'undefined') return;
    
    // Determine link type (safe for client-side only)
    const isExternal = originalHref && (
      originalHref.startsWith('http') && 
      !originalHref.includes(window.location.hostname)
    );
    const isMailto = originalHref && originalHref.startsWith('mailto:');
    const isTel = originalHref && originalHref.startsWith('tel:');
    const isWhatsApp = originalHref && (originalHref.includes('wa.me') || originalHref.includes('api.whatsapp.com'));
    const whatsappLink = isWhatsApp ? parseWhatsAppHref(originalHref) : null;

    // Use requestIdleCallback for non-critical tracking (better performance)
    const performTracking = () => {
      // Track the analytics event
      trackEvent(eventName, {
        event_category: isExternal ? 'outbound' : eventCategory,
        event_label: eventLabel || originalHref,
        link_text: typeof children === 'string' ? children : originalHref,
        link_destination: originalHref,
        is_external: isExternal,
        is_mailto: isMailto,
        is_tel: isTel,
        is_whatsapp: isWhatsApp,
        ...eventData
      });

      // Track Google Ads conversions for email, phone, and WhatsApp links
      if (isMailto) {
        trackEmailClick(eventLabel || 'link_click', '', {
          link_destination: originalHref,
          ...eventData
        });
      } else if (isTel) {
        trackPhoneReveal(eventLabel || 'link_click', {
          link_destination: originalHref,
          ...eventData
        });
      } else if (isWhatsApp) {
        trackWhatsAppClick(eventLabel || 'link_click', whatsappLink?.phoneNumber || '', {
          link_destination: originalHref,
          ...eventData
        }, {
          persistServerClick: false
        });
      }
    };

    // Contact-intent links should track immediately before navigation.
    if (isMailto || isTel || isWhatsApp) {
      performTracking();
    } else if ('requestIdleCallback' in window) {
      requestIdleCallback(performTracking);
    } else {
      setTimeout(performTracking, 0);
    }

    // Call the original onClick handler immediately (don't block user interaction)
    if (onClick) {
      onClick(e);
    }
  };

  // Determine additional props based on link type
  const renderedHref = originalHref && (originalHref.includes('wa.me') || originalHref.includes('api.whatsapp.com'))
    ? buildTrackedWhatsAppHref({
        href: originalHref,
        eventLabel: eventLabel || 'link_click'
      })
    : originalHref;
  const linkProps = {
    href: renderedHref,
    className,
    onClick: handleClick,
    'data-analytics-handled': 'true',
    'data-analytics-label': eventLabel || '',
    ...props
  };

  // For external links, add target and rel attributes (check for window to avoid SSR error)
  if (originalHref && originalHref.startsWith('http') && typeof window !== 'undefined' && !originalHref.includes(window.location.hostname)) {
    linkProps.target = '_blank';
    linkProps.rel = 'noopener noreferrer';
  }

  return (
    <a {...linkProps}>
      {children}
    </a>
  );
}

// Phone number component with analytics
export function AnalyticsPhoneLink({ 
  phoneNumber, 
  displayText,
  location = 'general',
  className = '' 
}) {
  const handlePhoneClick = () => {
    trackPhoneReveal(location);
  };

  return (
    <a 
      href={`tel:${phoneNumber}`}
      className={className}
      onClick={handlePhoneClick}
      data-analytics-handled="true"
    >
      {displayText || phoneNumber}
    </a>
  );
}

// Social media link component
export function AnalyticsSocialLink({ 
  platform, 
  href, 
  children, 
  className = '' 
}) {
  const handleSocialClick = () => {
    trackSocialClick(platform);
  };

  return (
    <a 
      href={href}
      className={className}
      onClick={handleSocialClick}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-handled="true"
    >
      {children}
    </a>
  );
}

// Service card component with analytics
export function AnalyticsServiceCard({ 
  serviceType, 
  serviceName, 
  children, 
  onClick,
  className = '' 
}) {
  const handleServiceClick = () => {
    trackServiceInteraction(serviceType, 'service_card_click', {
      service_name: serviceName
    });

    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={className}
      onClick={handleServiceClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleServiceClick();
        }
      }}
    >
      {children}
    </div>
  );
}

// Form wrapper with analytics
export function AnalyticsForm({ 
  children, 
  formName,
  onSubmit,
  className = '',
  ...props 
}) {
  const { trackFormSubmission } = useAnalytics();

  const handleSubmit = (e) => {
    // Get form data
    const formData = new FormData(e.target);
    const formDataObj = Object.fromEntries(formData.entries());

    // Track form submission
    trackFormSubmission(formName, formDataObj);

    // Call original onSubmit
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      className={className}
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
    </form>
  );
}

// Image gallery component with analytics
export function AnalyticsGallery({ 
  images, 
  galleryType,
  className = '',
  renderImage 
}) {
  const { trackEvent } = useAnalytics();

  const handleImageClick = (imageIndex, imageName) => {
    trackEvent('gallery_image_click', {
      event_category: 'engagement',
      gallery_type: galleryType,
      image_index: imageIndex,
      image_name: imageName,
      total_images: images.length,
      engagement_depth: Math.round(((imageIndex + 1) / images.length) * 100)
    });
  };

  return (
    <div className={className}>
      {images.map((image, index) => (
        <div 
          key={index}
          onClick={() => handleImageClick(index, image.name || `image_${index}`)}
        >
          {renderImage ? renderImage(image, index) : (
            <ResponsiveImage src={image.src} alt={image.alt} sizes={[25, 30, 35]} />
          )}
        </div>
      ))}
    </div>
  );
}
