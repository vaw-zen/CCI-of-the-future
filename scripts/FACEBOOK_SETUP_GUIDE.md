# 📱 Facebook Automation Setup Guide

## 🚀 Quick Setup (10 minutes)

### Step 1: Facebook App Setup (5 minutes)

1. **Go to Facebook Developers**
   ```
   https://developers.facebook.com/
   ```

2. **Create New App**
   - Click "Create App"
   - Choose "Business" type
   - App Name: "CCI Services Automation"
   - Contact Email: cci.services.tn@gmail.com

3. **Add Facebook Page Product**
   - Go to App Dashboard
   - Click "+ Add Product"
   - Select "Facebook Login" and "Pages API"

4. **Get Page Access Token**
   - Go to Tools → Graph API Explorer
   - Select your app
   - Select your page
   - Copy Page Access Token

5. **Get Page ID**
   ```bash
   # Method 1: From Facebook Page URL
   # facebook.com/Chaabanes.Cleaning.Intelligence
   # Page ID = Chaabanes.Cleaning.Intelligence
   
   # Method 2: Graph API
   curl "https://graph.facebook.com/me/accounts?access_token=YOUR_ACCESS_TOKEN"
   ```

### Step 2: Environment Configuration (2 minutes)

```bash
# Add to .env.local
FB_PAGE_ID=Chaabanes.Cleaning.Intelligence
FB_PAGE_ACCESS_TOKEN=your_page_access_token_here
FB_API_VERSION=v17.0
```

### Step 3: Test Integration (3 minutes)

```bash
# Test API endpoint
curl -X GET "https://cciservices.online/api/post-to-facebook"

# Test automation script
cd scripts
node facebook-automation.cjs test
```

## 🎯 Content Strategy

### Daily Automation Schedule
```
Monday    - 💼 Bureau motivation & commercial focus
Tuesday   - 🏨 Hotel services & hospitality
Wednesday - 🛋️ Carpet & upholstery cleaning
Thursday  - 💎 Marble restoration showcase
Friday    - 🎉 Weekend prep & availability
Saturday  - 🏠 Weekend services
Sunday    - 🙏 Reflection & weekly prep
```

### Weekly Specials (Fridays)
```
Week 1 - 🎯 Monthly promotions (-15% offers)
Week 2 - ⭐ Customer testimonials
Week 3 - 🧽 Technical education content
Week 4 - 🏆 Company excellence celebration
```

## 🤖 Automation Commands

### Manual Posting
```bash
# Daily content (automated via GitHub Actions)
node facebook-automation.cjs daily

# Weekly special content
node facebook-automation.cjs weekly

# Custom post
node facebook-automation.cjs custom "Promotion spéciale ce weekend!"

# Test connection
node facebook-automation.cjs test
```

### GitHub Actions Integration
```yaml
# Automatic Friday posts
- name: Post to Facebook
  env:
    FB_PAGE_ID: ${{ secrets.FB_PAGE_ID }}
    FB_PAGE_ACCESS_TOKEN: ${{ secrets.FB_PAGE_ACCESS_TOKEN }}
  run: |
    curl -X POST "https://cciservices.online/api/post-to-facebook" \
    -d '{"caption": "Weekly content..."}'
```

## 📊 Content Templates

### Sample Daily Post
```javascript
{
  caption: "💼 Début de semaine = bureaux impeccables! CCI Services vous accompagne pour créer un environnement de travail sain et motivant. 🧽✨ Devis gratuit: +216 98 557 766 🌐 cciservices.online #LundiMotivation #NettoyageBureau #Tunis",
  imageUrl: null
}
```

### Sample Weekly Special
```javascript
{
  caption: "🎯 OFFRE DU MOIS: -15% sur tous nos services de nettoyage commercial! Valable tout octobre. CCI Services - 10+ ans d'expérience à Tunis. 📞 +216 98 557 766 #PromotionOctobre #NettoyageCommercial",
  imageUrl: null
}
```

## 🔧 Troubleshooting

### Common Issues

#### Invalid Access Token
```bash
# Error: Invalid access token
# Solution: Regenerate Page Access Token
1. Go to Graph API Explorer
2. Select your app and page
3. Generate new token
4. Update .env.local
```

#### Page Not Found
```bash
# Error: Page ID not found
# Solution: Verify Page ID
1. Check facebook.com/your-page-name
2. Use Graph API to get correct ID
3. Update FB_PAGE_ID in environment
```

#### Permission Denied
```bash
# Error: Permission denied to post
# Solution: Check page permissions
1. Go to App Dashboard → Roles
2. Add page as test page
3. Grant "pages_manage_posts" permission
```

## 📈 Expected Results

### Posting Frequency
- **Daily**: 1 automated post (Monday-Sunday)
- **Weekly**: 1 special campaign (Fridays)
- **Monthly**: 4 themed campaigns
- **Seasonal**: Event-based content

### Engagement Targets
- **Reach**: 500-1000 weekly impressions
- **Engagement**: 50-100 weekly interactions
- **Website Clicks**: 20-40 monthly referrals
- **Lead Generation**: 5-10 monthly inquiries

### SEO Benefits
- **Social Signals**: Enhanced Google ranking factors
- **Brand Awareness**: Improved online presence
- **Backlink Quality**: Facebook = DA 100 platform
- **Local SEO**: Tunisia market visibility

## 🔄 Future Enhancements

### Planned Features
- [ ] Image automation (auto-generate service images)
- [ ] Hashtag optimization based on engagement
- [ ] A/B testing for content performance
- [ ] Instagram cross-posting integration
- [ ] Customer testimonial automation
- [ ] Event-based posting (Ramadan, Eid, etc.)

### Advanced Integration
- [ ] CRM integration for customer data
- [ ] Analytics dashboard for social metrics
- [ ] Automated response management
- [ ] Lead capture from social interactions

---

**Ready to automate your Facebook presence?**

1. ✅ Setup Facebook App (5 min)
2. ✅ Configure environment (2 min)  
3. ✅ Test integration (3 min)
4. 🚀 Launch automation!

```bash
cd scripts && node facebook-automation.cjs test
```

*Professional social media automation for CCI Services*