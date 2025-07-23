import React from 'react';
import styles from './form.module.css';
import GreenBand from '@/utils/components/GreenBand/GreenBand';
export default function Form() {
  return (
    <div className={styles.formContainer}>
      <input className={styles.formGroup} type="text" name="name" placeholder="Votre nom" />
      <input className={styles.formGroup} type="email" name="email" placeholder="Adresse e-mail" />
      <input className={styles.formGroup} type="tel" name="phone" placeholder="Numéro de téléphone" />
      <input className={styles.formGroup} type="text" name="projectType" placeholder="Type de projet" />
      <textarea className={`${styles.formGroup} ${styles.textAreaContainer}`} name="message" placeholder="Votre message"></textarea>
      <label className={styles.checkboxContainer}>
        <input type="checkbox" name="terms" /> J'accepte les conditions du service et la politique de confidentialité
      </label>
      <button className={styles.submitButton} type="submit">ENVOYER</button>
      <GreenBand className={styles.greenBandWrapper}/>
    </div>
  );
}
