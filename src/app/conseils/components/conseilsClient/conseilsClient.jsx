'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useConseilsLogic } from './conseilsClient.func';
import CTAButtons from '../CTAButton/CTAButtons';
import Tab from '@/utils/components/tab/tab';
import { LineMdCalendar } from '@/utils/components/icons';
import { formatDate, isWithin } from '@/libs/dateHelper/dateHelper';
import { trackArticleClick, trackCategoryFilter, trackConseilsView } from '@/utils/analytics';
import { useEffect } from 'react';
import styles from '../../conseils.module.css';
import localStyles from './conseilsClient.module.css';

export default function ConseilsClient() {
  const { activeFilter, filteredArticles, featuredArticles, filters, handleFilterClick } = useConseilsLogic();

  // Track when articles are displayed or filter changes
  useEffect(() => {
    const totalArticles = featuredArticles.length + filteredArticles.length;
    trackConseilsView(activeFilter, totalArticles);
  }, [activeFilter, featuredArticles.length, filteredArticles.length]);

  // Enhanced filter handler with tracking
  const handleFilterWithTracking = (filterKey) => {
    const filter = filters.find(f => f.key === filterKey);
    if (filter) {
      handleFilterClick(filterKey);
      
      // Track filter change
      trackCategoryFilter(filterKey, filter.label, 0); // Result count will be updated by useEffect
    }
  };

  // Track article click with metadata
  const handleArticleClick = (article, position, isFeatured = false) => {
    trackArticleClick({
      title: article.title,
      slug: article.slug,
      category: article.category,
      categoryLabel: article.categoryLabel,
      featured: isFeatured,
      position: position
    });
  };

  const getDisplayedDate = (date) => {
    if (!date) return '';

    // For recent dates (within 1 week), show relative format
    if (isWithin(date, { value: 1, unit: 'weeks' })) {
      return formatDate(date, false, true);
    }

    // For older dates, show French month name format
    return formatDate(date, false, true, { time: true });
  };

  return (
    <div className={styles.container}>
      {/* Filtres par catégorie */}
      <div className={styles.filters}>
        <Tab
          tabs={filters}
          activeTab={activeFilter}
          onTabChange={handleFilterWithTracking}
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
              / {filters.find(f => f.key === activeFilter)?.label}
            </span>
          )}
        </p>
      </div>

      {/* Grille d'articles */}
      <div className={styles.grid}>
        {/* Articles en vedette */}
        {featuredArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/conseils/${article.slug}`}
            className={`${styles.card} ${styles.featured}`}
            onClick={() => handleArticleClick(article, index, true)}
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
                <span>
                  <LineMdCalendar className={styles.icon} />
                  {getDisplayedDate(article.publishedDate)}
                </span>
                <span>⏱️ {article.readTime}</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Articles réguliers */}
        {filteredArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/conseils/${article.slug}`}
            className={styles.card}
            onClick={() => handleArticleClick(article, featuredArticles.length + index, false)}
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
                <span>
                  <LineMdCalendar className={styles.icon} />
                  {getDisplayedDate(article.publishedDate)}
                </span>
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