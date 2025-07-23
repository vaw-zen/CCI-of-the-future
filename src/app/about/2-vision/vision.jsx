import React from 'react'
import styles from './vision.module.css'
import { IconoirArrowUpRight } from '@/utils/components/icons'
export default function vision() {
  return (
    <div className={styles.container}>
        <div className={styles.imageSection}>
           
        </div>
        <div className={styles.textSection}>
    <h3 >Notre vision</h3>
    <h2> Rénovations fiables et abordables </h2>
    <div className={styles.line}></div>
    <p>
          Nous sommes spécialisés dans la fourniture de services de nettoyage
          industriel et de tapisserie de premier ordre. Notre équipe, dotée
          d'une expertise approfondie et de technologies de pointe, s'engage à
          offrir des solutions de nettoyage inégalées dans une variété
          d'industries.
        </p>
    <div className={styles.button}>
    <IconoirArrowUpRight className={styles.arrow} />
    </div>
        </div>
    </div>
  )
}
