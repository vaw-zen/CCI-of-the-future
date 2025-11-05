
"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "./form.module.css";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import SharedButton from "@/utils/components/SharedButton/SharedButton";
import { submitDevisRequest } from "@/services/devisService";

export default function DevisForm() {
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState({ type: '', message: '' });

  const getServiceName = (serviceCode) => {
    const services = {
      'salon': 'Nettoyage de salon',
      'tapis': 'Nettoyage de tapis/moquette',
      'tapisserie': 'Tapisserie',
      'marbre': 'Polissage de marbre',
      'tfc': 'Nettoyage TFC (bureaux/commerces)'
    };
    return services[serviceCode] || serviceCode;
  };

  const [formData, setFormData] = useState({
    typePersonne: 'physique',
    matriculeFiscale: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    typeLogement: '',
    surface: '',
    typeService: '',
    nombrePlaces: '',
    surfaceService: '',
    datePreferee: '',
    heurePreferee: '',
    message: '',
    newsletter: false,
    conditions: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const required = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'ville', 'typeService'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      setResult({
        type: 'error',
        message: `Veuillez remplir les champs obligatoires: ${missing.join(', ')}`
      });
      return false;
    }

    // Validation matricule fiscale pour personne morale
    if (formData.typePersonne === 'morale') {
      if (!formData.matriculeFiscale.trim()) {
        setResult({
          type: 'error',
          message: 'La matricule fiscale est obligatoire pour une personne morale'
        });
        return false;
      }
      
      // Validation format matricule fiscale tunisienne (7 chiffres + lettre ou 8 chiffres)
      const matriculeRegex = /^[0-9]{7}[A-Z]|[0-9]{8}$/;
      if (!matriculeRegex.test(formData.matriculeFiscale.replace(/\s/g, ''))) {
        setResult({
          type: 'error',
          message: 'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres)'
        });
        return false;
      }
    }

    // Validation des quantités selon le type de service
    if (formData.typeService === 'salon' && !formData.nombrePlaces) {
      setResult({
        type: 'error',
        message: 'Veuillez indiquer le nombre de places pour le nettoyage de salon'
      });
      return false;
    }

    if (['tapis', 'marbre', 'tfc'].includes(formData.typeService) && !formData.surfaceService) {
      setResult({
        type: 'error',
        message: 'Veuillez indiquer la surface à traiter'
      });
      return false;
    }

    if (!formData.conditions) {
      setResult({
        type: 'error',
        message: 'Vous devez accepter les conditions générales'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setResult({
        type: 'error',
        message: 'Veuillez saisir une adresse email valide'
      });
      return false;
    }

    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setResult({
        type: 'error',
        message: 'Veuillez saisir un numéro de téléphone valide'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setResult({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      // Submit to Supabase
      const result = await submitDevisRequest(formData);
      
      if (result.success) {
        setResult({
          type: 'success',
          message: 'Votre demande de devis a été envoyée avec succès ! Nous vous contacterons dans les plus brefs délais.'
        });
        
        // Track conversion with Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'conversion_event_contact', {
            'event_category': 'Contact',
            'event_label': 'Devis Request',
            'value': 1,
            'service_type': getServiceName(formData.typeService),
            'person_type': formData.typePersonne
          });
        }
        
        // Reset form
        setFormData({
          typePersonne: 'physique',
          matriculeFiscale: '',
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          adresse: '',
          ville: '',
          codePostal: '',
          typeLogement: '',
          surface: '',
          typeService: '',
          nombrePlaces: '',
          surfaceService: '',
          datePreferee: '',
          heurePreferee: '',
          message: '',
          newsletter: false,
          conditions: false
        });
      } else {
        setResult({
          type: 'error',
          message: result.error || 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.'
        });
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setResult({ 
        type: 'error', 
        message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.formHeader}>
        <h3 className={styles.demandeDevis}>Demande de devis</h3>
        <h2 className={styles.hook}>Obtenez votre devis personnalisé</h2>
        <h4 className={styles.description}>Remplissez le formulaire ci-dessous pour recevoir votre devis dans les plus brefs délais.</h4>
      </div>
      <form ref={formRef} className={styles.formContainer} onSubmit={handleSubmit}>
        {/* Type de personne */}
        <select 
          className={styles.formGroup} 
          name="typePersonne" 
          value={formData.typePersonne}
          onChange={handleInputChange}
          required
        >
          <option value="physique">Personne physique</option>
          <option value="morale">Personne morale (Entreprise)</option>
        </select>

        {/* Matricule fiscale conditionnelle */}
        {formData.typePersonne === 'morale' && (
          <div style={{ gridColumn: 'span 2' }}>
            <input 
              className={styles.formGroup} 
              type="text" 
              name="matriculeFiscale" 
              placeholder="Matricule fiscale (ex: 1234567A)"
              value={formData.matriculeFiscale}
              onChange={handleInputChange}
              required
            />
            <div className={styles.helpText}>
              Format : 7 chiffres + 1 lettre ou 8 chiffres
            </div>
          </div>
        )}

        {/* Personal Information Row 1 */}
        <input 
          className={styles.formGroup} 
          type="text" 
          name="nom" 
          placeholder={formData.typePersonne === 'morale' ? 'Raison sociale' : 'Nom'} 
          value={formData.nom}
          onChange={handleInputChange}
          required 
        />
        <input 
          className={styles.formGroup} 
          type="text" 
          name="prenom" 
          placeholder={formData.typePersonne === 'morale' ? 'Nom du contact' : 'Prénom'} 
          value={formData.prenom}
          onChange={handleInputChange}
          required 
        />
        
        {/* Personal Information Row 2 */}
        <input 
          className={styles.formGroup} 
          type="email" 
          name="email" 
          placeholder="Adresse e-mail" 
          value={formData.email}
          onChange={handleInputChange}
          required 
        />
        <input 
          className={styles.formGroup} 
          type="tel" 
          name="telephone" 
          placeholder="Numéro de téléphone" 
          value={formData.telephone}
          onChange={handleInputChange}
          required
        />
        
        {/* Address Information Row 3 */}
        <input 
          className={styles.formGroup} 
          type="text" 
          name="adresse" 
          placeholder="Adresse complète" 
          value={formData.adresse}
          onChange={handleInputChange}
          required
        />
        <select 
          className={styles.formGroup} 
          name="ville" 
          value={formData.ville}
          onChange={handleInputChange}
          required
        >
          <option value="">Sélectionnez votre ville</option>
          <option value="tunis">Tunis</option>
          <option value="ariana">Ariana</option>
          <option value="ben_arous">Ben Arous</option>
          <option value="manouba">Manouba</option>
          <option value="nabeul">Nabeul</option>
          <option value="hammamet">Hammamet</option>
          <option value="autre">Autre</option>
        </select>
        
        <input 
          className={styles.formGroup} 
          type="text" 
          name="codePostal" 
          placeholder="Code postal (optionnel)" 
          value={formData.codePostal}
          onChange={handleInputChange}
        />
        
        {/* Additional Information Row 4 */}
        <select 
          className={styles.formGroup} 
          name="typeLogement" 
          value={formData.typeLogement}
          onChange={handleInputChange}
          required
        >
          <option value="">Sélectionnez votre type de logement</option>
          <option value="appartement">Appartement</option>
          <option value="maison">Maison</option>
          <option value="villa">Villa</option>
          <option value="bureau">Bureau</option>
          <option value="commerce">Commerce</option>
          <option value="bateau ou car ferry">Bateau ou car ferry</option>
        </select>
    

        {/* Type de service */}
        <select 
          className={styles.formGroup} 
          name="typeService" 
          value={formData.typeService}
          onChange={handleInputChange}
          required
        >
          <option value="">Sélectionnez le type de service</option>
          <option value="salon">Nettoyage de salon</option>
          <option value="tapis">Nettoyage de tapis/moquette</option>
          <option value="tapisserie">Tapisserie</option>
          <option value="marbre">Polissage de marbre</option>
          <option value="tfc">Nettoyage TFC (bureaux/commerces)</option>
        </select>

        {/* Champs conditionnels selon le service */}
        {formData.typeService === 'salon' && (
          <input 
            className={styles.formGroup} 
            type="number" 
            name="nombrePlaces" 
            placeholder="Nombre de places (canapés, fauteuils)"
            value={formData.nombrePlaces}
            onChange={handleInputChange}
            min="1"
            required
          />
        )}

        {['tapis', 'marbre', 'tfc'].includes(formData.typeService) && (
          <input 
            className={styles.formGroup} 
            type="number" 
            name="surfaceService" 
            placeholder="Surface à traiter (m²)"
            value={formData.surfaceService}
            onChange={handleInputChange}
            min="1"
            required
          />
        )}

        {formData.typeService === 'tapisserie' && (
          <textarea 
            className={`${styles.formGroup} ${styles.textAreaContainer}`} 
            name="message" 
            placeholder="Décrivez votre projet de tapisserie (type, dimensions, état...)"
            value={formData.message}
            onChange={handleInputChange}
            rows={3}
            required
          />
        )}
        
        {/* Date and Time Row 5 */}
        <input 
          className={styles.formGroup} 
          type="date" 
          name="datePreferee" 
          placeholder="Sélectionnez la date d'intervention"
          title="Sélectionnez la date d'intervention"
          value={formData.datePreferee}
          onChange={handleInputChange}
          min={new Date().toISOString().split('T')[0]}
        />
        <select 
          className={styles.formGroup} 
          name="heurePreferee" 
          value={formData.heurePreferee}
          onChange={handleInputChange}
        >
          <option value="">Sélectionnez vos heures d'intervention préférées</option>
          <option value="matin">Matin (8h-12h)</option>
          <option value="apres_midi">Après-midi (14h-18h)</option>
          <option value="soir">Soir (18h-20h)</option>
          <option value="flexible">Flexible</option>
        </select>
        
        {/* Message (si ce n'est pas tapisserie) */}
        {formData.typeService !== 'tapisserie' && (
          <textarea 
            className={`${styles.formGroup} ${styles.textAreaContainer}`} 
            name="message" 
            placeholder="Détails sur vos besoins (optionnel)"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
          />
        )}
        
        {/* Newsletter Checkbox */}
        <label className={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            name="newsletter" 
            checked={formData.newsletter}
            onChange={handleInputChange}
          /> 
          Je souhaite recevoir les offres spéciales et conseils d'entretien par email
        </label>
        
        {/* Conditions Checkbox */}
        <label className={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            name="conditions" 
            checked={formData.conditions}
            onChange={handleInputChange}
            required 
          /> 
          J'accepte les conditions générales et la politique de confidentialité *
        </label>

        <SharedButton
          className={styles.submitButton}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'ENVOI…' : 'DEMANDER MON DEVIS GRATUIT'}
        </SharedButton>

        {result.message && (
          <div style={{ 
            marginTop: 12, 
            color: result.type === 'error' ? '#b91c1c' : 'var(--ac-primary)', 
            fontWeight: 600,
            gridColumn: 'span 2',
            textAlign: 'center'
          }}>
            {result.message}
          </div>
        )}
        
        <GreenBand className={styles.greenBandWrapper} />
      </form>
    </div>
  );
}