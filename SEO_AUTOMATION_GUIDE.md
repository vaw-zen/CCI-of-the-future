# 🚀 SEO Automation System Setup Guide

This comprehensive SEO automation system will help you manage keywords, generate content, track performance, and optimize your website automatically.

## 📋 Prerequisites

1. **Node.js 16+** installed
2. **Google Search Console** access for your website
3. **Google Cloud Service Account** with Search Console API access
4. **Gemini AI API Key** (or OpenAI if preferred)
5. **GitHub repository** with Actions enabled

## ⚡ Quick Setup

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_key_here (optional)

# Site Configuration
SITE_URL=https://cciservices.online
SITE_NAME=CCI Services

# Google Search Console
GSC_PROPERTY_URL=https://cciservices.online

# Notifications (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 3. Setup Google Search Console API

#### Step-by-Step GSC_CREDENTIALS Setup:

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account (same one that has access to your website's Search Console)

2. **Create or Select Project**
   - Click "Select a project" at the top
   - Either create a new project or select existing one
   - Project name can be anything (e.g., "CCI-SEO-Automation")

3. **Enable Search Console API**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google Search Console API"
   - Click on it and press "Enable"

4. **Create Service Account**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "Service account"
   - Enter a name (e.g., "seo-automation-bot")
   - Click "CREATE AND CONTINUE"
   - Skip the optional steps, click "DONE"

5. **Generate JSON Key File**
   - In the Credentials page, find your newly created service account
   - Click on the service account email
   - Go to the "Keys" tab
   - Click "ADD KEY" → "Create new key"
   - Select "JSON" format
   - Click "CREATE" - this downloads your `GSC_CREDENTIALS` file

6. **Add Service Account to Search Console**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Select your property (cciservices.online)
   - Go to Settings (gear icon) → "Users and permissions"
   - Click "Add user"
   - Enter the service account email (from step 4)
   - Set permission to "Full" or "Owner"
   - Click "Add"

7. **Save Credentials**
   - **For local development**: Rename downloaded file to `gsc-credentials.json` and place in project root
   - **For GitHub Actions**: Copy the entire JSON content to use as `GSC_CREDENTIALS` secret

### 4. Configure GitHub Secrets

#### How to Add GSC_CREDENTIALS to GitHub:

1. **Open your downloaded JSON file** (from step 5 above)
2. **Copy the ENTIRE JSON content** (it should look like this):
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...",
     "client_email": "seo-automation-bot@your-project.iam.gserviceaccount.com",
     "client_id": "123456789...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     ...
   }
   ```

3. **Go to your GitHub repository**
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"

4. **Add these secrets**:
   - **Name**: `GSC_CREDENTIALS` **Value**: Paste the ENTIRE JSON content from step 2
   - **Name**: `GEMINI_API_KEY` **Value**: Your Gemini AI API key
   - **Name**: `SITE_URL` **Value**: `https://cciservices.online`
   - **Name**: `SLACK_WEBHOOK_URL` **Value**: Your Slack webhook (optional)

#### ⚠️ Important Notes:
- The JSON must include ALL fields (type, project_id, private_key, etc.)
- Don't modify or format the JSON - copy it exactly as downloaded
- The private_key should include the `\n` characters
- Keep the credentials file secure and never commit it to your repository

## 🎯 Usage

### Manual Commands

```bash
# Run full SEO analysis
npm run seo:analyze

# Generate content only
npm run seo:generate-content

# Track performance only
npm run seo:track-performance

# Update keyword clusters
npm run seo:update-keywords
```

### Automated Workflow

The system runs automatically via GitHub Actions:

- **Weekly**: Full SEO analysis
- **Bi-weekly**: Content generation
- **Daily**: Performance tracking

## 📊 What It Does

### 1. Keyword Analysis & Clustering
- ✅ Automatically clusters similar keywords
- ✅ Identifies search intent (informational, transactional, etc.)
- ✅ Maps keywords to existing pages
- ✅ Finds content gaps

### 2. Performance Tracking
- ✅ Syncs with Google Search Console
- ✅ Tracks keyword positions, clicks, CTR
- ✅ Updates CSV with performance data
- ✅ Identifies improvement opportunities

### 3. AI Content Generation
- ✅ Creates SEO-optimized blog posts
- ✅ Generates service pages
- ✅ Produces meta tags and structured data
- ✅ Suggests internal linking

### 4. Automation & Monitoring
- ✅ Runs on schedule via GitHub Actions
- ✅ Creates pull requests for review
- ✅ Sends Slack notifications
- ✅ Generates performance reports

## 📁 File Structure

