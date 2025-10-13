/**
 * AI-Powered Content Generation for SEO
 * Uses Gemini AI to create optimized content based on keywords
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

class AIContentGenerator {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Generate blog post content and add to articles database
   */
  async generateBlogPost(keyword, targetUrl, searchIntent, relatedKeywords = []) {
    const prompt = `
    Créez un article de blog SEO-optimisé en français pour CCI Tunisie sur le sujet "${keyword}".
    IMPORTANT: Retournez UNIQUEMENT un objet JSON valide avec la structure suivante:

    {
      "title": "Titre H1 optimisé SEO (60 caractères max)",
      "metaTitle": "Meta titre SEO (60 caractères max)",
      "metaDescription": "Meta description SEO (150 caractères max)",
      "slug": "url-slug-optimise-seo",
      "excerpt": "Résumé de 2-3 lignes de l'article",
      "category": "tapis|marbre|tapisserie|post-chantier",
      "categoryLabel": "Nettoyage Tapis|Traitement Marbre|Nettoyage Tapisserie|Nettoyage Post-Chantier",
      "keywords": ["mot-clé-principal", "mot-clé-2", "mot-clé-3", "mot-clé-4", "mot-clé-5"],
      "readTime": "X min",
      "content": "Contenu HTML complet de l'article avec toutes les sections"
    }

    Contexte:
    - CCI Tunisie est une entreprise de nettoyage professionnel basée à Tunis
    - Services: nettoyage tapis/moquettes, restauration marbre, tapisserie, nettoyage post-chantier
    - Target URL: ${targetUrl}
    - Intent de recherche: ${searchIntent}
    - Mots-clés connexes: ${relatedKeywords.join(', ')}

    Structure du contenu HTML:
    1. Introduction engageante avec mot-clé principal
    2. 5-7 sections H2 avec contenu détaillé et ID pour ancrage
    3. FAQ avec schema JSON-LD intégré
    4. Call-to-action vers services CCI
    5. Section contact avec boutons

    Exigences SEO:
    - Utiliser le mot-clé principal dans le H1, premier paragraphe, et naturellement dans le contenu
    - Intégrer les mots-clés connexes naturellement
    - Optimiser pour les featured snippets
    - Inclure du schema markup JSON-LD pour FAQ
    - Ton professionnel mais accessible
    - 1500-2000 mots minimum
    - HTML bien structuré avec classes CSS appropriées

    Le slug doit être: mot-clé-principal-tunis-2025 (ou variation similaire)
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }
      
      const articleData = JSON.parse(jsonMatch[0]);
      
      // Add to articles database
      await this.addToArticlesDatabase(articleData);
      
      console.log(`✅ Generated and added article: "${articleData.title}"`);
      return articleData;
      
    } catch (error) {
      console.error('AI Content Generation Error:', error);
      return null;
    }
  }

  /**
   * Add generated article to articles.js database
   */
  async addToArticlesDatabase(articleData) {
    const fs = require('fs').promises;
    const articlesPath = 'src/app/conseils/data/articles.js';
    
    try {
      // Read current articles file
      const articlesContent = await fs.readFile(articlesPath, 'utf8');
      
      // Find the highest existing ID
      const idMatches = articlesContent.match(/id:\s*(\d+)/g);
      const highestId = idMatches ? Math.max(...idMatches.map(match => parseInt(match.match(/\d+/)[0]))) : 0;
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
        imageAlt: `${articleData.title} - CCI Services`,
        readTime: articleData.readTime,
        featured: false,
        content: articleData.content
      };
      
      // Convert to string format matching existing articles
      const articleString = this.formatArticleForDatabase(newArticle);
      
      // Insert before the closing bracket
      const insertPosition = articlesContent.lastIndexOf('];');
      const updatedContent = 
        articlesContent.substring(0, insertPosition) +
        ',\n' + articleString + '\n' +
        articlesContent.substring(insertPosition);
      
      // Write back to file
      await fs.writeFile(articlesPath, updatedContent, 'utf8');
      
      console.log(`✅ Added article ID ${newId} to database: "${articleData.title}"`);
      
    } catch (error) {
      console.error('Error adding article to database:', error.message);
      
      // Fallback: save as individual file
      await this.saveArticleAsFile(articleData);
    }
  }

  /**
   * Get default image based on category
   */
  getDefaultImage(category) {
    const images = {
      'tapis': '/home/nettoyagemoquetteaveclaméthodeinjectionextraction.webp',
      'marbre': '/gallery/marbre/Blog-Body-floor-01-1024x640.webp',
      'tapisserie': '/home/retapissage-salon-en-cuir.webp',
      'post-chantier': '/home/nettoyage-professionel-post-chantier.webp'
    };
    return images[category] || '/home/nettoyage-professionel-post-chantier.webp';
  }

  /**
   * Format article object for database insertion
   */
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
    content: \`${article.content.replace(/`/g, '\\`')}\`
  }`;
  }

  /**
   * Save article as individual file (fallback)
   */
  async saveArticleAsFile(articleData) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const articlesDir = 'content/generated-articles';
      await fs.mkdir(articlesDir, { recursive: true });
      
      const filename = `${articleData.slug}.json`;
      const filepath = path.join(articlesDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(articleData, null, 2), 'utf8');
      console.log(`✅ Saved article as file: ${filepath}`);
      
    } catch (error) {
      console.error('Error saving article file:', error.message);
    }
  }

  /**
   * Generate service page content
   */
  async generateServicePage(keyword, targetUrl, competition, relatedServices = []) {
    const prompt = `
    Créez une page de service SEO-optimisée en français pour CCI Tunisie sur "${keyword}".

    Contexte:
    - Service principal: ${keyword}
    - URL cible: ${targetUrl}
    - Niveau de concurrence: ${competition}
    - Services connexes: ${relatedServices.join(', ')}
    - Localisation: Tunis, Ariana, Carthage, Ben Arous

    Structure requise:
    1. Titre H1 avec localisation
    2. Hero section avec proposition de valeur unique
    3. Section "Nos méthodes" (techniques professionnelles)
    4. Section "Pourquoi CCI Tunisie?"
    5. Zone d'intervention
    6. Processus étape par étape
    7. Garanties et certifications
    8. Témoignages clients
    9. FAQ spécifique au service
    10. CTA avec devis gratuit

    Exigences SEO:
    - Keyword density optimale (1-2%)
    - Rich snippets (Service, LocalBusiness)
    - Structured data
    - Internal linking vers services connexes
    - Mobile-first approach
    - Core Web Vitals optimized

    Format: Next.js React component avec metadata export.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Service Page Generation Error:', error);
      return null;
    }
  }

  /**
   * Generate meta tags and structured data
   */
  async generateMetaData(keyword, pageType, contentSummary) {
    const prompt = `
    Générez les métadonnées SEO optimales pour CCI Tunisie:

    Mot-clé principal: ${keyword}
    Type de page: ${pageType}
    Résumé du contenu: ${contentSummary}

    Générez:
    1. Title tag (50-60 caractères) - optimisé pour le CTR
    2. Meta description (140-160 caractères) - persuasive avec CTA
    3. Meta keywords (10-15 mots-clés pertinents)
    4. Open Graph tags (title, description, type)
    5. Twitter Card tags
    6. Schema.org JSON-LD approprié (Service, Article, ou LocalBusiness)
    7. Canonical URL
    8. Hreflang (fr-TN)

    Format: JSON structure prête pour Next.js metadata API.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Metadata Generation Error:', error);
      return null;
    }
  }

  /**
   * Generate internal linking suggestions
   */
  async generateInternalLinks(currentPage, relatedPages, contentContext) {
    const prompt = `
    Analysez les opportunités de linking interne pour optimiser le SEO:

    Page actuelle: ${currentPage}
    Pages connexes: ${relatedPages.join(', ')}
    Contexte du contenu: ${contentContext}

    Générez:
    1. 5-8 liens internes pertinents avec anchors optimisés
    2. Répartition naturelle dans le contenu
    3. Liens vers pages de services connexes
    4. Liens vers articles de blog complémentaires
    5. Liens vers pages locales (Tunis, Ariana, etc.)

    Pour chaque lien, fournissez:
    - URL de destination
    - Anchor text optimisé
    - Position suggérée dans le contenu
    - Justification SEO

    Format: Array d'objets JSON.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Internal Linking Generation Error:', error);
      return null;
    }
  }

  /**
   * Generate FAQ content
   */
  async generateFAQ(keyword, serviceType, commonQuestions = []) {
    const prompt = `
    Créez une section FAQ optimisée SEO pour "${keyword}" chez CCI Tunisie:

    Type de service: ${serviceType}
    Questions existantes: ${commonQuestions.join(', ')}

    Générez 8-10 questions-réponses:
    1. Questions que les clients se posent vraiment
    2. Réponses détaillées avec expertise technique
    3. Intégration naturelle des mots-clés connexes
    4. Informations sur prix/tarifs
    5. Processus et méthodes
    6. Zones d'intervention
    7. Délais et garanties
    8. Comparaisons avec la concurrence

    Format: JSON-LD Schema markup pour FAQ + HTML formaté.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('FAQ Generation Error:', error);
      return null;
    }
  }

  /**
   * Optimize existing content
   */
  async optimizeExistingContent(currentContent, targetKeyword, issues = []) {
    const prompt = `
    Optimisez ce contenu existant pour améliorer le SEO:

    Contenu actuel: ${currentContent.substring(0, 2000)}...
    Mot-clé cible: ${targetKeyword}
    Problèmes identifiés: ${issues.join(', ')}

    Améliorations à apporter:
    1. Optimisation de la densité de mots-clés
    2. Amélioration de la structure H1-H6
    3. Enrichissement sémantique
    4. Ajout de CTAs efficaces
    5. Amélioration de la lisibilité
    6. Optimisation pour featured snippets
    7. Ajout d'éléments structurés

    Fournissez:
    - Version optimisée complète
    - Liste des changements effectués
    - Score d'amélioration estimé
    - Recommandations supplémentaires

    Format: Markdown avec annotations des modifications.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Content Optimization Error:', error);
      return null;
    }
  }
}

/**
 * Automated Content Creation Workflow
 */
class ContentCreationWorkflow {
  constructor(aiGenerator, keywordManager) {
    this.ai = aiGenerator;
    this.keywordManager = keywordManager;
  }

  /**
   * Process content gaps automatically
   */
  async processContentGaps(contentGaps) {
    const results = [];

    for (const gap of contentGaps) {
      try {
        console.log(`Generating content for: ${gap.Keyword}`);

        let content;
        if (gap['Content Type'] === 'Blog Article') {
          const relatedKeywords = this.findRelatedKeywords(gap.Keyword);
          content = await this.ai.generateBlogPost(
            gap.Keyword,
            gap['Target URL'],
            gap['Search Intent'],
            relatedKeywords
          );
        } else if (gap['Content Type'] === 'Service Page') {
          const relatedServices = this.findRelatedServices(gap.Keyword);
          content = await this.ai.generateServicePage(
            gap.Keyword,
            gap['Target URL'],
            gap.Competition,
            relatedServices
          );
        }

        if (content) {
          const filename = this.generateFilename(gap);
          const filepath = path.join('./generated-content', filename);
          
          // Ensure directory exists
          const dir = path.dirname(filepath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filepath, content);
          
          results.push({
            keyword: gap.Keyword,
            file: filepath,
            status: 'generated',
            wordCount: content.split(' ').length
          });

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error generating content for ${gap.Keyword}:`, error);
        results.push({
          keyword: gap.Keyword,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Find related keywords from the same cluster
   */
  findRelatedKeywords(keyword) {
    // Implementation depends on your keyword clustering logic
    return this.keywordManager.clusters.get(
      this.keywordManager.findClusterKey(keyword.toLowerCase())
    )?.map(k => k.Keyword).slice(0, 5) || [];
  }

  /**
   * Find related services
   */
  findRelatedServices(keyword) {
    const serviceMap = {
      'tapis': ['moquette', 'salon', 'nettoyage'],
      'marbre': ['granite', 'pierre', 'polissage'],
      'salon': ['canapé', 'tapisserie', 'rideaux'],
      'chantier': ['tfc', 'post-construction', 'nettoyage']
    };

    for (const [key, services] of Object.entries(serviceMap)) {
      if (keyword.toLowerCase().includes(key)) {
        return services;
      }
    }

    return [];
  }

  /**
   * Generate appropriate filename
   */
  generateFilename(gap) {
    const slug = gap.Keyword
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (gap['Content Type'] === 'Blog Article') {
      return `blog/${slug}.md`;
    } else {
      return `pages/${slug}.jsx`;
    }
  }
}

export { AIContentGenerator, ContentCreationWorkflow };

// Usage example:
async function generateContentAutomatically() {
  const generator = new AIContentGenerator(process.env.GEMINI_API_KEY);
  const workflow = new ContentCreationWorkflow(generator, keywordManager);

  // Get content gaps from CSV
  const gaps = keywordManager.identifyContentGaps();
  const highPriorityGaps = gaps.filter(g => g.Priority === 'High').slice(0, 5);

  // Generate content
  const results = await workflow.processContentGaps(highPriorityGaps);
  
  console.log('Content Generation Results:');
  results.forEach(result => {
    console.log(`${result.keyword}: ${result.status} (${result.wordCount || 0} words)`);
  });
}