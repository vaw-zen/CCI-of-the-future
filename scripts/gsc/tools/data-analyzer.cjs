const fs = require('fs');
const path = require('path');

/**
 * Analyseur des dernières données GSC - 23 octobre 2025
 * Comparaison avec les données précédentes et identification des pages non indexées
 */
class LatestGSCAnalyzer {
  constructor() {
    this.latestData = {
      coverage: {
        nonIndexed: 76,
        indexed: 28,
        total: 104
      },
      criticalIssues: {
        "Page avec redirection": 3,
        "Introuvable (404)": 1,
        "Autre page avec balise canonique correcte": 1,
        "Détectée, actuellement non indexée": 71,
        "Explorée, actuellement non indexée": 0
      },
      previousData: {
        date: "2025-10-21",
        indexed: 28,
        analyzed: 15  // Articles analysés précédemment
      }
    };
    
    this.analysis = {
      progress: {},
      issues: [],
      recommendations: []
    };
  }

  /**
   * Analyser l'évolution depuis les derniers rapports
   */
  analyzeProgress() {
    console.log('📊 ANALYSE DE L\'ÉVOLUTION GSC - 23 OCTOBRE 2025');
    console.log('='.repeat(60));

    console.log('\n📈 ÉTAT ACTUEL:');
    console.log(`✅ Pages indexées: ${this.latestData.coverage.indexed}`);
    console.log(`❌ Pages non indexées: ${this.latestData.coverage.nonIndexed}`);
    console.log(`📊 Total pages connues: ${this.latestData.coverage.total}`);
    console.log(`📈 Taux d'indexation: ${((this.latestData.coverage.indexed / this.latestData.coverage.total) * 100).toFixed(1)}%`);

    // Analyser l'évolution depuis le 15 octobre (boom d'indexation)
    const progressSinceBoost = {
      before: { indexed: 15, date: "15 octobre" },
      after: { indexed: 28, date: "23 octobre" },
      gain: 28 - 15
    };

    console.log('\n🚀 ÉVOLUTION DEPUIS LE BOOST (15 OCTOBRE):');
    console.log(`📅 15 octobre: ${progressSinceBoost.before.indexed} pages indexées`);
    console.log(`📅 23 octobre: ${progressSinceBoost.after.indexed} pages indexées`);
    console.log(`📈 Gain: +${progressSinceBoost.gain} pages (${((progressSinceBoost.gain / progressSinceBoost.before.indexed) * 100).toFixed(1)}% d'amélioration)`);

    this.analysis.progress = progressSinceBoost;
    return progressSinceBoost;
  }

  /**
   * Analyser les problèmes critiques
   */
  analyzeCriticalIssues() {
    console.log('\n🚨 ANALYSE DES PROBLÈMES CRITIQUES');
    console.log('='.repeat(50));

    const criticalIssues = this.latestData.criticalIssues;
    
    console.log('📋 RÉPARTITION DES PROBLÈMES:');
    Object.entries(criticalIssues).forEach(([issue, count]) => {
      console.log(`   ${this.getIssueIcon(issue)} ${issue}: ${count} pages`);
    });

    // Analyse du principal problème
    console.log('\n🎯 PROBLÈME PRINCIPAL:');
    console.log(`❌ "Détectée, actuellement non indexée": ${criticalIssues["Détectée, actuellement non indexée"]} pages`);
    console.log('   → Google connaît ces pages mais ne les indexe pas encore');
    console.log('   → Besoin d\'optimisation et de soumission individuelle');

    // Analyser les problèmes techniques
    console.log('\n🔧 PROBLÈMES TECHNIQUES À CORRIGER:');
    console.log(`🔀 Redirections: ${criticalIssues["Page avec redirection"]} pages`);
    console.log(`🚫 Pages 404: ${criticalIssues["Introuvable (404)"]} pages`);
    console.log(`🔗 Problèmes canoniques: ${criticalIssues["Autre page avec balise canonique correcte"]} pages`);

    this.analysis.issues = criticalIssues;
    return criticalIssues;
  }

