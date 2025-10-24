const fs = require('fs');
const path = require('path');

/**
 * Analyseur de différences entre articles indexés et non-indexés
 * Identifie les facteurs de succès SEO
 */
class ArticleSEOAnalyzer {
  constructor() {
    this.indexedSlugs = [
      'marbre-blanc-entretien-renovation-tunis-2025',
      'retapissage-rembourrage-professionnel-tunis-sur-mesure', 
      'tapisserie-nautique-ignifuge-carthage-tanit-ferry',
      'desinfection-salon-tunis-2025',
      'polissage-marbre-tunis-2025',
      'prix-nettoyage-tapis-tunis-tarifs-2025',
      'detachage-moquette-tunis-2025',
      'nettoyage-canape-tunis-2025'
    ];
    
    this.articles = [];
    this.indexedArticles = [];
    this.nonIndexedArticles = [];
    this.analysis = {
      seoFactors: {},
      contentFactors: {},
      structuralFactors: {},
      recommendations: []
    };
  }

  /**
   * Charger et parser les articles
   */
  async loadArticles() {
    try {
      console.log('📚 CHARGEMENT DES ARTICLES');
      console.log('='.repeat(50));

      const articlesPath = path.join(__dirname, '../src/app/conseils/data/articles.js');
      const content = fs.readFileSync(articlesPath, 'utf8');

      // Extraire les objets articles avec une regex plus robuste
      const articleMatches = content.match(/{\s*id:\s*\d+[\s\S]*?(?=},\s*{|}\s*\];)/g);
      
      if (!articleMatches) {
        throw new Error('Impossible de parser les articles');
      }

      console.log(`📊 Articles trouvés: ${articleMatches.length}`);

      // Parser chaque article
      for (const match of articleMatches) {
        try {
          // Nettoyer et extraire les propriétés
          const article = this.parseArticleObject(match);
          if (article) {
            this.articles.push(article);
          }
        } catch (error) {
          console.log(`⚠️ Erreur parsing article: ${error.message}`);
        }
      }

      // Séparer les articles indexés et non-indexés
      this.indexedArticles = this.articles.filter(a => 
        this.indexedSlugs.includes(a.slug)
      );
      
      this.nonIndexedArticles = this.articles.filter(a => 
        !this.indexedSlugs.includes(a.slug)
      );

      console.log(`✅ Articles indexés: ${this.indexedArticles.length}`);
      console.log(`❌ Articles non-indexés: ${this.nonIndexedArticles.length}`);

      return this.articles;

    } catch (error) {
      console.error('❌ Erreur chargement articles:', error.message);
      throw error;
    }
  }

  /**
   * Parser un objet article depuis le texte
   */
  parseArticleObject(articleText) {
    const article = {};
    
    // Extraire les propriétés principales
    const extractors = {
      id: /id:\s*(\d+)/,
      slug: /slug:\s*['"`]([^'"`]+)['"`]/,
      title: /title:\s*['"`]([^'"`]+)['"`]/,
      metaTitle: /metaTitle:\s*['"`]([^'"`]+)['"`]/,
      metaDescription: /metaDescription:\s*['"`]([^'"`]+)['"`]/,
      excerpt: /excerpt:\s*['"`]([^'"`]+)['"`]/,
      category: /category:\s*['"`]([^'"`]+)['"`]/,
      publishedDate: /publishedDate:\s*['"`]([^'"`]+)['"`]/,
      readTime: /readTime:\s*['"`]([^'"`]+)['"`]/,
      featured: /featured:\s*(true|false)/
    };

    for (const [key, regex] of Object.entries(extractors)) {
      const match = articleText.match(regex);
      if (match) {
        article[key] = key === 'featured' ? match[1] === 'true' : match[1];
      }
    }

    // Extraire les keywords
    const keywordsMatch = articleText.match(/keywords:\s*\[(.*?)\]/s);
    if (keywordsMatch) {
      const keywordsStr = keywordsMatch[1];
      const keywords = keywordsStr.match(/"([^"]+)"/g);
      if (keywords) {
        article.keywords = keywords.map(k => k.replace(/"/g, ''));
      }
    }

    // Extraire le contenu
    const contentMatch = articleText.match(/content:\s*`([\s\S]*)`/);
    if (contentMatch) {
      article.content = contentMatch[1];
    }

    return article.slug ? article : null;
  }

  /**
   * Analyser les facteurs SEO
   */
  analyzeSEOFactors() {
    console.log('\n🔍 ANALYSE DES FACTEURS SEO');
    console.log('='.repeat(50));

    // Analyser les méta-données
    const seoFactors = {
      metaTitle: {
        indexed: this.analyzeStringField(this.indexedArticles, 'metaTitle'),
        nonIndexed: this.analyzeStringField(this.nonIndexedArticles, 'metaTitle')
      },
      metaDescription: {
        indexed: this.analyzeStringField(this.indexedArticles, 'metaDescription'),
        nonIndexed: this.analyzeStringField(this.nonIndexedArticles, 'metaDescription')
      },
      title: {
        indexed: this.analyzeStringField(this.indexedArticles, 'title'),
        nonIndexed: this.analyzeStringField(this.nonIndexedArticles, 'title')
      },
      excerpt: {
        indexed: this.analyzeStringField(this.indexedArticles, 'excerpt'),
        nonIndexed: this.analyzeStringField(this.nonIndexedArticles, 'excerpt')
      }
    };

    // Afficher les résultats
    console.log('📋 LONGUEURS MÉTA-DONNÉES:');
    Object.entries(seoFactors).forEach(([field, data]) => {
      console.log(`\n${field.toUpperCase()}:`);
      console.log(`  ✅ Indexés - Moy: ${data.indexed.averageLength} | Min: ${data.indexed.minLength} | Max: ${data.indexed.maxLength}`);
      console.log(`  ❌ Non-indexés - Moy: ${data.nonIndexed.averageLength} | Min: ${data.nonIndexed.minLength} | Max: ${data.nonIndexed.maxLength}`);
    });

    this.analysis.seoFactors = seoFactors;
    return seoFactors;
  }

  /**
   * Analyser les mots-clés
   */
  analyzeKeywords() {
    console.log('\n🎯 ANALYSE DES MOTS-CLÉS');
    console.log('='.repeat(50));

    const indexedKeywords = this.extractAllKeywords(this.indexedArticles);
    const nonIndexedKeywords = this.extractAllKeywords(this.nonIndexedArticles);

    console.log(`📊 Mots-clés articles indexés: ${indexedKeywords.totalKeywords}`);
    console.log(`📊 Mots-clés moyens par article indexé: ${indexedKeywords.averagePerArticle}`);
    console.log(`📊 Mots-clés articles non-indexés: ${nonIndexedKeywords.totalKeywords}`);
    console.log(`📊 Mots-clés moyens par article non-indexé: ${nonIndexedKeywords.averagePerArticle}`);

    // Analyser les mots-clés les plus fréquents
    console.log('\n🔥 MOTS-CLÉS FRÉQUENTS (INDEXÉS):');
    indexedKeywords.topKeywords.slice(0, 10).forEach((kw, i) => {
      console.log(`${i + 1}. "${kw.keyword}" (${kw.frequency} fois)`);
    });

    console.log('\n💭 MOTS-CLÉS FRÉQUENTS (NON-INDEXÉS):');
    nonIndexedKeywords.topKeywords.slice(0, 10).forEach((kw, i) => {
      console.log(`${i + 1}. "${kw.keyword}" (${kw.frequency} fois)`);
    });

    return { indexedKeywords, nonIndexedKeywords };
  }

  /**
   * Analyser les catégories
   */
  analyzeCategories() {
    console.log('\n📂 ANALYSE DES CATÉGORIES');
    console.log('='.repeat(50));

    const indexedCategories = this.groupByCategory(this.indexedArticles);
    const nonIndexedCategories = this.groupByCategory(this.nonIndexedArticles);

    console.log('✅ CATÉGORIES INDEXÉES:');
    Object.entries(indexedCategories).forEach(([cat, articles]) => {
      console.log(`  ${cat}: ${articles.length} articles`);
    });

    console.log('\n❌ CATÉGORIES NON-INDEXÉES:');
    Object.entries(nonIndexedCategories).forEach(([cat, articles]) => {
      console.log(`  ${cat}: ${articles.length} articles`);
    });

    return { indexedCategories, nonIndexedCategories };
  }

  /**
   * Analyser le contenu
   */
  analyzeContent() {
    console.log('\n📝 ANALYSE DU CONTENU');
    console.log('='.repeat(50));

    const contentAnalysis = {
      indexed: this.analyzeContentStructure(this.indexedArticles),
      nonIndexed: this.analyzeContentStructure(this.nonIndexedArticles)
    };

    console.log('📏 LONGUEUR DU CONTENU:');
    console.log(`  ✅ Indexés - Moyenne: ${contentAnalysis.indexed.averageLength} caractères`);
    console.log(`  ❌ Non-indexés - Moyenne: ${contentAnalysis.nonIndexed.averageLength} caractères`);

    console.log('\n📋 STRUCTURE HTML:');
    console.log(`  ✅ Indexés - H2 moyens: ${contentAnalysis.indexed.averageH2Count}`);
    console.log(`  ❌ Non-indexés - H2 moyens: ${contentAnalysis.nonIndexed.averageH2Count}`);

    console.log('\n🔗 LIENS INTERNES:');
    console.log(`  ✅ Indexés - Liens moyens: ${contentAnalysis.indexed.averageInternalLinks}`);
    console.log(`  ❌ Non-indexés - Liens moyens: ${contentAnalysis.nonIndexed.averageInternalLinks}`);

    return contentAnalysis;
  }

  /**
   * Analyser la structure d'un champ texte
   */
  analyzeStringField(articles, field) {
    const lengths = articles
      .filter(a => a[field])
      .map(a => a[field].length);

    return {
      count: lengths.length,
      averageLength: lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b) / lengths.length) : 0,
      minLength: lengths.length > 0 ? Math.min(...lengths) : 0,
      maxLength: lengths.length > 0 ? Math.max(...lengths) : 0
    };
  }

  /**
   * Extraire tous les mots-clés
   */
  extractAllKeywords(articles) {
    const allKeywords = [];
    
    articles.forEach(article => {
      if (article.keywords) {
        allKeywords.push(...article.keywords);
      }
    });

    const keywordFreq = {};
    allKeywords.forEach(kw => {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    });

    const topKeywords = Object.entries(keywordFreq)
      .map(([keyword, frequency]) => ({ keyword, frequency }))
      .sort((a, b) => b.frequency - a.frequency);

    return {
      totalKeywords: allKeywords.length,
      uniqueKeywords: Object.keys(keywordFreq).length,
      averagePerArticle: Math.round(allKeywords.length / articles.length),
      topKeywords
    };
  }

  /**
   * Grouper par catégorie
   */
  groupByCategory(articles) {
    return articles.reduce((groups, article) => {
      const category = article.category || 'non-définie';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(article);
      return groups;
    }, {});
  }

  /**
   * Analyser la structure du contenu
   */
  analyzeContentStructure(articles) {
    const articlesWithContent = articles.filter(a => a.content);
    
    if (articlesWithContent.length === 0) {
      return { averageLength: 0, averageH2Count: 0, averageInternalLinks: 0 };
    }

    const contentLengths = articlesWithContent.map(a => a.content.length);
    const h2Counts = articlesWithContent.map(a => (a.content.match(/<h2/g) || []).length);
    const linkCounts = articlesWithContent.map(a => (a.content.match(/<a href="/g) || []).length);

    return {
      averageLength: Math.round(contentLengths.reduce((a, b) => a + b) / contentLengths.length),
      averageH2Count: Math.round(h2Counts.reduce((a, b) => a + b) / h2Counts.length * 10) / 10,
      averageInternalLinks: Math.round(linkCounts.reduce((a, b) => a + b) / linkCounts.length * 10) / 10
    };
  }

  /**
   * Générer des recommandations
   */
  generateRecommendations() {
    console.log('\n💡 RECOMMANDATIONS SEO');
    console.log('='.repeat(50));

    const recommendations = [];

    // Analyser les différences significatives
    const seoFactors = this.analysis.seoFactors;
    
    // Recommandations basées sur les méta-données
    if (seoFactors.metaTitle.indexed.averageLength > seoFactors.metaTitle.nonIndexed.averageLength) {
      recommendations.push({
        type: 'SEO',
        priority: 'High',
        recommendation: `Allonger les meta-titles des articles non-indexés (moy. indexés: ${seoFactors.metaTitle.indexed.averageLength} vs non-indexés: ${seoFactors.metaTitle.nonIndexed.averageLength})`
      });
    }

    if (seoFactors.metaDescription.indexed.averageLength > seoFactors.metaDescription.nonIndexed.averageLength) {
      recommendations.push({
        type: 'SEO',
        priority: 'High',
        recommendation: `Enrichir les meta-descriptions des articles non-indexés (moy. indexés: ${seoFactors.metaDescription.indexed.averageLength} vs non-indexés: ${seoFactors.metaDescription.nonIndexed.averageLength})`
      });
    }

    // Afficher les recommandations
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority}] ${rec.recommendation}`);
    });

    this.analysis.recommendations = recommendations;
    return recommendations;
  }

  /**
   * Générer le rapport complet
   */
  async generateReport() {
    console.log('\n📊 RAPPORT COMPLET D\'ANALYSE SEO');
    console.log('='.repeat(60));

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalArticles: this.articles.length,
        indexedArticles: this.indexedArticles.length,
        nonIndexedArticles: this.nonIndexedArticles.length,
        indexingRate: ((this.indexedArticles.length / this.articles.length) * 100).toFixed(1)
      },
      analysis: this.analysis,
      indexedSamples: this.indexedArticles.slice(0, 3).map(a => ({
        slug: a.slug,
        metaTitleLength: a.metaTitle?.length || 0,
        metaDescLength: a.metaDescription?.length || 0,
        keywordCount: a.keywords?.length || 0
      })),
      nonIndexedSamples: this.nonIndexedArticles.slice(0, 3).map(a => ({
        slug: a.slug,
        metaTitleLength: a.metaTitle?.length || 0,
        metaDescLength: a.metaDescription?.length || 0,
        keywordCount: a.keywords?.length || 0
      }))
    };

    console.log('\n🎯 RÉSUMÉ EXÉCUTIF:');
    console.log(`📚 Total articles: ${report.summary.totalArticles}`);
    console.log(`✅ Articles indexés: ${report.summary.indexedArticles} (${report.summary.indexingRate}%)`);
    console.log(`❌ Articles non-indexés: ${report.summary.nonIndexedArticles}`);

    return report;
  }

  /**
   * Sauvegarder le rapport
   */
  async saveReport(report) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const reportPath = path.join(__dirname, '../reports', `seo-analysis-${timestamp}.json`);
      
      // Assurer que le dossier reports existe
      const reportsDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      console.log(`\n📋 Rapport sauvegardé: ${reportPath}`);
      
      return reportPath;
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error.message);
    }
  }

  /**
   * Exécuter l'analyse complète
   */
  async runAnalysis() {
    try {
      console.log('🚀 DÉMARRAGE DE L\'ANALYSE SEO DES ARTICLES');
      console.log('='.repeat(60));

      await this.loadArticles();
      
      this.analyzeSEOFactors();
      this.analyzeKeywords();
      this.analyzeCategories();
      this.analyzeContent();
      this.generateRecommendations();
      
      const report = await this.generateReport();
      await this.saveReport(report);

      console.log('\n✅ Analyse SEO terminée !');
      
      return report;

    } catch (error) {
      console.error('❌ Erreur analyse SEO:', error.message);
    }
  }
}

// Exécuter l'analyse
async function main() {
  const analyzer = new ArticleSEOAnalyzer();
  await analyzer.runAnalysis();
}

main().catch(console.error);