# Enhanced Tuning Loader Integration Guide

## Overview
The enhanced tuning loader system provides **Fares expert persona** with **multi-language support** and **cultural adaptation** for the CCI Services chatbot.

## Quick Integration

### 1. **Server-Side Usage (API Routes)**

```javascript
import { 
  loadTuningConfigServer,
  detectUserLanguage,
  detectUrgency,
  getAdaptedGreeting,
  getEnhancedSystemPrompt,
  getAdaptedErrorMessage
} from '@/utils/tuning-loader-server';

// In your API route (e.g., /api/gemini)
export async function POST(request) {
  try {
    const { message } = await request.json();
    
    // Detect user context
    const userLanguage = detectUserLanguage(message);
    const isUrgent = detectUrgency(message);
    
    // Get enhanced system prompt with context
    const systemPrompt = getEnhancedSystemPrompt(userLanguage, isUrgent);
    
    // Load configuration
    const config = loadTuningConfigServer();
    
    console.log(`🎭 Fares persona: ${config.isEnhanced ? 'ACTIVE' : 'FALLBACK'}`);
    console.log(`🌍 Language detected: ${userLanguage}`);
    console.log(`🚨 Urgency: ${isUrgent ? 'YES' : 'NO'}`);
    
    // Use with your AI model
    const response = await aiModel.generateContent({
      systemPrompt,
      userMessage: message,
      // ... other parameters
    });
    
    return Response.json({ response });
    
  } catch (error) {
    // Get adapted error message
    const userLanguage = detectUserLanguage(message || '');
    const errorMessage = getAdaptedErrorMessage('apiError', userLanguage);
    
    return Response.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}
```

### 2. **Client-Side Usage (React Components)**

```javascript
import { 
  getTuningConfig,
  getChatMessages,
  getQuickReplies,
  detectClientLanguage,
  getUIText,
  getErrorMessage
} from '@/utils/tuning-loader-enhanced';

// In your chat component
export default function EnhancedChatWidget() {
  const [userLanguage, setUserLanguage] = useState('french');
  const [messages, setMessages] = useState([]);
  
  // Load enhanced configuration
  const config = getTuningConfig(true); // true = prefer enhanced
  const chatMessages = getChatMessages(userLanguage, true);
  const quickReplies = getQuickReplies(userLanguage, true);
  const uiText = getUIText(userLanguage, true);
  
  // Initialize with Fares greeting
  useEffect(() => {
    setMessages([chatMessages.initialMessage]);
  }, [userLanguage]);
  
  const handleUserMessage = (userInput) => {
    // Detect language and adapt
    const detectedLang = detectClientLanguage(userInput);
    if (detectedLang !== userLanguage) {
      setUserLanguage(detectedLang);
    }
    
    // Send to API with context
    sendMessageToAPI(userInput, detectedLang);
  };
  
  const handleError = (errorType) => {
    const errorMessage = getErrorMessage(errorType, userLanguage, true);
    setMessages(prev => [...prev, {
      text: errorMessage,
      sender: 'ai',
      timestamp: new Date()
    }]);
  };
  
  return (
    <div className="enhanced-chat-widget">
      <div className="chat-header">
        <h3>{uiText.headerTitle}</h3>
        <p>{uiText.headerSubtitle}</p>
        <span className="status">{uiText.onlineStatus}</span>
      </div>
      
      <div className="messages">
        {messages.map((msg, idx) => (
          <Message key={idx} {...msg} />
        ))}
      </div>
      
      <div className="quick-replies">
        {quickReplies.map((reply, idx) => (
          <button 
            key={idx}
            onClick={() => handleUserMessage(reply)}
            className="quick-reply-btn"
          >
            {reply}
          </button>
        ))}
      </div>
      
      <div className="input-area">
        <input 
          type="text"
          placeholder={uiText.inputPlaceholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleUserMessage(e.target.value);
              e.target.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}
```

### 3. **Language Detection Examples**

```javascript
import { detectUserLanguage } from '@/utils/tuning-loader-server';

// Test cases
console.log(detectUserLanguage("Bonjour, j'ai un problème")); // → 'french'
console.log(detectUserLanguage("Hello, I need help")); // → 'english'  
console.log(detectUserLanguage("أهلاً، عندي مشكلة")); // → 'arabic'
console.log(detectUserLanguage("Ahla, 3andi mushkila")); // → 'arabizi'
```

### 4. **Urgency Detection**

```javascript
import { detectUrgency } from '@/utils/tuning-loader-server';

// Emergency detection
console.log(detectUrgency("Urgent! Dégât des eaux")); // → true
console.log(detectUrgency("مستعجل، مشكلة كبيرة")); // → true
console.log(detectUrgency("Emergency cleaning needed")); // → true
console.log(detectUrgency("Tawa urgent, sa3dni")); // → true (arabizi)
```

## Advanced Features

### **Adaptive Greetings**

```javascript
import { getAdaptedGreeting } from '@/utils/tuning-loader-server';

// Context-aware greetings
const greeting = getAdaptedGreeting('french', 'medium');
// → "Bonjour ! Fares à votre service, expert CCI depuis 15 ans."

const formalGreeting = getAdaptedGreeting('english', 'high');
// → "Good day, Fares here, CCI's senior technical expert."

const casualGreeting = getAdaptedGreeting('arabizi', 'low');
// → "Yooo! Fares hna, expert CCI 🔥"
```

### **Service Recommendations**

```javascript
import { getServiceRecommendations } from '@/utils/tuning-loader-server';

const services = getServiceRecommendations("My marble floor is dull", 'english');
// → ['marble']

const urgentServices = getServiceRecommendations("Urgent! Yacht cleaning needed", 'english');
// → ['yacht', 'emergency']
```

## Error Handling

```javascript
// Server-side error handling
try {
  const config = loadTuningConfigServer();
  // ... use config
} catch (error) {
  console.error('🔧 Tuning system error:', error);
  // System automatically falls back to basic Fares persona
}

// Client-side error handling
const handleChatError = (error) => {
  const userLang = detectClientLanguage(lastUserMessage);
  const errorMsg = getErrorMessage('apiError', userLang, true);
  
  // Show user-friendly error with phone fallback
  showErrorMessage(errorMsg);
};
```

## Configuration Files Priority

1. **Enhanced System**: `ai-system-prompt-enhanced.json` (preferred)
2. **Fallback System**: `ai-system-prompt.json` (if enhanced not found)
3. **Hard-coded Fallback**: Built-in Fares persona (if files fail)

## Performance Tips

- **Cache Language Detection**: Store detected language to avoid re-detection
- **Preload Quick Replies**: Load language-specific quick replies at initialization
- **Batch Context Detection**: Detect language, urgency, formality in one pass
- **Fallback Strategy**: Always have hard-coded fallbacks for critical paths

## Testing Checklist

- [ ] Enhanced system loads correctly
- [ ] Language detection works for all 4 languages
- [ ] Fares persona maintains consistency
- [ ] Urgency detection triggers appropriate responses
- [ ] Error messages display in correct language
- [ ] Quick replies adapt to user language
- [ ] Fallback system works when files missing
- [ ] Cultural expressions feel authentic

## Monitoring & Analytics

```javascript
// Log enhanced system metrics
console.log('🎯 Fares System Status:', {
  enhanced: config.isEnhanced,
  language: userLanguage,
  urgency: isUrgent,
  persona: config.systemPrompt.persona?.name || 'Unknown'
});
```

---

**Ready to deploy!** The enhanced system provides seamless Fares expert persona with intelligent language adaptation while maintaining full backward compatibility. 🚀