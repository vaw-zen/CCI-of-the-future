'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getAllArticles, getFeaturedArticles, getArticlesByCategory } from '../data/articles';
import CTAButtons from './CTAButtons';
import styles from '../conseils.module.css';

export default function ConseilsClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeFilter, setActiveFilter] = useState(categoryParam || 'all');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);

  const filters = [
    { key: 'all', label: '🔍 Tous les guides', category: null },
    { key: 'tapis', label: '🧽 Nettoyage Tapis', category: 'tapis' },
    { key: 'tapisserie', label: '🛋️ Nettoyage Tapisserie', category: 'tapisserie' },
    { key: 'marbre', label: '💎 Traitement Marbre', category: 'marbre' },
    { key: 'post-chantier', label: '🔧 Post-Chantier', category: 'post-chantier' }
  ];

  useEffect(() => {
    const allArticles = getAllArticles();
    
    if (activeFilter === 'all') {
      // Sort articles by date (newest first) and take the first 2 as featured
      const sortedArticles = [...allArticles].sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      const latestTwoFeatured = sortedArticles.slice(0, 2);
      const remainingArticles = sortedArticles.slice(2);
      
      setFeaturedArticles(latestTwoFeatured);
      setFilteredArticles(remainingArticles);
    } else {
      const categoryArticles = getArticlesByCategory(activeFilter);
      // Sort category articles by date and take the first 2 as featured if available
      const sortedCategoryArticles = [...categoryArticles].sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      const featuredFromCategory = sortedCategoryArticles.slice(0, Math.min(2, sortedCategoryArticles.length));
      const remainingFromCategory = sortedCategoryArticles.slice(featuredFromCategory.length);
      
      setFeaturedArticles(featuredFromCategory);
      setFilteredArticles(remainingFromCategory);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (categoryParam) {
      setActiveFilter(categoryParam);
    }
  }, [categoryParam]);

  const handleFilterClick = (filterKey) => {
    setActiveFilter(filterKey);
    
    // Mettre à jour l'URL sans rechargement de page
    const url = new URL(window.location);
    if (filterKey === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', filterKey);
    }
    window.history.pushState({}, '', url);
  };

  return (
    <div className={styles.container}>
      {/* Filtres par catégorie */}
      <div className={styles.filters}>
        {filters.map(filter => (
          <button
            key={filter.key}
            onClick={() => handleFilterClick(filter.key)}
            className={`${styles.filterBtn} ${activeFilter === filter.key ? styles.active : ''}`}
          >
            {filter.label}
          </button>
        ))}
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
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginTop: '60px'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          color: 'var(--t-primary)', 
          marginBottom: '15px' 
        }}>
          Besoin d'un Service Professionnel ?
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          color: 'var(--t-secondary)', 
          marginBottom: '30px',
          maxWidth: '600px',
          margin: '0 auto 30px'
        }}>
          Nos experts CCI Services sont à votre disposition pour tous vos besoins 
          de nettoyage et rénovation dans le Grand Tunis.
        </p>
        
        <CTAButtons />
      </div>
    </div>
  );
}