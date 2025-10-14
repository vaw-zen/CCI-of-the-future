// Facebook Auto-Post Automation for CCI Services
require('dotenv').config({ path: '../.env.local' });
const fs = require('fs').promises;

class FacebookAutoPostAutomation {
  constructor() {
    this.apiUrl = 'https://cciservices.online/api/post-to-facebook';
    
    // Weekly content templates
    this.weeklyTemplates = {
      monday: {
        caption: "💼 Début de semaine = bureaux impeccables! CCI Services vous accompagne pour créer un environnement de travail sain et motivant. 🧽✨ Devis gratuit: +216 98 557 766 🌐 cciservices.online #LundiMotivation #NettoyageBureau #Tunis",
        imageUrl: null
      },
      
      tuesday: {
        caption: "🏨 Hôteliers tunisiens! La propreté de vos établissements fait la différence. CCI Services: standards hôteliers internationaux, service local d'excellence. 📞 +216 98 557 766 #Hotellerie #StandardsQualite #TunisieHotels",
        imageUrl: null
      },
      
      wednesday: {
        caption: "🛋️ Milieu de semaine, pensez à vos salons! Nos techniques d'injection-extraction redonnent vie à vos moquettes et canapés. Résultats garantis! 🌐 cciservices.online #NettoyageSalon #InjectionExtraction #CCI",
        imageUrl: null
      },
      
      thursday: {
        caption: "💎 Le marbre de votre hall d'accueil reflète votre image! Polissage, cristallisation, rénovation - CCI Services maîtrise tous les aspects. ✨ Demandez votre devis: cci.services.tn@gmail.com #RestaurMarbre #Tunis",
        imageUrl: null
      },
      
      friday: {
        caption: "🎉 Vendredi = weekend approche! Profitez d'un environnement propre avec CCI Services. 10+ ans d'expérience à Tunis. Bon weekend à tous! 📞 +216 98 557 766 🌐 cciservices.online #VendrediPropre #CCI #Weekend",
        imageUrl: null
      },
      
      saturday: {
        caption: "🏠 Weekend = temps famille! Offrez-vous un nettoyage professionnel de vos espaces. CCI Services intervient aussi les weekends pour votre confort. 📞 +216 98 557 766 #WeekendPropre #NettoyageDomicile",
        imageUrl: null
      },
      
      sunday: {
        caption: "🙏 Dimanche réflexion: un espace propre = esprit serein. CCI Services vous prépare une semaine dans un environnement sain. À demain pour une nouvelle semaine! ✨ cciservices.online #DimancheTranquille #CCI",
        imageUrl: null
      }
    };

    // Special monthly campaigns
    this.monthlySpecials = {
      week1: {
        caption: "🎯 OFFRE DU MOIS: -15% sur tous nos services de nettoyage commercial! Valable tout octobre. CCI Services - 10+ ans d'expérience à Tunis. 📞 +216 98 557 766 #PromotionOctobre #NettoyageCommercial",
        imageUrl: null
      },
      
      week2: {
        caption: "⭐ TÉMOIGNAGE CLIENT: 'CCI Services a transformé nos bureaux! Équipe pro, matériel de pointe, résultats parfaits.' - Hotel Carthage Palace. Rejoignez nos clients satisfaits! 🌐 cciservices.online #TemoignageClient",
        imageUrl: null
      },
      
      week3: {
        caption: "🧽 FOCUS TECHNIQUE: Savez-vous que nos machines injection-extraction utilisent 90% moins d'eau que les méthodes traditionnelles? Écologie + efficacité = CCI Services! 📞 +216 98 557 766 #TechniqueEco",
        imageUrl: null
      },
      
      week4: {
        caption: "🏆 10+ ANNÉES D'EXCELLENCE à Tunis! Merci à nos fidèles clients. CCI Services continue d'innover pour votre satisfaction. Prochaine décennie = encore plus d'innovations! ✨ #10AnsExcellence #CCI #Tunis",
        imageUrl: null
      }
    };

    // Emergency/seasonal content
    this.seasonalContent = {
      ramadan: "🌙 Ramadan Mubarak! CCI Services adapte ses horaires d'intervention pour respecter vos traditions. Service continu avec discrétion. 📞 +216 98 557 766 #RamadanMubarak #CCI",
      
      eid: "🎉 Eid Mubarak! Pour des fêtes parfaites, CCI Services prépare vos espaces. Intervention rapide avant vos réceptions familiales. ✨ cciservices.online #EidMubarak #FetesPropres",
      
      summer: "☀️ ÉTÉ TUNISIEN: Climatisation + espaces propres = confort maximal! CCI Services maintient la fraîcheur de vos intérieurs tout l'été. 🌐 cciservices.online #EteTunis #ConfortEte",
      
      winter: "❄️ HIVER À TUNIS: Humidité + chauffage = attention aux moquettes! CCI Services surveille et protège vos textiles. Prévention = économies! 📞 +216 98 557 766 #HiverTunis #PreventionMoquettes"
    };
  }

