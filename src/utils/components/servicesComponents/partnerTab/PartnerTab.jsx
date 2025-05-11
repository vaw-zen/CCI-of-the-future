'use client'
import React, { useState } from 'react'
import styles from './partnerTab.module.css'

const TabData = [
  {
    id: 'mission',
    title: 'Our mission',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.',
    image: 'https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63d267daedcc413255de10bf_tab-01.jpg'
  },
  {
    id: 'vision',
    title: 'Our vision',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.',
    image: 'https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63d267dbdb29fef4a994f1cb_tab-02.jpg'
  },
  {
    id: 'philosophy',
    title: 'Philosophy',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: 'https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63d267daedcc413255de10bf_tab-01.jpg'

  }
]
export default function PartnerTab() {
  const [activeTab, setActiveTab] = useState('vision')
  
  return (
    <div className={styles.container}>
      <div className={styles.tabMenu}>
        {TabData.map((tab) => (
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
        {TabData.map((tab,i) => (
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
                <img src={tab.image} alt={tab.title} />
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
