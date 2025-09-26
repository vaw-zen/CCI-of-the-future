// Test endpoint to check available Gemini models
export async function GET(request) {
  try {
    console.log('🔍 Checking available Gemini models...');
    
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({
        error: "No API key found"
      }, { status: 500 });
    }
    
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // List of models to test
    const modelsToTest = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.0-pro", 
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash-8b-latest",
      "gemini-1.5-pro-latest",
      "text-bison-001",
      "chat-bison-001"
    ];
    
    const results = [];
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName
        });
        
        // Try a simple generation to test if model works
        const result = await model.generateContent("Hello");
        const text = result.response.text();
        
        results.push({
          model: modelName,
          status: "✅ Available",
          response: text.substring(0, 50) + "..."
        });
        
        console.log(`✅ ${modelName} works!`);
        
      } catch (error) {
        results.push({
          model: modelName,
          status: "❌ Not available",
          error: error.message.substring(0, 100) + "..."
        });
        
        console.log(`❌ ${modelName} failed:`, error.message);
      }
    }
    
    return Response.json({
      apiKey: process.env.GEMINI_API_KEY.substring(0, 10) + "...",
      results: results,
      availableModels: results.filter(r => r.status.includes("✅")).map(r => r.model)
    });
    
  } catch (error) {
    console.error('❌ Model check failed:', error);
    return Response.json({
      error: error.message,
      details: "Failed to check models"
    }, { status: 500 });
  }
}