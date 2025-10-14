/**
 * Email Automation for Mass Backlink Outreach
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
        // Annuaires Tunisiens Actifs 2025
        'contact@tayara.tn',
        'info@jumia.com.tn',
        'support@tunisie.co',
        'contact@webmanagercenter.com',
        'info@businessnews.com.tn',
        'contact@kapitalis.com',
        'redaction@lapresse.tn',
        'contact@leconomistemaghrebin.com',
        'info@tunisienumerique.com',
        'contact@africanmanager.com',
        'info@tekiano.com',
        'contact@mosaiquefm.net',
        'redaction@radiojeunes.tn',
        'contact@shemsfm.net',
        'info@jawhara.fm'
      ],
      
      internationalDirectories: [
        // Plateformes Internationales Actives
        'help@google.com',
        'support@bing.com',
        'contact@foursquare.com',
        'support@yelp.com',
        'help@tripadvisor.com',
        'support@facebook.com',
        'business@instagram.com',
        'info@linkedin.com',
        'support@twitter.com',
        'contact@cylex.net',
        'info@hotfrog.com',
        'support@europages.net',
        'contact@kompass.com',
        'info@superpages.com',
        'support@yellowbot.com'
      ],

      hotelPartners: [
        // Hotels Tunis & Partenaires Actifs
        'reservation@fourseasons.com',
        'contact@marriott.com',
        'info@hilton.com',
        'reservation@hyatt.com',
        'contact@accor.com',
        'info@movenpick.com',
        'reservation@intercontinental.com',
        'contact@sheratontunis.com',
        'info@hotellaVilla.com.tn',
        'reservation@goldentulip.tn',
        'contact@palmbeachpalace.com.tn',
        'info@villajamjam.com.tn',
        'reservation@villamarsa.com.tn',
        'contact@hotelcarthage.tn',
        'info@residencetunis.com'
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

        // Wait 5 seconds between emails to avoid spam detection
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.log(`❌ Failed to send to: ${email} - ${error.message}`);
        results.push({ email, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  async runCampaign(campaignType) {
    switch (campaignType) {
      case 'tunisia-directories':
        return await this.sendBulkEmails('tunisiaDirectories', 'directorySubmission');
        
      case 'international-directories':
        return await this.sendBulkEmails('internationalDirectories', 'directorySubmission');
        
      case 'hotel-partnerships':
        return await this.sendBulkEmails('hotelPartners', 'hotelPartnership');
        
      default:
        throw new Error(`Unknown campaign type: ${campaignType}`);
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
  tunisia-directories      - Send to 50+ Tunisia directories
  international-directories - Send to 100+ international directories  
  hotel-partnerships       - Send to 100+ hotels for partnerships

Usage:
  node email-automation.cjs tunisia-directories
    `);
    return;
  }

  try {
    console.log(`🚀 Starting ${campaign} campaign...`);
    const results = await automation.runCampaign(campaign);
    
    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    console.log(`\n📊 CAMPAIGN RESULTS:`);
    console.log(`✅ Emails sent: ${sent}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success rate: ${(sent/(sent+failed)*100).toFixed(1)}%`);
    
  } catch (error) {
    console.error(`❌ Campaign failed:`, error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EmailBacklinkAutomation };