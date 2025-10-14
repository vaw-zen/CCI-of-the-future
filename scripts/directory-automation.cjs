/**
 * Directory Form Automation Script
 * Automated submission to 200+ business directories
 */

const puppeteer = require('puppeteer');

class DirectoryFormAutomation {
  constructor() {
    this.businessData = {
      name: 'CCI Services - Chaabane\'s Cleaning Intelligence',
      website: 'https://cciservices.online/',
      email: 'cci.services.tn@gmail.com', 
      phone: '+216 98 557 766',
      address: '06 Rue Galant de nuit, El Aouina, 2045 Tunis, Tunisia',
      description: 'Leader du nettoyage commercial à Tunis depuis 10+ ans. Services professionnels pour bureaux, hôtels, moquettes.'
    };

    this.targetDirectories = [
      'https://www.hotfrog.com/business/registration/step1',
      'https://www.cylex-international.com/company/add.html', 
      'https://www.europages.com/registration/',
      'https://business.foursquare.com/venues/new',
      // + 196 more directories
    ];
  }

  async automateSubmission(directoryUrl) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto(directoryUrl);
      
      // Auto-fill common form fields
      await this.fillBusinessName(page);
      await this.fillWebsite(page); 
      await this.fillEmail(page);
      await this.fillPhone(page);
      await this.fillAddress(page);
      await this.fillDescription(page);
      await this.selectCategory(page);
      
      // Submit form
      await this.submitForm(page);
      
      console.log(`✅ Successfully submitted to: ${directoryUrl}`);
      return { success: true, url: directoryUrl };
      
    } catch (error) {
      console.log(`❌ Failed submission to: ${directoryUrl} - ${error.message}`);
      return { success: false, url: directoryUrl, error: error.message };
    } finally {
      await browser.close();
    }
  }

  async fillBusinessName(page) {
    const selectors = [
      'input[name="name"]',
      'input[name="business_name"]', 
      'input[name="company_name"]',
      'input[id="name"]',
      'input[id="business-name"]'
    ];
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.type(selector, this.businessData.name);
        return;
      } catch (e) {
        continue;
      }
    }
  }

  async fillWebsite(page) {
    const selectors = [
      'input[name="website"]',
      'input[name="url"]',
      'input[name="web"]',
      'input[id="website"]'
    ];
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.type(selector, this.businessData.website);
        return;
      } catch (e) {
        continue;
      }
    }
  }

  // Similar methods for email, phone, address, etc.

  async batchSubmission(batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < this.targetDirectories.length; i += batchSize) {
      const batch = this.targetDirectories.slice(i, i + batchSize);
      
      console.log(`🚀 Processing batch ${Math.floor(i/batchSize) + 1} (${batch.length} directories)`);
      
      const batchResults = await Promise.all(
        batch.map(url => this.automateSubmission(url))
      );
      
      results.push(...batchResults);
      
      // Wait between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30s delay
    }
    
    return results;
  }
}

// Usage
async function runAutomation() {
  const automation = new DirectoryFormAutomation();
  const results = await automation.batchSubmission(5); // Process 5 at a time
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`
📊 AUTOMATION RESULTS:`);
  console.log(`✅ Successful submissions: ${successful}`);
  console.log(`❌ Failed submissions: ${failed}`); 
  console.log(`📈 Success rate: ${(successful/results.length*100).toFixed(1)}%`);
  
  // Record successful backlinks
  for (const result of results.filter(r => r.success)) {
    // Add to backlink tracker
    console.log(`Recording backlink: ${result.url}`);
  }
}

module.exports = { DirectoryFormAutomation };
