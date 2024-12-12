import React from 'react'
import styles from './refrences.module.css'
import Link from 'next/link'
import { UilArrowRight } from '@/utils/components/icons'
import content from './refrences.json'
import Image from 'next/image'

export default function Refrences() {
  const refrences = [null, ...content, null]

  return (
    <section className={styles.refrencesGrid}>
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
            <Link href={refrence.link} target='_blank' className={styles.refrenceSiteLink}>
              <Image
                width={0}
                height={0}
                sizes="(max-width: 768px) 30vw, 75vw"
                src={refrence.img}
                className={styles.refrenceImage}
                alt={`refrence ${index}`}
              />
            </Link>
          )}
        </div>
      ))}
    </section>
  )
}