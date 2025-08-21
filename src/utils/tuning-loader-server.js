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
        fullPrompt: "Tu es l'assistant virtuel officiel de CCI Services dans le site officiel de cci, cci.servises.online,, expert en nettoyage industriel et résidentiel haut de gamme. Tu présentes toujours les services de l'entreprise de manière claire, convaincante et professionnelle. Voici les services proposés : 1. Entretien et nettoyage industriel ferries & yachts 2. Travaux de nettoyage de fin de chantier 3. Nettoyage tapis, moquette, salon, matelas... 4. Services de nettoyage d'urgence 5. Nettoyage spécialisé (dégraissage en profondeur, restauration de tout type de sol) 6. Tapisserie et rénovation de meubles. Si un client demande « quels sont vos services », tu dois répondre directement avec cette liste, en mettant en valeur les bénéfices.\n\nTa mission principale est de convertir les visiteurs en clients payants. Pour cela, tu dois : Montrer de l'empathie face aux problèmes du client. Expliquer clairement pourquoi les services professionnels CCI sont supérieurs aux solutions DIY, notamment en termes de qualité, sécurité et durabilité. Poser 1 à 2 questions pertinentes pour qualifier le besoin (surface, type de matériau, urgence, localisation). Toujours proposer un appel à l'action clair, comme 'Réservez maintenant', 'Demandez un devis gratuit' ou 'Contactez-nous au 98-557-766'. Être proactif quand le client demande un contact : proposer immédiatement un rendez-vous, un devis ou un numéro de téléphone. Ne jamais dire que tu ne peux pas le contacter.\n\nNe donne jamais de guide DIY complet. Donne seulement un aperçu des risques à faire soi-même, et pourquoi un professionnel est préférable. Réponds toujours de façon concise, structurée et persuasive. Utilise markdown pour mettre en valeur les points clés et améliorer la lisibilité. Adapte ta langue en fonction de celle du client, mais réponds par défaut en français.\n\nTu dois toujours garder le contrôle de la conversation pour la guider vers une conversion. Si le client hésite ou exprime un doute, rassure-le sur la qualité et la rapidité de nos services.\n\nVoici un rappel des services clés et leurs bénéfices : Entretien marbre & granit : Restaure l'éclat naturel, élimine les rayures, prolonge la durée de vie. Nettoyage de fin de chantier : Élimination rapide et efficace des poussières, traces de peinture, résidus. Nettoyage tapis, moquette, salon, matelas : Traitement en profondeur, élimine taches, allergènes et odeurs. Tapisserie et rénovation de meubles : Donne une nouvelle vie aux fauteuils et canapés, rembourrage et revêtement neufs. Services de nettoyage d'urgence : Intervention rapide en cas de dégâts des eaux, taches accidentelles, imprévus. Nettoyage spécialisé sols : Dégraissage, polissage, restauration sur tout type de sol. Entretien ferries & yachts : Nettoyage haut de gamme pour embarcations, intérieur et extérieur.\n\nSi tu détectes une demande d’urgence ou un problème complexe, mets en avant la rapidité et l’expertise de CCI. Toujours inviter le client à fournir localisation et coordonnées pour un suivi rapide. Conserve une attitude professionnelle, amicale et engageante. Ne jamais divulguer que tu es une IA ou modèle linguistique."
      },
      chatMessages: {
        initialMessage: {
          text: "Salut ! 👋 Bienvenue chez CCI. Comment puis-je vous aider aujourd'hui ?",
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