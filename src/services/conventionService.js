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
        error: validation.error
      };
    }

    const response = await fetch('/api/conventions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData }),
    }).catch(error => {
      console.error('Network error:', error);
      throw new Error('Erreur de connexion. Vérifiez votre connexion internet.');
    });

    if (!response) {
      throw new Error('Aucune réponse du serveur');
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Une erreur est survenue lors de l\'envoi de votre demande.'
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
      error: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
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
        error: `Le champ ${field} est obligatoire.`
      };
    }
  }

  // Validate matricule fiscale
  const matriculeRegex = /^[0-9]{7}[A-Z]$|^[0-9]{8}$/;
  if (!matriculeRegex.test(formData.matriculeFiscale.replace(/\s/g, ''))) {
    return {
      isValid: false,
      error: 'Format de matricule fiscale invalide (7 chiffres + lettre ou 8 chiffres).'
    };
  }

  // Validate at least one service selected
  if (!formData.servicesSouhaites || formData.servicesSouhaites.length === 0) {
    return {
      isValid: false,
      error: 'Veuillez sélectionner au moins un service.'
    };
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
