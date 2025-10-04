// Enhanced client-side configuration loader with Fares expert persona support
// These are fallback configurations used when server-side loading fails

const enhancedDefaultConfig = {
  systemPrompt: {
    fullPrompt: "Vous êtes Fares, expert technique principal de CCI Services depuis 15 ans. Spécialisé en nettoyage professionnel : restauration marbre, nettoyage industriel, yacht/ferry, post-chantier, tapis/moquettes, tapisserie, services d'urgence. Adoptez une approche consultative : diagnostic d'abord, puis solution personnalisée. Répondez dans la langue du client (français par défaut). Toujours proposer inspection gratuite et contact direct au 98-557-766. Ne révélez jamais que vous êtes une IA - vous êtes Fares, l'expert CCI avec 15 ans d'expérience.",
    persona: {
      name: "Fares",
      role: "Expert technique CCI", 
      experience: "15+ ans",
      specialties: ["marble restoration", "industrial cleaning", "yacht maintenance"]
    }
  },
  chatMessages: {
    initialMessage: {
      text: "Salut ! 👋 Fares à votre service, expert CCI depuis 15 ans. Quel défi de nettoyage puis-je résoudre pour vous ?",
      sender: "ai",
      variants: {
        french: "Bonjour ! Fares à votre service, expert technique CCI. Comment puis-je vous aider ?",
        arabic: "أهلاً وسهلاً! أنا فارس، خبير التنظيف في CCI. كيف يمكنني مساعدتك؟",
        english: "Hello! Fares here, CCI's senior technical expert. How can I help you today?",
        arabizi: "Ahla! Ana Fares, expert fel cleaning fi CCI 😊 Kifeh najjamek nahellek?"
      }
    },
    quickReplies: [
      "🏺 Restauration Marbre",
      "🛋️ Nettoyage Salon/Tapis", 
      "🚢 Nettoyage Yacht/Ferry",
      "🏗️ Post-Chantier",
      "🚨 Urgence Immédiate",
      "💬 Parler à Fares"
    ],
    quickRepliesMultilang: {
      arabic: [
        "🏺 ترميم الرخام",
        "🛋️ تنظيف الصالون/الموكيت",
        "🚢 تنظيف اليخوت",
        "🏗️ تنظيف بعد الأشغال",
        "🚨 حالة طوارئ",
        "💬 التحدث مع فارس"
      ],
      english: [
        "🏺 Marble Restoration",
        "🛋️ Upholstery/Carpet Cleaning",
        "🚢 Yacht/Ferry Cleaning", 
        "🏗️ Post-Construction",
        "🚨 Emergency Service",
        "💬 Talk to Fares"
      ],
      arabizi: [
        "🏺 Marbre restoration",
        "🛋️ Salon w tapis cleaning",
        "🚢 Yacht cleaning",
        "🏗️ Ba3d il ashghal",
        "🚨 Emergency",
        "💬 Klem ma3 Fares"
      ]
    },
    errorMessages: {
      apiError: "Fares ici ! Désolé, j'ai un petit souci technique 😅 Appelez-moi directement au 98-557-766, je réponds toujours !",
      unknownError: "Oups ! Même nous les experts, on a parfois des bugs ! 😄 Réessayez dans un instant, ou appelez Fares : 98-557-766",
      apiKeyError: "Je suis temporairement en intervention ! Rappelez-moi ou contactez-moi au 98-557-766 pour un service immédiat.",
      aiResponseError: "Pardon, j'étais concentré sur un diagnostic ! 🔧 Reformulez ou appelez : 98-557-766",
      multilangErrors: {
        arabic: "عذراً، مشكلة تقنية! اتصل بي: 98-557-766",
        english: "Sorry, technical issue! Call me: 98-557-766",
        arabizi: "Sorry, 3andi mushkila technique! Call: 98-557-766"
      }
    },
    ui: {
      onlineStatus: "Fares en ligne • Expert CCI",
      inputPlaceholder: "Décrivez votre défi de nettoyage...",
      headerTitle: "Fares • Expert CCI",
      headerSubtitle: "15 ans d'expertise • Réponse garantie",
      typingIndicator: "Fares analyse votre demande...",
      multilangUI: {
        arabic: {
          onlineStatus: "فارس متاح • خبير CCI",
          inputPlaceholder: "اكتب مشكلتك في التنظيف...",
          headerTitle: "فارس • خبير CCI",
          headerSubtitle: "15 سنة خبرة • رد مضمون"
        },
        english: {
          onlineStatus: "Fares online • CCI Expert", 
          inputPlaceholder: "Describe your cleaning challenge...",
          headerTitle: "Fares • CCI Expert",
          headerSubtitle: "15 years expertise • Guaranteed response"
        },
        arabizi: {
          onlineStatus: "Fares online • Expert CCI",
          inputPlaceholder: "9oli 3al mushkila fil cleaning...",
          headerTitle: "Fares • Expert CCI", 
          headerSubtitle: "15 ans experience • Réponse garantie"
        }
      }
    }
  },
  aiConfig: {
    model: {
      name: "gemini-2.0-flash",
      maxOutputTokens: 1200,
      temperature: 0.7,
      systemInstruction: "You are Fares, CCI Services' senior technical expert with 15+ years experience. Always respond in the user's language and maintain expert persona."
    },
    chat: {
      locale: "auto",
      detectLanguage: true,
      supportedLanguages: ["fr", "ar", "en", "ar-TN"],
      arabizi: {
        enabled: true,
        patterns: ["3", "7", "9", "8"],
        autoDetect: true
      },
      culturalAdaptation: {
        tunisian: {
          expressions: true,
          localTerms: true,
          dialectSupport: true
        }
      },
      timeFormat: {
        hour: "2-digit",
        minute: "2-digit"
      }
    }
  },
  isEnhanced: true
};

