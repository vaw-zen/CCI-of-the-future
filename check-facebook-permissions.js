/**
 * Facebook API Permissions Checker
 * 
 * This script helps debug Facebook API issues by checking:
 * - Token validity
 * - Available permissions
 * - Page access
 * - API version compatibility
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.trim().split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Could not load .env.local file:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();
const FB_API_VERSION = envVars.FB_API_VERSION || 'v23.0';
const FB_PAGE_ID = envVars.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = envVars.FB_PAGE_ACCESS_TOKEN;

async function checkFacebookPermissions() {
  console.log('🔍 Facebook API Permissions Checker\n');

  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
    console.error('❌ Missing environment variables:');
    console.error('   FB_PAGE_ID:', !!FB_PAGE_ID);
    console.error('   FB_PAGE_ACCESS_TOKEN:', !!FB_PAGE_ACCESS_TOKEN);
    return;
  }

  try {
    // 1. Check page access and token validity
    console.log('1️⃣ Checking page access and token validity...');
    const pageUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}?fields=id,name,access_token&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.error('❌ Page access error:', pageData.error.message);
      console.error('   Error code:', pageData.error.code);
      return;
    }
    
    console.log('✅ Page access successful:');
    console.log(`   ID: ${pageData.id}`);
    console.log(`   Name: ${pageData.name}`);
    console.log(`   Has page token: ${!!pageData.access_token}`);
    console.log('');

    // 2. Check token type and details
    console.log('2️⃣ Checking access token details...');
    const tokenInfoUrl = `https://graph.facebook.com/${FB_API_VERSION}/debug_token?input_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
    const tokenResponse = await fetch(tokenInfoUrl);
    const tokenData = await tokenResponse.json();
    
    if (tokenData.data) {
      console.log('✅ Token info:');
      console.log(`   Type: ${tokenData.data.type}`);
      console.log(`   App ID: ${tokenData.data.app_id}`);
      console.log(`   Valid: ${tokenData.data.is_valid}`);
      console.log(`   Expires: ${tokenData.data.expires_at ? new Date(tokenData.data.expires_at * 1000).toISOString() : 'Never'}`);
      
      if (tokenData.data.scopes) {
        console.log('   Scopes/Permissions:');
        tokenData.data.scopes.forEach(scope => {
          console.log(`     ✅ ${scope}`);
        });
      }
    } else {
      console.log('⚠️  Could not get token details');
    }
    console.log('');

    // 3. Test feed endpoint access (for text posts)
    console.log('3️⃣ Testing feed endpoint access (for text posts)...');
    const feedTestUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/feed?access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}&limit=1`;
    const feedResponse = await fetch(feedTestUrl);
    const feedData = await feedResponse.json();
    
    if (feedData.error) {
      console.error('❌ Feed access error:', feedData.error.message);
      console.error('   Error code:', feedData.error.code);
    } else {
      console.log('✅ Feed endpoint accessible');
    }
    console.log('');

    // 4. Test photos endpoint access (for image posts)
    console.log('4️⃣ Testing photos endpoint access (for image posts)...');
    const photosTestUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/photos?access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}&limit=1`;
    const photosResponse = await fetch(photosTestUrl);
    const photosData = await photosResponse.json();
    
    if (photosData.error) {
      console.error('❌ Photos access error:', photosData.error.message);
      console.error('   Error code:', photosData.error.code);
    } else {
      console.log('✅ Photos endpoint accessible');
    }
    console.log('');

    // 5. Recommendations based on findings
    console.log('💡 Recommendations:');
    
    if (feedData.error?.code === 200) {
      console.log('   ⚠️  Missing pages_manage_posts permission for feed posting');
      console.log('   📋 Action: Add pages_manage_posts permission to your Facebook app');
      console.log('   🔗 URL: https://developers.facebook.com/apps/');
    }
    
    if (photosData.error?.code === 200) {
      console.log('   ⚠️  Missing pages_manage_posts permission for photo posting');
      console.log('   📋 Action: Add pages_manage_posts permission to your Facebook app');
    }
    
    if (tokenData.data?.type !== 'PAGE') {
      console.log('   ⚠️  Token type is not PAGE - you need a Page Access Token');
      console.log('   📋 Action: Generate a Page Access Token instead of User Access Token');
    }
    
    if (tokenData.data && !tokenData.data.is_valid) {
      console.log('   ⚠️  Access token is invalid or expired');
      console.log('   📋 Action: Generate a new access token');
    }
    
    if (!feedData.error && !photosData.error) {
      console.log('   ✅ All endpoints accessible - your setup should work!');
    }
    
    console.log('   ✅ For production: Submit app for Facebook App Review');
    console.log('   🔗 Guide: https://developers.facebook.com/docs/app-review/');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkFacebookPermissions };
}

// Run if called directly
if (require.main === module) {
  checkFacebookPermissions();
}

// Browser version
if (typeof window !== 'undefined') {
  window.checkFacebookPermissions = checkFacebookPermissions;
}