import React from 'react'
import { CuidaOpenInNewTabOutline } from '@/utils/components/icons'
import content from './equipements.json'
import styles from './equipements.module.css'

export default function Equipements() {
  return (
    <section className={styles.equipements} aria-labelledby="about-equipements-title">
      <div className={styles.intro}>
        <span className={styles.eyebrow}>{content.eyebrow}</span>
        <h2 id="about-equipements-title">{content.heading}</h2>
        <p>{content.body}</p>
        <div className={styles.proofs} aria-label="Garanties équipement">
          {content.proofs.map((proof) => (
            <span className={styles.proof} key={proof}>{proof}</span>
          ))}
        </div>
      </div>
      <div className={styles.panel}>
        <div className={styles.suppliers}>
          {content.suppliers.map((supplier) => (
            <article className={styles.card} key={supplier.name}>
              <div className={styles.cardHeader}>
                <h3>{supplier.name}</h3>
                <a className={styles.link} href={supplier.website} target="_blank" rel="noopener noreferrer" aria-label={`Visiter le site ${supplier.name}`}>
                  <CuidaOpenInNewTabOutline className={styles.icon} />
                </a>
              </div>
              <p>{supplier.description}</p>
              <span className={styles.badge}>{supplier.badge}</span>
            </article>
          ))}
        </div>
        <p className={styles.note}>{content.note}</p>
      </div>
    </section>
  )
}
