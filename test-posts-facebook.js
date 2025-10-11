// Test de récupération des posts Facebook
async function testPosts() {
  try {
    console.log('🔗 Test API Facebook posts...');
    
    const response = await fetch('http://localhost:3000/api/social/facebook?posts_limit=20');
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Nombre de posts récupérés: ${data.posts?.length || 0}`);
    
    if (data.posts && data.posts.length > 0) {
      console.log('\n📋 Premiers posts:');
      data.posts.slice(0, 5).forEach((post, index) => {
        console.log(`   ${index + 1}. ID: ${post.id}`);
        console.log(`      Message: ${(post.message || 'Sans message').slice(0, 80)}...`);
        console.log(`      URL: ${post.permalink_url}`);
        console.log(`      Date: ${post.created_time}`);
        console.log(`      Images: ${post.attachments?.length || 0}`);
        console.log('      ---');
      });
      
      // Test si les posts sont bien formatés pour l'indexation
      console.log('\n🔍 Analyse de l\'indexabilité:');
      const postsWithMessage = data.posts.filter(p => p.message);
      const postsWithImages = data.posts.filter(p => p.attachments?.length > 0);
      const postsWithValidUrl = data.posts.filter(p => p.permalink_url);
      
      console.log(`   Posts avec message: ${postsWithMessage.length}/${data.posts.length}`);
      console.log(`   Posts avec images: ${postsWithImages.length}/${data.posts.length}`);
      console.log(`   Posts avec URL valide: ${postsWithValidUrl.length}/${data.posts.length}`);
      
    } else {
      console.log('❌ Aucun post récupéré');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testPosts();