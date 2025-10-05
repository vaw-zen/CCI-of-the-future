/**
 * Test simple pour vérifier les call-to-actions CCI Services
 */

const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/auto-post-daily';

async function testCallToActions() {
  console.log('🎯 Test Call-to-Actions CCI Services\n');
  
  console.log('📞 Informations de contact mises à jour:');
  console.log('   ✅ Téléphone: +216 98 55 77 66');
  console.log('   ✅ Site web: https://cciservices.online');
  console.log('   ✅ Email: contact@cciservices.online\n');

  try {
    // Test avec un prompt simple et direct
    console.log('1️⃣ Test avec prompt simple...');
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customPrompt: `Écris UNE SEULE publication Facebook courte pour CCI Services (200-300 caractères).
                       Service: Nettoyage de marbre.
                       Français naturel, 2-3 emojis, mentionner CCI Services.
                       OBLIGATOIRE: Terminer par UNE de ces actions:
                       "🔗 Site: https://cciservices.online"
                       "☎️ Tel: +216 98 55 77 66"
                       "📧 Email: contact@cciservices.online"
                       "💬 Devis gratuit maintenant!"`,
        includeHashtags: false,
        includeImage: false
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      const content = data.generated_content || '';
      console.log('✅ SUCCESS!');
      console.log(`📝 Contenu: "${content}"`);
      console.log(`📏 Longueur: ${content.length} caractères`);
      
      // Vérifier les call-to-actions
      const hasWebsite = content.includes('cciservices.online');
      const hasPhone = content.includes('+216 98 55 77 66');
      const hasEmail = content.includes('contact@cciservices.online');
      const hasDevis = content.includes('Devis gratuit');
      
      console.log('\n🔍 Analyse des call-to-actions:');
      console.log(`   Site web: ${hasWebsite ? '✅' : '❌'}`);
      console.log(`   Téléphone: ${hasPhone ? '✅' : '❌'}`);
      console.log(`   Email: ${hasEmail ? '✅' : '❌'}`);
      console.log(`   Devis: ${hasDevis ? '✅' : '❌'}`);
      
      const hasAnyCTA = hasWebsite || hasPhone || hasEmail || hasDevis;
      console.log(`\n📊 Call-to-action présent: ${hasAnyCTA ? '✅' : '❌'}`);
      
      if (data.facebook_response?.id) {
        console.log(`📱 Posted to Facebook: ${data.facebook_response.id}`);
      }
      
    } else {
      console.log('❌ FAILED');
      console.log(`Error: ${data.error}`);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run test
testCallToActions();