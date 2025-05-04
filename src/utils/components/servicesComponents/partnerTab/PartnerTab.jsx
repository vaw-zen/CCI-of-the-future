'use client'
import React, { useState } from 'react'
import styles from './partnerTab.module.css'

const TabData = [
  {
    id: 'mission',
    title: 'Our mission',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.',
    image: '/path-to-image.jpg'
  },
  {
    id: 'vision',
    title: 'Our vision',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.',
    image: '/path-to-image.jpg'
  },
  {
    id: 'philosophy',
    title: 'Philosophy',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: '/path-to-image.jpg'
  }
]

export default function PartnerTab(layout) {
  const [activeTab, setActiveTab] = useState('vision')
  function getFlexDirection(index, layout) {
    if (layout === 'column') {
      return index % 2 === 0 ? 'column' : 'column-reverse';
    } else {
      return index % 2 === 0 ? 'row' : 'row-reverse';
    }
  }
  
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
            <div key={tab.id} className={styles.tabPanel} style={{
              display: 'flex',
              flexDirection: getFlexDirection(i, layout), // layout = "row" or "column"
            }}
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
