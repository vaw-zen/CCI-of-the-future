import React from 'react'
import styles from './vision.module.css'
import { IconoirArrowUpRight } from '@/utils/components/icons'
export default function vision() {
  return (
    <div className={styles.container}>
        <div className={styles.imageSection}>
           
        </div>
        <div className={styles.textSection}>
    <h3 >our vision</h3>
    <h2>Reliable and affordable repairs</h2>
    <div className={styles.line}></div>
    <p>We work to help people feel comfortable in their homes and provide the best, fastest assistance at a fair price. We stand for quality, safety and credibility, so you can be sure of our work. Initially, we started as a cleaning service company.</p>
    <div className={styles.button}>
    <IconoirArrowUpRight className={styles.arrow} />
    </div>
        </div>
    </div>
  )
}
