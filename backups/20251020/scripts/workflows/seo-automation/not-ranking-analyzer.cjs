#!/usr/bin/env node

/**
 * Not Ranking Keywords Action Plan Generator
 * Creates specific action plans for keywords with Position = 0
 */

const fs = require('fs');
const csv = require('csv-parser');

class NotRankingAnalyzer {
  constructor() {
    // Environment-aware paths
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    this.csvPath = isGitHubActions ? 'scripts/data/seo-keywords.csv' : '../../data/seo-keywords.csv';
    this.reportPath = isGitHubActions ? 'scripts/reports/' : '../../reports/';
    
    this.keywords = [];
    this.notRankingKeywords = [];
  }

  /**
   * Load keywords from CSV
   */
  async loadKeywords() {
    console.log('📊 Loading SEO keywords data...');
    
    return new Promise((resolve, reject) => {
      this.keywords = [];
      
      fs.createReadStream(this.csvPath)
        .pipe(csv())
        .on('data', (row) => {
          this.keywords.push(row);
        })
        .on('end', () => {
          console.log(`✅ Loaded ${this.keywords.length} keywords`);
          resolve();
        })
        .on('error', reject);
    });
  }

  /**
   * Extract not ranking keywords and categorize them
   */
  analyzeNotRankingKeywords() {
    console.log('🔍 Analyzing not ranking keywords...');
    
    this.notRankingKeywords = this.keywords
      .filter(k => parseInt(k['Current Position']) === 0)
      .map(k => ({
        ...k,
        SearchVolumeNum: parseInt(k['Search Volume']) || 0,
        ImpressionsNum: parseInt(k.Impressions) || 0,
        ActionPriority: this.calculateActionPriority(k),
        InternalLinkingOpportunity: this.getInternalLinkingStrategy(k),
        ContentStrategy: this.getContentStrategy(k),
        BacklinkStrategy: this.getBacklinkStrategy(k)
      }))
      .sort((a, b) => b.SearchVolumeNum - a.SearchVolumeNum);
    
    console.log(`✅ Found ${this.notRankingKeywords.length} not ranking keywords`);
  }

