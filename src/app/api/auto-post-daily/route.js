import { NextResponse } from "next/server";
import {GoogleGenerativeAI} from "@google/generative-ai"; 

const FB_API_VERSION = process.env.FB_API_VERSION || 'v23.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
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

    const { customPrompt, postType = "tip", includeHashtags = true, includeImage = true } = requestBody;

    // Enhanced call-to-action system - ALWAYS include ALL contact options
    const generateCallToAction = () => {
      const callToActions = [
        // Primary CTA - rotates between these options
        "💬 Simulateur de Devis gratuit: https://cciservices.online/devis",
        "💬 Demandez votre devis gratuit maintenant!",
        "💬 Devis personnalisé en 24h - gratuit!",
        "💬 Consultation gratuite pour votre projet!"
      ];
      
      // Always include ALL contact information
      const contactInfo = `
🔗 Site: https://cciservices.online
☎️ Tel: +216 98 55 77 66
📧 Email: contact@cciservices.online`;

      // Rotate primary CTA
      const randomCTA = callToActions[Math.floor(Math.random() * callToActions.length)];
      
      return randomCTA + contactInfo;
    };

    // Create dynamic prompts with MANDATORY call-to-action inclusion
    const prompts = {
      tip: `You are creating ONE SINGLE Facebook post for CCI Services, a professional cleaning company in Tunisia.

TOPIC: ONE professional cleaning tip related to one of these services:
- Nettoyage de tapis et moquettes (carpet/rug cleaning)
- Nettoyage de salons/canapés (sofa/furniture cleaning) 
- Ponçage et polissage de marbre (marble polishing/grinding)
- Tapisserie et rembourrage (upholstery and reupholstering)
- Nettoyage fin de chantier (post-construction cleaning)
- Entretien des bureaux (office cleaning)

STRICT RULES:
- Génère UNE SEULE publication (pas d'options multiples)
- Français naturel Facebook en exactement 200-350 caractères pour le contenu principal
- 2-4 emojis intégrés naturellement dans le texte
- Mentionner "CCI Services" explicitement
- Conseil pratique et professionnel
- NE PAS inclure de call-to-action dans le texte (sera ajouté automatiquement)

FORMAT REQUIS:
[Emoji] [Conseil pratique mentionnant CCI Services] [Emoji si pertinent] [Bénéfice/résultat] [Emoji final]

EXEMPLE:
"💡 Astuce CCI Services : Pour vos tapis, aspirez avant le lavage ! Cela élimine la poussière et facilite le nettoyage en profondeur. Résultat ? Des couleurs éclatantes ! ✨"`,

      motivation: `You are creating a motivational Facebook post for CCI Services, a professional cleaning company in Tunisia.

TOPIC: Inspirational content about the benefits of professional cleaning services:
- Home comfort and elegance
- Health benefits of clean environments
- Time-saving advantages
- Professional quality results
- Peace of mind and well-being

STRICT RULES:
- Français naturel Facebook en exactement 200-350 caractères pour le contenu principal
- 2-4 emojis intégrés naturellement
- Mentionner "CCI Services" explicitement
- Ton inspirant et motivant
- Focus sur les bénéfices émotionnels
- NE PAS inclure de call-to-action dans le texte (sera ajouté automatiquement)

FORMAT REQUIS:
[Emoji] [Message inspirant mentionnant CCI Services] [Bénéfice émotionnel] [Emoji final]

EXEMPLE:
"✨ Avec CCI Services, transformez votre maison en véritable havre de paix ! Un environnement propre = bien-être garanti. Offrez-vous le luxe d'un intérieur impeccable 🏡"`,

      service: `You are creating ONE SINGLE service highlight Facebook post for CCI Services, a professional cleaning company in Tunisia.

TASK: Highlight ONE specific CCI Services offering:
- Nettoyage de tapis (deep carpet cleaning with stain removal)
- Nettoyage de salons (sofa cleaning with non-toxic products)
- Ponçage et polissage de marbre (marble restoration, polishing, crystallization)
- Tapisserie (furniture reupholstering, cushion replacement, fabric care)
- Nettoyage fin de chantier (post-construction: floors, walls, windows, bathrooms)
- Entretien des bureaux (office cleaning and maintenance)

STRICT RULES:
- Génère UNE SEULE publication (pas d'options multiples)
- Français naturel Facebook en exactement 200-350 caractères pour le contenu principal
- 2-4 emojis intégrés naturellement
- Mentionner "CCI Services" explicitement
- Décrire le service avec expertise professionnelle
- Mettre en avant les résultats et la qualité
- NE PAS inclure de call-to-action dans le texte (sera ajouté automatiquement)

FORMAT REQUIS:
[Emoji service] [Service CCI explicite] [Technique/méthode] [Résultat/bénéfice] [Emoji résultat]

EXEMPLE:
"🧽 CCI Services redonne tout son éclat à vos sols en marbre ! Polissage professionnel et cristallisation pour une brillance durable. Faites briller vos espaces comme jamais 💎"`,

      seasonal: `You are creating a seasonal Facebook post for CCI Services, a professional cleaning company in Tunisia.

TOPIC: Seasonal cleaning advice relevant to current time of year in Tunisia:
- Preparation for seasonal changes
- Seasonal maintenance tips
- Weather-related cleaning needs
- Holiday preparation cleaning

STRICT RULES:
- Français naturel Facebook en exactement 200-350 caractères pour le contenu principal
- 2-4 emojis intégrés naturellement
- Mentionner "CCI Services" explicitement
- Content timely and relevant to the season
- Conseil saisonnier pratique
- NE PAS inclure de call-to-action dans le texte (sera ajouté automatiquement)

FORMAT REQUIS:
[Emoji saison] [Conseil saisonnier CCI Services] [Bénéfice] [Emoji final]

EXEMPLE:
"🍂 Automne avec CCI Services : c'est le moment idéal pour un grand nettoyage ! Tapis, canapés, marbre... Préparez votre intérieur pour les mois d'hiver ❄️"` 
    };

    const selectedPrompt = customPrompt || prompts[postType] || prompts.tip;

    console.log("Generating content with Gemini AI...");
    
    // Generate content with Gemini
    const result = await model.generateContent(selectedPrompt);
    const response = await result.response;
    let generatedCaption = response.text().trim();

    // ALWAYS add comprehensive call-to-action (this ensures ALL posts have complete contact info)
    const callToAction = generateCallToAction();
    generatedCaption += "\n\n" + callToAction;

    // Add hashtags if requested
    if (includeHashtags) {
      const hashtags = "\n\n#CCIServices #NettoyageProfessionnel #Tunisie #CleaningTips #Marbre #Salon #Tapis #Tapisserie #NettoayageTunisie #ServicesNettoyage";
      generatedCaption += hashtags;
    }

    console.log("Generated caption:", generatedCaption);

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
          // From /home (no subfolders)
          "https://cciservices.online/home/nettoyage-professionel-post-chantier.webp"
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
          "https://cciservices.online/home/marblepolishing.webp",
          "https://cciservices.online/home/interior-cleaning-detailing.png",
          "https://cciservices.online/home/night.webp",
          "https://cciservices.online/home/1.webp"
        ]
      };

      // Advanced content analysis for precise image matching
      const analyzeContentForImages = (text) => {
        const content = text.toLowerCase();
        const keywords = {
          salon: ['salon', 'canapé', 'sofa', 'fauteuil', 'meubles', 'furniture', 'injection', 'extraction'],
          tapis: ['tapis', 'moquette', 'carpet', 'rug', 'sol textile', 'aspirateur'],
          marbre: ['marbre', 'marble', 'polissage', 'brillance', 'cristallisation', 'pierre', 'granit'],
          postChantier: ['chantier', 'construction', 'post-construction', 'fin de chantier', 'rénovation'],
          tapisserie: ['tapisserie', 'rembourrage', 'upholstery', 'tissu', 'recouvrement', 'restauration'],
          tfc: ['bureau', 'office', 'commercial', 'entreprise', 'tfc', 'professionnel']
        };

        let matchedServices = [];
        
        // Count keyword matches for each service
        for (const [service, serviceKeywords] of Object.entries(keywords)) {
          const matches = serviceKeywords.filter(keyword => content.includes(keyword)).length;
          if (matches > 0) {
            matchedServices.push({ service, score: matches });
          }
        }

        // Sort by highest score
        matchedServices.sort((a, b) => b.score - a.score);
        
        return matchedServices.length > 0 ? matchedServices[0].service : 'general';
      };

      // Analyze the full generated content (including custom prompts)
      const fullContent = (selectedPrompt + ' ' + generatedCaption).toLowerCase();
      const bestMatchService = analyzeContentForImages(fullContent);
      
      console.log("Content analysis result:", { bestMatchService, contentLength: fullContent.length });

      // Select images based on analysis
      let relevantImages = cciImagesByService[bestMatchService] || [];
      
      // If no specific match, use a smart fallback
      if (relevantImages.length === 0) {
        // Use all available images for variety
        relevantImages = [
          ...cciImagesByService.salon,
          ...cciImagesByService.tapis,
          ...cciImagesByService.marbre,
          ...cciImagesByService.postChantier,
          ...cciImagesByService.tapisserie,
          ...cciImagesByService.tfc,
          ...cciImagesByService.general
        ];
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
          selectedImageUrl = "https://cciservices.online/home/interior-cleaning-detailing.png";
          console.log("Using safe fallback image:", selectedImageUrl);
        }
      }
      
      console.log("Selected CCI Services image:", {
        service: bestMatchService,
        imageUrl: selectedImageUrl,
        availableImages: relevantImages.length
      });
    }

    // Determine Facebook API endpoint based on whether we have an image
    let facebookApiUrl;
    let postData;

    if (selectedImageUrl) {
      // Post with image - use photos endpoint
      facebookApiUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/photos`;
      postData = {
        caption: generatedCaption,
        url: selectedImageUrl,
        access_token: FB_PAGE_ACCESS_TOKEN,
      };
    } else {
      // Text-only post - use feed endpoint
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

    // Post to Facebook
    const facebookResponse = await fetch(facebookApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    return NextResponse.json({
      success: true,
      generated_content: generatedCaption,
      selected_image: selectedImageUrl,
      facebook_response: facebookData,
      post_type: postType,
      timestamp: new Date().toISOString(),
      posted_with_image: !!selectedImageUrl,
      content_analysis: {
        detected_service: analyzeContentForImages((selectedPrompt + ' ' + generatedCaption).toLowerCase()),
        has_all_contact_info: generatedCaption.includes('cciservices.online') && 
                              generatedCaption.includes('+216 98 55 77 66') && 
                              generatedCaption.includes('contact@cciservices.online')
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

// GET method for health check and manual testing
export async function GET() {
  return NextResponse.json({
    message: "Gemini AI + Facebook auto-posting API is ready",
    required_env_vars: ["FB_PAGE_ID", "FB_PAGE_ACCESS_TOKEN", "GEMINI_API_KEY"],
    env_vars_present: {
      FB_PAGE_ID: !!FB_PAGE_ID,
      FB_PAGE_ACCESS_TOKEN: !!FB_PAGE_ACCESS_TOKEN,
      GEMINI_API_KEY: !!GEMINI_API_KEY,
    },
    available_post_types: ["tip", "motivation", "service", "seasonal"],
    features: {
      ai_content_generation: true,
      automatic_image_selection: true,
      local_and_stock_images: true,
      hashtag_integration: true
    },
    api_version: FB_API_VERSION
  });
}