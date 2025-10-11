// Test pour compter les vidéos dans le sitemap
async function testVideoSitemap() {
  try {
    console.log('🧪 Test du sitemap vidéo...\n');
    
    // Test du sitemap vidéo
    const response = await fetch('http://localhost:3000/video-sitemap.xml');
    const xmlText = await response.text();
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      // Compter les balises <video:video>
      const videoMatches = xmlText.match(/<video:video>/g);
      const videoCount = videoMatches ? videoMatches.length : 0;
      
      console.log(`🎥 Nombre de vidéos dans le sitemap: ${videoCount}`);
      
      // Extraire quelques exemples d'URLs
      const playerLocMatches = xmlText.match(/<video:player_loc>(.*?)<\/video:player_loc>/g);
      if (playerLocMatches) {
        console.log('\n📋 Exemples d\'URLs vidéos:');
        playerLocMatches.slice(0, 3).forEach((match, index) => {
          const url = match.replace(/<\/?video:player_loc>/g, '');
          console.log(`   ${index + 1}. ${url}`);
        });
      }
      
      // Vérifier la structure
      console.log('\n🔍 Structure du sitemap:');
      console.log(`   - Taille: ${(xmlText.length / 1024).toFixed(1)} KB`);
      console.log(`   - Contient <urlset>: ${xmlText.includes('<urlset>') ? '✅' : '❌'}`);
      console.log(`   - Contient namespace video: ${xmlText.includes('xmlns:video') ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ Erreur lors de la récupération du sitemap');
    }
    
  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
  }
}

// Test de l'API Facebook pour voir combien de reels disponibles
async function testFacebookReels() {
  try {
    console.log('\n🔗 Test API Facebook reels...');
    
    const response = await fetch('http://localhost:3000/api/social/facebook?reels_limit=50');
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok && data.reels) {
      console.log(`🎬 Nombre de reels récupérés: ${data.reels.length}`);
      
      if (data.reels.length > 0) {
        console.log('\n📋 Premiers reels:');
        data.reels.slice(0, 3).forEach((reel, index) => {
          console.log(`   ${index + 1}. ID: ${reel.id}`);
          console.log(`      URL: ${reel.permalink_url}`);
          console.log(`      Titre: ${reel.message?.slice(0, 50) || 'Sans titre'}...`);
        });
      }
    } else {
      console.log('❌ Erreur API Facebook:', data.error || 'Unknown');
    }
    
  } catch (error) {
    console.error('❌ Erreur test Facebook:', error.message);
  }
}

// Lancer les tests
console.log('⏳ Tests dans 3 secondes...');
setTimeout(async () => {
  await testVideoSitemap();
  await testFacebookReels();
}, 3000);