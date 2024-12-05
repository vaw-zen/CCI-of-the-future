import React from 'react'
import styles from './clients.module.css'

export default function Clients() {
  return (
    <section className={styles.clientsGrid}>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className={styles.clientCell} />
      ))}
    </section>
  )
}