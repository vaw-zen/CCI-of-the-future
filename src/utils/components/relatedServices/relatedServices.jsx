import React from 'react'
import Link from 'next/link'
import styles from './relatedServices.module.css'

export default function RelatedServices({ services, sectionTitle = "Services liés" }) {
    if (!services || services.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{sectionTitle}</h2>
                    <p className={styles.subtitle}>
                        Découvrez nos services professionnels associés
                    </p>
                </div>

                <div className={styles.servicesGrid}>
                    {services.map((service, index) => (
                        <article key={index} className={styles.serviceCard}>
                            <Link href={service.link} className={styles.cardLink}>
                                <div className={styles.cardContent}>
                                    <div className={styles.serviceIcon}>
                                        {service.icon && (
                                            <img src={service.icon} alt="" className={styles.icon} />
                                        )}
                                    </div>
                                    
                                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                                    <p className={styles.serviceDescription}>{service.description}</p>
                                    
                                    <div className={styles.serviceFooter}>
                                        <span className={styles.ctaText}>
                                            {service.ctaText || "En savoir plus"}
                                        </span>
                                        <span className={styles.arrow}>→</span>
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>

                <div className={styles.viewAllContainer}>
                    <Link href="/services" className={styles.viewAllButton}>
                       Voir Tous Nos Services
                    </Link>
                </div>
            </div>
        </section>
    )
}