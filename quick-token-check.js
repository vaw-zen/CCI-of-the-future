/**
 * Quick Facebook Token Permission Check
 * This will check your current token and tell you exactly what to do next
 */

const fs = require('fs');

// Read current token from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/FB_PAGE_ACCESS_TOKEN=(.+)/);
const currentToken = tokenMatch ? tokenMatch[1].trim() : null;

if (!currentToken) {
  console.log('❌ No token found in .env.local');
  process.exit(1);
}

async function quickPermissionCheck() {
  console.log('🔍 Quick Permission Check for Your Current Token\n');

  try {
    // Check what permissions this token has
    const response = await fetch(`https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(currentToken)}&access_token=${encodeURIComponent(currentToken)}`);
    const data = await response.json();

    if (data.data && data.data.scopes) {
      console.log('📋 Your Current Token Permissions:');
      data.data.scopes.forEach(scope => {
        const icon = scope === 'pages_manage_posts' ? '🎯✅' : '✅';
        console.log(`   ${icon} ${scope}`);
      });

      if (data.data.scopes.includes('pages_manage_posts')) {
        console.log('\n🎉 GREAT NEWS! Your token already has pages_manage_posts!');
        console.log('📝 The API should work. Try testing again:');
        console.log('   node test-facebook-post.js');
      } else {
        console.log('\n❌ Missing: pages_manage_posts');
        console.log('\n🔧 SOLUTION: Generate a new token with this permission:');
        console.log('1. Visit: https://developers.facebook.com/tools/explorer/');
        console.log('2. Select your app: 1968784333885283');
        console.log('3. Choose "Page Access Token"');
        console.log('4. Add permissions: pages_manage_posts, pages_read_engagement');
        console.log('5. Generate token and replace in .env.local');
        console.log('\n📋 Or request permission through App Review:');
        console.log('   https://developers.facebook.com/apps/1968784333885283/app-review/permissions/');
      }
    } else {
      console.log('❌ Could not read token permissions');
      console.log('🔧 Try generating a new token with the required permissions');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickPermissionCheck();