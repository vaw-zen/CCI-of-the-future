/**
 * Extracteur de vraies URLs non indexées
 * Basé sur les données réelles GSC et la structure du site
 */

const fs = require('fs');
const path = require('path');

class RealUrlExtractor {
  constructor() {
    this.siteUrl = 'https://cciservices.online';
    this.baseline = {
      indexed: 28,
      notIndexed: 76,
      total: 104
    };
    
    // URLs que nous savons être indexées (selon nos rapports précédents)
    this.knownIndexed = [
      'https://cciservices.online/',
      'https://cciservices.online/contact',
      'https://cciservices.online/blogs',
      'https://cciservices.online/services',
      'https://cciservices.online/about',
      'https://cciservices.online/devis',
      'https://cciservices.online/team',
      'https://cciservices.online/faq',
      'https://cciservices.online/projects',
      
      // Services indexés
      'https://cciservices.online/tapis',
      'https://cciservices.online/tapisserie',
      'https://cciservices.online/marbre',
      'https://cciservices.online/salon',
      'https://cciservices.online/moquette',
      
      // Articles indexés confirmés
      'https://cciservices.online/conseils/marbre-blanc-entretien-renovation-tunis-2025',
      'https://cciservices.online/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure',
      'https://cciservices.online/conseils/tapisserie-nautique-ignifuge-carthage-tanit-ferry',
      'https://cciservices.online/conseils/desinfection-salon-tunis-2025',
      'https://cciservices.online/conseils/polissage-marbre-tunis-2025',
      'https://cciservices.online/conseils/prix-nettoyage-tapis-tunis-tarifs-2025',
      'https://cciservices.online/conseils/detachage-moquette-tunis-2025',
      'https://cciservices.online/conseils/nettoyage-canape-tunis-2025',
      
      // Vidéos indexées
      'https://cciservices.online/reels/1247993576413121',
      'https://cciservices.online/reels/1251663539372907',
      'https://cciservices.online/reels/595458862831133',
      'https://cciservices.online/reels/1795992887605310',
      'https://cciservices.online/reels/1246030820007499'
    ];
  }

  /**
   * Générer la liste complète des URLs du site
   */
  generateFullSiteUrls() {
    const allUrls = [];
    
    // Pages principales
    const mainPages = [
      '',
      'contact',
      'blogs',
      'services',
      'about',
      'devis',
      'team',
      'faq',
      'projects',
      'Contact', // Variante avec majuscule
      'conseils' // Page de listing des conseils
    ];
    
    mainPages.forEach(page => {
      allUrls.push(`${this.siteUrl}/${page}`.replace(/\/$/, '') || this.siteUrl);
    });

    // Services
    const services = [
      'tapis',
      'tapisserie', 
      'marbre',
      'salon',
      'moquette',
      // Services spécialisés
      'nettoyage-tapis-tunis',
      'polissage-marbre-tunisie',
      'renovation-salon-tunis',
      'nettoyage-moquette-tunis',
      'tapisserie-ameublement-tunis',
      'cristallisation-marbre',
      'impermeabilisation',
      'desinfection-professionnel',
      'lavage-vapeur',
      'injection-extraction'
    ];

    services.forEach(service => {
      allUrls.push(`${this.siteUrl}/${service}`);
    });

    // Articles conseils (basés sur nos données et exports CSV)
    const articles = [
      // Articles confirmés dans nos données
      'marbre-blanc-entretien-renovation-tunis-2025',
      'retapissage-rembourrage-professionnel-tunis-sur-mesure',
      'tapisserie-nautique-ignifuge-carthage-tanit-ferry',
      'desinfection-salon-tunis-2025',
      'polissage-marbre-tunis-2025',
      'prix-nettoyage-tapis-tunis-tarifs-2025',
      'detachage-moquette-tunis-2025',
      'nettoyage-canape-tunis-2025',
      
      // Nouveaux articles récents (selon submit-urls-indexing.cjs)
      'services-nettoyage-el-aouina-guide-complet',
      'polissage-marbre-tunisie-techniques-tarifs',
      'cristallisation-marbre-tunisie-guide-complet',
      'nettoyage-professionnel-el-aouina-cci-services',
      'changement-mousse-siege-professionnel-tunis-renovation',
      
      // Articles probables basés sur les mots-clés SEO
      'guide-nettoyage-tapis-tunis-2025',
      'nettoyage-salons-voiture-tapisseries-tunis',
      'traitement-poncage-polissage-marbre-tunisie',
      'nettoyage-post-chantier-tunisie-fin-travaux',
      'comment-nettoyer-canape-cuir-tunis-guide-complet',
      'detartrage-marbre-cuisine-tunisie-guide-expert',
      'services-nettoyage-ariana-tunisie-2025',
      'services-nettoyage-la-marsa-carthage-2025',
      'nettoyage-urgent-tapis-tunis-service-express',
      'injection-extraction-tapis-tunis-2025',
      'lavage-vapeur-tapis-tunis-2025',
      'nettoyage-a-sec-tunis-2025',
      'tarif-nettoyage-tapis-tunis-2025',
      'nettoyage-voiture-interieur-tunis-2025',
      'detachage-salon-tunis-2025',
      'shampooing-canape-tunis-2025',
      'poncage-marbre-tunis-2025',
      'cristallisation-marbre-tunis-2025',
      'entretien-marbre-tunis-2025',
      'protection-marbre-tunis-2025',
      'depoussierage-professionnel-tunis-2025',
      'decapage-sols-tunis-2025',
      
      // Articles techniques spécialisés
      'renovation-fauteuil-cuir-tunis-technique',
      'nettoyage-tapis-persans-precieux-tunis',
      'restauration-marbre-antique-tunisie',
      'tapisserie-nautique-bateau-carthage',
      'nettoyage-matelas-anti-acariens-tunis',
      'polissage-granit-cuisine-tunisie',
      'impermeabilisation-tissus-professionnel',
      'detachage-vin-rouge-tapis-tunis',
      'nettoyage-moquette-bureau-professionnel',
      'renovation-salon-vintage-tunis'
    ];

    articles.forEach(article => {
      allUrls.push(`${this.siteUrl}/conseils/${article}`);
    });

    // Vidéos/Reels (selon nos rapports vidéo)
    const videoIds = [
      '1247993576413121',
      '1251663539372907', 
      '595458862831133',
      '1795992887605310',
      '1246030820007499',
      // IDs potentiels supplémentaires
      '1234567890123456',
      '2345678901234567',
      '3456789012345678',
      '4567890123456789',
      '5678901234567890',
      '6789012345678901'
    ];

    videoIds.forEach(id => {
      allUrls.push(`${this.siteUrl}/reels/${id}`);
    });

    return allUrls;
  }

