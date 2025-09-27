import { supabase } from '../libs/supabase';

/**
 * Submit a devis request to Supabase
 * @param {Object} formData - The form data from the devis form
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function submitDevisRequest(formData) {
  try {
    // Validate form data before sending
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Submit to our comprehensive API route that handles both DB save and emails
    const response = await fetch('/api/devis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Une erreur est survenue lors de l\'envoi de votre demande.'
      };
    }

    // Log newsletter subscription status
    if (result.details?.newsletterSubscribed) {
      console.log('✅ User automatically subscribed to newsletter');
    }

    return {
      success: true,
      data: result.data,
      details: result.details
    };

  } catch (error) {
    console.error('Submission error:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
    };
  }
}

/**
 * Validate form data before submission
 * @param {Object} formData - The form data from the devis form
 * @returns {Object} - Validation result
 */
function validateFormData(formData) {
  // Check required fields
  const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'ville', 'typeService'];
  
  for (const field of requiredFields) {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
      return {
        isValid: false,
        error: `Le champ ${field} est obligatoire.`
      };
    }
  }

  // Validate matricule fiscale for person morale
  if (formData.typePersonne === 'morale') {
    if (!formData.matriculeFiscale || formData.matriculeFiscale.trim() === '') {
      return {
        isValid: false,
        error: 'La matricule fiscale est obligatoire pour une personne morale.'
      };
    }
    
    // Validate matricule format (7 digits + letter or 8 digits)
    const matriculeRegex = /^[0-9]{7}[A-Z]$|^[0-9]{8}$/;
    if (!matriculeRegex.test(formData.matriculeFiscale.replace(/\s/g, ''))) {
      return {
        isValid: false,
        error: 'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres).'
      };
    }
  }

  // Validate nombre_places for salon service
  if (formData.typeService === 'salon') {
    if (!formData.nombrePlaces || formData.nombrePlaces <= 0) {
      return {
        isValid: false,
        error: 'Le nombre de places est obligatoire pour le nettoyage de salon.'
      };
    }
  }

  // Validate surface_service for specific services
  if (['tapis', 'marbre', 'tfc'].includes(formData.typeService)) {
    if (!formData.surfaceService || formData.surfaceService <= 0) {
      return {
        isValid: false,
        error: `La surface à traiter est obligatoire pour le service ${formData.typeService}.`
      };
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return {
      isValid: false,
      error: 'Veuillez saisir une adresse email valide.'
    };
  }

  // Validate phone format
  const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
  if (!phoneRegex.test(formData.telephone)) {
    return {
      isValid: false,
      error: 'Veuillez saisir un numéro de téléphone valide.'
    };
  }

  // Validate conditions acceptance
  if (!formData.conditions) {
    return {
      isValid: false,
      error: 'Vous devez accepter les conditions générales.'
    };
  }

  return { isValid: true };
}

/**
 * Get all devis requests (for admin use)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of devis requests
 */
export async function getDevisRequests(options = {}) {
  try {
    let query = supabase
      .from('devis_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching devis requests:', error);
    throw error;
  }
}

/**
 * Get a single devis request by ID
 * @param {string} id - The devis request ID
 * @returns {Promise<Object|null>} - The devis request or null
 */
export async function getDevisRequest(id) {
  try {
    const { data, error } = await supabase
      .from('devis_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching devis request:', error);
    throw error;
  }
}