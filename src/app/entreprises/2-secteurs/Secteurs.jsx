'use client';

import styles from './Secteurs.module.css';
import { motion } from 'framer-motion';

export default function Secteurs({ secteurs }) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Secteurs d&apos;activité</h2>
        <p className={styles.subtitle}>
          Des solutions de nettoyage adaptées à chaque environnement professionnel
        </p>
        <div className={styles.grid}>
          {secteurs.map((secteur, index) => (
            <motion.div
              key={secteur.id}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <span className={styles.icon}>{secteur.icon}</span>
              <h3 className={styles.cardTitle}>{secteur.title}</h3>
              <p className={styles.cardDescription}>{secteur.description}</p>
              <div className={styles.tags}>
                {secteur.services.map((service, i) => (
                  <span key={i} className={styles.tag}>{service}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
