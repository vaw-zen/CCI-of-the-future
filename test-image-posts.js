/**
 * Quick test for the enhanced auto-post API with images
 * Run this to test the new image functionality
 */

const API_BASE_URL = 'http://localhost:3000';

async function quickImageTest() {
  console.log('🖼️ Testing Enhanced Auto-Post API with Images\n');

  try {
    // Test health check first
    console.log('🔍 Health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/auto-post-daily`);
    const healthData = await healthResponse.json();
    console.log('✅ API Status:', healthData.message);
    console.log('📋 Features:', healthData.features);
    console.log('');

    // Test with image
    console.log('🖼️ Testing post with image...');
    const imagePostResponse = await fetch(`${API_BASE_URL}/api/auto-post-daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postType: 'tip',
        includeHashtags: true,
        includeImage: true
      })
    });
    
    const imagePostData = await imagePostResponse.json();
    
    if (imagePostData.success) {
      console.log('✅ SUCCESS! Post with image created:');
      console.log('📝 Content:', imagePostData.generated_content);
      console.log('🖼️ Image:', imagePostData.selected_image);
      console.log('📱 Facebook ID:', imagePostData.facebook_response?.id);
      console.log('🎯 Posted with image:', imagePostData.posted_with_image);
    } else {
      console.log('❌ Failed:', imagePostData.error);
      console.log('📋 Details:', imagePostData);
    }
    console.log('');

    // Test without image
    console.log('📝 Testing text-only post...');
    const textPostResponse = await fetch(`${API_BASE_URL}/api/auto-post-daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postType: 'motivation',
        includeHashtags: true,
        includeImage: false
      })
    });
    
    const textPostData = await textPostResponse.json();
    
    if (textPostData.success) {
      console.log('✅ SUCCESS! Text-only post created:');
      console.log('📝 Content:', textPostData.generated_content);
      console.log('🖼️ Image:', textPostData.selected_image || 'None');
      console.log('📱 Facebook ID:', textPostData.facebook_response?.id);
      console.log('🎯 Posted with image:', textPostData.posted_with_image);
    } else {
      console.log('❌ Failed:', textPostData.error);
      console.log('📋 Details:', textPostData);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// For manual testing of different image types
async function testDifferentImageTypes() {
  console.log('🎨 Testing Different Image Types\n');
  
  const postTypes = ['tip', 'motivation', 'service', 'seasonal'];
  
  for (const type of postTypes) {
    console.log(`🧪 Testing ${type} post type...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auto-post-daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType: type,
          includeHashtags: true,
          includeImage: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${type.toUpperCase()} post generated:`);
        console.log(`   📝 Content: ${data.generated_content.substring(0, 80)}...`);
        console.log(`   🖼️ Image: ${data.selected_image}`);
        console.log(`   📱 Facebook: ${data.facebook_response?.id || 'Posted'}`);
      } else {
        console.log(`❌ ${type.toUpperCase()} failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ ${type.toUpperCase()} error: ${error.message}`);
    }
    
    console.log('');
    
    // Wait 2 seconds between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { quickImageTest, testDifferentImageTypes };
}

// Browser usage
if (typeof window !== 'undefined') {
  window.quickImageTest = quickImageTest;
  window.testDifferentImageTypes = testDifferentImageTypes;
}

// Run the quick test by default
if (require.main === module) {
  quickImageTest();
}