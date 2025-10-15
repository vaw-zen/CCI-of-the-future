# 🔍 SEO Automation Workflow

## Overview
Comprehensive SEO automation system that handles keyword research, content optimization, performance tracking, and Google Search Console integration. This workflow ensures your website maintains optimal search engine visibility and ranking performance.

## 📁 Scripts in this Folder

### `keyword-update.cjs`
**Intelligent keyword database management and optimization.**

- **Purpose**: Maintain and update SEO keyword database with market trends
- **Features**:
  - Market trend analysis and keyword scoring
  - Priority-based keyword ranking
  - New keyword discovery and integration
  - CSV database management
  - Performance-based keyword weighting

### `simple-seo-analysis.cjs`
**Core SEO analysis and reporting engine.**

- **Purpose**: Run comprehensive SEO analysis across the website
- **Features**:
  - Keyword density analysis
  - Content optimization recommendations
  - Performance metrics calculation
  - GitHub Actions compatible reporting
  - Error tracking and validation

### `seo-content-automation.cjs`
**AI-powered content generation for SEO optimization.**

- **Purpose**: Generate SEO-optimized content using keyword database
- **Features**:
  - AI-driven content creation
  - Keyword-focused article generation
  - Meta description optimization
  - Content structure optimization
  - Multi-language support (French/Arabic)

### `performance-tracking.cjs`
**SEO performance monitoring and analytics.**

- **Purpose**: Track and analyze SEO performance metrics over time
- **Features**:
  - Ranking position tracking
  - Traffic analysis integration
  - Conversion rate monitoring
  - Historical performance comparison
  - Automated alerting for significant changes

### `submit-urls-indexing.cjs`
**Google Search Console URL submission automation.**

- **Purpose**: Automatically submit new content to Google for faster indexing
- **Features**:
  - Bulk URL submission to GSC
  - New content detection
  - Indexing status monitoring
  - Sitemap validation
  - Error handling for submission failures

## 🚀 Usage

### Environment Variables Required
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_PROJECT_ID=your-gcp-project-id
GSC_SITE_URL=https://cciservices.online
GEMINI_API_KEY=your-gemini-api-key
SITE_URL=https://cciservices.online
```

### Command Line Usage
```bash
# Run full SEO analysis
node simple-seo-analysis.cjs

# Update keyword database
node keyword-update.cjs

# Generate SEO content (2 articles)
node seo-content-automation.cjs 2

# Track performance metrics
node performance-tracking.cjs

