/**
 * Quick test of specific CCI services posts
 */

const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/auto-post-daily';

async function testSpecificServices() {
  console.log('🎯 Test rapide des services spécifiques CCI\n');
  
  const specificTests = [
    {
      name: 'NETTOYAGE SALON',
      prompt: 'Créez un post sur le nettoyage professionnel de salons par CCI Services: enlèvement taches, dépoussiérage, produits non-toxiques. Français, 150 caractères max, emojis.'
    },
    {
      name: 'FIN DE CHANTIER', 
      prompt: 'Post sur le nettoyage fin de chantier CCI Services: sols, murs, vitres, sanitaires après travaux. Espace propre et sain rapidement. Français, 150 caractères, emojis.'
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
      
      if (data.success) {
        console.log(`✅ ${test.name} - SUCCÈS!`);
        console.log(`   📝 Contenu: "${data.generated_content.substring(0, 200)}..."`);
        console.log(`   📏 Longueur: ${data.generated_content?.length || 0} caractères`);
        console.log(`   📱 Facebook ID: ${data.facebook_response?.id}`);
        console.log(`   🖼️ Image: ${data.selected_image ? 'Incluse' : 'Non incluse'}`);
        
        // Check quality
        const content = data.generated_content || '';
        const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
        const mentionsCCI = content.toLowerCase().includes('cci');
        const inFrench = /[àáâäèéêëìíîïòóôöùúûü]/.test(content);
        
        console.log(`   📋 Qualité: Emojis ${hasEmojis ? '✅' : '❌'} | CCI ${mentionsCCI ? '✅' : '❌'} | Français ${inFrench ? '✅' : '❌'}`);
      } else {
        console.log(`❌ ${test.name}: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Erreur - ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testSpecificServices();