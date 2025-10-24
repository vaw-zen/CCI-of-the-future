#!/usr/bin/env node

/**
 * 🎯 PRÉPARATION DÉPLOIEMENT GSC PRODUCTION
 * ========================================
 * Identifie les fichiers GSC à inclure pour les cron jobs
 */

const fs = require('fs');
const path = require('path');

class GSCProductionPrep {
    constructor() {
        this.gscDir = path.join(__dirname, '..');
        this.rootDir = path.join(this.gscDir, '..', '..');
        this.requiredFiles = new Set();
        this.dependencies = new Map();
    }

    identifyRequiredFiles() {
        console.log('🎯 IDENTIFICATION FICHIERS PRODUCTION GSC');
        console.log('=========================================');
        
        // Fichiers requis pour les cron jobs
        const cronRequiredFiles = [
            // Cron job lui-même
            'gsc-monitoring.cron',
            
            // Scripts principaux des cron jobs
            'tools/monitoring-dashboard.cjs',
            'tools/complete-analysis.cjs',
            
            // Manager principal
            'gsc-manager.cjs',
            
            // Configuration
            'config.json',
            
            // Structure directories (création automatique)
            'data/.gitkeep',
            'reports/.gitkeep',
            'credentials/.gitkeep'
        ];
        
        console.log('\n📋 FICHIERS CRON JOBS REQUIS:');
        cronRequiredFiles.forEach(file => {
            const fullPath = path.join(this.gscDir, file);
            const exists = fs.existsSync(fullPath);
            console.log(`   ${exists ? '✅' : '❌'} ${file}`);
            
            if (exists) {
                this.requiredFiles.add(`scripts/gsc/${file}`);
            }
        });
        
        return cronRequiredFiles;
    }

    analyzeDependencies() {
        console.log('\n🔍 ANALYSE DÉPENDANCES');
        console.log('======================');
        
        // Analyser monitoring-dashboard.cjs
        const monitoringFile = path.join(this.gscDir, 'tools/monitoring-dashboard.cjs');
        if (fs.existsSync(monitoringFile)) {
            const content = fs.readFileSync(monitoringFile, 'utf8');
            
            // Chercher les imports/requires
            const requireMatches = content.match(/require\(['"][^'"]+['"]\)/g) || [];
            const importMatches = content.match(/from\s+['"][^'"]+['"]/g) || [];
            
            console.log('\n📦 Dépendances monitoring-dashboard.cjs:');
            requireMatches.forEach(req => {
                const module = req.match(/['"]([^'"]+)['"]/)[1];
                if (!module.startsWith('.') && !module.startsWith('/')) {
                    console.log(`   📦 npm: ${module}`);
                } else {
                    console.log(`   📄 local: ${module}`);
                }
            });
        }
        
        // Analyser complete-analysis.cjs
        const analysisFile = path.join(this.gscDir, 'tools/complete-analysis.cjs');
        if (fs.existsSync(analysisFile)) {
            console.log('\n📦 Dépendances complete-analysis.cjs:');
            console.log('   📄 Analyse similaire...');
        }
    }

    generateGitignoreExceptions() {
        console.log('\n📝 EXCEPTIONS .GITIGNORE NÉCESSAIRES');
        console.log('===================================');
        
        const exceptions = [
            '',
            '# GSC Production Files - Exceptions pour cron jobs',
            '!scripts/gsc/',
            '!scripts/gsc/gsc-monitoring.cron',
            '!scripts/gsc/gsc-manager.cjs',
            '!scripts/gsc/config.json',
            '!scripts/gsc/tools/',
            '!scripts/gsc/tools/monitoring-dashboard.cjs',
            '!scripts/gsc/tools/complete-analysis.cjs',
            '!scripts/gsc/data/',
            '!scripts/gsc/data/.gitkeep',
            '!scripts/gsc/reports/',
            '!scripts/gsc/reports/.gitkeep',
            '!scripts/gsc/credentials/',
            '!scripts/gsc/credentials/.gitkeep',
            ''
        ];
        
        console.log('\n📋 Ajouter à .gitignore:');
        exceptions.forEach(line => {
            if (line.trim()) {
                console.log(`   ${line}`);
            }
        });
        
        return exceptions;
    }

