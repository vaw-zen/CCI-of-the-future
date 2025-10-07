// Test final de la route Instagram
async function testInstagramRoute() {
  try {
    console.log('🧪 Test de la route Instagram locale...\n');
    
    // Test 1: Vérifier que le serveur Next.js fonctionne
    console.log('🔍 Vérification du serveur...');
    try {
      const healthResponse = await fetch('http://localhost:3001');
      console.log('✅ Serveur accessible');
    } catch (error) {
      console.log('❌ Serveur non accessible. Démarrez avec: npm run dev');
      return;
    }
    
    // Test 2: Tester la route Instagram
    console.log('📱 Test de la route Instagram...');
    const response = await fetch('http://localhost:3001/api/social/instagram');
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Réponse:', JSON.stringify(data, null, 2));
    
    if (response.status === 400 && data.error === 'Missing IG_USER_ID or IG_ACCESS_TOKEN') {
      console.log('\n💡 Variables d\'environnement manquantes');
    } else if (response.status === 401 && data.error === 'invalid_token') {
      console.log('\n💡 Token Instagram invalide ou expiré');
      console.log('   → Générer un nouveau token sur Graph API Explorer');
    } else if (response.status === 404 && data.error === 'instagram_not_connected') {
      console.log('\n💡 Compte Instagram non connecté');
      console.log('   → Suivre les instructions dans data.instructions');
    } else if (response.status === 200) {
      console.log('\n✅ SUCCESS! Route Instagram fonctionnelle');
      if (data.posts && data.posts.length > 0) {
        console.log(`📸 ${data.posts.length} posts Instagram récupérés`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
  }
}

// Attendre un peu puis tester
console.log('⏳ Test dans 3 secondes...');
setTimeout(testInstagramRoute, 3000);