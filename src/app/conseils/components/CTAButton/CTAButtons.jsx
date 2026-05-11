'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './CTAButtons.module.css';
import ctaButtonsData from './CTAButton.json';
import { LineMdPhoneTwotone, SiMailDuotone, ChatIcon } from '@/utils/components/icons';
import { AnalyticsLink } from '@/utils/components/analytics/AnalyticsComponents';
import { useAnalytics } from '@/hooks/useAnalytics';
import { trackCTAImpression } from '@/utils/analytics';

// Icon mapping
const iconMap = {
  '📞': LineMdPhoneTwotone,
  '📝': SiMailDuotone,
  '💬': ChatIcon
};

const ctaEventLabels = {
  phone: 'conseils_cta_phone',
  quote: 'conseils_cta_quote',
  whatsapp: 'conseils_cta_whatsapp'
};

const CTA_LOCATION = 'conseils_cta_section';
const CTA_CONTEXT = {
  page_type: 'other',
  business_line: 'content',
  content_type: 'article'
};

function getButtonAnalyticsData(buttonId, href) {
  return {
    cta_id: `conseils_${buttonId}_primary`,
    cta_location: CTA_LOCATION,
    cta_type: buttonId === 'quote' ? 'lead_cta' : 'contact',
    link_destination: href,
    ...CTA_CONTEXT
  };
}

// Single reusable button component
const CTAButton = ({ button }) => {
  const { trackEvent } = useAnalytics();
  const IconComponent = iconMap[button.icon];
  const eventLabel = ctaEventLabels[button.id] || `conseils_cta_${button.id}`;
  const analyticsData = getButtonAnalyticsData(button.id, button.href);

  const buttonContent = (
    <>
      {IconComponent && <IconComponent className={styles.icon} />}
      <span>{button.text}</span>
    </>
  );

  if (button.type === 'internal') {
    return (
      <Link
        href={button.href}
        className={styles.ctaButton}
        data-analytics-label={eventLabel}
        onClick={() => {
          trackEvent('cta_click', {
            event_category: 'content_cta',
            event_label: eventLabel,
            link_destination: button.href,
            page_location: typeof window !== 'undefined' ? window.location.href : '',
            ...analyticsData
          });
        }}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <AnalyticsLink
      href={button.href}
      className={styles.ctaButton}
      eventName="cta_click"
      eventCategory="content_cta"
      eventLabel={eventLabel}
      eventData={analyticsData}
    >
      {buttonContent}
    </AnalyticsLink>
  );
};

export default function CTAButtons() {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        ctaButtonsData.forEach((button) => {
          const analyticsData = getButtonAnalyticsData(button.id, button.href);
          trackCTAImpression({
            ctaText: button.text,
            ctaId: analyticsData.cta_id,
            ctaLocation: analyticsData.cta_location,
            ctaType: analyticsData.cta_type,
            additionalData: CTA_CONTEXT
          });
        });

        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {ctaButtonsData.map((button) => (
        <CTAButton key={button.id} button={button} />
      ))}
    </div>
  );
}
