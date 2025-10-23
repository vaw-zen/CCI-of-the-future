#!/usr/bin/env node

/**
 * SEO Optimization Checklist Generator
 * Creates specific technical SEO tasks for keywords needing optimization
 */

const fs = require('fs');
const csv = require('csv-parser');

class OptimizationChecklistGenerator {
  constructor() {
    // Environment-aware paths
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    this.csvPath = isGitHubActions ? 'scripts/data/seo-keywords.csv' : '../../data/seo-keywords.csv';
    this.reportPath = isGitHubActions ? 'scripts/reports/' : '../../reports/';
    
    this.keywords = [];
    this.needsOptimizationKeywords = [];
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
   * Extract keywords that need optimization
   */
  analyzeOptimizationNeeds() {
    console.log('🔍 Analyzing keywords needing optimization...');
    
    this.needsOptimizationKeywords = this.keywords
      .filter(k => 
        k['Optimization Status'].includes('Needs Optimization') || 
        k['Optimization Status'].includes('Requires Work') ||
        k['Optimization Status'].includes('Not Optimized') ||
        k.Trend === 'Declining'
      )
      .map(k => ({
        ...k,
        SearchVolumeNum: parseInt(k['Search Volume']) || 0,
        PositionNum: parseInt(k['Current Position']) || 999,
        CTRNum: parseFloat(k.CTR) || 0,
        OptimizationPriority: this.calculateOptimizationPriority(k),
        TechnicalChecklist: this.generateTechnicalChecklist(k),
        ContentChecklist: this.generateContentChecklist(k),
        TechnicalSEOChecklist: this.generateTechnicalSEOChecklist(k),
        LocalSEOChecklist: this.generateLocalSEOChecklist(k)
      }))
      .sort((a, b) => {
        // Sort by priority then by search volume
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        if (priorityOrder[a.OptimizationPriority] !== priorityOrder[b.OptimizationPriority]) {
          return priorityOrder[b.OptimizationPriority] - priorityOrder[a.OptimizationPriority];
        }
        return b.SearchVolumeNum - a.SearchVolumeNum;
      });
    
    console.log(`✅ Found ${this.needsOptimizationKeywords.length} keywords needing optimization`);
  }

  /**
   * Calculate optimization priority
   */
  calculateOptimizationPriority(keyword) {
    const volume = parseInt(keyword['Search Volume']) || 0;
    const position = parseInt(keyword['Current Position']) || 999;
    const trend = keyword.Trend;
    const status = keyword['Optimization Status'];
    
    if (trend === 'Declining' && volume > 300) return 'URGENT';
    if (status.includes('Requires Work') && volume > 400) return 'URGENT';
    if (position > 0 && position <= 10 && volume > 200) return 'HIGH';
    if (status.includes('Needs Optimization') && volume > 250) return 'HIGH';
    if (volume > 150) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate technical checklist for keyword
   */
  generateTechnicalChecklist(keyword) {
    const keywordText = keyword.Keyword;
    const targetUrl = keyword['Target URL'];
    const intent = keyword['Search Intent'];
    
    return {
      titleTag: {
        current: `Check current title tag on ${targetUrl}`,
        optimized: `${keywordText} - CCI Services Tunisie | Devis Gratuit`,
        requirements: [
          'Include primary keyword at the beginning',
          'Keep under 60 characters',
          'Add location (Tunis/Tunisie)',
          'Include compelling CTA or brand'
        ]
      },
      metaDescription: {
        current: `Review current meta description`,
        optimized: this.generateMetaDescription(keywordText, intent),
        requirements: [
          'Include primary keyword naturally',
          'Keep 150-160 characters',
          'Add clear call-to-action',
          'Include location and unique value proposition'
        ]
      },
      urlStructure: {
        current: targetUrl,
        requirements: [
          'Include primary keyword in URL slug',
          'Use hyphens to separate words',
          'Keep URL short and descriptive',
          'Ensure HTTPS is enabled'
        ]
      },
      headingStructure: this.generateHeadingStructure(keywordText, intent),
      imageOptimization: [
        'Add keyword in image file names',
        'Write descriptive ALT tags with keyword',
        'Compress images for faster loading',
        'Use WebP format when possible',
        'Add image schema markup'
      ]
    };
  }

  /**
   * Generate meta description
   */
  generateMetaDescription(keyword, intent) {
    const templates = {
      'Transactional': `${keyword} professionnel à Tunis. Devis gratuit en 24h. Service de qualité, prix transparents. Contactez CCI Services maintenant!`,
      'Commercial': `Expert en ${keyword} en Tunisie. Solutions professionnelles, équipe qualifiée. Découvrez nos services et obtenez votre devis gratuit.`,
      'Informational': `Guide complet ${keyword}. Conseils d'expert, techniques professionnelles. Tout savoir sur ${keyword} avec CCI Services.`,
      'Navigational': `CCI Services - Spécialiste ${keyword} en Tunisie. Service professionnel, devis gratuit. Votre partenaire de confiance.`
    };
    
    return templates[intent] || templates['Commercial'];
  }

  /**
   * Generate heading structure
   */
  generateHeadingStructure(keyword, intent) {
    return {
      h1: `${keyword} Professionnel en Tunisie - CCI Services`,
      h2Structure: [
        `Pourquoi Choisir Notre Service ${keyword}?`,
        `Processus de ${keyword} - Étape par Étape`,
        `Zones d'Intervention pour ${keyword}`,
        `Tarifs et Devis ${keyword}`,
        `Témoignages Clients ${keyword}`
      ],
      requirements: [
        'Use only one H1 tag with primary keyword',
        'Include secondary keywords in H2 tags',
        'Maintain logical hierarchy (H1 > H2 > H3)',
        'Each heading should be descriptive and keyword-rich'
      ]
    };
  }

  /**
   * Generate content checklist
   */
  generateContentChecklist(keyword) {
    const keywordText = keyword.Keyword;
    const volume = parseInt(keyword['Search Volume']) || 0;
    const intent = keyword['Search Intent'];
    
    return {
      wordCount: volume > 400 ? '2500-3500 words' : '1500-2500 words',
      keywordDensity: '1-2% for primary keyword, avoid keyword stuffing',
      contentStructure: [
        'Introduction with keyword in first 100 words',
        'Problem/need identification',
        'Solution explanation with benefits',
        'Process or methodology description',
        'Social proof (testimonials, case studies)',
        'Clear call-to-action section'
      ],
      semanticKeywords: this.generateSemanticKeywords(keywordText),
      faqSection: this.generateFAQQuestions(keywordText, intent),
      internalLinking: [
        'Link to related service pages',
        'Link to relevant blog posts',
        'Link to contact/devis page',
        'Use keyword-rich anchor texts',
        'Maintain 2-5 internal links per 1000 words'
      ],
      callToAction: [
        'Multiple CTA buttons throughout content',
        'Primary CTA above the fold',
        'Phone number prominently displayed',
        'Contact form or devis request',
        'WhatsApp or messenger integration'
      ]
    };
  }

  /**
   * Generate semantic keywords
   */
  generateSemanticKeywords(keyword) {
    const baseKeyword = keyword.toLowerCase();
    const semantics = [];
    
    // Add variations based on keyword type
    if (baseKeyword.includes('nettoyage')) {
      semantics.push('lavage', 'entretien', 'désinfection', 'shampouinage', 'détachage');
    }
    if (baseKeyword.includes('marbre')) {
      semantics.push('polissage', 'ponçage', 'cristallisation', 'lustrage', 'protection');
    }
    if (baseKeyword.includes('tapis') || baseKeyword.includes('moquette')) {
      semantics.push('injection-extraction', 'séchage', 'détachage', 'désodorisation');
    }
    
    // Add location variations
    semantics.push('Tunis', 'Tunisie', 'Ariana', 'La Marsa', 'Carthage');
    
    // Add service-related terms
    semantics.push('professionnel', 'qualité', 'rapide', 'devis gratuit', 'prix compétitif');
    
    return semantics.slice(0, 10);
  }

  /**
   * Generate FAQ questions
   */
  generateFAQQuestions(keyword, intent) {
    const baseQuestions = [
      `Quel est le prix pour ${keyword}?`,
      `Combien de temps prend le service ${keyword}?`,
      `${keyword} est-il disponible le weekend?`,
      `Quelle garantie pour ${keyword}?`,
      `Comment réserver ${keyword}?`
    ];
    
    if (intent === 'Transactional') {
      baseQuestions.push(`Devis gratuit pour ${keyword}?`);
      baseQuestions.push(`Paiement en plusieurs fois pour ${keyword}?`);
    }
    
    return baseQuestions.slice(0, 6);
  }

  /**
   * Generate technical SEO checklist
   */
  generateTechnicalSEOChecklist(keyword) {
    return {
      schemaMarkup: [
        'LocalBusiness schema with full NAP',
        'Service schema for the specific service',
        'Review schema for testimonials',
        'FAQ schema for question section',
        'Breadcrumb schema for navigation'
      ],
      pageSpeed: [
        'Optimize Core Web Vitals (LCP, FID, CLS)',
        'Compress images and use WebP format',
        'Minify CSS and JavaScript',
        'Enable browser caching',
        'Use CDN for static assets'
      ],
      mobileFriendly: [
        'Responsive design for all devices',
        'Touch-friendly buttons and forms',
        'Readable font sizes (16px minimum)',
        'Optimized viewport meta tag',
        'Fast mobile loading speed'
      ],
      indexability: [
        'Submit URL to Google Search Console',
        'Create XML sitemap entry',
        'Check robots.txt allows crawling',
        'Ensure no noindex tag present',
        'Monitor crawl errors'
      ]
    };
  }

  /**
   * Generate local SEO checklist
   */
  generateLocalSEOChecklist(keyword) {
    return {
      businessListings: [
        'Google My Business optimization',
        'Facebook Business Page',
        'Bing Places for Business',
        'Yellow Pages Tunisia',
        'Local Tunisian directories'
      ],
      napConsistency: [
        'Name: CCI Services (consistent across all platforms)',
        'Address: Complete Tunis address with postal code',
        'Phone: Local Tunisian phone number format',
        'Hours: Business hours in local time',
        'Website: Consistent domain across all listings'
      ],
      localContent: [
        'Mention specific Tunis neighborhoods',
        'Include local landmarks and references',
        'Add map embed for service area',
        'Create location-specific pages',
        'Use local testimonials and case studies'
      ],
      reviewManagement: [
        'Encourage customer reviews on Google',
        'Respond to all reviews professionally',
        'Display reviews on website',
        'Request reviews via email/SMS',
        'Monitor review platforms regularly'
      ]
    };
  }

  /**
   * Generate comprehensive optimization report
   */
  async generateOptimizationReport() {
    const report = `# 🔧 SEO Optimization Checklist

Generated: ${new Date().toLocaleString()}
Total Keywords Needing Optimization: ${this.needsOptimizationKeywords.length}

## 📊 Optimization Priority Distribution

${this.getOptimizationDistribution()}

## 🚨 URGENT OPTIMIZATIONS (Act Within 48 Hours)

${this.getUrgentOptimizations()}

## 🎯 HIGH PRIORITY OPTIMIZATIONS

${this.getHighPriorityOptimizations()}

## 📋 DETAILED OPTIMIZATION CHECKLISTS

${this.getDetailedChecklists()}

## 🛠️ BATCH OPTIMIZATION TASKS

${this.getBatchOptimizationTasks()}

---
*Generated by SEO Optimization Checklist Generator*
`;

    const reportFile = `${this.reportPath}seo-optimization-checklist.md`;
    fs.writeFileSync(reportFile, report);
    console.log('📋 Optimization checklist saved: seo-optimization-checklist.md');
  }

  /**
   * Get optimization distribution
   */
  getOptimizationDistribution() {
    const distribution = {
      urgent: this.needsOptimizationKeywords.filter(k => k.OptimizationPriority === 'URGENT').length,
      high: this.needsOptimizationKeywords.filter(k => k.OptimizationPriority === 'HIGH').length,
      medium: this.needsOptimizationKeywords.filter(k => k.OptimizationPriority === 'MEDIUM').length,
      low: this.needsOptimizationKeywords.filter(k => k.OptimizationPriority === 'LOW').length
    };

    return `- **🚨 Urgent:** ${distribution.urgent} keywords
- **🎯 High:** ${distribution.high} keywords  
- **📈 Medium:** ${distribution.medium} keywords
- **📋 Low:** ${distribution.low} keywords`;
  }

  /**
   * Get urgent optimizations
   */
  getUrgentOptimizations() {
    const urgent = this.needsOptimizationKeywords.filter(k => k.OptimizationPriority === 'URGENT');
    
    if (urgent.length === 0) return "*No urgent optimizations identified*";
    
    return urgent.map(k => 
      `### ⚠️ ${k.Keyword} (${k['Search Volume']} volume, Position ${k['Current Position'] || 'Not Ranking'})

**Current Issues:**
- Status: ${k['Optimization Status']}
- Trend: ${k.Trend}
- CTR: ${k.CTR}%

**🎯 Title Tag Fix:**
\`${k.TechnicalChecklist.titleTag.optimized}\`

**📝 Meta Description Fix:**
\`${k.TechnicalChecklist.metaDescription.optimized}\`

**🔧 Immediate Actions Required:**
1. Update title tag and meta description
2. Add H1 with keyword: "${k.TechnicalChecklist.headingStructure.h1}"
3. Implement schema markup: LocalBusiness + Service
4. Add 3-5 internal links with keyword anchor text
5. Optimize 2-3 images with ALT tags containing keyword

**⏰ Deadline: 48 hours**`
    ).join('\n\n');
  }

  /**
   * Get high priority optimizations
   */
  getHighPriorityOptimizations() {
    const high = this.needsOptimizationKeywords.filter(k => k.OptimizationPriority === 'HIGH');
    
    if (high.length === 0) return "*No high priority optimizations identified*";
    
    return high.slice(0, 10).map(k => 
      `- **${k.Keyword}** (${k['Search Volume']} vol, Pos ${k['Current Position'] || 'NR'})
  - Status: ${k['Optimization Status']} | Trend: ${k.Trend}
  - Target: ${k['Target URL']}
  - Priority Tasks: Title tag, meta description, H1 optimization, schema markup`
    ).join('\n\n');
  }

  /**
   * Get detailed checklists for top keywords
   */
  getDetailedChecklists() {
    const topKeywords = this.needsOptimizationKeywords
      .filter(k => k.OptimizationPriority === 'URGENT' || k.OptimizationPriority === 'HIGH')
      .slice(0, 5);
    
    return topKeywords.map(k => 
      `## 📋 ${k.Keyword} - Complete Optimization Checklist

**Page:** ${k['Target URL']} | **Volume:** ${k['Search Volume']} | **Priority:** ${k.OptimizationPriority}

### 🏷️ Title Tag & Meta Description
- [ ] **Title:** ${k.TechnicalChecklist.titleTag.optimized}
- [ ] **Meta:** ${k.TechnicalChecklist.metaDescription.optimized}
- [ ] Verify character limits (title <60, meta <160)
- [ ] Include primary keyword at beginning

### 📐 Heading Structure
- [ ] **H1:** ${k.TechnicalChecklist.headingStructure.h1}
${k.TechnicalChecklist.headingStructure.h2Structure.map(h2 => `- [ ] **H2:** ${h2}`).join('\n')}

### 📝 Content Optimization
- [ ] Word count: ${k.ContentChecklist.wordCount}
- [ ] Primary keyword density: ${k.ContentChecklist.keywordDensity}
- [ ] Include semantic keywords: ${k.ContentChecklist.semanticKeywords.slice(0, 5).join(', ')}
- [ ] Add FAQ section with these questions:
${k.ContentChecklist.faqSection.slice(0, 4).map(q => `  - ${q}`).join('\n')}

### 🖼️ Image Optimization
${k.TechnicalChecklist.imageOptimization.map(task => `- [ ] ${task}`).join('\n')}

### 🔗 Internal Linking
${k.ContentChecklist.internalLinking.map(task => `- [ ] ${task}`).join('\n')}

### 📱 Technical SEO
**Schema Markup:**
${k.TechnicalSEOChecklist.schemaMarkup.map(schema => `- [ ] ${schema}`).join('\n')}

**Page Speed:**
${k.TechnicalSEOChecklist.pageSpeed.slice(0, 3).map(task => `- [ ] ${task}`).join('\n')}

### 🌍 Local SEO
**Business Listings:**
${k.LocalSEOChecklist.businessListings.slice(0, 3).map(listing => `- [ ] ${listing}`).join('\n')}

### 📞 Call-to-Action
${k.ContentChecklist.callToAction.map(cta => `- [ ] ${cta}`).join('\n')}

**✅ Completion Deadline:** ${k.OptimizationPriority === 'URGENT' ? '48 hours' : '1 week'}`
    ).join('\n\n---\n\n');
  }

  /**
   * Get batch optimization tasks
   */
  getBatchOptimizationTasks() {
    return `### 🔄 Tasks You Can Do in Batches

**🏷️ Title Tag Batch Update:**
- Review all pages with "Needs Optimization" status
- Use template: "[Keyword] - CCI Services Tunisie | Devis Gratuit"
- Ensure all titles are under 60 characters
- Include primary keyword at the beginning

**📝 Meta Description Batch Update:**
- Template: "[Service] professionnel à Tunis. Devis gratuit en 24h. Service de qualité, prix transparents. Contactez CCI Services!"
- Keep between 150-160 characters
- Include clear call-to-action in each

**🖼️ Image Optimization Batch:**
- Rename all images with descriptive, keyword-rich names
- Add ALT tags to all images (include keywords naturally)
- Compress all images and convert to WebP format
- Implement lazy loading for better performance

**📄 Schema Markup Batch Implementation:**
- Add LocalBusiness schema to all pages
- Implement Service schema for each service page
- Add FAQ schema where applicable
- Set up Review schema for testimonials

**🔗 Internal Linking Audit:**
- Map out all service pages and blog posts
- Create keyword-rich anchor text list
- Add 2-3 internal links per page
- Ensure logical link flow between related pages`;
  }

  /**
   * Run complete analysis
   */
  async runAnalysis() {
    console.log('🚀 Starting SEO Optimization Checklist Generation...\n');

    try {
      await this.loadKeywords();
      this.analyzeOptimizationNeeds();
      await this.generateOptimizationReport();

      console.log('\n✅ Analysis complete!');
      console.log('\n📋 Files generated:');
      console.log('   📄 scripts/reports/seo-optimization-checklist.md');
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Start with URGENT priority keywords');
      console.log('2. Use the detailed checklists for each keyword');
      console.log('3. Complete batch tasks for efficiency');
      console.log('4. Monitor improvements after implementation');

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new OptimizationChecklistGenerator();
  generator.runAnalysis();
}

module.exports = OptimizationChecklistGenerator;