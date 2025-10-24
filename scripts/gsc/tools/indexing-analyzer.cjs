const fs = require('fs');
const path = require('path');

/**
 * Analyseur des données d'indexation GSC
 * Traite les fichiers CSV exportés de Google Search Console
 */
class GSCIndexingAnalyzer {
  constructor() {
    this.data = {
      metadata: null,
      urls: [],
      timeline: []
    };
    this.analysis = {
      totalIndexed: 0,
      videoPages: [],
      articlePages: [],
      servicePages: [],
      otherPages: [],
      indexingTrends: {},
      keyInsights: []
    };
  }

  /**
   * Parse CSV data from GSC exports
   */
  parseCSVData(csvData, type) {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || '';
      });
      result.push(row);
    }
    
    return result;
  }

  /**
   * Analyze URL data from Tableau.csv
   */
  analyzeURLData(tableauData) {
    console.log('📊 ANALYSE DES URLs INDEXÉES');
    console.log('='.repeat(50));

    const urls = this.parseCSVData(tableauData, 'tableau');
    this.data.urls = urls;
    this.analysis.totalIndexed = urls.length;

    console.log(`✅ Total des pages indexées: ${this.analysis.totalIndexed}`);

    // Categorize URLs
    urls.forEach(row => {
      const url = row.URL || row.url || '';
      const lastCrawl = row['Dernière exploration'] || row.lastCrawl || '';

      if (url.includes('/reels/')) {
        this.analysis.videoPages.push({ url, lastCrawl });
      } else if (url.includes('/conseils/')) {
        this.analysis.articlePages.push({ url, lastCrawl });
      } else if (url.match(/\/(tapis|moquette|marbre|tapisserie|salon)$/)) {
        this.analysis.servicePages.push({ url, lastCrawl });
      } else {
        this.analysis.otherPages.push({ url, lastCrawl });
      }
    });

    console.log(`🎬 Pages vidéo indexées: ${this.analysis.videoPages.length}`);
    console.log(`📝 Articles conseils indexés: ${this.analysis.articlePages.length}`);
    console.log(`🏢 Pages services indexées: ${this.analysis.servicePages.length}`);
    console.log(`🔗 Autres pages indexées: ${this.analysis.otherPages.length}`);

    // Display video pages
    if (this.analysis.videoPages.length > 0) {
      console.log('\n🎬 VIDÉOS INDEXÉES:');
      this.analysis.videoPages.forEach((page, i) => {
        console.log(`${i + 1}. ${page.url} (explorée: ${page.lastCrawl})`);
      });
    }

    // Display recent articles
    if (this.analysis.articlePages.length > 0) {
      console.log('\n📝 ARTICLES CONSEILS INDEXÉS:');
      this.analysis.articlePages.forEach((page, i) => {
        const title = page.url.split('/conseils/')[1]?.replace(/-/g, ' ') || 'Article';
        console.log(`${i + 1}. ${title} (explorée: ${page.lastCrawl})`);
      });
    }

    return this.analysis;
  }

  /**
   * Analyze timeline data from Graphique.csv
   */
  analyzeTimelineData(graphiqueData) {
    console.log('\n📈 ANALYSE DE L\'ÉVOLUTION TEMPORELLE');
    console.log('='.repeat(50));

    const timeline = this.parseCSVData(graphiqueData, 'graphique');
    this.data.timeline = timeline;

    // Find key dates and trends
    let previousCount = 0;
    let biggestGain = { date: '', gain: 0, from: 0, to: 0 };
    
    timeline.forEach(row => {
      const date = row.Date || row.date || '';
      const count = parseInt(row['Pages concernées'] || row.pages || '0');
      
      if (previousCount > 0) {
        const gain = count - previousCount;
        if (gain > biggestGain.gain) {
          biggestGain = { date, gain, from: previousCount, to: count };
        }
      }
      
      previousCount = count;
    });

    console.log(`📅 Plus grande progression: ${biggestGain.date}`);
    console.log(`📊 Gain: +${biggestGain.gain} pages (${biggestGain.from} → ${biggestGain.to})`);
    console.log(`📈 Pourcentage: +${((biggestGain.gain / biggestGain.from) * 100).toFixed(1)}%`);

    // Analyze recent trend (last 7 days)
    const recentData = timeline.slice(-7);
    const recentAverage = recentData.reduce((sum, row) => 
      sum + parseInt(row['Pages concernées'] || row.pages || '0'), 0) / recentData.length;

    console.log(`\n📊 Moyenne des 7 derniers jours: ${recentAverage.toFixed(1)} pages`);
    
    // Check for stability
    const lastValue = parseInt(timeline[timeline.length - 1]['Pages concernées'] || '0');
    const stabilityPeriod = timeline.slice(-4).every(row => 
      parseInt(row['Pages concernées'] || '0') === lastValue);
    
    if (stabilityPeriod) {
      console.log(`✅ Stabilisation à ${lastValue} pages depuis 4 jours`);
    }

    this.analysis.indexingTrends = {
      biggestGain,
      recentAverage,
      currentCount: lastValue,
      isStable: stabilityPeriod
    };

    return this.analysis.indexingTrends;
  }

  /**
   * Generate key insights
   */
  generateInsights() {
    console.log('\n💡 INSIGHTS CLÉS');
    console.log('='.repeat(50));

    const insights = [];

    // Video indexing success
    if (this.analysis.videoPages.length >= 5) {
      const insight = `🎬 Succès vidéo: ${this.analysis.videoPages.length}/6 vidéos indexées rapidement`;
      insights.push(insight);
      console.log(`✅ ${insight}`);
    }

    // Article performance
    if (this.analysis.articlePages.length > 0) {
      const insight = `📝 Articles performants: ${this.analysis.articlePages.length} articles conseils indexés`;
      insights.push(insight);
      console.log(`✅ ${insight}`);
    }

    // Growth analysis
    if (this.analysis.indexingTrends.biggestGain?.gain > 10) {
      const gain = this.analysis.indexingTrends.biggestGain;
      const insight = `📈 Explosion d'indexation: +${gain.gain} pages le ${gain.date}`;
      insights.push(insight);
      console.log(`✅ ${insight}`);
    }

    // Strategy effectiveness
    const recentVideos = this.analysis.videoPages.filter(page => 
      page.lastCrawl >= '2025-10-15').length;
    
    if (recentVideos > 0) {
      const insight = `🚀 Stratégie efficace: Soumission individuelle a accéléré l'indexation`;
      insights.push(insight);
      console.log(`✅ ${insight}`);
    }

    this.analysis.keyInsights = insights;
    return insights;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 RAPPORT COMPLET D\'INDEXATION GSC');
    console.log('='.repeat(60));

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIndexedPages: this.analysis.totalIndexed,
        videoPages: this.analysis.videoPages.length,
        articlePages: this.analysis.articlePages.length,
        servicePages: this.analysis.servicePages.length,
        currentTrend: this.analysis.indexingTrends.isStable ? 'Stable' : 'En croissance'
      },
      performance: {
        biggestGrowthDate: this.analysis.indexingTrends.biggestGain?.date,
        biggestGrowthGain: this.analysis.indexingTrends.biggestGain?.gain,
        currentLevel: this.analysis.indexingTrends.currentCount,
        weeklyAverage: this.analysis.indexingTrends.recentAverage
      },
      content: {
        videos: this.analysis.videoPages,
        articles: this.analysis.articlePages,
        services: this.analysis.servicePages,
        others: this.analysis.otherPages
      },
      insights: this.analysis.keyInsights
    };

    console.log('\n🎯 RÉSUMÉ EXÉCUTIF:');
    console.log(`📊 Pages totales indexées: ${report.summary.totalIndexedPages}`);
    console.log(`🎬 Vidéos indexées: ${report.summary.videoPages}/6 (${((report.summary.videoPages/6)*100).toFixed(1)}%)`);
    console.log(`📝 Articles indexés: ${report.summary.articlePages}`);
    console.log(`📈 Tendance actuelle: ${report.summary.currentTrend}`);

    console.log('\n🏆 SUCCÈS MAJEURS:');
    report.insights.forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`);
    });

    return report;
  }

  /**
   * Save analysis report
   */
  saveReport(report) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const reportPath = path.join(__dirname, '../reports', `gsc-indexing-analysis-${timestamp}.json`);
      const mdReportPath = path.join(__dirname, '../reports', `gsc-indexing-analysis-${timestamp}.md`);
      
      // Ensure reports directory exists
      const reportsDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Save JSON report
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // Generate and save Markdown report
      const mdContent = this.generateMarkdownReport(report);
      fs.writeFileSync(mdReportPath, mdContent);

      console.log(`\n📋 Rapports sauvegardés:`);
      console.log(`   JSON: ${reportPath}`);
      console.log(`   Markdown: ${mdReportPath}`);
      
      return { jsonPath: reportPath, mdPath: mdReportPath };
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error.message);
    }
  }

  /**
   * Generate Markdown report
   */
  generateMarkdownReport(report) {
    return `# Analyse d'Indexation GSC
