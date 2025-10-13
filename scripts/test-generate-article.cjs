/**
 * Test AI Article Generation and Database Integration
 * CommonJS version to work with your module setup
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

async function generateTestArticle() {
  console.log('🧪 Testing AI Article Generation for Articles Database\n');

  // Verify API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    console.log('Make sure your .env.local file has the Gemini API key');
    return;
  }

  console.log('✅ API key found');

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    console.log('✅ AI model initialized');

    // Test with a specific keyword for CCI Services
    const keyword = 'nettoyage urgent tapis tunis';
    console.log(`🎯 Generating article for: "${keyword}"`);

    const prompt = `
    Créez un article de blog pour CCI Services Tunisie sur "${keyword}".
    Retournez UNIQUEMENT un JSON valide avec cette structure:

    {
      "title": "Nettoyage Urgent de Tapis à Tunis : Service Express CCI",
      "metaTitle": "Nettoyage Urgent Tapis Tunis | Service Express CCI",
      "metaDescription": "Service d'urgence nettoyage tapis 24h/48h à Tunis. CCI Services intervient rapidement. Devis gratuit, résultats garantis.",
      "slug": "nettoyage-urgent-tapis-tunis-service-express",
      "excerpt": "Besoin d'un nettoyage de tapis en urgence à Tunis ? CCI Services propose un service express avec intervention sous 24-48h.",
      "category": "tapis",
      "categoryLabel": "Nettoyage Tapis",
      "keywords": ["nettoyage urgent tapis tunis", "service express", "CCI services", "intervention rapide"],
      "readTime": "5 min",
      "content": "<div class='article-intro'>Contenu HTML de l'article complet...</div>"
    }

    Contexte CCI Services:
    - Entreprise nettoyage professionnel Tunis
    - Spécialité: tapis, moquettes, marbre, tapisserie
    - Zone: Grand Tunis (Tunis, Ariana, La Marsa, Ben Arous)
    - Contact: +216 98-557-766

    L'article doit contenir 1000+ mots avec:
    - Introduction sur l'urgence nettoyage
    - Situations qui nécessitent intervention rapide
    - Méthodes express (injection-extraction)
    - Tarifs et délais d'intervention
    - FAQ sur service urgent
    - Call-to-action CCI Services
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    console.log('✅ AI response received');

    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No valid JSON found in response');
      console.log('Raw response:', content.substring(0, 500) + '...');
      return;
    }

    const articleData = JSON.parse(jsonMatch[0]);
    console.log('✅ Article data parsed successfully');

    // Display article info
    console.log('\n📝 Generated Article:');
    console.log(`   Title: ${articleData.title}`);
    console.log(`   Slug: ${articleData.slug}`);
    console.log(`   Category: ${articleData.category}`);
    console.log(`   Keywords: ${articleData.keywords.join(', ')}`);
    console.log(`   Content Length: ${articleData.content.length} characters`);

    // Add to articles database
    console.log('\n📚 Adding to articles.js database...');
    await addToDatabase(articleData);

    console.log('\n🎉 Success! Article added to database');
    console.log('\n📋 Next Steps:');
    console.log('1. Check src/app/conseils/data/articles.js');
    console.log('2. Visit http://localhost:3000/conseils to see the new article');
    console.log(`3. Visit http://localhost:3000/conseils/${articleData.slug} to view it`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 API key might be invalid or expired');
      console.log('Check your Gemini API key in .env.local');
    }
  }
}

async function addToDatabase(articleData) {
  const articlesPath = path.join(process.cwd(), 'src/app/conseils/data/articles.js');
  
  try {
    // Read current articles
    const content = await fs.readFile(articlesPath, 'utf8');
    
    // Find highest ID
    const ids = content.match(/id:\s*(\d+)/g) || [];
    const highestId = ids.length > 0 ? Math.max(...ids.map(m => parseInt(m.match(/\d+/)[0]))) : 0;
    const newId = highestId + 1;

    // Create article object
    const newArticle = {
      id: newId,
      slug: articleData.slug,
      title: articleData.title,
      metaTitle: articleData.metaTitle,
      metaDescription: articleData.metaDescription,
      excerpt: articleData.excerpt,
      category: articleData.category,
      categoryLabel: articleData.categoryLabel,
      keywords: articleData.keywords,
      author: 'CCI Services',
      authorImage: '/team/expert-cci.jpg',
      publishedDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      image: '/home/nettoyagemoquetteaveclaméthodeinjectionextraction.webp',
      imageAlt: articleData.title + ' - CCI Services',
      readTime: articleData.readTime,
      featured: false,
      content: articleData.content
    };

    // Format for insertion
    const articleString = formatArticle(newArticle);
    
    // Insert before closing '];'
    const insertPos = content.lastIndexOf('];');
    const updated = content.substring(0, insertPos) + ',\n' + articleString + '\n' + content.substring(insertPos);
    
    // Write back
    await fs.writeFile(articlesPath, updated, 'utf8');
    
    console.log(`✅ Article #${newId} added to database`);
    
  } catch (error) {
    console.error('Database error:', error.message);
    
    // Fallback: save as separate file
    const backupDir = path.join(process.cwd(), 'content');
    await fs.mkdir(backupDir, { recursive: true });
    await fs.writeFile(
      path.join(backupDir, `${articleData.slug}.json`), 
      JSON.stringify(articleData, null, 2)
    );
    console.log('📁 Saved as backup file instead');
  }
}

function formatArticle(article) {
  return `  {
    id: ${article.id},
    slug: '${article.slug}',
    title: '${article.title.replace(/'/g, "\\'")}',
    metaTitle: '${article.metaTitle.replace(/'/g, "\\'")}',
    metaDescription: '${article.metaDescription.replace(/'/g, "\\'")}',
    excerpt: '${article.excerpt.replace(/'/g, "\\'")}',
    category: '${article.category}',
    categoryLabel: '${article.categoryLabel}',
    keywords: ${JSON.stringify(article.keywords)},
    author: '${article.author}',
    authorImage: '${article.authorImage}',
    publishedDate: '${article.publishedDate}',
    updatedDate: '${article.updatedDate}',
    image: '${article.image}',
    imageAlt: '${article.imageAlt.replace(/'/g, "\\'")}',
    readTime: '${article.readTime}',
    featured: ${article.featured},
    content: \`${article.content.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`
  }`;
}

// Run if executed directly
if (require.main === module) {
  generateTestArticle().catch(console.error);
}

module.exports = { generateTestArticle };