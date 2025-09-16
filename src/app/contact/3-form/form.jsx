
"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "./form.module.css";
import GreenBand from "@/utils/components/GreenBand/GreenBand";

export default function Form() {
  const formRef = useRef();
  



  const handleSubmit = (e) => {
    e.preventDefault();
  }
    
    // Replace these with your actual EmailJS credentials
 

  // Show loading state while EmailJS is loading
 
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
        ENVOYER
        </button>
        
        <GreenBand className={styles.greenBandWrapper} />
      </form>

         </div>
  );
}