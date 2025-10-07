// Test rapide pour récupérer les comptes Instagram disponibles
const IG_ACCESS_TOKEN = 'EAAbZBmVLcT2MBPofQROHZBNF4rhkqqkUoxdRXaTCJqZCl9nWjZBg2YEMZAyywqkitz9no0NCTGwh9yqh5HL1m43dLiwlgtkeEhZAzdCZBVhYQh0q5ZBBndI8boZAF8Dlv6vFMC6qJujVGmqsHF4Hx42ZANWsZCWZBK7qz0ZB02WJFZBoT1ZAgDiNZBPQL1C4NF3lqxdNGj5OV96WOotiPlo4CI3D43etE3ZAN3JONOFOOj1scsRiZAMVZAEKIVe6pmLyBUZD';
const FB_PAGE_ID = '102106381365856';

async function testInstagramAccounts() {
  try {
    console.log('🔍 Test des comptes Instagram disponibles...\n');
    
    const accountsUrl = `https://graph.facebook.com/v23.0/${FB_PAGE_ID}/instagram_accounts?access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`;
    console.log('🔗 URL:', accountsUrl.replace(IG_ACCESS_TOKEN, '[TOKEN_MASKED]'));
    
    const response = await fetch(accountsUrl);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Réponse instagram_accounts:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        const igAccount = data.data[0];
        console.log(`\n🎯 Compte Instagram trouvé: ${igAccount.id}`);
        console.log(`📝 Nom: ${igAccount.name || 'N/A'}`);
        console.log(`🔗 Username: ${igAccount.username || 'N/A'}`);
        
        // Test des médias avec ce bon ID
        console.log('\n📸 Test récupération des médias...');
        const mediaUrl = `https://graph.facebook.com/v23.0/${igAccount.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=5&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`;
        
        const mediaResponse = await fetch(mediaUrl);
        const mediaData = await mediaResponse.json();
        
        if (mediaResponse.ok) {
          console.log('✅ Médias récupérés avec succès!');
          console.log(`📊 Nombre de posts: ${mediaData.data?.length || 0}`);
          if (mediaData.data && mediaData.data.length > 0) {
            console.log('\n📋 Premiers posts:');
            mediaData.data.slice(0, 3).forEach((post, i) => {
              console.log(`   ${i+1}. ${post.media_type} - ${post.caption ? post.caption.substring(0, 50) + '...' : 'Pas de légende'}`);
            });
          }
          
          console.log(`\n🎉 SUCCESS! Le bon IG_USER_ID est: ${igAccount.id}`);
          console.log(`📝 Actuel dans .env: 100061408605546`);
          console.log(`🔄 Nouveau à utiliser: ${igAccount.id}`);
          
        } else {
          console.log('❌ Erreur médias:', mediaData);
        }
      } else {
        console.log('⚠️ Aucun compte Instagram trouvé dans la réponse');
      }
    } else {
      console.log('❌ Erreur instagram_accounts:', data);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testInstagramAccounts();