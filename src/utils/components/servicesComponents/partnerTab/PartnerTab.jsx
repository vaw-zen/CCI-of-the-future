'use client'
import React, { useState } from 'react'
import styles from './partnerTab.module.css'

const tabImages = {
  mission: '/mission.jpg',
  vision: '/vision.jpg',
  philosophy: '/philosophy.jpg',
}

export default function PartnerTab({ tabData }) {
  const [activeTab, setActiveTab] = useState(tabData?.[0]?.id || '')

  return (
    <div className={styles.container}>
      <div className={styles.tabMenu}>
        {tabData.map((tab) => (
          <button 
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      
      <div className={styles.tabContent}>
        {tabData.map((tab,i) => (
          activeTab === tab.id && (
            <div 
              key={tab.id} 
              className={`${styles.tabPanel} ${i % 2 === 1 ? '' :styles.evenPanel}`}
            >
              <div className={styles.tabDesc}>
                <h2 className={styles.tabTitle}>{tab.title}</h2>
                <div className={styles.tabText}>
                  <p>{tab.content}</p>
                </div>
              </div>
              <div className={styles.tabImage}>
                <img src={tabImages[tab.id]} alt={tab.title} />
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
