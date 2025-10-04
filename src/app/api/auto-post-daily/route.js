import { NextResponse } from "next/server";
import {GoogleGenerativeAI} from "@google/generative-ai"; 
//  OBLIGATOIRE: Terminer avec UNE de ces actions:
  "🔗 Site: https://cciservices.online"
  "☎️ Tel: +216 98 55 77 66"
  "📧 Email: contact@cciservices.online"
  "💬 Devis gratuit maintenant!"
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

    // Create dynamic prompts based on post type with enhanced CCI-specific instructions
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
- Français naturel Facebook en exactement 200-400 caractères
- 2-5 emojis intégrés naturellement
- Mentionner "CCI Services" explicitement
- OBLIGATOIRE: Terminer avecces actions:
  "🔗 Site: https://cciservices.online"
  "☎️ Tel: +216 98 55 77 66"
  "📧 Email: contact@cciservices.online"
  "💬 Simulateur de Devis gratuit maintenant! : https://cciservices.online/devis"

EXEMPLE:
"💡 Astuce CCI Services : Pour vos tapis, aspirez avant le lavage ! Cela élimine la poussière et facilite le nettoyage en profondeur. Résultat ? Des couleurs éclatantes ! ✨ 💬 Demandez votre devis gratuit !"`,

      motivation: `You are creating a motivational Facebook post for CCI Services, a professional cleaning company in Tunisia.

TOPIC: Inspirational content about the benefits of professional cleaning services:
- Home comfort and elegance
- Health benefits of clean environments
- Time-saving advantages
- Professional quality results
- Peace of mind

TEXT GENERATION RULES:
- Write in natural, engaging French suitable for Facebook audiences
- Keep text between 200-400 characters
- Include 2-5 emojis naturally to humanize tone
- Mention "CCI Services" explicitly at least once
- OBLIGATOIRE: End with ONE of these call-to-actions:
  🔗 "Site: https://cciservices.online"
  ☎️ "Tel: +216 98 55 77 66"
  � "Email: contact@cciservices.online"
  💬 "Devis gratuit maintenant!"

