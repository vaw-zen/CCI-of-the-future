// Enhanced dynamic import with Fares expert persona support
let genAI = null;
let tuningModule = null;

import { francAll } from "franc";

// Basic fallback language detection functions
function detectLanguageBasic(input) {
  if (!input) return 'french';
  
  const text = input.toLowerCase();
  
  // Any Arabic script (Tunisian) - treat as Arabizi for consistent response
  if (/[\u0600-\u06FF]/.test(text)) return 'arabizi';
  
  // Arabizi (numbers as letters + Tunisian words)
  if (/[3789]/.test(text) || ['ahla', 'bahi', 'normal', 'tawa', 'chwaya'].some(w => text.includes(w))) {
    return 'arabizi';
  }
  
  // English keywords
  const englishWords = ['hello', 'hi', 'cleaning', 'service', 'help'];
  if (englishWords.some(word => text.includes(word))) return 'english';
  
  // Default to French
  return 'french';
}

function detectUrgencyBasic(input) {
  if (!input) return false;
  const urgentWords = ['urgent', 'vite', 'emergency', 'maintenant', 'tawa'];
  return urgentWords.some(word => input.toLowerCase().includes(word));
}

// Enhanced AI initialization with Fares expert persona
async function initializeAI() {
  if (!genAI) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    tuningModule = await import('../../../utils/tuning-loader-server');

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('🎭 Initializing enhanced Fares persona system...');
  }
  return { genAI, tuningModule };
}

// Timeout wrapper
function withTimeout(promise, timeoutMs = 25000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
  ]);
}

