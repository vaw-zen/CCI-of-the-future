import { useState, useEffect, useRef } from 'react';
import { submitConventionRequest } from '@/services/conventionService';
import {
  trackFunnelStep,
  trackFunnelComplete,
  trackFormFieldFocus,
  trackFormFieldComplete,
  trackFormAbandonment,
  trackConventionSubmission,
  trackServiceInteraction,
  SERVICE_TYPES,
  trackFormSubmitFailed,
  trackFormValidationFailed,
  trackPerformance
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

function buildConventionFormContext(secteurActivite = '') {
  return {
    form_name: 'convention_form',
    form_placement: 'entreprises_page',
    funnel_name: 'convention_request',
    page_type: 'b2b_page',
    business_line: 'b2b',
    service_type: SERVICE_TYPES.CONVENTION,
    company_sector: secteurActivite || undefined
  };
}

export function useConventionFormLogic() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const completedFields = useRef(new Set());
  const formStartTime = useRef(Date.now());
  const latestSector = useRef('');

  useEffect(() => {
    trackFunnelStep('convention_request', 'form_start', 1, buildConventionFormContext());

    const handleBeforeUnload = () => {
      const completionRate = Math.round((completedFields.current.size / Object.keys(initialFormData).length) * 100);
      if (completionRate > 0 && completionRate < 100) {
        const lastField = Array.from(completedFields.current).pop() || 'unknown';
        trackFormAbandonment(
          'convention_form',
          lastField,
          completionRate,
          buildConventionFormContext(latestSector.current)
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    latestSector.current = formData.secteurActivite;
  }, [formData.secteurActivite]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextSecteur = name === 'secteurActivite' ? value : formData.secteurActivite;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if ((type !== 'checkbox' && value.trim()) || (type === 'checkbox' && checked)) {
      if (!completedFields.current.has(name)) {
        completedFields.current.add(name);
        trackFormFieldComplete('convention_form', name, buildConventionFormContext(nextSecteur));
      }
    }

    if (name === 'secteurActivite' && value) {
      trackFunnelStep('convention_request', 'service_selected', 2, buildConventionFormContext(value));
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
      'convention_form',
      fieldName,
      target.getAttribute('type') || target.tagName.toLowerCase(),
      buildConventionFormContext(formData.secteurActivite)
    );
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
      trackFormFieldComplete('convention_form', 'servicesSouhaites', buildConventionFormContext(formData.secteurActivite));
    }
  };

  const validateForm = () => {
    const failValidation = (message, fields = [], failureType = 'client_validation') => {
      setSubmitStatus({
        type: 'error',
        message
      });
      trackFormValidationFailed('convention_form', fields, failureType, {
        ...buildConventionFormContext(formData.secteurActivite),
        services_count: formData.servicesSouhaites.length
      });
      return false;
    };

    const required = ['raisonSociale', 'matriculeFiscale', 'secteurActivite', 'contactNom', 'contactPrenom', 'email', 'telephone', 'frequence', 'dureeContrat'];
    const missing = required.filter(field => !formData[field] || (typeof formData[field] === 'string' && !formData[field].trim()));

    if (missing.length > 0) {
      return failValidation(
        'Veuillez remplir tous les champs obligatoires.',
        missing,
        'required_fields_missing'
      );
    }

    // Validate matricule fiscale
    const matriculeRegex = /^[0-9]{7}[A-Z]$|^[0-9]{8}$/;
    if (!matriculeRegex.test(formData.matriculeFiscale.replace(/\s/g, ''))) {
      return failValidation(
        'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres).',
        ['matriculeFiscale'],
        'invalid_tax_id'
      );
    }

    // Validate at least one service
    if (formData.servicesSouhaites.length === 0) {
      return failValidation(
        'Veuillez sélectionner au moins un service.',
        ['servicesSouhaites'],
        'missing_services'
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return failValidation(
        'Veuillez saisir une adresse email valide.',
        ['email'],
        'invalid_email'
      );
    }

    // Validate phone
    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    if (!phoneRegex.test(formData.telephone)) {
      return failValidation(
        'Veuillez saisir un numéro de téléphone valide.',
        ['telephone'],
        'invalid_phone'
      );
    }

    if (!formData.conditions) {
      return failValidation(
        'Vous devez accepter les conditions générales.',
        ['conditions'],
        'terms_not_accepted'
      );
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
        trackConventionSubmission({
          secteur: formData.secteurActivite,
          nombreSites: formData.nombreSites,
          servicesCount: formData.servicesSouhaites.length,
          frequence: formData.frequence,
          duree: formData.dureeContrat,
          surfaceTotale: formData.surfaceTotale,
          ...buildConventionFormContext(formData.secteurActivite)
        });
        trackFunnelComplete('convention_request', 'submit_success', 3, buildConventionFormContext(formData.secteurActivite));

        const timeToComplete = Math.round((Date.now() - formStartTime.current) / 1000);
        trackPerformance('convention_form_time', timeToComplete, 'seconds');

        setFormData(initialFormData);
        completedFields.current.clear();
      } else {
        trackFormSubmitFailed('convention_form', result.failureType || result.status || 'submit_failed', {
          ...buildConventionFormContext(formData.secteurActivite),
          services_count: formData.servicesSouhaites.length
        });
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Une erreur est survenue. Veuillez réessayer.'
        });
      }
    } catch (error) {
      console.error('Convention form submission error:', error);
      trackFormSubmitFailed('convention_form', 'network_error', {
        ...buildConventionFormContext(formData.secteurActivite),
        services_count: formData.servicesSouhaites.length
      });
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
    handleFieldFocus,
    SERVICES_OPTIONS
  };
}
