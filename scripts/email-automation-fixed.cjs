/**
 * Email Automation for Mass Backlink Outreach - Fixed Version
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

class EmailBacklinkAutomation {
  constructor() {
    // Setup Gmail SMTP using environment variables
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'cci.services.tn@gmail.com',
        pass: process.env.GMAIL_PASS || 'ztofhlikbiqntotd'
      }
    });

    this.targets = {
      tunisiaDirectories: [
        'contact@tunisie-annuaire.com',
        'info@businesslist.tn',
        'admin@tunisia-business.net',
        'support@tunis-pages.com',
        'contact@pages-jaunes.tn',
        'info@annuaire-tunisie.org',
        'admin@tunis-directory.com',
        'contact@business-tunisia.tn'
      ],
      
      internationalDirectories: [
        'submissions@hotfrog.com',
        'support@cylex.com', 
        'contact@europages.com',
        'info@businesslist.org',
        'admin@yellowpages.com',
        'support@foursquare.com',
        'contact@crunchbase.com',
        'info@manta.com'
      ],

      hotelPartners: [
        'info@hotel-tunisia.com',
        'contact@tunis-hotels.tn', 
        'reservation@hotel-carthage.com',
        'info@lavilla-tunis.com',
        'contact@movenpick-tunis.com'
      ]
    };

    this.templates = {
      directorySubmission: {
        subject: 'Demande ajout - CCI Services (Leader Nettoyage Professionnel Tunis)',
        body: `Bonjour,

Je souhaite ajouter mon entreprise a votre annuaire professionnel :

CCI Services - Chaabane's Cleaning Intelligence
- Site web : https://cciservices.online/
- Email : cci.services.tn@gmail.com  
- Telephone : +216 98 557 766
- Adresse : 06 Rue Galant de nuit, El Aouina, 2045 Tunis, Tunisia

Nos Services Specialises :
- Nettoyage et Restauration Marbre (polissage, cristallisation, poncage)
- Nettoyage Moquettes et Tapis (injection-extraction professionnel)
- Nettoyage Salons et Tapisserie d'ameublement  
- Nettoyage Post-Chantier et Travaux
- Entretien Bureaux et Espaces Commerciaux
- Services Hotellerie et Restauration

Entreprise etablie : 10+ ans d'experience a Tunis
Zone d'intervention : Grand Tunis et environs
Secteur : Services de nettoyage professionnel

Merci de m'indiquer la procedure pour referencer notre entreprise.

Cordialement,
Chaabane
CCI Services - Leader Nettoyage Professionnel Tunis`
      },

      hotelPartnership: {
        subject: 'Partenariat Nettoyage Hotellerie - CCI Services (10+ ans experience)',
        body: `Bonjour,

CCI Services, leader du nettoyage professionnel a Tunis depuis 10+ ans, propose des services specialises hotellerie :

SERVICES HOTELLERIE SPECIALISES :
- Nettoyage chambres et suites (standards hoteliers)
- Entretien espaces communs et halls d'accueil
- Restauration et polissage marbre (sols, comptoirs, escaliers)
- Nettoyage moquettes injection-extraction (couloirs, chambres)
- Entretien tapisserie et mobilier d'ameublement
- Nettoyage post-travaux et renovation
- Desinfection professionnelle espaces

AVANTAGES PARTENARIAT :
- Intervention rapide 7j/7 si urgence
- Equipe formee aux standards hoteliers
- Materiel professionnel de pointe
- Tarifs preferentiels sur contrat annuel
- Devis gratuit et personnalise

Contact : +216 98 557 766
References : https://cciservices.online/
Email : cci.services.tn@gmail.com

Nous serions ravis de discuter d'un partenariat adapte a vos besoins.

Cordialement,
Chaabane
CCI Services - Nettoyage Professionnel Hotellerie`
      }
    };
  }

  async sendBulkEmails(targetCategory, templateName) {
    const targets = this.targets[targetCategory];
    const template = this.templates[templateName];
    
    if (!targets || !template) {
      throw new Error('Invalid target category or template');
    }

    const results = [];
    let successCount = 0;

    for (const email of targets) {
      try {
        await this.transporter.sendMail({
          from: process.env.GMAIL_USER || 'cci.services.tn@gmail.com',
          to: email,
          subject: template.subject,
          text: template.body
        });

        console.log(`✅ Email sent to: ${email}`);
        results.push({ email, status: 'sent' });
        successCount++;

        // Wait 5 seconds between emails to avoid spam detection
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.log(`❌ Failed to send to: ${email} - ${error.message}`);
        results.push({ email, status: 'failed', error: error.message });
      }
    }

    return { results, successCount, totalSent: targets.length };
  }

  async runCampaign(campaignType) {
    console.log(`🚀 Starting ${campaignType} campaign...`);
    
    switch (campaignType) {
      case 'tunisia-directories':
        return await this.sendBulkEmails('tunisiaDirectories', 'directorySubmission');
        
      case 'international-directories':
        return await this.sendBulkEmails('internationalDirectories', 'directorySubmission');
        
      case 'hotel-partnerships':
        return await this.sendBulkEmails('hotelPartners', 'hotelPartnership');
        
      default:
        throw new Error('Unknown campaign type: ' + campaignType);
    }
  }
}

// CLI Usage
async function main() {
  const automation = new EmailBacklinkAutomation();
  const campaign = process.argv[2];

  if (!campaign) {
    console.log(`
📧 Email Backlink Automation

Campaigns:
  tunisia-directories      - Send to Tunisia directories (8 targets)
  international-directories - Send to international directories (8 targets)  
  hotel-partnerships       - Send to hotels for partnerships (5 targets)

Usage:
  node email-automation-fixed.cjs tunisia-directories
    `);
    return;
  }

  try {
    const campaignResult = await automation.runCampaign(campaign);
    
    console.log(`\\n📊 CAMPAIGN RESULTS:`);
    console.log(`✅ Emails sent successfully: ${campaignResult.successCount}`);
    console.log(`❌ Failed emails: ${campaignResult.totalSent - campaignResult.successCount}`);
    console.log(`📈 Success rate: ${(campaignResult.successCount/campaignResult.totalSent*100).toFixed(1)}%`);
    console.log(`\\n🎯 Expected backlinks in 1-2 weeks: ${Math.floor(campaignResult.successCount * 0.6)}-${Math.floor(campaignResult.successCount * 0.8)}`);
    
  } catch (error) {
    console.error(`❌ Campaign failed:`, error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EmailBacklinkAutomation };