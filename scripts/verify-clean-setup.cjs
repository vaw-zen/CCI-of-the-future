/**
 * Vérification de Configuration Propre
 * S'assure qu'aucun résidu de l'ancien projet MindCare n'interfère
 */

const fs = require('fs');
const path = require('path');

class CleanSetupVerifier {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.envFiles = ['.env.local', '.env', '.env.development'];
    this.issues = [];
    this.recommendations = [];
  }

  /**
   * Vérifier les fichiers d'environnement
   */
  checkEnvironmentFiles() {
    console.log('🔍 Vérification des fichiers d\'environnement...');
    
    this.envFiles.forEach(envFile => {
      const envPath = path.join(this.projectRoot, envFile);
      
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        
        // Vérifier les références à MindCare
        if (content.toLowerCase().includes('mindcare')) {
          this.issues.push({
            type: 'error',
            file: envFile,
            message: 'Références à MindCare trouvées dans le fichier d\'environnement',
            fix: `Supprimez toutes les références à MindCare dans ${envFile}`
          });
        }
        
        // Vérifier les anciennes clés OAuth
        if (content.includes('GOOGLE_CLIENT_ID') || content.includes('GOOGLE_CLIENT_SECRET')) {
          const lines = content.split('\n');
          const suspiciousLines = lines.filter(line => 
            line.includes('GOOGLE_CLIENT_ID') || line.includes('GOOGLE_CLIENT_SECRET')
          );
          
          this.issues.push({
            type: 'warning',
            file: envFile,
            message: 'Anciennes clés Google détectées',
            details: suspiciousLines,
            fix: 'Remplacez par les nouvelles clés du projet CCI Services'
          });
        }
        
        console.log(`✅ ${envFile} vérifié`);
      } else {
        console.log(`ℹ️  ${envFile} n'existe pas`);
      }
    });
  }

  /**
   * Vérifier les fichiers de configuration
   */
  checkConfigFiles() {
    console.log('🔍 Vérification des fichiers de configuration...');
    
    const configFiles = [
      'next.config.mjs',
      'package.json',
      'jsconfig.json'
    ];
    
    configFiles.forEach(configFile => {
      const configPath = path.join(this.projectRoot, configFile);
      
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8');
        
        if (content.toLowerCase().includes('mindcare')) {
          this.issues.push({
            type: 'warning',
            file: configFile,
            message: 'Références à MindCare dans la configuration',
            fix: `Vérifiez et nettoyez les références dans ${configFile}`
          });
        }
        
        console.log(`✅ ${configFile} vérifié`);
      }
    });
  }

  /**
   * Vérifier les credentials locaux
   */
  checkLocalCredentials() {
    console.log('🔍 Vérification des credentials locaux...');
    
    const credentialPaths = [
      path.join(this.projectRoot, 'credentials.json'),
      path.join(this.projectRoot, 'google-credentials.json'),
      path.join(this.projectRoot, 'client_secret.json'),
      path.join(process.env.HOME || process.env.USERPROFILE || '', '.credentials'),
      path.join(process.env.HOME || process.env.USERPROFILE || '', '.google-credentials')
    ];
    
    credentialPaths.forEach(credPath => {
      if (fs.existsSync(credPath)) {
        this.issues.push({
          type: 'warning',
          file: credPath,
          message: 'Fichier de credentials détecté',
          fix: 'Vérifiez que ce fichier ne contient pas les anciens credentials MindCare'
        });
      }
    });
  }

  /**
   * Générer les recommandations
   */
  generateRecommendations() {
    console.log('💡 Génération des recommandations...');
    
    this.recommendations = [
      {
        priority: 'high',
        action: 'Créer un nouveau projet Google Cloud',
        details: 'Utilisez un nom unique comme "CCI-Services-GSC-2025"',
        why: 'Éviter toute confusion avec l\'ancien projet MindCare'
      },
      {
        priority: 'high',
        action: 'Configurer de nouvelles clés OAuth2',
        details: 'Générez de nouveaux CLIENT_ID et CLIENT_SECRET',
        why: 'Les anciennes clés sont liées au projet supprimé'
      },
      {
        priority: 'medium',
        action: 'Vérifier les URLs autorisées',
        details: 'Assurez-vous que seules les URLs CCI Services sont configurées',
        why: 'Éviter les erreurs redirect_uri_mismatch'
      },
      {
        priority: 'low',
        action: 'Nettoyer les anciens fichiers',
        details: 'Supprimez tous les fichiers de credentials obsolètes',
        why: 'Maintenir un environnement propre'
      }
    ];
  }

  /**
   * Créer un script de nettoyage automatique
   */
  createCleanupScript() {
    const cleanupScript = `# Script de Nettoyage CCI Services
# Supprime les références à l'ancien projet MindCare

echo "🧹 Nettoyage des anciens credentials..."

# Nettoyer .env.local
if [ -f ".env.local" ]; then
    echo "Nettoyage de .env.local..."
    cp .env.local .env.local.backup
    sed -i '/mindcare/Id' .env.local
    sed -i '/MindCare/d' .env.local
fi

# Nettoyer les credentials locaux
rm -f credentials.json
rm -f google-credentials.json  
rm -f client_secret.json

echo "✅ Nettoyage terminé!"
echo "📝 Sauvegarde créée: .env.local.backup"
`;
    
    const scriptPath = path.join(this.projectRoot, 'cleanup-old-project.sh');
    fs.writeFileSync(scriptPath, cleanupScript);
    
    console.log(`📝 Script de nettoyage créé: cleanup-old-project.sh`);
  }

  /**
   * Générer le rapport de vérification
   */
  generateReport() {
    const report = `# 🔍 Rapport de Vérification - Configuration Propre

Generated: ${new Date().toLocaleString()}

## 📊 Résumé
- **Issues détectées:** ${this.issues.length}
- **Recommandations:** ${this.recommendations.length}
- **Status:** ${this.issues.length === 0 ? '✅ Configuration propre' : '⚠️ Nettoyage requis'}

## 🚨 Issues Détectées

${this.issues.length === 0 ? '✅ Aucune issue détectée - configuration propre!' : 
  this.issues.map(issue => `
### ${issue.type.toUpperCase()} - ${issue.file}
**Problème:** ${issue.message}
**Solution:** ${issue.fix}
${issue.details ? `**Détails:** ${Array.isArray(issue.details) ? issue.details.join('\n') : issue.details}` : ''}
`).join('')}

## 💡 Recommandations

${this.recommendations.map(rec => `
### ${rec.priority.toUpperCase()} - ${rec.action}
**Détails:** ${rec.details}
**Pourquoi:** ${rec.why}
`).join('')}

## 🛠️ Prochaines Étapes

### 1. Nettoyage (si nécessaire)
${this.issues.length > 0 ? 
  '- Exécutez: `bash cleanup-old-project.sh`\n- Vérifiez manuellement les fichiers mentionnés ci-dessus' : 
  '✅ Aucun nettoyage requis'}

### 2. Configuration Google Cloud
1. Créez un nouveau projet: **CCI-Services-GSC-${new Date().getFullYear()}**
2. Activez Google Search Console API
3. Configurez OAuth2 avec les URLs CCI Services uniquement
4. Téléchargez les nouveaux credentials

### 3. Variables d'Environnement
Ajoutez dans .env.local:
\`\`\`
# Google Search Console API - CCI Services
GOOGLE_CLIENT_ID=your-new-client-id
GOOGLE_CLIENT_SECRET=your-new-client-secret
GOOGLE_PROJECT_ID=cci-services-gsc-${new Date().getFullYear()}
GSC_SITE_URL=https://cciservices.online

# Monitoring Configuration
MONITORING_ENABLED=true
ALERT_EMAIL=chaaben.fares94@gmail.com
\`\`\`

### 4. Test de Configuration
Exécutez: \`node scripts/test-gsc-config.cjs\`

---

**Status:** ${this.issues.length === 0 ? '🟢 Prêt pour la nouvelle configuration' : '🟡 Nettoyage requis avant configuration'}
`;

    const reportPath = path.join(this.projectRoot, 'clean-setup-report.md');
    fs.writeFileSync(reportPath, report);
    
    return report;
  }

  /**
   * Exécuter la vérification complète
   */
  async runVerification() {
    console.log('🧹 Vérification de Configuration Propre - CCI Services\n');
    
    this.checkEnvironmentFiles();
    this.checkConfigFiles();
    this.checkLocalCredentials();
    this.generateRecommendations();
    this.createCleanupScript();
    
    const report = this.generateReport();
    
    console.log('\n📊 Résultats de Vérification:');
    console.log(`Issues: ${this.issues.length}`);
    console.log(`Recommandations: ${this.recommendations.length}`);
    
    if (this.issues.length === 0) {
      console.log('✅ Configuration propre - prêt pour le nouveau projet Google!');
    } else {
      console.log('⚠️ Nettoyage requis - consultez clean-setup-report.md');
    }
    
    console.log('\n📋 Fichiers générés:');
    console.log('- clean-setup-report.md (rapport détaillé)');
    console.log('- cleanup-old-project.sh (script de nettoyage)');
    
    return {
      issues: this.issues,
      recommendations: this.recommendations,
      report,
      status: this.issues.length === 0 ? 'clean' : 'needs_cleanup'
    };
  }
}

// CLI Usage
async function main() {
  const verifier = new CleanSetupVerifier();
  
  try {
    const results = await verifier.runVerification();
    
    console.log('\n🚀 Prochaine étape: Créez votre nouveau projet Google Cloud!');
    console.log('📝 Nom suggéré: CCI-Services-GSC-2025');
    
  } catch (error) {
    console.error('❌ Vérification échouée:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CleanSetupVerifier;