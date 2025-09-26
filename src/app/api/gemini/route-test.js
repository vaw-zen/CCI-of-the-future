// Ultra simple test version
export async function POST(request) {
  try {
    console.log('🔍 API route called');
    
    const body = await request.json();
    console.log('✅ Body parsed:', body);
    
    return Response.json({
      success: true,
      message: "Test response - API is working!",
      receivedMessage: body.message
    });
    
  } catch (error) {
    console.error('❌ Simple API Error:', error);
    return Response.json({
      success: false,
      error: "Test error",
      details: error.message
    }, { status: 500 });
  }
}