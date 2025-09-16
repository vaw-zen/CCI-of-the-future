import React from 'react'
import content from './services.json'
import Link from 'next/link'
import pageStyles from '../../home.module.css'
import styles from './services.module.css'
import BlurBox from '@/utils/components/BlurBox/BlurBox'
import ResponsiveImage from '@/utils/components/Image/Image'

export default function Services({ className = '' }) {
    return (
        <section className={`${styles.section} ${className}`}>
            <BlurBox className={styles.BlurBox} />
            <div className={styles.leftColumn}>
                <div className={styles.stickyContent}>
                    <h2 className={pageStyles.slug}>{content.slug}</h2>
                    <h3 className={pageStyles.highlight}>{content.highlight}</h3>
                    <button className={styles.button}><Link href='/'>{content.button.name}</Link></button>
                </div>
            </div>

            <div className={styles.rightColumn}>
                {content.list.map((service, index) => (
                    <article key={index} className={styles.serviceCard}>
                        <ResponsiveImage
                            skeleton
                            sizes={[9, 21, 40]}
                            className={styles.serviceImage}
                            src={service.img}
                            alt={service.title} 
                            title={service.title}/>

                        <div className={styles.serviceContent}>
                            <Link href={service.link} className={styles.serviceTitle}>
                                {service.title}
                            </Link>
                            <p className={styles.serviceDescription}>{service.desc}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}