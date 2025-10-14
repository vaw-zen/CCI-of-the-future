/**
 * Working Platforms Finder - Skip Broken Directories
 * Focus on platforms that definitely work for immediate results
 */

const fs = require('fs').promises;

class WorkingPlatformsFinder {
  constructor() {
    this.businessData = {
      name: 'CCI Services',
      fullName: 'CCI Services - Chaabane\'s Cleaning Intelligence',
      shortName: 'CCI Services',
      website: 'https://cciservices.online/',
      email: 'cci.services.tn@gmail.com',
      phone: '+216 98 557 766',
      address: '06 Rue Galant de nuit, El Aouina, 2045 Tunis, Tunisia',
      city: 'Tunis',
      country: 'Tunisia',
      postalCode: '2045',
      description: 'Leader du nettoyage commercial à Tunis depuis 10+ ans. Services professionnels pour bureaux, hôtels, moquettes, surfaces commerciales. Injection-extraction, désinfection, maintenance préventive.',
      keywords: 'nettoyage commercial Tunis, nettoyage bureaux, moquettes, injection extraction, CCI Services',
      category: 'Commercial Cleaning Services',
      services: [
        'Nettoyage de bureaux',
        'Nettoyage moquettes et tapis',
        'Injection-extraction professionnelle', 
        'Désinfection espaces commerciaux',
        'Entretien hôtelier',
        'Nettoyage post-travaux'
      ]
    };

    this.guaranteedWorkingPlatforms = this.initializeWorkingPlatforms();
  }

