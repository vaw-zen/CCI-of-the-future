'use client';

import styles from './ConventionForm.module.css';
import { useConventionFormLogic } from './ConventionForm.func';

export default function ConventionForm() {
  const {
    formData,
    isSubmitting,
    submitStatus,
    handleInputChange,
    handleServiceToggle,
    handleSubmit,
    SERVICES_OPTIONS
  } = useConventionFormLogic();

  return (
    <section className={styles.formSection} id="convention-form">
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.title}>Demander une Convention</h2>
            <p className={styles.subtitle}>
              Remplissez ce formulaire et notre équipe vous contactera sous 48h pour planifier un audit gratuit
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Company Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🏢</span>
                Informations entreprise
              </h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="raisonSociale" className={styles.label}>
                    Raison sociale <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="raisonSociale"
                    name="raisonSociale"
                    value={formData.raisonSociale}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Nom de l'entreprise"
                    required
                  />
                </div>

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
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="secteurActivite" className={styles.label}>
                  Secteur d'activité <span className={styles.required}>*</span>
                </label>
                <select
                  id="secteurActivite"
                  name="secteurActivite"
                  value={formData.secteurActivite}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Sélectionnez votre secteur</option>
                  <option value="banque">Banque / Institution financière</option>
                  <option value="assurance">Compagnie d'assurances</option>
                  <option value="clinique">Clinique / Hôpital</option>
                  <option value="hotel">Hôtel / Résidence</option>
                  <option value="bureau">Bureau / Espace de coworking</option>
                  <option value="commerce">Grande surface / Commerce</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Contact Person */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>👤</span>
                Personne de contact
              </h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contactNom" className={styles.label}>
                    Nom <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="contactNom"
                    name="contactNom"
                    value={formData.contactNom}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Nom du responsable"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contactPrenom" className={styles.label}>
                    Prénom <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="contactPrenom"
                    name="contactPrenom"
                    value={formData.contactPrenom}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Prénom du responsable"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contactFonction" className={styles.label}>
                  Fonction
                </label>
                <input
                  type="text"
                  id="contactFonction"
                  name="contactFonction"
                  value={formData.contactFonction}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ex: Directeur général, Responsable logistique..."
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email professionnel <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="contact@votreentreprise.tn"
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

            {/* Site Details */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📐</span>
                Détails des locaux
              </h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="nombreSites" className={styles.label}>
                    Nombre de sites
                  </label>
                  <input
                    type="number"
                    id="nombreSites"
                    name="nombreSites"
                    value={formData.nombreSites}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="surfaceTotale" className={styles.label}>
                    Surface totale estimée (m²)
                  </label>
                  <input
                    type="number"
                    id="surfaceTotale"
                    name="surfaceTotale"
                    value={formData.surfaceTotale}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Ex: 500"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Services Selection */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🧹</span>
                Services souhaités <span className={styles.required}>*</span>
              </h3>

              <div className={styles.servicesGrid}>
                {SERVICES_OPTIONS.map(service => (
                  <label
                    key={service.id}
                    className={`${styles.serviceCard} ${formData.servicesSouhaites.includes(service.id) ? styles.selected : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.servicesSouhaites.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className={styles.serviceCheckbox}
                    />
                    <span className={styles.serviceLabel}>{service.label}</span>
                    <span className={styles.serviceCheck}>
                      {formData.servicesSouhaites.includes(service.id) ? '✓' : ''}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contract Preferences */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📋</span>
                Préférences du contrat
              </h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="frequence" className={styles.label}>
                    Fréquence souhaitée <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="frequence"
                    name="frequence"
                    value={formData.frequence}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="">Sélectionnez la fréquence</option>
                    <option value="quotidien">Quotidien</option>
                    <option value="3x_semaine">3 fois par semaine</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="bi_mensuel">Bi-mensuel</option>
                    <option value="mensuel">Mensuel</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="dureeContrat" className={styles.label}>
                    Durée du contrat <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="dureeContrat"
                    name="dureeContrat"
                    value={formData.dureeContrat}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="">Sélectionnez la durée</option>
                    <option value="6_mois">6 mois</option>
                    <option value="1_an">1 an</option>
                    <option value="2_ans">2 ans</option>
                    <option value="3_ans">3 ans</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dateDebutSouhaitee" className={styles.label}>
                  Date de début souhaitée
                </label>
                <input
                  type="date"
                  id="dateDebutSouhaitee"
                  name="dateDebutSouhaitee"
                  value={formData.dateDebutSouhaitee}
                  onChange={handleInputChange}
                  className={styles.input}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Additional Message */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>💬</span>
                Besoins spécifiques
              </h3>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  Décrivez vos besoins particuliers (optionnel)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Horaires d'intervention souhaités, zones spécifiques, contraintes particulières..."
                  rows={4}
                />
              </div>
            </div>

            {/* Honeypot */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
              <label htmlFor="convention-website">Site web</label>
              <input
                type="text"
                id="convention-website"
                name="honeypotWebsite"
                value={formData.honeypotWebsite}
                onChange={handleInputChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Conditions */}
            <div className={styles.checkboxSection}>
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

            {/* Status */}
            {submitStatus && (
              <div className={`${styles.statusMessage} ${styles[submitStatus.type]}`}>
                {submitStatus.message}
              </div>
            )}

            {/* Submit */}
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
                    <span>🏢</span>
                    Demander un audit gratuit
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
