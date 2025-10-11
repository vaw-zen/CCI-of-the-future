const https = require('https');
const http = require('http');

// Test d'indexation des articles de conseils
function testArticlesIndexation() {
  console.log('🔍 Test d\'indexation des articles de conseils...\n');
  
  // Liste des articles à tester (basée sur vos données)
  const articles = [
    'guide-nettoyage-tapis-tunis-2025',
    'nettoyage-salons-voiture-tapisseries-tunis',
    'traitement-poncage-polissage-marbre-tunisie',
    'nettoyage-post-chantier-tunisie-fin-travaux',
    'prix-nettoyage-tapis-tunis-tarifs-2025',
    'comment-nettoyer-canape-cuir-tunis-guide-complet',
    'detartrage-marbre-cuisine-tunisie-guide-expert'
  ];

  console.log(`📊 Test de ${articles.length} articles...\n`);

  const testPromises = articles.map((slug, index) => {
    return new Promise((resolve) => {
      const url = `http://localhost:3000/conseils/${slug}`;
      
      const req = http.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const tests = {
            url: url,
            slug: slug,
            statusCode: res.statusCode,
            hasTitle: data.includes('<title>') && data.includes('</title>'),
            hasH1: data.includes('<h1'),
            hasCanonical: data.includes('rel="canonical"'),
            hasMetaDescription: data.includes('name="description"'),
            hasStructuredData: data.includes('application/ld+json'),
            hasOpenGraph: data.includes('property="og:'),
            sizeKB: Math.round(data.length / 1024)
          };
          
          resolve(tests);
        });
      });
      
      req.on('error', (error) => {
        resolve({
          url: url,
          slug: slug,
          error: error.message,
          statusCode: 'ERROR'
        });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          url: url,
          slug: slug,
          error: 'Timeout',
          statusCode: 'TIMEOUT'
        });
      });
    });
  });

  Promise.all(testPromises).then((results) => {
    console.log('📈 Résultats des tests d\'indexation :\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    results.forEach((result, index) => {
      const status = result.statusCode === 200 ? '✅' : '❌';
      const number = (index + 1).toString().padStart(2, '0');
      
      console.log(`${number}. ${status} ${result.slug}`);
      
      if (result.statusCode === 200) {
        successCount++;
        console.log(`    📄 Taille: ${result.sizeKB} KB`);
        console.log(`    🏷️  Title: ${result.hasTitle ? '✅' : '❌'}`);
        console.log(`    📝 H1: ${result.hasH1 ? '✅' : '❌'}`);
        console.log(`    🔗 Canonical: ${result.hasCanonical ? '✅' : '❌'}`);
        console.log(`    📋 Meta Description: ${result.hasMetaDescription ? '✅' : '❌'}`);
        console.log(`    📊 Structured Data: ${result.hasStructuredData ? '✅' : '❌'}`);
        console.log(`    📱 Open Graph: ${result.hasOpenGraph ? '✅' : '❌'}`);
      } else {
        errorCount++;
        console.log(`    ❌ Erreur: ${result.error || 'HTTP ' + result.statusCode}`);
      }
      console.log('');
    });

    console.log('📊 Résumé :');
    console.log(`   • Articles testés: ${results.length}`);
    console.log(`   • Succès: ${successCount}`);
    console.log(`   • Erreurs: ${errorCount}`);
    console.log(`   • Taux de réussite: ${Math.round((successCount / results.length) * 100)}%`);
    
    if (successCount === results.length) {
      console.log('\n🎉 EXCELLENT ! Tous vos articles sont indexables');
      console.log('💡 Actions recommandées :');
      console.log('   1. Soumettez les articles dans Google Search Console');
      console.log('   2. Vérifiez l\'indexation dans 24-48h');
      console.log('   3. Surveillez le trafic organique vers les articles');
    } else {
      console.log('\n⚠️  Certains articles nécessitent des corrections');
    }
  }).catch(error => {
    console.error('❌ Erreur lors du test:', error);
  });
}

// Lancer le test
testArticlesIndexation();