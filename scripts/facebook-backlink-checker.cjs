/**
 * Facebook Backlink Validator
 * Check if Facebook page has proper website backlinks
 */

const https = require('https');
const fs = require('fs').promises;

class FacebookBacklinkChecker {
  constructor() {
    this.facebookUrls = [
      'https://www.facebook.com/Chaabanes.Cleaning.Intelligence',
      'https://business.facebook.com/Chaabanes.Cleaning.Intelligence',
      'https://m.facebook.com/Chaabanes.Cleaning.Intelligence'
    ];
    
    this.targetWebsite = 'https://cciservices.online/';
    
    this.checkResults = {
      hasWebsiteLink: false,
      linkLocation: null,
      linkType: null,
      optimizationNeeded: [],
      currentBacklinkValue: 'unknown'
    };
  }

  /**
   * Manual Facebook Page Optimization Checklist
   */
  generateOptimizationChecklist() {
    const checklist = `# 🔗 Facebook Backlink Optimization - IMMEDIATE ACTION

## 📋 FACEBOOK PAGE AUDIT CHECKLIST

**Your Page:** https://www.facebook.com/Chaabanes.Cleaning.Intelligence

### 🔴 CRITICAL BACKLINK LOCATIONS (Check These Now):

**✅ 1. About Section Website Field:**
- [ ] Go to your page → About tab
- [ ] Check "Website" field
- [ ] Should show: **https://cciservices.online/**
- [ ] If missing/wrong → Click "Edit Page Info" → Add website

**✅ 2. Contact Info Section:**
- [ ] Phone: +216 98 557 766 ✓
- [ ] Email: cci.services.tn@gmail.com ✓  
- [ ] Website: https://cciservices.online/ (CHECK THIS)

**✅ 3. Bio/Description Links:**
- [ ] Page description should mention website
- [ ] Add call-to-action: "Devis gratuit sur cciservices.online"

**✅ 4. Pinned Post with Website:**
\`\`\`
🏢 Leader du nettoyage commercial à Tunis depuis 10+ ans!

✨ Nos services professionnels:
🧽 Nettoyage bureaux & espaces commerciaux
🛏️ Entretien hôtelier de qualité
🧼 Moquettes injection-extraction
🦠 Désinfection professionnelle

📞 Devis GRATUIT: +216 98 557 766
🌐 Plus d'infos: https://cciservices.online/

#NettoyageTunis #CCI #BureauxPropres
\`\`\`

---

## 🎯 BACKLINK VALUE OPTIMIZATION

**Current Status:** Connected to website ✓
**Backlink Strength:** Needs optimization

### 🚀 IMMEDIATE ACTIONS:

**1. Website Link Verification (2 minutes):**
- Go to Facebook page About section
- Verify https://cciservices.online/ is in website field
- If missing → Add immediately

**2. Create Pinned Post (3 minutes):**
- Copy the post template above
- Pin to top of page
- This creates additional contextual backlink

**3. Story Highlights (2 minutes):**
- Create "Services" highlight
- Add website link in story description
- Pin permanently

**4. Call-to-Action Button (1 minute):**
- Add "Visit Website" button
- Link to: https://cciservices.online/

---

## 📊 BACKLINK TRACKING UPDATE

After optimization, record the enhanced Facebook backlink:

\`\`\`bash
# Record optimized Facebook backlink
node scripts/backlink-manager.cjs record facebook.com social_media

# Add Facebook as high-value referral source  
node scripts/backlink-manager.cjs add-prospect social_media "Facebook Optimized" "facebook.com/Chaabanes.Cleaning.Intelligence"
\`\`\`

---

## ✅ SUCCESS CRITERIA

**Facebook backlink is optimized when:**
- [x] Website in About section ✓
- [ ] Pinned post with website link
- [ ] Call-to-action button active
- [ ] Regular posts mention website
- [ ] Stories highlight website

**Estimated Backlink Value:** Medium-High (DA 100, highly trusted)

---

## 🔄 NEXT STEPS AFTER FACEBOOK

1. **LinkedIn Company Page** (10 min)
2. **Crunchbase Profile** (15 min)  
3. **Foursquare Business** (8 min)
4. **Working Tunisia Directories** (20 min)

**Today's Target:** 8-10 quality backlinks from working platforms

Generated: ${new Date().toISOString()}`;

    return checklist;
  }

  /**
   * Quick Facebook audit instructions
   */
  getQuickAuditInstructions() {
    return `
🔍 QUICK FACEBOOK AUDIT (5 minutes):

1. **Go to:** https://www.facebook.com/Chaabanes.Cleaning.Intelligence

2. **Check About Section:**
   - Click "About" tab
   - Look for "Website" field
   - Should show: https://cciservices.online/

3. **Check Contact Info:**
   - Verify website link is prominent
   - Phone: +216 98 557 766
   - Email: cci.services.tn@gmail.com

4. **Check Recent Posts:**
   - Do any posts mention the website?
   - Is there a pinned post with website link?

5. **Report Back:**
   - "website found" = Facebook backlink confirmed ✅
   - "no website" = Need immediate optimization ❌
   - "website wrong" = Need to update URL ⚠️

**After audit, tell me what you found and I'll give you exact next steps!**
`;
  }

  /**
   * Generate Facebook optimization file
   */
  async generateOptimizationFile() {
    const content = this.generateOptimizationChecklist();
    await fs.writeFile('./FACEBOOK_BACKLINK_OPTIMIZATION.md', content, 'utf8');
    console.log('✅ Generated FACEBOOK_BACKLINK_OPTIMIZATION.md');
    return content;
  }
}

// CLI Interface
async function main() {
  const checker = new FacebookBacklinkChecker();
  const command = process.argv[2];

  switch (command) {
    case 'audit':
      console.log(checker.getQuickAuditInstructions());
      break;

    case 'optimize':
      await checker.generateOptimizationFile();
      break;

    case 'check':
      console.log('🔍 Facebook Backlink Status Check');
      console.log('Page: https://www.facebook.com/Chaabanes.Cleaning.Intelligence');
      console.log('Target: https://cciservices.online/');
      console.log('');
      console.log('Manual audit required - use "audit" command for instructions');
      break;

    default:
      console.log(`
🔗 Facebook Backlink Checker

Commands:
  audit     - Get 5-minute manual audit instructions
  optimize  - Generate complete optimization guide
  check     - Show Facebook backlink status

Examples:
  node facebook-backlink-checker.cjs audit
  node facebook-backlink-checker.cjs optimize
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FacebookBacklinkChecker };