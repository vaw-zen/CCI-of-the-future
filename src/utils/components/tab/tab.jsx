'use client'
import React from 'react'
import styles from './tab.module.css'
import { useTabLogic } from './tab.func'

export default function Tab({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  tabClassName = '',
  selectorClassName = ''
}) {
  const { selectorStyle, tabRefs } = useTabLogic(activeTab)

  return (
    <div className={`${styles.tabMenu} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          ref={(el) => (tabRefs.current[tab.key] = el)}
          className={`${styles.tabButton} ${tabClassName} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
      <div
        className={`${styles.selector} ${selectorClassName}`}
        style={{
          left: `${selectorStyle.left}px`,
          width: `${selectorStyle.width}px`
        }}
      />
    </div>
  )
}
