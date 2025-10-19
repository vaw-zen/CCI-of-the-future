import React from 'react'
import content from './contentHub.json'
import Link from 'next/link'
import pageStyles from '../../home.module.css'
import styles from './contentHub.module.css'
import ResponsiveImage from '@/utils/components/Image/Image'

export default function ContentHub({ className = '' }) {
    return (
        <section className={`${styles.section} ${className}`}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={pageStyles.slug}>{content.slug}</h2>
                    <h3 className={pageStyles.highlight}>{content.highlight}</h3>
                    <p className={styles.description}>{content.description}</p>
                </div>

                <div className={styles.contentGrid}>
                    {content.contentTypes.map((contentType, index) => (
                        <article key={index} className={styles.contentCard}>
                            <Link href={contentType.link} className={styles.cardLink}>
                                <div className={styles.cardImage}>
                                    <ResponsiveImage
                                        skeleton
                                        sizes={[15, 30, 50]}
                                        className={styles.image}
                                        src={contentType.img}
                                        alt={contentType.title} 
                                        title={contentType.title}
                                    />
                                    <div className={styles.imageOverlay}>
                                        <span className={styles.viewMore}>Découvrir</span>
                                    </div>
                                </div>

                                <div className={styles.cardContent}>
                                    <h4 className={styles.cardTitle}>{contentType.title}</h4>
                                    <p className={styles.cardDescription}>{contentType.description}</p>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.articleCount}>{contentType.count}</span>
                                        <span className={styles.arrow}>→</span>
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>

                {/* Featured Articles Preview */}
                <div className={styles.featuredSection}>
                    <h4 className={styles.featuredTitle}>Nos Articles Populaires</h4>
                    <div className={styles.featuredGrid}>
                        {content.featuredArticles.map((article, index) => (
                            <Link key={index} href={article.link} className={styles.featuredCard}>
                                <div className={styles.featuredContent}>
                                    <span className={styles.featuredCategory}>{article.category}</span>
                                    <h5 className={styles.featuredArticleTitle}>{article.title}</h5>
                                    <p className={styles.featuredExcerpt}>{article.excerpt}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}