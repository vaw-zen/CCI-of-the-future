import React from 'react'
import content from './services.json'
import Image from 'next/image'
import Link from 'next/link'
import pageStyles from '../../home.module.css'
import BlurBox from '@/app/libs/components/BlurBox/BlurBox'
import styles from './services.module.css'

export default function Services() {
    return (
        <section className={styles.section}>
            <BlurBox className={styles.BlurBox} />
            <div className={styles.leftColumn}>
                <div className={styles.stickyContent}>
                    <h2 className={pageStyles.slug}>{content.slug}</h2>
                    <h3 className={pageStyles.highlight}>{content.highlight}</h3>
                    <button className={styles.button}>{content.button.name}</button>
                </div>
            </div>
            <div className={styles.rightColumn}>
                {content.list.map((service, index) => (
                    <article key={index} className={styles.serviceCard}>
                        <img
                            src={service.img}
                            alt="hello"
                            width={0}
                            height={0}
                            sizes="(max-width: 768px) 100vw, 30vw"
                            className={styles.serviceImage}
                        />
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