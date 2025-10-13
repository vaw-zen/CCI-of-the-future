/**
 * Main SEO Automation Orchestrator
 * Coordinates all SEO automation tasks
 */

import { SEOKeywordManager, ContentGenerator } from './seo-automation.js';
import { GSCTracker, PerformanceBasedContentCreator } from './gsc-tracker.js';
import { AIContentGenerator, ContentCreationWorkflow } from './ai-content-generator.js';
import fs from 'fs';
import path from 'path';

class SEOOrchestrator {
  constructor() {
    this.keywordManager = new SEOKeywordManager('./seo-keywords.csv');
    this.gscTracker = new GSCTracker('./gsc-credentials.json', process.env.SITE_URL);
    this.aiGenerator = new AIContentGenerator(process.env.GEMINI_API_KEY);
    this.results = {
      keywords_analyzed: 0,
      content_generated: 0,
      pages_optimized: 0,
      errors: []
    };
  }

  /**
   * Full SEO analysis and optimization workflow
   */
  async runFullAnalysis() {
    console.log('🚀 Starting full SEO analysis workflow...');

    try {
      // Step 1: Load and analyze keywords
      await this.keywordManager.loadKeywords();
      const clusters = this.keywordManager.clusterKeywords();
      const gaps = this.keywordManager.identifyContentGaps();
      
      console.log(`📊 Loaded ${this.keywordManager.keywords.length} keywords`);
      console.log(`🔗 Created ${clusters.size} keyword clusters`);
      console.log(`❌ Found ${gaps.length} content gaps`);

      this.results.keywords_analyzed = this.keywordManager.keywords.length;

      // Step 2: Track performance with GSC
      await this.trackPerformance();

      // Step 3: Generate missing content
      await this.generateMissingContent(gaps);

      // Step 4: Optimize existing content
      await this.optimizeExistingContent();

      // Step 5: Generate internal linking suggestions
      const linkSuggestions = this.keywordManager.generateInternalLinks();
      await this.saveResults('internal-links.json', linkSuggestions);

      // Step 6: Generate SEO report
      await this.generateSEOReport();

      console.log('✅ Full SEO analysis completed successfully');

    } catch (error) {
      console.error('❌ Error in full analysis:', error);
      this.results.errors.push(error.message);
    }
  }

  /**
   * Track keyword performance
   */
  async trackPerformance() {
    console.log('📈 Tracking keyword performance...');

    try {
      await this.gscTracker.initialize();
      
      const keywords = this.keywordManager.keywords
        .map(k => k.Keyword)
        .filter(k => k && k.length > 0)
        .slice(0, 50); // Limit for API

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const performance = await this.gscTracker.getKeywordPerformance(keywords, startDate, endDate);
      const updatedData = await this.gscTracker.updateKeywordCSV('./seo-keywords.csv', performance);
      
      console.log(`📊 Updated performance data for ${updatedData.length} keywords`);

      return updatedData;
    } catch (error) {
      console.error('Error tracking performance:', error);
      this.results.errors.push(`Performance tracking: ${error.message}`);
    }
  }

  /**
   * Generate content for identified gaps
   */
  async generateMissingContent(gaps) {
    console.log('✍️  Generating missing content...');

    try {
      const workflow = new ContentCreationWorkflow(this.aiGenerator, this.keywordManager);
      
      // Focus on high-priority gaps first
      const highPriorityGaps = gaps
        .filter(g => g.Priority === 'High' || g['Search Intent'] === 'Transactional')
        .slice(0, 5); // Limit to avoid API overuse

      if (highPriorityGaps.length === 0) {
        console.log('No high-priority content gaps found');
        return;
      }

      const results = await workflow.processContentGaps(highPriorityGaps);
      
      const successful = results.filter(r => r.status === 'generated');
      this.results.content_generated = successful.length;

      console.log(`✅ Generated ${successful.length} new content pieces`);

      return results;
    } catch (error) {
      console.error('Error generating content:', error);
      this.results.errors.push(`Content generation: ${error.message}`);
    }
  }

