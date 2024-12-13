import React from 'react'
import Image from 'next/image'
import styles from './HeroHeader.module.css'

export default function HeroHeader({ title}) {
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
              <svg 
  xmlns="http://www.w3.org/2000/svg" 
  style={{ width: '2.1vh', height: '2.1vh' }} 
  viewBox="0 0 24 24"
>
  <path fill="currentColor" fillOpacity={0} d="M6 8l6 -5l6 5v12h-2v-7l-1 -1h-6l-1 1v7h-2v-12Z">
    <animate fill="freeze" attributeName="fill-opacity" begin="1.1s" dur="0.15s" values="0;0.3"></animate>
  </path>
  <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
    <path strokeDasharray={16} strokeDashoffset={16} d="M5 21h14">
      <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="16;0"></animate>
    </path>
    <path strokeDasharray={14} strokeDashoffset={14} d="M5 21v-13M19 21v-13">
      <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.2s" dur="0.2s" values="14;0"></animate>
    </path>
    <path strokeDasharray={24} strokeDashoffset={24} d="M9 21v-8h6v8">
      <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="24;0"></animate>
    </path>
    <path strokeDasharray={28} strokeDashoffset={28} d="M2 10l10 -8l10 8">
      <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.6s" values="28;0"></animate>
    </path>
  </g>
</svg>

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
