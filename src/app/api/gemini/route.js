// Enhanced dynamic import with Fares expert persona support
let genAI = null;
let tuningModule = null;

import { francAll } from "franc";

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
    let userLanguage, isUrgent, formalityLevel;
    
    try {
      userLanguage = tuningModule.detectUserLanguage(message);
      isUrgent = tuningModule.detectUrgency(message);
      formalityLevel = tuningModule.detectFormalityLevel(message);
    } catch (detectionError) {
      console.error('⚠️ Language detection failed, using defaults:', detectionError);
      userLanguage = 'french';
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
          name: "gemini-1.5-flash",
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      };
      config = { isEnhanced: false };
    }
    
    console.log(`🎭 Fares persona: ${config.isEnhanced ? 'ACTIVE' : 'FALLBACK'}`);
    console.log(`📝 System prompt length: ${systemPrompt.length} characters`);

    // Create enhanced AI model with Fares persona
    const model = genAI.getGenerativeModel({ 
      model: aiConfig.model.name,
      systemInstruction: systemPrompt
    });
    
    const chat = model.startChat({
      history: chatHistory || [],
      generationConfig: {
        maxOutputTokens: aiConfig.model.maxOutputTokens,
        temperature: aiConfig.model.temperature,
      },
    });

    // Enhanced message preparation with cultural context
    let messageToSend = message;
    
    // Add greeting context for first message
    if (!chatHistory || chatHistory.length === 0) {
      const greeting = tuningModule.getAdaptedGreeting(userLanguage, formalityLevel);
      console.log(`👋 Fares greeting: ${greeting.substring(0, 50)}...`);
    }
    
    // Add language-specific instructions
    const languageInstructions = {
      french: "Répondez en français professionnel comme Fares, expert CCI.",
      arabic: "أجب باللغة العربية كفارس، خبير CCI مع 15 سنة خبرة.",
      english: "Respond in English as Fares, CCI's senior technical expert.",
      arabizi: "Réponds en Arabizi tunisien comme Fares, expert CCI men 15 ans."
    };
    
    if (languageInstructions[userLanguage]) {
      messageToSend = `${languageInstructions[userLanguage]}\n\nUser: "${message}"`;
    }

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
