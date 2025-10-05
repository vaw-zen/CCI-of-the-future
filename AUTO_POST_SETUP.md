# 🤖 Daily Facebook Auto-Post with Gemini AI

## Overview
This system automatically generates engaging, AI-powered cleaning tips and posts them to your Facebook page daily at 10 AM using GitHub Actions and Gemini AI.

## ✨ Features

### 🧠 **AI Content Generation**
- **Gemini AI Integration**: Uses Google's Gemini 1.5 Flash model
- **Multiple Post Types**: Tips, motivation, service highlights, seasonal advice
- **Intelligent Prompts**: Context-aware prompts for CCI Services
- **French Language**: Tailored for Tunisian audience
- **Smart Hashtags**: Automatically adds relevant hashtags

### 🖼️ **Automatic Image Selection**
- **Smart Image Matching**: Selects relevant images based on post type
- **Local Images**: Prioritizes your own website images (60% usage)
- **Stock Images**: High-quality Unsplash images for variety (40% usage)
- **Image Categories**: Different image sets for tips, motivation, services, seasonal
- **Fallback Options**: Text-only posts when images aren't needed

### ⏰ **Automated Scheduling**
- **Daily Posts**: Every day at 10:00 AM Tunisia time
- **GitHub Actions**: Runs automatically on GitHub servers
- **Manual Trigger**: Can run manually for testing
- **Post Type Rotation**: Automatically rotates through different content types

### 📱 **Facebook Integration**
- **Direct Posting**: Posts directly to your Facebook page
- **Error Handling**: Comprehensive error logging and recovery
- **Success Tracking**: Logs successful posts with IDs

## 🛠️ Setup Instructions

### 1. GitHub Secrets Configuration
Add these secrets to your GitHub repository:

```
Settings → Secrets and Variables → Actions → New Repository Secret
```

Required secrets:
- `FB_PAGE_ID`: Your Facebook Page ID (102106381365856)
- `FB_PAGE_ACCESS_TOKEN`: Your Facebook Page Access Token
- `GEMINI_API_KEY`: Your Google AI API key
- `FB_API_VERSION`: v23.0 (optional)
- `NEXT_PUBLIC_SITE_URL`: https://cciservices.online (optional)

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it as `GEMINI_API_KEY` secret in GitHub

### 3. GitHub Actions Setup
The workflow file is already created at `.github/workflows/daily-facebook-post.yml`

### 4. Enable GitHub Actions
1. Go to your repository on GitHub
2. Click "Actions" tab
3. Enable workflows if prompted
4. The daily post will start running automatically

## 📋 API Endpoints

### POST `/api/auto-post-daily`
Generates AI content and posts to Facebook

**Request Body:**
```json
{
  "postType": "tip|motivation|service|seasonal",
  "customPrompt": "Optional custom prompt for Gemini",
  "includeHashtags": true,
  "includeImage": true
}
```

**Response:**
```json
{
  "success": true,
  "generated_content": "AI-generated post content",
  "selected_image": "https://images.unsplash.com/photo-123...",
  "facebook_response": { "id": "facebook_post_id" },
  "post_type": "tip",
  "timestamp": "2025-10-04T10:00:00.000Z",
  "posted_with_image": true
}
```

### GET `/api/auto-post-daily`
Health check and configuration status

## 🎯 Post Types

### 1. **Tips** (`postType: "tip"`) 🧽
Practical cleaning advice for sofas, carpets, marble, tapestry
```
💡 Astuce du jour : Aspirez vos tapis avant le nettoyage profond pour de meilleurs résultats ! 🧽✨
```
**Images**: Cleaning supplies, vacuum cleaners, before/after shots

### 2. **Motivation** (`postType: "motivation"`) 🏠
Inspirational content about clean homes and quality of life
```
🏠 Un foyer propre = un esprit serein ! Offrez-vous le confort d'un nettoyage professionnel ✨
```
**Images**: Beautiful clean homes, bright living spaces, organized rooms

