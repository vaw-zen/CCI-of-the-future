/**
 * Test AI Article Generation and Database Integration
 * Verifies that AI-generated articles are properly added to articles.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;

async function testArticleGeneration() {
  console.log('🧪 Testing AI Article Generation and Database Integration\n');

  try {
    // Initialize AI Generator
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const aiGenerator = new AIContentGenerator(model);

    console.log('✅ AI Generator initialized');

    // Test keywords related to your business
    const testKeywords = [
      {
        keyword: 'détachage tapis professionnel tunis',
        targetUrl: '/services/tapis',
        searchIntent: 'Commercial',
        relatedKeywords: ['enlever taches tapis', 'nettoyage taches', 'détachant professionnel', 'CCI services']
      },
      {
        keyword: 'entretien marbre cuisine tunisie',
        targetUrl: '/services/marbre',
        searchIntent: 'Informational',
        relatedKeywords: ['marbre cuisine entretien', 'nettoyer marbre', 'polissage marbre', 'cristallisation']
      }
    ];

    console.log(`📝 Testing with ${testKeywords.length} keywords\n`);

    for (const testData of testKeywords) {
      console.log(`🎯 Generating article for: "${testData.keyword}"`);

      try {
        const article = await aiGenerator.generateBlogPost(
          testData.keyword,
          testData.targetUrl,
          testData.searchIntent,
          testData.relatedKeywords
        );

        if (article) {
          console.log(`✅ Successfully generated: "${article.title}"`);
          console.log(`📊 Details:`);
          console.log(`   - Slug: ${article.slug}`);
          console.log(`   - Category: ${article.category}`);
          console.log(`   - Keywords: ${article.keywords?.slice(0, 3).join(', ')}...`);
          console.log(`   - Read Time: ${article.readTime}`);
          console.log(`   - Content Length: ${article.content ? (article.content.length + ' characters') : 'N/A'}`);
          
        } else {
          console.log(`❌ Failed to generate article for "${testData.keyword}"`);
        }

      } catch (error) {
        console.error(`❌ Error generating "${testData.keyword}":`, error.message);
      }

      console.log(''); // Empty line for readability
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('🎉 Article generation test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check src/app/conseils/data/articles.js for new articles');
    console.log('2. Verify articles appear on /conseils page');
    console.log('3. Test article pages work correctly');
    console.log('4. Check SEO metadata is properly set');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('GEMINI_API_KEY')) {
      console.log('\n📋 Setup Required:');
      console.log('1. Make sure GEMINI_API_KEY is set in your environment');
      console.log('2. Use the same API key as your Facebook post generator');
      console.log('3. Verify you have Google AI Studio access');
    }
  }
}

// Check if articles.js exists and is accessible
async function checkArticlesDatabase() {
  console.log('🔍 Checking articles database...');
  
  try {
    const fs = require('fs').promises;
    const articlesPath = 'src/app/conseils/data/articles.js';
    
    const stats = await fs.stat(articlesPath);
    console.log(`✅ Articles database found (${Math.round(stats.size / 1024)}KB)`);
    
    const content = await fs.readFile(articlesPath, 'utf8');
    const articleCount = (content.match(/id:\s*\d+/g) || []).length;
    console.log(`📊 Current articles count: ${articleCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Articles database check failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting AI Article Integration Tests\n');
  
  const dbCheck = await checkArticlesDatabase();
  if (!dbCheck) {
    console.log('❌ Cannot proceed without articles database');
    return;
  }
  
  console.log('');
  await testArticleGeneration();
}

// Execute if run directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testArticleGeneration, checkArticlesDatabase };