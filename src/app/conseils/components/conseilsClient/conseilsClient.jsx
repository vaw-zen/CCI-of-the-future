'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useConseilsLogic } from './conseilsClient.func';
import CTAButtons from '../CTAButton/CTAButtons';
import Tab from '@/utils/components/tab/tab';
import styles from '../../conseils.module.css';
import localStyles from './conseilsClient.module.css';

export default function ConseilsClient() {
  const { activeFilter, filteredArticles, featuredArticles, filters, handleFilterClick } = useConseilsLogic();

  return (
    <div className={styles.container}>
      {/* Filtres par catégorie */}
      <div className={styles.filters}>
        <Tab
          tabs={filters}
          activeTab={activeFilter}
          onTabChange={handleFilterClick}
          className={styles.tabWrapper}
        />
      </div>

      {/* Compteur d'articles */}
      <div className={styles.articleCount}>
        <p>
          {featuredArticles.length + filteredArticles.length === 0 
            ? 'Aucun article trouvé' 
            : `${featuredArticles.length + filteredArticles.length} article${featuredArticles.length + filteredArticles.length > 1 ? 's' : ''} trouvé${featuredArticles.length + filteredArticles.length > 1 ? 's' : ''}`
          }
          {activeFilter !== 'all' && (
            <span className={styles.activeCategory}>
              • {filters.find(f => f.key === activeFilter)?.label}
            </span>
          )}
        </p>
      </div>

      {/* Grille d'articles */}
      <div className={styles.grid}>
        {/* Articles en vedette */}
        {featuredArticles.map(article => (
          <Link 
            key={article.id} 
            href={`/conseils/${article.slug}`}
            className={`${styles.card} ${styles.featured}`}
          >
            <div className={styles.imageWrapper}>
              <Image 
                src={article.image}
                alt={article.imageAlt || article.title}
                fill
                style={{ objectFit: 'cover' }}
              />
              <span className={styles.featuredBadge}>⭐ En Vedette</span>
              <span className={styles.category}>{article.categoryLabel}</span>
            </div>
            
            <div className={styles.content}>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              
              <div className={styles.meta}>
                <span>📅 {new Date(article.publishedDate).toLocaleDateString('fr-FR')}</span>
                <span>⏱️ {article.readTime}</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Articles réguliers */}
        {filteredArticles.map(article => (
          <Link 
            key={article.id} 
            href={`/conseils/${article.slug}`}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <Image 
                src={article.image}
                alt={article.imageAlt || article.title}
                fill
                style={{ objectFit: 'cover' }}
              />
              <span className={styles.category}>{article.categoryLabel}</span>
            </div>
            
            <div className={styles.content}>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              
              <div className={styles.meta}>
                <span>📅 {new Date(article.publishedDate).toLocaleDateString('fr-FR')}</span>
                <span>⏱️ {article.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Message si aucun article */}
      {featuredArticles.length === 0 && filteredArticles.length === 0 && (
        <div className={styles.noArticles}>
          <h3>Aucun article trouvé dans cette catégorie</h3>
          <p>Essayez un autre filtre ou consultez tous nos guides.</p>
          <button 
            onClick={() => handleFilterClick('all')}
            className={styles.resetFilter}
          >
            Voir tous les articles
          </button>
        </div>
      )}

      {/* Section CTA */}
      <div className={localStyles.ctaSection}>
        <h2 className={localStyles.ctaTitle}>
          Besoin d'un Service Professionnel ?
        </h2>
        <p className={localStyles.ctaDescription}>
          Nos experts CCI Services sont à votre disposition pour tous vos besoins
          de nettoyage et rénovation dans le Grand Tunis.
        </p>

        <CTAButtons />
      </div>
    </div>
  );
}