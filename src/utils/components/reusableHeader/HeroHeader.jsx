import React from 'react'
import Image from 'next/image'
import styles from './HeroHeader.module.css'
import { LineMdHomeTwotone } from '../icons'

export default function HeroHeader({ title }) {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.backgroundImages}>
        <Image
          src="/contact/bg contact.jpg"
          alt="Background"
          fill
          style={{ objectFit: 'cover', objectPosition: 'left' }}
        />
        {/* <Image 
          src="/home/1-hero/linesGlow.webp" 
          alt="Glow Lines" 
          fill 
          style={{ 
            objectFit: 'contain', 
            objectPosition: 'bottom', 
            position: 'absolute',
            right: 0, 
            top: 0, 
            opacity: .6 ,
            height:"100%",
            
          }}
        /> */}
        <div className={styles.titleContainer}>
          <h1>{title}</h1>
          <div className={styles.resusableTitle}>
            <div className={styles.anchors}>
              <a href="#" className={styles.homeLinkIcon}>
                <LineMdHomeTwotone style={{ width: '2.1vh', height: '2.1vh' }} />
              </a>
              <a href="#" className={styles.pagetitleHomeLink}>Home</a>
            </div>
            <div>/</div>
            <div className={styles.highlightedTitle}>
              <h2>{title}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
