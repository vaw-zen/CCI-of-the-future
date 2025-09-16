
"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "./form.module.css";
import GreenBand from "@/utils/components/GreenBand/GreenBand";

export default function Form() {
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setResult({ type: '', message: '' });
    setIsSubmitting(true);

    const form = formRef.current;
    const formData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      projectType: form.projectType.value,
      message: form.message.value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== 'mail_sent') {
        throw new Error(data?.message || 'Failed to send message');
      }

      setResult({ type: 'success', message: 'Votre message a été envoyé. Merci !' });
      form.reset();
    } catch (err) {
      setResult({ type: 'error', message: 'Une erreur est survenue. Réessayez plus tard.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form ref={formRef} className={styles.formContainer} onSubmit={handleSubmit}>
        <input 
          className={styles.formGroup} 
          type="text" 
          name="name" 
          placeholder="Votre nom" 
          required 
        
        />
        <input 
          className={styles.formGroup} 
          type="email" 
          name="email" 
          placeholder="Adresse e-mail" 
          required 
        
        />
        <input 
          className={styles.formGroup} 
          type="tel" 
          name="phone" 
          placeholder="Numéro de téléphone" 
        
        />
        <input 
          className={styles.formGroup} 
          type="text" 
          name="projectType" 
          placeholder="Type de projet" 
        
        />
        <textarea 
          className={`${styles.formGroup} ${styles.textAreaContainer}`} 
          name="message" 
          placeholder="Votre message"
        
        />
        <label className={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            name="terms" 
            required 
          
          /> 
          J'accepte les conditions du service et la politique de confidentialité
        </label>
        
        <button 
          className={styles.submitButton} 
          type="submit" 
          disabled={isSubmitting}
        >
        {isSubmitting ? 'ENVOI…' : 'ENVOYER'}
        </button>

        {result.message && (
          <div style={{ marginTop: 12, color: result.type === 'error' ? '#b91c1c' : 'var(--ac-primary)', fontWeight: 600 }}>
            {result.message}
          </div>
        )}
        
        <GreenBand className={styles.greenBandWrapper} />
      </form>

         </div>
  );
}