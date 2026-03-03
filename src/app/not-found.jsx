import Link from 'next/link'
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <>
      <HeroHeader title="404 — Page non trouvée" />
      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>404 — Page non trouvée</h1>
          <p className={styles.desc}>
            La page que vous recherchez n'existe pas ou a été déplacée. Essayez l'accueil ou contactez-nous pour obtenir de l'aide.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.btn}>Accueil</Link>
            <Link href="/devis" className={`${styles.btn} ${styles.btnPrimary}`}>Demander un devis</Link>
          </div>
        </div>
      </main>
    </>
  )
}
