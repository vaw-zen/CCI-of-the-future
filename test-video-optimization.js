const http = require('http');
const fs = require('fs');

// Test de validation du sitemap vidéo
function testVideoSitemap() {
  console.log('🎬 Test d\'optimisation du sitemap vidéo...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/video-sitemap.xml',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        // Tests de validation
        const tests = [
          {
            name: 'Structure XML valide',
            test: () => data.includes('<?xml version="1.0" encoding="UTF-8"?>'),
            required: true
          },
          {
            name: 'Namespace vidéo présent',
            test: () => data.includes('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'),
            required: true
          },
          {
            name: 'URL de contenu vidéo',
            test: () => data.includes('<video:content_loc>'),
            required: true
          },
          {
            name: 'URL de lecture vidéo',
            test: () => data.includes('<video:player_loc>'),
            required: true
          },
          {
            name: 'Miniatures présentes',
            test: () => data.includes('<video:thumbnail_loc>'),
            required: true
          },
          {
            name: 'Titres des vidéos',
            test: () => data.includes('<video:title>'),
            required: true
          },
          {
            name: 'Descriptions des vidéos',
            test: () => data.includes('<video:description>'),
            required: true
          },
          {
            name: 'Durée des vidéos',
            test: () => data.includes('<video:duration>'),
            required: true
          },
          {
            name: 'Date de publication',
            test: () => data.includes('<video:publication_date>'),
            required: true
          },
          {
            name: 'Tags SEO',
            test: () => data.includes('<video:tag>'),
            required: false
          },
          {
            name: 'Informations uploader',
            test: () => data.includes('<video:uploader'),
            required: false
          },
          {
            name: 'URLs Facebook complètes',
            test: () => data.includes('https://www.facebook.com/reel/'),
            required: true
          }
        ];

        console.log('🔍 Résultats des tests :\n');
        
        let passedTests = 0;
        let requiredPassed = 0;
        let requiredTotal = 0;
        
        tests.forEach((test, index) => {
          const passed = test.test();
          const status = passed ? '✅' : '❌';
          const requirement = test.required ? '[REQUIS]' : '[OPTIONNEL]';
          
          console.log(`${index + 1}. ${status} ${test.name} ${requirement}`);
          
          if (passed) passedTests++;
          if (test.required) {
            requiredTotal++;
            if (passed) requiredPassed++;
          }
        });

        // Compter les vidéos
        const videoMatches = data.match(/<video:video>/g);
        const videoCount = videoMatches ? videoMatches.length : 0;
        
        console.log(`\n📊 Statistiques :`);
        console.log(`   • Tests réussis: ${passedTests}/${tests.length}`);
        console.log(`   • Tests requis réussis: ${requiredPassed}/${requiredTotal}`);
        console.log(`   • Nombre de vidéos: ${videoCount}`);
        console.log(`   • Taille du sitemap: ${(data.length / 1024).toFixed(2)} KB`);
        
        // Vérifications spécifiques
        const urlErrors = (data.match(/URL incorrecte/g) || []).length;
        const fbReelUrls = (data.match(/https:\/\/www\.facebook\.com\/reel\//g) || []).length;
        
        console.log(`\n🎯 Optimisations SEO :`);
        console.log(`   • URLs Facebook complètes: ${fbReelUrls}/${videoCount}`);
        console.log(`   • Erreurs d'URL: ${urlErrors}`);
        
        if (requiredPassed === requiredTotal && videoCount > 0) {
          console.log(`\n🎉 SUCCÈS ! Le sitemap est optimisé pour Google Search Console`);
          console.log(`   Google peut maintenant découvrir vos ${videoCount} vidéos`);
          
          // Conseils pour la soumission
          console.log(`\n💡 Prochaines étapes :`);
          console.log(`   1. Soumettez le sitemap dans Google Search Console`);
          console.log(`   2. URL à soumettre: https://cciservices.online/video-sitemap.xml`);
          console.log(`   3. Vérifiez l'indexation dans 24-48h`);
          console.log(`   4. Surveillez les "Vidéos découvertes" dans GSC`);
        } else {
          console.log(`\n⚠️  Des améliorations sont nécessaires`);
        }
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'analyse:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('💡 Assurez-vous que le serveur Next.js fonctionne (npm run dev)');
  });

  req.end();
}

// Lancer le test
testVideoSitemap();