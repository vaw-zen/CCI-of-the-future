/**
 * Test Google Search Console Credentials
 * Verifies that your GSC_CREDENTIALS are properly configured
 */

import { google } from 'googleapis';
import fs from 'fs';

async function testGSCCredentials() {
  console.log('🔍 Testing Google Search Console Credentials...\n');

  // Check credentials - either file or environment variable
  const credentialsPath = './gsc-credentials.json';
  let credentials;

  if (process.env.GSC_CREDENTIALS) {
    // Running in GitHub Actions or with environment variable
    console.log('✅ Using GSC_CREDENTIALS from environment');
    try {
      credentials = JSON.parse(process.env.GSC_CREDENTIALS);
    } catch (error) {
      console.error('❌ Error: GSC_CREDENTIALS environment variable contains invalid JSON');
      return;
    }
  } else if (fs.existsSync(credentialsPath)) {
    // Running locally with credentials file
    console.log('✅ Using gsc-credentials.json file');
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    try {
      credentials = JSON.parse(credentialsContent);
    } catch (error) {
      console.error('❌ Error: gsc-credentials.json contains invalid JSON');
      return;
    }
  } else {
    console.error('❌ Error: No GSC credentials found');
    console.log('📋 For local development:');
    console.log('1. Follow the GSC setup guide in SEO_AUTOMATION_GUIDE.md');
    console.log('2. Download the JSON credentials file from Google Cloud Console');
    console.log('3. Rename it to gsc-credentials.json and place in project root');
    console.log('📋 For GitHub Actions:');
    console.log('1. Add GSC_CREDENTIALS secret in GitHub repository settings');
    console.log('2. Copy the entire JSON content as the secret value\n');
    return;
  }

  try {
    console.log('✅ Credentials loaded and validated JSON');

    // Check required fields
    const requiredFields = [
      'type',
      'project_id', 
      'private_key_id',
      'private_key',
      'client_email',
      'client_id',
      'auth_uri',
      'token_uri'
    ];

    const missingFields = requiredFields.filter(field => !credentials[field]);
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields.join(', '));
      console.log('📋 Please re-download the complete JSON file from Google Cloud Console\n');
      return;
    }

    console.log('✅ All required fields present');
    console.log(`📧 Service account: ${credentials.client_email}`);
    console.log(`📁 Project ID: ${credentials.project_id}`);

    // Test authentication
    console.log('\n🔐 Testing authentication...');
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const authClient = await auth.getClient();
    console.log('✅ Authentication successful');

    // Test Search Console API access
    console.log('\n🔍 Testing Search Console API access...');
    
    const searchconsole = google.searchconsole({ version: 'v1', auth });
    
    const response = await searchconsole.sites.list();
    
    if (response.data.siteEntry && response.data.siteEntry.length > 0) {
      console.log('✅ Search Console API access successful');
      console.log('📊 Accessible sites:');
      
      response.data.siteEntry.forEach((site, index) => {
        console.log(`  ${index + 1}. ${site.siteUrl} (${site.permissionLevel})`);
      });

      // Check if your site is in the list
      const yourSite = 'https://cciservices.online/';
      const hasSite = response.data.siteEntry.some(site => site.siteUrl === yourSite);
      
      if (hasSite) {
        console.log(`✅ Your site (${yourSite}) is accessible`);
      } else {
        console.log(`⚠️  Your site (${yourSite}) is not found in accessible sites`);
        console.log('📋 To fix this:');
        console.log('1. Go to Google Search Console');
        console.log('2. Select your property');
        console.log('3. Settings → Users and permissions');
        console.log(`4. Add user: ${credentials.client_email}`);
        console.log('5. Set permission to "Owner" or "Full"');
      }
    } else {
      console.log('⚠️  No sites found');
      console.log('📋 The service account may not have been added to any Search Console properties');
    }

    console.log('\n🎉 GSC Credentials test completed!');

  } catch (error) {
    console.error('❌ Error testing credentials:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n📋 This error usually means:');
      console.log('- Service account email not added to Search Console');
      console.log('- Service account lacks proper permissions');
      console.log('- System clock is significantly out of sync');
    } else if (error.message.includes('invalid_client')) {
      console.log('\n📋 This error usually means:');
      console.log('- Credentials JSON is malformed or incomplete');
      console.log('- Wrong project or service account');
      console.log('- API not enabled in Google Cloud Console');
    }

    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Re-download credentials from Google Cloud Console');
    console.log('2. Verify service account has Search Console access');
    console.log('3. Check that Search Console API is enabled');
    console.log('4. Ensure your site is verified in Search Console');
  }
}

// Run the test
testGSCCredentials().catch(console.error);