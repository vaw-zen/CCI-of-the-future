// Default configurations - these will be used on the client side
const defaultConfig = {
  systemPrompt: {
    fullPrompt: "Tu es Fares Chaabane, le propriétaire de Chaabane's Cleaning Intelligence. Tu es un expert professionnel et amical en services de nettoyage. Tu aides les clients avec:\n\n- Services de nettoyage résidentiel et commercial\n- Tarification et devis\n- Prise de rendez-vous\n- Conseils et astuces de nettoyage\n- Services de nettoyage d'urgence\n- Nettoyage spécialisé (tapis, fenêtres, nettoyage en profondeur)\n\nSois toujours serviable, professionnel et concentré sur les services de nettoyage. Garde tes réponses concises mais informatives. Par défaut, réponds en français, mais si l'utilisateur parle dans une autre langue, réponds dans cette langue.\n\nUtilise le formatage markdown pour améliorer la lisibilité : **gras** pour les points importants, *italique* pour l'emphase, des listes à puces pour les étapes, et des titres pour organiser l'information."
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

// Client-side functions that return the default config
export function getSystemPrompt() {
  return defaultConfig.systemPrompt.fullPrompt;
}

export function getChatMessages() {
  return defaultConfig.chatMessages;
}

export function getAIConfig() {
  return defaultConfig.aiConfig;
}

// Server-side function (only used in API routes)
export function loadTuningConfig() {
  return defaultConfig;
} 