  /**
   * Obtenir l'icône pour chaque type d'issue
   */
  getIssueIcon(issue) {
    const icons = {
      "Page avec redirection": "🔀",
      "Introuvable (404)": "🚫",
      "Autre page avec balise canonique correcte": "🔗",
      "Détectée, actuellement non indexée": "⏳",
      "Explorée, actuellement non indexée": "🔍"
    };
    return icons[issue] || "❓";
  }

  /**
   * Analyser l'évolution des impressions
   */
  analyzeSearchPerformance() {
    console.log('\n📊 PERFORMANCE DE RECHERCHE');
    console.log('='.repeat(50));

    // Données des derniers jours d'après le graphique
    const recentPerformance = [
      { date: "2025-10-15", impressions: 63 },
      { date: "2025-10-16", impressions: 18 },
      { date: "2025-10-17", impressions: 18 },
      { date: "2025-10-18", impressions: 27 }
    ];

    console.log('📈 IMPRESSIONS RÉCENTES:');
    recentPerformance.forEach(day => {
      console.log(`   ${day.date}: ${day.impressions} impressions`);
    });

    const avgImpressions = recentPerformance.reduce((sum, day) => sum + day.impressions, 0) / recentPerformance.length;
    console.log(`📊 Moyenne récente: ${avgImpressions.toFixed(1)} impressions/jour`);

    // Pic du 15 octobre
    console.log('\n🎯 ANALYSE DU PIC (15 OCTOBRE):');
    console.log('   63 impressions → Corrélation avec l\'indexation de nouveaux contenus');
    console.log('   Les nouvelles pages indexées génèrent de la visibilité');

    return { recentPerformance, avgImpressions };
  }

  /**
   * Lire et analyser les rapports précédents
   */
  async analyzePreviousReports() {
    console.log('\n📋 ANALYSE DES RAPPORTS PRÉCÉDENTS');
    console.log('='.repeat(50));

    const reportsDir = path.join(__dirname, '../reports');
    
    try {
      // Vérifier les rapports existants
      const reportFiles = fs.readdirSync(reportsDir).filter(file => 
        file.includes('gsc') && file.endsWith('.json')
      );

      console.log(`📁 Rapports trouvés: ${reportFiles.length}`);
      reportFiles.forEach(file => {
        console.log(`   📄 ${file}`);
      });

      // Analyser le rapport le plus récent
      const latestReport = reportFiles
        .filter(file => file.includes('2025-10-21'))
        .sort()
        .pop();

      if (latestReport) {
        const reportPath = path.join(reportsDir, latestReport);
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        console.log(`\n📊 DERNIER RAPPORT ANALYSÉ: ${latestReport}`);
        
        if (reportData.summary) {
          console.log(`   📚 Articles totaux: ${reportData.summary.totalArticles || 'N/A'}`);
          console.log(`   ✅ Articles indexés: ${reportData.summary.indexedArticles || 'N/A'}`);
          console.log(`   📈 Taux indexation: ${reportData.summary.indexingRate || 'N/A'}%`);
        }

        return reportData;
      }

    } catch (error) {
      console.log(`⚠️ Erreur lecture rapports: ${error.message}`);
    }

    return null;
  }

