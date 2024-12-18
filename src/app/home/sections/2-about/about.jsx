import React from 'react'
import content from './about.json'
import styles from './about.module.css'
import pageStyles from '../../home.module.css'
import Image from 'next/image'
import { IconoirArrowUpRight } from '@/utils/components/icons'
import Link from 'next/link'
import BlurBox from '@/utils/components/BlurBox/BlurBox'

export default function About() {
    return (
        <section className={styles.section}>
            <BlurBox className={styles.BlurBox} />
            <div className={styles.flexContainer}>
                <Image
                    src={content.img}
                    alt="about us"
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.image}
                />
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
                <Link href='/' className={styles.circleContainer} >
                    <IconoirArrowUpRight className={styles.arrow} />
                </Link>
            </div>
        </section>
    )
}