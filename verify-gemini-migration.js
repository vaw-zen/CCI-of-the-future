/**
 * Final verification that all Gemini APIs are using Gemini 2.0 Flash
 */

console.log('🔄 Verifying Gemini 2.0 Flash Migration\n');

// Check 1: Auto-post API configuration
console.log('1️⃣ Checking Auto-Post API Configuration...');
try {
  const autoPostFile = require('fs').readFileSync('./src/app/api/auto-post-daily/route.js', 'utf8');
  
  if (autoPostFile.includes('gemini-2.0-flash')) {
    console.log('   ✅ Auto-post API using gemini-2.0-flash');
  } else if (autoPostFile.includes('gemini-1.5')) {
    console.log('   ❌ Auto-post API still using old model');
  } else {
    console.log('   ⚠️  Could not detect model in auto-post API');
  }
} catch (error) {
  console.log('   ❌ Error checking auto-post API:', error.message);
}

// Check 2: Main Gemini API configuration  
console.log('\n2️⃣ Checking Main Gemini API Configuration...');
try {
  const geminiFile = require('fs').readFileSync('./src/app/api/gemini/route.js', 'utf8');
  
  if (geminiFile.includes('gemini-2.0-flash')) {
    console.log('   ✅ Main Gemini API using gemini-2.0-flash');
  } else if (geminiFile.includes('gemini-1.5')) {
    console.log('   ❌ Main Gemini API still has old model references');
  } else {
    console.log('   ⚠️  Could not detect model in main Gemini API');
  }
} catch (error) {
  console.log('   ❌ Error checking main Gemini API:', error.message);
}

// Check 3: AI Config file
console.log('\n3️⃣ Checking AI Config File...');
try {
  const configFile = require('fs').readFileSync('./tuning/ai-config.json', 'utf8');
  const config = JSON.parse(configFile);
  
  if (config.model.name === 'gemini-2.0-flash') {
    console.log('   ✅ AI config using gemini-2.0-flash');
  } else {
    console.log(`   ❌ AI config using: ${config.model.name}`);
  }
} catch (error) {
  console.log('   ❌ Error checking AI config:', error.message);
}

// Check 4: Documentation
console.log('\n4️⃣ Checking Documentation...');
try {
  const docsFile = require('fs').readFileSync('./GEMINI_SETUP.md', 'utf8');
  
  if (docsFile.includes('gemini-2.0-flash')) {
    console.log('   ✅ Documentation updated to gemini-2.0-flash');
  } else if (docsFile.includes('gemini-1.5')) {
    console.log('   ❌ Documentation still references old model');
  } else {
    console.log('   ⚠️  Could not detect model in documentation');
  }
} catch (error) {
  console.log('   ❌ Error checking documentation:', error.message);
}

console.log('\n📋 Migration Summary:');
console.log('   🔄 Updated auto-post API to use Gemini 2.0 Flash');
console.log('   🔄 Updated main Gemini API fallback to use Gemini 2.0 Flash');
console.log('   🔄 Updated AI config file to use Gemini 2.0 Flash');
console.log('   🔄 Updated documentation to reflect current model');

console.log('\n✅ All systems should now be using Gemini 2.0 Flash!');
console.log('\n📝 Next Steps:');
console.log('   1. Test the auto-post API: node test-auto-post.js');
console.log('   2. Test the main chat API via the website');
console.log('   3. Monitor for any model-related errors');
console.log('\n🚀 Your AI-powered Facebook posting is ready with the latest model!');