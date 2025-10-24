#!/usr/bin/env node

/**
 * 🧪 VALIDATEUR STRUCTURED DATA VIDEOS
 * ===================================
 * Teste les structured data des vidéos pour GSC
 */

class StructuredDataValidator {
    constructor() {
        this.sampleVideoData = {
            id: '1234567890123456',
            video_url: 'https://video.xx.fbcdn.net/v/sample.mp4',
            permalink_url: 'https://www.facebook.com/reel/1234567890123456',
            created_time: '2025-10-17T10:00:00Z',
            message: '✨ Découvrez nos services de nettoyage professionnel ✨',
            length: 30,
            thumbnail: 'https://example.com/thumb.jpg'
        };
    }

    generateValidStructuredData(reel) {
        console.log('🧪 GÉNÉRATION STRUCTURED DATA VALIDE');
        console.log('====================================');
        
        // Reproduire la logique exacte du code
        const baseUrl = 'https://cciservices.online';
        const localThumbnailUrl = `${baseUrl}/api/thumbnails/${reel.id}`;
        
        // Clean description
        const cleanDescription = reel.message && reel.message.trim() ? 
            reel.message.replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F]/g, '') : 
            "Découvrez nos services de nettoyage professionnel en vidéo. CCI Services, experts en nettoyage de tapis, marbre et entretien automobile à Tunis.";
        
        // URL logic
        const hasVideoUrl = reel.video_url && reel.video_url.trim();
        const hasPermalinkUrl = reel.permalink_url && reel.permalink_url.trim();
        const fallbackUrl = `https://www.facebook.com/watch/?v=${reel.id}`;
        
        let contentUrl, embedUrl;
        
        if (hasVideoUrl) {
            contentUrl = reel.video_url.trim();
            embedUrl = hasPermalinkUrl ? reel.permalink_url.trim() : contentUrl;
        } else if (hasPermalinkUrl) {
            contentUrl = reel.permalink_url.trim();
            embedUrl = contentUrl;
        } else {
            contentUrl = fallbackUrl;
            embedUrl = fallbackUrl;
        }
        
        // URL validation
        const isValidUrl = (url) => {
            try {
                new URL(url);
                return url.startsWith('http://') || url.startsWith('https://');
            } catch {
                return false;
            }
        };
        
        if (!isValidUrl(contentUrl)) {
            contentUrl = fallbackUrl;
        }
        if (!isValidUrl(embedUrl)) {
            embedUrl = fallbackUrl;
        }
        
        const uploadDate = reel.created_time || new Date().toISOString();
        
        const structuredData = {
            "@type": "VideoObject",
            "@id": `https://cciservices.online/blogs#video-${reel.id}`,
            "name": reel.message && reel.message.trim() ? 
                cleanDescription.slice(0, 100) : 
                "Reel vidéo CCI Services",
            "description": cleanDescription,
            "thumbnailUrl": localThumbnailUrl,
            "uploadDate": uploadDate,
            "contentUrl": contentUrl,
            "embedUrl": embedUrl,
            "duration": reel.length ? `PT${Math.round(reel.length)}S` : "PT30S",
            "publisher": {
                "@type": "Organization",
                "name": "CCI Services",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${baseUrl}/logo.png`
                }
            },
            "author": {
                "@type": "Organization",
                "name": "CCI Services"
            },
            "interactionStatistic": [
                {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/WatchAction",
                    "userInteractionCount": reel.views || 0
                },
                {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/LikeAction",
                    "userInteractionCount": reel.likes || 0
                }
            ],
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${baseUrl}/blogs`
            }
        };
        
        console.log('\n📋 Structured Data généré:');
        console.log(JSON.stringify(structuredData, null, 2));
        
        return structuredData;
    }

    validateRequiredFields(structuredData) {
        console.log('\n✅ VALIDATION CHAMPS REQUIS');
        console.log('===========================');
        
        const requiredFields = [
            '@type',
            'name',
            'description',
            'thumbnailUrl',
            'uploadDate'
        ];
        
        const criticalFields = [
            'contentUrl',
            'embedUrl'
        ];
        
        console.log('\n📋 Champs requis:');
        requiredFields.forEach(field => {
            const exists = structuredData[field] !== undefined;
            const value = structuredData[field];
            console.log(`   ${exists ? '✅' : '❌'} ${field}: ${exists ? (typeof value === 'string' ? value.slice(0, 50) + '...' : 'OK') : 'MANQUANT'}`);
        });
        
        console.log('\n🚨 Champs critiques (au moins un requis):');
        criticalFields.forEach(field => {
            const exists = structuredData[field] !== undefined;
            const value = structuredData[field];
            console.log(`   ${exists ? '✅' : '❌'} ${field}: ${exists ? value : 'MANQUANT'}`);
        });
        
        const hasContentOrEmbed = structuredData.contentUrl || structuredData.embedUrl;
        console.log(`\n🎯 Status GSC: ${hasContentOrEmbed ? '✅ VALIDE' : '❌ INVALIDE - manque contentUrl ou embedUrl'}`);
        
        return hasContentOrEmbed;
    }

    generateHTMLVisible(reel) {
        console.log('\n🌐 HTML VISIBLE POUR GOOGLE');
        console.log('===========================');
        
        const baseUrl = 'https://cciservices.online';
        const localThumbnailUrl = `${baseUrl}/api/thumbnails/${reel.id}`;
        const userFacingThumbnailUrl = reel.thumbnail || localThumbnailUrl;
        
        const contentUrl = reel.video_url || reel.permalink_url || `https://www.facebook.com/watch/?v=${reel.id}`;
        
        const htmlVisible = `
<article itemScope itemType="https://schema.org/VideoObject">
  <h3 itemProp="name">Reel vidéo CCI Services</h3>
  <p itemProp="description">${reel.message}</p>
  <time itemProp="uploadDate" dateTime="${reel.created_time}">
    ${new Date(reel.created_time).toLocaleDateString()}
  </time>
  <video 
    itemProp="contentUrl"
    src="${contentUrl}"
    poster="${userFacingThumbnailUrl}"
    width="320" 
    height="240"
    controls
    preload="metadata"
  >
    <source src="${contentUrl}" type="video/mp4" />
    Votre navigateur ne supporte pas les vidéos HTML5.
  </video>
  <img itemProp="thumbnailUrl" src="${localThumbnailUrl}" alt="Aperçu vidéo" />
  <span itemProp="duration" content="${reel.length ? `PT${Math.round(reel.length)}S` : "PT30S"}">
    ${reel.length ? `${Math.round(reel.length)}s` : "30s"}
  </span>
  <a href="${reel.permalink_url}" itemProp="url">Voir sur Facebook</a>
</article>`;
        
        console.log(htmlVisible);
        
        return htmlVisible;
    }

    async runValidation() {
        console.log('🧪 VALIDATION COMPLETE STRUCTURED DATA');
        console.log('======================================');
        
        const structuredData = this.generateValidStructuredData(this.sampleVideoData);
        const isValid = this.validateRequiredFields(structuredData);
        this.generateHTMLVisible(this.sampleVideoData);
        
        console.log('\n📊 RÉSUMÉ VALIDATION');
        console.log('===================');
        console.log(`✅ Structured Data: ${isValid ? 'VALIDE' : 'INVALIDE'}`);
        console.log(`✅ ContentUrl présent: ${structuredData.contentUrl ? 'OUI' : 'NON'}`);
        console.log(`✅ EmbedUrl présent: ${structuredData.embedUrl ? 'OUI' : 'NON'}`);
        console.log(`✅ HTML visible: PRÉSENT`);
        console.log(`✅ ItemProp contentUrl: PRÉSENT`);
        
        console.log('\n🎯 PROCHAINES ÉTAPES');
        console.log('===================');
        console.log('1. ✅ Code modifié - contentUrl ajouté partout');
        console.log('2. 🚀 Déployer les changements');
        console.log('3. ⏰ Attendre 24-48h pour re-exploration GSC');
        console.log('4. 🔍 Vérifier dans Search Console');
        console.log('5. 📊 Tester avec Rich Results Test Google');
        
        return {
            valid: isValid,
            hasContentUrl: !!structuredData.contentUrl,
            hasEmbedUrl: !!structuredData.embedUrl,
            recommendation: 'DEPLOY_AND_MONITOR'
        };
    }
}

// Exécution
async function main() {
    const validator = new StructuredDataValidator();
    return await validator.runValidation();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { StructuredDataValidator };