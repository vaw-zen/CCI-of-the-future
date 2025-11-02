'use client';

import Link from 'next/link';
import { 
  trackTableOfContentsClick, 
  trackBreadcrumbClick, 
  trackArticleNavigation,
  trackBackToConseilsClick 
} from '@/utils/analytics';
import styles from './article.module.css';

/**
 * Breadcrumbs component with tracking
 */
export function TrackedBreadcrumbs({ article }) {
  const handleBreadcrumbClick = (text, href, position) => {
    trackBreadcrumbClick(text, href, position);
  };

  return (
    <nav className={styles.breadcrumbs}>
      <Link 
        href="/"
        onClick={() => handleBreadcrumbClick('Accueil', '/', 1)}
      >
        Accueil
      </Link>
      <span>›</span>
      <Link 
        href="/conseils"
        onClick={() => handleBreadcrumbClick('Conseils', '/conseils', 2)}
      >
        Conseils
      </Link>
      <span>›</span>
      <span>{article.categoryLabel}</span>
      <span>›</span>
      <span>{article.title}</span>
    </nav>
  );
}

/**
 * Table of contents with tracking
 */
export function TrackedTableOfContents({ articleTitle }) {
  const handleTocClick = (sectionId, sectionTitle) => {
    trackTableOfContentsClick(sectionId, sectionTitle, articleTitle);
  };

  const tocItems = [
    { id: 'pourquoi-nettoyer-professionnellement', title: 'Pourquoi nettoyer professionnellement ?' },
    { id: 'methode-injection-extraction', title: 'Méthode injection-extraction' },
    { id: 'types-nettoyage', title: 'Types de nettoyage' },
    { id: 'tarifs-nettoyage-2025', title: 'Tarifs 2025' },
    { id: 'zones-intervention', title: 'Zones d\'intervention' },
    { id: 'quand-nettoyer', title: 'Quand nettoyer ?' },
    { id: 'choisir-professionnel', title: 'Choisir son professionnel' },
    { id: 'entretien-quotidien', title: 'Entretien quotidien' },
    { id: 'faq', title: 'Questions fréquentes' },
    { id: 'urgences', title: 'Interventions d\'urgence' }
  ];

  return (
    <nav className={styles.tableOfContents}>
      <h3>📋 Sommaire</h3>
      <ul>
        {tocItems.map(item => (
          <li key={item.id}>
            <a 
              href={`#${item.id}`}
              onClick={() => handleTocClick(item.id, item.title)}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Article navigation (prev/next) with tracking
 */
export function TrackedArticleNav({ prevArticle, nextArticle }) {
  const handleNavClick = (direction, article) => {
    trackArticleNavigation(direction, {
      title: article.title,
      slug: article.slug,
      category: article.category
    });
  };

  return (
    <nav className={styles.articleNav}>
      {prevArticle && (
        <Link 
          href={`/conseils/${prevArticle.slug}`} 
          className={`${styles.navLink} ${styles.prev}`}
          onClick={() => handleNavClick('previous', prevArticle)}
        >
          <div className={styles.label}>← Article précédent</div>
          <div className={styles.title}>{prevArticle.title}</div>
        </Link>
      )}
      
      {nextArticle && (
        <Link 
          href={`/conseils/${nextArticle.slug}`} 
          className={`${styles.navLink} ${styles.next}`}
          onClick={() => handleNavClick('next', nextArticle)}
        >
          <div className={styles.label}>Article suivant →</div>
          <div className={styles.title}>{nextArticle.title}</div>
        </Link>
      )}
    </nav>
  );
}

/**
 * Back to conseils CTA with tracking
 */
export function TrackedBackToCTA({ articleTitle, articleCategory }) {
  const handleBackClick = () => {
    trackBackToConseilsClick(articleTitle, articleCategory);
  };

  return (
    <div style={{
      textAlign: 'center',
      marginTop: '50px',
      padding: '30px',
      background: 'var(--bg-elevated)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ marginBottom: '20px', color: 'var(--t-primary)' }}>
        Découvrez Nos Autres Guides
      </h3>
      <Link 
        href="/conseils"
        onClick={handleBackClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--ac-primary)',
          color: 'var(--bg-base)',
          padding: '12px 25px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'transform 0.2s'
        }}
      >
        📚 Tous les Conseils & Guides
      </Link>
    </div>
  );
}
