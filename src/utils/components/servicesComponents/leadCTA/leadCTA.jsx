'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './leadCTA.module.css';
import { trackCTAClick, trackWhatsAppClick, trackPhoneReveal, trackCTAImpression } from '@/utils/analytics';
import { buildTrackedWhatsAppHref } from '@/libs/whatsappTracking.mjs';

const WhatsAppIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const PhoneIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClipboardIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

/**
 * Lead generation CTA block for service pages (tapis, salon, etc.)
 * Includes WhatsApp, Devis, Phone buttons + sticky mobile bar
 * 
 * @param {string} serviceName - Display name (e.g., "Nettoyage Salon")
 * @param {string} serviceType - Analytics type (e.g., "salon", "tapis")
 * @param {string} pricing - Pricing text (e.g., "dès 15 DT/place")
 * @param {string} whatsappMessage - Pre-filled WhatsApp message
 */
export default function LeadCTA({ 
  serviceName = "Nettoyage", 
  serviceType = "general",
  pricing = "",
  whatsappMessage = "Bonjour, je souhaite un devis gratuit pour un nettoyage. Merci !"
}) {
  const sectionRef = useRef(null);
  const ctaContext = {
    page_type: 'service_page',
    business_line: 'b2c',
    service_type: serviceType
  };
  const ctaLocation = 'service_cta_block';
  const whatsappCtaId = 'service_whatsapp_primary';
  const quoteCtaId = 'service_quote_primary';
  const phoneCtaId = 'service_phone_primary';

  useEffect(() => {
    const impressionContext = {
      page_type: 'service_page',
      business_line: 'b2c',
      service_type: serviceType
    };

    // Track CTA impression when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackCTAImpression({
            ctaText: 'WhatsApp',
            ctaId: whatsappCtaId,
            ctaLocation,
            ctaType: 'contact',
            additionalData: impressionContext
          });
          trackCTAImpression({
            ctaText: 'Devis Gratuit',
            ctaId: quoteCtaId,
            ctaLocation,
            ctaType: 'lead_cta',
            additionalData: impressionContext
          });
          trackCTAImpression({
            ctaText: 'Appeler',
            ctaId: phoneCtaId,
            ctaLocation,
            ctaType: 'contact',
            additionalData: impressionContext
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [serviceType]);

  const whatsappUrl = `https://wa.me/21698557766?text=${encodeURIComponent(whatsappMessage)}`;
  const whatsappEventLabel = whatsappCtaId;
  const trackedWhatsAppUrl = buildTrackedWhatsAppHref({
    href: whatsappUrl,
    eventLabel: whatsappEventLabel
  });
  const phoneUrl = 'tel:+21698557766';

  const handleWhatsAppClick = () => {
    trackWhatsAppClick(whatsappCtaId, '+21698557766', {
      ...ctaContext,
      cta_id: whatsappCtaId,
      cta_location: ctaLocation,
      cta_type: 'contact'
    }, {
      persistServerClick: false
    });
    trackCTAClick({
      ctaText: 'WhatsApp',
      ctaId: whatsappCtaId,
      ctaLocation,
      ctaType: 'contact',
      ctaDestination: whatsappUrl,
      value: 5,
      additionalData: ctaContext
    });
  };

  const handleDevisClick = () => {
    trackCTAClick({
      ctaText: 'Devis Gratuit',
      ctaId: quoteCtaId,
      ctaLocation,
      ctaType: 'lead_cta',
      ctaDestination: '/devis',
      value: 3,
      additionalData: ctaContext
    });
  };

  const handlePhoneClick = () => {
    trackPhoneReveal(phoneCtaId, {
      ...ctaContext,
      cta_id: phoneCtaId,
      cta_location: ctaLocation,
      cta_type: 'contact'
    });
    trackCTAClick({
      ctaText: 'Appeler',
      ctaId: phoneCtaId,
      ctaLocation,
      ctaType: 'contact',
      ctaDestination: phoneUrl,
      value: 5,
      additionalData: ctaContext
    });
  };

  return (
    <>
      <section ref={sectionRef} className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          Besoin d&apos;un <span className={styles.ctaHighlight}>{serviceName}</span> ?
        </h2>
        <p className={styles.ctaSubtitle}>
          Devis gratuit en 2 minutes, sans engagement. Intervention rapide dans tout le Grand Tunis.
        </p>

        {pricing && (
          <div className={styles.ctaPricing}>
            À partir de <span>{pricing}</span>
          </div>
        )}

        <div className={styles.ctaButtons}>
          <a 
            href={trackedWhatsAppUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className={`${styles.ctaBtn} ${styles.ctaBtnWhatsapp}`}
            onClick={handleWhatsAppClick}
            data-analytics-handled="true"
            data-analytics-label={whatsappEventLabel}
            title={`Demander un devis ${serviceName} via WhatsApp`}
          >
            <WhatsAppIcon className={styles.ctaBtnIcon} />
            WhatsApp
          </a>

          <Link 
            href="/devis" 
            className={`${styles.ctaBtn} ${styles.ctaBtnDevis}`}
            onClick={handleDevisClick}
            title={`Simuler votre devis ${serviceName}`}
          >
            <ClipboardIcon className={styles.ctaBtnIcon} />
            Devis Gratuit
          </Link>

          <a 
            href={phoneUrl}
            className={`${styles.ctaBtn} ${styles.ctaBtnPhone}`}
            onClick={handlePhoneClick}
            data-analytics-handled="true"
            data-analytics-label={phoneCtaId}
            title="Appelez CCI Services maintenant"
          >
            <PhoneIcon className={styles.ctaBtnIcon} />
            98 557 766
          </a>
        </div>

        <div className={styles.ctaTrust}>
          <span className={styles.ctaTrustItem}>
            <CheckIcon /> Devis gratuit
          </span>
          <span className={styles.ctaTrustItem}>
            <CheckIcon /> Sans engagement
          </span>
          <span className={styles.ctaTrustItem}>
            <CheckIcon /> Réponse rapide
          </span>
        </div>
      </section>
    </>
  );
}
