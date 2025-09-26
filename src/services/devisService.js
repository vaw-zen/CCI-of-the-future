import { supabase } from '../libs/supabase';

/**
 * Submit a devis request to Supabase
 * @param {Object} formData - The form data from the devis form
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function submitDevisRequest(formData) {
  try {
    // Transform form data to match database schema
    const devisData = {
      // Personal Information
      type_personne: formData.typePersonne,
      matricule_fiscale: formData.matriculeFiscale || null,
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      
      // Address Information
      adresse: formData.adresse,
      ville: formData.ville,
      code_postal: formData.codePostal || null,
      type_logement: formData.typeLogement,
      surface: formData.surface ? parseInt(formData.surface) : null,
      
      // Service Information
      type_service: formData.typeService,
      nombre_places: formData.nombrePlaces ? parseInt(formData.nombrePlaces) : null,
      surface_service: formData.surfaceService ? parseFloat(formData.surfaceService) : null,
      
      // Appointment Preferences
      date_preferee: formData.datePreferee || null,
      heure_preferee: formData.heurePreferee,
      
      // Additional Information
      message: formData.message || null,
      newsletter: formData.newsletter,
      conditions: formData.conditions
    };

    // Validate required fields based on service type
    const validation = validateDevisData(devisData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('devis_requests')
      .insert([devisData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.'
      };
    }

    // Trigger email notification (don't fail if this fails)
    try {
      const emailResponse = await fetch('/api/send-devis-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ devisId: data.id }),
      });
      
      if (!emailResponse.ok) {
        console.warn('Email notification failed with status:', emailResponse.status);
      } else {
        console.log('Email notification sent successfully');
      }
    } catch (emailError) {
      // Don't fail the submission if email fails
      console.warn('Email notification failed:', emailError);
    }

    return {
      success: true,
      data: data
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
 * Validate devis data before submission
 * @param {Object} data - The transformed devis data
 * @returns {Object} - Validation result
 */
function validateDevisData(data) {
  // Check required fields
  const requiredFields = ['type_personne', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'ville', 'type_service'];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      return {
        isValid: false,
        error: `Le champ ${field} est obligatoire.`
      };
    }
  }

  // Validate matricule fiscale for person morale
  if (data.type_personne === 'morale') {
    if (!data.matricule_fiscale || data.matricule_fiscale.trim() === '') {
      return {
        isValid: false,
        error: 'La matricule fiscale est obligatoire pour une personne morale.'
      };
    }
    
    // Validate matricule format (7 digits + letter or 8 digits)
    const matriculeRegex = /^[0-9]{7}[A-Z]$|^[0-9]{8}$/;
    if (!matriculeRegex.test(data.matricule_fiscale.replace(/\s/g, ''))) {
      return {
        isValid: false,
        error: 'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres).'
      };
    }
  }

  // Validate nombre_places for salon service
  if (data.type_service === 'salon') {
    if (!data.nombre_places || data.nombre_places <= 0) {
      return {
        isValid: false,
        error: 'Le nombre de places est obligatoire pour le nettoyage de salon.'
      };
    }
  }

  // Validate surface_service for specific services
  if (['tapis', 'marbre', 'tfc'].includes(data.type_service)) {
    if (!data.surface_service || data.surface_service <= 0) {
      return {
        isValid: false,
        error: `La surface à traiter est obligatoire pour le service ${data.type_service}.`
      };
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      isValid: false,
      error: 'Veuillez saisir une adresse email valide.'
    };
  }

  // Validate phone format
  const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
  if (!phoneRegex.test(data.telephone)) {
    return {
      isValid: false,
      error: 'Veuillez saisir un numéro de téléphone valide.'
    };
  }

  // Validate conditions acceptance
  if (!data.conditions) {
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