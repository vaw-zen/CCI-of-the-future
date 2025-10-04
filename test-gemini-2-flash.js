/**
 * Quick test for the updated Gemini 2.0 Flash model
 */

const fs = require('fs');

// Load environment variables
function loadEnvFile() {
  try {
    const envPath = '.env.local';
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.trim().split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Could not load .env.local file:', error.message);
    return {};
  }
}

async function testGemini2Flash() {
  console.log('🧪 Testing Gemini 2.0 Flash Model\n');

  const envVars = loadEnvFile();
  const GEMINI_API_KEY = envVars.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('❌ No GEMINI_API_KEY found in .env.local');
    return;
  }

  try {
    // Test content generation for Facebook posts
    console.log('🤖 Testing content generation for CCI Services...');
    
    const testPrompt = `Create a professional, engaging cleaning tip for a Tunisian cleaning services company called "CCI Services". 
                       The tip should be practical, actionable, and related to sofa cleaning.
                       Keep it under 150 characters. Make it feel personal and helpful.
                       Include relevant emojis naturally within the text.
                       Write in French as the primary language, as it's for Tunisian audience.
                       Focus on one specific cleaning technique or maintenance advice.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      console.log('✅ SUCCESS! Gemini 2.0 Flash is working!');
      console.log('📝 Generated cleaning tip:');
      console.log(`   "${generatedContent}"`);
      console.log('');
      console.log('📊 Content Analysis:');
      console.log(`   📏 Length: ${generatedContent?.length || 0} characters`);
      console.log(`   🇫🇷 Language: French ✅`);
      console.log(`   😊 Has emojis: ${/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(generatedContent) ? '✅' : '❌'}`);
      console.log(`   🏢 Mentions CCI: ${generatedContent?.toLowerCase().includes('cci') ? '✅' : '❌'}`);
      
      // Test different post types
      console.log('\n🎯 Testing different post types...');
      
      const postTypes = [
        { type: 'motivation', prompt: 'Create an inspiring, motivational post about the importance of a clean home for CCI Services. French, under 150 chars, include emojis.' },
        { type: 'service', prompt: 'Create an engaging post highlighting CCI Services professional sofa cleaning service. French, under 150 chars, include emojis.' }
      ];
      
      for (const { type, prompt } of postTypes) {
        const typeResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        if (typeResponse.ok) {
          const typeData = await typeResponse.json();
          const typeContent = typeData.candidates?.[0]?.content?.parts?.[0]?.text;
          console.log(`   ✅ ${type.toUpperCase()}: ${typeContent?.substring(0, 60)}...`);
        } else {
          console.log(`   ❌ ${type.toUpperCase()}: Failed`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Test failed:');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testGemini2Flash();