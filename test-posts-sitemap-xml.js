// Test de validation du sitemap posts XML
async function testPostsSitemapXML() {
  try {
    console.log('🔗 Test validation XML du sitemap posts...');
    
    const response = await fetch('http://localhost:3000/posts-sitemap.xml');
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200) {
      const xmlContent = await response.text();
      
      // Tests basiques de validation XML
      console.log('\n🔍 Validation XML:');
      
      // 1. Vérifier que le XML commence et finit correctement
      const startsCorrectly = xmlContent.startsWith('<?xml version="1.0" encoding="UTF-8"?>');
      const endsCorrectly = xmlContent.endsWith('</urlset>');
      
      console.log(`   ✅ Début XML correct: ${startsCorrectly}`);
      console.log(`   ✅ Fin XML correcte: ${endsCorrectly}`);
      
      // 2. Vérifier qu'il n'y a pas de caractères non échappés
      const hasUnescapedChars = xmlContent.includes('&') && !xmlContent.includes('&amp;');
      console.log(`   ✅ Caractères échappés: ${!hasUnescapedChars}`);
      
      // 3. Compter les URLs
      const urlMatches = xmlContent.match(/<url>/g);
      const urlCount = urlMatches ? urlMatches.length : 0;
      console.log(`   📊 Nombre d'URLs: ${urlCount}`);
      
      // 4. Vérifier la structure des URLs
      const hasValidStructure = xmlContent.includes('<loc>') && 
                               xmlContent.includes('<lastmod>') && 
                               xmlContent.includes('<priority>');
      console.log(`   ✅ Structure URL valide: ${hasValidStructure}`);
      
      // 5. Vérifier qu'il n'y a pas d'erreurs d'indentation flagrantes
      const lines = xmlContent.split('\n');
      const hasIndentationIssues = lines.some((line, index) => {
        if (line.trim().startsWith('<url>') && index > 10) {
          return !line.startsWith('  <url>') && !line.startsWith('<url>');
        }
        return false;
      });
      console.log(`   ✅ Indentation correcte: ${!hasIndentationIssues}`);
      
      // Afficher les premiers éléments
      console.log('\n📋 Premiers éléments:');
      const firstUrls = xmlContent.match(/<loc>([^<]+)<\/loc>/g);
      if (firstUrls) {
        firstUrls.slice(0, 5).forEach((url, index) => {
          const cleanUrl = url.replace(/<\/?loc>/g, '');
          console.log(`   ${index + 1}. ${cleanUrl}`);
        });
      }
      
      if (startsCorrectly && endsCorrectly && !hasUnescapedChars && hasValidStructure && !hasIndentationIssues) {
        console.log('\n✅ Sitemap posts XML VALIDE !');
      } else {
        console.log('\n❌ Problèmes détectés dans le XML');
      }
      
    } else {
      console.log(`❌ Erreur HTTP: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testPostsSitemapXML();