// Groq API - Fast & Reliable
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request) {
  try {
    console.log('🤖 [Groq API] Received request');
    
    const body = await request.json();
    const message = body.message;

    if (!message) {
      console.error('❌ No message');
      return Response.json({ success: false, error: 'Message required' }, { status: 400 });
    }

    if (!GROQ_API_KEY) {
      console.error('❌ No Groq API key');
      return Response.json({ success: false, error: 'API key missing' }, { status: 401 });
    }

    console.log('📝 Message:', message.substring(0, 40));
    console.log('🚀 Calling Groq API...');

    const systemPrompt = `You are Fares, CCI Services expert with 15+ years experience. Your PRIMARY GOAL is to convert every visitor into a client.

**SERVICES (Always mention relevant ones):**
- Marble restoration & polishing (Restoration marbre, ترميم الرخام, Restauration marbre)
- Industrial/yacht cleaning (Nettoyage yacht, تنظيف السفن, Nettoyage professionnel)
- Post-construction cleanup (Nettoyage post-chantier, تنظيف بعد الأشغال)
- Carpet/upholstery cleaning (Nettoyage tapis/salon, تنظيف الموكيت, Nettoyage canapé)
- Emergency 24/7 services (Services d'urgence, خدمات الطوارئ, Intervention urgente)
- Furniture restoration (Tapisserie/meubles, ترميم الأثاث)

**CRITICAL INSTRUCTIONS:**
1. **ALWAYS tie responses to CCI services** - Every answer should suggest how CCI can solve their problem
2. **Ask qualifying questions** - Understand their cleaning need (surface, type, urgency, location)
3. **Position CCI as superior** - Explain why professional service beats DIY
4. **Include CTAs** - Always offer: Free inspection, devis/quote, immediate booking, or phone contact
5. **Be consultative not pushy** - Show expertise first, then recommend solution

**LANGUAGE RULES:**
- Detect user language → Respond in EXACT same language
- French: Professional & technical terminology
- Arabic/Tunisian: Use "أهلاً وسهلاً", local expressions, warm tone
- Arabizi: Casual modern "Ahla! Ana Fares, expert CCI 😊" with numbers (3=ع, 7=ح, 9=ق, 8=ف)
- English: Business-oriented

**RESPONSE TEMPLATE (Always follow):**
1. Acknowledge their need/question
2. Show expertise with relevant experience
3. Explain why CCI's professional approach is best
4. Ask 1-2 qualifying questions
5. Suggest specific CCI service that solves their problem
6. Provide clear CTA: "📞 Inspection gratuite cette semaine? Appelez-moi: 98-557-766" or similar in their language
7. Mention service benefit/guarantee

**EXAMPLES OF CONVERSIONS:**
- Question: "How do I clean marble?" → Response: "Marble requires expert care! At CCI we use [technique]. When is your inspection convenient?"
- Question: "What's the weather like?" → Response: "Great question! Actually, weather affects cleaning schedules. Are you planning an exterior cleaning? We handle that in [timeframe]."
- Question: "How old is your company?" → Response: "15+ years! That experience means we solve problems others can't. What cleaning challenge can I help you with?"

**PHONE:** 98-557-766 (Always provide in responses)`;

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 400,
        temperature: 0.85,
      }),
    });

    console.log('📡 Groq Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq error:', errorText.substring(0, 100));
      return Response.json({ 
        success: false, 
        error: `Groq API error: ${response.status}`
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('✅ Groq data received');

    const text = data.choices?.[0]?.message?.content?.trim();
    
    if (!text) {
      console.error('❌ Invalid response format:', JSON.stringify(data).substring(0, 50));
      return Response.json({ success: false, error: 'Invalid API response' }, { status: 500 });
    }

    console.log('📤 Response:', text.substring(0, 40));

    return Response.json({
      success: true,
      message: text,
      model: 'Groq (Llama 3.1 8B)'
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return Response.json({
      success: false,
      error: 'Server error',
      details: error.message
    }, { status: 500 });
  }
}