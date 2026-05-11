import { useState, useEffect, useRef } from 'react';
import { submitDevisRequest } from '@/services/devisService';
import { 
  trackFunnelStep, 
  trackFunnelComplete, 
  trackFormFieldFocus, 
  trackFormFieldComplete,
  trackFormAbandonment,
  trackDevisSubmission,
  trackFormSubmitFailed,
  trackFormValidationFailed,
  trackPerformance
} from '@/utils/analytics';

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
  conditions: false,
  honeypotWebsite: ''
};

function buildDevisFormContext(serviceType = '') {
  return {
    form_name: 'devis_form',
    form_placement: 'devis_page',
    funnel_name: 'quote_request',
    page_type: 'quote_page',
    business_line: 'b2c',
    service_type: serviceType || undefined
  };
}

export function useDevisFormLogic() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const completedFields = useRef(new Set());
  const formStartTime = useRef(Date.now());
  const lastInteractionTime = useRef(Date.now());
  const latestServiceType = useRef('');

  // Track form entry on mount
  useEffect(() => {
    trackFunnelStep('quote_request', 'form_start', 1, buildDevisFormContext());

    // Track form abandonment on page exit
    const handleBeforeUnload = () => {
      const completionRate = Math.round((completedFields.current.size / Object.keys(initialFormData).length) * 100);
      if (completionRate > 0 && completionRate < 100) {
        const lastField = Array.from(completedFields.current).pop() || 'unknown';
        trackFormAbandonment('devis_form', lastField, completionRate, buildDevisFormContext(latestServiceType.current));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    latestServiceType.current = formData.typeService;
  }, [formData.typeService]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    lastInteractionTime.current = Date.now();
    const nextServiceType = name === 'typeService' ? value : formData.typeService;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Track field completion
    if ((type !== 'checkbox' && value.trim()) || (type === 'checkbox' && checked)) {
      if (!completedFields.current.has(name)) {
        completedFields.current.add(name);
        trackFormFieldComplete('devis_form', name, buildDevisFormContext(nextServiceType));
      }
    }

    // Track important field changes
    if (name === 'typeService' && value) {
      trackFunnelStep('quote_request', 'service_selected', 2, buildDevisFormContext(value));
    }
  };

  const handleFieldFocus = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const fieldName = target.getAttribute('name');
    if (!fieldName || fieldName === 'honeypotWebsite') {
      return;
    }

    trackFormFieldFocus(
      'devis_form',
      fieldName,
      target.getAttribute('type') || target.tagName.toLowerCase(),
      buildDevisFormContext(formData.typeService)
    );
  };

  const validateForm = () => {
    const failValidation = (message, fields = [], failureType = 'client_validation') => {
      setSubmitStatus({
        type: 'error',
        message
      });
      trackFormValidationFailed('devis_form', fields, failureType, buildDevisFormContext(formData.typeService));
      return false;
    };

    const required = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'ville', 'typeService'];
    const missing = required.filter(field => !formData[field].trim());

    if (missing.length > 0) {
      return failValidation(
        `Veuillez remplir les champs obligatoires: ${missing.join(', ')}`,
        missing,
        'required_fields_missing'
      );
    }

    // Validation matricule fiscale pour personne morale
    if (formData.typePersonne === 'morale') {
      if (!formData.matriculeFiscale.trim()) {
        return failValidation(
          'La matricule fiscale est obligatoire pour une personne morale',
          ['matriculeFiscale'],
          'missing_tax_id'
        );
      }

      // Validation format matricule fiscale tunisienne (7 chiffres + lettre ou 8 chiffres)
      const matriculeRegex = /^[0-9]{7}[A-Z]|[0-9]{8}$/;
      if (!matriculeRegex.test(formData.matriculeFiscale.replace(/\s/g, ''))) {
        return failValidation(
          'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres)',
          ['matriculeFiscale'],
          'invalid_tax_id'
        );
      }
    }

    // Validation des quantités selon le type de service
    if (formData.typeService === 'salon' && !formData.nombrePlaces) {
      return failValidation(
        'Veuillez indiquer le nombre de places pour le nettoyage de salon',
        ['nombrePlaces'],
        'missing_quantity'
      );
    }

    if (['tapis', 'marbre', 'tfc'].includes(formData.typeService) && !formData.surfaceService) {
      return failValidation(
        'Veuillez indiquer la surface à traiter',
        ['surfaceService'],
        'missing_surface'
      );
    }

    if (!formData.conditions) {
      return failValidation(
        'Vous devez accepter les conditions générales',
        ['conditions'],
        'terms_not_accepted'
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return failValidation(
        'Veuillez saisir une adresse email valide',
        ['email'],
        'invalid_email'
      );
    }

    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    if (!phoneRegex.test(formData.telephone)) {
      return failValidation(
        'Veuillez saisir un numéro de téléphone valide',
        ['telephone'],
        'invalid_phone'
      );
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

        // Track successful devis submission
        trackDevisSubmission(
          formData.typeService,
          formData.surfaceService || formData.nombrePlaces || 0,
          'form',
          buildDevisFormContext(formData.typeService)
        );
        trackFunnelComplete('quote_request', 'submit_success', 3, buildDevisFormContext(formData.typeService));

        // Track time to complete
        const timeToComplete = Math.round((Date.now() - formStartTime.current) / 1000);
        trackPerformance('devis_form_time', timeToComplete, 'seconds');

        // Reset form
        setFormData(initialFormData);
        completedFields.current.clear();
      } else {
        trackFormSubmitFailed('devis_form', result.failureType || result.status || 'submit_failed', buildDevisFormContext(formData.typeService));
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.'
        });
      }

    } catch (error) {
      console.error('Form submission error:', error);
      trackFormSubmitFailed('devis_form', 'network_error', buildDevisFormContext(formData.typeService));
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
    handleSubmit,
    handleFieldFocus
  };
}
