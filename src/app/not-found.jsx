import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--padding-base)' }}>
      <div style={{ textAlign: 'center', maxWidth: 720 }}>
        <h1 style={{ marginBottom: 12 }}>404 — Page non trouvée</h1>
        <p style={{ color: 'var(--muted-color, #6b7280)', marginBottom: 20 }}>
          La page que vous recherchez n'existe pas ou a été déplacée. Essayez l'accueil ou contactez-nous pour obtenir de l'aide.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/" className="button">Accueil</Link>
          <Link href="/devis" className="button button--primary">Demander un devis</Link>
        </div>
      </div>
    </main>
  )
}
