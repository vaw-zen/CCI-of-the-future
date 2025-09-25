
"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "./form.module.css";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import SharedButton from "@/utils/components/SharedButton/SharedButton";

export default function DevisForm() {
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    typeLogement: '',
    surface: '',
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
    const required = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'ville'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      setResult({
        type: 'error',
        message: `Veuillez remplir les champs obligatoires: ${missing.join(', ')}`
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setResult({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      // Create mailto link with form data
      const subject = encodeURIComponent('Demande de devis - CCI Services');
      const body = encodeURIComponent(`
DEMANDE DE DEVIS

Informations personnelles:
- Nom: ${formData.nom}
- Prénom: ${formData.prenom}
- Email: ${formData.email}
- Téléphone: ${formData.telephone}

Adresse d'intervention:
- Adresse: ${formData.adresse}
- Ville: ${formData.ville}
- Code postal: ${formData.codePostal || 'Non spécifié'}

Détails du projet:
- Type de logement: ${formData.typeLogement || 'Non spécifié'}
- Surface approximative: ${formData.surface ? formData.surface + ' m²' : 'Non spécifiée'}

Préférences de rendez-vous:
- Date préférée: ${formData.datePreferee || 'Non spécifiée'}
- Créneau horaire: ${formData.heurePreferee || 'Non spécifié'}

Options:
- Newsletter: ${formData.newsletter ? 'Oui' : 'Non'}

${formData.message ? `Message complémentaire:\n${formData.message}` : ''}

--
Envoyé depuis le site web CCI Services
      `.trim());

      const mailtoLink = `mailto:contact@cci-tunisie.com?subject=${subject}&body=${body}`;

      // Open email client
      window.location.href = mailtoLink;

      setResult({
        type: 'success',
        message: 'Votre client email s\'ouvre avec votre demande de devis pré-remplie. Cliquez sur "Envoyer" pour nous la transmettre.'
      });

      // Reset form
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        codePostal: '',
        typeLogement: '',
        surface: '',
        datePreferee: '',
        heurePreferee: '',
        message: '',
        newsletter: false,
        conditions: false
      });
    } catch (err) {
      setResult({ type: 'error', message: 'Une erreur est survenue. Réessayez plus tard.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form ref={formRef} className={styles.formContainer} onSubmit={handleSubmit}>
        {/* Personal Information Row 1 */}
        <input 
          className={styles.formGroup} 
          type="text" 
          name="nom" 
          placeholder="Nom" 
          value={formData.nom}
          onChange={handleInputChange}
          required 
        />
        <input 
          className={styles.formGroup} 
          type="text" 
          name="prenom" 
          placeholder="Prénom" 
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
        <input 
          className={styles.formGroup} 
          type="number" 
          name="surface" 
          placeholder="Surface approximative (m²)" 
          value={formData.surface}
          onChange={handleInputChange}
          min="1"
        />
        
        {/* Date and Time Row 5 */}
        <input 
          className={styles.formGroup} 
          type="date" 
          name="datePreferee" 
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
        
        {/* Message */}
        <textarea 
          className={`${styles.formGroup} ${styles.textAreaContainer}`} 
          name="message" 
          placeholder="Détails sur vos besoins (optionnel)"
          value={formData.message}
          onChange={handleInputChange}
          rows={4}
        />
        
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