# Submit URLs for indexing
node submit-urls-indexing.cjs articles 5
```

### GitHub Actions Integration
Automated execution via `.github/workflows/seo-automation.yml`:
- **Weekly Schedule**: Mondays at 9:00 AM Tunisia time
- **Manual Triggers**: With customizable action types
- **Push Events**: Validation on code changes

## 📊 Workflow Action Types

### 1. Full Analysis (Default)
```bash
# Runs all SEO scripts in sequence
- simple-seo-analysis.cjs
- performance-tracking.cjs  
- keyword-update.cjs
- submit-urls-indexing.cjs
```

### 2. Content Generation
```bash
# Focus on content creation
node seo-content-automation.cjs [number_of_articles]
```

### 3. Performance Tracking
```bash
# Monitor and analyze metrics
node performance-tracking.cjs
```

### 4. Keyword Update
```bash
# Refresh keyword database
node keyword-update.cjs
```

## 🔧 Configuration

### Keyword Database (`scripts/data/seo-keywords.csv`)
```csv
keyword,priority,search_volume,competition,trend_score
nettoyage marbre tunis,95,1200,0.6,1.2
détachage tapis salon,88,800,0.5,1.15
services ménage domicile,92,2000,0.7,1.1
```

### Market Trends Configuration
```javascript
marketTrends: {
  'nettoyage': 1.2,    // +20% trend boost
  'détachage': 1.15,   // +15% trend boost
  'marbre': 1.0,       // Stable
  'tapisserie': 0.95,  // -5% trend decline
  'salon': 1.1,        // +10% trend boost
  'prix': 1.25,        // +25% trend boost (price queries)
  'tunis': 1.3,        // +30% local boost
  'urgent': 1.4        // +40% urgency boost
}
```

## 📈 Generated Reports

### SEO Analysis Report (`scripts/reports/seo-report.md`)
```markdown
# SEO Analysis Report
- Keywords Analyzed: 117
- Content Pieces Optimized: 28
- Indexing Status: 95% indexed
- Performance Score: 87/100
```

### Performance Tracking Report (`scripts/reports/performance-tracking-report.md`)
```markdown
# Performance Metrics
- Average Position: 12.5
- Click-through Rate: 4.2%
- Traffic Growth: +15% (week over week)
- Conversion Rate: 2.8%
```

### Keyword Update Report (`scripts/reports/keyword-update-report.md`)
```markdown
# Keyword Database Update
- Keywords Updated: 45
- New Keywords Added: 12
- Trend Adjustments Applied: 23
- Priority Recalculations: 67
```

## 🎯 SEO Strategy

### Content Optimization
- **Keyword Density**: 1-3% target density for primary keywords
- **LSI Keywords**: Related terms integration
- **Header Optimization**: H1-H6 structure optimization
- **Meta Descriptions**: Compelling, keyword-rich descriptions
- **Internal Linking**: Strategic cross-page connections

### Technical SEO
- **Site Speed**: Performance monitoring and optimization
- **Mobile Optimization**: Responsive design validation
- **Schema Markup**: Structured data implementation
- **Sitemap Management**: Automated sitemap updates
- **URL Structure**: SEO-friendly URL patterns

### Content Strategy
- **Topic Clustering**: Related content grouping
- **Keyword Mapping**: Content-to-keyword alignment
- **Content Gaps**: Opportunity identification
- **Competitor Analysis**: Market positioning insights
- **Local SEO**: Tunisia-specific optimization

## 🔍 Google Search Console Integration

### Setup Requirements
1. **Service Account**: Google Cloud service account with GSC access
2. **Site Verification**: Domain ownership verification
3. **API Access**: Search Console API enabled
4. **Permissions**: Read/Write access to site data

### Automated Functions
- **URL Submission**: New content indexing requests
- **Performance Monitoring**: Search analytics tracking
- **Index Coverage**: Crawling and indexing status
- **Mobile Usability**: Mobile-friendliness checks
- **Core Web Vitals**: User experience metrics

## 🛡️ Best Practices

### Keyword Management
- **Research-Driven**: Data-backed keyword selection
- **Long-tail Focus**: Target specific, less competitive terms
- **Local Optimization**: Tunisia and Tunis-specific keywords
- **Seasonal Adjustments**: Trend-based priority updates
- **Competitor Monitoring**: Market position tracking

### Content Quality
- **Original Content**: Unique, valuable information
- **User Intent**: Search query alignment
- **Readability**: Clear, accessible language
- **Visual Elements**: Images and media optimization
- **Regular Updates**: Fresh content maintenance

### Performance Monitoring
- **Regular Audits**: Weekly automated analysis
- **Metric Tracking**: Key performance indicators
- **Issue Detection**: Automated problem identification
- **Trend Analysis**: Long-term performance patterns
- **Competitive Benchmarking**: Market comparison

## 🔧 Troubleshooting

### Common Issues

#### 1. Google Search Console Authentication
```bash
# Verify service account credentials
echo $GOOGLE_PRIVATE_KEY | head -c 50
# Check site verification
curl -H "Authorization: Bearer $GSC_TOKEN" \
  "https://www.googleapis.com/webmasters/v3/sites"
```

#### 2. Keyword Database Corruption
```bash
# Validate CSV format
node -e "const csv=require('csv-parser'); require('fs').createReadStream('seo-keywords.csv').pipe(csv()).on('data',console.log);"
```

#### 3. Content Generation Failures
```bash
# Test Gemini API connection
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY"
```

### Debug Mode
Enable detailed logging:
```bash
DEBUG=true node simple-seo-analysis.cjs
VERBOSE=true node keyword-update.cjs
```

## 🔄 Integration with Other Workflows

### Email Automation
- SEO insights inform email content strategy
- Backlink opportunities identified via keyword research
- Partnership outreach based on content gaps

### Social Media
- SEO keyword trends guide social content
- High-performing content promoted socially
- Social signals feed back into SEO metrics

### Analytics
- SEO metrics integrated into business analytics
- Performance data drives strategy decisions
- ROI tracking across all marketing channels

## 📅 Maintenance Schedule

### Daily (Automated)
- Performance metric collection
- Index status monitoring
- Error detection and alerting

### Weekly (Automated)
- Full SEO analysis execution
- Keyword database updates
- Content optimization recommendations
- URL submission for new content

### Monthly (Manual Review)
- Strategy effectiveness assessment
- Keyword portfolio optimization
- Competitor analysis updates
- Technical SEO audit

### Quarterly (Strategic Review)
- Comprehensive performance analysis
- SEO strategy refinement
- Tool and process optimization
- Market trend adaptation

---

**Last Updated**: October 2025  
**Maintained By**: CCI Services SEO Team  
**Contact**: For SEO strategy questions or technical issues, create a GitHub issue or contact the development team.