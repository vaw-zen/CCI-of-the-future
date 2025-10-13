/**
 * GitHub Actions Integration Test
 * Verifies that the SEO automation works in CI/CD environment
 */

// Load environment variables for local testing
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

const fs = require('fs').promises;
const path = require('path');

class GitHubActionsValidator {
  constructor() {
    this.requiredSecrets = [
      'GEMINI_API_KEY',
      'GSC_CREDENTIALS', 
      'SITE_URL'
    ];
    this.requiredFiles = [
      'scripts/seo-content-automation.cjs',
      'scripts/run-seo-automation.js',
      'seo-keywords.csv',
      'src/app/conseils/data/articles.js'
    ];
  }

  /**
   * Check environment setup
   */
  async validateEnvironment() {
    console.log('🔍 Validating GitHub Actions Environment\n');

    // Check required secrets
    console.log('📊 Checking required secrets:');
    const missingSecrets = [];

    for (const secret of this.requiredSecrets) {
      if (process.env[secret]) {
        console.log(`  ✅ ${secret}: Available`);
      } else {
        console.log(`  ❌ ${secret}: Missing`);
        missingSecrets.push(secret);
      }
    }

    if (missingSecrets.length > 0) {
      console.log(`\n⚠️  Missing GitHub secrets: ${missingSecrets.join(', ')}`);
      console.log('\n📋 To fix:');
      console.log('1. Go to GitHub repository → Settings → Secrets and variables → Actions');
      console.log('2. Add the missing secrets with values from your .env.local file');
      return false;
    }

    return true;
  }

  /**
   * Check required files exist
   */
  async validateFiles() {
    console.log('\n📁 Checking required files:');
    const missingFiles = [];

    for (const file of this.requiredFiles) {
      try {
        await fs.access(file);
        console.log(`  ✅ ${file}: Exists`);
      } catch (error) {
        console.log(`  ❌ ${file}: Missing`);
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      console.log(`\n⚠️  Missing required files: ${missingFiles.join(', ')}`);
      return false;
    }

    return true;
  }

  /**
   * Validate workflow file
   */
  async validateWorkflow() {
    console.log('\n⚙️  Validating GitHub Actions workflow:');

    try {
      const workflowPath = '.github/workflows/seo-automation.yml';
      const workflow = await fs.readFile(workflowPath, 'utf8');

      // Check key components
      const checks = [
        { name: 'Schedule trigger', pattern: /cron:.*\d+\s+\d+\s+\*\s+\*\s+\d+/ },
        { name: 'Manual trigger', pattern: /workflow_dispatch:/ },
        { name: 'Node.js setup', pattern: /uses:\s*actions\/setup-node/ },
        { name: 'Dependencies install', pattern: /npm install.*googleapis.*@google\/generative-ai/ },
        { name: 'Content automation', pattern: /seo-content-automation\.cjs/ },
        { name: 'Git commit', pattern: /git commit.*articles\.js/ }
      ];

      let allValid = true;
      for (const check of checks) {
        if (check.pattern.test(workflow)) {
          console.log(`  ✅ ${check.name}: Configured`);
        } else {
          console.log(`  ❌ ${check.name}: Missing or misconfigured`);
          allValid = false;
        }
      }

      return allValid;

    } catch (error) {
      console.error('  ❌ Workflow file not found or invalid');
      return false;
    }
  }

  /**
   * Test automation in CI-like environment
   */
  async testCIEnvironment() {
    console.log('\n🧪 Testing CI-like environment:');

    try {
      // Simulate GitHub Actions environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      process.env.GITHUB_WORKSPACE = process.cwd();

      // Test content automation
      const { SEOContentAutomation } = require('./seo-content-automation.cjs');
      const automation = new SEOContentAutomation();

      console.log('  🎯 Testing content automation initialization...');
      
      // Check if we can load keywords
      const keywords = await automation.loadKeywordsFromCSV();
      console.log(`  ✅ Loaded ${keywords.length} keywords from CSV`);

      if (keywords.length === 0) {
        console.log('  ⚠️  No keywords found for content generation');
        console.log('     This is normal if all keywords are already optimized');
      }

      // Test article generation (without actually generating to avoid API costs)
      if (process.env.GEMINI_API_KEY) {
        console.log('  ✅ Gemini API key available for content generation');
      }

      console.log('  ✅ CI environment test passed');
      return true;

    } catch (error) {
      console.error(`  ❌ CI test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate GitHub Actions status report
   */
  async generateStatusReport() {
    console.log('\n📊 GitHub Actions Integration Status Report\n');

    const envValid = await this.validateEnvironment();
    const filesValid = await this.validateFiles();
    const workflowValid = await this.validateWorkflow();
    const ciValid = await this.testCIEnvironment();

    const allValid = envValid && filesValid && workflowValid && ciValid;

    console.log('\n' + '='.repeat(50));
    console.log('📋 SUMMARY:');
    console.log(`Environment Setup: ${envValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Required Files: ${filesValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Workflow Config: ${workflowValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`CI Simulation: ${ciValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(50));

    if (allValid) {
      console.log('\n🎉 GitHub Actions integration is READY!');
      console.log('\n📋 Next steps:');
      console.log('1. Push changes to trigger the workflow');
      console.log('2. Go to GitHub Actions tab to monitor execution');
      console.log('3. Check generated content in pull requests');
      console.log('4. Review automated SEO reports');
    } else {
      console.log('\n⚠️  GitHub Actions integration needs attention');
      console.log('Fix the issues above before deploying');
    }

    return allValid;
  }

  /**
   * Create example GitHub secrets configuration
   */
  async createSecretsTemplate() {
    console.log('\n📝 Creating GitHub secrets template...');

    const template = `
# GitHub Repository Secrets Configuration
# Go to: Settings → Secrets and variables → Actions → Repository secrets

## Required Secrets:

### GEMINI_API_KEY
# Your Gemini AI API key from Google AI Studio
# Value: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'YOUR_GEMINI_API_KEY'}

### GSC_CREDENTIALS  
# Google Search Console API credentials (JSON format)
# Value: Copy the entire content of your gsc-credentials.json file

### SITE_URL
# Your website URL for GSC tracking
# Value: https://cciservices.online

## Optional Secrets:

### SLACK_WEBHOOK_URL
# Slack webhook for notifications (optional)
# Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL

## GitHub Actions Workflow:
# The workflow runs automatically:
# - Every Monday at 9 AM UTC
# - Manual trigger for immediate content generation
# - Creates pull requests for review
# - Commits approved content automatically
`;

    await fs.writeFile('github-secrets-template.md', template, 'utf8');
    console.log('✅ Created github-secrets-template.md');
  }
}

async function main() {
  console.log('🚀 GitHub Actions Integration Validator\n');

  const validator = new GitHubActionsValidator();
  
  try {
    const isValid = await validator.generateStatusReport();
    await validator.createSecretsTemplate();

    console.log('\n📄 Documentation created:');
    console.log('  - github-secrets-template.md (setup guide)');

    process.exit(isValid ? 0 : 1);

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { GitHubActionsValidator };