  /**
   * Générer des recommandations basées sur l'analyse
   */
  generateRecommendations() {
    console.log('\n💡 RECOMMANDATIONS STRATÉGIQUES');
    console.log('='.repeat(50));

    const recommendations = [];

    // Recommandation principale: 71 pages détectées non indexées
    recommendations.push({
      priority: 'CRITIQUE',
      action: 'Soumission individuelle des 71 pages détectées',
      reason: '71 pages connues de Google mais non indexées',
      impact: 'Potentiel +253% d\'indexation (71 pages sur 28 actuelles)',
      steps: [
        'Extraire la liste des 71 pages non indexées depuis GSC',
        'Utiliser l\'API d\'indexation pour soumission individuelle',
        'Prioriser les articles et pages de services',
        'Surveiller l\'évolution dans les 48h'
      ]
    });

    // Recommandations techniques
    recommendations.push({
      priority: 'HAUTE',
      action: 'Corriger les problèmes techniques',
      reason: '5 pages avec problèmes techniques bloquants',
      impact: 'Amélioration de la santé technique du site',
      steps: [
        'Corriger 3 redirections incorrectes',
        'Réparer 1 page 404',
        'Résoudre 1 problème de balise canonique'
      ]
    });

    // Recommandation de suivi
    recommendations.push({
      priority: 'MOYENNE',
      action: 'Monitoring intensif post-soumission',
      reason: 'Mesurer l\'efficacité des actions',
      impact: 'Optimisation continue',
      steps: [
        'Vérification quotidienne des taux d\'indexation',
        'Suivi des impressions et CTR',
        'Ajustement des stratégies selon résultats'
      ]
    });

    console.log('🎯 PLAN D\'ACTION:');
    recommendations.forEach((rec, i) => {
      console.log(`\n${i + 1}. [${rec.priority}] ${rec.action}`);
      console.log(`   💡 Raison: ${rec.reason}`);
      console.log(`   📈 Impact: ${rec.impact}`);
      console.log(`   📋 Étapes:`);
      rec.steps.forEach((step, j) => {
        console.log(`      ${j + 1}. ${step}`);
      });
    });

    this.analysis.recommendations = recommendations;
    return recommendations;
  }

  /**
   * Calculer les projections
   */
  calculateProjections() {
    console.log('\n📊 PROJECTIONS ET POTENTIEL');
    console.log('='.repeat(50));

    const current = {
      indexed: 28,
      nonIndexed: 76,
      total: 104
    };

    const projections = {
      scenario1: {
        name: 'Optimiste (70% des pages détectées indexées)',
        newIndexed: Math.round(71 * 0.7),
        totalIndexed: 28 + Math.round(71 * 0.7),
        finalRate: ((28 + Math.round(71 * 0.7)) / 104 * 100).toFixed(1)
      },
      scenario2: {
        name: 'Réaliste (50% des pages détectées indexées)',
        newIndexed: Math.round(71 * 0.5),
        totalIndexed: 28 + Math.round(71 * 0.5),
        finalRate: ((28 + Math.round(71 * 0.5)) / 104 * 100).toFixed(1)
      },
      scenario3: {
        name: 'Conservateur (30% des pages détectées indexées)',
        newIndexed: Math.round(71 * 0.3),
        totalIndexed: 28 + Math.round(71 * 0.3),
        finalRate: ((28 + Math.round(71 * 0.3)) / 104 * 100).toFixed(1)
      }
    };

    console.log('🎯 SCÉNARIOS D\'AMÉLIORATION:');
    Object.values(projections).forEach((scenario, i) => {
      console.log(`\n${i + 1}. ${scenario.name}:`);
      console.log(`   📈 Nouvelles pages indexées: +${scenario.newIndexed}`);
      console.log(`   ✅ Total indexé: ${scenario.totalIndexed}/104`);
      console.log(`   📊 Taux final: ${scenario.finalRate}%`);
      console.log(`   🚀 Amélioration: +${((scenario.totalIndexed - 28) / 28 * 100).toFixed(1)}%`);
    });

    return projections;
  }

  /**
   * Générer le rapport complet
   */
  async generateComprehensiveReport() {
    console.log('\n📊 RAPPORT COMPLET GSC - 23 OCTOBRE 2025');
    console.log('='.repeat(70));

    const progress = this.analyzeProgress();
    const issues = this.analyzeCriticalIssues();
    const performance = this.analyzeSearchPerformance();
    const previousReports = await this.analyzePreviousReports();
    const recommendations = this.generateRecommendations();
    const projections = this.calculateProjections();

    const report = {
      timestamp: new Date().toISOString(),
      date: '2025-10-23',
      currentStatus: this.latestData.coverage,
      progress,
      criticalIssues: issues,
      searchPerformance: performance,
      previousAnalysis: previousReports,
      recommendations,
      projections,
      summary: {
        priority: 'CRITIQUE',
        mainIssue: '71 pages détectées mais non indexées',
        potentialGain: '+253% d\'indexation possible',
        nextAction: 'Soumission individuelle immédiate des 71 pages',
        timeframe: '24-48h pour voir les résultats'
      }
    };

    console.log('\n🏆 RÉSUMÉ EXÉCUTIF:');
    console.log(`📊 État: ${report.currentStatus.indexed} indexées / ${report.currentStatus.total} totales`);
    console.log(`🎯 Priorité: ${report.summary.priority}`);
    console.log(`⚡ Action immédiate: ${report.summary.nextAction}`);
    console.log(`📈 Potentiel: ${report.summary.potentialGain}`);

    // Sauvegarder le rapport
    await this.saveReport(report);

    return report;
  }