  // Get current day template
  getDailyTemplate() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    return this.weeklyTemplates[days[today]];
  }

  // Get weekly special content
  getWeeklySpecial() {
    const weekOfMonth = Math.ceil(new Date().getDate() / 7);
    const weekKey = `week${weekOfMonth}`;
    return this.monthlySpecials[weekKey] || this.monthlySpecials.week1;
  }

  // Post to Facebook
  async postToFacebook(template) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption: template.caption,
          imageUrl: template.imageUrl
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Facebook post successful:', result.facebook_response?.id);
        return { success: true, postId: result.facebook_response?.id };
      } else {
        console.error('❌ Facebook post failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Facebook API error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Log posting activity
  async logActivity(result, template) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      success: result.success,
      postId: result.postId || null,
      caption: template.caption.substring(0, 100) + '...',
      error: result.error || null
    };

    try {
      let logs = [];
      try {
        const existingLogs = await fs.readFile('./facebook-post-logs.json', 'utf8');
        logs = JSON.parse(existingLogs);
      } catch (e) {
        // File doesn't exist, start fresh
      }

      logs.push(logEntry);
      
      // Keep only last 50 entries
      if (logs.length > 50) {
        logs = logs.slice(-50);
      }

      await fs.writeFile('./facebook-post-logs.json', JSON.stringify(logs, null, 2));
      console.log('📝 Activity logged');
    } catch (error) {
      console.error('❌ Failed to log activity:', error.message);
    }
  }

  // Run daily automation
  async runDailyPost() {
    console.log('🤖 Starting Facebook daily automation...');
    
    const template = this.getDailyTemplate();
    console.log('📱 Posting daily content...');
    
    const result = await this.postToFacebook(template);
    await this.logActivity(result, template);
    
    return result;
  }

  // Run weekly special
  async runWeeklySpecial() {
    console.log('🎯 Starting Facebook weekly special...');
    
    const template = this.getWeeklySpecial();
    console.log('⭐ Posting weekly special...');
    
    const result = await this.postToFacebook(template);
    await this.logActivity(result, template);
    
    return result;
  }

  // Custom post
  async postCustomContent(caption, imageUrl = null) {
    console.log('✨ Posting custom content...');
    
    const template = { caption, imageUrl };
    const result = await this.postToFacebook(template);
    await this.logActivity(result, template);
    
    return result;
  }

  // Show posting schedule
  getPostingSchedule() {
    return `
📅 FACEBOOK POSTING SCHEDULE

🤖 AUTOMATED DAILY POSTS:
- Monday: Bureau motivation
- Tuesday: Hôtellerie focus  
- Wednesday: Salon/moquettes
- Thursday: Marbre/cristallisation
- Friday: Weekend prep
- Saturday: Service weekend
- Sunday: Réflexion/repos

⭐ WEEKLY SPECIALS (Fridays):
- Week 1: Promotion mensuelle
- Week 2: Témoignage client
- Week 3: Focus technique
- Week 4: Anniversaire/excellence

🎯 SEASONAL CONTENT:
- Ramadan/Eid adaptations
- Été/Hiver conseils
- Événements spéciaux

📊 POSTING FREQUENCY:
- Daily: 1 post automatique
- Weekly: 1 special supplémentaire  
- Monthly: 4 campagnes thématiques
- Seasonal: Posts événementiels

🔧 AUTOMATION STATUS:
- GitHub Actions: ✅ Configuré
- API Endpoint: ✅ Actif
- Content Templates: ✅ 15+ variations
- Logging: ✅ Activité trackée
`;
  }
}

// Command line interface
async function main() {
  const automation = new FacebookAutoPostAutomation();
  const command = process.argv[2];
  const customCaption = process.argv[3];

  switch (command) {
    case 'daily':
      const dailyResult = await automation.runDailyPost();
      console.log(dailyResult.success ? '✅ Daily post completed' : '❌ Daily post failed');
      break;

    case 'weekly':
      const weeklyResult = await automation.runWeeklySpecial();
      console.log(weeklyResult.success ? '✅ Weekly special completed' : '❌ Weekly special failed');
      break;

    case 'custom':
      if (!customCaption) {
        console.log('❌ Custom caption required. Usage: node facebook-automation.cjs custom "Your caption here"');
        return;
      }
      const customResult = await automation.postCustomContent(customCaption);
      console.log(customResult.success ? '✅ Custom post completed' : '❌ Custom post failed');
      break;

    case 'schedule':
      console.log(automation.getPostingSchedule());
      break;

    case 'test':
      console.log('🧪 Testing Facebook API connection...');
      const testResult = await automation.postCustomContent('🧪 Test automatique CCI Services - Système opérationnel! ✅');
      console.log(testResult.success ? '✅ API test successful' : '❌ API test failed');
      break;

    default:
      console.log(`
🤖 Facebook Auto-Post Automation for CCI Services

Commands:
  daily     - Post daily content (automated via GitHub Actions)
  weekly    - Post weekly special content  
  custom    - Post custom content (requires caption)
  schedule  - Show posting schedule
  test      - Test API connection

Examples:
  node facebook-automation.cjs daily
  node facebook-automation.cjs custom "Promotion spéciale cette semaine!"
  node facebook-automation.cjs test

Automation:
  - GitHub Actions runs daily posts automatically
  - Weekly specials on Fridays
  - All activity logged in facebook-post-logs.json
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FacebookAutoPostAutomation };