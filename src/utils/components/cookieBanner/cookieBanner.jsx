'use client';

import Link from 'next/link';
import styles from './cookieBanner.module.css';
import { useCookieBannerLogic } from './cookieBanner.func';

export default function CookieBanner() {
  const { consentState, isOpen, handleAccept, handleReject } = useCookieBannerLogic();

  if (!isOpen) {
    return null;
  }

  const statusLabel = consentState.accepted
    ? 'Mesure d’audience autorisée'
    : consentState.rejected
      ? 'Mesure d’audience refusée'
      : 'Votre choix est requis';

  return (
    <aside className={styles.banner} aria-live="polite" role="dialog" aria-label="Préférences cookies">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Cookies & confidentialité</p>
        <p className={styles.status}>{statusLabel}</p>
      </div>

      <p className={styles.copy}>
        Nous utilisons des cookies de mesure d’audience pour comprendre les visites sur le site et améliorer l’expérience.
        Aucun script analytics, publicitaire ou pixel marketing n’est activé sans votre accord explicite.
      </p>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={handleAccept}>
          Accepter
        </button>
        <button type="button" className={styles.secondaryButton} onClick={handleReject}>
          Refuser
        </button>
        <Link href="/confidentialite#gerer-mes-cookies" className={styles.linkButton}>
          Politique de confidentialité
        </Link>
      </div>
    </aside>
  );
}