  /**
   * Sauvegarder le rapport
   */
  async saveReport(report) {
    try {
      const timestamp = '2025-10-23';
      const reportPath = path.join(__dirname, '../reports', `latest-gsc-analysis-${timestamp}.json`);
      const mdReportPath = path.join(__dirname, '../reports', `latest-gsc-analysis-${timestamp}.md`);
      
      // Assurer que le dossier reports existe
      const reportsDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // Générer rapport Markdown
      const mdContent = this.generateMarkdownReport(report);
      fs.writeFileSync(mdReportPath, mdContent);

      console.log(`\n📋 Rapport sauvegardé:`);
      console.log(`   JSON: ${reportPath}`);
      console.log(`   MD: ${mdReportPath}`);
      
      return { jsonPath: reportPath, mdPath: mdReportPath };
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error.message);
    }
  }

  /**
   * Générer rapport Markdown
   */
  generateMarkdownReport(report) {
    return `# Analyse GSC Complète - 23 Octobre 2025

## 📊 ÉTAT ACTUEL
- **Pages indexées:** ${report.currentStatus.indexed}
- **Pages non indexées:** ${report.currentStatus.nonIndexed}  
- **Total pages:** ${report.currentStatus.total}
- **Taux indexation:** ${((report.currentStatus.indexed / report.currentStatus.total) * 100).toFixed(1)}%

## 🚨 PROBLÈMES CRITIQUES
${Object.entries(report.criticalIssues).map(([issue, count]) => 
  `- **${issue}:** ${count} pages`
).join('\n')}

## 💡 RECOMMANDATIONS
${report.recommendations.map((rec, i) => `
### ${i + 1}. [${rec.priority}] ${rec.action}
**Raison:** ${rec.reason}
**Impact:** ${rec.impact}
**Étapes:**
${rec.steps.map((step, j) => `${j + 1}. ${step}`).join('\n')}
`).join('')}

## 📈 PROJECTIONS
${Object.values(report.projections).map(scenario => `
### ${scenario.name}
- Nouvelles indexations: +${scenario.newIndexed}
- Total final: ${scenario.totalIndexed}/104
- Taux final: ${scenario.finalRate}%
`).join('')}

## 🎯 ACTION IMMÉDIATE
**${report.summary.nextAction}**

Potentiel: ${report.summary.potentialGain}
Délai: ${report.summary.timeframe}

---
*Rapport généré le ${new Date().toLocaleString()}*`;
  }

  /**
   * Exécuter l'analyse complète
   */
  async runCompleteAnalysis() {
    try {
      console.log('🚀 DÉMARRAGE ANALYSE COMPLÈTE GSC - 23 OCTOBRE');
      console.log('='.repeat(60));

      const report = await this.generateComprehensiveReport();
      
      console.log('\n✅ Analyse terminée !');
      console.log('\n🎯 PROCHAINE ÉTAPE CRITIQUE:');
      console.log('   Exécuter le script de soumission pour les 71 pages détectées');
      
      return report;

    } catch (error) {
      console.error('❌ Erreur analyse:', error.message);
    }
  }
}

// Exécuter l'analyse
async function main() {
  const analyzer = new LatestGSCAnalyzer();
  await analyzer.runCompleteAnalysis();
}

main().catch(console.error);