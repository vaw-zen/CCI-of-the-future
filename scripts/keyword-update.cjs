/**
 * Keyword Update Script for SEO Database
 * Updates keyword priorities, adds new keywords, and maintains database freshness
 */

require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

class KeywordUpdater {
  constructor() {
    this.csvPath = '../seo-keywords.csv';
    this.keywords = [];
    this.newKeywords = [];
    this.marketTrends = {
      'nettoyage': 1.2,
      'détachage': 1.15,
      'marbre': 1.0,
      'tapisserie': 0.95,
      'salon': 1.1,
      'prix': 1.25,
      'tunis': 1.3,
      'tunisie': 1.2,
      'urgent': 1.4
    };
  }

  /**
   * Load existing keywords from CSV
   */
  async loadKeywords() {
    console.log('📚 Loading existing keywords...');
    
    return new Promise((resolve, reject) => {
      const keywords = [];
      
      fs.createReadStream(this.csvPath)
        .pipe(csv())
        .on('data', (row) => {
          keywords.push(row);
        })
        .on('end', () => {
          this.keywords = keywords;
          console.log(`✅ Loaded ${keywords.length} existing keywords`);
          resolve(keywords);
        })
        .on('error', reject);
    });
  }

  /**
   * Update keyword priorities based on performance and trends
   */
  updatePriorities() {
    console.log('🎯 Updating keyword priorities...');

    let priorityUpdates = 0;

    this.keywords.forEach(keyword => {
      const oldPriority = keyword.Priority;
      const newPriority = this.calculateNewPriority(keyword);
      
      if (newPriority !== oldPriority) {
        keyword.Priority = newPriority;
        priorityUpdates++;
        console.log(`  📊 ${keyword.Keyword}: ${oldPriority} → ${newPriority}`);
      }
    });

    console.log(`✅ Updated priorities for ${priorityUpdates} keywords`);
    return priorityUpdates;
  }

  /**
   * Calculate new priority based on multiple factors
   */
  calculateNewPriority(keyword) {
    let score = 50; // Base score

    // Performance factors
    const clicks = parseInt(keyword.Clicks) || 0;
    const position = parseInt(keyword['Current Position']) || 50;
    const searchVolume = parseInt(keyword['Search Volume']) || 100;

    // Performance scoring
    if (clicks > 50) score += 30;
    else if (clicks > 20) score += 20;
    else if (clicks > 5) score += 10;

    if (position <= 3) score += 40;
    else if (position <= 10) score += 25;
    else if (position <= 20) score += 10;
    else if (position > 40) score -= 20;

    if (searchVolume > 500) score += 25;
    else if (searchVolume > 200) score += 15;
    else if (searchVolume > 100) score += 5;

    // Content optimization status
    if (keyword['Optimization Status'] === 'Optimized') score += 15;
    else if (keyword['Optimization Status'] === 'Not Optimized') score -= 10;

    // Search intent value
    if (keyword['Search Intent'] === 'Transactional') score += 20;
    else if (keyword['Search Intent'] === 'Commercial') score += 15;
    else if (keyword['Search Intent'] === 'Informational') score += 5;

    // Competition adjustment
    if (keyword.Competition === 'Low') score += 15;
    else if (keyword.Competition === 'High') score -= 10;

    // Market trend multiplier
    const trendMultiplier = this.getMarketTrendMultiplier(keyword.Keyword);
    score *= trendMultiplier;

    // Convert score to priority
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  }

  /**
   * Get market trend multiplier for keyword
   */
  getMarketTrendMultiplier(keywordText) {
    const lowercaseKeyword = keywordText.toLowerCase();
    let multiplier = 1.0;

    Object.keys(this.marketTrends).forEach(trend => {
      if (lowercaseKeyword.includes(trend)) {
        multiplier = Math.max(multiplier, this.marketTrends[trend]);
      }
    });

    return multiplier;
  }

