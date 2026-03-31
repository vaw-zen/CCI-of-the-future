'use client';

import styles from './ServicesConvention.module.css';
import { motion } from 'framer-motion';

export default function ServicesConvention({ services }) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Services inclus dans nos conventions</h2>
        <p className={styles.subtitle}>
          Une gamme complète de prestations pour l&apos;entretien de vos locaux professionnels
        </p>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className={styles.card}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.icon}>{service.icon}</span>
                <h3 className={styles.cardTitle}>{service.title}</h3>
              </div>
              <p className={styles.cardDescription}>{service.description}</p>
              <div className={styles.frequences}>
                <span className={styles.frequenceLabel}>Fréquences :</span>
                {service.frequences.map((freq, i) => (
                  <span key={i} className={styles.frequenceBadge}>{freq}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
