/**
 * Google Search Console API Integration
 * Tracks keyword performance and updates CSV automatically
 */

import { google } from 'googleapis';
import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

class GSCTracker {
  constructor(credentialsPath, siteUrl) {
    this.credentialsPath = credentialsPath;
    this.siteUrl = siteUrl;
    this.searchconsole = null;
  }

  /**
   * Initialize Google Search Console API
   */
  async initialize() {
    const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    this.searchconsole = google.searchconsole({ version: 'v1', auth });
  }

  /**
   * Get keyword performance data
   */
  async getKeywordPerformance(keywords, startDate, endDate) {
    const results = [];

    // Process keywords in batches to avoid API limits
    const batchSize = 20;
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      
      try {
        const response = await this.searchconsole.searchanalytics.query({
          siteUrl: this.siteUrl,
          requestBody: {
            startDate,
            endDate,
            dimensions: ['query', 'page'],
            dimensionFilterGroups: [{
              filters: batch.map(keyword => ({
                dimension: 'query',
                operator: 'contains',
                expression: keyword
              }))
            }],
            rowLimit: 1000
          }
        });

        if (response.data.rows) {
          results.push(...response.data.rows);
        }
      } catch (error) {
        console.error('GSC API Error:', error.message);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Update CSV with performance data
   */
  async updateKeywordCSV(csvPath, performanceData) {
    const keywords = [];
    
    // Load existing CSV
    await new Promise((resolve) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => keywords.push(data))
        .on('end', resolve);
    });

    // Enrich with performance data
    const enrichedKeywords = keywords.map(row => {
      const matches = performanceData.filter(perf => 
        perf.keys[0].toLowerCase().includes(row.Keyword?.toLowerCase())
      );

      if (matches.length > 0) {
        const totalClicks = matches.reduce((sum, match) => sum + (match.clicks || 0), 0);
        const totalImpressions = matches.reduce((sum, match) => sum + (match.impressions || 0), 0);
        const avgPosition = matches.reduce((sum, match) => sum + (match.position || 0), 0) / matches.length;
        const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        return {
          ...row,
          'Search Volume': totalImpressions,
          'Current Position': Math.round(avgPosition * 10) / 10,
          'Clicks': totalClicks,
          'CTR': Math.round(avgCTR * 100) / 100,
          'Last Updated': new Date().toISOString().split('T')[0]
        };
      }

      return {
        ...row,
        'Last Updated': new Date().toISOString().split('T')[0]
      };
    });

    // Write updated CSV
    const csvWriter = createObjectCsvWriter({
      path: csvPath.replace('.csv', '_tracked.csv'),
      header: [
        { id: 'Category', title: 'Category' },
        { id: 'Keyword', title: 'Keyword' },
        { id: 'Search Intent', title: 'Search Intent' },
        { id: 'Competition', title: 'Competition' },
        { id: 'Target URL', title: 'Target URL' },
        { id: 'Optimization Status', title: 'Optimization Status' },
        { id: 'Content Type', title: 'Content Type' },
        { id: 'Priority', title: 'Priority' },
        { id: 'Search Volume', title: 'Search Volume' },
        { id: 'Current Position', title: 'Current Position' },
        { id: 'Clicks', title: 'Clicks' },
        { id: 'CTR', title: 'CTR' },
        { id: 'Last Updated', title: 'Last Updated' }
      ]
    });

    await csvWriter.writeRecords(enrichedKeywords);
    return enrichedKeywords;
  }

  /**
   * Generate performance report
   */
  generateReport(data) {
    const report = {
      totalKeywords: data.length,
      keywordsWithTraffic: data.filter(k => k.Clicks > 0).length,
      topPerformers: data
        .filter(k => k.Clicks > 0)
        .sort((a, b) => b.Clicks - a.Clicks)
        .slice(0, 10),
      improvementOpportunities: data
        .filter(k => k['Current Position'] > 10 && k['Search Volume'] > 100)
        .sort((a, b) => b['Search Volume'] - a['Search Volume'])
        .slice(0, 10),
      contentGaps: data.filter(k => k['Optimization Status'] === 'New Content')
    };

    return report;
  }
}

/**
 * Automated Content Creation Based on Performance
 */
class PerformanceBasedContentCreator {
  constructor(gscTracker) {
    this.gscTracker = gscTracker;
  }

  /**
   * Identify content opportunities
   */
  identifyOpportunities(data) {
    return {
      // Keywords ranking 11-20 (easy to improve)
      quickWins: data.filter(k => 
        k['Current Position'] >= 11 && 
        k['Current Position'] <= 20 && 
        k['Search Volume'] > 50
      ),

      // High volume keywords with no content
      missingContent: data.filter(k => 
        !k['Target URL'] && 
        k['Search Volume'] > 100
      ),

      // Underperforming high-priority keywords
      underperforming: data.filter(k => 
        k.Priority === 'High' && 
        k['Current Position'] > 20
      )
    };
  }

  /**
   * Generate action plan
   */
  generateActionPlan(opportunities) {
    const actions = [];

    // Quick wins - improve existing content
    opportunities.quickWins.forEach(keyword => {
      actions.push({
        type: 'optimize_existing',
        keyword: keyword.Keyword,
        currentPage: keyword['Target URL'],
        action: 'Add more semantic keywords, improve internal linking',
        priority: 'High',
        estimatedImpact: 'Medium'
      });
    });

    // Missing content - create new pages
    opportunities.missingContent.forEach(keyword => {
      actions.push({
        type: 'create_content',
        keyword: keyword.Keyword,
        contentType: keyword['Search Intent'] === 'Informational' ? 'Blog Post' : 'Service Page',
        action: 'Create comprehensive content',
        priority: 'High',
        estimatedImpact: 'High'
      });
    });

    // Underperforming - major optimization
    opportunities.underperforming.forEach(keyword => {
      actions.push({
        type: 'major_optimization',
        keyword: keyword.Keyword,
        currentPage: keyword['Target URL'],
        action: 'Complete page overhaul, technical SEO audit',
        priority: 'Medium',
        estimatedImpact: 'High'
      });
    });

    return actions;
  }
}

export { GSCTracker, PerformanceBasedContentCreator };

// Usage example:
async function trackKeywords() {
  const tracker = new GSCTracker('./scripts/credentials/gsc-credentials.json', 'https://cciservices.online');
  await tracker.initialize();

  const keywords = ['nettoyage tapis tunis', 'restauration marbre', 'CCI tunisie'];
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const performance = await tracker.getKeywordPerformance(keywords, startDate, endDate);
  const updatedCSV = await tracker.updateKeywordCSV('./scripts/data/seo-keywords.csv', performance);
  const report = tracker.generateReport(updatedCSV);

  console.log('Performance Report:', JSON.stringify(report, null, 2));

  const creator = new PerformanceBasedContentCreator(tracker);
  const opportunities = creator.identifyOpportunities(updatedCSV);
  const actionPlan = creator.generateActionPlan(opportunities);

  console.log('Action Plan:', JSON.stringify(actionPlan, null, 2));
}

// Execute main function if script is run directly
if (process.argv[1] && process.argv[1].endsWith('gsc-tracker.js')) {
  trackKeywords().catch(console.error);
}