/**
 * API Key validation utility for CCI Services API
 * Validates API keys provided via x-api-key header
 */

/**
 * Validates the provided API key against the environment variable
 * @param {string} providedKey - The API key from the request header
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateApiKey(providedKey) {
  const validApiKey = process.env.API_KEY;
  
  // Check if API key is configured
  if (!validApiKey) {
    console.error('API_KEY not set in environment variables');
    return false;
  }
  
  // Check if key was provided
  if (!providedKey) {
    console.warn('No API key provided in request');
    return false;
  }
  
  // Validate the key
  const isValid = providedKey === validApiKey;
  
  if (!isValid) {
    console.warn('Invalid API key provided:', providedKey.substring(0, 8) + '...');
  }
  
  return isValid;
}

/**
 * Middleware function to validate API key from request headers
 * Use this in API routes to protect endpoints
 * @param {Request} request - The request object
 * @returns {Object|null} - Error response object or null if valid
 */
export function checkApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  
  if (!validateApiKey(apiKey)) {
    return Response.json(
      { 
        error: 'Unauthorized', 
        message: 'Valid API key required in x-api-key header' 
      },
      { status: 401 }
    );
  }
  
  return null; // Valid key
}