```
project/
├── seo-keywords.csv              # Main keyword database
├── scripts/
│   ├── seo-automation.js         # Keyword clustering & analysis
│   ├── gsc-tracker.js           # Google Search Console integration
│   ├── ai-content-generator.js  # AI content creation
│   ├── run-seo-automation.js    # Main orchestrator
│   └── seo-config.js            # Configuration
├── generated-content/
│   ├── blog/                    # Auto-generated blog posts
│   └── pages/                   # Auto-generated service pages
├── seo-results/
│   ├── seo-report.json          # Detailed analysis results
│   ├── internal-links.json     # Link suggestions
│   └── optimization-suggestions.json
└── .github/workflows/
    └── seo-automation.yml       # GitHub Actions workflow
```

## 🔧 Configuration

Edit `scripts/seo-config.js` to customize:

- Keyword analysis parameters
- Content generation settings
- Performance thresholds
- Geographic targeting
- Semantic groups

## 📈 Understanding Reports

### SEO Report Structure

```json
{
  "summary": {
    "total_keywords": 150,
    "content_pieces_generated": 5,
    "pages_optimized": 3
  },
  "performance_insights": {
    "top_performing": [...],
    "improvement_opportunities": [...]
  },
  "content_gaps": [...],
  "next_actions": [...]
}
```

### Key Metrics Tracked

- **Search Volume**: Monthly search volume estimate
- **Current Position**: Average ranking position
- **Clicks**: Actual clicks from search results  
- **CTR**: Click-through rate percentage
- **Competition**: Keyword difficulty level
- **Opportunity Score**: Calculated improvement potential

## 🎨 Content Generation Features

### Blog Posts Include:
- SEO-optimized title and meta description
- Structured content with H2/H3 headings
- FAQ section with schema markup
- Internal linking suggestions
- Call-to-action sections
- Contact information

### Service Pages Include:
- Hero section with value proposition
- Service descriptions and benefits
- Process explanations
- Local business schema
- Customer testimonials area
- FAQ and contact forms

## 🔄 Workflow Examples

### Weekly Analysis Flow:
1. Load keyword database
2. Sync with Google Search Console
3. Cluster keywords and identify gaps
4. Generate performance report
5. Create content for high-priority gaps
6. Suggest optimizations for underperforming pages
7. Generate internal linking recommendations
8. Send summary to Slack

### Content Creation Flow:
1. Identify content gaps from keyword analysis
2. Prioritize by search volume and business value
3. Generate AI content with proper SEO structure
4. Create pull request for review
5. Run SEO audit on generated content
6. Deploy to staging for testing
7. Merge and publish after approval

## 🚨 Troubleshooting

### Common Issues:

**API Rate Limits**
- Solution: Increase delays between requests in config
- Check: API quotas in Google Cloud Console

**Content Quality Issues**
- Solution: Adjust AI temperature and prompts
- Review: Generated content before publishing

**GSC_CREDENTIALS Issues**
- **Error "invalid_grant"**: Service account email not added to Search Console
- **Error "forbidden"**: Service account lacks proper permissions
- **Error "invalid_client"**: JSON credentials malformed or incomplete
- Solution: Re-download JSON, verify service account has "Owner" access

**Keyword Tracking Failures**
- Solution: Verify GSC credentials and permissions
- Check: Site verification in Search Console
- Verify: Your website is properly verified in Search Console

**GitHub Actions Failures**
- Solution: Check secrets configuration
- Review: Action logs for specific errors
- Common: GSC_CREDENTIALS secret missing or malformed

### Debug Commands:

```bash
# Test individual components
node scripts/seo-automation.js
node scripts/gsc-tracker.js
node scripts/ai-content-generator.js

# Check configuration
node -e "console.log(JSON.stringify(require('./scripts/seo-config.js').default, null, 2))"
```

## 📋 Checklist for Full Setup

- [ ] Install Node.js dependencies
- [ ] Configure environment variables
- [ ] Set up Google Search Console API
- [ ] Add GitHub repository secrets
- [ ] Test keyword analysis manually
- [ ] Verify GSC data sync
- [ ] Test content generation
- [ ] Configure Slack notifications
- [ ] Run full automation workflow
- [ ] Review generated reports
- [ ] Set up monitoring and alerts

## 🎯 Next Steps

1. **Week 1**: Run manual analysis, review keyword clusters
2. **Week 2**: Generate first batch of content, optimize existing pages  
3. **Week 3**: Set up automated workflows, monitor performance
4. **Week 4**: Analyze results, refine configuration
5. **Ongoing**: Monitor reports, adjust strategy based on performance

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review GitHub Actions logs
- Examine generated reports in `seo-results/`
- Test individual components manually

## 🔄 Maintenance

### Monthly Tasks:
- Review keyword performance trends
- Update semantic groups in config
- Audit generated content quality
- Check API usage and limits
- Update competitor monitoring

### Quarterly Tasks:
- Analyze ROI of content creation
- Update keyword priorities
- Refine AI prompts and templates
- Review and update internal linking strategy
- Audit technical SEO elements

---

**Happy Optimizing! 🚀**

This system will continuously improve your SEO performance by automating the most time-consuming tasks while providing actionable insights for strategic decisions.