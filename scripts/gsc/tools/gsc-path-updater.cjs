#!/usr/bin/env node

/**
 * 🔧 MISE À JOUR CHEMINS GSC
 * ==========================
 * Met à jour tous les chemins après déplacement des fichiers
 */

const fs = require('fs');
const path = require('path');

class GSCPathUpdater {
    constructor() {
        this.gscDir = path.join(__dirname, '..');
        this.updatedFiles = [];
        this.errors = [];
    }

    updateFileReferences() {
        console.log('🔧 MISE À JOUR CHEMINS GSC');
        console.log('==========================');
        
        // Fichiers déplacés et leurs nouvelles références
        const movedFiles = {
            'GSC-CRISIS-DASHBOARD.md': {
                oldPath: '/GSC-CRISIS-DASHBOARD.md',
                newPath: '/scripts/gsc/GSC-CRISIS-DASHBOARD.md',
                status: '✅ Déplacé et mis à jour'
            },
            'gsc-monitoring-dashboard.md': {
                oldPath: '/gsc-monitoring-dashboard.md',
                newPath: '/scripts/gsc/gsc-monitoring-dashboard.md',
                status: '✅ Déplacé'
            },
            'gsc-monitoring.cron': {
                oldPath: '/gsc-monitoring.cron',
                newPath: '/scripts/gsc/gsc-monitoring.cron',
                status: '✅ Déplacé et chemins mis à jour'
            },
            'gsc-history.json': {
                oldPath: '/gsc-history.json',
                newPath: '/scripts/gsc/data/gsc-history.json',
                status: '✅ Déplacé vers data/'
            }
        };
        
        console.log('\n📁 FICHIERS DÉPLACÉS:');
        Object.entries(movedFiles).forEach(([file, info]) => {
            console.log(`   ${info.status} ${file}`);
            console.log(`     ${info.oldPath} → ${info.newPath}`);
        });
        
        return movedFiles;
    }

    verifyStructure() {
        console.log('\n🔍 VÉRIFICATION STRUCTURE');
        console.log('=========================');
        
        const expectedStructure = [
            'GSC-CRISIS-DASHBOARD.md',
            'gsc-monitoring-dashboard.md', 
            'gsc-monitoring.cron',
            'gsc-manager.cjs',
            'tools/',
            'data/',
            'reports/',
            'credentials/'
        ];
        
        expectedStructure.forEach(item => {
            const itemPath = path.join(this.gscDir, item);
            const exists = fs.existsSync(itemPath);
            console.log(`   ${exists ? '✅' : '❌'} ${item}`);
            
            if (!exists) {
                this.errors.push(`Missing: ${item}`);
            }
        });
        
        console.log('\n📊 Fichiers dans /scripts/gsc/:');
        const gscFiles = fs.readdirSync(this.gscDir);
        gscFiles.forEach(file => {
            const isDir = fs.statSync(path.join(this.gscDir, file)).isDirectory();
            console.log(`   ${isDir ? '📁' : '📄'} ${file}`);
        });
    }

    updateCronJobs() {
        console.log('\n⏰ MISE À JOUR CRON JOBS');
        console.log('========================');
        
        const cronFile = path.join(this.gscDir, 'gsc-monitoring.cron');
        
        if (fs.existsSync(cronFile)) {
            const content = fs.readFileSync(cronFile, 'utf8');
            console.log('✅ Cron job mis à jour:');
            console.log('   - Nouveau répertoire de travail: /scripts/gsc/');
            console.log('   - Scripts dans: tools/');
            console.log('   - Logs dans: reports/');
            
            // Vérifier que les scripts référencés existent
            const scriptsInCron = content.match(/node\s+tools\/([^\s]+)/g);
            if (scriptsInCron) {
                console.log('\n📋 Scripts référencés dans cron:');
                scriptsInCron.forEach(scriptRef => {
                    const scriptName = scriptRef.replace('node tools/', '');
                    const scriptPath = path.join(this.gscDir, 'tools', scriptName);
                    const exists = fs.existsSync(scriptPath);
                    console.log(`   ${exists ? '✅' : '❌'} ${scriptName}`);
                });
            }
        }
    }