  /**
   * Generate new keyword suggestions based on existing data
   */
  generateNewKeywords() {
    console.log('💡 Generating new keyword suggestions...');

    const newSuggestions = [];
    const existingKeywords = this.keywords.map(k => k.Keyword.toLowerCase());

    // Location variations
    const locations = ['tunis', 'sfax', 'sousse', 'monastir', 'bizerte', 'ariana'];
    
    // Service modifiers
    const modifiers = ['urgent', 'express', 'weekend', 'professionnel', 'pas cher', 'prix', 'tarif', 'devis'];
    
    // Base services
    const services = ['nettoyage', 'détachage', 'lavage', 'entretien'];

    // Material types
    const materials = ['marbre', 'tapisserie', 'tapis', 'salon', 'rideaux', 'matelas'];

    // Generate location + service combinations
    services.forEach(service => {
      locations.forEach(location => {
        const keyword = `${service} ${location}`;
        if (!existingKeywords.includes(keyword)) {
          newSuggestions.push(this.createKeywordEntry(keyword, 'Commercial', 'Medium'));
        }

        // Add modifier variations
        modifiers.forEach(modifier => {
          const modifiedKeyword = `${service} ${modifier} ${location}`;
          if (!existingKeywords.includes(modifiedKeyword)) {
            newSuggestions.push(this.createKeywordEntry(modifiedKeyword, 
              modifier.includes('prix') || modifier.includes('tarif') || modifier.includes('devis') ? 'Transactional' : 'Commercial', 
              'Medium'));
          }
        });
      });
    });

    // Generate material-specific keywords
    materials.forEach(material => {
      services.forEach(service => {
        const keyword = `${service} ${material}`;
        if (!existingKeywords.includes(keyword)) {
          newSuggestions.push(this.createKeywordEntry(keyword, 'Commercial', 'Medium'));
        }

        // Add Tunis location
        const locationKeyword = `${service} ${material} tunis`;
        if (!existingKeywords.includes(locationKeyword)) {
          newSuggestions.push(this.createKeywordEntry(locationKeyword, 'Commercial', 'High'));
        }
      });
    });

    // Filter to most promising suggestions (limit to 20)
    this.newKeywords = newSuggestions
      .sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.Priority] - priorityOrder[a.Priority];
      })
      .slice(0, 20);

    console.log(`✅ Generated ${this.newKeywords.length} new keyword suggestions`);
    return this.newKeywords;
  }

  /**
   * Create a new keyword entry with proper structure
   */
  createKeywordEntry(keyword, intent, priority) {
    return {
      'Category': this.inferCategory(keyword),
      'Keyword': keyword,
      'Search Intent': intent,
      'Competition': this.estimateCompetition(keyword),
      'Target URL': this.suggestTargetURL(keyword),
      'Optimization Status': 'Not Optimized',
      'Content Type': 'Article',
      'Priority': priority,
      'Clicks': '0',
      'Impressions': '0',
      'Current Position': '100',
      'CTR': '0.00',
      'Search Volume': this.estimateSearchVolume(keyword),
      'Trend': 'New',
      'Last Updated': new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Infer category from keyword
   */
  inferCategory(keyword) {
    const lowercaseKeyword = keyword.toLowerCase();
    
    if (lowercaseKeyword.includes('marbre')) return 'Marbre';
    if (lowercaseKeyword.includes('tapis')) return 'Tapis';
    if (lowercaseKeyword.includes('tapisserie')) return 'Tapisserie';
    if (lowercaseKeyword.includes('salon')) return 'Salon';
    if (lowercaseKeyword.includes('prix') || lowercaseKeyword.includes('tarif') || lowercaseKeyword.includes('devis')) return 'Prix';
    
    return 'Nettoyage';
  }

  /**
   * Estimate competition level
   */
  estimateCompetition(keyword) {
    const lowercaseKeyword = keyword.toLowerCase();
    
    // High competition indicators
    if (lowercaseKeyword.includes('prix') || lowercaseKeyword.includes('tarif')) return 'High';
    if (lowercaseKeyword.includes('tunis')) return 'Medium';
    if (lowercaseKeyword.includes('urgent') || lowercaseKeyword.includes('express')) return 'Low';
    
    return 'Medium';
  }

  /**
   * Suggest target URL for keyword
   */
  suggestTargetURL(keyword) {
    const lowercaseKeyword = keyword.toLowerCase();
    
    if (lowercaseKeyword.includes('marbre')) return '/marbre';
    if (lowercaseKeyword.includes('tapis')) return '/tapis';
    if (lowercaseKeyword.includes('tapisserie')) return '/tapisserie';
    if (lowercaseKeyword.includes('salon')) return '/salon';
    if (lowercaseKeyword.includes('devis')) return '/devis';
    if (lowercaseKeyword.includes('contact')) return '/contact';
    
    return '/services';
  }

  /**
   * Estimate search volume for new keyword
   */
  estimateSearchVolume(keyword) {
    const lowercaseKeyword = keyword.toLowerCase();
    let volume = 50;

    // Location multipliers
    if (lowercaseKeyword.includes('tunis')) volume *= 3;
    if (lowercaseKeyword.includes('sfax') || lowercaseKeyword.includes('sousse')) volume *= 2;

    // Intent multipliers
    if (lowercaseKeyword.includes('prix') || lowercaseKeyword.includes('tarif')) volume *= 2;
    if (lowercaseKeyword.includes('urgent')) volume *= 1.5;

    // Service multipliers
    if (lowercaseKeyword.includes('nettoyage')) volume *= 2;
    if (lowercaseKeyword.includes('marbre')) volume *= 1.5;

    return Math.floor(volume + Math.random() * 100);
  }

  /**
   * Analyze keyword gaps and opportunities
   */
  analyzeGaps() {
    console.log('🔍 Analyzing keyword gaps...');

    const analysis = {
      missingPriceKeywords: [],
      locationGaps: [],
      competitorKeywords: [],
      seasonalOpportunities: []
    };

    // Find missing price-related keywords
    const existingPriceKeywords = this.keywords.filter(k => 
      k.Keyword.toLowerCase().includes('prix') || 
      k.Keyword.toLowerCase().includes('tarif') ||
      k.Keyword.toLowerCase().includes('coût')
    );

    if (existingPriceKeywords.length < 10) {
      analysis.missingPriceKeywords = [
        'prix nettoyage tapis tunis',
        'tarif détachage salon',
        'coût nettoyage marbre',
        'devis nettoyage tapisserie',
        'prix lavage matelas tunis'
      ];
    }

    // Find location gaps
    const tunisKeywords = this.keywords.filter(k => k.Keyword.toLowerCase().includes('tunis'));
    const otherLocationKeywords = this.keywords.filter(k => 
      k.Keyword.toLowerCase().includes('sfax') ||
      k.Keyword.toLowerCase().includes('sousse') ||
      k.Keyword.toLowerCase().includes('monastir')
    );

    if (otherLocationKeywords.length < tunisKeywords.length * 0.3) {
      analysis.locationGaps = [
        'nettoyage tapis sfax',
        'détachage salon sousse',
        'nettoyage marbre monastir',
        'lavage tapisserie bizerte'
      ];
    }

    // Seasonal opportunities
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 5) { // Spring cleaning season
      analysis.seasonalOpportunities = [
        'nettoyage de printemps tunis',
        'grand ménage salon',
        'nettoyage post hiver',
        'rafraîchissement tapisserie'
      ];
    }

    console.log(`📊 Found ${analysis.missingPriceKeywords.length} price keyword gaps`);
    console.log(`📍 Found ${analysis.locationGaps.length} location gaps`);
    console.log(`🌱 Found ${analysis.seasonalOpportunities.length} seasonal opportunities`);

    return analysis;
  }

  /**
   * Save updated keyword database
   */
  async saveUpdatedKeywords() {
    console.log('💾 Saving updated keyword database...');

    // Combine existing and new keywords
    const allKeywords = [...this.keywords, ...this.newKeywords];

    const csvWriter = createObjectCsvWriter({
      path: this.csvPath,
      header: [
        { id: 'Category', title: 'Category' },
        { id: 'Keyword', title: 'Keyword' },
        { id: 'Search Intent', title: 'Search Intent' },
        { id: 'Competition', title: 'Competition' },
        { id: 'Target URL', title: 'Target URL' },
        { id: 'Optimization Status', title: 'Optimization Status' },
        { id: 'Content Type', title: 'Content Type' },
        { id: 'Priority', title: 'Priority' },
        { id: 'Clicks', title: 'Clicks' },
        { id: 'Impressions', title: 'Impressions' },
        { id: 'Current Position', title: 'Current Position' },
        { id: 'CTR', title: 'CTR' },
        { id: 'Search Volume', title: 'Search Volume' },
        { id: 'Trend', title: 'Trend' },
        { id: 'Last Updated', title: 'Last Updated' }
      ]
    });

    await csvWriter.writeRecords(allKeywords);
    console.log(`✅ Saved ${allKeywords.length} keywords to database`);
  }

  /**
   * Generate keyword update report
   */
  async generateUpdateReport() {
    const gaps = this.analyzeGaps();
    
    const report = `# 🔄 Keyword Database Update Report

Generated: ${new Date().toLocaleString()}

## Summary

- **Total Keywords:** ${this.keywords.length + this.newKeywords.length}
- **Existing Keywords:** ${this.keywords.length}
- **New Keywords Added:** ${this.newKeywords.length}
- **Priority Updates:** Based on performance and market trends

## 🆕 New Keywords Added

${this.newKeywords.map(k => 
  `- **${k.Keyword}** (${k.Priority} priority, ${k['Search Intent']})`
).join('\n')}

## 🎯 Priority Changes

Keywords have been re-prioritized based on:
- Current performance (clicks, position, CTR)
- Search volume potential
- Market trends and seasonality
- Competition levels
- Optimization status

## 📊 Gap Analysis

### Missing Price Keywords
${gaps.missingPriceKeywords.map(k => `- ${k}`).join('\n')}

### Location Expansion Opportunities
${gaps.locationGaps.map(k => `- ${k}`).join('\n')}

### Seasonal Opportunities
${gaps.seasonalOpportunities.map(k => `- ${k}`).join('\n')}

## 📈 Market Trends Applied

Current trend multipliers:
- **Nettoyage:** +20% (high demand)
- **Détachage:** +15% (specialized service)
- **Prix/Tarif:** +25% (commercial intent)
- **Tunis:** +30% (main market)
- **Urgent:** +40% (premium service)

## 🎯 Next Actions

### Immediate Content Creation
1. Target high-priority new keywords
2. Optimize existing medium-priority content
3. Create price-focused landing pages

### SEO Strategy
1. Focus on location-specific content
2. Develop seasonal content calendar
3. Target long-tail commercial keywords

### Performance Monitoring
1. Track new keyword rankings
2. Monitor competitor activities
3. Analyze seasonal performance patterns

---
*Keyword database updated at ${new Date().toISOString()}*
`;

    fs.writeFileSync('../keyword-update-report.md', report);
    console.log('📋 Update report saved: keyword-update-report.md');
    
    return gaps;
  }

  /**
   * Run complete keyword update workflow
   */
  async runUpdate() {
    console.log('🚀 Starting keyword database update...');

    try {
      await this.loadKeywords();
      
      const priorityUpdates = this.updatePriorities();
      this.generateNewKeywords();
      const gaps = await this.generateUpdateReport();
      await this.saveUpdatedKeywords();
      
      console.log('\n✅ Keyword update completed successfully!');
      console.log(`📊 Total keywords: ${this.keywords.length + this.newKeywords.length}`);
      console.log(`🔄 Priority updates: ${priorityUpdates}`);
      console.log(`🆕 New keywords: ${this.newKeywords.length}`);
      console.log(`🔍 Gap opportunities: ${gaps.missingPriceKeywords.length + gaps.locationGaps.length + gaps.seasonalOpportunities.length}`);
      
      return {
        totalKeywords: this.keywords.length + this.newKeywords.length,
        priorityUpdates,
        newKeywords: this.newKeywords.length,
        gaps
      };
      
    } catch (error) {
      console.error('❌ Keyword update failed:', error.message);
      throw error;
    }
  }
}

// CLI execution
async function main() {
  const updater = new KeywordUpdater();
  await updater.runUpdate();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { KeywordUpdater };