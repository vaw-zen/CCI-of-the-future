/**
 * Test Images CCI Services UNIQUEMENT (Pas d'images web)
 */

const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/auto-post-daily';

async function testOnlyCCIImages() {
  console.log('🏢 Test Images CCI Services UNIQUEMENT\n');
  console.log('🚫 Images web désactivées');
  console.log('✅ Seules les images locales CCI Services sont utilisées\n');
  
  const tests = [
    { name: 'Service General', postType: 'service' },
    { name: 'Tip General', postType: 'tip' },
    { name: 'Motivation', postType: 'motivation' },
    { name: 'Seasonal', postType: 'seasonal' }
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`${i + 1}️⃣ Test ${test.name}...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType: test.postType,
          includeHashtags: false,
          includeImage: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ SUCCESS!');
        console.log(`   📝 Contenu: "${data.generated_content.substring(0, 80)}..."`);
        
        const imageUrl = data.selected_image || '';
        console.log(`   🖼️ Image: ${imageUrl}`);
        
        // Vérifier si c'est une image CCI Services locale
        const isCCILocal = imageUrl.includes('cciservices.online');
        const isUnsplash = imageUrl.includes('unsplash.com');
        
        console.log(`   🏢 Image CCI Services: ${isCCILocal ? '✅ OUI' : '❌ NON'}`);
        console.log(`   🌐 Image Web (Unsplash): ${isUnsplash ? '❌ OUI (PROBLÈME!)' : '✅ NON'}`);
        console.log(`   📱 Facebook ID: ${data.facebook_response?.id || 'Posted'}`);
        
        // Identifier le type d'image CCI
        if (isCCILocal) {
          if (imageUrl.includes('salon')) console.log('   📂 Catégorie: SALON');
          else if (imageUrl.includes('moquette')) console.log('   📂 Catégorie: TAPIS/MOQUETTE');
          else if (imageUrl.includes('marbre') || imageUrl.includes('cristallisation') || imageUrl.includes('polishing')) console.log('   📂 Catégorie: MARBRE');
          else if (imageUrl.includes('chantier')) console.log('   📂 Catégorie: POST-CHANTIER');
          else if (imageUrl.includes('tapisserie') || imageUrl.includes('retapissage')) console.log('   📂 Catégorie: TAPISSERIE');
          else console.log('   📂 Catégorie: GÉNÉRAL');
        }
        
      } else {
        console.log('❌ FAILED');
        console.log(`   Error: ${data.error}`);
      }
      
    } catch (error) {
      console.log('❌ ERROR');
      console.log(`   ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between posts
  }

  console.log('📊 VALIDATION:');
  console.log('✅ Toutes les images doivent être de cciservices.online');
  console.log('❌ Aucune image d\'unsplash.com ne doit apparaître');
  console.log('🎯 Images CCI Services par catégorie de service');
}

// Run test
testOnlyCCIImages();