Généré: ${new Date().toLocaleString()}

## 📊 RÉSUMÉ EXÉCUTIF
- **Pages totales indexées:** ${report.summary.totalIndexedPages}
- **Vidéos indexées:** ${report.summary.videoPages}/6 (${((report.summary.videoPages/6)*100).toFixed(1)}%)
- **Articles indexés:** ${report.summary.articlePages}
- **Pages services:** ${report.summary.servicePages}
- **Tendance:** ${report.summary.currentTrend}

## 📈 PERFORMANCE
- **Plus forte croissance:** ${report.performance.biggestGrowthDate} (+${report.performance.biggestGrowthGain} pages)
- **Niveau actuel:** ${report.performance.currentLevel} pages
- **Moyenne hebdomadaire:** ${report.performance.weeklyAverage?.toFixed(1)} pages

## 🎬 VIDÉOS INDEXÉES
${report.content.videos.map((video, i) => `${i + 1}. ${video.url} (${video.lastCrawl})`).join('\n')}

## 📝 ARTICLES CONSEILS
${report.content.articles.map((article, i) => `${i + 1}. ${article.url.split('/conseils/')[1]?.replace(/-/g, ' ')} (${article.lastCrawl})`).join('\n')}

## 💡 INSIGHTS CLÉS
${report.insights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

---
*Rapport généré par l'analyseur GSC*`;
  }
}

