'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const content = {
    success: {
      icon: '✅',
      title: 'Inscription confirmée !',
      message: 'Merci ! Votre adresse email a été vérifiée avec succès. Vous recevrez prochainement nos newsletters avec des conseils d\'experts, nos nouveautés et des offres exclusives.',
    },
    already: {
      icon: '📧',
      title: 'Déjà confirmé',
      message: 'Votre adresse email est déjà vérifiée. Vous êtes bien inscrit(e) à notre newsletter.',
    },
    error: {
      icon: '❌',
      title: 'Lien invalide',
      message: 'Ce lien de vérification est invalide ou a expiré. Veuillez vous réinscrire à la newsletter.',
    },
  };

  const current = content[status] || content.error;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>{current.icon}</div>
        <h1 className={styles.title}>{current.title}</h1>
        <p className={styles.message}>{current.message}</p>
        <Link href="/" className={styles.homeLink}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default function NewsletterConfirmed() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>⏳</div>
          <h1 className={styles.title}>Vérification en cours...</h1>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
