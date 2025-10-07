// Test avec le token existant pour voir ce qu'on peut faire
const CURRENT_TOKEN = 'EAAbZBmVLcT2MBPtbdEZBEGvZCg32NH0V0Jgp1KwbCB1h0UeMJN5j0QXwGCuRCe94XYIIeEHtas5ZBz7OQ4JBSwQga8vEepyKwzpaLTnV0xDJcSyxqPHJAlJaV7ZC2YSvAGTTPRAzS7iStGjWd7DbX1WVrKywpU6lUlHL13b7v0GvbX6LHiIJuXOHlHTWTC9F5Bxc2kPtSKLUHOGhC';

async function testCurrentAccess() {
  try {
    console.log('🔍 Test du token actuel pour contourner le problème d\'accès...\n');
    
    // Test 1: Qui possède ce token ?
    console.log('👤 Test 1: Propriétaire du token...');
    const meResponse = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${CURRENT_TOKEN}`);
    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Token appartient à:', JSON.stringify(meData, null, 2));
    } else {
      console.log('❌ Token invalide ou expiré');
      return;
    }
    
    // Test 2: Pages accessibles
    console.log('\n📄 Test 2: Pages accessibles...');
    const pagesResponse = await fetch(`https://graph.facebook.com/v23.0/me/accounts?fields=name,id,access_token&access_token=${CURRENT_TOKEN}`);
    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      console.log('📋 Pages trouvées:', JSON.stringify(pagesData, null, 2));
      
      // Pour chaque page, chercher Instagram
      if (pagesData.data && pagesData.data.length > 0) {
        for (const page of pagesData.data) {
          console.log(`\n🔍 Test Instagram pour page: ${page.name} (${page.id})`);
          const pageToken = page.access_token || CURRENT_TOKEN;
          
          const igResponse = await fetch(
            `https://graph.facebook.com/v23.0/${page.id}?fields=instagram_business_account{id,username,name}&access_token=${pageToken}`
          );
          
          if (igResponse.ok) {
            const igData = await igResponse.json();
            console.log('📱 Instagram info:', JSON.stringify(igData, null, 2));
            
            if (igData.instagram_business_account) {
              const igId = igData.instagram_business_account.id;
              console.log(`\n🎯 TROUVÉ! Instagram Business Account: ${igId}`);
              
              // Test médias
              const mediaResponse = await fetch(
                `https://graph.facebook.com/v23.0/${igId}/media?fields=id,caption,media_type&limit=2&access_token=${pageToken}`
              );
              
              if (mediaResponse.ok) {
                const mediaData = await mediaResponse.json();
                console.log('🎉 SUCCÈS! Médias accessibles');
                console.log(`📊 Posts: ${mediaData.data?.length || 0}`);
                
                console.log('\n🔧 CONFIGURATION RÉUSSIE:');
                console.log(`IG_USER_ID=${igId}`);
                console.log(`IG_ACCESS_TOKEN=${pageToken}`);
                return { success: true, igId, token: pageToken };
              }
            }
          }
        }
      }
    }
    
    // Test 3: Méthode alternative - chercher directement
    console.log('\n🔄 Test 3: Recherche alternative...');
    console.log('Essai avec l\'ID du Business Manager: 100061408605546');
    
    const directResponse = await fetch(
      `https://graph.facebook.com/v23.0/100061408605546?fields=id,username,name&access_token=${CURRENT_TOKEN}`
    );
    
    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log('✅ Compte trouvé directement:', directData);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

console.log('🚨 PROBLÈME D\'ACCÈS META FOR DEVELOPERS');
console.log('📧 Compte à utiliser: contact@cciservices.online (Fares Chaaben)');
console.log('🔑 Rôle: ADMIN dans Business Manager');
console.log('\n💡 Solutions:');
console.log('1. Se connecter avec contact@cciservices.online');
console.log('2. Vérifier les droits développeur sur l\'app 1968784333885283');
console.log('3. Utiliser le token existant (test ci-dessous)');
console.log('\n🧪 Test avec token actuel...\n');

testCurrentAccess();