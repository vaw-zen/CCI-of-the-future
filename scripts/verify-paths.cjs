/**
 * Path Verification Script for GitHub Actions
 * Tests all file paths used in automation scripts
 */

const fs = require('fs');
const path = require('path');

class PathVerifier {
  constructor() {
    this.isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    this.results = {
      checks: [],
      errors: [],
      warnings: []
    };
  }

  /**
   * Check if a file exists and log the result
   */
  checkFile(filePath, description) {
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    const message = `${status} ${description}: ${filePath}`;
    
    console.log(message);
    this.results.checks.push({ filePath, description, exists, message });
    
    if (!exists) {
      this.results.errors.push(`Missing: ${filePath} (${description})`);
    }
    
    return exists;
  }

  /**
   * Run all path verification checks
   */
  async runChecks() {
    console.log('🔍 Path Verification for GitHub Actions');
    console.log(`Environment: ${this.isGitHubActions ? 'GitHub Actions' : 'Local'}`);
    console.log(`Working Directory: ${process.cwd()}`);
    console.log('');

    // Critical files for SEO automation
    console.log('📊 SEO Automation Files:');
    this.checkFile('seo-keywords.csv', 'Keywords database');
    this.checkFile('src/app/conseils/data/articles.js', 'Articles database');
    this.checkFile('gsc-credentials.json', 'Google Search Console credentials');
    
    console.log('');
    
    // Scripts used in workflows
    console.log('🔧 Automation Scripts:');
    this.checkFile('scripts/simple-seo-analysis.cjs', 'SEO Analysis script');
    this.checkFile('scripts/seo-content-automation.cjs', 'Content Generation script');
    this.checkFile('scripts/performance-tracking.cjs', 'Performance Tracking script');
    this.checkFile('scripts/keyword-update.cjs', 'Keyword Update script');
    this.checkFile('scripts/submit-urls-indexing.cjs', 'URL Indexing script');
    
    console.log('');
    
    // Dependencies and environment
    console.log('📦 Dependencies:');
    this.checkFile('package.json', 'Package configuration');
    this.checkFile('node_modules', 'Node modules directory');
    
    console.log('');
    
    // Environment variables
    console.log('🔐 Environment Variables:');
    const envVars = [
      'GEMINI_API_KEY',
      'GSC_CREDENTIALS', 
      'SITE_URL'
    ];
    
    envVars.forEach(varName => {
      const exists = !!process.env[varName];
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${varName}: ${exists ? 'Set' : 'Missing'}`);
      
      if (!exists) {
        this.results.warnings.push(`Environment variable ${varName} not set`);
      }
    });
    
    console.log('');
    
    // Test path resolution from scripts directory
    console.log('📁 Path Resolution Tests:');
    const scriptPaths = [
      { from: 'scripts/', to: 'seo-keywords.csv', expected: '../seo-keywords.csv' },
      { from: 'scripts/', to: 'src/app/conseils/data/articles.js', expected: '../src/app/conseils/data/articles.js' },
      { from: './', to: 'seo-keywords.csv', expected: './seo-keywords.csv' }
    ];
    
    scriptPaths.forEach(({ from, to, expected }) => {
      const resolvedPath = path.resolve(from, to);
      const relativePath = path.relative(process.cwd(), resolvedPath);
      console.log(`🔗 From ${from} to ${to}: ${relativePath}`);
    });
    
    console.log('');
    
    // Summary
    console.log('📋 Verification Summary:');
    console.log(`✅ Successful checks: ${this.results.checks.filter(c => c.exists).length}`);
    console.log(`❌ Failed checks: ${this.results.errors.length}`);
    console.log(`⚠️ Warnings: ${this.results.warnings.length}`);
    
    if (this.results.errors.length > 0) {
      console.log('');
      console.log('❌ Errors found:');
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log('');
      console.log('⚠️ Warnings:');
      this.results.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log('');
    console.log('🎯 Recommendations:');
    
    if (this.isGitHubActions) {
      console.log('- All scripts should use relative paths from project root');
      console.log('- CSV and articles.js should be accessible as "seo-keywords.csv" and "src/app/conseils/data/articles.js"');
      console.log('- Environment variables should be set in GitHub Secrets');
    } else {
      console.log('- Local development should use "../" prefix for files outside scripts directory');
      console.log('- Test scripts locally before pushing to GitHub');
    }
    
    return this.results;
  }
}

// CLI execution
async function main() {
  const verifier = new PathVerifier();
  const results = await verifier.runChecks();
  
  // Exit with error code if critical files are missing
  if (results.errors.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Path verification failed:', error);
    process.exit(1);
  });
}

module.exports = { PathVerifier };