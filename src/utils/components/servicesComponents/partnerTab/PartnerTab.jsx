'use client'
import React, { useState } from 'react'
import styles from './partnerTab.module.css'
import Tab from '../../tab/tab'
import ResponsiveImage from '@/utils/components/Image/Image'

const tabImages = {
  mission: '/mission.jpg',
  vision: '/vision.jpg',
  philosophy: '/philosophy.jpg',
}

export default function PartnerTab({ tabData }) {
  const [activeTab, setActiveTab] = useState(tabData?.[0]?.id || '')

  const tabs = tabData.map(tab => ({
    key: tab.id,
    label: tab.title
  }))

  return (
    <div className={styles.container}>
      <Tab
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className={styles.tabMenu}
        tabClassName={styles.tabButton}
        selectorClassName={styles.selector}
      />
      
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
                {tabImages[tab.id] && (
                  <img 
                    src={tabImages[tab.id]} 
                    alt={tab.title} 
                    title={tab.title}
                    className={styles.tabImage}
                  />
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
