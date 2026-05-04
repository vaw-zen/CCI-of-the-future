import React from 'react'
import ResponsiveImage from '@/utils/components/Image/Image'
import content from './certifications.json'
import styles from './certifications.module.css'

export default function Certifications() {
  return (
    <section className={styles.certifications} aria-labelledby="about-certifications-title">
      <div className={styles.intro}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{content.eyebrow}</span>
          <h2 id="about-certifications-title">{content.heading}</h2>
        </div>
        <p>
          {content.bodyStart}{' '}
          <a className={styles.issuerLink} href={content.issuer.website} target="_blank" rel="noopener noreferrer">
            {content.issuer.name}
          </a>
          , {content.bodyEnd}
        </p>
      </div>
      <div className={styles.grid}>
        {content.certificates.map((certificate) => (
          <article className={styles.card} key={certificate.pdfSrc}>
            <a className={styles.imageLink} href={certificate.pdfSrc} target="_blank" rel="noopener noreferrer" aria-label={certificate.linkLabel}>
              <ResponsiveImage sizes={[31, 45, 94]} src={certificate.previewSrc} className={styles.image} alt={certificate.alt} skeleton contain quality={90} title={certificate.title} />
            </a>
            <div className={styles.caption}>
              <h3>{certificate.title}</h3>
              <p>{certificate.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
