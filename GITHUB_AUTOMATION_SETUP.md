# 🚀 GitHub Actions SEO Automation Setup Guide

## 📋 Overview

Your GitHub Actions workflow is configured to:
- ✅ **Automatically generate SEO articles** from your keyword CSV
- ✅ **Update the articles database** directly in your repository
- ✅ **Track keyword performance** with Google Search Console
- ✅ **Create pull requests** for review before publishing
- ✅ **Run weekly** every Monday at 9 AM UTC

## 🔧 Setup Required

### Step 1: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these **Repository secrets**:

#### 1. GEMINI_API_KEY
```
Name: GEMINI_API_KEY
Value: AIzaSyBiEQFqtxkgn_3S2lNFpLMonnVp45QlhZk
```
*This is already in your `.env.local` file*

#### 2. GSC_CREDENTIALS
```
Name: GSC_CREDENTIALS  
Value: [Copy the ENTIRE content of your Google Search Console credentials JSON]
```

✅ **You've already added this secret!** The GitHub Actions workflow will use this instead of a local file for security.

#### 3. SITE_URL
```
Name: SITE_URL
Value: https://cciservices.online
```

### Step 2: Verify Workflow Setup

The workflow file is already configured at `.github/workflows/seo-automation.yml`

**Key features:**
- 🕘 **Scheduled runs**: Every Monday at 9 AM UTC
- 🎯 **Manual triggers**: Run anytime from GitHub Actions tab
- 📝 **Content generation**: Creates 2 articles per run
- 🔄 **Auto-commits**: Updates your articles.js database
- 📊 **Performance tracking**: Updates keyword rankings

## 🎯 How to Use

### Automatic Mode
1. **Push your changes** to the main branch
2. **Every Monday**, the workflow automatically:
   - Reads your `seo-keywords.csv`
   - Finds keywords marked as "Not Optimized" + "Blog Post"
   - Generates 2 new articles
   - Adds them to `src/app/conseils/data/articles.js`
   - Commits changes back to your repository

### Manual Mode
1. Go to **GitHub Actions** tab in your repository
2. Click **"SEO Automation Workflow"**
3. Click **"Run workflow"**
4. Choose action type:
   - `content_generation`: Generate new articles
   - `performance_tracking`: Update keyword rankings
   - `full_analysis`: Complete SEO analysis

## 📊 What Gets Generated

When the workflow runs for content generation:

1. **New Articles Added** to `articles.js`:
   ```javascript
   {
     id: 12,
     slug: 'new-article-slug-tunis-2025',
     title: 'SEO Optimized Title',
     // ... complete article structure
   }
   ```

2. **CSV Updated**: Keywords marked as "Optimized"

3. **Content Files**: Backup copies saved in `content/generated-articles/`

## 🔍 Monitoring & Debugging

### Check Workflow Status
1. Go to **GitHub Actions** tab
2. Click on latest workflow run
3. Review logs for each step

### Common Issues & Solutions

#### "Missing secrets" error
- ✅ **Fix**: Add all required secrets (see Step 1)

#### "CSV file not found"  
- ✅ **Fix**: Ensure `seo-keywords.csv` is in repository root

#### "No keywords found for generation"
- ✅ **Normal**: All keywords are already optimized
- 🎯 **To test**: Set some keywords to "Not Optimized" + "Blog Post"

#### "Articles.js update failed"
- ✅ **Fix**: Check file permissions and syntax

## 🎛️ Customization Options

### Change Generation Frequency
Edit `.github/workflows/seo-automation.yml`:
```yaml
schedule:
  # Run every Monday at 9 AM UTC
  - cron: '0 9 * * 1'
  
  # Examples:
  # Daily: '0 9 * * *'
  # Twice weekly: '0 9 * * 1,4'  
  # Monthly: '0 9 1 * *'
```

### Change Articles Per Run
Edit the workflow file:
```yaml
run: |
  node scripts/seo-content-automation.cjs 3  # Generate 3 articles
```

### Add Slack Notifications
1. Add `SLACK_WEBHOOK_URL` secret
2. The workflow will send notifications automatically

## 🧪 Testing Before Live Deployment

### Test Locally First:
```powershell
# Test content generation
node scripts/seo-content-automation.cjs 1

# Test GitHub integration
node scripts/test-github-actions.cjs
```

### Test Manual Workflow:
1. Push changes to GitHub
2. Go to Actions → Run workflow manually
3. Choose "content_generation"
4. Monitor the logs

## 📈 Expected Results

After setup completion:

- ✅ **2 new SEO articles** generated every Monday
- ✅ **Articles automatically appear** on your `/conseils` page  
- ✅ **Keywords tracking** updated with GSC data
- ✅ **Zero manual intervention** required
- ✅ **Professional quality content** optimized for Tunis market

## 🚨 Important Notes

1. **API Costs**: Gemini API calls cost money. Monitor usage.

2. **Content Review**: All generated content is professional quality but review before major campaigns.

3. **Keyword Management**: Keep your `seo-keywords.csv` updated with new target keywords.

4. **Backup Strategy**: Generated content is automatically backed up in `content/` folder.

## 🎯 Next Steps After Setup

1. **Push this setup** to GitHub
2. **Add the required secrets**
3. **Run a test workflow** manually
4. **Monitor your first automated run** next Monday
5. **Check generated articles** on your website

---

## 📞 Support

If you encounter issues:
1. Check the workflow logs in GitHub Actions
2. Review the test output from `test-github-actions.cjs`
3. Verify all secrets are correctly configured
4. Ensure your CSV has keywords marked for generation

**The system is designed to run autonomously and scale your content creation while maintaining high SEO quality!** 🚀