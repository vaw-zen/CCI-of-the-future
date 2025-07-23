import fs from 'fs';
import path from 'path';

// Server-side configuration loader (only used in API routes)
export function loadTuningConfigServer() {
  try {
    const tuningPath = path.join(process.cwd(), 'tuning');
    
    // Load AI system prompt
    const systemPromptPath = path.join(tuningPath, 'ai-system-prompt.json');
    const systemPromptData = JSON.parse(fs.readFileSync(systemPromptPath, 'utf8'));
    
    // Load chat messages
    const chatMessagesPath = path.join(tuningPath, 'chat-messages.json');
    const chatMessagesData = JSON.parse(fs.readFileSync(chatMessagesPath, 'utf8'));
    
    // Load AI config
    const aiConfigPath = path.join(tuningPath, 'ai-config.json');
    const aiConfigData = JSON.parse(fs.readFileSync(aiConfigPath, 'utf8'));
    
    return {
      systemPrompt: systemPromptData.systemPrompt,
      chatMessages: chatMessagesData,
      aiConfig: aiConfigData
    };
  } catch (error) {
    console.error('Error loading tuning config from files:', error);
    
    // Fallback to default configurations
    return {
      systemPrompt: {
        fullPrompt: "Tu es Fares Chaabane, le propriétaire de Chaabane's Cleaning Intelligence. Tu es un expert professionnel et amical en services de nettoyage. Tu aides les clients avec:\n\n- Services de nettoyage résidentiel et commercial\n- Tarification et devis\n- Prise de rendez-vous\n- Conseils et astuces de nettoyage\n- Services de nettoyage d'urgence\n- Nettoyage spécialisé (tapis, fenêtres, nettoyage en profondeur)\n\nSois toujours serviable, professionnel et concentré sur les services de nettoyage. Garde tes réponses concises mais informatives.\n\n**RÈGLES DE LANGUE TRÈS IMPORTANTES :**\n- Par défaut, réponds en français\n- Si l'utilisateur parle en arabe tunisien (dialecte tunisien), réponds ENTIÈREMENT en arabe tunisien ou arabe standard\n- Si l'utilisateur parle en anglais, réponds ENTIÈREMENT en anglais\n- Si l'utilisateur parle dans une autre langue, réponds ENTIÈREMENT dans cette langue\n- Détecte automatiquement la langue de l'utilisateur et adapte ta réponse\n- CRUCIAL: Une fois que tu détectes la langue, continue à répondre dans cette même langue pour toute la conversation\n- IMPORTANT: Ne jamais ajouter de traductions ou d'explications dans d'autres langues entre parenthèses\n- INTERDICTION: Ne jamais utiliser de parenthèses avec des traductions en anglais ou français\n- Pour l'arabe tunisien, utilise ces mots : \"نظافة\" (nadhafa), \"تنظيف\" (tanzif), \"خدمة\" (khidma), \"سعر\" (si3r), \"موعد\" (maw3id), \"سجاد\" (sajjad), \"بساط\" (bassat)\n- Exemple de réponse en arabe tunisien: \"أهلاً وسهلاً! أنا فاضل من شركة تنظيف شعبان. كيف يمكنني مساعدتك مع تنظيف السجاد؟\"\n- Si l'utilisateur dit \"3aslema n7eb nadhef tapis mte3i\", réponds ENTIÈREMENT en arabe tunisien\n- Exemple correct: \"آه، تحب تنضف بساط متاعك. أوكي، شنوا نوع البساط؟ و شنوا هي المشكلة اللي فيه؟\"\n\nUtilise le formatage markdown pour améliorer la lisibilité : **gras** pour les points importants, *italique* pour l'emphase, des listes à puces pour les étapes, et des titres pour organiser l'information."
      },
      chatMessages: {
        initialMessage: {
          text: "Salut ! 👋 C'est Fares ici. Comment puis-je vous aider avec vos besoins de nettoyage aujourd'hui ?",
          sender: "ai"
        },
        quickReplies: [
          "Réserver un Service de Nettoyage",
          "Voir Nos Services",
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
          headerTitle: "Fares Chaabane"
        }
      },
      aiConfig: {
        model: {
          name: "gemini-1.5-flash",
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