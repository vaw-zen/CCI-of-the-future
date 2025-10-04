/**
 * Gemini Model Availability Checker
 * This script checks which Gemini models are currently available
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
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

async function checkGeminiModels() {
  console.log('🔍 Checking Gemini Model Availability\n');

  const envVars = loadEnvFile();
  const GEMINI_API_KEY = envVars.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('❌ No GEMINI_API_KEY found in .env.local');
    return;
  }

  try {
    // Check available models
    console.log('📋 Checking available models...');
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    
    if (!modelsResponse.ok) {
      throw new Error(`API Error: ${modelsResponse.status} ${modelsResponse.statusText}`);
    }
    
    const modelsData = await modelsResponse.json();
    
    console.log('✅ Available Gemini Models:');
    
    const targetModels = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-flash-latest'
    ];
    
    let availableModels = [];
    
    if (modelsData.models) {
      modelsData.models.forEach(model => {
        const modelName = model.name.replace('models/', '');
        const isTarget = targetModels.some(target => modelName.includes(target.replace('-latest', '')));
        
        if (isTarget) {
          availableModels.push(modelName);
          const status = model.supportedGenerationMethods?.includes('generateContent') ? '✅' : '⚠️';
          console.log(`   ${status} ${modelName}`);
          if (model.displayName) {
            console.log(`      Display Name: ${model.displayName}`);
          }
          if (model.description) {
            console.log(`      Description: ${model.description.substring(0, 100)}...`);
          }
        }
      });
    }
    
    console.log('\n🎯 Recommendations:');
    
    if (availableModels.some(m => m.includes('gemini-1.5-flash'))) {
      console.log('   ✅ gemini-1.5-flash is available (RECOMMENDED)');
      console.log('   📋 Fast, efficient, and free with generous limits');
    }
    
    if (availableModels.some(m => m.includes('gemini-2.0-flash'))) {
      console.log('   🆕 gemini-2.0-flash is available (NEWER)');
      console.log('   📋 Latest model with improved capabilities');
    }
    
    console.log('\n🔧 Current Configuration:');
    console.log('   📁 File: src/app/api/auto-post-daily/route.js');
    console.log('   🤖 Model: gemini-1.5-flash (as coded)');
    
    // Test the specific model we're using
    console.log('\n🧪 Testing gemini-1.5-flash model...');
    
    const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say 'Hello, I am Gemini 1.5 Flash and I am working correctly!' in French."
          }]
        }]
      })
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      const response = testData.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✅ gemini-1.5-flash test successful!');
      console.log(`   🤖 Response: ${response}`);
    } else {
      console.log('❌ gemini-1.5-flash test failed');
      const errorText = await testResponse.text();
      console.log(`   📋 Error: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Error checking models:', error.message);
  }
}

// Run the check
checkGeminiModels();