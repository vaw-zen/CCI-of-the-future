/**
 * SEO Indexing Verification Script
 * Verifies that articles are properly configured for search engine indexing
 */

const fs = require('fs');
const path = require('path');

class IndexingVerifier {
  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://cciservices.online';
    this.results = {
      articles: [],
      sitemaps: [],
      robots: null,
      issues: [],
      summary: {}
    };
  }

  /**
   * Verify articles are properly configured for indexing
   */
  verifyArticles() {
    console.log('🔍 Verifying articles configuration...');
    
    try {
      // Read articles file
      const articlesPath = path.join(__dirname, '..', 'src', 'app', 'conseils', 'data', 'articles.js');
      const articlesContent = fs.readFileSync(articlesPath, 'utf8');
      
      // Extract articles using regex
      const articleMatches = [...articlesContent.matchAll(/{\s*id:\s*(\d+),\s*slug:\s*['"`]([^'"`]+)['"`][\s\S]*?title:\s*['"`]([^'"`]+)['"`][\s\S]*?metaTitle:\s*['"`]([^'"`]+)['"`][\s\S]*?metaDescription:\s*['"`]([^'"`]+)['"`][\s\S]*?keywords:\s*\[(.*?)\]/g)];
      
      if (articleMatches.length === 0) {
        this.results.issues.push('❌ No articles found in articles.js');
        return;
      }
      
      console.log(`📋 Found ${articleMatches.length} articles to verify`);
      
      articleMatches.forEach(match => {
        const [, id, slug, title, metaTitle, metaDescription, keywordsStr] = match;
        
        const article = {
          id: parseInt(id),
          slug,
          title,
          metaTitle,
          metaDescription,
          keywords: keywordsStr.match(/"([^"]+)"/g)?.map(k => k.replace(/"/g, '')) || [],
          url: `${this.siteUrl}/conseils/${slug}`,
          issues: []
        };
        
        // Verify SEO requirements
        if (!metaTitle || metaTitle.length < 30 || metaTitle.length > 60) {
          article.issues.push(`Meta title length: ${metaTitle?.length || 0} (should be 30-60)`);
        }
        
        if (!metaDescription || metaDescription.length < 120 || metaDescription.length > 160) {
          article.issues.push(`Meta description length: ${metaDescription?.length || 0} (should be 120-160)`);
        }
        
        if (!article.keywords || article.keywords.length === 0) {
          article.issues.push('No keywords defined');
        }
        
        if (!slug || slug.length < 3) {
          article.issues.push('Invalid or too short slug');
        }
        
        article.status = article.issues.length === 0 ? '✅' : '⚠️';
        this.results.articles.push(article);
      });
      
      console.log(`✅ Verified ${this.results.articles.length} articles`);
    } catch (error) {
      this.results.issues.push(`❌ Error reading articles: ${error.message}`);
    }
  }

  /**
   * Verify sitemap files exist and are accessible
   */
  verifySitemaps() {
    console.log('🗺️  Verifying sitemaps...');
    
    const sitemapFiles = [
      'src/app/sitemap.xml/route.js',
      'src/app/articles-sitemap.xml/route.js',
      'src/app/sitemap-index.xml/route.js',
      'src/app/posts-sitemap.xml/route.js'
    ];
    
    sitemapFiles.forEach(sitemapPath => {
      const fullPath = path.join(__dirname, '..', sitemapPath);
      const exists = fs.existsSync(fullPath);
      
      const sitemap = {
        file: sitemapPath,
        exists,
        url: `${this.siteUrl}/${path.basename(path.dirname(sitemapPath))}`,
        status: exists ? '✅' : '❌'
      };
      
      if (exists) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          sitemap.hasArticles = content.includes('conseils/') || content.includes('articles');
          if (sitemapPath.includes('articles-sitemap') && !sitemap.hasArticles) {
            sitemap.status = '⚠️';
            sitemap.issues = ['Articles sitemap may not include articles correctly'];
          }
        } catch (error) {
          sitemap.issues = [`Error reading file: ${error.message}`];
          sitemap.status = '⚠️';
        }
      }
      
      this.results.sitemaps.push(sitemap);
    });
  }

  /**
   * Verify robots.txt configuration
   */
  verifyRobots() {
    console.log('🤖 Verifying robots.txt...');
    
    const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
    
    if (!fs.existsSync(robotsPath)) {
      this.results.robots = {
        exists: false,
        status: '❌',
        issues: ['robots.txt file not found']
      };
      return;
    }
    
    try {
      const content = fs.readFileSync(robotsPath, 'utf8');
      
      this.results.robots = {
        exists: true,
        content,
        hasSitemaps: content.includes('Sitemap:'),
        hasArticlesSitemap: content.includes('articles-sitemap.xml'),
        allowsCrawling: content.includes('Allow: /') || !content.includes('Disallow: /'),
        status: '✅',
        issues: []
      };
      
      if (!this.results.robots.hasSitemaps) {
        this.results.robots.issues.push('No sitemap references found');
        this.results.robots.status = '⚠️';
      }
      
      if (!this.results.robots.hasArticlesSitemap) {
        this.results.robots.issues.push('Articles sitemap not referenced');
        this.results.robots.status = '⚠️';
      }
      
      if (!this.results.robots.allowsCrawling) {
        this.results.robots.issues.push('May be blocking crawlers');
        this.results.robots.status = '⚠️';
      }
      
    } catch (error) {
      this.results.robots = {
        exists: true,
        status: '❌',
        issues: [`Error reading robots.txt: ${error.message}`]
      };
    }
  }

  /**
   * Check if article page template has proper SEO configuration
   */
  verifyArticleTemplate() {
    console.log('📄 Verifying article page template...');
    
    const templatePath = path.join(__dirname, '..', 'src', 'app', 'conseils', '[slug]', 'page.jsx');
    
    if (!fs.existsSync(templatePath)) {
      this.results.issues.push('❌ Article page template not found');
      return;
    }
    
    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      
      const template = {
        hasMetadata: content.includes('generateMetadata'),
        hasOpenGraph: content.includes('openGraph'),
        hasTwitterCards: content.includes('twitter'),
        hasStructuredData: content.includes('application/ld+json'),
        hasCanonical: content.includes('canonical'),
        hasStaticGeneration: content.includes('generateStaticParams'),
        status: '✅',
        issues: []
      };
      
      // Check for required SEO elements
      const requiredElements = [
        { key: 'hasMetadata', name: 'generateMetadata function' },
        { key: 'hasOpenGraph', name: 'Open Graph tags' },
        { key: 'hasStructuredData', name: 'Structured data (JSON-LD)' },
        { key: 'hasStaticGeneration', name: 'Static generation' }
      ];
      
      requiredElements.forEach(element => {
        if (!template[element.key]) {
          template.issues.push(`Missing ${element.name}`);
          template.status = '⚠️';
        }
      });
      
      this.results.articleTemplate = template;
      
    } catch (error) {
      this.results.issues.push(`❌ Error reading article template: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 Generating indexing verification report...');
    
    // Calculate summary statistics
    const totalArticles = this.results.articles.length;
    const articlesWithIssues = this.results.articles.filter(a => a.issues.length > 0).length;
    const perfectArticles = totalArticles - articlesWithIssues;
    
    const sitemapsOk = this.results.sitemaps.filter(s => s.status === '✅').length;
    const sitemapsTotal = this.results.sitemaps.length;
    
    this.results.summary = {
      totalArticles,
      perfectArticles,
      articlesWithIssues,
      sitemapsOk,
      sitemapsTotal,
      robotsOk: this.results.robots?.status === '✅',
      templateOk: this.results.articleTemplate?.status === '✅',
      overallStatus: this.calculateOverallStatus()
    };
    
    // Generate report
    const report = this.formatReport();
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'indexing-verification-report.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`✅ Report saved to: ${reportPath}`);
    
    return this.results;
  }

  /**
   * Calculate overall indexing status
   */
  calculateOverallStatus() {
    const issues = this.results.issues.length;
    const articlesWithIssues = this.results.articles.filter(a => a.issues.length > 0).length;
    const sitemapIssues = this.results.sitemaps.filter(s => s.status !== '✅').length;
    const robotsIssues = this.results.robots?.status !== '✅' ? 1 : 0;
    
    const totalIssues = issues + articlesWithIssues + sitemapIssues + robotsIssues;
    
    if (totalIssues === 0) return '✅ Excellent';
    if (totalIssues <= 3) return '⚠️ Good with minor issues';
    return '❌ Needs attention';
  }

  /**
   * Format the verification report
   */
  formatReport() {
    const summary = this.results.summary;
    
    return `# 🔍 SEO Indexing Verification Report
Generated: ${new Date().toLocaleString()}

## 📊 Summary

**Overall Status:** ${summary.overallStatus}

### Articles Status
- **Total Articles:** ${summary.totalArticles}
- **Perfect SEO:** ${summary.perfectArticles} ✅
- **Need Attention:** ${summary.articlesWithIssues} ⚠️

### Technical Infrastructure
- **Sitemaps:** ${summary.sitemapsOk}/${summary.sitemapsTotal} ${summary.sitemapsOk === summary.sitemapsTotal ? '✅' : '⚠️'}
- **Robots.txt:** ${summary.robotsOk ? '✅' : '⚠️'}
- **Article Template:** ${summary.templateOk ? '✅' : '⚠️'}

## 📝 Articles Analysis

${this.results.articles.map(article => `
### ${article.status} Article #${article.id}: ${article.title}
- **URL:** ${article.url}
- **Slug:** ${article.slug}
- **Meta Title:** ${article.metaTitle} (${article.metaTitle?.length || 0} chars)
- **Meta Description:** ${article.metaDescription?.substring(0, 100)}... (${article.metaDescription?.length || 0} chars)
- **Keywords:** ${article.keywords.join(', ')}
${article.issues.length > 0 ? `- **Issues:**\n${article.issues.map(issue => `  - ${issue}`).join('\n')}` : '- **Status:** Perfect SEO configuration ✅'}
`).join('')}

## 🗺️ Sitemaps Status

${this.results.sitemaps.map(sitemap => `
### ${sitemap.status} ${sitemap.file}
- **URL:** ${sitemap.url}
- **Exists:** ${sitemap.exists ? '✅' : '❌'}
${sitemap.hasArticles !== undefined ? `- **Includes Articles:** ${sitemap.hasArticles ? '✅' : '❌'}` : ''}
${sitemap.issues ? `- **Issues:** ${sitemap.issues.join(', ')}` : ''}
`).join('')}

## 🤖 Robots.txt Analysis

**Status:** ${this.results.robots?.status || '❌'}
**Exists:** ${this.results.robots?.exists ? '✅' : '❌'}
${this.results.robots?.hasSitemaps ? '**Has Sitemaps:** ✅' : '**Has Sitemaps:** ❌'}
${this.results.robots?.hasArticlesSitemap ? '**References Articles Sitemap:** ✅' : '**References Articles Sitemap:** ❌'}
${this.results.robots?.allowsCrawling ? '**Allows Crawling:** ✅' : '**Allows Crawling:** ❌'}

${this.results.robots?.issues?.length > 0 ? `**Issues:**
${this.results.robots.issues.map(issue => `- ${issue}`).join('\n')}` : ''}

## 📄 Article Template Configuration

**Status:** ${this.results.articleTemplate?.status || '❌'}

${this.results.articleTemplate ? `
- **Metadata Generation:** ${this.results.articleTemplate.hasMetadata ? '✅' : '❌'}
- **Open Graph Tags:** ${this.results.articleTemplate.hasOpenGraph ? '✅' : '❌'}
- **Twitter Cards:** ${this.results.articleTemplate.hasTwitterCards ? '✅' : '❌'}
- **Structured Data:** ${this.results.articleTemplate.hasStructuredData ? '✅' : '❌'}
- **Canonical URLs:** ${this.results.articleTemplate.hasCanonical ? '✅' : '❌'}
- **Static Generation:** ${this.results.articleTemplate.hasStaticGeneration ? '✅' : '❌'}

${this.results.articleTemplate.issues?.length > 0 ? `**Issues:**
${this.results.articleTemplate.issues.map(issue => `- ${issue}`).join('\n')}` : ''}
` : 'Template not found or could not be analyzed'}

## 🚀 Indexing Recommendations

### Immediate Actions
${summary.articlesWithIssues > 0 ? `1. **Fix Article SEO Issues:** ${summary.articlesWithIssues} articles need attention` : ''}
${!summary.robotsOk ? '2. **Update robots.txt:** Ensure all sitemaps are referenced' : ''}
${summary.sitemapsOk < summary.sitemapsTotal ? '3. **Fix Sitemap Issues:** Some sitemaps have problems' : ''}

### Best Practices
1. **Submit to Google Search Console:** Use the URL submission tool for new articles
2. **Monitor Index Status:** Check Google Search Console for indexing issues
3. **Update Sitemaps Regularly:** Ensure new articles appear in sitemaps quickly
4. **Test Page Speed:** Fast-loading pages get indexed faster

### Automation Status
- **Sitemap Generation:** ${this.results.sitemaps.some(s => s.exists) ? 'Automated ✅' : 'Manual ❌'}
- **URL Submission:** ${fs.existsSync(path.join(__dirname, 'submit-urls-indexing.cjs')) ? 'Available ✅' : 'Not configured ❌'}
- **SEO Verification:** Available ✅

---
Generated by CCI Services SEO Automation System
`;
  }

  /**
   * Run complete verification
   */
  async runVerification() {
    console.log('🔍 Starting comprehensive indexing verification...\n');
    
    this.verifyArticles();
    this.verifySitemaps();
    this.verifyRobots();
    this.verifyArticleTemplate();
    
    const results = this.generateReport();
    
    console.log('\n📋 Verification Summary:');
    console.log(`Overall Status: ${results.summary.overallStatus}`);
    console.log(`Articles: ${results.summary.perfectArticles}/${results.summary.totalArticles} perfect`);
    console.log(`Sitemaps: ${results.summary.sitemapsOk}/${results.summary.sitemapsTotal} working`);
    console.log(`Infrastructure: ${results.summary.robotsOk && results.summary.templateOk ? 'All good ✅' : 'Issues found ⚠️'}`);
    
    return results;
  }
}

// CLI Usage
async function main() {
  const verifier = new IndexingVerifier();
  
  try {
    await verifier.runVerification();
    console.log('\n✅ Indexing verification completed!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = IndexingVerifier;