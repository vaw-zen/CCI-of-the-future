'use client';

import { useAnalytics } from '../../../hooks/useAnalytics';
import { trackServiceInteraction, trackPhoneReveal, trackSocialClick, SERVICE_TYPES } from '../../analytics';

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
    // Track the analytics event
    trackEvent(eventName, {
      event_category: eventCategory,
      event_label: eventLabel || children,
      button_text: children,
      page_location: window.location.href
    });

    // Call the original onClick handler
    if (onClick) {
      onClick(e);
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
  className = '',
  ...props 
}) {
  const { trackEvent } = useAnalytics();

  const handleClick = (e) => {
    // Determine if it's an external link
    const isExternal = href && (
      href.startsWith('http') && 
      !href.includes(window.location.hostname)
    );

    // Track the analytics event
    trackEvent(eventName, {
      event_category: isExternal ? 'outbound' : eventCategory,
      event_label: eventLabel || href,
      link_text: children,
      link_destination: href,
      is_external: isExternal
    });

    // Call the original onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a 
      href={href}
      className={className} 
      onClick={handleClick} 
      {...props}
    >
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
            <img src={image.src} alt={image.alt} />
          )}
        </div>
      ))}
    </div>
  );
}