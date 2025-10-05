/**
 * Facebook App Permission Helper
 * 
 * This script helps you understand what needs to be done to get posting permissions
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

async function checkAppStatus() {
  console.log('🔧 Facebook App Permission Helper\n');

  const envVars = loadEnvFile();
  const FB_PAGE_ACCESS_TOKEN = envVars.FB_PAGE_ACCESS_TOKEN;

  if (!FB_PAGE_ACCESS_TOKEN) {
    console.error('❌ No FB_PAGE_ACCESS_TOKEN found in .env.local');
    return;
  }

  try {
    // Get app info from the token
    const tokenInfoUrl = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
    const response = await fetch(tokenInfoUrl);
    const data = await response.json();

    if (data.data) {
      const appId = data.data.app_id;
      const scopes = data.data.scopes || [];
      
      console.log('📱 Your Facebook App Info:');
      console.log(`   App ID: ${appId}`);
      console.log(`   App URL: https://developers.facebook.com/apps/${appId}/`);
      console.log('');

      console.log('🔐 Current Permissions:');
      scopes.forEach(scope => {
        const status = scope === 'pages_manage_posts' ? '🎯' : '✅';
        console.log(`   ${status} ${scope}`);
      });

      if (!scopes.includes('pages_manage_posts')) {
        console.log('   ❌ pages_manage_posts (MISSING - Required for posting)');
      }
      console.log('');

      console.log('📋 Next Steps:');
      console.log('');
      
      console.log('1️⃣ **Check App Review Status:**');
      console.log(`   🔗 Visit: https://developers.facebook.com/apps/${appId}/app-review/permissions/`);
      console.log('   • Look for "pages_manage_posts" permission');
      console.log('   • Check if it\'s approved, pending, or available to request');
      console.log('');

      console.log('2️⃣ **Request Permission (if available):**');
      console.log(`   🔗 Visit: https://developers.facebook.com/apps/${appId}/app-review/permissions/`);
      console.log('   • Click "Request" next to pages_manage_posts');
      console.log('   • Provide use case: "Automated social media posting for business page"');
      console.log('   • Submit for review');
      console.log('');

      console.log('3️⃣ **Alternative: Generate New Token:**');
      console.log(`   🔗 Visit: https://developers.facebook.com/tools/explorer/`);
      console.log('   • Select your app');
      console.log('   • Select "Page Access Token"');
      console.log('   • Add permissions: pages_manage_posts, pages_read_engagement');
      console.log('   • Generate token and update .env.local');
      console.log('');

      console.log('4️⃣ **Development Mode Workaround:**');
      console.log('   • If your app is in Development Mode, you might be able to');
      console.log('     add pages_manage_posts without full App Review');
      console.log('   • This works for pages you admin during development');
      console.log('');

      console.log('📞 **Need Help?**');
      console.log('   🔗 Facebook Developer Support: https://developers.facebook.com/support/');
      console.log('   📖 App Review Guide: https://developers.facebook.com/docs/app-review/');
      console.log('   📖 Pages API Guide: https://developers.facebook.com/docs/pages-api/');

    } else {
      console.error('❌ Could not get app info from token');
    }

  } catch (error) {
    console.error('❌ Error checking app status:', error.message);
  }
}

// Run the check
checkAppStatus();