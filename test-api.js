// Simple test script to verify the API endpoint
const testMessage = {
  message: "Bonjour, quels sont vos services ?",
  chatHistory: []
};

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);

    const data = await response.json();
    console.log('📊 Response data:', data);

    if (data.success) {
      console.log('✅ API test successful!');
      console.log('💬 Response message:', data.message.substring(0, 100) + '...');
    } else {
      console.log('❌ API test failed:', data.error);
      console.log('🔍 Details:', data.details);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAPI();