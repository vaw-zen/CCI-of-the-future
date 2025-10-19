// Test enhanced Facebook API field mapping
console.log('🚀 Testing Enhanced Facebook API Field Mapping\n');

async function testEnhancedAPI() {
  try {
    console.log('📡 Testing updated Facebook API with enhanced field mapping...');
    
    // Fetch data with the new enhanced API
    const response = await fetch('https://cciservices.online/api/social/facebook?reels_limit=6');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const reels = data.reels || [];
    
    console.log(`✅ Successfully fetched ${reels.length} reels with enhanced mapping\n`);
    
    console.log('🎬 Enhanced API Response Analysis:');
    console.log('==================================');
    
    reels.forEach((reel, index) => {
      console.log(`\n📺 Reel ${index + 1} (ID: ${reel.id}):`);
      
      // Analyze thumbnail sources
      const thumbnailStatus = reel.thumbnail ? 
        (reel.thumbnail.startsWith('http') ? '✅ HTTP URL' : 
         reel.thumbnail.startsWith('data:') ? '🔧 Placeholder' : '❓ Unknown') : 
        '❌ Missing';
      
      console.log(`   🖼️  Thumbnail: ${thumbnailStatus}`);
      if (reel.thumbnail && reel.thumbnail.startsWith('http')) {
        console.log(`       Source: Facebook CDN`);
      } else if (reel.thumbnail && reel.thumbnail.startsWith('data:')) {
        console.log(`       Source: Generated placeholder`);
      }
      
      // Analyze video URL sources  
      const videoUrlStatus = reel.video_url ? 
        (reel.video_url.startsWith('https://video') ? '✅ Direct video' : 
         reel.video_url.includes('facebook.com/watch') ? '🔗 Watch link' : '❓ Other') : 
        '❌ Missing';
      
      console.log(`   🎥 Video URL: ${videoUrlStatus}`);
      
      // Analyze message sources
      const messageStatus = reel.message ? '✅ Has content' : '⚠️  Using fallback';
      console.log(`   📝 Message: ${messageStatus}`);
      
      // Analyze date
      const dateStatus = reel.created_time ? '✅ Has date' : '⚠️  Using fallback';
      console.log(`   📅 Date: ${dateStatus}`);
      
      // Overall validation status
      const hasValidThumbnail = Boolean(reel.thumbnail && 
        (reel.thumbnail.startsWith('http') || reel.thumbnail.startsWith('data:')));
      const hasValidVideoUrl = Boolean(reel.video_url);
      const hasValidDate = Boolean(reel.created_time);
      
      const validationScore = [hasValidThumbnail, hasValidVideoUrl, hasValidDate]
        .filter(Boolean).length;
      
      console.log(`   🎯 Validation: ${validationScore}/3 fields valid`);
      if (validationScore === 3) {
        console.log(`       ✅ Should pass Google Search Console validation`);
      } else {
        console.log(`       ⚠️  May need fallbacks for Google Search Console`);
      }
    });
    
    console.log('\n📊 Overall Statistics:');
    console.log('======================');
    
    const stats = {
      totalReels: reels.length,
      withHttpThumbnails: reels.filter(r => r.thumbnail && r.thumbnail.startsWith('http')).length,
      withPlaceholderThumbnails: reels.filter(r => r.thumbnail && r.thumbnail.startsWith('data:')).length,
      withMissingThumbnails: reels.filter(r => !r.thumbnail).length,
      withRealVideoUrls: reels.filter(r => r.video_url && r.video_url.startsWith('https://video')).length,
      withMessages: reels.filter(r => r.message && r.message.trim()).length
    };
    
    console.log(`📈 Thumbnail Sources:`);
    console.log(`   • Facebook CDN: ${stats.withHttpThumbnails}/${stats.totalReels}`);
    console.log(`   • Generated placeholders: ${stats.withPlaceholderThumbnails}/${stats.totalReels}`);
    console.log(`   • Missing: ${stats.withMissingThumbnails}/${stats.totalReels}`);
    
    console.log(`\n📈 Content Quality:`);
    console.log(`   • Real video URLs: ${stats.withRealVideoUrls}/${stats.totalReels}`);
    console.log(`   • With messages: ${stats.withMessages}/${stats.totalReels}`);
    
    console.log('\n🎯 Google Search Console Expectations:');
    console.log('======================================');
    
    const fullyValidReels = reels.filter(reel => {
      return reel.thumbnail && 
             (reel.thumbnail.startsWith('http') || reel.thumbnail.startsWith('data:')) &&
             reel.video_url && 
             reel.created_time;
    });
    
    console.log(`✅ Fully valid VideoObjects: ${fullyValidReels.length}/${stats.totalReels}`);
    console.log(`📊 Expected GSC validation: ${fullyValidReels.length === stats.totalReels ? 'ALL PASS' : 'SOME MAY FAIL'}`);
    
    if (fullyValidReels.length === stats.totalReels) {
      console.log('\n🎉 SUCCESS: All reels should pass Google Search Console validation!');
      console.log('✅ All required fields have valid values or fallbacks');
      console.log('✅ No "missing thumbnailUrl" errors expected');
    } else {
      console.log(`\n⚠️  ATTENTION: ${stats.totalReels - fullyValidReels.length} reels may still have validation issues`);
      console.log('🔧 Check individual reel data for missing fields');
    }
    
  } catch (error) {
    console.error('❌ Error testing enhanced API:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('• Check if API changes were deployed');
    console.log('• Verify Facebook API permissions');
    console.log('• Test API endpoint in browser');
  }
}

// Run the test
testEnhancedAPI();