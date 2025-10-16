import React from 'react'
import Link from 'next/link'
import styles from './relatedArticles.module.css'

export default function RelatedArticles({ articles, sectionTitle = "Articles liés" }) {
    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{sectionTitle}</h2>
                    <p className={styles.subtitle}>
                        Découvrez nos guides d'expert et conseils professionnels
                    </p>
                </div>

                <div className={styles.articlesGrid}>
                    {articles.map((article, index) => (
                        <article key={index} className={styles.articleCard}>
                            <Link href={article.link} className={styles.cardLink}>
                                <div className={styles.cardContent}>
                                    <div className={styles.articleMeta}>
                                        <span className={styles.category}>{article.category}</span>
                                        <span className={styles.readTime}>5 min de lecture</span>
                                    </div>
                                    
                                    <h3 className={styles.articleTitle}>{article.title}</h3>
                                    <p className={styles.articleExcerpt}>{article.excerpt}</p>
                                    
                                    <div className={styles.articleFooter}>
                                        <div className={styles.tags}>
                                            {article.tags && article.tags.map((tag, tagIndex) => (
                                                <span key={tagIndex} className={styles.tag}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <span className={styles.readMore}>
                                            Lire l'article →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>

                <div className={styles.viewAllContainer}>
                    <Link href="/conseils" className={styles.viewAllButton}>
                        Voir tous les conseils
                    </Link>
                </div>
            </div>
        </section>
    )
}