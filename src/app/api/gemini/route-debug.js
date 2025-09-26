// Diagnostic version avec debug dans la réponse HTTP
export async function POST(request) {
  const debugLog = [];
  
  try {
    debugLog.push('✅ STEP 1: API endpoint accessible');
    
    // Step 2: Parse body
    debugLog.push('🔍 STEP 2: Parsing request body...');
    const body = await request.json();
    const message = body.message;
    debugLog.push(`✅ STEP 2: Body parsed - message: "${message}"`);
    
    if (!message) {
      return Response.json({ 
        success: false, 
        error: "No message provided",
        debugLog 
      }, { status: 400 });
    }
    
    // Step 3: Check API key
    debugLog.push('🔍 STEP 3: Checking API key...');
    if (!process.env.GEMINI_API_KEY) {
      debugLog.push('❌ STEP 3: No API key found in environment');
      return Response.json({ 
        success: false, 
        error: "No API key configured",
        debugLog 
      }, { status: 500 });
    }
    debugLog.push(`✅ STEP 3: API key found - ${process.env.GEMINI_API_KEY.substring(0, 15)}...`);
    
    // Step 4: Import library
    debugLog.push('🔍 STEP 4: Importing @google/generative-ai...');
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    debugLog.push('✅ STEP 4: Library imported successfully');
    
    // Step 5: Create instance
    debugLog.push('🔍 STEP 5: Creating GoogleGenerativeAI instance...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    debugLog.push('✅ STEP 5: GoogleGenerativeAI instance created');
    
    // Step 6: Create model
    debugLog.push('🔍 STEP 6: Creating gemini-pro model...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    debugLog.push('✅ STEP 6: Model created successfully');
    
    // Step 7: Test with simple message
    debugLog.push('🔍 STEP 7: Testing model with "Hello"...');
    const testResult = await model.generateContent("Hello");
    const testResponse = await testResult.response;
    const testText = testResponse.text();
    debugLog.push(`✅ STEP 7: Test successful - response: "${testText.substring(0, 50)}..."`);
    
    // Step 8: Send actual message
    debugLog.push('🔍 STEP 8: Sending actual message...');
    const actualPrompt = `Tu es Fares, expert nettoyage CCI Services. Question client: ${message}`;
    const result = await model.generateContent(actualPrompt);
    const response = await result.response;
    const text = response.text();
    debugLog.push(`✅ STEP 8: Response received - length: ${text.length} chars`);
    
    debugLog.push('🎉 SUCCESS: All steps completed!');
    
    return Response.json({
      success: true,
      message: text,
      debugLog: debugLog,
      model: "gemini-pro",
      steps: "8/8 completed"
    });
    
  } catch (error) {
    debugLog.push(`💥 ERROR at current step: ${error.name} - ${error.message}`);
    
    return Response.json({
      success: false,
      error: `Failed with error: ${error.message}`,
      debugLog: debugLog,
      errorDetails: {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 300) + '...'
      }
    }, { status: 500 });
  }
}