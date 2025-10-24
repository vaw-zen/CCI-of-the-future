#!/usr/bin/env node

/**
 * 🔧 CORRECTEUR DE CATÉGORISATION URLs
 * ===================================
 * Corrige la catégorisation des URLs selon les vraies règles :
 * - Pages : un seul mot après le slash (/tapis, /contact)
 * - Articles : contiennent des tirets (-)
 */

const fs = require('fs');
const path = require('path');

class URLCategorizer {
    constructor() {
        this.currentFile = path.join(__dirname, '../data/url-lists/complete-url-list-2025-10-23.json');
        this.correctedFile = path.join(__dirname, '../data/url-lists/complete-url-list-corrected-2025-10-23.json');
    }

    categorizeURL(url) {
        // Extraire le path de l'URL
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        
        // Règle 1: Page d'accueil
        if (path === '/' || path === '') {
            return 'page';
        }
        
        // Règle 2: Videos/Reels
        if (path.includes('/reels/')) {
            return 'video';
        }
        
        // Règle 3: Articles (contiennent des tirets)
        if (path.includes('-')) {
            return 'article';
        }
        
        // Règle 4: Pages (un seul mot après le slash)
        const pathParts = path.split('/').filter(part => part !== '');
        if (pathParts.length === 1) {
            return 'page';
        }
        
        // Règle 5: Services (mots multiples sans tirets, souvent des services)
        if (pathParts.length > 1 && !path.includes('-')) {
            return 'service';
        }
        
        // Défaut
        return 'page';
    }

    async correctCategorization() {
        console.log('🔧 CORRECTION DE LA CATÉGORISATION');
        console.log('===================================');
        
        // Lire le fichier actuel
        const currentData = JSON.parse(fs.readFileSync(this.currentFile, 'utf8'));
        
        console.log('\n📊 Analyse actuelle:');
        console.log(`   - Services: ${currentData.summary.services}`);
        console.log(`   - Articles: ${currentData.summary.articles}`);
        console.log(`   - Videos: ${currentData.summary.videos}`);
        console.log(`   - Pages: ${currentData.summary.pages}`);
        
        // Corriger chaque URL
        const correctedUrls = currentData.prioritizedUrls.map(item => {
            const correctCategory = this.categorizeURL(item.url);
            const wasChanged = item.category !== correctCategory;
            
            if (wasChanged) {
                console.log(`\n🔄 ${item.url}`);
                console.log(`   ${item.category} → ${correctCategory}`);
            }
            
            return {
                ...item,
                category: correctCategory,
                corrected: wasChanged
            };
        });
        
        // Recréer les catégories
        const categorized = {
            services: [],
            articles: [],
            videos: [],
            pages: []
        };
        
        correctedUrls.forEach(item => {
            const categoryKey = item.category + 's'; // service → services
            if (categorized[categoryKey]) {
                categorized[categoryKey].push(item.url);
            }
        });
        
        // Nouveau résumé
        const newSummary = {
            services: categorized.services.length,
            articles: categorized.articles.length,
            videos: categorized.videos.length,
            pages: categorized.pages.length
        };
        
        console.log('\n📊 Nouvelle catégorisation:');
        console.log(`   - Services: ${newSummary.services} (${newSummary.services - currentData.summary.services >= 0 ? '+' : ''}${newSummary.services - currentData.summary.services})`);
        console.log(`   - Articles: ${newSummary.articles} (${newSummary.articles - currentData.summary.articles >= 0 ? '+' : ''}${newSummary.articles - currentData.summary.articles})`);
        console.log(`   - Videos: ${newSummary.videos} (${newSummary.videos - currentData.summary.videos >= 0 ? '+' : ''}${newSummary.videos - currentData.summary.videos})`);
        console.log(`   - Pages: ${newSummary.pages} (${newSummary.pages - currentData.summary.pages >= 0 ? '+' : ''}${newSummary.pages - currentData.summary.pages})`);
        
        // Créer le fichier corrigé
        const correctedData = {
            timestamp: new Date().toISOString(),
            total: correctedUrls.length,
            correctionApplied: true,
            rules: {
                pages: "Un seul mot après le slash (ex: /tapis, /contact)",
                articles: "Contiennent des tirets (-)",
                services: "Mots multiples sans tirets",
                videos: "Répertoire /reels/"
            },
            prioritizedUrls: correctedUrls.map(item => {
                const { corrected, ...cleanItem } = item;
                return cleanItem;
            }),
            categorized,
            summary: newSummary,
            changes: {
                totalCorrected: correctedUrls.filter(item => item.corrected).length,
                details: correctedUrls.filter(item => item.corrected).map(item => ({
                    url: item.url,
                    oldCategory: currentData.prioritizedUrls.find(old => old.url === item.url)?.category,
                    newCategory: item.category
                }))
            }
        };
        
        // Sauvegarder
        fs.writeFileSync(this.correctedFile, JSON.stringify(correctedData, null, 2));
        
        console.log('\n✅ CORRECTION TERMINÉE');
        console.log(`📁 Fichier sauvegardé: ${this.correctedFile}`);
        console.log(`🔧 ${correctedData.changes.totalCorrected} URLs corrigées`);
        
        return correctedData;
    }

    showExamples() {
        console.log('\n📋 EXEMPLES DE CATÉGORISATION');
        console.log('=============================');
        
        const examples = [
            { url: 'https://cciservices.online/tapis', expected: 'page', rule: 'Un seul mot' },
            { url: 'https://cciservices.online/contact', expected: 'page', rule: 'Un seul mot' },
            { url: 'https://cciservices.online/conseils', expected: 'page', rule: 'Un seul mot' },
            { url: 'https://cciservices.online/nettoyage-tapis-tunis', expected: 'service', rule: 'Mots multiples sans tirets' },
            { url: 'https://cciservices.online/conseils/guide-nettoyage-tapis', expected: 'article', rule: 'Contient des tirets' },
            { url: 'https://cciservices.online/reels/123456', expected: 'video', rule: 'Répertoire /reels/' }
        ];
        
        examples.forEach(ex => {
            const result = this.categorizeURL(ex.url);
            const status = result === ex.expected ? '✅' : '❌';
            console.log(`${status} ${ex.url.replace('https://cciservices.online', '')}`);
            console.log(`   → ${result} (${ex.rule})`);
        });
    }
}

// Exécution
async function main() {
    const categorizer = new URLCategorizer();
    
    categorizer.showExamples();
    
    const correctedData = await categorizer.correctCategorization();
    
    console.log('\n🎯 PROCHAINES ÉTAPES');
    console.log('===================');
    console.log('1. Vérifier le fichier corrigé');
    console.log('2. Remplacer le fichier original si satisfait');
    console.log('3. Mettre à jour les scripts de soumission');
    
    return correctedData;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { URLCategorizer };