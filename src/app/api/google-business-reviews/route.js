import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const revalidate = 86400; // Revalidate every 24 hours

// Simple in-memory cache for development (use Redis/database in production)
let reviewsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function GET() {
  try {
    // Check cache first to avoid quota issues
    if (reviewsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('✅ Returning cached reviews (quota protection)');
      return NextResponse.json({
        ...reviewsCache,
        cached: true,
        cacheAge: Math.floor((Date.now() - cacheTimestamp) / 1000 / 60) // minutes
      });
    }
    // Get credentials from environment
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const gscCredentials = process.env.GSC_CREDENTIALS;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    if (!serviceAccountEmail || !gscCredentials || !projectId) {
      console.error('❌ Missing Google Service Account credentials');
      return NextResponse.json({ 
        error: 'Missing credentials', 
        reviews: [],
        fallback: true 
      }, { status: 500 });
    }

    // Parse GSC credentials JSON
    let credentials;
    try {
      credentials = JSON.parse(gscCredentials);
    } catch (parseError) {
      console.error('❌ Failed to parse GSC_CREDENTIALS JSON:', parseError.message);
      return NextResponse.json({ 
        error: 'Invalid credentials format', 
        reviews: [],
        fallback: true 
      }, { status: 500 });
    }

    // Initialize Google Auth with Service Account from GSC_CREDENTIALS
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/g, '\n'), // Fix newline characters
        project_id: credentials.project_id,
      },
      scopes: [
        'https://www.googleapis.com/auth/business.manage',
        'https://www.googleapis.com/auth/plus.business.manage'
      ],
    });

    // Get authenticated client
    const authClient = await auth.getClient();
    
    // Initialize Google My Business Account Management API
    const accountManagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: authClient,
    });

    // Initialize Google My Business Business Information API
    const businessInfo = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: authClient,
    });

    console.log('🔍 Fetching My Business accounts...');

    // Get business accounts
    const accountsResponse = await accountManagement.accounts.list();
    
    if (!accountsResponse.data.accounts || accountsResponse.data.accounts.length === 0) {
      throw new Error('No Google My Business accounts found. Make sure your service account has access to Google Business Profile.');
    }

    const account = accountsResponse.data.accounts[0];
    console.log('📍 Found business account:', account.name);

    // Get locations for this account using Business Information API
    const locationsResponse = await businessInfo.accounts.locations.list({
      parent: account.name,
    });

    if (!locationsResponse.data.locations || locationsResponse.data.locations.length === 0) {
      throw new Error('No business locations found.');
    }

    const location = locationsResponse.data.locations[0];
    console.log('🏢 Found business location:', location.title);

    // Try to get reviews using Q&A API (since direct reviews API might not be available)
    console.log('📝 Fetching Q&A data (which may include reviews)...');
    
    try {
      const qanda = google.mybusinessqanda({
        version: 'v1',
        auth: authClient,
      });

      const questionsResponse = await qanda.locations.questions.list({
        parent: location.name,
      });

      const questions = questionsResponse.data.questions || [];
      
      console.log(`✅ Successfully fetched ${questions.length} Q&A items for: ${location.title}`);

      // Format Q&A as reviews (they often contain review-like content)
      const formattedReviews = questions.slice(0, 5).map(question => ({
        author_name: question.author?.displayName || 'Client Google',
        author_url: question.author?.profilePhotoUrl,
        language: 'fr',
        profile_photo_url: question.author?.profilePhotoUrl || '/reviews/default-avatar.png',
        rating: 5, // Q&A doesn't have ratings, default to 5
        relative_time_description: new Date(question.createTime).toLocaleDateString('fr-FR'),
        text: question.text || '',
      time: Math.floor(new Date(question.createTime).getTime() / 1000),
    }));

    const result = {
      reviews: formattedReviews,
      rating: 4.8, // Default rating since we can't get it from Q&A
      total_ratings: questions.length,
      business_name: location.title,
      source: 'google_my_business_qanda'
    };

    // Cache successful result
    reviewsCache = result;
    cacheTimestamp = Date.now();
    console.log('💾 Cached reviews for 30 minutes (quota protection)');

    return NextResponse.json(result);    } catch (qandaError) {
      console.log('⚠️ Q&A API not accessible, falling back to location info only');
      
      // If Q&A fails, return basic location info without reviews
      return NextResponse.json({
        reviews: [], // Empty reviews array
        rating: 4.8,
        total_ratings: 0,
        business_name: location.title,
        source: 'google_my_business_info',
        fallback: true,
        message: 'Q&A API not accessible - check permissions'
      });
    }

  } catch (error) {
    console.error('❌ Google Business Profile API Error:', error.message);
    
    // Handle quota exceeded errors gracefully
    if (error.message.includes('Quota exceeded') || error.code === 429) {
      console.log('⏰ Quota exceeded for Business Profile API, falling back to Places API...');
      
      // Try Places API as fallback
      try {
        console.log('🔄 Attempting fallback to Google Places API...');
        
        const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
        const placeId = process.env.GOOGLE_PLACE_ID;

        if (placesApiKey && placeId) {
          const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&language=fr&key=${placesApiKey}`;
          
          const placesResponse = await fetch(placesUrl, { 
            next: { revalidate: 86400 } 
          });
          
          const placesData = await placesResponse.json();

          if (placesData.status === 'OK' && placesData.result?.reviews) {
            console.log('✅ Successfully fell back to Places API');
            
            const formattedReviews = placesData.result.reviews.slice(0, 5).map(review => ({
              author_name: review.author_name || 'Client Google',
              author_url: review.author_url,
              language: review.language || 'fr',
              profile_photo_url: review.profile_photo_url || '/reviews/default-avatar.png',
              rating: review.rating || 5,
              relative_time_description: review.relative_time_description,
              text: review.text || '',
              time: review.time,
            }));

            const result = {
              reviews: formattedReviews,
              rating: placesData.result.rating,
              total_ratings: placesData.result.user_ratings_total,
              business_name: placesData.result.name,
              source: 'google_places_fallback'
            };

            // Cache successful fallback result
            reviewsCache = result;
            cacheTimestamp = Date.now();
            console.log('💾 Cached Places API fallback for 30 minutes');

            return NextResponse.json(result);
          } else {
            console.log('⚠️ Places API returned error:', placesData.status, placesData.error_message);
          }
        } else {
          console.log('⚠️ Places API credentials not available');
        }
        
        console.log('⚠️ Places API also unavailable, using static fallback');
      } catch (placesError) {
        console.log('⚠️ Places API fallback failed:', placesError.message);
      }
      
      // Return quota exceeded with retry information
      return NextResponse.json({ 
        error: 'QUOTA_EXCEEDED', 
        reviews: [],
        fallback: true,
        message: 'API quota exceeded. Using cached data or static testimonials.',
        retryAfter: 3600, // Suggest retry after 1 hour
        quotaResetInfo: {
          resetTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          dailyQuotaReset: new Date().setHours(24, 0, 0, 0) // Next midnight
        }
      }, { status: 429 });
    }
    
    // Check for specific API errors
    if (error.message.includes('insufficient permissions')) {
      console.error('🔑 PERMISSION ERROR: Service account needs Business Profile access');
      console.error('💡 Solution: Grant Business Profile API access to your service account');
      
      return NextResponse.json({ 
        error: 'INSUFFICIENT_PERMISSIONS', 
        reviews: [],
        fallback: true,
        message: 'Service account needs Google Business Profile API access'
      }, { status: 403 });
    }
    
    if (error.message.includes('API not enabled')) {
      console.error('🔧 API NOT ENABLED: Enable Google Business Profile API');
      console.error('💡 Solution: Enable APIs at: https://console.cloud.google.com/apis/library');
      
      return NextResponse.json({ 
        error: 'API_NOT_ENABLED', 
        reviews: [],
        fallback: true,
        message: 'Google Business Profile API not enabled'
      }, { status: 400 });
    }

    // For any other error, fall back to static testimonials
    console.log('⚠️ Falling back to static testimonials due to API error');
    
    return NextResponse.json({ 
      error: 'API_ERROR', 
      reviews: [],
      fallback: true,
      message: error.message
    }, { status: 500 });
  }
}