// Example usage with provided CSV data
async function analyzePresentedData() {
  console.log('🚀 ANALYSE DES DONNÉES GSC FOURNIES');
  console.log('='.repeat(60));

  const analyzer = new GSCIndexingAnalyzer();
  
  // Simulated data based on the provided CSV content
  const tableauData = `URL,Dernière exploration
https://cciservices.online/contact,2025-10-18
https://cciservices.online/blogs,2025-10-17
https://cciservices.online/conseils/marbre-blanc-entretien-renovation-tunis-2025,2025-10-17
https://cciservices.online/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure,2025-10-16
https://cciservices.online/conseils/tapisserie-nautique-ignifuge-carthage-tanit-ferry,2025-10-16
https://cciservices.online/reels/1247993576413121,2025-10-16
https://cciservices.online/reels/1251663539372907,2025-10-16
https://cciservices.online/reels/595458862831133,2025-10-16
https://cciservices.online/reels/1795992887605310,2025-10-16
https://cciservices.online/reels/1246030820007499,2025-10-16
https://cciservices.online/conseils/desinfection-salon-tunis-2025,2025-10-16
https://cciservices.online/conseils/polissage-marbre-tunis-2025,2025-10-15
https://cciservices.online/conseils/prix-nettoyage-tapis-tunis-tarifs-2025,2025-10-15
https://cciservices.online/conseils/detachage-moquette-tunis-2025,2025-10-14
https://cciservices.online/,2025-10-14
https://cciservices.online/conseils/nettoyage-canape-tunis-2025,2025-10-14
https://cciservices.online/services,2025-10-11
https://cciservices.online/tapis,2025-10-10
https://cciservices.online/about,2025-10-09
https://cciservices.online/tapisserie,2025-10-06
https://cciservices.online/devis,2025-10-05
https://cciservices.online/marbre,2025-09-26
https://cciservices.online/team,2025-09-18
https://cciservices.online/salon,2025-09-11
https://cciservices.online/faq,2025-09-08
https://cciservices.online/moquette,2025-08-20
https://cciservices.online/projects,2025-08-16
https://cciservices.online/Contact,2025-07-16`;

  const graphiqueData = `Date,Pages concernées
2025-10-14,15
2025-10-15,28
2025-10-16,28
2025-10-17,28
2025-10-18,28`;

  // Analyze data
  analyzer.analyzeURLData(tableauData);
  analyzer.analyzeTimelineData(graphiqueData);
  analyzer.generateInsights();
  
  const report = analyzer.generateReport();
  analyzer.saveReport(report);
  
  return report;
}

// Export for use in other scripts
module.exports = { GSCIndexingAnalyzer };

// Run analysis if called directly
if (require.main === module) {
  analyzePresentedData().catch(console.error);
}