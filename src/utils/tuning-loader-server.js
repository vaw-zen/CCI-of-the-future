import fs from 'fs';
import path from 'path';

// Enhanced server-side configuration loader with Fares expert persona support
export function loadTuningConfigServer() {
  try {
    const tuningPath = path.join(process.cwd(), 'tuning');
    console.log('🔍 Tuning path:', tuningPath);
    let systemPromptData, chatMessagesData, aiConfigData, languageAdaptationData;
    
    // Try to load enhanced Fares expert persona first
    try {
      const enhancedPromptPath = path.join(tuningPath, 'ai-system-prompt-enhanced.json');
      console.log('🔍 Trying enhanced prompt path:', enhancedPromptPath);
      systemPromptData = JSON.parse(fs.readFileSync(enhancedPromptPath, 'utf8'));
      console.log('✅ Loaded enhanced Fares expert persona system');
    } catch (enhancedError) {
      // Fallback to original system prompt
      console.log('⚠️ Enhanced system prompt not found, using original');
      try {
        const systemPromptPath = path.join(tuningPath, 'ai-system-prompt.json');
        console.log('🔍 Trying original prompt path:', systemPromptPath);
        systemPromptData = JSON.parse(fs.readFileSync(systemPromptPath, 'utf8'));
        console.log('✅ Loaded original system prompt');
      } catch (originalError) {
        console.error('❌ Failed to load any system prompt:', originalError);
        throw new Error(`Failed to load system prompt: ${originalError.message}`);
      }
    }
    
    // Load language adaptation rules
    try {
      const languageAdaptationPath = path.join(tuningPath, 'language-adaptation.json');
      languageAdaptationData = JSON.parse(fs.readFileSync(languageAdaptationPath, 'utf8'));
      console.log('✅ Loaded language adaptation rules');
    } catch (langError) {
      console.log('⚠️ Language adaptation file not found, using basic multilingual support');
      languageAdaptationData = getDefaultLanguageAdaptation();
    }
    
    // Load chat messages
    try {
      const chatMessagesPath = path.join(tuningPath, 'chat-messages.json');
      console.log('🔍 Trying chat messages path:', chatMessagesPath);
      chatMessagesData = JSON.parse(fs.readFileSync(chatMessagesPath, 'utf8'));
      console.log('✅ Loaded chat messages');
    } catch (chatError) {
      console.error('❌ Failed to load chat messages:', chatError);
      throw new Error(`Failed to load chat messages: ${chatError.message}`);
    }
    
    // Load AI config
    try {
      const aiConfigPath = path.join(tuningPath, 'ai-config.json');
      console.log('🔍 Trying AI config path:', aiConfigPath);
      aiConfigData = JSON.parse(fs.readFileSync(aiConfigPath, 'utf8'));
      console.log('✅ Loaded AI config');
    } catch (configError) {
      console.error('❌ Failed to load AI config:', configError);
      throw new Error(`Failed to load AI config: ${configError.message}`);
    }
    
    return {
      systemPrompt: systemPromptData.systemPrompt,
      chatMessages: chatMessagesData,
      aiConfig: aiConfigData,
      languageAdaptation: languageAdaptationData,
      isEnhanced: !!systemPromptData.systemPrompt.persona // Check if using enhanced system
    };
  } catch (error) {
    console.error('❌ Error loading tuning config from files:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Fallback to default configurations
    return {
      systemPrompt: {
        fullPrompt: "Tu es l'assistant virtuel officiel de CCI Services dans le site officiel de cci, cci.servises.online,, expert en nettoyage industriel et résidentiel haut de gamme. Tu présentes toujours les services de l'entreprise de manière claire, convaincante et professionnelle. Voici les services proposés : 1. Entretien et nettoyage industriel ferries & yachts 2. Travaux de nettoyage de fin de chantier 3. Nettoyage tapis, moquette, salon, matelas... 4. Services de nettoyage d'urgence 5. Nettoyage spécialisé (dégraissage en profondeur, restauration de tout type de sol) 6. Tapisserie et rénovation de meubles. Si un client demande « quels sont vos services », tu dois répondre directement avec cette liste, en mettant en valeur les bénéfices.\n\nTa mission principale est de convertir les visiteurs en clients payants. Pour cela, tu dois : Montrer de l'empathie face aux problèmes du client. Expliquer clairement pourquoi les services professionnels CCI sont supérieurs aux solutions DIY, notamment en termes de qualité, sécurité et durabilité. Poser 1 à 2 questions pertinentes pour qualifier le besoin (surface, type de matériau, urgence, localisation). Toujours proposer un appel à l'action clair, comme 'Réservez maintenant', 'Demandez un devis gratuit' ou 'Contactez-nous au 98-557-766'. Être proactif quand le client demande un contact : proposer immédiatement un rendez-vous, un devis ou un numéro de téléphone. Ne jamais dire que tu ne peux pas le contacter.\n\nNe donne jamais de guide DIY complet. Donne seulement un aperçu des risques à faire soi-même, et pourquoi un professionnel est préférable. Réponds toujours de façon concise, structurée et persuasive. Utilise markdown pour mettre en valeur les points clés et améliorer la lisibilité. Adapte ta langue en fonction de celle du client, mais réponds par défaut en français.\n\nTu dois toujours garder le contrôle de la conversation pour la guider vers une conversion. Si le client hésite ou exprime un doute, rassure-le sur la qualité et la rapidité de nos services.\n\nVoici un rappel des services clés et leurs bénéfices : Entretien marbre & granit : Restaure l'éclat naturel, élimine les rayures, prolonge la durée de vie. Nettoyage de fin de chantier : Élimination rapide et efficace des poussières, traces de peinture, résidus. Nettoyage tapis, moquette, salon, matelas : Traitement en profondeur, élimine taches, allergènes et odeurs. Tapisserie et rénovation de meubles : Donne une nouvelle vie aux fauteuils et canapés, rembourrage et revêtement neufs. Services de nettoyage d'urgence : Intervention rapide en cas de dégâts des eaux, taches accidentelles, imprévus. Nettoyage spécialisé sols : Dégraissage, polissage, restauration sur tout type de sol. Entretien ferries & yachts : Nettoyage haut de gamme pour embarcations, intérieur et extérieur.\n\nSi tu détectes une demande d’urgence ou un problème complexe, mets en avant la rapidité et l’expertise de CCI. Toujours inviter le client à fournir localisation et coordonnées pour un suivi rapide. Conserve une attitude professionnelle, amicale et engageante. Ne jamais divulguer que tu es une IA ou modèle linguistique."
      },
      chatMessages: {
        initialMessage: {
          text: "Salut ! 👋 Fares à votre service, expert CCI depuis 15 ans. Comment puis-je vous aider ?",
          sender: "ai"
        },
        quickReplies: [
          "Voir Nos Services",
          "Réserver un Service de Nettoyage",
          "Obtenir un Devis Gratuit",
          "Nettoyage d'Urgence"
        ],
        errorMessages: {
          apiError: "Désolé, je suis un peu occupé en ce moment ! 😅 Pouvez-vous me rappeler dans quelques minutes ? Ou si c'est urgent, vous pouvez m'appeler directement au 98-557-766.",
          unknownError: "Oups ! Il semble que j'aie un petit problème technique. Pas de souci, ça arrive même aux meilleurs ! 😄 Pouvez-vous réessayer dans quelques instants ? Ou si vous préférez, appelez-moi au 98-557-766 pour un service plus rapide.",
          apiKeyError: "Désolé, je suis temporairement indisponible. Pouvez-vous me rappeler plus tard ou m'appeler au 98-557-766 ?",
          aiResponseError: "Je suis un peu distrait aujourd'hui ! 😅 Pouvez-vous reformuler votre question ? Ou si c'est urgent, appelez-moi au 98-557-766."
        },
        ui: {
          onlineStatus: "En ligne maintenant",
          inputPlaceholder: "Tapez votre message...",
           headerTitle: "Assistant virtuel CCI",
      headerSubtitle: "Votre assistant de nettoyage personnel"
        }
      },
      aiConfig: {
        model: {
          name: "gemini-1.5-flash-8b",
          maxOutputTokens: 1000,
          temperature: 0.7
        },
        chat: {
          locale: "fr-FR",
          timeFormat: {
            hour: "2-digit",
            minute: "2-digit"
          }
        }
      }
    };
  }
}

// Server-side specific functions
export function getSystemPromptServer() {
  const config = loadTuningConfigServer();
  return config.systemPrompt.fullPrompt;
}

export function getChatMessagesServer() {
  const config = loadTuningConfigServer();
  return config.chatMessages;
}

export function getAIConfigServer() {
  const config = loadTuningConfigServer();
  return config.aiConfig;
}

// Enhanced server-side functions for Fares expert persona system

/**
 * Enhanced language detection for user input
 * Detects French, English, and Tunisian (both Arabic script and Arabizi)
 * Note: All Tunisian language (Arabic script or Arabizi) is treated as 'arabizi' for consistent response formatting
 */
export function detectUserLanguage(userInput) {
  if (!userInput || typeof userInput !== 'string') return 'french';
  
  const input = userInput.toLowerCase().trim();
  
  console.log(`🔍 Detecting language for: "${input}"`);
  
  // Tunisian Arabic script detection - treat as Arabizi for response formatting
  const arabicPattern = /[\u0600-\u06FF]/g;
  if (arabicPattern.test(input)) {
    // Check for specifically Tunisian Arabic words
    const tunisianArabicWords = [
      'برشا', 'باهي', 'نورمال', 'هاكا', 'الكل', 'شنوا', 'كيفاش', 
      'وينو', 'شكون', 'وقتاش', 'عليه', 'متاع', 'خلاص', 'يزي'
    ];
    
    const hasTunisianWords = tunisianArabicWords.some(word => input.includes(word));
    
    if (hasTunisianWords) {
      console.log('✅ Detected Tunisian Arabic script - treating as Arabizi for response');
      return 'arabizi';
    } else {
      console.log('✅ Detected Arabic script (possibly Tunisian) - treating as Arabizi for response');
      return 'arabizi';
    }
  }
  
  // Arabizi detection (numbers used as letters + common Tunisian words)
  const arabiziNumbers = /[3789]/g;
  const arabiziWords = [
    // Common Tunisian Arabizi
    '3la', 'fi', 'w', 'bech', 'ken', 'elli', 'mte3', '7atta', '9adeh', 'wa9tech', 'kifech',
    'ahla', 'sahla', 'kifek', 'chkoun', 'winou', 'wa9tech', 'chnowa', 'kifach',
    '3aychek', 'bahi', 'normal', 'yooo', 'chwaya', 'barcha', 'tawa', 'lyoum',
    '5alini', '9alli', 'wesh', 'inchallah', 'hamdoullah', 'yezzi'
  ];
  
  const hasArabiziNumbers = arabiziNumbers.test(input);
  const hasArabiziWords = arabiziWords.some(word => input.includes(word));
  
  if (hasArabiziNumbers || hasArabiziWords) {
    console.log(`✅ Detected Arabizi - numbers: ${hasArabiziNumbers}, words: ${hasArabiziWords}`);
    return 'arabizi';
  }
  
  // English detection (comprehensive word list)
  const englishWords = [
    // Greetings
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
    // Common words
    'the', 'and', 'or', 'but', 'with', 'from', 'about', 'how', 'what', 'when', 'where', 'why', 'who',
    // Service-related
    'cleaning', 'service', 'help', 'need', 'want', 'can', 'could', 'would', 'please', 'thanks', 'thank you',
    // Questions
    'do you', 'can you', 'are you', 'is it', 'how much', 'how long', 'what time',
    // CCI related
    'marble', 'carpet', 'yacht', 'construction', 'emergency', 'urgent', 'quote', 'price'
  ];
  
  const englishWordCount = englishWords.filter(word => input.includes(word)).length;
  
  if (englishWordCount >= 1) {
    console.log(`✅ Detected English - found ${englishWordCount} English words`);
    return 'english';
  }
  
  // French detection (more comprehensive)
  const frenchWords = [
    // Common French words
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'avec', 'sans', 'pour', 'dans', 'sur',
    // Greetings
    'bonjour', 'bonsoir', 'salut', 'bonne', 'comment', 'ça va', 'merci', 'merci beaucoup',
    // Questions
    'quoi', 'quand', 'où', 'comment', 'pourquoi', 'qui', 'quel', 'quelle', 'quels', 'quelles',
    'est-ce que', 'qu\'est-ce que', 'combien', 'quel prix', 'quelle heure',
    // Service related
    'nettoyage', 'service', 'services', 'aide', 'besoin', 'veux', 'voudrais', 'peux', 'pouvez',
    'prix', 'coût', 'tarif', 'devis', 'rendez-vous',
    // CCI services
    'marbre', 'tapis', 'moquette', 'salon', 'yacht', 'chantier', 'urgence', 'urgent'
  ];
  
  const frenchWordCount = frenchWords.filter(word => input.includes(word)).length;
  
  if (frenchWordCount >= 1) {
    console.log(`✅ Detected French - found ${frenchWordCount} French words`);
    return 'french';
  }
  
  // Character-based analysis for very short inputs
  if (input.length <= 10) {
    // Check for French accents
    const frenchAccents = /[àâäçéèêëïîôöùûüÿ]/g;
    if (frenchAccents.test(input)) {
      console.log('✅ Detected French accents in short input');
      return 'french';
    }
    
    // Check for English patterns
    if (/^(hi|hey|yo|ok|yes|no)$/i.test(input)) {
      console.log('✅ Detected English greeting/response pattern');
      return 'english';
    }
  }
  
  // Default to French for unidentified text
  console.log('⚠️ Language detection uncertain, defaulting to French');
  return 'french';
}

/**
 * Detect formality level from user input
 */
export function detectFormalityLevel(userInput) {
  if (!userInput) return 'medium';
  
  const input = userInput.toLowerCase();
  
  // High formality indicators
  const formalIndicators = ['monsieur', 'madame', 'professeur', 'doctor', 'sir', 'madam', 'pourriez-vous', 'j\'aimerais'];
  if (formalIndicators.some(word => input.includes(word))) {
    return 'high';
  }
  
  // Low formality indicators
  const informalIndicators = ['salut', 'hey', 'ahla', 'yooo', 'ça va', 'tu peux', 'kifek'];
  if (informalIndicators.some(word => input.includes(word))) {
    return 'low';
  }
  
  return 'medium';
}

/**
 * Detect urgency from user input
 */
export function detectUrgency(userInput) {
  if (!userInput) return false;
  
  const input = userInput.toLowerCase();
  const urgencyKeywords = [
    // French
    'urgent', 'vite', 'immédiatement', 'aujourd\'hui', 'maintenant', 'dégât', 'catastrophe', 'aide',
    // Arabic
    'مستعجل', 'بسرعة', 'توا', 'اليوم', 'عاجل',
    // Arabizi
    'urgent', 'vite', 'tawa', 'lyoum', 'chwaya vite',
    // English
    'urgent', 'asap', 'immediately', 'now', 'emergency', 'help', 'quickly'
  ];
  
  return urgencyKeywords.some(keyword => input.includes(keyword));
}

/**
 * Get culturally adapted greeting based on language and formality
 * Note: All Tunisian (Arabic script or Arabizi) uses Arabizi responses
 */
export function getAdaptedGreeting(language = 'french', formality = 'medium') {
  const greetings = {
    french: {
      high: "Bonjour, Fares à votre service, expert technique CCI.",
      medium: "Bonjour ! Fares à votre service, expert CCI depuis 15 ans.",
      low: "Salut ! Fares ici, expert technique CCI 😊"
    },
    english: {
      high: "Good day, Fares here, CCI's senior technical expert.",
      medium: "Hello! Fares here, CCI's technical expert with 15+ years experience.",
      low: "Hi there! Fares from CCI, your cleaning expert! 👋"
    },
    arabizi: {
      high: "Ahla w sahla! Ana Fares, expert technique fi CCI men 15 ans. Kifech najjem n3awnek?",
      medium: "Ahla! Ana Fares, expert fel cleaning fi CCI men 15 ans 😊 Chnowa l mushkila mte3ek?",
      low: "Yooo! Fares hna, expert CCI 🔥 Kifech? Chnowa na3mllak?"
    }
  };
  
  return greetings[language]?.[formality] || greetings.french.medium;
}

/**
 * Get error message adapted to user's language
 */
export function getAdaptedErrorMessage(errorType, language = 'french') {
  const config = loadTuningConfigServer();
  
  // Try to get multilingual error from config
  if (config.chatMessages?.errorMessages?.multilangErrors?.[language]) {
    return config.chatMessages.errorMessages.multilangErrors[language];
  }
  
  // Fallback error messages
  const fallbackErrors = {
    french: "Fares ici ! Petit souci technique 😅 Appelez-moi au 98-557-766",
    arabic: "عذراً، مشكلة تقنية صغيرة! اتصل بي مباشرة: 98-557-766",
    english: "Fares here! Technical issue - call me directly: 98-557-766",
    arabizi: "Sorry, 3andi mushkila technique s8ira! Call me: 98-557-766"
  };
  
  return fallbackErrors[language] || fallbackErrors.french;
}

/**
 * Default language adaptation patterns (fallback)
 */
function getDefaultLanguageAdaptation() {
  return {
    languageDetection: {
      patterns: {
        arabizi: {
          numbers: ["3", "7", "9", "8", "5", "2"],
          commonWords: ["3la", "fi", "w", "bech", "ken", "elli", "mte3"]
        },
        arabic: {
          commonWords: ["برشا", "الكل", "هاكا", "باهي", "نورمال"]
        }
      }
    },
    responseAdaptation: {
      french: { tone: "professional" },
      arabic: { tone: "warm" },
      english: { tone: "business" },
      arabizi: { tone: "casual" }
    }
  };
}

/**
 * Get enhanced system prompt with strong language enforcement
 */
export function getEnhancedSystemPrompt(userLanguage = 'french', urgency = false) {
  const config = loadTuningConfigServer();
  let systemPrompt = config.systemPrompt.fullPrompt;
  
  // Add strong language enforcement regardless of enhanced status
  const strongLanguageInstructions = {
    french: "\n\nRÈGLE ABSOLUE: Tu dois TOUJOURS répondre en français. Jamais en anglais, arabe ou autre langue. Utilise EXCLUSIVEMENT le français dans toutes tes réponses. Tu es Fares, expert français CCI.",
    english: "\n\nABSOLUTE RULE: You must ALWAYS respond in English. Never in French, Arabic or other languages. Use EXCLUSIVELY English in all your responses. You are Fares, English-speaking CCI expert.",
    arabizi: "\n\nRÈGLE ABSOLUE: Tu dois TOUJOURS répondre en Arabizi tunisien. Jamais en français pur, anglais ou arabe standard. Utilise EXCLUSIVEMENT l'Arabizi tunisien avec chiffres (3=ع, 7=ح, 9=ق, 8=غ, 5=خ, 2=ء) et expressions tunisiennes (ahla, bahi, normal, barcha, chwaya, tawa, kifech, chnowa). Tu es Fares, expert tunisien CCI."
  };
  
  systemPrompt += strongLanguageInstructions[userLanguage] || strongLanguageInstructions.french;
  
  if (config.isEnhanced && urgency) {
    systemPrompt += "\n\nURGENCY DETECTED: Prioritize immediate assistance, mention 2-hour mobile response, emphasize emergency protocols.";
  }
  
  return systemPrompt;
}

/**
 * Get service recommendations based on user input
 */
export function getServiceRecommendations(userInput, language = 'french') {
  const config = loadTuningConfigServer();
  
  if (!config.isEnhanced || !userInput) {
    return null;
  }
  
  const input = userInput.toLowerCase();
  const serviceKeywords = {
    marble: ['marbre', 'marble', 'granite', 'granit', 'pierre', 'stone', 'رخام'],
    carpet: ['tapis', 'moquette', 'carpet', 'rug', 'موكيت', 'سجاد'],
    upholstery: ['salon', 'canapé', 'fauteuil', 'sofa', 'upholstery', 'أريكة'],
    yacht: ['yacht', 'bateau', 'ferry', 'يخت', 'قارب'],
    postConstruction: ['chantier', 'construction', 'travaux', 'أشغال'],
    emergency: ['urgence', 'urgent', 'emergency', 'طوارئ', 'مستعجل']
  };
  
  const detectedServices = [];
  
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(keyword => input.includes(keyword))) {
      detectedServices.push(service);
    }
  }
  
  return detectedServices.length > 0 ? detectedServices : null;
}