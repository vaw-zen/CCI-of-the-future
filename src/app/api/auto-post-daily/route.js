import { NextResponse } from "next/server";
import {GoogleGenerativeAI} from "@google/generative-ai"; 
import PostRotationManager from "../../../utils/post-rotation-manager.js";
import { generateUTMUrl, UTM_PRESETS } from "../../../utils/utmGenerator.js";

const FB_API_VERSION = process.env.FB_API_VERSION || 'v23.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    // Initialize rotation manager
    const rotationManager = new PostRotationManager();
    
    // Check environment variables
    if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN || !GEMINI_API_KEY) {
      console.error("Missing required environment variables");
      return NextResponse.json(
        { error: "Missing configuration. Check environment variables." },
        { status: 500 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Parse request body for custom prompts (optional)
    let requestBody = {};
    try {
      requestBody = await req.json();
    } catch (e) {
      // Use defaults if no body provided
    }

    const { 
      customPrompt, 
      postType = "tip", 
      includeHashtags = true, 
      includeImage = true, 
      forceService = null,
      dryRun = false,
      currentSeason = null,
      currentMonth = null 
    } = requestBody;

    // Resolve season dynamically (from payload or auto-detect)
    const resolvedSeason = currentSeason || (() => {
      const month = new Date().getMonth() + 1;
      if (month >= 3 && month <= 5) return 'printemps';
      if (month >= 6 && month <= 8) return 'été';
      if (month >= 9 && month <= 11) return 'automne';
      return 'hiver';
    })();
    const resolvedMonth = currentMonth || new Date().toLocaleDateString('fr-FR', { month: 'long' });

    // UTM helper for auto-post links
    const addUTM = (url, service = '') => {
      return generateUTMUrl(url, {
        source: 'facebook',
        medium: 'social',
        campaign: `auto_post_${postType}`,
        content: service || 'general'
      });
    };

    // Get recommended service based on rotation
    const recommendedService = forceService || rotationManager.getNextRecommendedService(postType);
    
    console.log('📊 Rotation Status:', {
      recommendedService,
      rotationStatus: rotationManager.getRotationStatus()
    });

    // Enhanced call-to-action system with UTM-tracked, service-specific URLs
    const generateCallToAction = (targetService) => {
      const siteUrl = addUTM('https://cciservices.online', targetService);
      const devisUrl = addUTM('https://cciservices.online/devis', targetService);

      const contactInfo = `
🔗 Site: ${siteUrl}
☎️ Tel: +216 98 55 77 66
📧 Email: contact@cciservices.online`;

      // Use service-specific CTA if we have a target service
      if (targetService && rotationManager.serviceConfig[targetService]) {
        const serviceUrl = addUTM(rotationManager.getServiceUrl(targetService), targetService);
        const serviceName = rotationManager.getServiceDisplayName(targetService);
        
        const serviceSpecificCTAs = {
          salon: [
            `💺 Découvrez nos techniques de nettoyage salon: ${serviceUrl}`,
            `🛋️ Redonnez vie à votre salon: ${serviceUrl}`,
            `✨ Salon comme neuf avec CCI Services: ${serviceUrl}`
          ],
          tapis: [
            `🧽 Expertise nettoyage tapis & moquette: ${serviceUrl}`,
            `🌟 Tapis impeccables garantis: ${serviceUrl}`,
            `💯 Détachage professionnel: ${serviceUrl}`
          ],
          marbre: [
            `💎 Polissage marbre professionnel: ${serviceUrl}`,
            `⭐ Cristallisation et entretien marbre: ${serviceUrl}`,
            `✨ Redonnez l'éclat à votre marbre: ${serviceUrl}`
          ],
          tapisserie: [
            `🪑 Services tapisserie & rembourrage: ${serviceUrl}`,
            `🛠️ Restauration mobilier expert: ${serviceUrl}`,
            `✨ Retapissage professionnel: ${serviceUrl}`
          ],
          tfc: [
            `🏢 Nettoyage TFC & post-chantier: ${serviceUrl}`,
            `🔧 Expertise nettoyage professionnel: ${serviceUrl}`,
            `💼 Solutions entreprises: ${serviceUrl}`
          ],
          entreprises: [
            `🏢 Conventions de nettoyage annuelles pour entreprises: ${serviceUrl}`,
            `📋 Découvrez nos offres B2B sur mesure: ${serviceUrl}`,
            `🤝 Partenariat nettoyage professionnel: ${serviceUrl}`
          ]
        };

        const ctas = serviceSpecificCTAs[targetService] || [`📞 ${serviceName}: ${serviceUrl}`];
        return ctas[Math.floor(Math.random() * ctas.length)] + contactInfo;
      }
      
      // Fallback to general CTAs
      const generalCallToActions = [
        `💬 Simulateur de Devis gratuit: ${devisUrl}`,
        `💬 Demandez votre devis gratuit: ${devisUrl}`,
        `💬 Devis personnalisé en 24h - gratuit!`,
        `💬 Consultation gratuite pour votre projet!`
      ];

      const randomCTA = generalCallToActions[Math.floor(Math.random() * generalCallToActions.length)];
      return randomCTA + contactInfo;
    };

    // Create dynamic prompts with target service focus
    const createServiceSpecificPrompt = (basePrompt, targetService) => {
      if (!targetService || !rotationManager.serviceConfig[targetService]) {
        return basePrompt;
      }
      
      const serviceInfo = rotationManager.serviceConfig[targetService];
      const serviceName = serviceInfo.displayName;
      const keywords = serviceInfo.keywords.slice(0, 3).join(', '); // Use first 3 keywords
      
      return basePrompt.replace(
        'SUJET: UN conseil professionnel précis sur l\'un de ces services:',
        `SUJET OBLIGATOIRE: ${serviceName} (${keywords}). FOCUS uniquement sur ce service:`
      ).replace(
        'SERVICE À CHOISIR (un seul par post):',
        `SERVICE OBLIGATOIRE: ${serviceName}. Ne pas mentionner d'autres services:`
      );
    };

    const prompts = {
      tip: `Tu créés UN SEUL post Facebook pour CCI Services, entreprise de nettoyage professionnel en Tunisie.

CONSIGNE: Génère EXACTEMENT UN POST unique et spécifique.

SUJET: UN conseil professionnel précis sur l'un de ces services:
- Nettoyage de tapis et moquettes (techniques, détachage)
- Nettoyage de salons/canapés (injection-extraction, produits)
- Ponçage et polissage de marbre (cristallisation, entretien)
- Tapisserie et rembourrage (restauration, tissus)
- Nettoyage fin de chantier (post-construction)
- Entretien des bureaux (maintenance professionnelle)

RÈGLES STRICTES:
- EXACTEMENT 180-280 caractères pour le contenu principal
- Français naturel et professionnel
- 2-3 emojis max, bien intégrés
- Mentionner "CCI Services" UNE FOIS
- Conseil technique et pratique
- Pas de call-to-action (ajouté automatiquement)
- FOCUS sur un seul service à la fois

FORMAT:
[Emoji] [Conseil CCI Services spécifique] [Technique/astuce] [Bénéfice concret] [Emoji final]

EXEMPLE SALON:
"� Conseil CCI Services : Testez toujours nos produits sur une zone cachée avant nettoyage ! Notre méthode injection-extraction préserve vos tissus délicats ✨"

EXEMPLE MARBRE:
"💎 CCI Services vous conseille : évitez les produits acides sur le marbre ! Notre polissage professionnel redonne l'éclat d'origine sans risque ⭐"`,

      motivation: `Tu créés UN SEUL post motivationnel Facebook pour CCI Services, entreprise de nettoyage professionnel en Tunisie.

CONSIGNE: Génère EXACTEMENT UN POST inspirant et unique.

THÈME: Bénéfices émotionnels du nettoyage professionnel:
- Confort et élégance du foyer
- Santé et bien-être de la famille
- Gain de temps précieux
- Qualité professionnelle garantie
- Tranquillité d'esprit

RÈGLES STRICTES:
- EXACTEMENT 180-280 caractères pour le contenu principal
- Ton inspirant et chaleureux
- 2-3 emojis max, bien intégrés
- Mentionner "CCI Services" UNE FOIS
- Focus sur l'émotion et le bien-être
- Pas de call-to-action (ajouté automatiquement)

FORMAT:
[Emoji] [Message inspirant CCI Services] [Bénéfice émotionnel] [Impact positif] [Emoji final]

EXEMPLE:
"🏡 Avec CCI Services, redécouvrez le plaisir de rentrer chez vous ! Un intérieur impeccable, c'est plus de temps pour votre famille et votre bonheur 💫"`,

      service: `Tu créés UN SEUL post de présentation service pour CCI Services, entreprise de nettoyage professionnel en Tunisie.

CONSIGNE: Génère EXACTEMENT UN POST mettant en valeur UN service spécifique.

SERVICE À CHOISIR (un seul par post):
- Nettoyage de tapis : injection-extraction, détachage spécialisé
- Nettoyage de salons : tissus délicats, cuir, microfibre
- Ponçage et polissage de marbre : cristallisation, restauration
- Tapisserie : rembourrage, recouvrement, restauration mobilier
- Nettoyage fin de chantier : sols, murs, vitres, finitions
- Entretien des bureaux : maintenance régulière, espaces professionnels

RÈGLES STRICTES:
- EXACTEMENT 180-280 caractères pour le contenu principal
- Français professionnel et précis
- 2-3 emojis max, cohérents avec le service
- Mentionner "CCI Services" UNE FOIS
- Décrire technique et résultats
- Pas de call-to-action (ajouté automatiquement)
- UN SEUL service par post

FORMAT:
[Emoji service] [Service CCI précis] [Technique/méthode] [Résultat professionnel] [Emoji résultat]

EXEMPLE TAPIS:
"🧽 CCI Services maîtrise l'injection-extraction pour vos tapis ! Notre technique élimine taches tenaces et allergènes en profondeur. Résultats garantis 🌟"

EXEMPLE SALON:
"🛋️ CCI Services redonne vie à vos canapés ! Nettoyage adapté à chaque tissu avec produits professionnels non-toxiques. Comme neufs ! ✨"`,

      seasonal: (() => {
        const seasonalThemes = {
          hiver: {
            emoji: '❄️',
            emojiEnd: '🏠',
            themes: [
              'Confort hivernal et intérieur douillet',
              'Entretien pendant les mois froids',
              'Préparation pour les fêtes',
              'Protection des textiles contre l\'humidité hivernale'
            ],
            example: `❄️ Hiver avec CCI Services : gardez votre intérieur impeccable et douillet ! Tapis, salons et marbre brillent pour vos soirées en famille 🏠`
          },
          printemps: {
            emoji: '🌸',
            emojiEnd: '✨',
            themes: [
              'Grand ménage de printemps',
              'Renouveau et fraîcheur de votre intérieur',
              'Nettoyage en profondeur après l\'hiver',
              'Redonner vie à vos espaces pour la belle saison'
            ],
            example: `🌸 Printemps avec CCI Services : c'est le moment du grand nettoyage ! Rafraîchissez tapis, salons et marbre pour accueillir la belle saison ✨`
          },
          été: {
            emoji: '☀️',
            emojiEnd: '🌊',
            themes: [
              'Fraîcheur et propreté estivale',
              'Entretien léger et régulier en été',
              'Préparation pour les invités d\'été',
              'Protection contre la poussière et la chaleur'
            ],
            example: `☀️ Été avec CCI Services : un intérieur frais et impeccable malgré la chaleur ! Profitez de la saison avec des espaces propres et accueillants 🌊`
          },
          automne: {
            emoji: '🍂',
            emojiEnd: '🏡',
            themes: [
              'Préparation pour l\'hiver',
              'Nettoyage de rentrée et changement de saison',
              'Maintenance avant les mois froids',
              'Préparation des fêtes de fin d\'année'
            ],
            example: `🍂 Automne avec CCI Services : préparez votre cocon pour l'hiver ! Tapis, canapés et marbre retrouvent leur éclat avant les soirées douillettes 🏡`
          }
        };
        const theme = seasonalThemes[resolvedSeason] || seasonalThemes.automne;
        return `Tu créés UN SEUL post saisonnier Facebook pour CCI Services, entreprise de nettoyage professionnel en Tunisie.

CONSIGNE: Génère EXACTEMENT UN POST adapté à la saison actuelle (${resolvedMonth}/${resolvedSeason}).

THÈMES ${resolvedSeason.toUpperCase()}:
${theme.themes.map(t => '- ' + t).join('\n')}

RÈGLES STRICTES:
- EXACTEMENT 180-280 caractères pour le contenu principal
- Contexte saisonnier ${resolvedSeason}
- 2-3 emojis max, liés à la saison (${theme.emoji} ${theme.emojiEnd})
- Mentionner "CCI Services" UNE FOIS
- Conseil pertinent pour ${resolvedMonth}
- Pas de call-to-action (ajouté automatiquement)

FORMAT:
[Emoji saison] [Conseil CCI Services saisonnier] [Bénéfice préparation] [Emoji]

EXEMPLE:
"${theme.example}"`;
      })() 
    };

    const selectedPrompt = customPrompt || prompts[postType] || prompts.tip;
    
    // Apply service-specific targeting to the prompt
    const targetedPrompt = createServiceSpecificPrompt(selectedPrompt, recommendedService);

    console.log("Generating content with Gemini AI...", {
      postType,
      targetService: recommendedService,
      promptType: customPrompt ? 'custom' : 'template'
    });
    
    // Generate content with Gemini - with strict instructions for single post
    const strictPrompt = targetedPrompt + "\n\nIMPORTANT: Génère EXACTEMENT UN SEUL post. Pas de choix multiples, pas d'alternatives. Juste UN contenu unique et précis.";
    
    const result = await model.generateContent(strictPrompt);
    const response = await result.response;
    let generatedCaption = response.text().trim();

    // Clean up any multiple post attempts or formatting issues
    generatedCaption = generatedCaption
      .split('\n\n')[0] // Take only the first paragraph if multiple
      .split('Option')[0] // Remove any "Option 1", "Option 2" text
      .split('Alternative')[0] // Remove alternatives
      .split('Ou bien')[0] // Remove French alternatives
      .replace(/^\d+\.\s*/, '') // Remove numbering at start
      .replace(/^Post\s*\d*\s*:?\s*/i, '') // Remove "Post 1:", "Post:" etc
      .trim();

    // Validate content quality
    if (generatedCaption.length < 100) {
      console.warn("Generated content too short, regenerating...");
      const fallbackResult = await model.generateContent(strictPrompt);
      const fallbackResponse = await fallbackResult.response;
      generatedCaption = fallbackResponse.text().trim();
    }

    // Ensure content mentions CCI Services
    if (!generatedCaption.toLowerCase().includes('cci services')) {
      generatedCaption = generatedCaption.replace(/CCI/i, 'CCI Services');
    }

    // Detect actual service from generated content
    const detectedService = rotationManager.detectServiceFromContent(generatedCaption) || recommendedService;
    
    // Verify rotation rules
    if (!rotationManager.canPostService(detectedService)) {
      console.warn(`⚠️ Rotation rule violation: ${detectedService} used too recently`);
      // Force regeneration with different service or use fallback
      const alternativeService = rotationManager.getNextRecommendedService();
      if (alternativeService !== detectedService) {
        console.log(`🔄 Regenerating with alternative service: ${alternativeService}`);
        const alternativePrompt = createServiceSpecificPrompt(selectedPrompt, alternativeService);
        const alternativeResult = await model.generateContent(alternativePrompt + "\n\nIMPORTANT: Génère EXACTEMENT UN SEUL post unique.");
        const alternativeResponse = await alternativeResult.response;
        generatedCaption = alternativeResponse.text().trim();
      }
    }

    // ALWAYS add service-specific call-to-action
    const finalService = rotationManager.detectServiceFromContent(generatedCaption) || recommendedService;
    const callToAction = generateCallToAction(finalService);
    generatedCaption += "\n\n" + callToAction;

    // Add hashtags if requested
    if (includeHashtags) {
      const hashtags = "\n\n#CCIServices #NettoyageProfessionnel #Tunisie #CleaningTips #Marbre #Salon #Tapis #Tapisserie #NettoyageTunisie #ServicesNettoyage";
      generatedCaption += hashtags;
    }

    console.log("Generated caption:", generatedCaption);

    // Advanced content analysis for precise image matching
    const analyzeContentForImages = (text) => {
      const content = text.toLowerCase();
      
      // Enhanced keyword detection with more specific terms and weights
      const servicePatterns = {
        salon: {
          keywords: ['salon', 'canapé', 'sofa', 'fauteuil', 'meubles', 'furniture', 'injection', 'extraction', 'cuir', 'tissu d\'ameublement'],
          weight: 1
        },
        tapis: {
          keywords: ['tapis', 'moquette', 'carpet', 'rug', 'sol textile', 'aspirateur', 'détachage tapis'],
          weight: 1
        },
        marbre: {
          keywords: ['marbre', 'marble', 'polissage', 'brillance', 'cristallisation', 'pierre', 'granit', 'sol en marbre', 'plan de travail'],
          weight: 1
        },
        postChantier: {
          keywords: ['chantier', 'construction', 'post-construction', 'fin de chantier', 'rénovation', 'après travaux'],
          weight: 1
        },
        tapisserie: {
          keywords: ['tapisserie', 'rembourrage', 'upholstery', 'tissu', 'recouvrement', 'restauration', 'retapissage'],
          weight: 1
        },
        tfc: {
          keywords: ['bureau', 'office', 'commercial', 'entreprise', 'tfc', 'professionnel', 'espace de travail'],
          weight: 1
        }
      };

      let bestMatch = { service: 'general', score: 0 };
      
      // Analyze each service with weighted scoring
      for (const [service, config] of Object.entries(servicePatterns)) {
        let score = 0;
        
        config.keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            // Higher score for exact matches
            score += keyword.length > 5 ? 2 : 1;
          }
        });
        
        // Apply service weight
        score *= config.weight;
        
        if (score > bestMatch.score) {
          bestMatch = { service, score };
        }
      }

      console.log("Content analysis result:", { 
        content: content.substring(0, 100) + "...", 
        bestMatch, 
        allScores: Object.keys(servicePatterns).map(s => ({
          service: s,
          score: servicePatterns[s].keywords.filter(k => content.includes(k)).length
        }))
      });
      
      return bestMatch.service;
    };

    // Enhanced image selection with content analysis
    let selectedImageUrl = null;
    
    if (includeImage) {
      // CCI Services local images organized by specific service types
      const cciImagesByService = {
        // 1. Nettoyage salon (sofa/furniture cleaning)
        salon: [
          // From /home (no subfolders)
          "https://cciservices.online/home/nettoyagesolonméthodeinjectionextraction.webp",
          // From /gallery/salon (categorized subfolder)
          "https://cciservices.online/gallery/salon/salon.jpg",
          "https://cciservices.online/gallery/salon/salon2.jpg",
          "https://cciservices.online/gallery/salon/car.jpg",
          "https://cciservices.online/gallery/salon/car2.jpg",
        
        ],
        
        // 2. Nettoyage moquettes/tapis (carpet/rug cleaning)
        tapis: [
          // From /home (no subfolders)
          "https://cciservices.online/home/nettoyage%20moquetteaveclaméthodeinjectionextraction.webp",
          // From /gallery/moquette (categorized subfolder)
          "https://cciservices.online/gallery/moquette/moquette1.jpg",
          "https://cciservices.online/gallery/moquette/moquette2.jpg",
          "https://cciservices.online/gallery/moquette/moquette3.jpg",
          "https://cciservices.online/gallery/moquette/moquette4.jpg",
          "https://cciservices.online/gallery/moquette/moquette5.jpg",
          "https://cciservices.online/gallery/moquette/moquette6.jpg"
        ],
        
        // 3. Marbre (marble polishing/crystallization)
        marbre: [
          // From /home (no subfolders)
          "https://cciservices.online/home/cristallisationsolenmarbre.webp",
          "https://cciservices.online/home/polishingkitchenmrblecountre.webp",
          // From /gallery/marbre (categorized subfolder)
          "https://cciservices.online/gallery/marbre/marbre.jpg",
          "https://cciservices.online/gallery/marbre/marbre1.png"
        ],
        
        // 4. Nettoyage post-chantier (post-construction cleaning)
        postChantier: [
          // From /home (no subfolders) - Fixed filename
          "https://cciservices.online/home/nettoyage-professionnel-post-chantier.webp"
        ],
        
        // 5. Tapisserie (upholstery/reupholstering)
        tapisserie: [
          // From /home (no subfolders)
          "https://cciservices.online/home/tapisserie1.webp",
          "https://cciservices.online/home/retapissage-salon-en-cuir.webp",
          "https://cciservices.online/home/retapissage-salon-en-cuir-car-ferry-carthage.webp",
          // From /gallery/tapisserie (categorized subfolder)
          "https://cciservices.online/gallery/tapisserie/tapisserie1.jpg",
          "https://cciservices.online/gallery/tapisserie/tapisserie2.jpg",
          "https://cciservices.online/gallery/tapisserie/tapisserie3.jpg",
          "https://cciservices.online/gallery/tapisserie/tapisserie4.jpg",
          "https://cciservices.online/gallery/tapisserie/tapisserie5.jpg",
          "https://cciservices.online/gallery/tapisserie/tapisserie6.jpg"
        ],
        
        // 6. TFC (bureau cleaning)
        tfc: [
          // From /gallery/tfc (categorized subfolder)
          "https://cciservices.online/gallery/tfc/tfc.webp",
          "https://cciservices.online/gallery/tfc/marbre.jpg"
        ],
        
        // General/showcase images from /home only (no subfolders)
        general: [
          "https://cciservices.online/home/ng.webp",
          "https://cciservices.online/gallery/moquette/moquette-detailing-4.jpeg",
          "https://cciservices.online/home/night.webp",
          "https://cciservices.online/home/1.webp"
        ]
      };

      // Analyze the generated content ONLY (not the prompt) for better matching
      const generatedContentOnly = generatedCaption.toLowerCase();
      const bestMatchService = analyzeContentForImages(generatedContentOnly);
      
      console.log("Content analysis result:", { 
        bestMatchService, 
        contentPreview: generatedContentOnly.substring(0, 100),
        contentLength: generatedContentOnly.length 
      });

      // Select images based on analysis with strict service matching
      let relevantImages = cciImagesByService[bestMatchService] || [];
      
      // If no specific service detected, try to match by post type
      if (relevantImages.length === 0 || bestMatchService === 'general') {
        switch (postType) {
          case 'tip':
            // For tips, prefer the most common services
            relevantImages = [...cciImagesByService.salon, ...cciImagesByService.tapis];
            break;
          case 'service':
            // For service posts, use a mix of main services
            relevantImages = [
              ...cciImagesByService.salon,
              ...cciImagesByService.marbre,
              ...cciImagesByService.tapis
            ];
            break;
          case 'motivation':
            // For motivation, use general showcase images
            relevantImages = [...cciImagesByService.general, ...cciImagesByService.salon];
            break;
          case 'seasonal':
            // For seasonal, use general and main services
            relevantImages = [
              ...cciImagesByService.general,
              ...cciImagesByService.salon,
              ...cciImagesByService.tapis
            ];
            break;
          default:
            relevantImages = cciImagesByService.general;
        }
      }

      // Final fallback to ensure we always have images
      if (relevantImages.length === 0) {
        relevantImages = cciImagesByService.general;
      }

      // Select random image from relevant collection
      selectedImageUrl = relevantImages[Math.floor(Math.random() * relevantImages.length)];
      
      // Validate image accessibility before posting
      if (selectedImageUrl) {
        try {
          console.log("Validating image accessibility:", selectedImageUrl);
          const imageResponse = await fetch(selectedImageUrl, { method: 'HEAD' });
          
          if (!imageResponse.ok) {
            console.warn(`Image not accessible (${imageResponse.status}):`, selectedImageUrl);
            // Try another image from the same collection
            if (relevantImages.length > 1) {
              const filteredImages = relevantImages.filter(img => img !== selectedImageUrl);
              selectedImageUrl = filteredImages[Math.floor(Math.random() * filteredImages.length)];
              console.log("Trying alternative image:", selectedImageUrl);
            } else {
              // Fall back to general images
              const fallbackImages = cciImagesByService.general;
              selectedImageUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
              console.log("Using fallback image:", selectedImageUrl);
            }
          } else {
            console.log("Image validation successful:", selectedImageUrl);
          }
        } catch (validationError) {
          console.warn("Image validation failed:", validationError.message);
          // Use a reliable fallback
          selectedImageUrl = "https://cciservices.online/gallery/moquette/moquette-detailing-4.jpeg";
          console.log("Using safe fallback image:", selectedImageUrl);
        }
      }
      
      console.log("Selected CCI Services image:", {
        service: bestMatchService,
        imageUrl: selectedImageUrl,
        availableImages: relevantImages.length
      });
    }

    // Detect final service from content
    const finalDetectedService = rotationManager.detectServiceFromContent(generatedCaption) || recommendedService;

    // ── Dry run: return generated content without posting ──
    if (dryRun) {
      console.log('👁️ Dry run — skipping Facebook post');
      return NextResponse.json({
        success: true,
        dry_run: true,
        generated_content: generatedCaption,
        selected_image: selectedImageUrl,
        facebook_response: { id: 'DRY_RUN' },
        post_type: postType,
        season: resolvedSeason,
        month: resolvedMonth,
        timestamp: new Date().toISOString(),
        posted_with_image: !!selectedImageUrl,
        content_analysis: {
          recommended_service: recommendedService,
          detected_service: finalDetectedService,
          service_url: rotationManager.getServiceUrl(finalDetectedService),
          has_all_contact_info: generatedCaption.includes('cciservices.online') && 
                                generatedCaption.includes('+216 98 55 77 66') && 
                                generatedCaption.includes('contact@cciservices.online')
        },
        rotation_info: {
          service_used: finalDetectedService,
          can_post_again: rotationManager.canPostService(finalDetectedService),
          next_recommended: rotationManager.getNextRecommendedService(),
          post_recorded: false
        }
      });
    }

    // ── Post to Facebook ──
    let facebookApiUrl;
    let postData;

    if (selectedImageUrl) {
      facebookApiUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/photos`;
      postData = {
        caption: generatedCaption,
        url: selectedImageUrl,
        access_token: FB_PAGE_ACCESS_TOKEN,
      };
    } else {
      facebookApiUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/feed`;
      postData = {
        message: generatedCaption,
        access_token: FB_PAGE_ACCESS_TOKEN,
      };
    }

    console.log("Posting to Facebook...", {
      endpoint: selectedImageUrl ? 'photos' : 'feed',
      hasImage: !!selectedImageUrl,
      imageUrl: selectedImageUrl,
      captionLength: generatedCaption.length
    });

    const facebookResponse = await fetch(facebookApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    const responseText = await facebookResponse.text();
    
    if (!facebookResponse.ok) {
      console.error("Facebook API error:", {
        status: facebookResponse.status,
        response: responseText
      });
      
      let errorMessage = `Facebook API error: ${facebookResponse.status}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // Keep default error message
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: responseText,
          generated_content: generatedCaption,
          selected_image: selectedImageUrl 
        },
        { status: facebookResponse.status }
      );
    }

    const facebookData = JSON.parse(responseText);
    
    console.log("Successfully posted to Facebook:", facebookData);

    // Record the post in rotation history
    rotationManager.recordPost(generatedCaption, finalDetectedService, postType, selectedImageUrl);

    return NextResponse.json({
      success: true,
      generated_content: generatedCaption,
      selected_image: selectedImageUrl,
      facebook_response: facebookData,
      post_type: postType,
      season: resolvedSeason,
      month: resolvedMonth,
      timestamp: new Date().toISOString(),
      posted_with_image: !!selectedImageUrl,
      content_analysis: {
        recommended_service: recommendedService,
        detected_service: finalDetectedService,
        service_url: rotationManager.getServiceUrl(finalDetectedService),
        has_all_contact_info: generatedCaption.includes('cciservices.online') && 
                              generatedCaption.includes('+216 98 55 77 66') && 
                              generatedCaption.includes('contact@cciservices.online')
      },
      rotation_info: {
        service_used: finalDetectedService,
        can_post_again: false,
        next_recommended: rotationManager.getNextRecommendedService(),
        post_recorded: true
      }
    });

  } catch (error) {
    console.error("Auto-post error:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "An unexpected error occurred",
        success: false 
      },
      { status: 500 }
    );
  }
}

// GET method for health check and rotation status
export async function GET() {
  const rotationManager = new PostRotationManager();
  const rotationStatus = rotationManager.getRotationStatus();
  
  return NextResponse.json({
    message: "Gemini AI + Facebook auto-posting API with intelligent rotation",
    required_env_vars: ["FB_PAGE_ID", "FB_PAGE_ACCESS_TOKEN", "GEMINI_API_KEY"],
    env_vars_present: {
      FB_PAGE_ID: !!FB_PAGE_ID,
      FB_PAGE_ACCESS_TOKEN: !!FB_PAGE_ACCESS_TOKEN,
      GEMINI_API_KEY: !!GEMINI_API_KEY,
    },
    available_post_types: ["tip", "motivation", "service", "seasonal"],
    features: {
      ai_content_generation: true,
      intelligent_service_rotation: true,
      service_specific_urls: true,
      automatic_image_selection: true,
      hashtag_integration: true,
      post_history_tracking: true
    },
    rotation_status: rotationStatus,
    service_urls: {
      salon: "https://cciservices.online/salon",
      tapis: "https://cciservices.online/tapis", 
      marbre: "https://cciservices.online/marbre",
      tapisserie: "https://cciservices.online/tapisserie",
      tfc: "https://cciservices.online/tfc"
    },
    api_version: FB_API_VERSION
  });
}