import React from 'react';
import styles from './form.module.css';
import GreenBand from '@/utils/components/GreenBand/GreenBand';
export default function Form() {
  return (
    <div className={styles.formContainer}>
      <input className={styles.formGroup} type="text" name="name" placeholder="Your Name" />
      <input className={styles.formGroup} type="email" name="email" placeholder="Email Address" />
      <input className={styles.formGroup} type="tel" name="phone" placeholder="Phone Number" />
      <input className={styles.formGroup} type="text" name="projectType" placeholder="Project Type" />
      <textarea className={`${styles.formGroup} ${styles.textAreaContainer}`} name="message" placeholder="Your Message"></textarea>
      <label className={styles.checkboxContainer}>
        <input type="checkbox" name="terms" /> I am bound by the terms of the Service I accept Privacy Policy
      </label>
      <button className={styles.submitButton} type="submit">SEND MESSAGE</button>
      <GreenBand className={styles.greenBandWrapper}/>
    </div>
  );
}