  initializeWorkingPlatforms() {
    return {
      socialMedia: [
        {
          name: 'Google My Business',
          url: 'https://business.google.com/',
          submitUrl: 'https://business.google.com/create',
          category: 'Commercial Cleaning Service',
          priority: 'CRITICAL',
          estimatedDA: 100,
          successRate: 95,
          timeToComplete: '5-10 minutes',
          notes: 'Must have - optimize existing or create new',
          instructions: 'Search for existing business first, if not found click "Add your business to Google"'
        },
        {
          name: 'Facebook Business Page',
          url: 'https://www.facebook.com/Chaabanes.Cleaning.Intelligence',
          submitUrl: 'https://www.facebook.com/business/',
          category: 'Cleaning Service',
          priority: 'CRITICAL', 
          estimatedDA: 100,
          successRate: 100,
          timeToComplete: '3-5 minutes',
          notes: 'Optimize existing page - add website link prominently',
          instructions: 'Go to your existing page settings, update About section, add website'
        },
        {
          name: 'LinkedIn Company Page',
          url: 'https://www.linkedin.com/company/chaabanes-cleaning-int',
          submitUrl: 'https://www.linkedin.com/company/setup/new/',
          category: 'Commercial Services', 
          priority: 'HIGH',
          estimatedDA: 100,
          successRate: 90,
          timeToComplete: '10-15 minutes',
          notes: 'Professional network - create or optimize company page',
          instructions: 'Create company page with comprehensive business description'
        }
      ],

      guaranteedDirectories: [
        {
          name: 'Crunchbase',
          url: 'https://www.crunchbase.com/',
          submitUrl: 'https://www.crunchbase.com/organization/new',
          category: 'Company Profile',
          priority: 'HIGH',
          estimatedDA: 90,
          successRate: 85,
          timeToComplete: '10-15 minutes',
          notes: 'Business database - high authority',
          instructions: 'Create detailed company profile with founding info, services, website'
        },
        {
          name: 'Foursquare Business',
          url: 'https://business.foursquare.com/',
          submitUrl: 'https://business.foursquare.com/venues/new',
          category: 'Professional Services',
          priority: 'HIGH',
          estimatedDA: 80,
          successRate: 90,
          timeToComplete: '5-8 minutes',
          notes: 'Location-based platform',
          instructions: 'Add business venue with exact address and services'
        },
        {
          name: 'Hotfrog Global',
          url: 'https://www.hotfrog.com/',
          submitUrl: 'https://www.hotfrog.com/business/registration/step1',
          category: 'Cleaning Services',
          priority: 'MEDIUM',
          estimatedDA: 55,
          successRate: 80,
          timeToComplete: '8-12 minutes',
          notes: 'Global business directory',
          instructions: 'Register new business listing with full description'
        },
        {
          name: 'Cylex International',
          url: 'https://www.cylex-international.com/',
          submitUrl: 'https://www.cylex-international.com/company/add.html',
          category: 'Commercial Services',
          priority: 'MEDIUM', 
          estimatedDA: 50,
          successRate: 75,
          timeToComplete: '10-15 minutes',
          notes: 'Multi-country directory',
          instructions: 'Select Tunisia, add comprehensive business information'
        }
      ],

      alternativeTunisian: [
        {
          name: 'Tunisia Annuaire',
          url: 'https://www.tunisie-annuaire.com/',
          submitUrl: 'https://www.tunisie-annuaire.com/ajouter-site',
          category: 'Services professionnels',
          priority: 'HIGH',
          estimatedDA: 35,
          successRate: 70,
          timeToComplete: '5-8 minutes',
          notes: 'Alternative to Pages Jaunes - working',
          instructions: 'Submit in professional services category'
        },
        {
          name: 'Businesslist Tunisia',
          url: 'https://www.businesslist.tn/',
          submitUrl: 'https://www.businesslist.tn/add-business',
          category: 'Cleaning Services',
          priority: 'MEDIUM',
          estimatedDA: 30,
          successRate: 65,
          timeToComplete: '8-10 minutes',
          notes: 'Tunisian business directory',
          instructions: 'Register new business with detailed info'
        },
        {
          name: 'Tunisia Business Network', 
          url: 'https://www.tunisia-business.net/',
          submitUrl: 'Contact form on website',
          category: 'Business Services',
          priority: 'MEDIUM',
          estimatedDA: 25,
          successRate: 60,
          timeToComplete: '5 minutes',
          notes: 'Contact form submission',
          instructions: 'Send business info via contact form requesting listing'
        }
      ],

      industryPlatforms: [
        {
          name: 'Europages',
          url: 'https://www.europages.com/',
          submitUrl: 'https://www.europages.com/registration/',
          category: 'Cleaning Services',
          priority: 'HIGH',
          estimatedDA: 70,
          successRate: 80,
          timeToComplete: '15-20 minutes',
          notes: 'European B2B platform - high authority',
          instructions: 'Register as service provider in cleaning category'
        },
        {
          name: 'Cleaning Business Network',
          url: 'https://cleaningbusinessnetwork.com/',
          submitUrl: 'https://cleaningbusinessnetwork.com/join',
          category: 'Professional Cleaning',
          priority: 'MEDIUM',
          estimatedDA: 35,
          successRate: 70,
          timeToComplete: '10-12 minutes',
          notes: 'Industry-specific network',
          instructions: 'Join as professional cleaning business'
        }
      ]
    };
  }

