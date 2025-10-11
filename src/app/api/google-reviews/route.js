import { NextResponse } from 'next/server';

export const revalidate = 86400; // Revalidate every 24 hours

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    console.error('❌ Missing API credentials');
    return NextResponse.json({ 
      error: 'Missing credentials', 
      reviews: [] 
    }, { status: 500 });
  }

  try {
    // Using Legacy Places API endpoint
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&language=fr&key=${apiKey}`;
    
    console.log('🔍 Fetching Google reviews using Legacy Places API...');
    
    const response = await fetch(url, { 
      next: { revalidate: 86400 } 
    });
    
    const data = await response.json();

    // Handle REQUEST_DENIED - API key restrictions or billing issue
    if (data.status === 'REQUEST_DENIED') {
      console.error('⚠️ API Request Denied:', data.error_message);
      
      // Check if it's a billing issue
      if (data.error_message?.includes('Billing')) {
        console.error('💳 BILLING NOT ENABLED - You must enable billing on Google Cloud:');
        console.error('   → https://console.cloud.google.com/billing/enable');
        console.error('   → Google Places API requires an active billing account (free tier available)');
        return NextResponse.json({ 
          error: 'BILLING_NOT_ENABLED', 
          reviews: [],
          message: 'You must enable billing on Google Cloud Project. Visit: https://console.cloud.google.com/billing/enable'
        }, { status: 403 });
      }
      
      // API key restriction issue
      console.error('💡 Solution: Remove API key restrictions at: https://console.cloud.google.com/apis/credentials');
      return NextResponse.json({ 
        error: 'API_RESTRICTED', 
        reviews: [],
        message: 'API key has restrictions. Please check Google Cloud Console.'
      }, { status: 403 });
    }

    // Handle other API errors
    if (data.status !== 'OK') {
      console.error('❌ API Error:', data.status, data.error_message);
      return NextResponse.json({ 
        error: data.status, 
        reviews: [],
        message: data.error_message || 'API request failed'
      }, { status: 400 });
    }

    // Success - return the reviews
    const reviews = data.result?.reviews || [];
    console.log(`✅ Successfully fetched ${reviews.length} reviews for: ${data.result?.name}`);
    console.log(`⭐ Rating: ${data.result?.rating}/5 (${data.result?.user_ratings_total} total ratings)`);

    return NextResponse.json({
      reviews: reviews.slice(0, 5),
      rating: data.result?.rating,
      total_ratings: data.result?.user_ratings_total,
      business_name: data.result?.name
    });

  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
    return NextResponse.json({ 
      error: 'FETCH_FAILED', 
      reviews: [],
      message: error.message
    }, { status: 500 });
  }
}
