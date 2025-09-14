
"use client";
import React, { useRef, useState } from "react";
import styles from "./form.module.css";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
const emailjs = dynamic(() => import('@emailjs/browser'), { ssr: false });

export default function Form() {
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Validate required EmailJS configuration
      const serviceId = "service_a8ouscx" // replace with your service ID
      const templateId = "template_rjqylkj" // replace with your template ID
      const publicKey = "MIZT6AZwbY6JCI-jQ" // replace with your public key

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS configuration is missing");
      }

      const result = await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current,
        publicKey
      );

      console.log("Email sent successfully:", result);
      setSubmitStatus('success');
      formRef.current.reset();
      
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form ref={formRef} className={styles.formContainer} onSubmit={handleSubmit}>
        <input 
          className={styles.formGroup} 
          type="text" 
          name="name" 
          placeholder="Votre nom" 
          required 
          disabled={isSubmitting}
        />
        <input 
          className={styles.formGroup} 
          type="email" 
          name="email" 
          placeholder="Adresse e-mail" 
          required 
          disabled={isSubmitting}
        />
        <input 
          className={styles.formGroup} 
          type="tel" 
          name="phone" 
          placeholder="Numéro de téléphone" 
          disabled={isSubmitting}
        />
        <input 
          className={styles.formGroup} 
          type="text" 
          name="projectType" 
          placeholder="Type de projet" 
          disabled={isSubmitting}
        />
        <textarea 
          className={`${styles.formGroup} ${styles.textAreaContainer}`} 
          name="message" 
          placeholder="Votre message"
          disabled={isSubmitting}
        />
        <label className={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            name="terms" 
            required 
            disabled={isSubmitting}
          /> 
          J'accepte les conditions du service et la politique de confidentialité
        </label>
        
        <button 
          className={styles.submitButton} 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "ENVOI EN COURS..." : "ENVOYER"}
        </button>
        
        <GreenBand className={styles.greenBandWrapper} />
      </form>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className={styles.successMessage || "success-message"}>
          ✅ Message envoyé avec succès !
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className={styles.errorMessage || "error-message"}>
          ❌ Erreur lors de l'envoi. Veuillez réessayer.
        </div>
      )}
    </div>
  );
}