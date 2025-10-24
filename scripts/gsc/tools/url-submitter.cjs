/**
 * Google Search Console URL Submission Script
 * Submits new articles to Google for faster indexing
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class URLIndexingSubmitter {
  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://cciservices.online';
    this.credentialsPath = './credentials/gsc-credentials.json';
    
    // Initialize Google Search Console API
    this.auth = null;
    this.indexing = null;
  }

  /**
   * Initialize authentication with Google Search Console
   */
  async initialize() {
    try {
      let credentials;
      
      // Try to get credentials from environment variable first
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

  /**
   * Submit a URL to Google Search Console for indexing
   */
  async submitURL(url) {
    try {
      const request = {
        url: url,
        type: 'URL_UPDATED'
      };

      const response = await this.indexing.urlNotifications.publish({
        requestBody: request
      });

      console.log(`✅ Submitted: ${url}`);
      return { success: true, url, response: response.data };
    } catch (error) {
      console.error(`❌ Error submitting ${url}:`, error.message);
      return { success: false, url, error: error.message };
    }
  }

  /**
   * Submit multiple URLs with delay between requests
   */
  async submitMultipleURLs(urls, delay = 1000) {
    const results = [];
    
    console.log(`🚀 Submitting ${urls.length} URLs to Google Search Console...`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`📤 Processing ${i + 1}/${urls.length}: ${url}`);
      
      const result = await this.submitURL(url);
      results.push(result);
      
      // Add delay between requests to avoid rate limiting
      if (i < urls.length - 1) {
        await this.delay(delay);
      }
    }
    
    return results;
  }

  /**
   * Get the latest articles that need indexing
   */
  getLatestArticleURLs(maxArticles = 5) {
    try {
      // Import the articles data
      const articlesPath = path.join(__dirname, '../..', 'src', 'app', 'conseils', 'data', 'articles.js');
      
      // Since we can't directly import ES modules, we'll read and parse the file
      const articlesContent = fs.readFileSync(articlesPath, 'utf8');
      
      // Extract article data using regex (simple approach)
      const articleMatches = articlesContent.match(/{\s*id:\s*(\d+),\s*slug:\s*['"`]([^'"`]+)['"`]/g);
      
      if (!articleMatches) {
        console.log('No articles found in the database');
        return [];
      }
      
      // Parse the matches to get the latest articles
      const articles = articleMatches.map(match => {
        const idMatch = match.match(/id:\s*(\d+)/);
        const slugMatch = match.match(/slug:\s*['"`]([^'"`]+)['"`]/);
        
        if (idMatch && slugMatch) {
          return {
            id: parseInt(idMatch[1]),
            slug: slugMatch[1],
            url: `${this.siteUrl}/conseils/${slugMatch[1]}`
          };
        }
        return null;
      }).filter(Boolean);
      
      // Sort by ID (newest first) and take the latest articles
      const latestArticles = articles
        .sort((a, b) => b.id - a.id)
        .slice(0, maxArticles);
      
      console.log(`📋 Found ${latestArticles.length} latest articles to submit:`);
      latestArticles.forEach(article => {
        console.log(`   - ID ${article.id}: ${article.slug}`);
      });
      
      return latestArticles.map(article => article.url);
    } catch (error) {
      console.error('Error reading articles:', error.message);
      return [];
    }
  }

  /**
   * Submit the latest articles for indexing
   */
  async submitLatestArticles(maxArticles = 5) {
    try {
      await this.initialize();
      
      const urls = this.getLatestArticleURLs(maxArticles);
      
      if (urls.length === 0) {
        console.log('No URLs to submit');
        return [];
      }
      
      // Also submit the main conseils page
      urls.unshift(`${this.siteUrl}/conseils`);
      
      const results = await this.submitMultipleURLs(urls);
      
      // Generate summary
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log('\n📊 Indexing Submission Summary:');
      console.log(`✅ Successful: ${successful.length}`);
      console.log(`❌ Failed: ${failed.length}`);
      
      if (failed.length > 0) {
        console.log('\nFailed URLs:');
        failed.forEach(f => console.log(`   - ${f.url}: ${f.error}`));
      }
      
      return results;
    } catch (error) {
      console.error('Error in submission process:', error.message);
      throw error;
    }
  }

  /**
   * Submit sitemap to Google Search Console
   */
  async submitSitemap() {
    try {
      const sitemapUrls = [
        `${this.siteUrl}/sitemap.xml`,
        `${this.siteUrl}/articles-sitemap.xml`,
        `${this.siteUrl}/sitemap-index.xml`
      ];

      console.log('📤 Submitting sitemaps...');
      const results = await this.submitMultipleURLs(sitemapUrls, 2000);
      
      return results;
    } catch (error) {
      console.error('Error submitting sitemaps:', error.message);
      throw error;
    }
  }

  /**
   * Helper function to add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Usage
async function main() {
  const submitter = new URLIndexingSubmitter();
  
  try {
    console.log('🔍 Google Search Console URL Indexing Tool\n');
    
    const action = process.argv[2] || 'articles';
    
    switch (action) {
      case 'articles':
        const maxArticles = parseInt(process.argv[3]) || 5;
        await submitter.submitLatestArticles(maxArticles);
        break;
        
      case 'sitemaps':
        await submitter.submitSitemap();
        break;
        
      case 'all':
        await submitter.submitLatestArticles(5);
        await submitter.submitSitemap();
        break;
        
      default:
        console.log('Usage:');
        console.log('  node scripts/submit-urls-indexing.js articles [count]  - Submit latest articles');
        console.log('  node scripts/submit-urls-indexing.js sitemaps          - Submit sitemaps');
        console.log('  node scripts/submit-urls-indexing.js all              - Submit both');
    }
    
    console.log('\n✅ Indexing submission completed!');
    
  } catch (error) {
    console.error('\n❌ Indexing submission failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = URLIndexingSubmitter;