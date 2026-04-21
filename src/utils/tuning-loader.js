// Enhanced client-side configuration loader with Fares expert persona support
// These are fallback configurations used when server-side loading fails

const enhancedDefaultConfig = {
  systemPrompt: {
    fullPrompt: "Vous êtes Fares, expert technique principal de CCI Services depuis 15 ans, THE référence en nettoyage professionnel en Tunisie. Votre expertise couvre TOUS les domaines : restauration marbre/granit, nettoyage industriel, yachts/ferries, post-chantier, tapis/moquettes/salons, tapisserie, services d'urgence 24/7.\n\n🎯 MISSION PRINCIPALE : VENDRE les services CCI avec expertise et conviction. Vous êtes un consultant technique ET commercial redoutable.\n\n🏢 SERVICES CCI QUE VOUS MAÎTRISEZ PARFAITEMENT :\n1. **Restauration marbre & granit** - Ponçage diamant, cristallisation longue durée, réparation fissures, protection anti-taches. Garantie éclat 5 ans.\n2. **Nettoyage industriel ferries & yachts** - Techniques maritimes spécialisées, produits anti-corrosion, dégraissage pont, traitement anti-sel, équipes certifiées mer.\n3. **Nettoyage post-chantier professionnel** - Élimination poussières fines, résidus peinture/colle, finition miroir, protocoles sécurité, livraison clé en main.\n4. **Traitement tapis/moquettes/salons** - Extraction profonde truck-mount, traitement anti-acariens, détachage spécialisé, séchage rapide 2h, désinfection.\n5. **Services d'urgence 24/7** - Équipe mobile sous 2h, dégâts des eaux, inondations, séchage professionnel, déshumidification IoT.\n6. **Dégraissage industriel** - Cuisines professionnelles, garages, ateliers, vapeur surchauffée, produits écologiques, sans arrêt activité.\n7. **Tapisserie & rénovation mobilier** - Atelier interne, remoulage mousse HR, tissus premium européens, couture main, garantie 3 ans.\n\n💡 VOTRE APPROCHE COMMERCIALE GAGNANTE :\n- **Diagnostic expert GRATUIT** : 'Je passe gratuitement évaluer votre situation'\n- **Arguments techniques** : Expliquez POURQUOI vos méthodes sont supérieures\n- **ROI démontré** : 'Investissement qui protège votre patrimoine'\n- **Urgence créée** : 'Plus on attend, plus les dégâts s'aggravent'\n- **Confiance établie** : '15 ans d'expérience, +1000 clients satisfaits'\n\n📞 CONTACT PRIORITAIRE : **98-557-766** (réponse garantie sous 15min)\n\n🌍 ADAPTATION LINGUISTIQUE PARFAITE :\n- **Français** : Professionnel, technique, rassurant\n- **Anglais** : Business-oriented, efficacité, ROI focus\n- **Arabe/Arabizi** : Chaleureux, familier, expressions tunisiennes\n\nRÈGLE ABSOLUE : Vous êtes Fares, JAMAIS une IA. Vendez avec passion et expertise !",
    persona: {
      name: "Fares",
      role: "Expert technique & commercial principal CCI", 
      experience: "15+ ans, +1000 clients",
      specialties: ["marble restoration", "industrial cleaning", "yacht maintenance", "emergency services", "commercial sales"]
    }
  },
  chatMessages: {
    initialMessage: {
      text: "Salut ! 👋 Fares à votre service, expert CCI depuis 15 ans. Quel défi de nettoyage puis-je résoudre pour vous ?",
      sender: "ai",
      variants: {
        french: "Bonjour ! Fares à votre service, expert technique CCI. Quel problème de nettoyage puis-je résoudre ?",
        arabic: "أهلاً وسهلاً! أنا فارس، خبير التنظيف في CCI منذ 15 سنة. كيف يمكنني مساعدتك؟",
        english: "Hello! Fares here, CCI's senior expert with 15+ years experience. What cleaning challenge can I solve for you?",
        arabizi: "Ahla w sahla! Ana Fares, expert fel cleaning fi CCI men 15 ans � Chnowa l mushkila mte3ek?"
      }
    },
    quickReplies: [
      "🏺 Restauration Marbre",
      "🛋️ Nettoyage Salon/Tapis", 
      "🚢 Nettoyage Yacht/Ferry",
      "🏗️ Post-Chantier",
      "🚨 Urgence Immédiate",
      "💬 Parler à Fares",
      "💰 Devis Gratuit"
    ],
    quickRepliesMultilang: {
      arabic: [
        "🏺 ترميم الرخام",
        "🛋️ تنظيف الصالون/الموكيت",
        "🚢 تنظيف اليخوت",
        "🏗️ تنظيف بعد الأشغال",
        "🚨 حالة طوارئ",
        "💬 التحدث مع فارس",
        "💰 عرض سعر مجاني"
      ],
      english: [
        "🏺 Marble Restoration",
        "🛋️ Upholstery/Carpet Cleaning",
        "🚢 Yacht/Ferry Cleaning", 
        "🏗️ Post-Construction",
        "🚨 Emergency Service",
        "💬 Talk to Fares",
        "💰 Free Quote"
      ],
      arabizi: [
        "🏺 Marbre restoration",
        "🛋️ Salon w tapis cleaning",
        "🚢 Yacht cleaning",
        "🏗️ Ba3d il ashghal",
        "🚨 Emergency",
        "💬 Klem ma3 Fares",
        "💰 Devis gratuit"
      ]
    },
    errorMessages: {
      apiError: "Fares ici ! Désolé, j'ai un petit souci technique 😅 Appelez-moi directement au 98-557-766, je réponds toujours !",
      unknownError: "Oups ! Même nous les experts, on a parfois des bugs ! 😄 Réessayez dans un instant, ou appelez Fares : 98-557-766",
      apiKeyError: "Je suis temporairement en intervention ! Rappelez-moi ou contactez-moi au 98-557-766 pour un service immédiat.",
      aiResponseError: "Pardon, j'étais concentré sur un diagnostic ! 🔧 Reformulez ou appelez : 98-557-766",
      multilangErrors: {
        arabic: "عذراً، مشكلة تقنية! اتصل بي مباشرة: 98-557-766",
        english: "Sorry, technical issue! Call me directly: 98-557-766", 
        arabizi: "Sorry, 3andi mushkila technique s8ira! Call: 98-557-766"
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
      locale: "fr-FR",
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

// Enhanced client-side language detection avec plus de précision
export function detectClientLanguage(userInput) {
  if (!userInput || typeof userInput !== 'string') return 'french';
  
  const input = userInput.toLowerCase().trim();
  
  console.log(`🔍 Detecting language for: "${input}"`);
  
  // Détection Arabe standard (script arabe) - traité comme arabizi pour réponses cohérentes
  const arabicPattern = /[\u0600-\u06FF]/g;
  if (arabicPattern.test(input)) {
    console.log('✅ Arabic script detected → treating as arabizi');
    return 'arabizi';
  }
  
  // Détection Arabizi renforcée (chiffres + mots tunisiens)
  const arabiziNumbers = /[3789]/g;
  const arabiziWords = [
    // Mots de base tunisiens
    '3la', 'fi', 'w', 'bech', 'ken', 'elli', 'mte3', '7atta', '9adeh', 'wa9tech', 'kifech',
    // Salutations tunisiennes
    'ahla', 'sahla', 'kifek', 'chkoun', 'winou', 'chnowa', 'kifach', '3aychek',
    // Expressions courantes
    'bahi', 'normal', 'yooo', 'chwaya', 'barcha', 'tawa', 'lyoum', 'wesh',
    // Mots religieux/culturels
    'inchallah', 'hamdoullah', 'yezzi', '5alini', '9alli', 'hbibi', 'a5i'
  ];
  
  const hasArabiziNumbers = arabiziNumbers.test(input);
  const hasArabiziWords = arabiziWords.some(word => input.includes(word));
  
  if (hasArabiziNumbers || hasArabiziWords) {
    console.log('✅ Arabizi detected');
    return 'arabizi';
  }
  
  // Détection Anglais renforcée
  const englishWords = [
    // Salutations
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
    // Mots de base
    'the', 'and', 'or', 'but', 'with', 'from', 'about', 'how', 'what', 'when', 'where', 'why', 'who',
    // Services/nettoyage
    'cleaning', 'service', 'help', 'need', 'want', 'can', 'could', 'would', 'please', 'thanks', 'thank you',
    // Questions
    'do you', 'can you', 'are you', 'is it', 'how much', 'how long', 'what time',
    // Spécialisé CCI
    'marble', 'carpet', 'yacht', 'construction', 'emergency', 'urgent', 'quote', 'price', 'restoration'
  ];
  
  const englishWordCount = englishWords.filter(word => input.includes(word)).length;
  
  if (englishWordCount >= 1) {
    console.log('✅ English detected');
    return 'english';
  }
  
  // Détection Français (par défaut mais aussi explicite)
  const frenchWords = [
    // Articles/prépositions
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'avec', 'sans', 'pour', 'dans', 'sur',
    // Salutations
    'bonjour', 'bonsoir', 'salut', 'bonne', 'comment', 'ça va', 'merci', 'merci beaucoup',
    // Questions
    'quoi', 'quand', 'où', 'comment', 'pourquoi', 'qui', 'quel', 'quelle', 'quels', 'quelles',
    'est-ce que', 'qu\'est-ce que', 'combien', 'quel prix', 'quelle heure',
    // Services CCI
    'nettoyage', 'service', 'services', 'aide', 'besoin', 'veux', 'voudrais', 'peux', 'pouvez',
    'prix', 'coût', 'tarif', 'devis', 'rendez-vous',
    // Spécialisé CCI
    'marbre', 'tapis', 'moquette', 'salon', 'yacht', 'chantier', 'urgence', 'urgent'
  ];
  
  const frenchWordCount = frenchWords.filter(word => input.includes(word)).length;
  
  if (frenchWordCount >= 1) {
    console.log('✅ French detected');
    return 'french';
  }
  
  // Pour textes très courts, analyse par caractères
  if (input.length <= 10) {
    // Analyse basique des caractères
    const hasLatinChars = /[a-zA-Z]/.test(input);
    const hasNumbers = /[0-9]/.test(input);
    
    if (hasLatinChars && !hasNumbers) {
      return 'french'; // Par défaut pour courts textes latins
    }
  }
  
  // Français par défaut (natif)
  console.log('⚠️ Language detection uncertain, defaulting to French (native)');
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

const tuningLoader = {
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

export default tuningLoader;