  /**
   * Calculate action priority for not ranking keyword
   */
  calculateActionPriority(keyword) {
    const volume = parseInt(keyword['Search Volume']) || 0;
    const impressions = parseInt(keyword.Impressions) || 0;
    const intent = keyword['Search Intent'];
    
    if (volume > 500 && impressions > 500) return 'CRITICAL';
    if (volume > 300 && intent === 'Transactional') return 'HIGH';
    if (volume > 200 && intent === 'Commercial') return 'HIGH';
    if (volume > 100) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Get internal linking strategy for keyword
   */
  getInternalLinkingStrategy(keyword) {
    const targetUrl = keyword['Target URL'];
    const keywordText = keyword.Keyword.toLowerCase();
    
    // Determine source pages for internal links
    const linkSources = [];
    
    if (targetUrl.includes('/tapis')) {
      linkSources.push('/salon', '/services', '/marbre');
    } else if (targetUrl.includes('/marbre')) {
      linkSources.push('/tapis', '/services', '/tfc');
    } else if (targetUrl.includes('/salon')) {
      linkSources.push('/tapis', '/services', '/tapisserie');
    } else if (targetUrl.includes('/services')) {
      linkSources.push('/', '/tapis', '/marbre');
    } else if (targetUrl.includes('/tapisserie')) {
      linkSources.push('/salon', '/tapis', '/services');
    } else if (targetUrl.includes('/tfc')) {
      linkSources.push('/services', '/marbre');
    }

    // Generate anchor text variations
    const anchorTexts = this.generateAnchorTexts(keywordText);
    
    return {
      sourcePagesToAddLinksFrom: linkSources,
      anchorTextVariations: anchorTexts,
      recommendedLinksToAdd: Math.min(linkSources.length, 3)
    };
  }

  /**
   * Generate anchor text variations
   */
  generateAnchorTexts(keyword) {
    const variations = [
      keyword,
      `service de ${keyword}`,
      `expert en ${keyword}`,
      `${keyword} professionnel`,
      `${keyword} en Tunisie`
    ];
    
    return variations.slice(0, 3); // Return top 3 variations
  }

  /**
   * Get content strategy for keyword
   */
  getContentStrategy(keyword) {
    const intent = keyword['Search Intent'];
    const keywordText = keyword.Keyword;
    const volume = parseInt(keyword['Search Volume']) || 0;
    
    const strategy = {
      contentType: this.getContentType(intent),
      wordCount: volume > 300 ? '2000-3000' : '1500-2500',
      headingStructure: this.getHeadingStructure(keywordText, intent),
      faqQuestions: this.generateFAQQuestions(keywordText, intent),
      schemaMarkup: this.getSchemaRecommendation(intent)
    };
    
    return strategy;
  }

  /**
   * Get content type based on search intent
   */
  getContentType(intent) {
    switch (intent) {
      case 'Transactional': return 'Service Landing Page + Pricing';
      case 'Commercial': return 'Service Page + Comparison Guide';
      case 'Informational': return 'Comprehensive Guide + How-to';
      case 'Navigational': return 'Brand/Service Overview Page';
      default: return 'Mixed Content Hub';
    }
  }

  /**
   * Get heading structure recommendation
   */
  getHeadingStructure(keyword, intent) {
    const structures = {
      'Transactional': [
        `H1: ${keyword} - Devis Gratuit en Tunisie`,
        `H2: Prix et Tarifs ${keyword}`,
        `H2: Processus de Service`,
        `H2: Pourquoi Choisir CCI Services`,
        `H2: Demandez Votre Devis`
      ],
      'Commercial': [
        `H1: ${keyword} Professionnel en Tunisie`,
        `H2: Nos Services ${keyword}`,
        `H2: Avantages de Nos Méthodes`,
        `H2: Zones d'Intervention`,
        `H2: Témoignages Clients`
      ],
      'Informational': [
        `H1: Guide Complet ${keyword}`,
        `H2: Qu'est-ce que ${keyword}?`,
        `H2: Techniques et Méthodes`,
        `H2: Conseils d'Entretien`,
        `H2: Faire Appel à un Professionnel`
      ]
    };
    
    return structures[intent] || structures['Commercial'];
  }

  /**
   * Generate FAQ questions for keyword
   */
  generateFAQQuestions(keyword, intent) {
    const baseQuestions = [
      `Quel est le prix moyen pour ${keyword}?`,
      `Combien de temps prend ${keyword}?`,
      `${keyword} est-il disponible à Tunis?`,
      `Quelle est la meilleure méthode pour ${keyword}?`
    ];
    
    if (intent === 'Transactional') {
      baseQuestions.push(`Comment réserver ${keyword}?`);
      baseQuestions.push(`${keyword} avec garantie?`);
    }
    
    return baseQuestions.slice(0, 4);
  }

  /**
   * Get schema markup recommendation
   */
  getSchemaRecommendation(intent) {
    switch (intent) {
      case 'Transactional': return 'Service + LocalBusiness + PriceSpecification';
      case 'Commercial': return 'Service + LocalBusiness + Review';
      case 'Informational': return 'Article + HowTo + FAQ';
      default: return 'LocalBusiness + Service';
    }
  }

  /**
   * Get backlink strategy
   */
  getBacklinkStrategy(keyword) {
    const intent = keyword['Search Intent'];
    const volume = parseInt(keyword['Search Volume']) || 0;
    const category = keyword.Category;
    
    const strategy = {
      priority: volume > 300 ? 'HIGH' : volume > 150 ? 'MEDIUM' : 'LOW',
      targetDomainAuthority: volume > 400 ? '30-50' : '20-40',
      linkTypes: this.getLinkTypes(intent, category),
      localOpportunities: this.getLocalBacklinkOpportunities(keyword),
      industryOpportunities: this.getIndustryBacklinkOpportunities(category)
    };
    
    return strategy;
  }

  /**
   * Get link types based on intent and category
   */
  getLinkTypes(intent, category) {
    const types = ['Guest Posts', 'Business Directories'];
    
    if (intent === 'Commercial' || intent === 'Transactional') {
      types.push('Local Business Listings', 'Industry Forums');
    }
    
    if (category.includes('Marbre')) {
      types.push('Architecture Blogs', 'Interior Design Sites');
    } else if (category.includes('Tapis')) {
      types.push('Home Cleaning Blogs', 'Carpet Care Forums');
    }
    
    return types;
  }

  /**
   * Get local backlink opportunities
   */
  getLocalBacklinkOpportunities(keyword) {
    return [
      'annuaires-entreprises.tn',
      'tunisie-annuaire.com',
      'jumia.com.tn (services)',
      'Local Facebook business groups',
      'Tunis Chamber of Commerce',
      'Yellow Pages Tunisia'
    ];
  }

  /**
   * Get industry backlink opportunities
   */
  getIndustryBacklinkOpportunities(category) {
    const opportunities = {
      'Marbre & Pierre': [
        'architecture-tunisie.com',
        'decoration-interieure.tn',
        'batiment-tunisie.com'
      ],
      'Tapis & Moquette': [
        'maison-deco.tn',
        'nettoyage-professionnel.tn',
        'home-services.tn'
      ],
      'Global Keywords': [
        'services-tunisie.com',
        'entreprises-nettoyage.tn',
        'professionnels-tunis.com'
      ]
    };
    
    return opportunities[category] || opportunities['Global Keywords'];
  }

  /**
   * Generate comprehensive not ranking report
   */
  async generateNotRankingReport() {
    const report = `# 🔍 Not Ranking Keywords Action Plan

Generated: ${new Date().toLocaleString()}
Total Not Ranking Keywords: ${this.notRankingKeywords.length}

## 📊 Priority Distribution

${this.getPriorityDistribution()}

## 🚨 CRITICAL PRIORITY (High Volume + High Impressions)

${this.getCriticalPriorityKeywords()}

## 🎯 HIGH PRIORITY (Transactional/Commercial Intent)

${this.getHighPriorityKeywords()}

## 📈 MEDIUM PRIORITY (Good Volume, Medium Competition)

${this.getMediumPriorityKeywords()}

## 📋 DETAILED ACTION PLANS

${this.getDetailedActionPlans()}

---
*Generated by Not Ranking Keywords Analyzer*
`;

    const reportFile = `${this.reportPath}not-ranking-action-plan.md`;
    fs.writeFileSync(reportFile, report);
    console.log('📋 Not ranking action plan saved: not-ranking-action-plan.md');
  }

  /**
   * Get priority distribution
   */
  getPriorityDistribution() {
    const distribution = {
      critical: this.notRankingKeywords.filter(k => k.ActionPriority === 'CRITICAL').length,
      high: this.notRankingKeywords.filter(k => k.ActionPriority === 'HIGH').length,
      medium: this.notRankingKeywords.filter(k => k.ActionPriority === 'MEDIUM').length,
      low: this.notRankingKeywords.filter(k => k.ActionPriority === 'LOW').length
    };

    return `- **🚨 Critical:** ${distribution.critical} keywords
- **🎯 High:** ${distribution.high} keywords  
- **📈 Medium:** ${distribution.medium} keywords
- **📋 Low:** ${distribution.low} keywords`;
  }

  /**
   * Get critical priority keywords
   */
  getCriticalPriorityKeywords() {
    const critical = this.notRankingKeywords.filter(k => k.ActionPriority === 'CRITICAL');
    
    if (critical.length === 0) return "*No critical priority keywords found*";
    
    return critical.map(k => 
      `### ${k.Keyword} (Volume: ${k['Search Volume']})
- **URL:** ${k['Target URL']}
- **Search Intent:** ${k['Search Intent']}
- **Impressions:** ${k.Impressions}
- **Status:** ${k['Optimization Status']}

**🎯 Immediate Actions:**
1. Create dedicated landing page with 2500+ words
2. Add internal links from: ${k.InternalLinkingOpportunity.sourcePagesToAddLinksFrom.join(', ')}
3. Build 5-7 high-quality backlinks (DA 30+)
4. Implement schema: ${k.ContentStrategy.schemaMarkup}
5. Target FAQ questions: "${k.ContentStrategy.faqQuestions[0]}", "${k.ContentStrategy.faqQuestions[1]}"

**⏰ Timeline:** Complete within 2 weeks`
    ).join('\n\n');
  }

  /**
   * Get high priority keywords
   */
  getHighPriorityKeywords() {
    const high = this.notRankingKeywords.filter(k => k.ActionPriority === 'HIGH');
    
    if (high.length === 0) return "*No high priority keywords found*";
    
    return high.slice(0, 10).map(k => 
      `- **${k.Keyword}** (${k['Search Volume']} vol, ${k['Search Intent']})
  - Target: ${k['Target URL']}
  - Action: ${k.ContentStrategy.contentType} + ${k.InternalLinkingOpportunity.recommendedLinksToAdd} internal links`
    ).join('\n\n');
  }

  /**
   * Get medium priority keywords
   */
  getMediumPriorityKeywords() {
    const medium = this.notRankingKeywords.filter(k => k.ActionPriority === 'MEDIUM');
    
    if (medium.length === 0) return "*No medium priority keywords found*";
    
    return medium.slice(0, 15).map(k => 
      `- **${k.Keyword}** (${k['Search Volume']} vol)
  - Target: ${k['Target URL']} | Intent: ${k['Search Intent']}
  - Strategy: ${k.ContentStrategy.contentType}`
    ).join('\n\n');
  }

  /**
   * Get detailed action plans for top keywords
   */
  getDetailedActionPlans() {
    const topKeywords = this.notRankingKeywords
      .filter(k => k.ActionPriority === 'CRITICAL' || k.ActionPriority === 'HIGH')
      .slice(0, 5);
    
    return topKeywords.map(k => 
      `### 📋 ${k.Keyword}

**Basic Info:**
- Volume: ${k['Search Volume']} | Intent: ${k['Search Intent']} | Priority: ${k.ActionPriority}
- Target URL: ${k['Target URL']}
- Current Status: ${k['Optimization Status']}

**🔗 Internal Linking Strategy:**
- Add links from: ${k.InternalLinkingOpportunity.sourcePagesToAddLinksFrom.join(', ')}
- Anchor texts: "${k.InternalLinkingOpportunity.anchorTextVariations.join('", "')}"
- Links needed: ${k.InternalLinkingOpportunity.recommendedLinksToAdd}

**📝 Content Strategy:**
- Type: ${k.ContentStrategy.contentType}
- Word count: ${k.ContentStrategy.wordCount}
- Schema: ${k.ContentStrategy.schemaMarkup}

**Heading Structure:**
${k.ContentStrategy.headingStructure.map(h => `  - ${h}`).join('\n')}

**FAQ Questions to Include:**
${k.ContentStrategy.faqQuestions.map(q => `  - ${q}`).join('\n')}

**🔗 Backlink Strategy:**
- Priority: ${k.BacklinkStrategy.priority}
- Target DA: ${k.BacklinkStrategy.targetDomainAuthority}
- Link types: ${k.BacklinkStrategy.linkTypes.join(', ')}

**Local Opportunities:**
${k.BacklinkStrategy.localOpportunities.slice(0, 3).map(opp => `  - ${opp}`).join('\n')}

**Industry Opportunities:**
${k.BacklinkStrategy.industryOpportunities.map(opp => `  - ${opp}`).join('\n')}`
    ).join('\n\n---\n\n');
  }

  /**
   * Run complete analysis
   */
  async runAnalysis() {
    console.log('🚀 Starting Not Ranking Keywords Analysis...\n');

    try {
      await this.loadKeywords();
      this.analyzeNotRankingKeywords();
      await this.generateNotRankingReport();

      console.log('\n✅ Analysis complete!');
      console.log('\n📋 Files generated:');
      console.log('   📄 scripts/reports/not-ranking-action-plan.md');
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Review critical priority keywords first');
      console.log('2. Implement internal linking strategies');
      console.log('3. Create content for high-volume keywords');
      console.log('4. Build targeted backlinks');

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new NotRankingAnalyzer();
  analyzer.runAnalysis();
}

module.exports = NotRankingAnalyzer;