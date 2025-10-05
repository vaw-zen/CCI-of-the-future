import { useState } from 'react';
import { submitDevisRequest } from '@/services/devisService';

const initialFormData = {
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
};

export function useDevisFormLogic() {
  const [formData, setFormData] = useState(initialFormData);
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
        setFormData(initialFormData);
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

  return {
    formData,
    isSubmitting,
    submitStatus,
    handleInputChange,
    handleSubmit
  };
}
