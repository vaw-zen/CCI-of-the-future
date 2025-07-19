import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPromptServer, getAIConfigServer, getChatMessagesServer } from '../../../utils/tuning-loader-server';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log(process.env.GEMINI_API_KEY, 'az key');
export async function POST(request) {
  console.log('API route called');
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
  console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { message, chatHistory } = body;
    console.log('Message:', message);
    console.log('Chat history length:', chatHistory?.length);

    if (!process.env.GEMINI_API_KEY) {
      console.error('No API key found');
      const chatMessages = getChatMessagesServer();
      return Response.json({ 
        success: false, 
        error: chatMessages.errorMessages.apiKeyError,
        details: 'GEMINI_API_KEY environment variable not set'
      }, { status: 500 });
    }

    // Load configurations
    const systemPrompt = getSystemPromptServer();
    const aiConfig = getAIConfigServer();
    
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

    // Send the message and get response
    console.log('Sending user message to Gemini...');
    
    // Include system prompt in the first message if no history
    const messageToSend = (!chatHistory || chatHistory.length === 0) 
      ? `${systemPrompt}\n\nUser: ${message}`
      : message;
    
    const result = await chat.sendMessage(messageToSend);
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
    const chatMessages = getChatMessagesServer();
    return Response.json({ 
      success: false, 
      error: chatMessages.errorMessages.aiResponseError,
      details: error.message
    }, { status: 500 });
  }
} 