import React from 'react';
import styles from './devisIntro.module.css';

export default function DevisIntro() {
  return (
    <section className={styles.introSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            Obtenez votre devis gratuit en quelques clics
          </h2>
          <p className={styles.description}>
            Calculez instantanément le coût de vos prestations de nettoyage avec notre outil professionnel. 
            Nos tarifs sont transparents et adaptés à vos besoins spécifiques.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📋</div>
              <div className={styles.featureText}>
                <h3>Devis détaillé</h3>
                <p>Prix par service avec récapitulatif complet</p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚡</div>
              <div className={styles.featureText}>
                <h3>Calcul instantané</h3>
                <p>Résultat immédiat selon vos quantités</p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>💯</div>
              <div className={styles.featureText}>
                <h3>Sans engagement</h3>
                <p>Devis gratuit, prix final après visite</p>
              </div>
            </div>
          </div>
          
          <div className={styles.notice}>
            <p>
              <strong>Important :</strong> Les prix affichés sont indicatifs. 
              Le montant final dépend de l&apos;état initial constaté lors de notre visite gratuite.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