  /**
   * Optimize existing content based on performance data
   */
  async optimizeExistingContent() {
    console.log('🔧 Optimizing existing content...');

    try {
      // Find pages that need optimization
      const underperformers = this.keywordManager.keywords.filter(k => 
        k['Target URL'] && 
        k['Current Position'] > 10 && 
        k['Search Volume'] > 100
      );

      console.log(`Found ${underperformers.length} pages needing optimization`);

      const optimizations = [];

      for (const keyword of underperformers.slice(0, 3)) { // Limit processing
        try {
          // Read existing content
          const pagePath = this.resolvePagePath(keyword['Target URL']);
          if (!fs.existsSync(pagePath)) continue;

          const currentContent = fs.readFileSync(pagePath, 'utf8');
          
          // Generate optimization suggestions
          const optimized = await this.aiGenerator.optimizeExistingContent(
            currentContent,
            keyword.Keyword,
            ['low keyword density', 'missing internal links']
          );

          if (optimized) {
            optimizations.push({
              url: keyword['Target URL'],
              keyword: keyword.Keyword,
              suggestions: optimized,
              priority: keyword.Priority
            });
          }

        } catch (error) {
          console.error(`Error optimizing ${keyword['Target URL']}:`, error);
        }
      }

      await this.saveResults('optimization-suggestions.json', optimizations);
      this.results.pages_optimized = optimizations.length;

      console.log(`✅ Generated optimization suggestions for ${optimizations.length} pages`);

    } catch (error) {
      console.error('Error in content optimization:', error);
      this.results.errors.push(`Content optimization: ${error.message}`);
    }
  }

  /**
   * Resolve page file path from URL
   */
  resolvePagePath(url) {
    // Convert URL to file path based on Next.js structure
    const cleanUrl = url.replace(/^\//, '').replace(/\/$/, '');
    
    if (!cleanUrl) return './src/app/page.jsx';
    
    const possiblePaths = [
      `./src/app/${cleanUrl}/page.jsx`,
      `./src/app/${cleanUrl}.jsx`,
      `./content/blog/${cleanUrl}.md`,
      `./generated-content/pages/${cleanUrl}.jsx`
    ];

    return possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  }

  /**
   * Generate comprehensive SEO report
   */
  async generateSEOReport() {
    console.log('📋 Generating SEO report...');

    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_keywords: this.results.keywords_analyzed,
        content_pieces_generated: this.results.content_generated,
        pages_optimized: this.results.pages_optimized,
        errors_count: this.results.errors.length
      },
      keyword_clusters: Array.from(this.keywordManager.clusters.entries()).map(([name, keywords]) => ({
        cluster: name,
        keyword_count: keywords.length,
        top_keywords: keywords.slice(0, 5).map(k => k.Keyword)
      })),
      content_gaps: this.keywordManager.identifyContentGaps().map(gap => ({
        keyword: gap.Keyword,
        search_intent: gap['Search Intent'],
        priority: gap.Priority,
        suggested_content_type: gap['Content Type']
      })),
      performance_insights: {
        top_performing: this.keywordManager.keywords
          .filter(k => k.Clicks > 0)
          .sort((a, b) => b.Clicks - a.Clicks)
          .slice(0, 10)
          .map(k => ({
            keyword: k.Keyword,
            clicks: k.Clicks,
            position: k['Current Position'],
            ctr: k.CTR
          })),
        improvement_opportunities: this.keywordManager.keywords
          .filter(k => k['Current Position'] > 10 && k['Search Volume'] > 100)
          .sort((a, b) => b['Search Volume'] - a['Search Volume'])
          .slice(0, 10)
          .map(k => ({
            keyword: k.Keyword,
            position: k['Current Position'],
            search_volume: k['Search Volume'],
            opportunity_score: this.calculateOpportunityScore(k)
          }))
      },
      errors: this.results.errors,
      next_actions: this.generateNextActions()
    };

    // Save as JSON
    await this.saveResults('seo-report.json', report);

    // Generate markdown report for GitHub
    const markdownReport = this.generateMarkdownReport(report);
    fs.writeFileSync('./seo-report.md', markdownReport);