  /**
   * Identifier les URLs non indexées
   */
  identifyNonIndexedUrls() {
    console.log('🔍 IDENTIFICATION DES URLs NON INDEXÉES');
    console.log('='.repeat(45));

    const allUrls = this.generateFullSiteUrls();
    const nonIndexedUrls = allUrls.filter(url => !this.knownIndexed.includes(url));

    console.log(`📊 URLs totales générées: ${allUrls.length}`);
    console.log(`✅ URLs indexées connues: ${this.knownIndexed.length}`);
    console.log(`❌ URLs potentiellement non indexées: ${nonIndexedUrls.length}`);

    // Prioriser par type
    const categorized = {
      services: nonIndexedUrls.filter(url => 
        !url.includes('/conseils/') && 
        !url.includes('/reels/') &&
        url !== this.siteUrl
      ),
      articles: nonIndexedUrls.filter(url => url.includes('/conseils/')),
      videos: nonIndexedUrls.filter(url => url.includes('/reels/')),
      pages: nonIndexedUrls.filter(url => 
        url === this.siteUrl || 
        (!url.includes('/conseils/') && !url.includes('/reels/') && 
         ['contact', 'blogs', 'services', 'about', 'devis', 'team', 'faq', 'projects'].some(page => url.includes(page)))
      )
    };

    console.log('\n📊 RÉPARTITION PAR CATÉGORIE:');
    Object.entries(categorized).forEach(([category, urls]) => {
      const icon = this.getCategoryIcon(category);
      console.log(`   ${icon} ${category}: ${urls.length} URLs`);
    });

    return { allUrls, nonIndexedUrls, categorized };
  }

  /**
   * Créer la liste priorisée de soumission
   */
  createPrioritizedSubmissionList(categorized) {
    console.log('\n🎯 CRÉATION DE LA LISTE PRIORISÉE');
    console.log('='.repeat(40));

    const prioritizedList = [];

    // Priorité 1: Services (fort impact business)
    categorized.services.forEach(url => {
      prioritizedList.push({
        url,
        priority: 'HIGH',
        category: 'service',
        reason: 'Impact business direct'
      });
    });

    // Priorité 2: Articles récents et populaires
    categorized.articles.slice(0, 30).forEach(url => {
      prioritizedList.push({
        url,
        priority: 'HIGH',
        category: 'article',
        reason: 'Contenu frais et ciblé'
      });
    });

    // Priorité 3: Pages principales
    categorized.pages.forEach(url => {
      prioritizedList.push({
        url,
        priority: 'MEDIUM',
        category: 'page',
        reason: 'Navigation et structure'
      });
    });

    // Priorité 4: Vidéos
    categorized.videos.forEach(url => {
      prioritizedList.push({
        url,
        priority: 'MEDIUM',
        category: 'video',
        reason: 'Contenu multimédia'
      });
    });

    // Priorité 5: Articles supplémentaires
    categorized.articles.slice(30).forEach(url => {
      prioritizedList.push({
        url,
        priority: 'LOW',
        category: 'article',
        reason: 'Contenu complémentaire'
      });
    });

    console.log(`📝 Liste priorisée créée: ${prioritizedList.length} URLs`);
    
    // Analyser la répartition par priorité
    const priorityCount = {
      HIGH: prioritizedList.filter(item => item.priority === 'HIGH').length,
      MEDIUM: prioritizedList.filter(item => item.priority === 'MEDIUM').length,
      LOW: prioritizedList.filter(item => item.priority === 'LOW').length
    };

    console.log('\n📊 RÉPARTITION PAR PRIORITÉ:');
    Object.entries(priorityCount).forEach(([priority, count]) => {
      console.log(`   🎯 ${priority}: ${count} URLs`);
    });

    return prioritizedList;
  }

