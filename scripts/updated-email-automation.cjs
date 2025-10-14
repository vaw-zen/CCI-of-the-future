// Alternative email automation with more generic contact emails
require('dotenv').config({ path: '../.env.local' });
const nodemailer = require('nodemailer');

class UpdatedEmailBacklinkAutomation {
  constructor() {
    // Configure Gmail transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'cci.services.tn@gmail.com',
        pass: process.env.GMAIL_PASS || 'ztofhlikbiqntotd'
      }
    });

    // Updated targets with more reliable generic emails
    this.targets = {
      tunisiaDirectories: [
        // Generic contacts more likely to exist
        'info@tayara.tn',
        'contact@tayara.tn',
        'support@tayara.tn',
        'info@jumia.com.tn',
        'contact@jumia.com.tn',
        'hello@tunisie.co',
        'contact@tunisie.co',
        'info@webmanagercenter.com',
        'redaction@webmanagercenter.com',
        'contact@businessnews.com.tn',
        'redaction@businessnews.com.tn',
        'info@kapitalis.com',
        'redaction@kapitalis.com',
        'contact@lapresse.tn',
        'redaction@lapresse.tn'
      ],
      
      socialPlatforms: [
        // Social media and platform contacts
        'contact@facebook.com',
        'business@facebook.com',
        'help@instagram.com',
        'business@instagram.com',
        'support@linkedin.com',
        'contact@linkedin.com',
        'hello@twitter.com',
        'support@twitter.com',
        'info@tiktok.com',
        'business@tiktok.com',
        'hello@snapchat.com',
        'support@snapchat.com'
      ],

      businessPlatforms: [
        // Business directory contacts
        'hello@google.com',
        'support@google.com',
        'contact@bing.com',
        'info@yelp.com',
        'hello@tripadvisor.com',
        'contact@foursquare.com',
        'info@yellowpages.com',
        'contact@whitepages.com',
        'hello@hotfrog.com',
        'info@cylex.com',
        'contact@europages.com',
        'hello@kompass.com'
      ]
    };

    this.templates = {
      platformSubmission: {
        subject: 'Business Listing Request - CCI Services Tunisia',
        body: `Hello,

I would like to add our company to your business directory/platform:

Company: CCI Services - Professional Cleaning Tunisia
Website: https://cciservices.online/
Email: cci.services.tn@gmail.com
Phone: +216 98 557 766
Address: 06 Rue Galant de nuit, El Aouina, 2045 Tunis, Tunisia

Services:
- Marble restoration and polishing
- Carpet and upholstery cleaning
- Post-construction cleaning
- Commercial office cleaning
- Hotel and restaurant services

Established: 10+ years experience in Tunis area
Service area: Greater Tunis region

Please let me know the process to list our business.

Best regards,
Chaabane
CCI Services Tunisia`
      },

      directorySubmissionFR: {
        subject: 'Demande ajout annuaire - CCI Services Tunisie',
        body: `Bonjour,

Je souhaite ajouter notre entreprise a votre plateforme :

Entreprise: CCI Services - Nettoyage Professionnel Tunisie
Site web: https://cciservices.online/
Email: cci.services.tn@gmail.com
Telephone: +216 98 557 766
Adresse: 06 Rue Galant de nuit, El Aouina, 2045 Tunis, Tunisia

Services proposes:
- Restauration et polissage marbre
- Nettoyage moquettes et tapisserie
- Nettoyage post-travaux
- Entretien bureaux commerciaux
- Services hotellerie et restauration

Experience: 10+ ans dans la region de Tunis
Zone intervention: Grand Tunis

Merci de m'indiquer la procedure d'inscription.

Cordialement,
Chaabane
CCI Services Tunisie`
      }
    };
  }

  async sendBulkEmails(targetCategory, templateName) {
    const targets = this.targets[targetCategory];
    const template = this.templates[templateName];
    
    if (!targets || !template) {
      throw new Error('Invalid target category or template');
    }

    console.log(`Starting campaign: ${targetCategory} with ${targets.length} targets`);
    const results = [];

    for (const email of targets) {
      try {
        await this.transporter.sendMail({
          from: process.env.GMAIL_USER || 'cci.services.tn@gmail.com',
          to: email,
          subject: template.subject,
          text: template.body
        });

        console.log(`✅ Sent to: ${email}`);
        results.push({ email, status: 'sent', timestamp: new Date() });
        
        // Wait 2 seconds between emails to avoid spam detection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`❌ Failed to send to ${email}: ${error.message}`);
        results.push({ email, status: 'failed', error: error.message, timestamp: new Date() });
      }
    }

    console.log(`\nCampaign completed: ${results.filter(r => r.status === 'sent').length}/${targets.length} emails sent`);
    return results;
  }
}

// Command line usage
if (require.main === module) {
  const automation = new UpdatedEmailBacklinkAutomation();
  
  const campaign = process.argv[2];
  const template = process.argv[3] || 'platformSubmission';

  if (!campaign) {
    console.log(`
📧 Updated Email Backlink Automation (Generic Contacts)

Campaigns:
  tunisia-directories    - Send to 15 Tunisia platforms (generic emails)
  social-platforms      - Send to 12 social media platforms
  business-platforms    - Send to 12 business directories

Templates:
  platformSubmission    - English template for international platforms
  directorySubmissionFR - French template for Tunisia/Francophone

Usage:
  node updated-email-automation.cjs tunisia-directories platformSubmission
  node updated-email-automation.cjs social-platforms platformSubmission
  node updated-email-automation.cjs business-platforms directorySubmissionFR
`);
  } else {
    // Convert kebab-case to camelCase
    const camelCaseCampaign = campaign.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    automation.sendBulkEmails(camelCaseCampaign, template)
      .then(() => console.log('✅ All done!'))
      .catch(err => console.error('❌ Error:', err));
  }
}

module.exports = UpdatedEmailBacklinkAutomation;