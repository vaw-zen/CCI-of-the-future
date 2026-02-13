'use client';

import styles from './Processus.module.css';
import { motion } from 'framer-motion';

export default function Processus({ etapes }) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Comment ça marche ?</h2>
        <p className={styles.subtitle}>
          Un processus simple et transparent, de l'audit initial au suivi qualité
        </p>
        <div className={styles.timeline}>
          {etapes.map((etape, index) => (
            <motion.div
              key={etape.etape}
              className={styles.step}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <div className={styles.stepNumber}>
                <span>{etape.etape}</span>
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{etape.titre}</h3>
                <p className={styles.stepDescription}>{etape.description}</p>
              </div>
              {index < etapes.length - 1 && <div className={styles.connector} />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