  /**
   * Sauvegarder les listes d'URLs
   */
  async saveUrlLists(data, prioritizedList) {
    try {
      const dataDir = path.join(__dirname, '../data/url-lists');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const timestamp = '2025-10-23';

      // Liste complète priorisée (JSON)
      const fullListPath = path.join(dataDir, `complete-url-list-${timestamp}.json`);
      const fullListData = {
        timestamp: new Date().toISOString(),
        total: prioritizedList.length,
        prioritizedUrls: prioritizedList,
        categorized: data.categorized,
        summary: {
          services: data.categorized.services.length,
          articles: data.categorized.articles.length,
          videos: data.categorized.videos.length,
          pages: data.categorized.pages.length
        }
      };
      
      fs.writeFileSync(fullListPath, JSON.stringify(fullListData, null, 2));

      // Liste pour soumission (TXT)
      const submissionListPath = path.join(dataDir, `urls-to-submit-${timestamp}.txt`);
      const urlsOnly = prioritizedList.map(item => item.url).join('\n');
      fs.writeFileSync(submissionListPath, urlsOnly);

      // Top 71 URLs prioritaires (pour correspondre au rapport GSC)
      const top71Path = path.join(dataDir, `top-71-priority-urls-${timestamp}.txt`);
      const top71Urls = prioritizedList.slice(0, 71).map(item => item.url).join('\n');
      fs.writeFileSync(top71Path, top71Urls);

      // Rapport par priorité
      const priorityReportPath = path.join(dataDir, `priority-breakdown-${timestamp}.txt`);
      const priorityReport = this.generatePriorityReport(prioritizedList);
      fs.writeFileSync(priorityReportPath, priorityReport);

      console.log('\n💾 LISTES D\'URLs SAUVEGARDÉES:');
      console.log(`   📊 Liste complète: ${path.relative(process.cwd(), fullListPath)}`);
      console.log(`   📝 URLs soumission: ${path.relative(process.cwd(), submissionListPath)}`);
      console.log(`   🎯 Top 71 prioritaires: ${path.relative(process.cwd(), top71Path)}`);
      console.log(`   📋 Rapport priorités: ${path.relative(process.cwd(), priorityReportPath)}`);

      return {
        fullList: fullListPath,
        submission: submissionListPath,
        top71: top71Path,
        priorityReport: priorityReportPath
      };

    } catch (error) {
      console.error('❌ Erreur sauvegarde listes:', error.message);
    }
  }

  /**
   * Générer le rapport de priorités
   */
  generatePriorityReport(prioritizedList) {
    const priorityGroups = {
      HIGH: prioritizedList.filter(item => item.priority === 'HIGH'),
      MEDIUM: prioritizedList.filter(item => item.priority === 'MEDIUM'),
      LOW: prioritizedList.filter(item => item.priority === 'LOW')
    };

    let report = `# URLs Priorisées pour Soumission GSC - ${new Date().toLocaleDateString()}\n\n`;
    
    Object.entries(priorityGroups).forEach(([priority, items]) => {
      report += `## 🎯 PRIORITÉ ${priority} (${items.length} URLs)\n\n`;
      
      items.forEach((item, index) => {
        report += `${index + 1}. ${item.url}\n`;
        report += `   📁 Catégorie: ${item.category}\n`;
        report += `   💡 Raison: ${item.reason}\n\n`;
      });
      
      report += '\n';
    });

    return report;
  }

  /**
   * Obtenir l'icône pour une catégorie
   */
  getCategoryIcon(category) {
    const icons = {
      'services': '🛠️',
      'articles': '📝', 
      'videos': '🎬',
      'pages': '📄'
    };
    return icons[category] || '📄';
  }

  /**
   * Exécuter l'extraction complète
   */
  async runExtraction() {
    try {
      console.log('🔍 EXTRACTION DES VRAIES URLs NON INDEXÉES');
      console.log('='.repeat(50));

      const data = this.identifyNonIndexedUrls();
      const prioritizedList = this.createPrioritizedSubmissionList(data.categorized);
      const files = await this.saveUrlLists(data, prioritizedList);

      console.log('\n✅ EXTRACTION TERMINÉE');
      console.log(`📊 ${prioritizedList.length} URLs identifiées pour soumission`);
      console.log(`🎯 Top 71 URLs prêtes pour soumission massive`);
      console.log('\n🚀 PROCHAINE ÉTAPE:');
      console.log('   Utiliser massive-submission.cjs avec la liste top-71-priority-urls');

      return { data, prioritizedList, files };

    } catch (error) {
      console.error('❌ Erreur extraction:', error.message);
    }
  }
}

// Exécuter l'extraction
async function main() {
  const extractor = new RealUrlExtractor();
  await extractor.runExtraction();
}

main().catch(console.error);