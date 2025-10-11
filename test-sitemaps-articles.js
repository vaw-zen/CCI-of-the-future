const http = require('http');

async function testSitemaps() {
  console.log('🗺️  Test des sitemaps avec articles...\n');
  
  const tests = [
    {
      name: 'Sitemap Principal',
      url: 'http://localhost:3000/sitemap.xml',
      expectedArticles: 7
    },
    {
      name: 'Sitemap Articles Dédié',
      url: 'http://localhost:3000/articles-sitemap.xml', 
      expectedArticles: 7
    },
    {
      name: 'Sitemap Index',
      url: 'http://localhost:3000/sitemap-index.xml',
      expectedSitemaps: 3
    }
  ];

  for (const test of tests) {
    console.log(`🔍 Test: ${test.name}`);
    
    try {
      const content = await fetchContent(test.url);
      
      if (test.expectedArticles) {
        // Compter les articles dans le sitemap
        const articleMatches = content.match(/\/conseils\/[^<]+/g) || [];
        const articleCount = articleMatches.length;
        
        console.log(`   📊 Articles trouvés: ${articleCount}/${test.expectedArticles}`);
        
        if (articleCount >= test.expectedArticles) {
          console.log(`   ✅ Succès - Tous les articles sont présents`);
        } else {
          console.log(`   ⚠️  Attention - Articles manquants`);
        }
        
        // Afficher quelques exemples d'URLs
        console.log(`   📄 Exemples d'URLs:`);
        articleMatches.slice(0, 3).forEach((url, index) => {
          console.log(`      ${index + 1}. ${url}`);
        });
      }
      
      if (test.expectedSitemaps) {
        // Compter les sitemaps dans l'index
        const sitemapMatches = content.match(/<loc>[^<]+\.xml<\/loc>/g) || [];
        const sitemapCount = sitemapMatches.length;
        
        console.log(`   📊 Sitemaps trouvés: ${sitemapCount}/${test.expectedSitemaps}`);
        
        if (sitemapCount >= test.expectedSitemaps) {
          console.log(`   ✅ Succès - Tous les sitemaps sont référencés`);
        } else {
          console.log(`   ⚠️  Attention - Sitemaps manquants`);
        }
        
        // Afficher les sitemaps trouvés
        console.log(`   📄 Sitemaps référencés:`);
        sitemapMatches.forEach((sitemap, index) => {
          const url = sitemap.replace(/<\/?loc>/g, '');
          console.log(`      ${index + 1}. ${url}`);
        });
      }
      
      // Vérifier la structure XML
      const isValidXML = content.includes('<?xml') && content.includes('</urlset>') || content.includes('</sitemapindex>');
      console.log(`   🔧 Structure XML: ${isValidXML ? '✅ Valide' : '❌ Invalide'}`);
      
      // Taille du sitemap
      console.log(`   📏 Taille: ${Math.round(content.length / 1024)} KB`);
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    console.log(''); // Ligne vide pour la lisibilité
  }
  
  console.log('💡 Actions recommandées :');
  console.log('   1. Soumettez https://cciservices.online/sitemap-index.xml dans GSC');
  console.log('   2. Vérifiez que tous les sitemaps sont traités sans erreur');
  console.log('   3. Surveillez l\'indexation des articles dans 24-48h');
}

function fetchContent(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Lancer le test
testSitemaps();