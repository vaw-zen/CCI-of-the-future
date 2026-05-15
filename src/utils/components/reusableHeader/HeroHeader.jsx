import React from 'react'
import Image from 'next/image'
import styles from './HeroHeader.module.css'
import { LineMdHomeTwotone } from '../icons'
import Link from 'next/link'

export default function HeroHeader({ title, subtitle, bgAlt }) {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.backgroundImages}>
        <Image
          src="/contact/bg contact.jpg"
          alt={bgAlt || `${title} - CCI Services Tunisie`}
          fill
          style={{ objectFit: 'cover', objectPosition: 'left' }}
        />
        <div className={styles.titleContainer}>
          <h1>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.title}>
            <Link href='/' className={styles.anchors}>
              <LineMdHomeTwotone className={styles.icon} />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span>{title}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
