'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './devisConfirmation.module.css';

export default function DevisConfirmation({ 
  isVisible = false, 
  onClose = () => {}, 
  customerInfo = null 
}) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!showModal) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
        
        <div className={styles.content}>
          <div className={styles.successIcon}>
            <div className={styles.checkmark}>
              <div className={styles.checkmarkStem}></div>
              <div className={styles.checkmarkKick}></div>
            </div>
          </div>
          
          <h2 className={styles.title}>Demande envoyée avec succès !</h2>
          
          <p className={styles.message}>
            Merci {customerInfo?.prenom || ''} ! Votre demande de devis a été reçue et sera traitée dans les plus brefs délais.
          </p>
          
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.icon}>📧</span>
              <div>
                <strong>Confirmation par email</strong>
                <p>Un récapitulatif vous a été envoyé à {customerInfo?.email || 'votre adresse email'}</p>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.icon}>📞</span>
              <div>
                <strong>Contact sous 24h</strong>
                <p>Notre équipe vous contactera au {customerInfo?.telephone || 'votre numéro'} pour finaliser votre devis</p>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.icon}>📋</span>
              <div>
                <strong>Devis personnalisé</strong>
                <p>Vous recevrez votre devis détaillé après notre évaluation sur site</p>
              </div>
            </div>
          </div>
          
          <div className={styles.nextSteps}>
            <h3>Prochaines étapes :</h3>
            <ol>
              <li>Réception de votre confirmation par email</li>
              <li>Appel de notre équipe pour planifier la visite</li>
              <li>Évaluation gratuite sur site</li>
              <li>Remise de votre devis personnalisé</li>
              <li>Planification de l'intervention si acceptation</li>
            </ol>
          </div>
          
          <div className={styles.actions}>
            <button 
              onClick={handleClose}
              className={styles.primaryButton}
            >
              Parfait, merci !
            </button>
            
            <Link href="/services" className={styles.secondaryButton}>
              Découvrir nos services
            </Link>
          </div>
          
          <div className={styles.contact}>
            <p>
              <strong>Une question urgente ?</strong><br />
              Contactez-nous directement au <a href="tel:+21698557766">+216 98 557 766</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}