# 🔄 GitHub Actions Automation Guide

## 🎯 Overview

GitHub Actions automatise complètement les campagnes marketing de CCI Services avec des workflows programmés et des triggers manuels.

## 📅 Automation Schedule

### 🤖 Automated Weekly Schedule
```
Monday 9:00 AM Tunisia    - 📧 International backlink campaign
Friday 10:00 AM Tunisia   - 📱 Facebook posts + social campaigns
Weekly (Monday)           - 💾 Automated backups
On every push to main     - 🔨 Build validation
```

### ⚡ Manual Triggers Available
- **Weekly Campaign**: Run weekly backlink acquisition
- **Social Media**: Post to Facebook + email social platforms
- **Analytics Report**: Generate performance metrics
- **Backlink Campaign**: Target international directories

## 🚀 Quick Setup (5 minutes)

### Step 1: Repository Secrets (3 minutes)

1. **Go to Repository Settings**
   ```
   https://github.com/vaw-zen/CCI-of-the-future/settings/secrets/actions
   ```

2. **Add Required Secrets**
   ```
   GMAIL_USER = cci.services.tn@gmail.com
   GMAIL_PASS = your_gmail_app_password
   FB_PAGE_ID = Chaabanes.Cleaning.Intelligence  
   FB_PAGE_ACCESS_TOKEN = your_facebook_page_token
   ```

3. **Verify Secrets Added**
   - All 4 secrets should appear in the list
   - Names must match exactly (case sensitive)

### Step 2: Enable Actions (1 minute)

1. **Go to Actions Tab**
   ```
   https://github.com/vaw-zen/CCI-of-the-future/actions
   ```

2. **Enable Workflows**
   - Click "I understand my workflows, go ahead and enable them"
   - Verify "CCI Services - Automated Marketing" appears

### Step 3: Test Manual Trigger (1 minute)

1. **Run Test Workflow**
   - Click on "CCI Services - Automated Marketing"
   - Click "Run workflow" button
   - Select campaign type: `analytics`
   - Click "Run workflow"

## 🎯 Workflow Details

### 📧 Weekly Backlink Campaign (Mondays)
```yaml
Trigger: Every Monday 9:00 AM Tunisia time
Target: International business platforms (12 emails)
Template: English professional template
Expected: 70-85% delivery rate, 8-10 responses
```

### 📱 Social Media Automation (Fridays)
```yaml
Trigger: Every Friday 10:00 AM Tunisia time
Actions:
  1. Post weekly special to Facebook
  2. Send emails to social platforms (12 targets)
  3. Generate activity report
Expected: Facebook post + 12 platform emails
```

### 💾 Backup & Monitoring (Weekly)
```yaml
Trigger: Every Monday with backlink campaign
Actions:
  1. Backup all automation scripts
  2. Backup workflow configurations
  3. Generate backup report
Location: /backups/YYYYMMDD/ directory
```

### 🔨 Build Validation (On Push)
```yaml
Trigger: Every push to main branch
Actions:
  1. Install dependencies
  2. Build Next.js application
  3. Validate automation scripts
  4. Test API endpoints
Purpose: Ensure no broken deployments
```

## 🎛️ Manual Workflow Controls

### Available Campaign Types

#### 1. Weekly Campaign
```yaml
Purpose: Run international backlink acquisition
Target: 12 business platforms (Google, Bing, Yelp, etc.)
Duration: ~5 minutes
Output: Campaign report with delivery status
```

#### 2. Social Media Campaign  
```yaml
Purpose: Facebook post + social platform emails
Target: Facebook API + 12 social platform emails
Duration: ~3 minutes
Output: Facebook post ID + email delivery report
```

#### 3. Backlink Campaign
```yaml
Purpose: Dedicated backlink acquisition focus
Target: All remaining international targets
Duration: ~8 minutes  
Output: Comprehensive backlink campaign report
```

#### 4. Analytics Report
```yaml
Purpose: Generate performance and status report
Target: System health check + metrics
Duration: ~2 minutes
Output: analytics-report.md with key metrics
```

### How to Run Manual Campaigns

1. **Navigate to Actions**
   ```
   Repository → Actions → CCI Services - Automated Marketing
   ```

2. **Click Run Workflow**
   - Select campaign type from dropdown
   - Optionally enable "Force run"
   - Click "Run workflow"

3. **Monitor Progress**
   - Click on the running workflow
   - Watch real-time logs
   - Check for errors or completion

