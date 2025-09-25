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
  try {
    const startTime = Date.now();
    const { genAI, tuningModule } = await withTimeout(initializeAI(), 30000);

    const body = await request.json();
    const { message, chatHistory } = body;

    // Enhanced language and context detection using Fares system
    const userLanguage = tuningModule.detectUserLanguage(message);
    const isUrgent = tuningModule.detectUrgency(message);
    const formalityLevel = tuningModule.detectFormalityLevel(message);
    
    console.log(`🌍 Language detected: ${userLanguage}`);
    console.log(`🚨 Urgency detected: ${isUrgent}`);
    console.log(`👔 Formality level: ${formalityLevel}`);

    // Vérification de la clé API
    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.startsWith('AIza')) {
      const errorMessage = tuningModule.getAdaptedErrorMessage('apiKeyError', userLanguage);
      return Response.json({
        success: false,
        error: errorMessage,
        details: process.env.GEMINI_API_KEY ? 'Format incorrect' : 'Non défini'
      }, { status: 401 });
    }

    // Load enhanced Fares persona configuration
    const config = tuningModule.loadTuningConfigServer();
    const systemPrompt = tuningModule.getEnhancedSystemPrompt(userLanguage, isUrgent);
    const aiConfig = config.aiConfig;
    
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
    
    // Try to detect language from the original message for error response
    let errorLanguage = 'french';
    try {
      const body = await request.json();
      errorLanguage = tuningModule?.detectUserLanguage(body.message) || 'french';
    } catch {}
    
    // Get culturally appropriate error message
    const errorMessage = tuningModule?.getAdaptedErrorMessage('apiError', errorLanguage) || 
      "Fares ici ! Petit souci technique 😅 Appelez-moi au 98-557-766";

    return Response.json({
      success: false,
      error: errorMessage,
      details: error.message
    }, { status: 500 });
  }
}
