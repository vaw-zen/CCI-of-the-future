import React from 'react'
import styles from './serviceDetails.module.css'

export default function ServiceDetails({ title, text, className }) {
  return (
    <div className={`${styles.container} ${className}`}>
        <h2 className={styles.title}>
            {title}
        </h2>
        <div className={styles.textContainer}>
            <p className={styles.text}>
                {text}
            </p>
        </div>
    </div>
  )
}