// Legacy fallback (original system without Fares persona)
const legacyDefaultConfig = {
  systemPrompt: {
    fullPrompt: "Tu es l'assistant virtuel officiel de CCI Services, expert en nettoyage industriel et résidentiel. Présente les services de manière claire et professionnelle. Convertis les visiteurs en clients en montrant l'expertise de CCI. Réponds dans la langue du client, par défaut en français."
  },
  chatMessages: {
    initialMessage: {
      text: "Salut ! 👋 Bienvenue chez CCI. Comment puis-je vous aider aujourd'hui ?",
      sender: "ai"
    },
    quickReplies: [
      "Voir Nos Services",
      "Réserver un Service",
      "Obtenir un Devis",
      "Nettoyage d'Urgence"
    ],
    errorMessages: {
      apiError: "Désolé, petit problème technique ! Appelez-nous au 98-557-766",
      unknownError: "Oups ! Problème technique. Réessayez ou appelez : 98-557-766",
      apiKeyError: "Temporairement indisponible. Appelez : 98-557-766",
      aiResponseError: "Reformulez votre question ou appelez : 98-557-766"
    },
    ui: {
      onlineStatus: "En ligne maintenant",
      inputPlaceholder: "Tapez votre message...",
      headerTitle: "Assistant CCI",
      headerSubtitle: "Votre assistant nettoyage"
    }
  },
  aiConfig: {
    model: {
      name: "gemini-2.0-flash",
      maxOutputTokens: 1000,
      temperature: 0.7
    },
    chat: {
      locale: "fr-FR"
    }
  },
  isEnhanced: false
};

// Client-side language detection (basic version)
export function detectClientLanguage(userInput) {
  if (!userInput || typeof userInput !== 'string') return 'french';
  
  const input = userInput.toLowerCase();
  
  // Arabizi detection
  if (/[3789]/.test(input) || ['3la', 'fi', 'w', 'bech'].some(word => input.includes(word))) {
    return 'arabizi';
  }
  
  // Arabic script
  if (/[\u0600-\u06FF]/.test(input)) {
    return 'arabic';
  }
  
  // English keywords
  if (['hello', 'hi', 'thanks', 'cleaning', 'service'].some(word => input.includes(word))) {
    return 'english';
  }
  
  return 'french';
}

// Get configuration based on enhancement availability
export function getTuningConfig(preferEnhanced = true) {
  if (preferEnhanced) {
    console.log('🎯 Using enhanced Fares expert persona (client-side)');
    return enhancedDefaultConfig;
  } else {
    console.log('⚠️ Using legacy configuration (client-side)');
    return legacyDefaultConfig;
  }
}

// Enhanced client functions
export function getSystemPrompt(enhanced = true) {
  const config = getTuningConfig(enhanced);
  return config.systemPrompt.fullPrompt;
}

export function getChatMessages(language = 'french', enhanced = true) {
  const config = getTuningConfig(enhanced);
  
  if (enhanced && config.chatMessages.initialMessage.variants) {
    // Return language-specific variant if available
    const variant = config.chatMessages.initialMessage.variants[language];
    if (variant) {
      return {
        ...config.chatMessages,
        initialMessage: {
          ...config.chatMessages.initialMessage,
          text: variant
        }
      };
    }
  }
  
  return config.chatMessages;
}

export function getAIConfig(enhanced = true) {
  const config = getTuningConfig(enhanced);
  return config.aiConfig;
}

export function getQuickReplies(language = 'french', enhanced = true) {
  const config = getTuningConfig(enhanced);
  
  if (enhanced && config.chatMessages.quickRepliesMultilang?.[language]) {
    return config.chatMessages.quickRepliesMultilang[language];
  }
  
  return config.chatMessages.quickReplies;
}

export function getErrorMessage(errorType, language = 'french', enhanced = true) {
  const config = getTuningConfig(enhanced);
  
  if (enhanced && config.chatMessages.errorMessages.multilangErrors?.[language]) {
    return config.chatMessages.errorMessages.multilangErrors[language];
  }
  
  return config.chatMessages.errorMessages[errorType] || config.chatMessages.errorMessages.unknownError;
}

export function getUIText(language = 'french', enhanced = true) {
  const config = getTuningConfig(enhanced);
  
  if (enhanced && config.chatMessages.ui.multilangUI?.[language]) {
    return {
      ...config.chatMessages.ui,
      ...config.chatMessages.ui.multilangUI[language]
    };
  }
  
  return config.chatMessages.ui;
}

// Legacy functions (for backward compatibility)
export function loadTuningConfig() {
  return getTuningConfig(true);
}

// Check if enhanced system is available
export function isEnhancedSystemAvailable() {
  return true; // Always true on client-side since we have fallback
}

export default {
  getTuningConfig,
  getSystemPrompt,
  getChatMessages,
  getAIConfig,
  getQuickReplies,
  getErrorMessage,
  getUIText,
  detectClientLanguage,
  isEnhancedSystemAvailable
};