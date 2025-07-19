import { GoogleGenerativeAI } from '@google/generative-ai';

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
      return Response.json({ 
        success: false, 
        error: 'Clé API non configurée' 
      }, { status: 500 });
    }

    // Create a chat model instance
    console.log('Creating Gemini model...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // System context for cleaning business
    const systemPrompt = `Tu es Fares Chaabane, le propriétaire de Chaabane's Cleaning Intelligence. Tu es un expert professionnel et amical en services de nettoyage. Tu aides les clients avec:

- Services de nettoyage résidentiel et commercial
- Tarification et devis
- Prise de rendez-vous
- Conseils et astuces de nettoyage
- Services de nettoyage d'urgence
- Nettoyage spécialisé (tapis, fenêtres, nettoyage en profondeur)

Sois toujours serviable, professionnel et concentré sur les services de nettoyage. Garde tes réponses concises mais informatives. Réponds toujours en français.`;

    // Create a chat session
    console.log('Starting chat session...');
    const chat = model.startChat({
      history: chatHistory || [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
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
    return Response.json({ 
      success: false, 
      error: 'Échec de la réponse de l\'IA',
      details: error.message
    }, { status: 500 });
  }
} 