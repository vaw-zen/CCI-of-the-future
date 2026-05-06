'use client';

import styles from './CookiePreferencesCard.module.css';
import { useCookiePreferencesCardLogic } from './CookiePreferencesCard.func';

export default function CookiePreferencesCard() {
  const { consentState, handleOpenBanner } = useCookiePreferencesCardLogic();

  const summary = consentState.hasAcknowledged
    ? 'La notice cookies a déjà été affichée et reconnue. Les outils de mesure d’audience restent actifs pendant la navigation.'
    : 'La notice cookies n’a pas encore été reconnue. Les outils de mesure d’audience peuvent néanmoins être actifs dès votre navigation sur le site.';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Gérer mes cookies</p>
        <p className={styles.summary}>{summary}</p>
        <p className={styles.note}>
          La bannière a une fonction d’information et d’accusé de lecture. Elle n’active ni ne désactive les outils analytics.
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={handleOpenBanner}>
          Relire la notice
        </button>
      </div>
    </div>
  );
}
