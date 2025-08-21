// Dynamic import for Google Generative AI - only loaded when API is called
let genAI = null;
let getSystemPromptServer = null;
let getAIConfigServer = null;
let getChatMessagesServer = null;

import { francAll } from "franc";

// Détection de langue avec support Arabizi tunisien
function detectTunArabizi(text) {
  const arabiziPattern = /[2375]/; // chiffres Arabizi courants
  const commonArabiziWords = /\b(3andi|nheb|mouch|labes|chna|zarbiya|kifech|ya)\b/i;

  if (arabiziPattern.test(text) || commonArabiziWords.test(text)) {
    return 'tun-arabizi'; // forcer la réponse en Arabizi
  }

  const francLang = francAll(text || "")?.[0]?.[0] || 'fra';
  if (francLang === 'ara') return 'ar';
  if (francLang === 'eng') return 'en';
  if (francLang === 'fra') return 'fr';
  return 'fr';
}

// Initialize AI libraries only when needed
async function initializeAI() {
  if (!genAI) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const tuningModule = await import('../../../utils/tuning-loader-server');

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    getSystemPromptServer = tuningModule.getSystemPromptServer;
    getAIConfigServer = tuningModule.getAIConfigServer;
    getChatMessagesServer = tuningModule.getChatMessagesServer;
  }
  return { genAI, getSystemPromptServer, getAIConfigServer, getChatMessagesServer };
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
    const { genAI, getSystemPromptServer, getAIConfigServer, getChatMessagesServer } = await withTimeout(
      initializeAI(), 30000
    );

    const body = await request.json();
    const { message, chatHistory } = body;

    const userLang = detectTunArabizi(message);

    // Vérification de la clé API
    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.startsWith('AIza')) {
      return Response.json({
        success: false,
        error: "Clé API invalide ou non définie. Appelez au 98-557-766 pour assistance.",
        details: process.env.GEMINI_API_KEY ? 'Format incorrect' : 'Non défini'
      }, { status: 401 });
    }

    // Charger prompts et config
    let systemPrompt, aiConfig;
    try {
      const fs = await import('fs');
      const path = await import('path');
      const tuningPath = path.join(process.cwd(), 'tuning');

      systemPrompt = JSON.parse(fs.readFileSync(path.join(tuningPath, 'ai-system-prompt.json'), 'utf8')).systemPrompt.fullPrompt;
      aiConfig = JSON.parse(fs.readFileSync(path.join(tuningPath, 'ai-config.json'), 'utf8'));
    } catch {
      systemPrompt = getSystemPromptServer();
      aiConfig = getAIConfigServer();
    }

    // Créer modèle et session
    const model = genAI.getGenerativeModel({ model: aiConfig.model.name });
    const chat = model.startChat({
      history: chatHistory || [],
      generationConfig: {
        maxOutputTokens: aiConfig.model.maxOutputTokens,
        temperature: aiConfig.model.temperature,
      },
    });

    let messageToSend = (!chatHistory || chatHistory.length === 0)
      ? `${systemPrompt}\n\nUser: ${message}`
      : message;

    // Instruction spécifique Arabizi
    if (userLang === 'tun-arabizi') {
      messageToSend = `Réponds en Arabizi tunisien : ${messageToSend}`;
    }

    const result = await withTimeout(chat.sendMessage(messageToSend), 120000);
    const text = (await result.response).text();

    return Response.json({
      success: true,
      message: text,
      chatHistory: chat.getHistory(),
      language: userLang
    });

  } catch (error) {
    console.error('Gemini API Error:', error);

    return Response.json({
      success: false,
      error: "Erreur lors de la génération de la réponse. Appelez au 98-557-766 si urgent.",
      details: error.message
    }, { status: 500 });
  }
}
