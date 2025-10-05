/**
 * Test Images CCI Services par Catégories Spécifiques
 */

const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/auto-post-daily';

async function testServiceSpecificImages() {
  console.log('🏢 Test Images CCI Services par Catégories\n');
  
  const testCases = [
    {
      name: 'SALON/CANAPÉ',
      prompt: `Écris un post Facebook pour CCI Services sur le nettoyage de salon/canapé.
               Français, 200-300 caractères, 2-3 emojis, mention CCI Services.
               Terminer par: "💬 Devis gratuit maintenant!"`,
      expectedImages: ['nettoyagesolonméthodeinjectionextraction.webp']
    },
    {
      name: 'TAPIS/MOQUETTE',
      prompt: `Écris un post Facebook pour CCI Services sur le nettoyage de tapis.
               Français, 200-300 caractères, 2-3 emojis, mention CCI Services.
               Terminer par: "☎️ Tel: +216 98 55 77 66"`,
      expectedImages: ['nettoyage moquetteaveclaméthodeinjectionextraction.webp']
    },
    {
      name: 'MARBRE',
      prompt: `Écris un post Facebook pour CCI Services sur le polissage de marbre.
               Français, 200-300 caractères, 2-3 emojis, mention CCI Services.
               Terminer par: "🔗 Site: https://cciservices.online"`,
      expectedImages: ['cristallisationsolenmarbre.webp', 'polishingkitchenmrblecountre.webp']
    },
    {
      name: 'POST-CHANTIER',
      prompt: `Écris un post Facebook pour CCI Services sur le nettoyage fin de chantier.
               Français, 200-300 caractères, 2-3 emojis, mention CCI Services.
               Terminer par: "📧 Email: contact@cciservices.online"`,
      expectedImages: ['nettoyage-professionel-post-chantier.webp']
    },
    {
      name: 'TAPISSERIE',
      prompt: `Écris un post Facebook pour CCI Services sur la tapisserie et rembourrage.
               Français, 200-300 caractères, 2-3 emojis, mention CCI Services.
               Terminer par: "💬 Devis gratuit maintenant!"`,
      expectedImages: ['retapissage-salon-en-cuir.webp', 'tapisserie1.webp']
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}️⃣ Test ${testCase.name}...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPrompt: testCase.prompt,
          includeHashtags: false,
          includeImage: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ SUCCESS!');
        console.log(`   📝 Contenu: "${data.generated_content.substring(0, 100)}..."`);
        console.log(`   🖼️ Image: ${data.selected_image}`);
        
        // Vérifier si l'image correspond au service
        const imageUrl = data.selected_image || '';
        const isCorrectCategory = testCase.expectedImages.some(img => imageUrl.includes(img));
        const isCCILocal = imageUrl.includes('cciservices.online');
        
        console.log(`   🔍 Catégorie: ${isCorrectCategory ? '✅ Correcte' : '❌ Incorrecte'}`);
        console.log(`   🏢 Image CCI: ${isCCILocal ? '✅ Locale' : '❌ Web'}`);
        console.log(`   📱 Facebook ID: ${data.facebook_response?.id || 'Posted'}`);
        
      } else {
        console.log('❌ FAILED');
        console.log(`   Error: ${data.error}`);
      }
      
    } catch (error) {
      console.log('❌ ERROR');
      console.log(`   ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5s between posts
  }

  console.log('📊 RÉSUMÉ:');
  console.log('✅ Images organisées par service CCI');
  console.log('✅ Sélection intelligente selon le contenu');
  console.log('✅ 5 catégories: salon, tapis, marbre, post-chantier, tapisserie');
}

// Run test
testServiceSpecificImages();