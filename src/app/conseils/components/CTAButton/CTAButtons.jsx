'use client';

import Link from 'next/link';
import styles from './CTAButtons.module.css';
import ctaButtonsData from './CTAButton.json';
import { LineMdPhoneTwotone, SiMailDuotone, ChatIcon } from '@/utils/components/icons';
import { AnalyticsLink } from '@/utils/components/analytics/AnalyticsComponents';
import { useAnalytics } from '@/hooks/useAnalytics';

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

// Single reusable button component
const CTAButton = ({ button }) => {
  const { trackEvent } = useAnalytics();
  const IconComponent = iconMap[button.icon];
  const eventLabel = ctaEventLabels[button.id] || `conseils_cta_${button.id}`;

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
            page_location: typeof window !== 'undefined' ? window.location.href : ''
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
    >
      {buttonContent}
    </AnalyticsLink>
  );
};

export default function CTAButtons() {
  return (
    <div className={styles.container}>
      {ctaButtonsData.map((button) => (
        <CTAButton key={button.id} button={button} />
      ))}
    </div>
  );
}
