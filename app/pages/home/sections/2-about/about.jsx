import BlurBox from '@/app/libs/components/BlurBox/BlurBox'
import React from 'react'
import content from './about.json'
import styles from './about.module.css'
import Image from 'next/image'

export default function About() {
    return (
        <section className={styles.section}>
            <BlurBox top={[0]} left={['82.5vw']} />
            <div className={styles.flexContainer}>
                <Image
                    src="/home/about.png"
                    alt="about"
                    width={0}
                    height={0}
                    sizes="50vw"
                    style={{
                        width: '100%',
                        height: '32.916vw',
                        objectFit: 'cover'
                    }}
                />
            </div>
            <div className={styles.contentContainer}>
                <h1 className={styles.slug}>{content.slug}</h1>
                <h2 className={styles.highlight}>{content.highlight}</h2>
                <p className={styles.paragraph}>{content.paragraph}</p>
                <ul className={styles.list}>
                    {content.list.map((text, index) => (
                        <li key={index} className={styles.listItem}>
                            <span className={styles.bullet}>O</span>
                            {text}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}