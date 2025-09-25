# Implementation Guide - Fares Expert Chatbot

## Quick Setup Instructions

### 1. **Replace System Prompt**
```javascript
// In your chatbot initialization
const systemPrompt = await fetch('/tuning/ai-system-prompt-enhanced.json');
const faresPersona = await systemPrompt.json();

// Use the enhanced prompt
model.systemInstruction = faresPersona.systemPrompt.fullPrompt;
```

### 2. **Enable Language Detection**
```javascript
// Language detection function
function detectUserLanguage(userInput) {
  const patterns = {
    arabizi: /[3789]/g,
    arabic: /[\u0600-\u06FF]/g,
    french: /\b(bonjour|salut|merci|comment|pourquoi)\b/i,
    english: /\b(hello|hi|thanks|how|why)\b/i
  };
  
  // Check for arabizi numbers first
  if (patterns.arabizi.test(userInput)) return 'arabizi';
  
  // Check for arabic script
  if (patterns.arabic.test(userInput)) return 'arabic';
  
  // Check for english keywords
  if (patterns.english.test(userInput)) return 'english';
  
  // Default to french
  return 'french';
}
```

### 3. **Implement Cultural Adaptation**
```javascript
// Response adaptation based on detected language
function adaptResponse(response, detectedLang, formalityLevel) {
  const adaptations = {
    french: {
      formal: response.replace(/salut/gi, 'bonjour'),
      informal: response.replace(/bonjour/gi, 'salut')
    },
    arabizi: {
      casual: response + ' 😊',
      emojis: true
    },
    arabic: {
      respectful: 'بسم الله، ' + response,
      closing: response + '، إن شاء الله'
    }
  };
  
  return adaptations[detectedLang] ? 
    adaptations[detectedLang][formalityLevel] || response : 
    response;
}
```

### 4. **Enhanced Error Handling**
```javascript
// Multilingual error messages
const errorMessages = {
  french: "Fares ici ! Petit souci technique 😅 Appelez-moi au 98-557-766",
  arabic: "عذراً، مشكلة تقنية! اتصل بي: 98-557-766",
  english: "Fares here! Technical issue - call me: 98-557-766",
  arabizi: "Sorry, 3andi mushkila technique! Call: 98-557-766"
};

function handleError(error, userLanguage) {
  return errorMessages[userLanguage] || errorMessages.french;
}
```

### 5. **Service Integration**
```javascript
// Load services from enhanced config
async function loadServices() {
  const config = await fetch('/tuning/ai-system-prompt-enhanced.json');
  const data = await config.json();
  
  return data.systemPrompt.coreServices.map(service => ({
    name: service.name,
    benefit: service.benefit,
    technical: service.technical_details
  }));
}
```

### 6. **Conversation Flow Implementation**
```javascript
// Enhanced conversation phases
class FaresConversation {
  constructor() {
    this.phase = 'greeting';
    this.userLanguage = 'french';
    this.userProfile = {};
  }
  
  async processMessage(userInput) {
    this.userLanguage = detectUserLanguage(userInput);
    
    switch(this.phase) {
      case 'greeting':
        return this.expertGreeting();
      case 'diagnosis':
        return this.technicalDiagnosis(userInput);
      case 'qualification':
        return this.qualifyNeeds(userInput);
      case 'consultation':
        return this.expertConsultation();
      case 'proposal':
        return this.personalizedProposal();
      case 'conversion':
        return this.conversionAttempt();
      default:
        return this.fallbackResponse();
    }
  }
  
  expertGreeting() {
    const greetings = {
      french: "Bonjour ! Fares à votre service, expert technique CCI depuis 15 ans.",
      arabic: "أهلاً وسهلاً! أنا فارس، خبير التنظيف في CCI منذ 15 سنة",
      english: "Hello! Fares here, CCI's senior technical expert with 15+ years experience.",
      arabizi: "Ahla! Ana Fares, expert fel cleaning fi CCI men 15 ans 😊"
    };
    
    this.phase = 'diagnosis';
    return greetings[this.userLanguage] || greetings.french;
  }
}
```

### 7. **Quick Replies Multilingual**
```javascript
// Load quick replies based on language
function getQuickReplies(language) {
  const replies = {
    french: ["🏺 Restauration Marbre", "🛋️ Nettoyage Salon", "🚨 Urgence"],
    arabic: ["🏺 ترميم الرخام", "🛋️ تنظيف الصالون", "🚨 حالة طوارئ"],
    english: ["🏺 Marble Restoration", "🛋️ Upholstery Cleaning", "🚨 Emergency"],
    arabizi: ["🏺 Marbre restoration", "🛋️ Salon cleaning", "🚨 Emergency"]
  };
  
  return replies[language] || replies.french;
}
```

## Testing Checklist

### Language Detection
- [ ] French formal input → Professional response
- [ ] French informal input → Friendly response  
- [ ] Arabic input → Cultural expressions used
- [ ] English input → Business tone maintained
- [ ] Arabizi input → Casual modern style
- [ ] Mixed language input → Appropriate adaptation

### Persona Consistency  
- [ ] Always introduces as "Fares"
- [ ] Mentions 15+ years experience
- [ ] Uses technical terminology appropriately
- [ ] Provides expert diagnosis before selling
- [ ] Offers inspection/consultation
- [ ] Includes phone number: 98-557-766

### Conversion Flow
- [ ] Problem acknowledgment with expertise
- [ ] Technical questions for qualification
- [ ] Expert solution recommendation
- [ ] Clear next step with contact info
- [ ] Urgency detection and response
- [ ] Cultural appropriateness maintained

### Error Handling
- [ ] Multilingual error messages
- [ ] Maintains Fares persona in errors
- [ ] Provides phone fallback
- [ ] Human-like, not technical errors

## Deployment Notes

1. **Environment Variables**
   ```bash
   AI_MODEL=gemini-2.0-flash
   MAX_TOKENS=1200
   TEMPERATURE=0.7
   PHONE_NUMBER=98-557-766
   ```

2. **File Dependencies**
   - Ensure all JSON files are accessible
   - Load enhanced system prompt as primary
   - Keep original files as backup
   - Update paths in configuration

3. **Performance Monitoring**
   - Log language detection accuracy
   - Track conversation phase completion
   - Monitor conversion rates by language
   - Measure response time and quality

4. **Fallback Strategy**
   - If enhanced system fails → use original prompt
   - If language detection fails → default to French
   - If service data unavailable → use static list
   - Always maintain phone contact option

---

**Ready to deploy?** Test each component individually, then integrate step by step for smooth transition to the enhanced Fares expert persona!