export async function POST(request) {
  let body, message, chatHistory;
  
  try {
    const startTime = Date.now();
    
    // Parse request body first to catch JSON parsing errors early
    try {
      body = await request.json();
      message = body.message;
      chatHistory = body.chatHistory;
      
      if (!message || typeof message !== 'string') {
        console.error('❌ Invalid message format:', message);
        return Response.json({
          success: false,
          error: "Message invalide. Veuillez réessayer.",
          details: "Message field is required and must be a string"
        }, { status: 400 });
      }
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return Response.json({
        success: false,
        error: "Erreur de format de requête. Veuillez réessayer.",
        details: parseError.message
      }, { status: 400 });
    }

    const { genAI, tuningModule } = await withTimeout(initializeAI(), 30000);

    // Enhanced language and context detection using Fares system
    let userLanguage = 'french', isUrgent = false, formalityLevel = 'medium';
    
    try {
      // Test if tuning module functions exist before calling them
      if (tuningModule && typeof tuningModule.detectUserLanguage === 'function') {
        userLanguage = tuningModule.detectUserLanguage(message);
      } else {
        console.warn('⚠️ detectUserLanguage function not available, using basic detection');
        userLanguage = detectLanguageBasic(message);
      }
      
      if (tuningModule && typeof tuningModule.detectUrgency === 'function') {
        isUrgent = tuningModule.detectUrgency(message);
      } else {
        isUrgent = detectUrgencyBasic(message);
      }
      
      if (tuningModule && typeof tuningModule.detectFormalityLevel === 'function') {
        formalityLevel = tuningModule.detectFormalityLevel(message);
      } else {
        formalityLevel = 'medium';
      }
    } catch (detectionError) {
      console.error('⚠️ Language detection failed, using defaults:', detectionError);
      userLanguage = detectLanguageBasic(message);
      isUrgent = false;
      formalityLevel = 'medium';
    }
    
    console.log(`🌍 Language detected: ${userLanguage}`);
    console.log(`🚨 Urgency detected: ${isUrgent}`);
    console.log(`👔 Formality level: ${formalityLevel}`);

    // Vérification de la clé API - Accept various Gemini API key formats
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.length < 20) {
      console.error('❌ API Key validation failed:', process.env.GEMINI_API_KEY ? 'Too short' : 'Not defined');
      const errorMessage = tuningModule.getAdaptedErrorMessage('apiKeyError', userLanguage);
      return Response.json({
        success: false,
        error: errorMessage,
        details: process.env.GEMINI_API_KEY ? 'Invalid format' : 'Not defined'
      }, { status: 401 });
    }

    // Load enhanced Fares persona configuration
    let config, systemPrompt, aiConfig;
    
    try {
      config = tuningModule.loadTuningConfigServer();
      systemPrompt = tuningModule.getEnhancedSystemPrompt(userLanguage, isUrgent);
      aiConfig = config.aiConfig;
    } catch (configError) {
      console.error('❌ Config loading failed, using fallback:', configError);
      // Use fallback configuration
      systemPrompt = "Tu es l'assistant virtuel officiel de CCI Services, expert en nettoyage industriel et résidentiel. Tu présentes toujours les services de l'entreprise de manière claire et professionnelle.";
      aiConfig = {
        model: {
          name: "gemini-2.0-flash",
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      };
      config = { isEnhanced: false };
    }
    
    console.log(`🎭 Fares persona: ${config.isEnhanced ? 'ACTIVE' : 'FALLBACK'}`);
    console.log(`📝 System prompt length: ${systemPrompt.length} characters`);

    // Create basic model without system instruction (Gemini ignores language instructions in systemInstruction)
    const model = genAI.getGenerativeModel({ 
      model: aiConfig.model.name
    });
    
    const chat = model.startChat({
      history: chatHistory || [],
      generationConfig: {
        maxOutputTokens: aiConfig.model.maxOutputTokens,
        temperature: aiConfig.model.temperature,
      },
    });

    // Build comprehensive prompt with EVERYTHING in the message (not system instruction)
    const languageTemplates = {
      french: `Tu es Fares, expert technique CCI Services avec 15 ans d'expérience en nettoyage professionnel.

SERVICES CCI:
- Restauration marbre & granit
- Nettoyage industriel (ferries & yachts)  
- Nettoyage post-chantier
- Traitement tapis, moquettes, salons
- Services d'urgence 24/7
- Dégraissage industriel
- Tapisserie & rénovation mobilier
- Contact: 98-557-766

RÈGLE ABSOLUE DE LANGUE: Tu DOIS répondre UNIQUEMENT en français. PAS D'ANGLAIS DU TOUT. Si tu réponds en anglais, c'est une erreur grave.

Message du client: "${message}"

Réponds en français comme Fares avec ton expertise:`,

      english: `You are Fares, CCI Services' senior technical expert with 15+ years experience in professional cleaning.

CCI SERVICES:
- Marble & granite restoration
- Industrial cleaning (ferries & yachts)
- Post-construction cleaning
- Carpet, upholstery, salon treatment
- 24/7 emergency services
- Industrial degreasing
- Tapestry & furniture renovation
- Contact: 98-557-766

ABSOLUTE LANGUAGE RULE: You MUST respond ONLY in English. NO FRENCH AT ALL. If you respond in French, it's a serious error.

Client message: "${message}"

Respond in English as Fares with your expertise:`,

      arabizi: `Inta Fares, expert technique fi CCI Services men 15 ans fi cleaning professionnel.

SERVICES CCI:
- Restauration marbre w granit
- Cleaning industriel (ferries w yachts)
- Cleaning ba3d il chantier
- Traitement tapis, moquettes, salons
- Services urgence 24/7
- Dégraissage industriel
- Tapisserie w rénovation mobilier
- Contact: 98-557-766

RÈGLE ABSOLUE: Lazim tjaweb SEULEMENT bi Arabizi tunisien (mélange arabe-français ma3 ar9am: 3=ع, 7=ح, 9=ق, 8=غ, 5=خ). MAYEMKENECH tjaweb bi français klem wala bi anglais. Itha tjaweb bi langue okhra, error kbir.

Message mte3 client: "${message}"

Jaweb bi Arabizi tunisien comme Fares ma3 expertise mte3ek:`
    };

    const messageToSend = languageTemplates[userLanguage] || languageTemplates.french;
    console.log(`🗣️ Using ${userLanguage} template, length: ${messageToSend.length} characters`);

    const result = await withTimeout(chat.sendMessage(messageToSend), 120000);
    const text = (await result.response).text();

    console.log(`✅ Response generated (${text.length} chars) for ${userLanguage} user`);

    return Response.json({
      success: true,
      message: text,
      chatHistory: chat.getHistory(),
      language: userLanguage,
      faresPersona: config.isEnhanced,
      urgency: isUrgent
    });

  } catch (error) {
    console.error('❌ Enhanced Gemini API Error:', error);
    console.error('Error stack:', error.stack);
    
    // Try to detect language from the original message for error response
    let errorLanguage = 'french';
    let originalMessage = '';
    
    try {
      // Use already parsed body if available, otherwise try to parse
      if (body && body.message) {
        originalMessage = body.message;
        errorLanguage = tuningModule?.detectUserLanguage(body.message) || 'french';
      } else {
        // Only try to parse if we haven't already
        const requestBody = await request.json();
        originalMessage = requestBody.message || '';
        errorLanguage = tuningModule?.detectUserLanguage(requestBody.message) || 'french';
      }
    } catch (parseError) {
      console.error('❌ Failed to parse request body in error handler:', parseError);
    }
    
    // Get culturally appropriate error message
    const errorMessage = tuningModule?.getAdaptedErrorMessage('apiError', errorLanguage) || 
      "Fares ici ! Petit souci technique 😅 Appelez-moi au 98-557-766";

    return Response.json({
      success: false,
      error: errorMessage,
      details: error.message,
      debugInfo: {
        errorType: error.name,
        timestamp: new Date().toISOString(),
        userMessage: originalMessage.substring(0, 50) // First 50 chars for debugging
      }
    }, { status: 500 });
  }
}
