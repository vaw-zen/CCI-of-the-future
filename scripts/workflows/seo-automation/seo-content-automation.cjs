/**
 * Enhanced SEO Content Generator
 * Automatically generates articles from keywords and adds them to articles.js database
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');

class SEOContentAutomation {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    // Check if running in GitHub Actions or locally
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    this.csvPath = isGitHubActions ? 'scripts/data/seo-keywords.csv' : '../../data/seo-keywords.csv';
    this.articlesPath = 'src/app/conseils/data/articles.js';
  }

  /**
   * Read and filter keywords from CSV
   */
  async loadKeywordsFromCSV() {
    console.log('📊 Loading keywords from CSV...');
    
    const keywords = [];
    const stream = require('fs').createReadStream(this.csvPath)
      .pipe(csv());

    return new Promise((resolve, reject) => {
      stream
        .on('data', (row) => {
          // Filter for high-priority, unoptimized keywords
          if (row['Optimization Status'] === 'Not Optimized' && 
              ['High', 'Medium'].includes(row['Priority']) &&
              row['Content Type'] === 'Blog Post') {
            keywords.push({
              keyword: row['Keyword'],
              category: this.mapCategory(row['Category']),
              searchIntent: row['Search Intent'],
              targetUrl: row['Target URL'],
              priority: row['Priority']
            });
          }
        })
        .on('end', () => {
          console.log(`✅ Found ${keywords.length} keywords ready for content creation`);
          resolve(keywords);
        })
        .on('error', reject);
    });
  }

  /**
   * Map CSV categories to article categories
   */
  mapCategory(csvCategory) {
    const mapping = {
      'Tapis & Moquettes': 'tapis',
      'Marbre & Pierre': 'marbre', 
      'Tapisserie & Salon': 'tapisserie',
      'Post-Chantier': 'post-chantier',
      'Services Généraux': 'tapis' // Default
    };
    return mapping[csvCategory] || 'tapis';
  }

  /**
   * Generate article using AI
   */
  async generateArticle(keywordData) {
    console.log(`🎯 Generating article for: "${keywordData.keyword}"`);

    const categoryLabels = {
      'tapis': 'Nettoyage Tapis',
      'marbre': 'Traitement Marbre',
      'tapisserie': 'Nettoyage Tapisserie',
      'post-chantier': 'Nettoyage Post-Chantier'
    };

    const prompt = `
    Créez un article de blog professionnel pour CCI Services Tunisie sur "${keywordData.keyword}".
    
    IMPORTANT: Retournez UNIQUEMENT un objet JSON valide avec cette structure exacte:

    {
      "title": "Titre optimisé SEO (55-60 caractères max)",
      "metaTitle": "Meta titre SEO (55-60 caractères max)", 
      "metaDescription": "Meta description engageante (145-155 caractères max)",
      "slug": "url-slug-optimise-seo-tunis-2025",
      "excerpt": "Résumé accrocheur de l'article en 2-3 lignes maximum",
      "category": "${keywordData.category}",
      "categoryLabel": "${categoryLabels[keywordData.category]}",
      "keywords": ["${keywordData.keyword}", "mot-clé-2", "mot-clé-3", "mot-clé-4", "CCI services"],
      "readTime": "X min",
      "content": "Contenu HTML complet et structuré"
    }

    Contexte CCI Services:
    - Entreprise de nettoyage professionnel établie à Tunis depuis 15 ans
    - Services: nettoyage tapis/moquettes, restauration marbre, tapisserie, post-chantier
    - Zone d'intervention: Grand Tunis (Tunis, Ariana, La Marsa, Ben Arous, Manouba)
    - Contact: +216 98-557-766, contact@cciservices.online
    - Adresse: 06 Rue Galant de nuit, L'Aouina, Tunis 2045

    Exigences pour le contenu HTML:
    1. Introduction engageante avec classe "article-intro"
    2. 5-7 sections H2 avec IDs pour ancrage (#section-name)
    3. Sections obligatoires:
       - Pourquoi choisir un professionnel
       - Méthodes et techniques utilisées
       - Tarifs et zones d'intervention
       - FAQ avec 4-5 questions pertinentes
       - Section contact avec boutons
    4. Utiliser des classes CSS: "info-box", "benefits-grid", "contact-section"
    5. Intégrer le mot-clé principal naturellement (densité 1-2%)
    6. Longueur: 1500-2000 mots minimum
    7. Ton professionnel mais accessible
    8. Call-to-action vers services CCI Services

    Intent de recherche: ${keywordData.searchIntent}
    Priorité: ${keywordData.priority}

    Le slug doit inclure "tunis" et l'année "2025" pour le SEO local.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const articleData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!articleData.title || !articleData.content || !articleData.slug) {
        throw new Error('Missing required fields in generated article');
      }

      console.log(`✅ Generated: "${articleData.title}"`);
      return articleData;

    } catch (error) {
      console.error(`❌ Failed to generate article for "${keywordData.keyword}":`, error.message);
      return null;
    }
  }

  /**
   * Add article to articles.js database
   */
  async addToDatabase(articleData, keywordData) {
    try {
      // Read current articles
      const content = await fs.readFile(this.articlesPath, 'utf8');
      
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
        image: this.getDefaultImage(articleData.category),
        imageAlt: articleData.title + ' - CCI Services',
        readTime: articleData.readTime,
        featured: false,
        content: articleData.content
      };

      // Format for insertion
      const articleString = this.formatArticle(newArticle);
      
      // Insert before closing '];'
      const insertPos = content.lastIndexOf('];');
      const updated = content.substring(0, insertPos) + ',\n' + articleString + '\n' + content.substring(insertPos);
      
      // Write back
      await fs.writeFile(this.articlesPath, updated, 'utf8');
      
      console.log(`✅ Article #${newId} added to database`);
      
      // Update CSV status
      await this.updateKeywordStatus(keywordData.keyword, 'Optimized');
      
      return newId;

    } catch (error) {
      console.error('Database error:', error.message);
      
      // Fallback: save as backup
      await this.saveBackup(articleData, keywordData);
      throw error;
    }
  }

  /**
   * Get default image based on category
   */
  getDefaultImage(category) {
    const images = {
      'moquette': '/home/nettoyagemoquetteaveclaméthodeinjectionextraction.webp',
      'marbre': '/gallery/marbre/Blog-Body-floor-01-1024x640.webp',
      'tapisserie': '/home/retapissage-salon-en-cuir.webp',
      'post-chantier': '/home/nettoyage-professionel-post-chantier.webp'
    };
    return images[category] || '/home/nettoyage-professionel-post-chantier.webp';
  }

  /**
   * Format article for database insertion
   */
  formatArticle(article) {
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

  /**
   * Update keyword status in CSV
   */
  async updateKeywordStatus(keyword, status) {
    try {
      const csvContent = await fs.readFile(this.csvPath, 'utf8');
      const lines = csvContent.split('\n');
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].includes(keyword)) {
          const columns = lines[i].split(',');
          // Assuming "Optimization Status" is the 6th column
          columns[5] = status;
          lines[i] = columns.join(',');
          break;
        }
      }
      
      await fs.writeFile(this.csvPath, lines.join('\n'), 'utf8');
      console.log(`✅ Updated keyword status: ${keyword} → ${status}`);
      
    } catch (error) {
      console.log(`⚠️  Could not update CSV status for: ${keyword}`);
    }
  }

  /**
   * Save backup in case database insertion fails
   */
  async saveBackup(articleData, keywordData) {
    try {
      const backupDir = path.join(process.cwd(), 'content/generated-articles');
      await fs.mkdir(backupDir, { recursive: true });
      
      const backup = {
        ...articleData,
        originalKeyword: keywordData.keyword,
        generatedAt: new Date().toISOString()
      };
      
      await fs.writeFile(
        path.join(backupDir, `${articleData.slug}.json`),
        JSON.stringify(backup, null, 2)
      );
      
      console.log(`📁 Saved backup: ${articleData.slug}.json`);
      
    } catch (error) {
      console.error('Backup failed:', error.message);
    }
  }

  /**
   * Run automated content generation
   */
  async runAutomation(maxArticles = 3) {
    console.log('🚀 Starting SEO Content Automation\n');

    try {
      // Load keywords
      const keywords = await this.loadKeywordsFromCSV();
      
      if (keywords.length === 0) {
        console.log('✅ No keywords need content generation');
        return;
      }

      // Limit articles per run to avoid API overuse
      const selected = keywords.slice(0, maxArticles);
      console.log(`📝 Generating ${selected.length} articles...\n`);

      const results = [];

      for (const keywordData of selected) {
        try {
          // Generate article
          const article = await this.generateArticle(keywordData);
          
          if (article) {
            // Add to database
            const articleId = await this.addToDatabase(article, keywordData);
            
            results.push({
              keyword: keywordData.keyword,
              articleId,
              slug: article.slug,
              title: article.title,
              status: 'success'
            });
          } else {
            results.push({
              keyword: keywordData.keyword,
              status: 'failed',
              error: 'Generation failed'
            });
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error) {
          console.error(`❌ Error processing "${keywordData.keyword}":`, error.message);
          results.push({
            keyword: keywordData.keyword,
            status: 'error',
            error: error.message
          });
        }
      }

      // Summary
      console.log('\n🎉 Content Generation Summary:');
      const successful = results.filter(r => r.status === 'success');
      const failed = results.filter(r => r.status !== 'success');

      console.log(`✅ Successful: ${successful.length}`);
      successful.forEach(r => {
        console.log(`   - "${r.title}" (ID: ${r.articleId})`);
      });

      if (failed.length > 0) {
        console.log(`❌ Failed: ${failed.length}`);
        failed.forEach(r => {
          console.log(`   - "${r.keyword}": ${r.error}`);
        });
      }

      console.log('\n📋 Next Steps:');
      console.log('1. Check your articles database for new content');
      console.log('2. Visit /conseils to see new articles listed');
      console.log('3. Review and edit articles if needed');
      console.log('4. Monitor keyword rankings and performance');

      return results;

    } catch (error) {
      console.error('❌ Automation failed:', error.message);
    }
  }
}

// CLI execution
async function main() {
  const automation = new SEOContentAutomation();
  
  // Get max articles from command line args or default to 2
  const maxArticles = parseInt(process.argv[2]) || 2;
  
  await automation.runAutomation(maxArticles);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SEOContentAutomation };