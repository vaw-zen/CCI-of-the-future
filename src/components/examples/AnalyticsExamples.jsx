'use client';

import { 
  AnalyticsButton, 
  AnalyticsPhoneLink, 
  AnalyticsLink, 
  AnalyticsServiceCard,
  AnalyticsForm 
} from '@/utils/components/analytics/AnalyticsComponents';
import { useAnalytics } from '@/hooks/useAnalytics';
import { trackServiceInteraction, trackQuoteProgress, SERVICE_TYPES } from '@/utils/analytics';

/**
 * Example component showing how to use analytics tracking throughout your app
 */
export default function AnalyticsExamples() {
  const { trackEvent, trackFormSubmission } = useAnalytics();

  // Example: Manual event tracking
  const handleCustomEvent = () => {
    trackEvent('custom_interaction', {
      event_category: 'user_engagement',
      event_label: 'example_button',
      custom_data: 'any_additional_info'
    });
  };

  // Example: Service-specific tracking
  const handleServiceInteraction = (serviceType) => {
    trackServiceInteraction(serviceType, 'service_interest', {
      source: 'homepage',
      interaction_type: 'card_click'
    });
  };

  return (
    <div>
      <h2>Analytics Implementation Examples</h2>
      
      {/* 1. PHONE LINKS - Automatically track phone number reveals/clicks */}
      <section>
        <h3>Phone Number Tracking</h3>
        
        {/* Header phone link */}
        <AnalyticsPhoneLink 
          phoneNumber="+21698557766"
          displayText="📞 +216 98-557-766"
          location="header"
          className="phone-link"
        />
        
        {/* Contact page phone link */}
        <AnalyticsPhoneLink 
          phoneNumber="+21698557766"
          displayText="Appelez nous maintenant"
          location="contact_page"
          className="contact-phone-btn"
        />
      </section>

      {/* 2. EMAIL LINKS - Track email clicks */}
      <section>
        <h3>Email Link Tracking</h3>
        
        <AnalyticsLink 
          href="mailto:contact@cciservices.online"
          eventName="email_click"
          eventCategory="conversion"
          eventLabel="contact_email"
          className="email-link"
        >
          📧 contact@cciservices.online
        </AnalyticsLink>
      </section>

      {/* 3. SERVICE CARDS - Track service interest */}
      <section>
        <h3>Service Card Tracking</h3>
        
        <AnalyticsServiceCard 
          serviceType={SERVICE_TYPES.MARBRE}
          serviceName="Polissage Marbre"
          onClick={() => handleServiceInteraction(SERVICE_TYPES.MARBRE)}
          className="service-card"
        >
          <h4>Polissage et Cristallisation Marbre</h4>
          <p>Service professionnel de restauration marbre</p>
          <img src="/services/marbre.jpg" alt="Service marbre" />
        </AnalyticsServiceCard>

        <AnalyticsServiceCard 
          serviceType={SERVICE_TYPES.TAPIS}
          serviceName="Nettoyage Tapis"
          className="service-card"
        >
          <h4>Nettoyage Tapis & Moquettes</h4>
          <p>Méthode injection-extraction professionnelle</p>
          <img src="/services/tapis.jpg" alt="Service tapis" />
        </AnalyticsServiceCard>
      </section>

      {/* 4. BUTTONS - Track button interactions */}
      <section>
        <h3>Button Tracking</h3>
        
        {/* Quote request button */}
        <AnalyticsButton 
          eventName="quote_request"
          eventCategory="conversion"
          eventLabel="homepage_cta"
          onClick={() => {
            trackQuoteProgress('start', SERVICE_TYPES.MARBRE);
            // Handle quote request logic
          }}
          className="cta-button"
        >
          Demander un Devis Gratuit
        </AnalyticsButton>

        {/* Service page CTA */}
        <AnalyticsButton 
          eventName="service_cta_click"
          eventCategory="engagement"
          eventLabel="marbre_service_page"
          className="service-cta"
        >
          Voir nos Réalisations
        </AnalyticsButton>

        {/* Custom tracking button */}
        <AnalyticsButton 
          eventName="custom_interaction"
          eventCategory="user_engagement"
          eventLabel="example_interaction"
          onClick={handleCustomEvent}
          className="custom-button"
        >
          Action Personnalisée
        </AnalyticsButton>
      </section>

      {/* 5. FORMS - Track form submissions and progress */}
      <section>
        <h3>Form Tracking</h3>
        
        <AnalyticsForm 
          formName="contact_form"
          onSubmit={(e) => {
            e.preventDefault();
            // Handle form submission
            console.log('Contact form submitted with analytics tracking');
          }}
          className="contact-form"
        >
          <h4>Formulaire de Contact</h4>
          <input name="nom" type="text" placeholder="Votre nom" required />
          <input name="email" type="email" placeholder="Votre email" required />
          <select name="service_type">
            <option value="">Type de service</option>
            <option value="marbre">Marbre</option>
            <option value="tapis">Tapis</option>
            <option value="salon">Salon</option>
          </select>
          <textarea name="message" placeholder="Votre message"></textarea>
          
          <AnalyticsButton 
            type="submit"
            eventName="form_submit"
            eventCategory="conversion"
            eventLabel="contact_form"
            className="submit-button"
          >
            Envoyer la Demande
          </AnalyticsButton>
        </AnalyticsForm>

        {/* Quote form with progress tracking */}
        <AnalyticsForm 
          formName="quote_form"
          onSubmit={(e) => {
            e.preventDefault();
            trackQuoteProgress('submit', SERVICE_TYPES.TAPIS, {
              estimated_area: '25m2',
              location: 'Tunis'
            });
          }}
          className="quote-form"
        >
          <h4>Demande de Devis</h4>
          <input name="surface" type="number" placeholder="Surface en m²" />
          <input name="adresse" type="text" placeholder="Adresse" />
          
          <AnalyticsButton 
            type="submit"
            eventName="quote_submit"
            eventCategory="conversion"
            eventLabel="quick_quote"
            className="quote-submit"
          >
            Obtenir mon Devis
          </AnalyticsButton>
        </AnalyticsForm>
      </section>

      {/* 6. EXTERNAL LINKS - Automatically tracked as outbound */}
      <section>
        <h3>External Link Tracking</h3>
        
        <AnalyticsLink 
          href="https://www.facebook.com/Chaabanes.Cleaning.Intelligence/"
          eventName="social_click"
          eventCategory="social"
          eventLabel="facebook"
          className="social-link"
        >
          📘 Suivez-nous sur Facebook
        </AnalyticsLink>

        <AnalyticsLink 
          href="https://www.instagram.com/cci.services/"
          eventName="social_click"
          eventCategory="social"
          eventLabel="instagram"
          className="social-link"
        >
          📷 Instagram @cci.services
        </AnalyticsLink>
      </section>

      {/* 7. NAVIGATION LINKS - Track internal navigation */}
      <section>
        <h3>Navigation Tracking</h3>
        
        <AnalyticsLink 
          href="/services"
          eventName="navigation_click"
          eventCategory="navigation"
          eventLabel="services_page"
          className="nav-link"
        >
          Voir Tous nos Services
        </AnalyticsLink>

        <AnalyticsLink 
          href="/contact"
          eventName="navigation_click"
          eventCategory="navigation"
          eventLabel="contact_page"
          className="nav-link"
        >
          Nous Contacter
        </AnalyticsLink>
      </section>
    </div>
  );
}

/**
 * Example of how to use analytics in existing components
 */
export function ExistingComponentWithAnalytics() {
  const { trackEvent } = useAnalytics();

  const handleExistingButtonClick = () => {
    // Add analytics to existing functionality
    trackEvent('existing_button_click', {
      event_category: 'ui_interaction',
      event_label: 'legacy_component',
      page_section: 'hero'
    });

    // Your existing button logic here
    console.log('Existing button functionality preserved');
  };

  return (
    <div>
      <h3>Adding Analytics to Existing Components</h3>
      
      {/* Option 1: Add tracking to existing onClick */}
      <button onClick={handleExistingButtonClick} className="existing-button">
        Existing Button with Analytics
      </button>

      {/* Option 2: Replace with AnalyticsButton */}
      <AnalyticsButton 
        eventName="converted_button"
        eventCategory="ui_interaction"
        eventLabel="migrated_component"
        onClick={() => console.log('Converted to analytics button')}
        className="existing-button"
      >
        Converted Analytics Button
      </AnalyticsButton>
    </div>
  );
}