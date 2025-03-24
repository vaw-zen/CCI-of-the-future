import React from 'react'
import styles from './GreenBand.module.css'

export default function GreenBand({ className, ...props }) {
    const slugs = [
        "20+ ans et plus d'expérience professionnelle",
        "De nombreux clients satisfaits et reconnaissants",
        "Services de nettoyage haut de gamme"
    ]

    return (
        <div className={`${styles.greenBand} ${className || ''}`} {...props}>
            <div className={styles.container}>
                <div className={styles.animated}>
                    {[...slugs, ...slugs].map((slug, index) => (
                        <React.Fragment key={index}>
                            <div className={styles.text} aria-hidden="true" >{slug}</div>
                            <strong className={styles.separator}>*</strong>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}