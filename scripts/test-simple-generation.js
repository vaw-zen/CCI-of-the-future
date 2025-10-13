/**
 * Simplified AI Article Generation Test
 * Tests creating articles and adding them to the articles.js database
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

class SimpleAIArticleGenerator {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generateArticle(keyword, targetUrl, searchIntent, relatedKeywords = []) {
    const prompt = `
    Créez un article de blog SEO pour CCI Tunisie sur "${keyword}".
    IMPORTANT: Retournez UNIQUEMENT un objet JSON valide avec cette structure:

    {
      "title": "Titre optimisé SEO (max 60 caractères)",
      "metaTitle": "Meta titre (max 60 caractères)",
      "metaDescription": "Meta description (max 150 caractères)",
      "slug": "url-slug-optimise",
      "excerpt": "Résumé de 2-3 lignes",
      "category": "tapis",
      "categoryLabel": "Nettoyage Tapis",
      "keywords": ["${keyword}", "${relatedKeywords.join('", "')}"],
      "readTime": "6 min",
      "content": "Contenu HTML de l'article complet"
    }

    Contexte CCI Tunisie:
    - Entreprise de nettoyage professionnel à Tunis
    - Services: tapis/moquettes, marbre, tapisserie, post-chantier
    - Expertise depuis 15 ans
    - Zone: Grand Tunis (Tunis, Ariana, La Marsa, etc.)

    Le contenu doit inclure:
    - Introduction avec le mot-clé
    - 4-6 sections H2 détaillées
    - FAQ avec 3-4 questions
    - Section contact CCI Services
    - Liens internes vers services
    - 1200+ mots au total

    Catégories possibles: "tapis", "marbre", "tapisserie", "post-chantier"
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      console.error('AI Generation Error:', error.message);
      return null;
    }
  }

  async addToArticlesDatabase(articleData) {
    const articlesPath = path.join(process.cwd(), 'src/app/conseils/data/articles.js');
    
    try {
      // Read current articles file
      const articlesContent = await fs.readFile(articlesPath, 'utf8');
      
      // Find highest ID
      const idMatches = articlesContent.match(/id:\s*(\d+)/g);
      const highestId = idMatches ? Math.max(...idMatches.map(match => parseInt(match.match(/\d+/)[0]))) : 0;
      const newId = highestId + 1;

      // Create new article object
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
        image: this.getDefaultImage(articleData.category),
        imageAlt: `${articleData.title} - CCI Services`,
        readTime: articleData.readTime,
        featured: false,
        content: articleData.content
      };

      // Format for insertion
      const articleString = this.formatArticleForDatabase(newArticle);
      
      // Insert before closing bracket
      const insertPosition = articlesContent.lastIndexOf('];');
      const updatedContent = 
        articlesContent.substring(0, insertPosition) +
        ',\n' + articleString + '\n' +
        articlesContent.substring(insertPosition);
      
      // Write back to file
      await fs.writeFile(articlesPath, updatedContent, 'utf8');
      
      console.log(`✅ Added article ID ${newId} to database`);
      return newId;
      
    } catch (error) {
      console.error('Error adding to database:', error.message);
      
      // Fallback: save as separate file
      await this.saveAsBackup(articleData);
      throw error;
    }
  }

  getDefaultImage(category) {
    const images = {
      'tapis': '/home/nettoyagemoquetteaveclaméthodeinjectionextraction.webp',
      'marbre': '/gallery/marbre/Blog-Body-floor-01-1024x640.webp',
      'tapisserie': '/home/retapissage-salon-en-cuir.webp',
      'post-chantier': '/home/nettoyage-professionel-post-chantier.webp'
    };
    return images[category] || '/home/nettoyage-professionel-post-chantier.webp';
  }

  formatArticleForDatabase(article) {
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

  async saveAsBackup(articleData) {
    try {
      const backupDir = path.join(process.cwd(), 'content/generated-articles');
      await fs.mkdir(backupDir, { recursive: true });
      
      const filename = `${articleData.slug}.json`;
      const filepath = path.join(backupDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(articleData, null, 2), 'utf8');
      console.log(`📁 Saved backup: ${filepath}`);
      
    } catch (error) {
      console.error('Backup save failed:', error.message);
    }
  }
}

async function testGeneration() {
  console.log('🧪 Testing AI Article Generation for CCI Services\n');

  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    console.log('Make sure .env.local file is present with the API key');
    return;
  }

  try {
    const generator = new SimpleAIArticleGenerator(process.env.GEMINI_API_KEY);
    
    // Test with a realistic keyword for your business
    const testKeyword = 'nettoyage tapis salon tunis prix';
    console.log(`🎯 Generating article for: "${testKeyword}"`);

    const article = await generator.generateArticle(
      testKeyword,
      '/services/tapis',
      'Commercial',
      ['prix nettoyage tapis', 'tarifs CCI services', 'nettoyage professionnel tunis']
    );

    if (!article) {
      console.error('❌ Failed to generate article');
      return;
    }

    console.log('✅ Article generated successfully!');
    console.log(`📝 Title: ${article.title}`);
    console.log(`🔗 Slug: ${article.slug}`);
    console.log(`📂 Category: ${article.category}`);
    console.log(`⏱️  Read Time: ${article.readTime}`);
    console.log(`💬 Content Length: ${article.content ? article.content.length : 0} characters`);

    // Add to database
    console.log('\n📚 Adding to articles database...');
    const articleId = await generator.addToArticlesDatabase(article);
    
    console.log(`\n🎉 Success! Article #${articleId} added to database`);
    console.log('\n📋 Next steps:');
    console.log('1. Check src/app/conseils/data/articles.js for the new article');
    console.log('2. Visit /conseils to see it listed');
    console.log(`3. Visit /conseils/${article.slug} to view the full article`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 API key issue detected');
      console.log('Check that your GEMINI_API_KEY is valid and has credits');
    }
  }
}

// Run test
if (require.main === module) {
  testGeneration().catch(console.error);
}

module.exports = { SimpleAIArticleGenerator, testGeneration };