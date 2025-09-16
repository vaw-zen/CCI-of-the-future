import React from 'react'
import styles from './refrences.module.css'
import Link from 'next/link'
import { UilArrowRight } from '@/utils/components/icons'
import content from './refrences.json'
import ResponsiveImage from '@/utils/components/Image/Image'

export default function Refrences({ className }) {
  const refrences = [null, ...content, null]

  return (
    <section className={`${styles.refrencesGrid} ${className}`}>
      {refrences.map((refrence, index) => (
        <div key={index} className={styles.refrenceCell}>
          {!index ? (
            <h2 className={styles.heading}>
              Découvrez nos références<br />Gages d'expertise.
            </h2>
          ) : index === 7 ? (
            <Link href='/' className={styles.refrenceLink}>
              Devenez refrence
              <UilArrowRight className={styles.arrow} />
            </Link>
          ) : (
            <a href={refrence.link} target="_blank" rel="noopener noreferrer" className={styles.refrenceSiteLink}>
              <ResponsiveImage
                sizes={[10, 30, 56]}
                src={refrence.img}
                className={styles.refrenceImage}
                alt={`refrence ${index}`}
                skeleton
                title={refrence.title}
                contain
              />
            </a>
          )}
        </div>
      ))}
    </section>
  )
}