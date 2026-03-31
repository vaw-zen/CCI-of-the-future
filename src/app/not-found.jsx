"use client";

import Link from 'next/link'
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import { trackCTAClick } from '@/utils/analytics'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <>
      <HeroHeader title="404 — Page non trouvée" />
      <style>{`
        .responsive-padding { padding: 115px 0px; }
        @media (max-width: 900px) { .responsive-padding { padding: 60px 0px; } }
        @media (max-width: 600px) { .responsive-padding { padding: 0px 0px; } }
      `}</style>
      <div className="responsive-padding">
        <main className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>404 — Page non trouvée</h1>
            <p className={styles.desc}>
              La page que vous recherchez n&apos;existe pas ou a été déplacée. Essayez l&apos;accueil ou contactez-nous pour obtenir de l&apos;aide.
            </p>
            <div className={styles.actions}>
              <Link href="/" className={styles.btn}>Accueil</Link>
              <Link
                href="/devis"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => trackCTAClick('Demander un devis', '404_page', '/devis', 3)}
              >
                Demander un devis
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
