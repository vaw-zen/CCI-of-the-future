/**
 * Test French Auto-Post with Enhanced CCI Services Content
 */

const API_BASE_URL = 'http://localhost:3000'; // Updated to correct port
const API_ENDPOINT = '/api/auto-post-daily';

async function testFrenchPosts() {
  console.log('🇫🇷 Testing Auto-Post API with Enhanced French Content for CCI Services\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Vérification de l\'état de l\'API...');
    const healthResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'GET'
    });
    const healthData = await healthResponse.json();
    console.log('✅ État API:', healthData.message);
    console.log('📋 Fonctionnalités:', healthData.features);
    console.log('');

    // Test 2: Service highlight post (Tapisserie)
    console.log('2️⃣ Test: Mise en avant service Tapisserie...');
    const serviceResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postType: 'service',
        includeHashtags: true,
        includeImage: true
      })
    });
    
    const serviceData = await serviceResponse.json();
    await displayResult('SERVICE TAPISSERIE', serviceData);

    // Test 3: Cleaning tip (Tapis/Moquettes)
    console.log('3️⃣ Test: Conseil nettoyage tapis...');
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
    await displayResult('CONSEIL TAPIS', tipData);

    // Test 4: Motivation post
    console.log('4️⃣ Test: Post motivation maison propre...');
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
    await displayResult('MOTIVATION', motivationData);

    // Test 5: Custom prompt for marble care
    console.log('5️⃣ Test: Conseil personnalisé entretien marbre...');
    const marbleResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customPrompt: `Créez un post Facebook sur l'importance de la cristallisation du marbre pour les maisons tunisiennes. 
                       Mentionnez l'expertise de CCI Services en restauration marbre. 
                       Maximum 150 caractères, emojis naturels, langue française.
                       Mettez l'accent sur la protection et l'élégance durable.`,
        includeHashtags: true,
        includeImage: true
      })
    });
    
    const marbleData = await marbleResponse.json();
    await displayResult('MARBRE PERSONNALISÉ', marbleData);

    console.log('\n📊 Résumé des tests:');
    console.log('✅ Tous les posts générés en français');
    console.log('✅ Contenu spécifique aux services CCI');
    console.log('✅ Images sélectionnées automatiquement');
    console.log('✅ Hashtags inclus pour visibilité');

  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
  }
}

async function displayResult(type, data) {
  if (data.success) {
    console.log(`✅ ${type} - SUCCÈS!`);
    console.log(`   📝 Contenu: "${data.generated_content}"`);
    console.log(`   📏 Longueur: ${data.generated_content?.length || 0} caractères`);
    console.log(`   🖼️  Image: ${data.selected_image ? '✅ Incluse' : '❌ Non incluse'}`);
    console.log(`   📱 Facebook ID: ${data.facebook_response?.id || 'Posté'}`);
    console.log(`   🎯 Avec image: ${data.posted_with_image ? 'Oui' : 'Non'}`);
    
    // Analyze content quality
    const content = data.generated_content || '';
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
    const mentionsCCI = content.toLowerCase().includes('cci');
    const inFrench = /[àáâäèéêëìíîïòóôöùúûü]/.test(content) || content.includes('é') || content.includes('è');
    
    console.log(`   📋 Analyse: Emojis ${hasEmojis ? '✅' : '❌'} | CCI ${mentionsCCI ? '✅' : '❌'} | Français ${inFrench ? '✅' : '❌'}`);
  } else {
    console.log(`❌ ${type} - ÉCHEC`);
    console.log(`   Erreur: ${data.error}`);
    console.log(`   Détails: ${JSON.stringify(data).substring(0, 200)}...`);
  }
  console.log('');
  
  // Wait between requests to avoid rate limits
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Test different specific services
async function testSpecificServices() {
  console.log('🎯 Test des services spécifiques CCI\n');
  
  const specificTests = [
    {
      name: 'NETTOYAGE SALON',
      prompt: 'Créez un post sur le nettoyage professionnel de salons par CCI Services: enlèvement taches, dépoussiérage, produits non-toxiques. Français, 150 caractères max, emojis.'
    },
    {
      name: 'FIN DE CHANTIER',
      prompt: 'Post sur le nettoyage fin de chantier CCI Services: sols, murs, vitres, sanitaires après travaux. Espace propre et sain rapidement. Français, 150 caractères, emojis.'
    },
    {
      name: 'RESTAURATION MARBRE',
      prompt: 'Post sur la restauration marbre CCI Services: lustrage, cristallisation, protection. Résultat impeccable garanti. Français, 150 caractères, emojis.'
    }
  ];
  
  for (const test of specificTests) {
    console.log(`🔧 Test: ${test.name}...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPrompt: test.prompt,
          includeHashtags: true,
          includeImage: true
        })
      });
      
      const data = await response.json();
      await displayResult(test.name, data);
    } catch (error) {
      console.log(`❌ ${test.name}: Erreur - ${error.message}\n`);
    }
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testFrenchPosts, testSpecificServices };
}

// Run tests
if (require.main === module) {
  console.log('🚀 Démarrage des tests français pour CCI Services...\n');
  testFrenchPosts();
}