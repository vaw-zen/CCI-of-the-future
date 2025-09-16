
"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "./form.module.css";
import GreenBand from "@/utils/components/GreenBand/GreenBand";

export default function Form() {
  const formRef = useRef();
  



  const handleSubmit = (e) => {
    e.preventDefault();
   
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
     
        >
          {isSubmitting ? "ENVOI EN COURS..." : "ENVOYER"}
        </button>
        
        <GreenBand className={styles.greenBandWrapper} />
      </form>

      {submitStatus === 'success' && (
        <div style={{
          color: 'green',
          padding: '10px',
          marginTop: '10px',
          border: '1px solid green',
          backgroundColor: '#f0fff0',
          borderRadius: '4px'
        }}>
          ✅ Message envoyé avec succès !
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div style={{
          color: 'red',
          padding: '10px',
          marginTop: '10px',
          border: '1px solid red',
          backgroundColor: '#fff0f0',
          borderRadius: '4px'
        }}>
          ❌ Erreur lors de l'envoi. Veuillez réessayer.
        </div>
      )}
    </div>
  );
}