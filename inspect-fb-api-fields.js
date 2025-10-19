// Script to inspect exact Facebook API field names for thumbnails
console.log('🔍 Inspecting Exact Facebook API Response Structure\n');

async function inspectFacebookAPI() {
  try {
    console.log('📡 Fetching raw Facebook API response...');
    
    // Fetch the API response 
    const response = await fetch('https://cciservices.online/api/social/facebook?reels_limit=6');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const reels = data.reels || [];
    
    console.log(`✅ Successfully fetched ${reels.length} reels\n`);
    
    console.log('🎬 Raw API Response Analysis:');
    console.log('=============================');
    
    // Analyze the first few reels to understand the exact structure
    reels.slice(0, 3).forEach((reel, index) => {
      console.log(`\n📺 Reel ${index + 1} (ID: ${reel.id}):`);
      console.log('Raw object keys:', Object.keys(reel));
      
      console.log('\n🎯 Thumbnail-related fields:');
      console.log(`   thumbnail: ${reel.thumbnail ? 'EXISTS' : 'NULL'}`);
      console.log(`   picture: ${reel.picture ? 'EXISTS' : 'NULL'}`);
      console.log(`   thumbnails: ${reel.thumbnails ? 'EXISTS' : 'NULL'}`);
      
      if (reel.thumbnail) {
        console.log(`   thumbnail type: ${typeof reel.thumbnail}`);
        console.log(`   thumbnail value: ${reel.thumbnail.slice(0, 80)}...`);
        console.log(`   starts with http: ${reel.thumbnail.startsWith('http')}`);
        console.log(`   starts with data: ${reel.thumbnail.startsWith('data:')}`);
      }
      
      console.log('\n🔗 URL-related fields:');
      console.log(`   video_url: ${reel.video_url ? 'EXISTS' : 'NULL'}`);
      console.log(`   permalink_url: ${reel.permalink_url ? 'EXISTS' : 'NULL'}`);
      console.log(`   source: ${reel.source ? 'EXISTS' : 'NULL'}`);
      console.log(`   perma_link: ${reel.perma_link ? 'EXISTS' : 'NULL'}`);
      
      console.log('\n📝 Content fields:');
      console.log(`   message: ${reel.message ? 'EXISTS' : 'NULL'}`);
      console.log(`   description: ${reel.description ? 'EXISTS' : 'NULL'}`);
      console.log(`   created_time: ${reel.created_time ? 'EXISTS' : 'NULL'}`);
    });
    
    console.log('\n🔍 DETAILED THUMBNAIL ANALYSIS:');
    console.log('===============================');
    
    // Check which reels might be missing thumbnails
    const thumbnailAnalysis = reels.map(reel => {
      const hasValidThumbnail = reel.thumbnail && 
        (reel.thumbnail.startsWith('http') || reel.thumbnail.startsWith('data:'));
      
      return {
        id: reel.id,
        hasValidThumbnail,
        thumbnailValue: reel.thumbnail,
        isPlaceholder: reel.thumbnail && reel.thumbnail.startsWith('data:')
      };
    });
    
    const missingThumbnails = thumbnailAnalysis.filter(item => !item.hasValidThumbnail);
    const placeholderThumbnails = thumbnailAnalysis.filter(item => item.isPlaceholder);
    
    console.log(`\n📊 Thumbnail Statistics:`);
    console.log(`   Total reels: ${reels.length}`);
    console.log(`   Valid thumbnails: ${thumbnailAnalysis.filter(item => item.hasValidThumbnail).length}`);
    console.log(`   Missing/invalid thumbnails: ${missingThumbnails.length}`);
    console.log(`   Using placeholder thumbnails: ${placeholderThumbnails.length}`);
    
    if (missingThumbnails.length > 0) {
      console.log(`\n⚠️  Reels with missing/invalid thumbnails:`);
      missingThumbnails.forEach(item => {
        console.log(`   • ${item.id}: "${item.thumbnailValue}"`);
      });
    }
    
    if (placeholderThumbnails.length > 0) {
      console.log(`\n🔧 Reels using placeholder thumbnails:`);
      placeholderThumbnails.forEach(item => {
        console.log(`   • ${item.id}: Using fallback`);
      });
    }
    
    // Check if the API normalization is working correctly
    console.log('\n💡 API NORMALIZATION ANALYSIS:');
    console.log('==============================');
    
    // Compare with what Facebook API should be returning
    console.log('Expected Facebook fields for video_reels:');
    console.log('• id ✅');
    console.log('• created_time ✅');
    console.log('• permalink_url ✅');
    console.log('• source (video URL) ✅');
    console.log('• description ✅');
    console.log('• thumbnails.data[].uri ❓ (needs verification)');
    console.log('• picture ❓ (might not be available for reels)');
    
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('===================');
    if (missingThumbnails.length > 0) {
      console.log('❌ Some reels still have missing thumbnails');
      console.log('🔍 Check Facebook API field mapping');
      console.log('🔧 Verify thumbnail extraction logic');
      console.log('📊 Add more fallback options');
    } else if (placeholderThumbnails.length > 0) {
      console.log('✅ All reels have thumbnails (some are placeholders)');
      console.log('📊 This is expected and should work fine');
    } else {
      console.log('🎉 All reels have real Facebook thumbnails!');
    }
    
  } catch (error) {
    console.error('❌ Error inspecting Facebook API:', error.message);
    
    console.log('\n🔧 Debugging steps:');
    console.log('1. Check if Facebook API is accessible');
    console.log('2. Verify field names in Facebook Graph API documentation');
    console.log('3. Test the API endpoint directly in browser');
    console.log('4. Check server logs for detailed error information');
  }
}

// Run the inspection
inspectFacebookAPI();