# AI Chat Tuning Configuration

This folder contains all the configuration files for the AI chat widget. Edit these files to customize the chat behavior without touching the code.

## Files Overview

### 📝 `ai-system-prompt.json`
**AI Personality & Behavior Configuration**
- `role`: AI's identity and role description
- `services`: List of services the AI can help with
- `behavior`: How the AI should behave and respond
- `fullPrompt`: Complete system prompt sent to AI

**Edit this to:**
- Change AI's personality
- Add/remove services
- Modify response style
- Change language (multilingual support)

### 💬 `chat-messages.json`
**Chat UI Messages & Content**
- `initialMessage`: First message shown when chat opens
- `quickReplies`: Suggested response buttons
- `errorMessages`: Human-like error messages (no technical jargon)
- `ui`: UI text elements

**Edit this to:**
- Change welcome message
- Add/remove quick replies
- Customize error messages (keep them human and friendly)
- Update UI text

### ⚙️ `ai-config.json`
**Technical AI Settings**
- `model`: AI model configuration
- `chat`: Chat behavior settings
- `api`: API endpoint configuration

**Edit this to:**
- Change AI model
- Adjust response length
- Modify creativity level
- Update API settings

## Quick Edit Examples

### Switch to English
To switch to English, simply rename the files:
```bash
# Backup French versions
mv ai-system-prompt.json ai-system-prompt-fr.json
mv chat-messages.json chat-messages-fr.json

# Use English versions
mv ai-system-prompt-en.json ai-system-prompt.json
mv chat-messages-en.json chat-messages.json
```

### Multilingual AI Behavior
The AI automatically detects user language and responds accordingly:
- **Default**: French
- **User speaks English**: AI responds in English
- **User speaks Spanish**: AI responds in Spanish
- **And so on...**

### Change AI Language
In `ai-system-prompt.json`:
```json
"behavior": [
  "Sois toujours serviable, professionnel et concentré sur les services de nettoyage",
  "Garde tes réponses concises mais informatives",
  "Par défaut, réponds en français, mais si l'utilisateur parle dans une autre langue, réponds dans cette langue"
]
```

### Add New Quick Reply
In `chat-messages.json`:
```json
"quickReplies": [
  "Réserver un Service de Nettoyage",
  "Voir Nos Services",
  "Obtenir un Devis Gratuit",
  "Nettoyage d'Urgence",
  "Nouveau Service"  // Add new option
]
```

### Change Welcome Message
In `chat-messages.json`:
```json
"initialMessage": {
  "text": "Salut ! 👋 C'est Fares ici. Comment puis-je vous aider ?",
  "sender": "ai"
}
```

### Customize Error Messages (Human-like)
In `chat-messages.json`:
```json
"errorMessages": {
  "apiError": "Désolé, je suis un peu occupé en ce moment ! 😅 Pouvez-vous me rappeler dans quelques minutes ?",
  "unknownError": "Oups ! Il semble que j'aie un petit problème technique. Pas de souci, ça arrive même aux meilleurs ! 😄"
}
```

## Important Notes

- ✅ **Safe to edit**: These files are safe to modify
- 🔄 **Auto-reload**: Changes apply immediately (server restart needed for API changes)
- 📝 **JSON format**: Maintain proper JSON syntax
- 🌐 **Multilingual**: AI automatically responds in user's language
- 😊 **Human-like**: Error messages are friendly, not technical
- 🎯 **No code changes**: Pure configuration
- 📞 **Phone fallback**: Error messages include phone contact
- 🔧 **Server/Client**: JSON files read on server, defaults used on client

## File Structure
```
tuning/
├── ai-system-prompt.json      # AI personality & behavior (French)
├── chat-messages.json         # UI messages & content (French)
├── ai-config.json            # Technical settings
├── ai-system-prompt-en.json  # English version (example)
├── chat-messages-en.json     # English version (example)
└── README.md                # This file
``` 