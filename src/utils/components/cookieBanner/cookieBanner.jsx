'use client';

import Link from 'next/link';
import styles from './cookieBanner.module.css';
import { useCookieBannerLogic } from './cookieBanner.func';

export default function CookieBanner() {
  const { consentState, isOpen, handleAcknowledge } = useCookieBannerLogic();

  if (!isOpen) {
    return null;
  }

  const statusLabel = consentState.hasAcknowledged
    ? 'Information déjà affichée'
    : 'Information importante';

  return (
    <aside className={styles.banner} aria-live="polite" role="dialog" aria-label="Préférences cookies">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Cookies & confidentialité</p>
        <p className={styles.status}>{statusLabel}</p>
      </div>

      <p className={styles.copy}>
        Nous utilisons des cookies de mesure d’audience pour comprendre les visites sur le site et améliorer l’expérience.
        Les outils analytics et de mesure peuvent être actifs dès votre navigation sur le site. Cette bannière sert à vous en informer.
      </p>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={handleAcknowledge}>
          J&apos;ai compris
        </button>
        <Link href="/confidentialite#gerer-mes-cookies" className={styles.linkButton}>
          Politique de confidentialité
        </Link>
      </div>
    </aside>
  );
}
