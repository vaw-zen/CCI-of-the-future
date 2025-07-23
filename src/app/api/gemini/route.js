// Dynamic import for Google Generative AI - only loaded when API is called
let genAI = null;
let getSystemPromptServer = null;
let getAIConfigServer = null;
let getChatMessagesServer = null;

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

// Add timeout wrapper
function withTimeout(promise, timeoutMs = 25000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

console.log(process.env.GEMINI_API_KEY, 'az key');
export async function POST(request) {
  console.log('API route called');
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
  console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
  
  try {
    // Initialize AI libraries with timeout
    console.log('Starting AI initialization...');
    const startTime = Date.now();
    const { genAI, getSystemPromptServer, getAIConfigServer, getChatMessagesServer } = await withTimeout(
      initializeAI(), 
      30000 // 30 second timeout for initialization (cold start can take 15-20s)
    );
    console.log(`AI initialization completed in ${Date.now() - startTime}ms`);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { message, chatHistory } = body;
    console.log('Message:', message);
    console.log('Chat history length:', chatHistory?.length);

    if (!process.env.GEMINI_API_KEY) {
      console.error('No API key found');
      // Load standardized error message
      try {
        const fs = await import('fs');
        const path = await import('path');
        const tuningPath = path.join(process.cwd(), 'tuning');
        const chatMessagesPath = path.join(tuningPath, 'chat-messages.json');
        const chatMessagesData = JSON.parse(fs.readFileSync(chatMessagesPath, 'utf8'));
        return Response.json({ 
          success: false, 
          error: chatMessagesData.errorMessages.apiKeyError,
          details: 'GEMINI_API_KEY environment variable not set'
        }, { status: 500 });
      } catch (tuningError) {
        return Response.json({ 
          success: false, 
          error: "Désolé, je suis temporairement indisponible. Pouvez-vous me rappeler plus tard ou m'appeler au 98-557-766 ?",
          details: 'GEMINI_API_KEY environment variable not set'
        }, { status: 500 });
      }
    }

    // Validate API key format (basic check)
    if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
      console.error('Invalid API key format');
      // Load standardized error message
      try {
        const fs = await import('fs');
        const path = await import('path');
        const tuningPath = path.join(process.cwd(), 'tuning');
        const chatMessagesPath = path.join(tuningPath, 'chat-messages.json');
        const chatMessagesData = JSON.parse(fs.readFileSync(chatMessagesPath, 'utf8'));
        return Response.json({ 
          success: false, 
          error: chatMessagesData.errorMessages.apiKeyError,
          details: 'Invalid GEMINI_API_KEY format'
        }, { status: 401 });
      } catch (tuningError) {
        return Response.json({ 
          success: false, 
          error: "Désolé, je suis temporairement indisponible. Pouvez-vous me rappeler plus tard ou m'appeler au 98-557-766 ?",
          details: 'Invalid GEMINI_API_KEY format'
        }, { status: 401 });
      }
    }

    // Load configurations from tuning files
    let systemPrompt, aiConfig;
    try {
      const fs = await import('fs');
      const path = await import('path');
      const tuningPath = path.join(process.cwd(), 'tuning');
      
      // Load system prompt
      const systemPromptPath = path.join(tuningPath, 'ai-system-prompt.json');
      const systemPromptData = JSON.parse(fs.readFileSync(systemPromptPath, 'utf8'));
      systemPrompt = systemPromptData.systemPrompt.fullPrompt;
      
      // Load AI config
      const aiConfigPath = path.join(tuningPath, 'ai-config.json');
      const aiConfigData = JSON.parse(fs.readFileSync(aiConfigPath, 'utf8'));
      aiConfig = aiConfigData;
    } catch (tuningError) {
      console.error('Error loading tuning files, using fallback:', tuningError);
      // Fallback to server-side functions
      systemPrompt = getSystemPromptServer();
      aiConfig = getAIConfigServer();
    }
    
    // Create a chat model instance
    console.log('Creating Gemini model...');
    const model = genAI.getGenerativeModel({ model: aiConfig.model.name });

    // Create a chat session
    console.log('Starting chat session...');
    const chat = model.startChat({
      history: chatHistory || [],
      generationConfig: {
        maxOutputTokens: aiConfig.model.maxOutputTokens,
        temperature: aiConfig.model.temperature,
      },
    });

    // Send system prompt first if no history
    if (!chatHistory || chatHistory.length === 0) {
      console.log('No chat history, starting fresh conversation...');
    }

    // Include system prompt in the first message if no history
    const messageToSend = (!chatHistory || chatHistory.length === 0) 
      ? `${systemPrompt}\n\nUser: ${message}`
      : message;
    
    // Send the message and get response with timeout
    console.log('Sending user message to Gemini...');
    console.log('Message length:', messageToSend.length);
    console.log('System prompt length:', systemPrompt.length);
    
    const geminiStartTime = Date.now();
    const result = await withTimeout(
      chat.sendMessage(messageToSend),
      45000 // 45 second timeout for Gemini response (allows for complex responses)
    );
    console.log(`Gemini response received in ${Date.now() - geminiStartTime}ms`);
    console.log('Got response from Gemini');
    
    const response = await result.response;
    const text = response.text();
    console.log('Response text:', text);

    return Response.json({ 
      success: true, 
      message: text,
      chatHistory: chat.getHistory()
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Load standardized error messages from tuning files
    let chatMessages;
    try {
      const fs = await import('fs');
      const path = await import('path');
      const tuningPath = path.join(process.cwd(), 'tuning');
      const chatMessagesPath = path.join(tuningPath, 'chat-messages.json');
      const chatMessagesData = JSON.parse(fs.readFileSync(chatMessagesPath, 'utf8'));
      chatMessages = chatMessagesData;
    } catch (tuningError) {
      // Fallback to default error messages if tuning files can't be loaded
      chatMessages = {
        errorMessages: {
          apiError: "Désolé, je suis un peu occupé en ce moment ! 😅 Pouvez-vous me rappeler dans quelques minutes ? Ou si c'est urgent, appelez-moi au 98-557-766.",
          unknownError: "Oups ! Il semble que j'aie un petit problème technique. Pouvez-vous réessayer dans quelques instants ? Ou si vous préférez, appelez-moi au 98-557-766 pour un service plus rapide.",
          apiKeyError: "Désolé, je suis temporairement indisponible. Pouvez-vous me rappeler plus tard ou m'appeler au 98-557-766 ?",
          aiResponseError: "Je suis un peu distrait aujourd'hui ! 😅 Pouvez-vous reformuler votre question ? Ou si c'est urgent, appelez-moi au 98-557-766."
        }
      };
    }
    
    // Use standardized error messages based on error type
    let errorMessage = chatMessages.errorMessages.aiResponseError;
    let statusCode = 500;
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      errorMessage = chatMessages.errorMessages.apiError; // Use API error for timeouts
      statusCode = 408; // Request Timeout
    } else if (error.message.includes('API key') || error.message.includes('authentication')) {
      errorMessage = chatMessages.errorMessages.apiKeyError;
      statusCode = 401; // Unauthorized
    }
    
    return Response.json({ 
      success: false, 
      error: errorMessage,
      details: error.message
    }, { status: statusCode });
  }
} 