QUALITY REQUIREMENTS:
✅ Motivational and inspiring content
✅ CCI Services brand mentioned
✅ Call-to-action included
✅ Emojis used naturally (2-5 max)
✅ Focus on benefits and quality of life`,

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
- Français naturel Facebook en exactement 200-400 caractères
- 2-5 emojis intégrés naturellement
- Mentionner "CCI Services" explicitement
- Décrire le service avec expertise professionnelle
- OBLIGATOIRE: Terminer avec UNE de ces actions:
  "🔗 Site: https://cciservices.online"
  "☎️ Tel: +216 98 55 77 66"
  "� Email: contact@cciservices.online"
  "💬 Devis gratuit maintenant!"

EXEMPLE:
"✨ CCI Services redonne tout son éclat à vos sols en marbre ! Polissage, brillance et finition parfaite. Faites briller vos espaces comme jamais. 💎 🔗 Visitez notre site : https://cciservices.online"`,

      seasonal: `You are creating a seasonal Facebook post for CCI Services, a professional cleaning company in Tunisia.

TOPIC: Seasonal cleaning advice relevant to current time of year in Tunisia:
- Preparation for seasonal changes
- Seasonal maintenance tips
- Weather-related cleaning needs
- Holiday preparation cleaning

TEXT GENERATION RULES:
- Write in natural, engaging French suitable for Facebook audiences
- Keep text between 200-400 characters
- Include 2-5 emojis naturally to humanize tone
- Mention "CCI Services" explicitly at least once
- Make content timely and relevant to the season
- OBLIGATOIRE: End with ONE of these call-to-actions:
  🔗 "Site: https://cciservices.online"
  ☎️ "Tel: +216 98 55 77 66"
  � "Email: contact@cciservices.online"
  💬 "Devis gratuit maintenant!"

QUALITY REQUIREMENTS:
✅ Seasonal relevance and timing
✅ CCI Services brand mentioned
✅ Call-to-action included
✅ Emojis used naturally (2-5 max)
✅ Practical seasonal advice`
    };

    const selectedPrompt = customPrompt || prompts[postType] || prompts.tip;

    console.log("Generating content with Gemini AI...");
    
    // Generate content with Gemini
    const result = await model.generateContent(selectedPrompt);
    const response = await result.response;
    let generatedCaption = response.text().trim();

    // Add hashtags if requested
    if (includeHashtags) {
      const hashtags = "\n\n#CCIServices #NettoyageProfessionnel #Tunisie #Proprete #CleaningTips #Marbre #Salon #Tapis #Tapisserie";
      generatedCaption += hashtags;
    }

    console.log("Generated caption:", generatedCaption);

    // Select appropriate image based on post type and content with enhanced specificity
    let selectedImageUrl = null;
    
    if (includeImage) {
      const imageCollections = {
        tip: [
          // Carpet cleaning images
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80", // Vacuum cleaning carpet
          "https://images.unsplash.com/photo-1580256508220-e2d5f9777c83?w=800&h=600&fit=crop&q=80", // Clean carpet texture
          "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop&q=80", // Professional carpet cleaning
          // Sofa/furniture cleaning
          "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop&q=80", // Clean modern sofa
          "https://images.unsplash.com/photo-1586139777045-68e1042bcc42?w=800&h=600&fit=crop&q=80", // Clean living room
          // Marble/stone care
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop&q=80", // Marble floor cleaning
          "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop&q=80", // Shiny marble surface
        ],
        motivation: [
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80", // Beautiful clean home
          "https://images.unsplash.com/photo-1586139777045-68e1042bcc42?w=800&h=600&fit=crop&q=80", // Modern clean living space
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600&fit=crop&q=80", // Organized clean space
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop&q=80", // Clean minimal home
          "https://images.unsplash.com/photo-1588854337115-1c67de0c9727?w=800&h=600&fit=crop&q=80", // Happy family in clean home
        ],
        service: [
          // Professional cleaning in action
          "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop&q=80", // Professional cleaning service
          "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop&q=80", // Clean furniture showcase
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop&q=80", // Marble polishing result
          "https://images.unsplash.com/photo-1580256508220-e2d5f9777c83?w=800&h=600&fit=crop&q=80", // Professional upholstery
          // Post-construction cleaning
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&q=80", // Construction cleaning
          "https://images.unsplash.com/photo-1582719471327-0fe3940d31b2?w=800&h=600&fit=crop&q=80", // Clean office space
        ],
        seasonal: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80", // Seasonal home cleaning
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80", // Fresh seasonal clean
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop&q=80", // Seasonal organization
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80", // Seasonal home refresh
        ]
      };

      // CCI Services local images organized by specific service types
      const localImagesByService = {
        // 1. Nettoyage salon (sofa cleaning)
        salon: [
          "https://cciservices.online/home/nettoyagesolonméthodeinjectionextraction.webp", // Sofa cleaning injection-extraction method
        ],
        
        // 2. Nettoyage moquettes/tapis (carpet cleaning)
        tapis: [
          "https://cciservices.online/home/nettoyage%20moquetteaveclaméthodeinjectionextraction.webp", // Carpet cleaning (URL encoded space)
        ],
        
        // 3. Marbre (marble polishing/crystallization)
        marbre: [
          "https://cciservices.online/home/cristallisationsolenmarbre.webp", // Marble floor crystallization
          "https://cciservices.online/home/polishingkitchenmrblecountre.webp", // Kitchen marble counter polishing
        ],
        
        // 4. Nettoyage post-chantier (post-construction cleaning)
        postChantier: [
          "https://cciservices.online/home/nettoyage-professionel-post-chantier.webp", // Professional post-construction cleaning
        ],
        
        // 5. Tapisserie (upholstery/reupholstering)
        tapisserie: [
          "https://cciservices.online/home/retapissage-salon-en-cuir.webp", // Leather sofa reupholstering
          "https://cciservices.online/home/retapissage-salon-en-cuir-car-ferry-carthage.webp", // Professional leather upholstery
          "https://cciservices.online/home/tapisserie1.webp", // General upholstery work
        ],
        
        // General/mixed use
        general: [
          "https://cciservices.online/home/beforeAfter.webp", // Before/after results
          "https://cciservices.online/home/about.png", // About/showcase
          "https://cciservices.online/home/night.webp", // Night scene
        ]
      };

      // Select appropriate local images based on post content and type
      let relevantLocalImages = [];
      const generatedText = (customPrompt || '').toLowerCase();
      
      // Smart image selection based on content keywords
      if (generatedText.includes('salon') || generatedText.includes('canapé') || generatedText.includes('sofa')) {
        relevantLocalImages = localImagesByService.salon;
      } else if (generatedText.includes('tapis') || generatedText.includes('moquette') || generatedText.includes('carpet')) {
        relevantLocalImages = localImagesByService.tapis;
      } else if (generatedText.includes('marbre') || generatedText.includes('marble') || generatedText.includes('polissage')) {
        relevantLocalImages = localImagesByService.marbre;
      } else if (generatedText.includes('chantier') || generatedText.includes('construction') || generatedText.includes('fin de chantier')) {
        relevantLocalImages = localImagesByService.postChantier;
      } else if (generatedText.includes('tapisserie') || generatedText.includes('rembourrage') || generatedText.includes('upholstery')) {
        relevantLocalImages = localImagesByService.tapisserie;
      } else {
        // Default: mix all service images for general posts
        relevantLocalImages = [
          ...localImagesByService.salon,
          ...localImagesByService.tapis,
          ...localImagesByService.marbre,
          ...localImagesByService.postChantier,
          ...localImagesByService.tapisserie,
          ...localImagesByService.general
        ];
      }

      // Use ONLY CCI Services local images (no web images)
      const allImages = relevantLocalImages.length > 0 ? relevantLocalImages : [
        // Fallback to all CCI images if no specific match
        ...localImagesByService.salon,
        ...localImagesByService.tapis,
        ...localImagesByService.marbre,
        ...localImagesByService.postChantier,
        ...localImagesByService.tapisserie,
        ...localImagesByService.general
      ];
      
      // Select random image from CCI Services collection only
      selectedImageUrl = allImages[Math.floor(Math.random() * allImages.length)];
      
      console.log("Selected CCI Services image:", selectedImageUrl);
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
      imageUrl: selectedImageUrl
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
      posted_with_image: !!selectedImageUrl
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