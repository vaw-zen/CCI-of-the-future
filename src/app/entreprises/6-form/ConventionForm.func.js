import { useState, useEffect, useRef } from 'react';
import { submitConventionRequest } from '@/services/conventionService';
import {
  trackFunnelStep,
  trackFunnelComplete,
  trackFormFieldComplete,
  trackFormAbandonment,
  trackServiceInteraction,
  SERVICE_TYPES
} from '@/utils/analytics';

const initialFormData = {
  raisonSociale: '',
  matriculeFiscale: '',
  secteurActivite: '',
  contactNom: '',
  contactPrenom: '',
  contactFonction: '',
  email: '',
  telephone: '',
  nombreSites: '1',
  surfaceTotale: '',
  servicesSouhaites: [],
  frequence: '',
  dureeContrat: '',
  dateDebutSouhaitee: '',
  message: '',
  conditions: false,
  honeypotWebsite: ''
};

const SERVICES_OPTIONS = [
  { id: 'locaux', label: 'Nettoyage des locaux (quotidien/hebdo)' },
  { id: 'salon', label: 'Nettoyage salon & mobilier' },
  { id: 'tapis', label: 'Nettoyage tapis & moquettes' },
  { id: 'marbre', label: 'Entretien marbre & sols' },
  { id: 'vitres', label: 'Nettoyage vitres & façades' }
];

export function useConventionFormLogic() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const completedFields = useRef(new Set());
  const formStartTime = useRef(Date.now());

  useEffect(() => {
    trackFunnelStep('convention_form', 'form_start', 1, { page: 'entreprises' });

    const handleBeforeUnload = () => {
      const completionRate = Math.round((completedFields.current.size / Object.keys(initialFormData).length) * 100);
      if (completionRate > 0 && completionRate < 100) {
        const lastField = Array.from(completedFields.current).pop() || 'unknown';
        trackFormAbandonment('convention_form', lastField, completionRate);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if ((type !== 'checkbox' && value.trim()) || (type === 'checkbox' && checked)) {
      if (!completedFields.current.has(name)) {
        completedFields.current.add(name);
        trackFormFieldComplete('convention_form', name);
      }
    }

    if (name === 'secteurActivite' && value) {
      trackFunnelStep('convention_form', 'secteur_selected', 2, { secteur: value });
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const current = prev.servicesSouhaites;
      const updated = current.includes(serviceId)
        ? current.filter(s => s !== serviceId)
        : [...current, serviceId];
      return { ...prev, servicesSouhaites: updated };
    });

    if (!completedFields.current.has('servicesSouhaites')) {
      completedFields.current.add('servicesSouhaites');
      trackFormFieldComplete('convention_form', 'servicesSouhaites');
    }
  };

  const validateForm = () => {
    const required = ['raisonSociale', 'matriculeFiscale', 'secteurActivite', 'contactNom', 'contactPrenom', 'email', 'telephone', 'frequence', 'dureeContrat'];
    const missing = required.filter(field => !formData[field] || (typeof formData[field] === 'string' && !formData[field].trim()));

    if (missing.length > 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires.'
      });
      return false;
    }

    // Validate matricule fiscale
    const matriculeRegex = /^[0-9]{7}[A-Z]$|^[0-9]{8}$/;
    if (!matriculeRegex.test(formData.matriculeFiscale.replace(/\s/g, ''))) {
      setSubmitStatus({
        type: 'error',
        message: 'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres).'
      });
      return false;
    }

    // Validate at least one service
    if (formData.servicesSouhaites.length === 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez sélectionner au moins un service.'
      });
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez saisir une adresse email valide.'
      });
      return false;
    }

    // Validate phone
    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez saisir un numéro de téléphone valide.'
      });
      return false;
    }

    if (!formData.conditions) {
      setSubmitStatus({
        type: 'error',
        message: 'Vous devez accepter les conditions générales.'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await submitConventionRequest(formData);

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Votre demande de convention a été envoyée avec succès ! Notre équipe vous contactera sous 48h pour planifier un audit gratuit de vos locaux.'
        });

        trackServiceInteraction(SERVICE_TYPES.CONVENTION, 'convention_form_submit', {
          secteur: formData.secteurActivite,
          nombre_sites: formData.nombreSites,
          services_count: formData.servicesSouhaites.length,
          frequence: formData.frequence,
          duree: formData.dureeContrat
        });
        trackFunnelComplete('convention_form', 'form_submitted', 3);

        const timeToComplete = Math.round((Date.now() - formStartTime.current) / 1000);
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'timing_complete', {
            event_category: 'form_completion',
            name: 'convention_form_time',
            value: timeToComplete
          });
        }

        setFormData(initialFormData);
        completedFields.current.clear();
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Une erreur est survenue. Veuillez réessayer.'
        });
      }
    } catch (error) {
      console.error('Convention form submission error:', error);
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
    handleServiceToggle,
    handleSubmit,
    SERVICES_OPTIONS
  };
}
