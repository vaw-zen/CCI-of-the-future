'use client';

import { useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

/**
 * Custom hook for handling email click functionality with enhanced mailto support
 * Addresses Chrome's profile selector interference and provides fallback options
 */
export const useEmailClick = () => {
  const { trackEvent } = useAnalytics();

  /**
   * Check if the user's browser is Chrome
   */
  const isChrome = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  }, []);

  /**
   * Create a properly formatted mailto URL
   */
  const createMailtoUrl = useCallback((email, subject = '', body = '') => {
    let url = `mailto:${email}`;
    const params = [];
    
    if (subject) {
      params.push(`subject=${encodeURIComponent(subject)}`);
    }
    
    if (body) {
      params.push(`body=${encodeURIComponent(body)}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return url;
  }, []);

  /**
   * Enhanced mailto handler to bypass Chrome's profile selector
   */
  const handleMailtoClick = useCallback((mailtoUrl, fallbackEmail = null, fallbackSubject = null, analyticsLabel = '') => {
    return (e) => {
      console.log('Email click handler called:', mailtoUrl);
      
      // Track analytics event
      if (trackEvent) {
        trackEvent('email_click', {
          event_category: 'conversion',
          event_label: analyticsLabel || 'email_contact',
          email_address: fallbackEmail,
          page_location: typeof window !== 'undefined' ? window.location.href : '',
          is_mailto: true
        });
      }

      e.preventDefault();
      
      // Try multiple approaches to ensure mailto works
      try {
        // Method 1: Direct window.location (most reliable)
        if (typeof window !== 'undefined') {
          window.location.href = mailtoUrl;
        }
      } catch (error) {
        console.warn('Direct window.location failed, trying fallback methods');
        
        try {
          // Method 2: Create temporary link and programmatically click it
          if (typeof document !== 'undefined') {
            const tempLink = document.createElement('a');
            tempLink.href = mailtoUrl;
            tempLink.style.display = 'none';
            tempLink.target = '_self';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
          }
        } catch (fallbackError) {
          console.error('All automatic methods failed:', fallbackError);
          
          // Method 3: Show user a helpful dialog
          const emailMatch = mailtoUrl.match(/mailto:([^?]+)/);
          const email = emailMatch ? emailMatch[1] : fallbackEmail;
          const subject = fallbackSubject || 'Contact Request';
          
          const message = `Pour nous contacter par email:\n\n` +
                         `📧 Adresse: ${email}\n` +
                         `📝 Sujet: ${subject}\n\n` +
                         `Si votre client email ne s'ouvre pas automatiquement, ` +
                         `copiez cette adresse et ouvrez votre application email manuellement.\n\n` +
                         `Vous pouvez aussi nous joindre directement par WhatsApp ou téléphone.`;
          
          if (typeof window !== 'undefined') {
            alert(message);
            
            // Optional: Copy email to clipboard if possible
            if (navigator.clipboard && email) {
              navigator.clipboard.writeText(email).catch(() => {
                console.log('Could not copy email to clipboard');
              });
            }
          }
        }
      }
    };
  }, [trackEvent]);

  /**
   * Chrome-specific mailto handler with iframe approach
   */
  const handleMailtoClickForChrome = useCallback((mailtoUrl, fallbackEmail = null, analyticsLabel = '') => {
    return (e) => {
      e.preventDefault();
      
      // Track analytics event
      if (trackEvent) {
        trackEvent('email_click_chrome', {
          event_category: 'conversion',
          event_label: analyticsLabel || 'email_contact_chrome',
          email_address: fallbackEmail,
          browser: 'chrome',
          is_mailto: true
        });
      }
      
      if (isChrome()) {
        // For Chrome, try iframe approach to bypass profile selector
        try {
          if (typeof document !== 'undefined') {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = mailtoUrl;
            document.body.appendChild(iframe);
            
            // Clean up after a short delay
            setTimeout(() => {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            }, 1000);
          }
        } catch (error) {
          console.warn('Chrome iframe method failed, using standard approach');
          if (typeof window !== 'undefined') {
            window.location.href = mailtoUrl;
          }
        }
      } else {
        // For other browsers, use standard approach
        if (typeof window !== 'undefined') {
          window.location.href = mailtoUrl;
        }
      }
    };
  }, [trackEvent, isChrome]);

  /**
   * Simple mailto handler with window.open approach
   */
  const handleMailtoClickSimple = useCallback((mailtoUrl, analyticsLabel = '') => {
    return (e) => {
      e.preventDefault();
      
      // Track analytics event
      if (trackEvent) {
        trackEvent('email_click_simple', {
          event_category: 'conversion',
          event_label: analyticsLabel || 'email_contact_simple',
          is_mailto: true
        });
      }
      
      // Use window.open with _self to avoid popup blockers
      try {
        if (typeof window !== 'undefined') {
          window.open(mailtoUrl, '_self');
        }
      } catch (error) {
        console.error('window.open failed:', error);
        // Fallback to direct assignment
        if (typeof window !== 'undefined') {
          window.location.href = mailtoUrl;
        }
      }
    };
  }, [trackEvent]);

  /**
   * Create email click handler with contact data
   */
  const createEmailHandler = useCallback((email, subject = '', body = '', analyticsLabel = '') => {
    const mailtoUrl = createMailtoUrl(email, subject, body);
    return handleMailtoClick(mailtoUrl, email, subject, analyticsLabel);
  }, [createMailtoUrl, handleMailtoClick]);

  /**
   * Create email click handler optimized for Chrome
   */
  const createChromeEmailHandler = useCallback((email, subject = '', body = '', analyticsLabel = '') => {
    const mailtoUrl = createMailtoUrl(email, subject, body);
    return handleMailtoClickForChrome(mailtoUrl, email, analyticsLabel);
  }, [createMailtoUrl, handleMailtoClickForChrome]);

  /**
   * Get the appropriate email handler based on browser
   */
  const getOptimalEmailHandler = useCallback((email, subject = '', body = '', analyticsLabel = '') => {
    if (isChrome()) {
      return createChromeEmailHandler(email, subject, body, analyticsLabel);
    }
    return createEmailHandler(email, subject, body, analyticsLabel);
  }, [isChrome, createChromeEmailHandler, createEmailHandler]);

  return {
    // Core handlers
    handleMailtoClick,
    handleMailtoClickForChrome,
    handleMailtoClickSimple,
    
    // Convenience methods
    createEmailHandler,
    createChromeEmailHandler,
    getOptimalEmailHandler,
    
    // Utilities
    createMailtoUrl,
    isChrome,
    
    // Quick access for common contact
    handleContactEmail: (analyticsLabel = 'contact_email') => 
      createEmailHandler(
        'contact@cciservices.online',
        'Demande de devis pour services de nettoyage',
        'Bonjour, j\'aimerais obtenir des informations concernant vos services de nettoyage. J\'ai besoin d\'une aide pour [precisez le type de nettoyage, par exemple : nettoyage de bureau, nettoyage apres travaux, nettoyage de maison, etc.]. Pouvez-vous me fournir un devis et les details sur la disponibilité de vos services ?',
        analyticsLabel
      )
  };
};