    createProductionStructure() {
        console.log('\n🏗️ STRUCTURE PRODUCTION');
        console.log('=======================');
        
        const structure = {
            'scripts/gsc/': {
                type: 'directory',
                description: 'Répertoire principal GSC'
            },
            'scripts/gsc/gsc-monitoring.cron': {
                type: 'file',
                description: 'Tâches cron quotidiennes/hebdomadaires',
                required: true
            },
            'scripts/gsc/gsc-manager.cjs': {
                type: 'file',
                description: 'Centre de commande principal',
                required: true
            },
            'scripts/gsc/config.json': {
                type: 'file',
                description: 'Configuration GSC',
                required: true
            },
            'scripts/gsc/tools/': {
                type: 'directory',
                description: 'Scripts d\'analyse'
            },
            'scripts/gsc/tools/monitoring-dashboard.cjs': {
                type: 'file',
                description: 'Monitoring quotidien (cron 9h)',
                required: true
            },
            'scripts/gsc/tools/complete-analysis.cjs': {
                type: 'file',
                description: 'Analyse hebdomadaire (cron dimanche 10h)',
                required: true
            },
            'scripts/gsc/data/': {
                type: 'directory',
                description: 'Données et historiques'
            },
            'scripts/gsc/reports/': {
                type: 'directory',
                description: 'Logs et rapports'
            },
            'scripts/gsc/credentials/': {
                type: 'directory',
                description: 'Clés API (variables d\'environnement en prod)'
            }
        };
        
        console.log('\n📊 Structure minimale production:');
        Object.entries(structure).forEach(([path, info]) => {
            const icon = info.type === 'directory' ? '📁' : '📄';
            const required = info.required ? ' 🔥' : '';
            console.log(`   ${icon} ${path}${required}`);
            console.log(`      ${info.description}`);
        });
        
        return structure;
    }

    generateDeploymentInstructions() {
        console.log('\n🚀 INSTRUCTIONS DÉPLOIEMENT');
        console.log('===========================');
        
        const instructions = [
            '1. 📝 Modifier .gitignore avec les exceptions',
            '2. 📁 Créer les répertoires vides avec .gitkeep',
            '3. ➕ Ajouter les fichiers requis au git',
            '4. 🔑 Configurer variables d\'environnement en production',
            '5. ⏰ Configurer cron jobs sur le serveur',
            '6. 🧪 Tester les scripts en production'
        ];
        
        instructions.forEach((instruction, index) => {
            console.log(`   ${instruction}`);
        });
        
        console.log('\n📋 Commandes spécifiques:');
        console.log('   # Créer .gitkeep files');
        console.log('   touch scripts/gsc/data/.gitkeep');
        console.log('   touch scripts/gsc/reports/.gitkeep');
        console.log('   touch scripts/gsc/credentials/.gitkeep');
        console.log('');
        console.log('   # Ajouter au git');
        console.log('   git add scripts/gsc/gsc-monitoring.cron');
        console.log('   git add scripts/gsc/gsc-manager.cjs');
        console.log('   git add scripts/gsc/config.json');
        console.log('   git add scripts/gsc/tools/monitoring-dashboard.cjs');
        console.log('   git add scripts/gsc/tools/complete-analysis.cjs');
        console.log('   git add scripts/gsc/data/.gitkeep');
        console.log('   git add scripts/gsc/reports/.gitkeep');
        console.log('   git add scripts/gsc/credentials/.gitkeep');
        
        return instructions;
    }

    async runPreparation() {
        const requiredFiles = this.identifyRequiredFiles();
        this.analyzeDependencies();
        const exceptions = this.generateGitignoreExceptions();
        const structure = this.createProductionStructure();
        const instructions = this.generateDeploymentInstructions();
        
        console.log('\n✅ PRÉPARATION TERMINÉE');
        console.log('======================');
        console.log(`📦 Fichiers identifiés: ${this.requiredFiles.size}`);
        console.log(`📝 Exceptions .gitignore: ${exceptions.length - 2} lignes`);
        console.log('🎯 Prêt pour déploiement production');
        
        return {
            requiredFiles: Array.from(this.requiredFiles),
            exceptions,
            structure,
            instructions
        };
    }
}

// Exécution
async function main() {
    const prep = new GSCProductionPrep();
    const result = await prep.runPreparation();
    
    console.log('\n🎯 RÉSUMÉ POUR PRODUCTION');
    console.log('========================');
    console.log('Seuls les fichiers cron nécessaires seront déployés');
    console.log('Configuration minimale pour monitoring automatique');
    
    return result;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { GSCProductionPrep };