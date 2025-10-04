/**
 * Test script for the Gemini AI + Facebook auto-posting API
 */

const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/auto-post-daily';

async function testAutoPostAPI() {
  console.log('🤖 Testing Gemini AI + Facebook Auto-Post API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'GET'
    });
    const healthData = await healthResponse.json();
    console.log('✅ Health check result:', healthData);
    console.log('');

    // Test 2: Generate cleaning tip post with image
    console.log('2️⃣ Testing cleaning tip generation with image...');
    const tipResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postType: 'tip',
        includeHashtags: true,
        includeImage: true
      })
    });
    const tipData = await tipResponse.json();
    console.log('✅ Cleaning tip result:', tipData);
    console.log('');

    // Test 3: Generate motivational post with image
    console.log('3️⃣ Testing motivational post generation with image...');
    const motivationResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postType: 'motivation',
        includeHashtags: true,
        includeImage: true
      })
    });
    const motivationData = await motivationResponse.json();
    console.log('✅ Motivational post result:', motivationData);
    console.log('');

    // Test 4: Generate service highlight post with image
    console.log('4️⃣ Testing service highlight generation with image...');
    const serviceResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postType: 'service',
        includeHashtags: true,
        includeImage: true
      })
    });
    const serviceData = await serviceResponse.json();
    console.log('✅ Service highlight result:', serviceData);
    console.log('');

    // Test 5: Text-only post (no image)
    console.log('5️⃣ Testing text-only post (no image)...');
    const textOnlyResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postType: 'tip',
        includeHashtags: true,
        includeImage: false
      })
    });
    const textOnlyData = await textOnlyResponse.json();
    console.log('✅ Text-only result:', textOnlyData);
    console.log('');

    // Test 6: Custom prompt with image
    console.log('6️⃣ Testing custom prompt with image...');
    const customResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customPrompt: `Create a Facebook post about the importance of regular carpet maintenance for Tunisian homes. 
                       Mention CCI Services expertise. Keep it under 150 characters, include emojis, write in French.`,
        includeHashtags: true,
        includeImage: true
      })
    });
    const customData = await customResponse.json();
    console.log('✅ Custom prompt result:', customData);
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Different post type examples for manual testing
const testExamples = {
  tipWithImage: {
    postType: 'tip',
    includeHashtags: true,
    includeImage: true
  },
  motivationWithImage: {
    postType: 'motivation',
    includeHashtags: true,
    includeImage: true
  },
  serviceWithImage: {
    postType: 'service',
    includeHashtags: true,
    includeImage: true
  },
  seasonalWithImage: {
    postType: 'seasonal',
    includeHashtags: true,
    includeImage: true
  },
  textOnly: {
    postType: 'tip',
    includeHashtags: true,
    includeImage: false
  },
  customWithImage: {
    customPrompt: 'Create a post about marble restoration benefits for Tunisian homes, mentioning CCI Services. French language, under 150 chars, include emojis.',
    includeHashtags: true,
    includeImage: true
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAutoPostAPI, testExamples };
}

// Browser version
if (typeof window !== 'undefined') {
  window.testAutoPostAPI = testAutoPostAPI;
  window.testExamples = testExamples;
  console.log('🌐 Browser mode: Run testAutoPostAPI() in console');
} else {
  // Node.js usage
  testAutoPostAPI();
}

// Example manual API calls for different scenarios:
/*
// Quick cleaning tip
fetch('/api/auto-post-daily', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postType: 'tip' })
});

// Motivational Monday post
fetch('/api/auto-post-daily', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    postType: 'motivation',
    customPrompt: 'Create an inspiring Monday motivation post about starting the week with a clean, organized home. Mention CCI Services. French, under 150 chars.'
  })
});

// Service spotlight
fetch('/api/auto-post-daily', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postType: 'service' })
});
*/