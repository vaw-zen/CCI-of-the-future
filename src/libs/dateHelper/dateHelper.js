// French Language Helper Functions
// Contains all French-specific functionality including date formatting, error messages, and UI text

// ===============================
// FRENCH DATE CONSTANTS
// ===============================
const FRENCH_MONTH_NAMES = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const FRENCH_MONTH_MAP = {
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
  };
  
  // ===============================
  // FRENCH UI TEXT CONSTANTS
  // ===============================
  export const FRENCH_UI_TEXT = {
    // File upload messages
    DROP_FILE_RELEASE: 'Relâchez pour télécharger vos fichiers',
    DROP_FILE_BROWSE: 'Glissez et déposez vos fichiers ici, ou parcourez',
  
    // Common success messages
    CLIPBOARD_SUCCESS: 'Données copiées dans le presse-papiers!',
    OPERATION_SUCCESS: 'Opération réussie.',
    PROFILE_UPDATED: 'Profil mis à jour avec succès',
  
    // Common error messages
    GENERIC_ERROR: 'Une erreur s\'est produite',
    API_ERROR: 'Erreur lors de l\'opération. Veuillez réessayer.',
    NETWORK_ERROR: 'Erreur réseau. Veuillez vérifier votre connexion.',
  
    // Date relative expressions
    TODAY: 'Aujourd\'hui',
    YESTERDAY: 'Hier',
    DAYS_AGO: 'Il y a',
    DAYS_SUFFIX: 'jours',
  
    // Time expressions
    TIME_SEPARATOR: ', à',
    TIME_SEPARATOR_NAMED: ',',
  
    // Import/Export messages
    IMPORT_SUCCESS: 'Import terminé avec succès',
    EXPORT_SUCCESS: 'Export terminé avec succès',
    IMPORT_ERROR: 'Erreur lors de l\'importation',
    EXPORT_ERROR: 'Erreur lors de l\'exportation',
  
    // User management
    USER_ADDED: 'Utilisateur ajouté avec succès',
    USER_UPDATED: 'Utilisateur mis à jour avec succès',
    USER_DELETED: 'Utilisateur supprimé avec succès',
  
    // Company management
    COMPANY_CREATED: 'Entreprise créée avec succès',
    COMPANY_UPDATED: 'Entreprise mise à jour avec succès',
    COMPANY_DELETED: 'Entreprise supprimée avec succès',
  
    // Team management
    TEAM_CREATED: 'Équipe créée avec succès',
    TEAM_UPDATED: 'Équipe mise à jour avec succès',
    TEAM_DELETED: 'Équipe supprimée avec succès',
  
    // Status management
    STATUS_CREATED: 'Statut créé avec succès',
    STATUS_UPDATED: 'Statut mis à jour avec succès',
  
    // Loading messages
    LOADING_IMPORT: 'Importation en cours...',
    LOADING_EXPORT: 'Exportation en cours...',
    LOADING_SAVE: 'Sauvegarde en cours...',
    LOADING_DELETE: 'Suppression en cours...',
    LOADING_UPDATE: 'Mise à jour en cours...',
  
    // Confirmation messages
    CONFIRM_DELETE: 'Êtes-vous sûr de vouloir supprimer',
    CONFIRM_RESET: 'Êtes-vous sûr de vouloir réinitialiser',
  
    // Pluralization helpers
    COMPANY_SINGULAR: 'entreprise',
    COMPANY_PLURAL: 'entreprises',
    USER_SINGULAR: 'utilisateur',
    USER_PLURAL: 'utilisateurs',
    ERROR_SINGULAR: 'erreur',
    ERROR_PLURAL: 'erreurs',
    SUCCESS_SINGULAR: 'succès',
    SUCCESS_PLURAL: 'succès',
  };
  
  // ===============================
  // FRENCH DATE FORMATTING
  // ===============================
  
  /**
   * Format a date string to French format with various options
   * @param {string|Date} dateString - ISO date string, date string, or Date object
   * @param {boolean} actif - If true, always return standard format
   * @param {boolean} namedMonth - If true, use French month names
   * @param {Object} hide - Object to control which parts to hide
   * @returns {string} Formatted French date string
   */
  export function formatDate(dateString, actif = false, namedMonth = false, hide = {
    time: false,
    month: false,
    year: false,
    day: false,
  }) {
    // Handle Date objects directly
    let date;
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string') {
      // More flexible date parsing - try to parse various formats
      date = new Date(dateString);
    } else {
      return String(dateString); // Return original value if not a valid input
    }
  
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return String(dateString); // Return original string if parsing failed
    }
  
    // Use client's local time - the Date object automatically handles timezone conversion
    const now = new Date();
  
    // Format hours and minutes with leading zeros if time component exists and not hidden
    const hasTimeComponent = (typeof dateString === 'string' && dateString.includes('T')) ||
      (dateString instanceof Date) ||
      (date.getHours() !== 0 || date.getMinutes() !== 0);
    const timeString = (!hide.time && hasTimeComponent)
      ? `${namedMonth ? FRENCH_UI_TEXT.TIME_SEPARATOR_NAMED : FRENCH_UI_TEXT.TIME_SEPARATOR} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      : '';
  
    // Get month name if namedMonth is true and month is not hidden
    const month = !hide.month
      ? (namedMonth ? FRENCH_MONTH_NAMES[date.getMonth()] : (date.getMonth() + 1).toString().padStart(2, '0'))
      : '';
  
    // Get day and year if not hidden
    const day = !hide.day ? date.getDate().toString().padStart(2, '0') : '';
    const year = !hide.year ? date.getFullYear() : '';
  
    // Build the date parts array
    const dateParts = [];
    if (!hide.day) dateParts.push(day);
    if (!hide.month) dateParts.push(month);
    if (!hide.year) dateParts.push(year);
  
    // Create the standard format based on which parts are visible
    const standardFormat = namedMonth
      ? dateParts.join(' ')
      : dateParts.join('/');
  
    // If actif is true, always return standard format
    if (actif) {
      return `${standardFormat}${timeString}`.trim();
    }
  
    // Calculate days difference
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const daysDiff = Math.floor((todayStart - dateStart) / (1000 * 60 * 60 * 24));
  
    // Format based on how recent the date is
    if (daysDiff === 0) {
      return `${FRENCH_UI_TEXT.TODAY}${timeString}`;
    } else if (daysDiff === 1) {
      return `${FRENCH_UI_TEXT.YESTERDAY}${timeString}`;
    } else if (daysDiff > 1 && daysDiff < 7) {
      return `${FRENCH_UI_TEXT.DAYS_AGO} ${daysDiff} ${FRENCH_UI_TEXT.DAYS_SUFFIX}${timeString}`;
    } else {
      return `${standardFormat}${timeString}`.trim();
    }
  }
  
  /**
   * Parse a French formatted date string back to a Date object
   * @param {string} frenchDateString - Date string in format "15 décembre 2023"
   * @returns {Date|null} - Parsed Date object or null if parsing fails
   */
  export function parseFrenchDate(frenchDateString) {
    if (!frenchDateString || frenchDateString === '—') {
      return null;
    }
  
    try {
      const parts = frenchDateString.trim().split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = FRENCH_MONTH_MAP[parts[1].toLowerCase()];
        const year = parseInt(parts[2]);
  
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    } catch (error) {
      console.warn('Error parsing French date:', frenchDateString, error);
    }
  
    return null;
  }
  
  /**
   * Check if a date (or date string) is within a specified time period from now
   * @param {Date|string} date - Date object, ISO date string, or French formatted date
   * @param {Object} period - Time period object with unit and value
   * @param {number} period.value - Number of time units
   * @param {'days'|'weeks'|'months'|'years'|'hours'|'minutes'} period.unit - Time unit
   * @returns {boolean} - True if date is within the specified period
   */
  export function isWithin(date, period) {
    if (!date || !period || !period.value || !period.unit) return false;
  
    let dateObj;
  
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Try parsing as ISO date first
      dateObj = new Date(date);
  
      // If ISO parsing failed, try French date parsing
      if (isNaN(dateObj.getTime())) {
        dateObj = parseFrenchDate(date);
      }
    } else {
      return false;
    }
  
    if (!dateObj || isNaN(dateObj.getTime())) {
      return false;
    }
  
    const now = new Date();
    const periodAgo = new Date(now);
  
    // Calculate the past date based on the period
    switch (period.unit.toLowerCase()) {
      case 'minutes':
        periodAgo.setMinutes(now.getMinutes() - period.value);
        break;
      case 'hours':
        periodAgo.setHours(now.getHours() - period.value);
        break;
      case 'days':
        periodAgo.setDate(now.getDate() - period.value);
        break;
      case 'weeks':
        periodAgo.setDate(now.getDate() - (period.value * 7));
        break;
      case 'months':
        periodAgo.setMonth(now.getMonth() - period.value);
        break;
      case 'years':
        periodAgo.setFullYear(now.getFullYear() - period.value);
        break;
      default:
        console.warn('Unsupported time unit:', period.unit);
        return false;
    }
  
    return dateObj > periodAgo;
  }
  
  /**
   * Check if a date (or date string) is within the last week
   * @param {Date|string} date - Date object, ISO date string, or French formatted date
   * @returns {boolean} - True if date is within the last 7 days
   * @deprecated Use isWithin(date, { value: 1, unit: 'weeks' }) instead
   */
  export function isWithinLastWeek(date) {
    return isWithin(date, { value: 1, unit: 'weeks' });
  }
  
  // Convenience helper functions for common time periods
  export const timeHelpers = {
    /**
     * Check if date is within the last N days
     */
    isWithinDays: (date, days) => isWithin(date, { value: days, unit: 'days' }),
  
    /**
     * Check if date is within the last N weeks
     */
    isWithinWeeks: (date, weeks) => isWithin(date, { value: weeks, unit: 'weeks' }),
  
    /**
     * Check if date is within the last N months
     */
    isWithinMonths: (date, months) => isWithin(date, { value: months, unit: 'months' }),
  
    /**
     * Check if date is within the last N hours
     */
    isWithinHours: (date, hours) => isWithin(date, { value: hours, unit: 'hours' }),
  
    /**
     * Check if date is within the last N minutes
     */
    isWithinMinutes: (date, minutes) => isWithin(date, { value: minutes, unit: 'minutes' }),
  
    // Common presets
    isWithinLastDay: (date) => isWithin(date, { value: 1, unit: 'days' }),
    isWithinLastWeek: (date) => isWithin(date, { value: 1, unit: 'weeks' }),
    isWithinLastMonth: (date) => isWithin(date, { value: 1, unit: 'months' }),
    isWithinLastYear: (date) => isWithin(date, { value: 1, unit: 'years' }),
    isWithinLastHour: (date) => isWithin(date, { value: 1, unit: 'hours' }),
  };
  
  // ===============================
  // FRENCH ERROR HANDLING
  // ===============================
  
  /**
   * A helper function to return a French error message.
   * This function currently returns a default message for each error context.
   * In a more complex scenario, we might map backend error codes to French user friendly messages.
   * @param {string} defaultFrenchMessage - Default French error message
   * @returns {string} French error message
   */
  export const getFrenchErrorMessage = (defaultFrenchMessage) => {
    return defaultFrenchMessage;
  };
  
  /**
   * Extract error message from API error response with fallback hierarchy
   * @param {Error} error - The error object from API call
   * @param {string} fallbackMessage - Default fallback message to use
   * @returns {string} - The extracted error message
   */
  export const getApiErrorMessage = (error, fallbackMessage) => {
    return error?.response?.data?.message ||
      error?.message ||
      fallbackMessage;
  };
  
  /**
   * Display partial errors or warnings from a successful API response
   * 
   * @param {Function} addToast - The toast notification function
   * @param {Object} data - The API response data that might contain errors
   * @param {Object} options - Additional options
   * @param {number} options.duration - Duration to show the warning (default: 8000ms)
   * @param {Function} options.formatMessage - Custom function to format the error message
   * @param {string} options.toastType - Type of toast to display (default: "warning")
   */
  export const displayPartialErrors = (addToast, data, options = {}) => {
    if (!data || !data.errors || !Array.isArray(data.errors) || data.errors.length === 0) {
      return;
    }
  
    const duration = options.duration || 8000;
    const toastType = options.toastType || "warning";
  
    data.errors.forEach(error => {
      // Allow custom message formatting if provided
      let message;
      if (options.formatMessage && typeof options.formatMessage === 'function') {
        message = options.formatMessage(error);
      } else {
        // Default message handling for different error formats
        message = error.company ?
          `${error.company.name}: ${error.message}` :
          (typeof error === 'string' ? error : error.message || FRENCH_UI_TEXT.GENERIC_ERROR);
      }
  
      addToast({
        type: toastType,
        message,
        duration,
      });
    });
  };
  
  /**
   * Display success toast with optional warnings for partial errors
   * Helper function for use in React Query onSuccess callbacks
   * 
   * @param {Function} addToast - The toast notification function
   * @param {Object} data - The API response data
   * @param {string} defaultMessage - Default success message if data.message is not provided
   * @param {Object} options - Additional options
   * @param {number} options.successDuration - Duration to show success message (default: 4000ms)
   * @param {number} options.warningDuration - Duration to show warning message (default: 8000ms)
   * @param {Function} options.formatWarningMessage - Custom function to format warning messages
   * @param {string} options.warningType - Type of toast to display for warnings (default: "warning")
   * @param {Function} options.onSuccess - Additional callback to run on success
   */
  export const showSuccessWithWarnings = (addToast, data, defaultMessage, options = {}) => {
    // Show success message
    addToast({
      type: "success",
      message: data?.message || defaultMessage,
      duration: options.successDuration || 4000,
    });
  
    // Show any warnings
    displayPartialErrors(addToast, data, {
      duration: options.warningDuration || 8000,
      formatMessage: options.formatWarningMessage,
      toastType: options.warningType || "warning",
    });
  
    // Execute additional success logic if provided
    if (options.onSuccess && typeof options.onSuccess === 'function') {
      options.onSuccess(data);
    }
  };
  
  // ===============================
  // FRENCH MESSAGE BUILDERS
  // ===============================
  
  /**
   * Build French success message with proper pluralization
   * @param {string} action - The action performed (e.g., 'importé', 'créé', 'mis à jour')
   * @param {number} count - Number of items
   * @param {string} singular - Singular form of the item (e.g., 'entreprise', 'utilisateur')
   * @param {string} plural - Plural form of the item (e.g., 'entreprises', 'utilisateurs')
   * @returns {string} Properly formatted French message
   */
  export const buildSuccessMessage = (action, count, singular, plural) => {
    const itemWord = count > 1 ? plural : singular;
    const actionWord = count > 1 ? `${action}s` : action;
    return `${count} ${itemWord} ${actionWord} avec succès`;
  };
  
  /**
   * Build French error message with proper pluralization
   * @param {string} action - The action that failed (e.g., 'importation', 'création', 'mise à jour')
   * @param {number} count - Number of items that failed
   * @param {string} singular - Singular form of the item
   * @param {string} plural - Plural form of the item
   * @returns {string} Properly formatted French error message
   */
  export const buildErrorMessage = (action, count, singular, plural) => {
    const itemWord = count > 1 ? plural : singular;
    const errorWord = count > 1 ? FRENCH_UI_TEXT.ERROR_PLURAL : FRENCH_UI_TEXT.ERROR_SINGULAR;
    return `${count} ${errorWord} lors de l'${action} ${count > 1 ? 'des' : 'de la'} ${itemWord}`;
  };
  
  /**
   * Build French confirmation message
   * @param {string} action - The action to confirm (e.g., 'supprimer', 'réinitialiser')
   * @param {number} count - Number of items
   * @param {string} singular - Singular form of the item
   * @param {string} plural - Plural form of the item
   * @param {string} additionalContext - Additional context (e.g., 'avec le statut actif')
   * @returns {string} Properly formatted French confirmation message
   */
  export const buildConfirmationMessage = (action, count, singular, plural, additionalContext = '') => {
    const itemWord = count > 1 ? plural : singular;
    const countText = count > 1 ? `les ${count}` : `la`;
    const additionalText = additionalContext ? ` ${additionalContext}` : '';
    return `Êtes-vous sûr de vouloir ${action} ${countText} ${itemWord}${additionalText} ?`;
  };
  
  /**
   * Get French drop file text based on drag state
   * @param {boolean} isDragActive - Whether drag is currently active
   * @returns {string} Appropriate French text for drop zone
   */
  export const getDropFileText = (isDragActive) => {
    return isDragActive ? FRENCH_UI_TEXT.DROP_FILE_RELEASE : FRENCH_UI_TEXT.DROP_FILE_BROWSE;
  };
  
  /**
   * Handle clipboard copy with French success message
   * @param {any} data - Data to copy to clipboard
   * @param {Function} showToast - Optional toast function to show success message
   * @returns {Promise} Promise that resolves when copy is complete
   */
  export const clipboard = (data, showToast = null) => {
    const jsonString = JSON.stringify(data, null, 2);
    return navigator.clipboard.writeText(jsonString)
      .then(() => {
        // Optional: Show success message via toast if available
        if (typeof showToast === 'function') {
          showToast({
            type: 'success',
            message: FRENCH_UI_TEXT.CLIPBOARD_SUCCESS,
            duration: 3000
          });
        }
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };
  
  // ===============================
  // FRENCH PLURALIZATION UTILITIES
  // ===============================
  
  /**
   * Get correct plural form for French words
   * @param {number} count - Number of items
   * @param {string} singular - Singular form
   * @param {string} plural - Plural form
   * @returns {string} Correct form based on count
   */
  export const pluralize = (count, singular, plural) => {
    return count > 1 ? plural : singular;
  };
  
  /**
   * Get correct verb form for French verbs based on count
   * @param {number} count - Number of items
   * @param {string} singular - Singular verb form
   * @param {string} plural - Plural verb form
   * @returns {string} Correct verb form based on count
   */
  export const pluralizeVerb = (count, singular, plural) => {
    return count > 1 ? plural : singular;
  };
  
  // ===============================
  // CLIENT-SIDE DATE UTILITIES
  // ===============================
  
  /**
   * Get current date in client's local timezone formatted as YYYY-MM-DD
   * @returns {string} Current date in YYYY-MM-DD format
   */
  export const getCurrentDateString = () => {
    const today = new Date();
    return today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
  };
  
  /**
   * Convert a date to client's local timezone formatted as YYYY-MM-DD
   * @param {Date|string} date - Date object or date string
   * @returns {string} Date in YYYY-MM-DD format in client's timezone
   */
  export const toLocalDateString = (date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return getCurrentDateString(); // Fallback to current date
    }
    return dateObj.getFullYear() + '-' +
      String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
      String(dateObj.getDate()).padStart(2, '0');
  };
  
  /**
   * Check if two dates are the same day in client's local timezone
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @returns {boolean} True if dates are the same day
   */
  export const isSameLocalDay = (date1, date2) => {
    return toLocalDateString(date1) === toLocalDateString(date2);
  };
  
  /**
   * Get current year in client's local timezone
   * @returns {number} Current year
   */
  export const getCurrentYear = () => {
    return new Date().getFullYear();
  };
  
  /**
   * Format date for French locale with various display options
   * This is a more flexible alternative to toLocaleDateString with French formatting
   * @param {Date|string} date - Date object or date string
   * @param {Object} options - Formatting options
   * @param {boolean} options.includeTime - Include time in the output
   * @param {boolean} options.shortFormat - Use short format (DD/MM/YYYY vs full month names)
   * @returns {string} Formatted date string in French
   */
  export const formatFrenchDate = (date, options = {}) => {
    const { includeTime = false, shortFormat = false } = options;
  
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '—';
    }
  
    if (shortFormat) {
      // Use DD/MM/YYYY format
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const dateStr = `${day}/${month}/${year}`;
  
      if (includeTime) {
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${dateStr} à ${hours}:${minutes}`;
      }
      return dateStr;
    } else {
      // Use full French format with month names
      return formatDate(date, true, true, { time: !includeTime });
    }
  };
  
  /**
   * Format date for file names (safe characters only)
   * @param {Date|string} date - Date object or date string
   * @returns {string} Date formatted as DD-MM-YYYY for file names
   */
  export const formatDateForFileName = (date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return formatDateForFileName(new Date()); // Fallback to current date
    }
  
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  /**
   * Combine date and time strings into a UTC ISO string for API submission
   * The user enters local time, but we send UTC to the API for consistency across timezones
   * @param {string} dateString - Date string in YYYY-MM-DD format (local date)
   * @param {string} timeString - Time string in HH:MM format (local time)
   * @returns {string} ISO string in UTC format for API
   */
  export const combineDateTimeToISO = (dateString, timeString) => {
    if (!dateString || !timeString) {
      return null;
    }
  
    // Parse the date and time components
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);
  
    // Create a date object in the local timezone (what the user intended)
    const localDate = new Date(year, month - 1, day, hours, minutes);
  
    // Check if the date is valid
    if (isNaN(localDate.getTime())) {
      console.warn('Invalid date/time combination:', dateString, timeString);
      return null;
    }
  
    // Return ISO string in UTC - this is what the API expects
    // The API will store this UTC time, and when it's retrieved, 
    // it should be converted back to local time for display
    return localDate.toISOString();
  };
  
  /**
   * Format a UTC date string from API to local time for display
   * This ensures API responses are displayed in the user's local timezone
   * @param {string} utcDateString - UTC date string from API
   * @param {boolean} actif - If true, always return standard format
   * @param {boolean} namedMonth - If true, use French month names
   * @param {Object} hide - Object to control which parts to hide
   * @returns {string} Formatted French date string in local timezone
   */
  export const formatApiDate = (utcDateString, actif = false, namedMonth = false, hide = {
    time: false,
    month: false,
    year: false,
    day: false,
  }) => {
    if (!utcDateString) return '';
  
    // Create Date object from UTC string - this automatically converts to local timezone
    const localDate = new Date(utcDateString);
  
    // Use the existing formatDate function which works with Date objects
    return formatDate(localDate, actif, namedMonth, hide);
  };
  
  // ===============================
  // EXPORTS
  // ===============================
  
  // Export commonly used constants for direct access
  export const FRENCH_MONTHS = FRENCH_MONTH_NAMES;
  export const FRENCH_MONTH_MAPPING = FRENCH_MONTH_MAP;
  
  // Export all French text constants for easy access
  export { FRENCH_UI_TEXT as TEXT };
  