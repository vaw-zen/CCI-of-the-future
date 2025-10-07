'use client'
import React from 'react'
import styles from './partnerTab.module.css'
import { usePartnerTabLogic } from './partnerTab.func'

const tabImages = {
  mission: '/mission.jpg',
  vision: '/vision.jpg',
  philosophy: '/philosophy.jpg',
}

export default function PartnerTab({ tabData }) {
  const { activeTab, setActiveTab, selectorStyle, tabRefs } = usePartnerTabLogic(tabData)

  return (
    <div className={styles.container}>
      <div className={styles.tabMenu}>
        {tabData.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
        <div
          className={styles.selector}
          style={{
            left: `${selectorStyle.left}px`,
            width: `${selectorStyle.width}px`
          }}
        />
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
                <img src={tabImages[tab.id]} alt={tab.title} title={tab.title} />
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
