// Minimal test API to isolate the issue
export async function POST(request) {
  try {
    console.log('🔍 Test API called');
    
    const body = await request.json();
    console.log('📝 Body received:', body);
    
    return Response.json({
      success: true,
      message: "Test API is working",
      echo: body
    });
    
  } catch (error) {
    console.error('❌ Test API Error:', error);
    return Response.json({
      success: false,
      error: "Test API failed",
      details: error.message
    }, { status: 500 });
  }
}