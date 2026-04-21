'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { trackRelatedServiceClick } from '@/utils/analytics';
import styles from './relatedServices.module.css'

export default function RelatedServices({ services, sectionTitle = "Services liés", sourceArticle = '' }) {
    const handleServiceClick = (service) => {
        trackRelatedServiceClick(service.title, service.link, sourceArticle);
    };
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
                            <Link 
                                href={service.link} 
                                className={styles.cardLink}
                                onClick={() => handleServiceClick(service)}
                            >
                                <div className={styles.cardContent}>
                                    <div className={styles.serviceIcon}>
                                        {service.icon && (
                                            <Image
                                                src={service.icon}
                                                alt=""
                                                fill
                                                sizes="(max-width: 480px) 6.07vw, (max-width: 1024px) 6.07vw, 1.56vw"
                                                className={styles.icon}
                                            />
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