  /**
   * Generate immediate action list
   */
  async generateImmediateActionPlan() {
    const allPlatforms = [
      ...this.guaranteedWorkingPlatforms.socialMedia,
      ...this.guaranteedWorkingPlatforms.guaranteedDirectories,
      ...this.guaranteedWorkingPlatforms.alternativeTunisian,
      ...this.guaranteedWorkingPlatforms.industryPlatforms
    ].sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const actionPlan = `# ⚡ IMMEDIATE ACTION PLAN - WORKING PLATFORMS ONLY

## 📋 COPY-PASTE BUSINESS DATA

\`\`\`
Business Name: ${this.businessData.fullName}
Short Name: ${this.businessData.shortName}
Website: ${this.businessData.website}
Email: ${this.businessData.email}
Phone: ${this.businessData.phone}
Address: ${this.businessData.address}
City: ${this.businessData.city}
Country: ${this.businessData.country}
Postal Code: ${this.businessData.postalCode}

Category: ${this.businessData.category}
Description: ${this.businessData.description}
Keywords: ${this.businessData.keywords}

Services:
${this.businessData.services.map(service => `- ${service}`).join('\n')}
\`\`\`

---

## 🚀 PRIORITY EXECUTION ORDER

### **🔴 CRITICAL - DO FIRST (Next 30 minutes):**
${this.guaranteedWorkingPlatforms.socialMedia
  .filter(p => p.priority === 'CRITICAL')
  .map(p => `
**${p.name}** (${p.timeToComplete})
- URL: ${p.submitUrl}
- Success Rate: ${p.successRate}%
- Instructions: ${p.instructions}
- Notes: ${p.notes}
`).join('\n')}

### **🟡 HIGH PRIORITY (Next 2 hours):**
${[...this.guaranteedWorkingPlatforms.guaranteedDirectories, ...this.guaranteedWorkingPlatforms.alternativeTunisian, ...this.guaranteedWorkingPlatforms.industryPlatforms]
  .filter(p => p.priority === 'HIGH')
  .map(p => `
**${p.name}** (${p.timeToComplete})
- URL: ${p.submitUrl}  
- Success Rate: ${p.successRate}%
- DA: ${p.estimatedDA}
- Instructions: ${p.instructions}
`).join('\n')}

---

## 📊 SUCCESS TRACKING

After each successful submission:
\`\`\`bash
node scripts/backlink-manager.cjs record [domain] [category]
\`\`\`

Examples:
\`\`\`bash
node scripts/backlink-manager.cjs record business.google.com social_media
node scripts/backlink-manager.cjs record facebook.com social_media  
node scripts/backlink-manager.cjs record crunchbase.com directory
\`\`\`

---

## 🎯 REALISTIC DAILY TARGET

**Today's Goal: 8-10 successful submissions**
- Critical platforms: 3 (100% must complete)
- High priority: 5-7 (realistic target)
- Total expected backlinks: 8-10

**Success Rate Estimate: 80%+ (using only working platforms)**

---

## ⚡ TROUBLESHOOTING NOTES

**If ANY platform doesn't work:**
1. Skip it immediately
2. Move to next platform 
3. Don't waste time troubleshooting
4. Focus on guaranteed working ones

**Priority: Volume of successful submissions > Perfect execution of broken platforms**

Generated: ${new Date().toISOString()}
`;

    await fs.writeFile('./immediate-working-platforms.md', actionPlan, 'utf8');
    console.log('✅ Generated immediate-working-platforms.md');
    
    return actionPlan;
  }

  /**
   * Get business data for copy-paste
   */
  getBusinessDataString() {
    return `
COPY-PASTE BUSINESS DATA:

Business Name: ${this.businessData.fullName}
Short Name: ${this.businessData.shortName}  
Website: ${this.businessData.website}
Email: ${this.businessData.email}
Phone: ${this.businessData.phone}
Address: ${this.businessData.address}

Description: ${this.businessData.description}
Keywords: ${this.businessData.keywords}
Category: ${this.businessData.category}
`;
  }

  /**
   * Get critical platforms only
   */
  getCriticalPlatforms() {
    return this.guaranteedWorkingPlatforms.socialMedia
      .filter(p => p.priority === 'CRITICAL')
      .map(p => ({
        name: p.name,
        url: p.submitUrl,
        time: p.timeToComplete,
        success: p.successRate,
        instructions: p.instructions
      }));
  }
}

// CLI Interface  
async function main() {
  const finder = new WorkingPlatformsFinder();
  const command = process.argv[2];

  switch (command) {
    case 'generate':
      await finder.generateImmediateActionPlan();
      break;

    case 'data':
      console.log(finder.getBusinessDataString());
      break;

    case 'critical':
      console.log('🔴 CRITICAL PLATFORMS - DO THESE FIRST:\n');
      const critical = finder.getCriticalPlatforms();
      critical.forEach((platform, index) => {
        console.log(`${index + 1}. ${platform.name} (${platform.time})`);
        console.log(`   URL: ${platform.url}`);
        console.log(`   Success: ${platform.success}%`);
        console.log(`   Instructions: ${platform.instructions}\n`);
      });
      break;

    default:
      console.log(`
⚡ Working Platforms Finder - Skip Broken Directories

Commands:
  generate    - Create complete working platforms action plan
  data        - Show copy-paste business data
  critical    - Show only critical platforms for immediate action

Examples:
  node working-platforms.cjs generate
  node working-platforms.cjs data
  node working-platforms.cjs critical
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WorkingPlatformsFinder };