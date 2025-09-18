import React from 'react'
import content from './about.json'
import styles from './about.module.css'
import pageStyles from '../../home.module.css'
import { IconoirArrowUpRight } from '@/utils/components/icons'
import Link from 'next/link'
import BlurBox from '@/utils/components/BlurBox/BlurBox'
import ResponsiveImage from '@/utils/components/Image/Image'

export default function About() {
    return (
        <section className={styles.section}>
            <BlurBox className={styles.BlurBox} />
            <div className={styles.flexContainer}>

                <ResponsiveImage src={content.img}
                    skeleton
                    alt="about us"
                    sizes={[40, 50,97]}
                    className={styles.image} />
            </div>
            <div className={styles.contentContainer}>
                <h2 className={pageStyles.slug}>{content.slug}</h2>
                <h3 className={pageStyles.highlight}>{content.highlight}</h3>
                <p className={styles.paragraph}>{content.paragraph}</p>
                <ul className={styles.list}>
                    {content.list.map((text, index) => (
                        <li key={index} className={styles.listItem}>
                            <span className={styles.bullet}>O</span>
                            {text}
                        </li>
                    ))}
                </ul>
                <Link href='/' className={styles.circleContainer} aria-label="En savoir plus sur nos services">
                    <IconoirArrowUpRight className={styles.arrow} />
                </Link>
            </div>
        </section>
    )
}