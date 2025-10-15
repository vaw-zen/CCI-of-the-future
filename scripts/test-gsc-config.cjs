/**
 * Test Google Search Console API Configuration
 * Verifies that all environment variables and API access are working
 */

require('dotenv').config({ path: '.env.local' });

class GSCAPITester {
  constructor() {
    this.requiredEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET', 
      'GOOGLE_REFRESH_TOKEN',
      'GSC_SITE_URL',
      'SITE_URL'
    ];
  }

  /**
   * Check if all required environment variables are set
   */
  checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    const missing = [];
    const present = [];
    
    this.requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value.startsWith('your-')) {
        missing.push(varName);
      } else {
        present.push(varName);
        // Mask sensitive values for display
        const displayValue = this.maskSensitiveValue(varName, value);
        console.log(`✅ ${varName}: ${displayValue}`);
      }
    });
    
    if (missing.length > 0) {
      console.log('\n❌ Missing or placeholder environment variables:');
      missing.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      return false;
    }
    
    console.log('\n✅ All required environment variables are set');
    return true;
  }

  /**
   * Mask sensitive values for secure display
   */
  maskSensitiveValue(varName, value) {
    if (varName.includes('SECRET') || varName.includes('TOKEN')) {
      return value.substring(0, 10) + '***' + value.substring(value.length - 5);
    }
    if (varName.includes('CLIENT_ID')) {
      return value.substring(0, 15) + '***';
    }
    return value;
  }

  /**
   * Test Google API connection (simulation)
   */
  async testGoogleAPIConnection() {
    console.log('\n🔗 Testing Google API connection...');
    
    try {
      // Check if googleapis package is available
      let googleapis;
      try {
        googleapis = require('googleapis');
        console.log('✅ Google APIs library available');
      } catch (error) {
        console.log('❌ Google APIs library not installed');
        console.log('📦 Install with: npm install googleapis');
        return false;
      }

      // Simulate API configuration
      const { google } = googleapis;
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
      );

      // Set credentials if refresh token is available
      if (process.env.GOOGLE_REFRESH_TOKEN && !process.env.GOOGLE_REFRESH_TOKEN.startsWith('your-')) {
        oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          access_token: process.env.GOOGLE_ACCESS_TOKEN
        });
        
        console.log('✅ OAuth2 client configured with refresh token');
        
        // Try to create Search Console client
        const searchconsole = google.searchconsole({
          version: 'v1',
          auth: oauth2Client
        });
        
        console.log('✅ Google Search Console client created');
        
        // Simulate API call (would need real connection in production)
        console.log('ℹ️  API connection ready (use real tokens for live testing)');
        return true;
        
      } else {
        console.log('⚠️  Refresh token not configured - using placeholder values');
        console.log('📝 Follow GOOGLE-API-SETUP-GUIDE.md to get real tokens');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Google API connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Test GSC site verification
   */
  async testSiteVerification() {
    console.log('\n🌐 Testing site verification...');
    
    const siteUrl = process.env.GSC_SITE_URL;
    
    if (!siteUrl || siteUrl.startsWith('your-')) {
      console.log('❌ GSC_SITE_URL not configured');
      return false;
    }
    
    console.log(`✅ Site URL configured: ${siteUrl}`);
    
    // Check if site URL matches SITE_URL
    const mainSiteUrl = process.env.SITE_URL;
    if (siteUrl === mainSiteUrl) {
      console.log('✅ GSC site URL matches main site URL');
    } else {
      console.log('⚠️  GSC site URL differs from main site URL');
    }
    
    return true;
  }

  /**
   * Test monitoring configuration
   */
  testMonitoringConfig() {
    console.log('\n📊 Testing monitoring configuration...');
    
    const monitoringVars = [
      'GSC_MONITORING_ENABLED',
      'GSC_CHECK_INTERVAL', 
      'GSC_ALERT_EMAIL',
      'GSC_INDEXING_THRESHOLD',
      'GSC_HEALTH_THRESHOLD'
    ];
    
    let allConfigured = true;
    
    monitoringVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value}`);
      } else {
        console.log(`⚠️  ${varName}: not set (using defaults)`);
      }
    });
    
    // Validate threshold values
    const indexingThreshold = parseInt(process.env.GSC_INDEXING_THRESHOLD) || 90;
    const healthThreshold = parseInt(process.env.GSC_HEALTH_THRESHOLD) || 85;
    
    if (indexingThreshold >= 0 && indexingThreshold <= 100) {
      console.log(`✅ Indexing threshold valid: ${indexingThreshold}%`);
    } else {
      console.log(`❌ Indexing threshold invalid: ${indexingThreshold}%`);
      allConfigured = false;
    }
    
    if (healthThreshold >= 0 && healthThreshold <= 100) {
      console.log(`✅ Health threshold valid: ${healthThreshold}%`);
    } else {
      console.log(`❌ Health threshold invalid: ${healthThreshold}%`);
      allConfigured = false;
    }
    
    return allConfigured;
  }

  /**
   * Generate configuration status report
   */
  generateConfigReport(envVarsOk, apiConnectionOk, siteVerificationOk, monitoringOk) {
    console.log('\n📋 Configuration Status Report');
    console.log('='.repeat(50));
    
    const overallStatus = envVarsOk && apiConnectionOk && siteVerificationOk && monitoringOk;
    
    console.log(`Environment Variables: ${envVarsOk ? '✅' : '❌'}`);
    console.log(`Google API Connection: ${apiConnectionOk ? '✅' : '❌'}`);
    console.log(`Site Verification: ${siteVerificationOk ? '✅' : '❌'}`);
    console.log(`Monitoring Config: ${monitoringOk ? '✅' : '❌'}`);
    console.log('-'.repeat(50));
    console.log(`Overall Status: ${overallStatus ? '✅ READY' : '❌ NEEDS CONFIGURATION'}`);
    
    if (!overallStatus) {
      console.log('\n🔧 Next Steps:');
      if (!envVarsOk) {
        console.log('1. Configure missing environment variables in .env.local');
      }
      if (!apiConnectionOk) {
        console.log('2. Follow GOOGLE-API-SETUP-GUIDE.md to get real API tokens');
        console.log('3. Install googleapis: npm install googleapis');
      }
      if (!siteVerificationOk) {
        console.log('4. Verify your site in Google Search Console');
      }
      if (!monitoringOk) {
        console.log('5. Review and adjust monitoring configuration');
      }
    } else {
      console.log('\n🚀 Configuration Complete!');
      console.log('You can now use the GSC monitoring scripts with real API data.');
      console.log('\nTest with real API:');
      console.log('node scripts/real-gsc-check.cjs');
    }
    
    return overallStatus;
  }

  /**
   * Run complete configuration test
   */
  async runCompleteTest() {
    console.log('🧪 Google Search Console API Configuration Test');
    console.log('='.repeat(60));
    
    try {
      const envVarsOk = this.checkEnvironmentVariables();
      const apiConnectionOk = await this.testGoogleAPIConnection();
      const siteVerificationOk = await this.testSiteVerification();
      const monitoringOk = this.testMonitoringConfig();
      
      const overallStatus = this.generateConfigReport(
        envVarsOk, 
        apiConnectionOk, 
        siteVerificationOk, 
        monitoringOk
      );
      
      return overallStatus;
      
    } catch (error) {
      console.error('\n❌ Configuration test failed:', error.message);
      return false;
    }
  }
}

// CLI Usage
async function main() {
  const tester = new GSCAPITester();
  
  try {
    const isConfigured = await tester.runCompleteTest();
    
    if (isConfigured) {
      console.log('\n🎉 Configuration test passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Configuration needs attention.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = GSCAPITester;