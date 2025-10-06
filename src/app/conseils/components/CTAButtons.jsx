'use client';

import Link from 'next/link';
import styles from './CTAButtons.module.css';
import ctaButtonsData from './CTAButton.json';

// Single reusable button component
const CTAButton = ({ button }) => {
  const buttonContent = (
    <>
      {button.icon} {button.text}
    </>
  );

  if (button.type === 'internal') {
    return (
      <Link href={button.href} className={styles.ctaButton}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <a href={button.href} className={styles.ctaButton}>
      {buttonContent}
    </a>
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