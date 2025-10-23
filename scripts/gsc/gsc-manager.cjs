/**
 * CCI Services - GSC Manager Principal
 * Centre de commande unifié pour tous les outils GSC
 * Structure organisée dans /scripts/gsc/
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class GSCManager {
  constructor() {
    this.gscDir = __dirname; // /scripts/gsc/
    this.toolsDir = path.join(this.gscDir, 'tools');
    this.dataDir = path.join(this.gscDir, 'data');
    this.reportsDir = path.join(this.gscDir, 'reports');
    this.credentialsDir = path.join(this.gscDir, 'credentials');
    
    this.availableTools = {
      // Analyse et monitoring
      'crisis': {
        script: 'crisis-analysis.cjs',
        description: 'Analyse de crise complète avec tableau de bord',
        category: 'analysis'
      },
      'daily': {
        script: 'daily-monitor.cjs',
        description: 'Vérification quotidienne automatisée',
        category: 'monitoring'
      },
      'monitor': {
        script: 'monitoring-dashboard.cjs',
        description: 'Dashboard de monitoring général',
        category: 'monitoring'
      },
      'analyze': {
        script: 'data-analyzer.cjs',
        description: 'Analyser les dernières données GSC',
        category: 'analysis'
      },

      // Actions de soumission
      'submit': {
        script: 'massive-submission.cjs',
        description: 'Soumission massive des URLs non indexées',
        category: 'submission'
      },
      'extract': {
        script: 'page-extractor.cjs',
        description: 'Extraire les pages non indexées',
        category: 'extraction'
      },
      'submit-urls': {
        script: 'url-submitter.cjs',
        description: 'Soumettre les URLs depuis la liste',
        category: 'submission'
      },

      // Rapports spécialisés
      'videos': {
        script: 'video-reporter.cjs',
        description: 'Rapport spécialisé pour les vidéos',
        category: 'reports'
      },
      'articles': {
        script: 'article-analyzer.cjs',
        description: 'Analyser les différences entre articles',
        category: 'analysis'
      },
      'indexing': {
        script: 'indexing-analyzer.cjs',
        description: 'Analyser les données d\'indexation CSV',
        category: 'analysis'
      },

      // Outils utilitaires
      'track': {
        script: 'keyword-tracker.cjs',
        description: 'Tracking des keywords et performance',
        category: 'utilities'
      },
      'complete': {
        script: 'complete-analysis.cjs',
        description: 'Analyse GSC complète et détaillée',
        category: 'analysis'
      }
    };
    
    this.ensureDirectories();
  }

  /**
   * Assurer que tous les dossiers existent
   */
  ensureDirectories() {
    const dirs = [this.toolsDir, this.dataDir, this.reportsDir, this.credentialsDir];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Dossier créé: ${path.relative(process.cwd(), dir)}`);
      }
    });
  }

  /**
   * Afficher l'aide et les commandes disponibles
   */
  showHelp() {
    console.log('🚀 CCI SERVICES - GSC MANAGER');
    console.log('='.repeat(50));
    console.log('Centre de commande unifié pour tous les outils GSC');
    console.log(`📂 Structure: ${path.relative(process.cwd(), this.gscDir)}/\n`);

    // Grouper par catégorie
    const categories = {
      'analysis': '📊 ANALYSE ET INSIGHTS',
      'monitoring': '📈 MONITORING ET SURVEILLANCE',
      'submission': '🎯 SOUMISSION ET INDEXATION',
      'reports': '📝 RAPPORTS SPÉCIALISÉS',
      'utilities': '🔧 OUTILS UTILITAIRES'
    };

    Object.entries(categories).forEach(([category, title]) => {
      console.log(`${title}:`);
      Object.entries(this.availableTools)
        .filter(([_, tool]) => tool.category === category)
        .forEach(([name, tool]) => {
          console.log(`   📌 ${name.padEnd(12)} - ${tool.description}`);
        });
      console.log('');
    });

    console.log('🚀 UTILISATION:');
    console.log('   node gsc-manager.cjs <command>');
    console.log('   npm run gsc <command>');

    console.log('\n🆘 SITUATION DE CRISE (WORKFLOW PRIORITAIRE):');
    console.log('   1. node gsc-manager.cjs crisis     # Analyse de crise');
    console.log('   2. node gsc-manager.cjs submit     # Soumission massive');
    console.log('   3. node gsc-manager.cjs daily      # Monitoring quotidien');

    console.log('\n🏗️ STRUCTURE DES DOSSIERS:');
    console.log(`   📂 ${path.relative(process.cwd(), this.gscDir)}/`);
    console.log(`   ├── 🔧 tools/        # Scripts d'outils GSC`);
    console.log(`   ├── 📊 data/         # Données et historiques`);
    console.log(`   ├── 📝 reports/      # Rapports générés`);
    console.log(`   └── 🔑 credentials/  # Clés d'authentification`);
  }

  /**
   * Créer la structure de base des outils
   */
  async setupGSCStructure() {
    console.log('🏗️ CRÉATION DE LA STRUCTURE GSC');
    console.log('='.repeat(40));

    // Créer le fichier README pour la structure
    const readmeContent = `# CCI Services - Google Search Console Tools

## 📂 Structure des dossiers

### 🔧 tools/
Scripts d'outils GSC principaux :
- \`crisis-analysis.cjs\` - Analyse de crise et tableau de bord
- \`daily-monitor.cjs\` - Monitoring quotidien automatisé
- \`massive-submission.cjs\` - Soumission massive d'URLs
- \`data-analyzer.cjs\` - Analyse des données GSC
- Et autres outils spécialisés...

### 📊 data/
Données et historiques :
- \`daily-tracking.json\` - Historique quotidien
- \`url-lists/\` - Listes d'URLs pour soumission
- \`csv-exports/\` - Exports GSC en CSV
- \`baseline.json\` - Données de référence

### 📝 reports/
Rapports générés automatiquement :
- \`crisis-reports/\` - Rapports de crise
- \`daily-reports/\` - Rapports quotidiens
- \`analysis-reports/\` - Analyses détaillées
- \`dashboards/\` - Tableaux de bord

### 🔑 credentials/
Clés d'authentification :
- \`gsc-service-account.json\` - Clé Google Search Console
- \`indexing-api-key.json\` - Clé Google Indexing API
- \`.env\` - Variables d'environnement

## 🚀 Utilisation

\`\`\`bash
# Depuis le dossier /scripts/gsc/
node gsc-manager.cjs <command>

# Commandes principales
node gsc-manager.cjs crisis    # Analyse de crise
node gsc-manager.cjs submit    # Soumission massive
node gsc-manager.cjs daily     # Monitoring quotidien
\`\`\`

## 📊 Workflow de récupération

1. **Analyse** : \`crisis\` pour évaluer la situation
2. **Action** : \`submit\` pour soumettre les URLs
3. **Suivi** : \`daily\` pour monitoring continu

---

*Générée automatiquement le ${new Date().toLocaleString()}*
`;

    const readmePath = path.join(this.gscDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);

    // Créer les sous-dossiers dans data/
    const dataSubDirs = ['url-lists', 'csv-exports', 'baseline'];
    dataSubDirs.forEach(subDir => {
      const subDirPath = path.join(this.dataDir, subDir);
      if (!fs.existsSync(subDirPath)) {
        fs.mkdirSync(subDirPath, { recursive: true });
      }
    });

    // Créer les sous-dossiers dans reports/
    const reportsSubDirs = ['crisis-reports', 'daily-reports', 'analysis-reports', 'dashboards'];
    reportsSubDirs.forEach(subDir => {
      const subDirPath = path.join(this.reportsDir, subDir);
      if (!fs.existsSync(subDirPath)) {
        fs.mkdirSync(subDirPath, { recursive: true });
      }
    });

    // Créer le fichier de configuration
    const configContent = {
      site: 'https://cciservices.online',
      baseline: {
        date: '2025-10-23',
        indexed: 28,
        total: 104,
        rate: 26.9
      },
      monitoring: {
        dailyChecks: true,
        alertThresholds: {
          criticalRate: 30,
          warningRate: 60,
          targetRate: 90
        }
      },
      paths: {
        tools: './tools/',
        data: './data/',
        reports: './reports/',
        credentials: './credentials/'
      }
    };

    const configPath = path.join(this.gscDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));

    console.log('✅ Structure GSC créée avec succès !');
    console.log(`📁 Dossier principal: ${path.relative(process.cwd(), this.gscDir)}`);
    console.log(`📋 README: ${path.relative(process.cwd(), readmePath)}`);
    console.log(`⚙️ Configuration: ${path.relative(process.cwd(), configPath)}`);

    return {
      gscDir: this.gscDir,
      readme: readmePath,
      config: configPath
    };
  }

  /**
   * Migrer les outils existants vers la nouvelle structure
   */
  async migrateExistingTools() {
    console.log('📦 MIGRATION DES OUTILS EXISTANTS');
    console.log('='.repeat(40));

    const scriptsDir = path.dirname(this.gscDir); // /scripts/
    
    // Mapping des anciens noms vers les nouveaux
    const migrationMap = {
      'gsc-crisis-analysis.cjs': 'tools/crisis-analysis.cjs',
      'daily-gsc-check.cjs': 'tools/daily-monitor.cjs',
      'gsc-monitoring.cjs': 'tools/monitoring-dashboard.cjs',
      'analyze-latest-gsc-data.cjs': 'tools/data-analyzer.cjs',
      'massive-url-submission.cjs': 'tools/massive-submission.cjs',
      'extract-unindexed-pages.cjs': 'tools/page-extractor.cjs',
      'submit-urls-indexing.cjs': 'tools/url-submitter.cjs',
      'video-gsc-reports.cjs': 'tools/video-reporter.cjs',
      'analyze-article-differences.cjs': 'tools/article-analyzer.cjs',
      'gsc-indexing-analyzer.cjs': 'tools/indexing-analyzer.cjs',
      'gsc-tracker.js': 'tools/keyword-tracker.cjs',
      'complete-gsc-analysis.cjs': 'tools/complete-analysis.cjs'
    };

    const migrated = [];
    const errors = [];

    for (const [oldName, newPath] of Object.entries(migrationMap)) {
      const oldPath = path.join(scriptsDir, oldName);
      const newFullPath = path.join(this.gscDir, newPath);
      
      try {
        if (fs.existsSync(oldPath)) {
          // Lire le contenu et mettre à jour les chemins
          let content = fs.readFileSync(oldPath, 'utf8');
          
          // Mettre à jour les chemins relatifs dans le contenu
          content = this.updatePathsInContent(content);
          
          // Écrire dans le nouveau dossier
          fs.writeFileSync(newFullPath, content);
          
          console.log(`✅ ${oldName} → ${newPath}`);
          migrated.push({ old: oldName, new: newPath });
        } else {
          console.log(`⚠️ ${oldName} non trouvé`);
        }
      } catch (error) {
        console.log(`❌ Erreur migration ${oldName}: ${error.message}`);
        errors.push({ file: oldName, error: error.message });
      }
    }

    // Migrer les dossiers data et reports existants
    await this.migrateDataAndReports(scriptsDir);

    console.log('\n📊 RÉSUMÉ MIGRATION:');
    console.log(`✅ Outils migrés: ${migrated.length}`);
    console.log(`❌ Erreurs: ${errors.length}`);

    return { migrated, errors };
  }

  /**
   * Mettre à jour les chemins dans le contenu des fichiers
   */
  updatePathsInContent(content) {
    // Remplacer les anciens chemins
    const replacements = [
      // Chemins vers data/
      [/path\.join\(__dirname,\s*'data'/g, "path.join(__dirname, '../data'"],
      [/path\.join\(__dirname,\s*'\.\.', 'data'/g, "path.join(__dirname, '../data'"],
      [/'\.\/data\/'/g, "'../data/'"],
      
      // Chemins vers reports/
      [/path\.join\(__dirname,\s*'reports'/g, "path.join(__dirname, '../reports'"],
      [/path\.join\(__dirname,\s*'\.\.', 'reports'/g, "path.join(__dirname, '../reports'"],
      [/'\.\/reports\/'/g, "'../reports/'"],
      
      // Chemins vers credentials/
      [/path\.join\(__dirname,\s*'credentials'/g, "path.join(__dirname, '../credentials'"],
      [/path\.join\(__dirname,\s*'\.\.', 'credentials'/g, "path.join(__dirname, '../credentials'"],
      [/'\.\/credentials\/'/g, "'../credentials/'"],
      
      // Chemins relatifs génériques
      [/__dirname,\s*'\.\.'/g, "__dirname, '../..'"]
    ];

    let updatedContent = content;
    replacements.forEach(([pattern, replacement]) => {
      updatedContent = updatedContent.replace(pattern, replacement);
    });

    return updatedContent;
  }

  /**
   * Migrer les dossiers de données et rapports
   */
  async migrateDataAndReports(scriptsDir) {
    console.log('\n📂 Migration des données et rapports...');

    // Migrer data/ existant
    const oldDataDir = path.join(scriptsDir, 'data');
    if (fs.existsSync(oldDataDir)) {
      const files = fs.readdirSync(oldDataDir);
      files.forEach(file => {
        const oldFilePath = path.join(oldDataDir, file);
        const newFilePath = path.join(this.dataDir, file);
        
        if (fs.statSync(oldFilePath).isFile()) {
          fs.copyFileSync(oldFilePath, newFilePath);
          console.log(`📊 Data migré: ${file}`);
        }
      });
    }

    // Migrer reports/ existant
    const oldReportsDir = path.join(scriptsDir, 'reports');
    if (fs.existsSync(oldReportsDir)) {
      const files = fs.readdirSync(oldReportsDir);
      files.forEach(file => {
        const oldFilePath = path.join(oldReportsDir, file);
        const newFilePath = path.join(this.reportsDir, file);
        
        if (fs.statSync(oldFilePath).isFile()) {
          fs.copyFileSync(oldFilePath, newFilePath);
          console.log(`📝 Rapport migré: ${file}`);
        }
      });
    }
  }

  /**
   * Exécuter un outil
   */
  async executeTool(toolName, args = []) {
    const tool = this.availableTools[toolName];
    
    if (!tool) {
      console.error(`❌ Outil inconnu: ${toolName}`);
      console.log('\n💡 Utilisez "help" pour voir les outils disponibles');
      return false;
    }

    const scriptPath = path.join(this.toolsDir, tool.script);
    
    if (!fs.existsSync(scriptPath)) {
      console.error(`❌ Script non trouvé: ${scriptPath}`);
      console.log(`💡 Créez le script ou utilisez "migrate" pour migrer les outils existants`);
      return false;
    }

    console.log(`🚀 Exécution: ${tool.description}`);
    console.log(`📂 Script: ${tool.script}`);
    console.log(`📁 Catégorie: ${tool.category}`);
    console.log('='.repeat(50));

    return new Promise((resolve, reject) => {
      const process = spawn('node', [scriptPath, ...args], {
        cwd: this.toolsDir,
        stdio: 'inherit'
      });

      process.on('close', (code) => {
        console.log('\n' + '='.repeat(50));
        if (code === 0) {
          console.log(`✅ Outil '${toolName}' terminé avec succès`);
          resolve(true);
        } else {
          console.log(`❌ Outil '${toolName}' échoué (code: ${code})`);
          resolve(false);
        }
      });

      process.on('error', (error) => {
        console.error(`❌ Erreur exécution: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Vérifier l'état de santé
   */
  checkHealth() {
    console.log('🏥 VÉRIFICATION DE L\'ÉTAT DE SANTÉ GSC');
    console.log('='.repeat(45));

    const health = {
      tools: { available: 0, missing: 0 },
      directories: { exists: 0, missing: 0 },
      config: { valid: false, path: '' }
    };

    // Vérifier les outils
    console.log('🔧 OUTILS:');
    Object.entries(this.availableTools).forEach(([name, tool]) => {
      const scriptPath = path.join(this.toolsDir, tool.script);
      const exists = fs.existsSync(scriptPath);
      
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${name.padEnd(12)} - ${tool.script}`);
      
      if (exists) health.tools.available++;
      else health.tools.missing++;
    });

    // Vérifier les dossiers
    console.log('\n📁 STRUCTURE:');
    const dirs = {
      'tools': this.toolsDir,
      'data': this.dataDir,
      'reports': this.reportsDir,
      'credentials': this.credentialsDir
    };

    Object.entries(dirs).forEach(([name, dirPath]) => {
      const exists = fs.existsSync(dirPath);
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${name.padEnd(12)} - ${path.relative(process.cwd(), dirPath)}`);
      
      if (exists) health.directories.exists++;
      else health.directories.missing++;
    });

    // Vérifier la configuration
    console.log('\n⚙️ CONFIGURATION:');
    const configPath = path.join(this.gscDir, 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        health.config.valid = true;
        health.config.path = configPath;
        console.log(`   ✅ config.json   - Configuration valide`);
      } catch (error) {
        console.log(`   ❌ config.json   - Configuration invalide: ${error.message}`);
      }
    } else {
      console.log(`   ❌ config.json   - Fichier manquant`);
    }

    console.log('\n📊 RÉSUMÉ:');
    console.log(`   🔧 Outils: ${health.tools.available}/${Object.keys(this.availableTools).length}`);
    console.log(`   📁 Dossiers: ${health.directories.exists}/${Object.keys(dirs).length}`);
    console.log(`   ⚙️ Config: ${health.config.valid ? 'Valide' : 'Invalide'}`);

    const totalItems = Object.keys(this.availableTools).length + Object.keys(dirs).length + 1;
    const availableItems = health.tools.available + health.directories.exists + (health.config.valid ? 1 : 0);
    const healthPercent = ((availableItems / totalItems) * 100).toFixed(1);

    console.log(`   📈 Santé globale: ${healthPercent}%`);

    return health;
  }
}

// Interface en ligne de commande
async function main() {
  const gscManager = new GSCManager();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    gscManager.showHelp();
    return;
  }

  const command = args[0].toLowerCase();
  const commandArgs = args.slice(1);

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      gscManager.showHelp();
      break;

    case 'setup':
    case 'init':
      await gscManager.setupGSCStructure();
      break;

    case 'migrate':
      await gscManager.migrateExistingTools();
      break;

    case 'health':
    case 'status':
      gscManager.checkHealth();
      break;

    default:
      const success = await gscManager.executeTool(command, commandArgs);
      if (!success) {
        console.log('\n💡 Utilisez "help" pour voir les outils disponibles');
        console.log('💡 Utilisez "migrate" pour migrer les outils existants');
      }
      break;
  }
}

// Exporter pour utilisation en module
module.exports = GSCManager;

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}