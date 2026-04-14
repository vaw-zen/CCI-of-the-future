'use client';

import styles from './CookiePreferencesCard.module.css';
import { useCookiePreferencesCardLogic } from './CookiePreferencesCard.func';

export default function CookiePreferencesCard() {
  const { consentState, handleOpenBanner } = useCookiePreferencesCardLogic();

  const summary = consentState.accepted
    ? 'Vous avez déjà autorisé la mesure d’audience et les outils marketing optionnels depuis la bannière cookies.'
    : consentState.rejected
      ? 'Vous avez déjà refusé les cookies optionnels depuis la bannière. Aucun script analytics ou marketing ne sera chargé.'
      : 'Aucun choix n’a encore été enregistré. Les scripts optionnels restent bloqués tant que vous n’avez pas répondu à la bannière cookies.';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Gérer mes cookies</p>
        <p className={styles.summary}>{summary}</p>
        <p className={styles.note}>
          Le consentement est enregistré directement quand l’utilisateur clique sur <strong>Accepter</strong> ou <strong>Refuser</strong> dans la bannière.
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={handleOpenBanner}>
          Modifier mon choix dans la bannière
        </button>
      </div>
    </div>
  );
}
