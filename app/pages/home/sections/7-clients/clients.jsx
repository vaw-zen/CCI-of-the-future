import React from 'react'
import styles from './clients.module.css'
import Link from 'next/link'
import { UilArrowRight } from '@/app/libs/components/icons'

export default function Clients() {
  return (
    <section className={styles.clientsGrid}>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className={styles.clientCell}>
          {!index ? (
            <h2 className={styles.heading}>
              Découvrez nos références<br />Gages d'expertise.
            </h2>
          ) : index === 7 ? (
            <Link href='/' className={styles.clientLink}>
              Devenez client
              <UilArrowRight className={styles.arrow} />
            </Link>
          ) : (
            <img 
              src={`/home/7-clients/${index}.webp`} 
              className={styles.clientImage} 
              alt={`Client ${index}`}
            />
          )}
        </div>
      ))}
    </section>
  )
}