4. **Review Results**
   - Check generated reports in repository
   - Review commit messages for summaries
   - Monitor email delivery confirmations

## 📊 Generated Reports

### Campaign Report (campaign-report.md)
```markdown
# 📧 Weekly Backlink Campaign Report
**Date**: 2025-10-14T08:00:00Z
**Campaign**: International Business Platforms  
**Targets**: 12 emails sent
**Success Rate**: 100% delivery
**Next Run**: Next Monday 9:00 AM Tunisia time
```

### Analytics Report (analytics-report.md)
```markdown
# 📈 CCI Services Analytics Report
**Generated**: 2025-10-14T10:30:00Z

## 🎯 Key Metrics
- **Website**: https://cciservices.online/
- **Analytics**: Google Analytics 4 (G-0RDH6DH7TS)
- **Search Console**: Active and validated
- **Tag Manager**: GTM-MT495L62

## 📧 Email Campaigns Status
- **Tunisia Directories**: 15/15 emails sent ✅
- **International Platforms**: Scheduled weekly
- **Social Media**: Automated Friday posts
```

## 🔧 Troubleshooting

### Common Issues

#### Workflow Not Running
```yaml
Issue: Scheduled workflow doesn't execute
Cause: Repository inactive or secrets missing
Solution:
  1. Check repository settings
  2. Verify all 4 secrets are added
  3. Push a small commit to trigger
```

#### Email Authentication Failure
```yaml
Issue: Gmail authentication error in logs
Cause: Invalid Gmail app password
Solution:
  1. Generate new Gmail app password
  2. Update GMAIL_PASS secret
  3. Re-run workflow
```

#### Facebook API Error
```yaml
Issue: Facebook post fails
Cause: Invalid access token or permissions
Solution:
  1. Regenerate Facebook Page Access Token
  2. Update FB_PAGE_ACCESS_TOKEN secret
  3. Verify page permissions
```

#### Build Failures
```yaml
Issue: Workflow fails during build step
Cause: Code syntax errors or dependency issues
Solution:
  1. Check workflow logs for specific error
  2. Fix code issues locally
  3. Test build: npm run build
  4. Push fix to main branch
```

### Debug Commands
```bash
# Check workflow status
gh workflow list

# View workflow runs
gh workflow run list

# Check specific run logs
gh run view <run-id>

# Re-run failed workflow
gh workflow run automation.yml
```

## 📈 Success Metrics

### Automation Performance
- **Uptime**: Target 99%+ workflow success rate
- **Email Delivery**: 90%+ successful deliveries
- **Facebook Posts**: 100% automated posting
- **Backup Success**: 100% weekly backups

### Business Impact
- **Backlinks Generated**: 15-25 new links monthly
- **Social Engagement**: 500-1000 weekly reach
- **Time Saved**: 10+ hours weekly automation
- **Consistency**: 7-day weekly automation cycle

## 🔮 Advanced Features

### Environment-Based Workflows
```yaml
# Production automation (main branch)
if: github.ref == 'refs/heads/main'

# Staging tests (develop branch)  
if: github.ref == 'refs/heads/develop'
```

### Conditional Execution
```yaml
# Only run if secrets exist
if: env.GMAIL_USER && env.GMAIL_PASS

# Skip on draft PRs
if: github.event.pull_request.draft == false
```

### Multi-Environment Setup
```yaml
# Production secrets
GMAIL_USER_PROD
GMAIL_PASS_PROD

# Staging secrets
GMAIL_USER_STAGING
GMAIL_PASS_STAGING
```

## 🎯 Best Practices

### Workflow Optimization
1. **Run schedules during low-traffic hours**
2. **Use manual triggers for immediate campaigns**
3. **Monitor workflow logs regularly**
4. **Keep secrets updated and secure**
5. **Test workflows before production deployment**

### Security Guidelines
1. **Never commit secrets to code**
2. **Use GitHub Secrets for all credentials**
3. **Regularly rotate access tokens**
4. **Monitor workflow permissions**
5. **Review logs for suspicious activity**

---

**🚀 Ready for fully automated marketing?**

1. ✅ Add GitHub Secrets (3 min)
2. ✅ Enable workflows (1 min)
3. ✅ Test manual trigger (1 min)
4. 🤖 Enjoy automated campaigns!

**Next automated run**: Every Monday & Friday automatically!

*Enterprise-level automation for CCI Services marketing*