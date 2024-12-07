import React from 'react'
import styles from './GreenBand.module.css'

export default function GreenBand() {
    const slugs = [
        "20+ ans et plus d'expérience professionnelle",
        "De nombreux clients satisfaits et reconnaissants",
        "Services de nettoyage haut de gamme"
    ]

    return (
        <div className={styles.greenBand}>
            <div className={styles.container}>
                <div className={styles.animated}>
                    {[...slugs, ...slugs].map((slug, index) => (
                        <React.Fragment key={index}>
                            <h3 className={styles.text}>{slug}</h3>
                            <strong className={styles.separator}>*</strong>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}