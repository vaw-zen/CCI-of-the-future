import { getAnalyticsContext } from '@/utils/analyticsGateway';

/**
 * Submit a convention request to the API
 * @param {Object} formData - The form data from the convention form
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function submitConventionRequest(formData) {
  try {
    const validation = validateConventionData(formData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        status: 'validation_failed',
        failureType: validation.failureType || 'validation_failed'
      };
    }

    const analyticsContext = getAnalyticsContext({
      lead_type: 'convention_request',
      business_line: 'b2b'
    });

    const response = await fetch('/api/conventions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData, analyticsContext }),
    }).catch(error => {
      console.error('Network error:', error);
      const networkError = new Error('Erreur de connexion. Vérifiez votre connexion internet.');
      networkError.failureType = 'network_error';
      throw networkError;
    });

    if (!response) {
      throw new Error('Aucune réponse du serveur');
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Une erreur est survenue lors de l\'envoi de votre demande.',
        status: result.status || 'submit_failed',
        failureType: result.status || 'submit_failed'
      };
    }

    return {
      success: true,
      data: result.data,
      details: result.details
    };

  } catch (error) {
    console.error('Convention submission error:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
      status: error.failureType || 'network_error',
      failureType: error.failureType || 'network_error'
    };
  }
}

/**
 * Validate convention form data before submission
 * @param {Object} formData
 * @returns {Object}
 */
function validateConventionData(formData) {
  const requiredFields = ['raisonSociale', 'matriculeFiscale', 'secteurActivite', 'contactNom', 'contactPrenom', 'email', 'telephone', 'frequence', 'dureeContrat'];

  for (const field of requiredFields) {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
      return {
        isValid: false,
        error: `Le champ ${field} est obligatoire.`,
        failureType: 'required_fields_missing'
      };
    }
  }

  // Validate matricule fiscale
  const matriculeRegex = /^[0-9]{7}[A-Z]$|^[0-9]{8}$/;
  if (!matriculeRegex.test(formData.matriculeFiscale.replace(/\s/g, ''))) {
    return {
      isValid: false,
      error: 'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres).',
      failureType: 'invalid_tax_id'
    };
  }

  // Validate at least one service selected
  if (!formData.servicesSouhaites || formData.servicesSouhaites.length === 0) {
    return {
      isValid: false,
      error: 'Veuillez sélectionner au moins un service.',
      failureType: 'missing_services'
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return {
      isValid: false,
      error: 'Veuillez saisir une adresse email valide.',
      failureType: 'invalid_email'
    };
  }

  // Validate phone format
  const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
  if (!phoneRegex.test(formData.telephone)) {
    return {
      isValid: false,
      error: 'Veuillez saisir un numéro de téléphone valide.',
      failureType: 'invalid_phone'
    };
  }

  // Validate conditions acceptance
  if (!formData.conditions) {
    return {
      isValid: false,
      error: 'Vous devez accepter les conditions générales.',
      failureType: 'terms_not_accepted'
    };
  }

  return { isValid: true };
}

async function getSupabaseClient() {
  const { supabase } = await import('@/libs/supabase');

  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  return supabase;
}

export async function getConventionRequests(options = {}) {
  try {
    const supabase = await getSupabaseClient();

    let query = supabase
      .from('convention_requests')
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
    console.error('Error fetching convention requests:', error);
    throw error;
  }
}