    // Set GitHub Actions outputs
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=keywords_count::${report.summary.total_keywords}`);
      console.log(`::set-output name=content_count::${report.summary.content_pieces_generated}`);
      console.log(`::set-output name=content_summary::Generated ${report.summary.content_pieces_generated} content pieces for high-priority keywords`);
    }

    console.log('✅ SEO report generated successfully');
    return report;
  }

  /**
   * Calculate opportunity score for keyword optimization
   */
  calculateOpportunityScore(keyword) {
    const volume = parseInt(keyword['Search Volume']) || 0;
    const position = parseInt(keyword['Current Position']) || 100;
    const priority = keyword.Priority === 'High' ? 3 : keyword.Priority === 'Medium' ? 2 : 1;

    // Higher volume, better position, higher priority = higher score
    return Math.round((volume / 100) * (50 / Math.max(position, 1)) * priority);
  }

  /**
   * Generate actionable next steps
   */
  generateNextActions() {
    const actions = [];

    // Content creation actions
    const gaps = this.keywordManager.identifyContentGaps();
    if (gaps.length > 0) {
      actions.push({
        action: 'Create missing content',
        priority: 'High',
        keywords: gaps.filter(g => g.Priority === 'High').slice(0, 5).map(g => g.Keyword),
        estimated_impact: 'High'
      });
    }

    // Optimization actions
    const underperformers = this.keywordManager.keywords.filter(k => 
      k['Current Position'] > 20 && k.Priority === 'High'
    );
    if (underperformers.length > 0) {
      actions.push({
        action: 'Optimize underperforming pages',
        priority: 'Medium',
        pages: underperformers.slice(0, 5).map(k => k['Target URL']),
        estimated_impact: 'Medium'
      });
    }

    // Technical SEO actions
    actions.push({
      action: 'Implement generated internal links',
      priority: 'Medium',
      estimated_impact: 'Medium'
    });

    return actions;
  }

  /**
   * Generate markdown report for GitHub
   */
  generateMarkdownReport(report) {
    return `# 📊 SEO Automation Report

Generated: ${new Date(report.generated_at).toLocaleString()}

## Summary

- **Keywords Analyzed:** ${report.summary.total_keywords}
- **Content Generated:** ${report.summary.content_pieces_generated} pieces
- **Pages Optimized:** ${report.summary.pages_optimized}
- **Errors:** ${report.summary.errors_count}

## 🎯 Top Performing Keywords

${report.performance_insights.top_performing.map(k => 
  `- **${k.keyword}:** ${k.clicks} clicks, position ${k.position}, CTR ${k.ctr}%`
).join('\n')}

## 🚀 Improvement Opportunities

${report.performance_insights.improvement_opportunities.map(k => 
  `- **${k.keyword}:** Position ${k.position}, Volume ${k.search_volume}, Score ${k.opportunity_score}`
).join('\n')}

## 📝 Content Gaps

${report.content_gaps.slice(0, 10).map(gap => 
  `- **${gap.keyword}** (${gap.search_intent}) - ${gap.priority} priority`
).join('\n')}

## 🔧 Next Actions

${report.next_actions.map(action => 
  `### ${action.action} (${action.priority} Priority)
  
Expected Impact: ${action.estimated_impact}

${action.keywords ? `Keywords: ${action.keywords.join(', ')}` : ''}
${action.pages ? `Pages: ${action.pages.join(', ')}` : ''}

`).join('\n')}

${report.errors.length > 0 ? `## ⚠️ Errors

${report.errors.map(error => `- ${error}`).join('\n')}` : ''}
`;
  }

  /**
   * Save results to file
   */
  async saveResults(filename, data) {
    const dir = './seo-results';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
}

// Main execution
async function main() {
  const actionType = process.env.ACTION_TYPE || 'full_analysis';
  const orchestrator = new SEOOrchestrator();

  try {
    switch (actionType) {
      case 'full_analysis':
        await orchestrator.runFullAnalysis();
        break;
      case 'content_generation':
        await orchestrator.keywordManager.loadKeywords();
        const gaps = orchestrator.keywordManager.identifyContentGaps();
        await orchestrator.generateMissingContent(gaps);
        await orchestrator.generateSEOReport();
        break;
      case 'performance_tracking':
        await orchestrator.trackPerformance();
        await orchestrator.generateSEOReport();
        break;
      case 'keyword_update':
        await orchestrator.keywordManager.loadKeywords();
        await orchestrator.keywordManager.clusterKeywords();
        await orchestrator.generateSEOReport();
        break;
      default:
        console.log('Unknown action type:', actionType);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SEOOrchestrator };