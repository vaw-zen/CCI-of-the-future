const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Script to submit individual reel URLs to Google Search Console
 * This addresses the issue where GSC only sees 1 video instead of all reels
 */
class ReelURLSubmitter {
  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://cciservices.online';
    this.credentialsPath = './gsc-credentials.json';
    this.auth = null;
    this.indexing = null;
  }

  async initialize() {
    try {
      let credentials;
      
      if (process.env.GSC_CREDENTIALS) {
        credentials = JSON.parse(process.env.GSC_CREDENTIALS);
      } else if (fs.existsSync(this.credentialsPath)) {
        credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
      } else {
        throw new Error('No Google Search Console credentials found');
      }

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/indexing']
      });

      this.indexing = google.indexing({ version: 'v3', auth: this.auth });
      
      console.log('✅ Google Search Console API initialized');
    } catch (error) {
      console.error('❌ Error initializing Google Search Console API:', error.message);
      throw error;
    }
  }

  async getReelsData() {
    try {
      const response = await fetch(`${this.siteUrl}/api/social/facebook?reels_limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reels data');
      }

      const data = await response.json();
      return data.reels || [];
    } catch (error) {
      console.error('Error fetching reels data:', error);
      return [];
    }
  }

  async submitURL(url) {
    try {
      const response = await this.indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED',
        },
      });

      console.log(`✅ Submitted: ${url}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to submit ${url}:`, error.message);
      return false;
    }
  }

  async submitAllReels() {
    console.log('🎬 Submitting Individual Reel URLs to Google Search Console\n');
    
    try {
      await this.initialize();
      
      const reels = await this.getReelsData();
      
      if (reels.length === 0) {
        console.log('❌ No reels found to submit');
        return;
      }

      console.log(`📋 Found ${reels.length} reels to submit as individual URLs:\n`);
      
      const urls = reels.map(reel => `${this.siteUrl}/reels/${reel.id}`);
      
      // Add the main blogs page as well
      urls.unshift(`${this.siteUrl}/blogs`);
      
      console.log('🚀 Submitting URLs:');
      urls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
      
      console.log('\n📤 Starting submission process...\n');
      
      let successful = 0;
      let failed = 0;
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`📤 Processing ${i + 1}/${urls.length}: ${url}`);
        
        const success = await this.submitURL(url);
        
        if (success) {
          successful++;
        } else {
          failed++;
        }
        
        // Add small delay between requests to avoid rate limits
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log('\n📊 Submission Summary:');
      console.log(`✅ Successful: ${successful}`);
      console.log(`❌ Failed: ${failed}`);
      console.log(`📺 Individual reel pages: ${reels.length}`);
      console.log(`🏠 Main blogs page: 1`);
      
      if (successful > 0) {
        console.log('\n🎉 Individual reel URLs submitted successfully!');
        console.log('📈 Expected results:');
        console.log('   - Google will now see each reel as a separate page');
        console.log('   - Video indexing should increase from 1 to ' + (reels.length + 1) + '+ pages');
        console.log('   - Better video search visibility for each reel');
        console.log('   - Individual reel pages will appear in search results');
      }
      
    } catch (error) {
      console.error('❌ Error submitting reel URLs:', error.message);
    }
  }
}

// Main execution
async function main() {
  const submitter = new ReelURLSubmitter();
  await submitter.submitAllReels();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ReelURLSubmitter;