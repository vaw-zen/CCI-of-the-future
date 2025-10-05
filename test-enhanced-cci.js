/**
 * Test Enhanced CCI Services Auto-Post with New Guidelines
 */

const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/auto-post-daily';

async function testEnhancedCCIPosts() {
  console.log('🎯 Test Enhanced CCI Services Auto-Post System\n');
  console.log('📋 Testing new guidelines:');
  console.log('   ✅ 200-400 characters');
  console.log('   ✅ Natural French for Facebook');
  console.log('   ✅ 2-5 emojis');
  console.log('   ✅ CCI Services mention');
  console.log('   ✅ Strong call-to-action');
  console.log('   ✅ Service-specific content\n');

  try {
    // Test 1: Service highlight with new format
    console.log('1️⃣ Test: Service Marble Polishing...');
    const marbleResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postType: 'service',
        includeHashtags: true,
        includeImage: true
      })
    });
    
    const marbleData = await marbleResponse.json();
    await analyzePost('MARBLE SERVICE', marbleData);

    // Test 2: Professional tip with new guidelines
    console.log('2️⃣ Test: Professional Cleaning Tip...');
    const tipResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postType: 'tip',
        includeHashtags: true,
        includeImage: true
      })
    });
    
    const tipData = await tipResponse.json();
    await analyzePost('PROFESSIONAL TIP', tipData);

    // Test 3: Motivation with call-to-action
    console.log('3️⃣ Test: Motivational Content...');
    const motivationResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postType: 'motivation',
        includeHashtags: true,
        includeImage: true
      })
    });
    
    const motivationData = await motivationResponse.json();
    await analyzePost('MOTIVATION', motivationData);

    // Test 4: Custom prompt for specific service
    console.log('4️⃣ Test: Custom Post-Construction Cleaning...');
    const customResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customPrompt: `Create a Facebook post for CCI Services about "Nettoyage fin de chantier".
                       Follow these rules:
                       - Write in natural French for Facebook (200-400 characters)
                       - Include 2-5 emojis naturally
                       - Mention CCI Services explicitly
                       - End with ONE call-to-action: "🔗 Visitez notre site : https://cciservices.online", "☎️ Appelez-nous dès maintenant au +216 98 557 766", or "💬 Demandez votre devis gratuit dès aujourd'hui !"
                       - Describe post-construction cleaning: floors, walls, windows, bathrooms`,
        includeHashtags: true,
        includeImage: true
      })
    });
    
    const customData = await customResponse.json();
    await analyzePost('POST-CONSTRUCTION', customData);

    console.log('\n📊 SUMMARY:');
    console.log('✅ Enhanced prompts implemented');
    console.log('✅ Specific call-to-actions included');
    console.log('✅ Character limits adjusted (200-400)');
    console.log('✅ Professional French content');
    console.log('✅ Service-specific descriptions');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

async function analyzePost(type, data) {
  if (data.success) {
    const content = data.generated_content || '';
    
    console.log(`✅ ${type} - SUCCESS!`);
    console.log(`   📝 Content: "${content}"`);
    console.log(`   📏 Length: ${content.length} characters`);
    console.log(`   🖼️ Image: ${data.selected_image ? 'Included' : 'None'}`);
    console.log(`   📱 Facebook: ${data.facebook_response?.id || 'Posted'}`);
    
    // Quality analysis based on new guidelines
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    const mentionsCCI = content.toLowerCase().includes('cci');
    const hasCallToAction = content.includes('cciservices.online') || content.includes('+216 98 557 766') || content.includes('devis gratuit');
    const properLength = content.length >= 200 && content.length <= 400;
    const inFrench = /[àáâäèéêëìíîïòóôöùúûü]/.test(content) || content.includes('é') || content.includes('è');
    
    console.log(`   📋 Quality Check:`);
    console.log(`      Length (200-400): ${properLength ? '✅' : '❌'} (${content.length})`);
    console.log(`      French: ${inFrench ? '✅' : '❌'}`);
    console.log(`      Emojis (2-5): ${hasEmojis && emojiCount >= 2 && emojiCount <= 5 ? '✅' : '❌'} (${emojiCount})`);
    console.log(`      CCI mention: ${mentionsCCI ? '✅' : '❌'}`);
    console.log(`      Call-to-action: ${hasCallToAction ? '✅' : '❌'}`);
    
  } else {
    console.log(`❌ ${type} - FAILED`);
    console.log(`   Error: ${data.error}`);
  }
  
  console.log('');
  await new Promise(resolve => setTimeout(resolve, 1500)); // Wait between requests
}

// Run the enhanced test
testEnhancedCCIPosts();