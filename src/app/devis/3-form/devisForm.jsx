'use client';

import { useState } from 'react';
import styles from './devisForm.module.css';
import { submitDevisRequest } from '@/services/devisService';

export default function DevisForm() {
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
    typeLogement: 'appartement',
    surface: '',
    typeService: '',
    nombrePlaces: '',
    surfaceService: '',
    datePreferee: '',
    heurePreferee: 'matin',
    message: '',
    newsletter: false,
    conditions: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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
      setSubmitStatus({
        type: 'error',
        message: `Veuillez remplir les champs obligatoires: ${missing.join(', ')}`
      });
      return false;
    }

    // Validation matricule fiscale pour personne morale
    if (formData.typePersonne === 'morale') {
      if (!formData.matriculeFiscale.trim()) {
        setSubmitStatus({
          type: 'error',
          message: 'La matricule fiscale est obligatoire pour une personne morale'
        });
        return false;
      }
      
      // Validation format matricule fiscale tunisienne (7 chiffres + lettre ou 8 chiffres)
      const matriculeRegex = /^[0-9]{7}[A-Z]|[0-9]{8}$/;
      if (!matriculeRegex.test(formData.matriculeFiscale.replace(/\s/g, ''))) {
        setSubmitStatus({
          type: 'error',
          message: 'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres)'
        });
        return false;
      }
    }

    // Validation des quantités selon le type de service
    if (formData.typeService === 'salon' && !formData.nombrePlaces) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez indiquer le nombre de places pour le nettoyage de salon'
      });
      return false;
    }

    if (['tapis', 'marbre', 'tfc'].includes(formData.typeService) && !formData.surfaceService) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez indiquer la surface à traiter'
      });
      return false;
    }

    if (!formData.conditions) {
      setSubmitStatus({
        type: 'error',
        message: 'Vous devez accepter les conditions générales'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez saisir une adresse email valide'
      });
      return false;
    }

    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez saisir un numéro de téléphone valide'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Submit to Supabase
      const result = await submitDevisRequest(formData);
      
      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Votre demande de devis a été envoyée avec succès ! Nous vous contacterons dans les plus brefs délais. Un email de confirmation vous sera envoyé.'
        });
        
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
          typeLogement: 'appartement',
          surface: '',
          typeService: '',
          nombrePlaces: '',
          surfaceService: '',
          datePreferee: '',
          heurePreferee: 'matin',
          message: '',
          newsletter: false,
          conditions: false
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.'
        });
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.title}>Demande de Devis Gratuit</h2>
            <p className={styles.subtitle}>
              Complétez ce formulaire pour recevoir votre devis personnalisé sous 24h
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Personal Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>👤</span>
                Informations personnelles
              </h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="typePersonne" className={styles.label}>
                  Type de personne <span className={styles.required}>*</span>
                </label>
                <select
                  id="typePersonne"
                  name="typePersonne"
                  value={formData.typePersonne}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="physique">Personne physique</option>
                  <option value="morale">Personne morale (Entreprise)</option>
                </select>
              </div>

              {formData.typePersonne === 'morale' && (
                <div className={styles.formGroup}>
                  <label htmlFor="matriculeFiscale" className={styles.label}>
                    Matricule fiscale <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="matriculeFiscale"
                    name="matriculeFiscale"
                    value={formData.matriculeFiscale}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Ex: 1234567A ou 12345678"
                    required
                  />
                  <small className={styles.helpText}>
                    Format : 7 chiffres + 1 lettre ou 8 chiffres
                  </small>
                </div>
              )}
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="nom" className={styles.label}>
                    {formData.typePersonne === 'morale' ? 'Raison sociale' : 'Nom'} <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder={formData.typePersonne === 'morale' ? 'Nom de l\'entreprise' : 'Votre nom de famille'}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="prenom" className={styles.label}>
                    {formData.typePersonne === 'morale' ? 'Contact' : 'Prénom'} <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder={formData.typePersonne === 'morale' ? 'Nom du contact' : 'Votre prénom'}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="votre.email@exemple.com"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="telephone" className={styles.label}>
                    Téléphone <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="+216 XX XXX XXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📍</span>
                Adresse d'intervention
              </h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="adresse" className={styles.label}>
                  Adresse complète <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Rue, avenue, numéro..."
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="ville" className={styles.label}>
                    Ville <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="ville"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    className={styles.select}
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
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="codePostal" className={styles.label}>
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="codePostal"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="typeLogement" className={styles.label}>
                    Type de logement
                  </label>
                  <select
                    id="typeLogement"
                    name="typeLogement"
                    value={formData.typeLogement}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison</option>
                    <option value="villa">Villa</option>
                    <option value="bureau">Bureau</option>
                    <option value="commerce">Commerce</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="surface" className={styles.label}>
                    Surface approximative (m²)
                  </label>
                  <input
                    type="number"
                    id="surface"
                    name="surface"
                    value={formData.surface}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Ex: 120"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Services Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🧹</span>
                Type de service souhaité
              </h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="typeService" className={styles.label}>
                  Service <span className={styles.required}>*</span>
                </label>
                <select
                  id="typeService"
                  name="typeService"
                  value={formData.typeService}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Sélectionnez le type de service</option>
                  <option value="salon">Nettoyage de salon (canapés, fauteuils)</option>
                  <option value="tapis">Nettoyage de tapis/moquettes</option>
                  <option value="tapisserie">Tapisserie (confection, restauration)</option>
                  <option value="marbre">Polissage de marbre</option>
                  <option value="tfc">Nettoyage TFC (bureaux, commerces)</option>
                </select>
              </div>

              {/* Conditional fields based on service type */}
              {formData.typeService === 'salon' && (
                <div className={styles.formGroup}>
                  <label htmlFor="nombrePlaces" className={styles.label}>
                    Nombre de places <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    id="nombrePlaces"
                    name="nombrePlaces"
                    value={formData.nombrePlaces}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Ex: 6 places (3 places canapé + 2 fauteuils + 1 pouf)"
                    min="1"
                    required
                  />
                  <small className={styles.helpText}>
                    Comptez le nombre total de places assises (canapé 3 places = 3, fauteuil = 1, etc.)
                  </small>
                </div>
              )}

              {(['tapis', 'marbre', 'tfc'].includes(formData.typeService)) && (
                <div className={styles.formGroup}>
                  <label htmlFor="surfaceService" className={styles.label}>
                    Surface à traiter (m²) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    id="surfaceService"
                    name="surfaceService"
                    value={formData.surfaceService}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Ex: 25"
                    min="1"
                    step="0.1"
                    required
                  />
                  <small className={styles.helpText}>
                    {formData.typeService === 'tapis' && 'Surface totale des tapis/moquettes à nettoyer'}
                    {formData.typeService === 'marbre' && 'Surface de marbre à polir/cristalliser'}
                    {formData.typeService === 'tfc' && 'Surface totale des locaux à nettoyer'}
                  </small>
                </div>
              )}

              {formData.typeService === 'tapisserie' && (
                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Détails du projet tapisserie <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="detailsTapisserie"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Décrivez votre projet : confection de rideaux, rénovation de fauteuils anciens, etc."
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>

            {/* Appointment Preferences */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📅</span>
                Préférences de rendez-vous
              </h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="datePreferee" className={styles.label}>
                    Date préférée
                  </label>
                  <input
                    type="date"
                    id="datePreferee"
                    name="datePreferee"
                    value={formData.datePreferee}
                    onChange={handleInputChange}
                    className={styles.input}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="heurePreferee" className={styles.label}>
                    Créneau horaire préféré
                  </label>
                  <select
                    id="heurePreferee"
                    name="heurePreferee"
                    value={formData.heurePreferee}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="matin">Matin (8h-12h)</option>
                    <option value="apres_midi">Après-midi (14h-18h)</option>
                    <option value="soir">Soir (18h-20h)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Message */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>💬</span>
                Message complémentaire
              </h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  Détails sur vos besoins (optionnel)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Décrivez vos besoins spécifiques, l'état des surfaces à traiter, vos attentes..."
                  rows={4}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className={styles.checkboxSection}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="newsletter" className={styles.checkboxLabel}>
                  Je souhaite recevoir les offres spéciales et conseils d'entretien par email
                </label>
              </div>
              
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="conditions"
                  name="conditions"
                  checked={formData.conditions}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                  required
                />
                <label htmlFor="conditions" className={styles.checkboxLabel}>
                  J'accepte les <a href="/conditions" target="_blank">conditions générales</a> et la <a href="/confidentialite" target="_blank">politique de confidentialité</a> <span className={styles.required}>*</span>
                </label>
              </div>
            </div>

            {/* Status Message */}
            {submitStatus && (
              <div className={`${styles.statusMessage} ${styles[submitStatus.type]}`}>
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <div className={styles.submitSection}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    Demander mon devis gratuit
                  </>
                )}
              </button>
              
              <p className={styles.submitNote}>
                🔒 Vos données sont sécurisées et ne seront jamais partagées
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}