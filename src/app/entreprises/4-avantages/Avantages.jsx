'use client';

import styles from './Avantages.module.css';
import { motion } from 'framer-motion';

export default function Avantages({ avantages }) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Pourquoi choisir une convention annuelle ?</h2>
        <p className={styles.subtitle}>
          Des avantages exclusifs pour les entreprises qui nous font confiance
        </p>
        <div className={styles.grid}>
          {avantages.map((avantage, index) => (
            <motion.div
              key={avantage.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <span className={styles.icon}>{avantage.icon}</span>
              <h3 className={styles.cardTitle}>{avantage.title}</h3>
              <p className={styles.cardDescription}>{avantage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