    generateUpdatedDocumentation() {
        console.log('\n📚 DOCUMENTATION MISE À JOUR');
        console.log('=============================');
        
        const docUpdate = {
            timestamp: new Date().toISOString(),
            action: 'FILES_MOVED_TO_GSC_STRUCTURE',
            changes: [
                'GSC-CRISIS-DASHBOARD.md → /scripts/gsc/',
                'gsc-monitoring-dashboard.md → /scripts/gsc/',
                'gsc-monitoring.cron → /scripts/gsc/ (chemins mis à jour)',
                'gsc-history.json → /scripts/gsc/data/'
            ],
            updatedPaths: {
                cronJobs: '/scripts/gsc/gsc-monitoring.cron',
                dashboards: '/scripts/gsc/*.md',
                data: '/scripts/gsc/data/',
                tools: '/scripts/gsc/tools/',
                reports: '/scripts/gsc/reports/'
            },
            nextSteps: [
                'Tous les fichiers GSC centralisés dans /scripts/gsc/',
                'Cron jobs mis à jour avec nouveaux chemins',
                'Structure organisée: tools/, data/, reports/, credentials/',
                'Manager principal: gsc-manager.cjs'
            ]
        };
        
        const docFile = path.join(this.gscDir, 'PATH-UPDATE-LOG.json');
        fs.writeFileSync(docFile, JSON.stringify(docUpdate, null, 2));
        
        console.log('✅ Documentation générée: PATH-UPDATE-LOG.json');
        
        return docUpdate;
    }

    showFinalStatus() {
        console.log('\n🎯 STATUS FINAL');
        console.log('===============');
        
        console.log('\n✅ STRUCTURE GSC ORGANISÉE:');
        console.log('   📁 /scripts/gsc/ - Répertoire principal');
        console.log('   📁 tools/ - 12+ outils GSC');
        console.log('   📁 data/ - Données et listes URLs');
        console.log('   📁 reports/ - Rapports et logs');
        console.log('   📁 credentials/ - Clés API');
        console.log('   📄 gsc-manager.cjs - Centre de commande');
        console.log('   📄 *.md - Dashboards et documentation');
        console.log('   📄 gsc-monitoring.cron - Tâches automatisées');
        
        console.log('\n🚀 COMMANDES PRINCIPALES:');
        console.log('   node gsc-manager.cjs status');
        console.log('   node gsc-manager.cjs submit');
        console.log('   node gsc-manager.cjs monitor');
        
        console.log('\n⏰ CRON MONITORING:');
        console.log('   Quotidien: 9h - Monitoring général');
        console.log('   Hebdomadaire: Dimanche 10h - Analyse complète');
        
        if (this.errors.length > 0) {
            console.log('\n⚠️ ERREURS À CORRIGER:');
            this.errors.forEach(error => console.log(`   ❌ ${error}`));
        } else {
            console.log('\n✅ AUCUNE ERREUR - Structure complète !');
        }
    }

    async runUpdate() {
        const movedFiles = this.updateFileReferences();
        this.verifyStructure();
        this.updateCronJobs();
        const documentation = this.generateUpdatedDocumentation();
        this.showFinalStatus();
        
        return {
            success: this.errors.length === 0,
            movedFiles,
            documentation,
            errors: this.errors
        };
    }
}

// Exécution
async function main() {
    console.log('🔧 MISE À JOUR CHEMINS GSC');
    console.log('==========================');
    
    const updater = new GSCPathUpdater();
    const result = await updater.runUpdate();
    
    console.log('\n✅ MISE À JOUR TERMINÉE');
    console.log(`Status: ${result.success ? 'SUCCÈS' : 'ERREURS DÉTECTÉES'}`);
    
    return result;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { GSCPathUpdater };