### 3. **Service** (`postType: "service"`) 🛋️
Highlights of CCI Services' professional offerings
```
🛋️ Redonnez vie à vos salons ! Notre service de nettoyage professionnel transforme vos meubles 🌟
```
**Images**: Professional cleaning in action, your actual work photos

### 4. **Seasonal** (`postType: "seasonal"`) 🍂
Time-relevant cleaning advice based on current season
```
🍂 Automne = temps de grand nettoyage ! Préparez votre intérieur pour l'hiver avec CCI Services 🧽
```
**Images**: Seasonal cleaning scenes, fresh organized spaces

## 🕙 Scheduling Details

### Automatic Schedule
- **Time**: 10:00 AM Tunisia time (9:00 AM UTC)
- **Frequency**: Daily
- **Post Type Rotation**: 
  - Day 1: service
  - Day 2: service  
  - Day 3: Service
  - Day 4: Service
  - (Repeats cycle)

### Manual Triggering
You can manually trigger posts from GitHub:
1. Go to Actions → Daily Facebook Post
2. Click "Run workflow"
3. Choose post type and optional custom prompt

## 🧪 Testing

### Local Testing
```bash
# Start your Next.js development server
npm run dev

# Test the API
node test-auto-post.js
```

### Manual GitHub Actions Test
1. Go to repository → Actions → Daily Facebook Post
2. Click "Run workflow"
3. Select parameters and run
4. Check results in the workflow summary

## 📊 Monitoring & Logs

### GitHub Actions Dashboard
- View all runs in Actions tab
- See success/failure status
- Check generated content in workflow summaries
- Monitor error logs

### Success Indicators
- ✅ Workflow completes successfully
- 📱 Facebook post ID returned
- 📝 Generated content logged
- 🕒 Timestamp recorded

### Error Handling
- 🔍 Detailed error logging
- 📧 GitHub notifications on failures
- 🔄 Automatic retry capabilities
- 📋 Full error context in logs

## 🎨 Customization

### Modify Prompts
Edit prompts in `/src/app/api/auto-post-daily/route.js`:
```javascript
const prompts = {
  tip: `Your custom tip prompt...`,
  motivation: `Your custom motivation prompt...`,
  // etc.
};
```

### Change Schedule
Modify the cron schedule in `.github/workflows/daily-facebook-post.yml`:
```yaml
schedule:
  - cron: '0 9 * * *'  # Change time here
```

### Add Post Types
1. Add new prompt in the API route
2. Update the workflow to include new type
3. Test with manual trigger

## 🔧 Troubleshooting

### Common Issues
1. **"Missing GEMINI_API_KEY"**: Add the secret in GitHub repository settings
2. **"Facebook permission error"**: Ensure `pages_manage_posts` permission is granted
3. **"Workflow not running"**: Check if GitHub Actions are enabled
4. **"Content generation fails"**: Verify Gemini API key is valid

### Debug Steps
1. Check GitHub Actions logs
2. Test API locally with `test-auto-post.js`
3. Verify all secrets are properly set
4. Check Facebook token permissions

## 🚀 Production Tips

### Best Practices
- Monitor post performance and adjust prompts
- Keep an eye on Gemini API usage limits
- Regularly check Facebook token expiration
- Review generated content quality periodically

### Performance Optimization
- Content is generated fresh each time for uniqueness
- Uses efficient GitHub Actions with proper caching
- Minimal API calls to reduce costs
- Smart error handling prevents spam posting

## 📈 Expected Results

Once fully set up, you'll have:
- ✅ Daily AI-generated posts at 10 AM
- 🎯 Professional, relevant content for your audience  
- 📱 Consistent social media presence
- 🤖 Zero manual intervention required
- 📊 Full tracking and monitoring

This system will help maintain your social media presence with high-quality, relevant content while saving you time and effort! 🚀