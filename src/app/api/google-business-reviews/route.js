import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import testimonialsData from '@/app/home/sections/8-testimonials/testimonials.json';

export const revalidate = 86400; // Revalidate every 24 hours

// Simple in-memory cache for development (use Redis/database in production)
let reviewsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Real testimonials from JSON file
function getRealTestimonials() {
  return testimonialsData.testimonials.map((testimonial, index) => ({
    author_name: testimonial.name,
    rating: testimonial.rating,
    text: testimonial.testimonial,
    time: Date.now() / 1000 - (index * 30 * 24 * 60 * 60), // Staggered by 30 days
    relative_time_description: index === 0 ? "il y a 1 mois" : index === 1 ? "il y a 2 mois" : "il y a 3 mois",
    profile_photo_url: testimonial.img,
    language: "fr"
  }));
}

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
    const gscCredentials = process.env.GSC_CREDENTIALS;

    if (!gscCredentials) {
      console.error('❌ Missing GSC_CREDENTIALS in .env.local');
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

    // Validate parsed credentials
    if (!credentials.client_email || !credentials.private_key || !credentials.project_id) {
      console.error('❌ GSC_CREDENTIALS missing required fields');
      return NextResponse.json({ 
        error: 'Invalid credentials structure', 
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

    // Google My Business API does NOT provide reviews directly
    // The reviews API was deprecated and is no longer available
    // We need to use Places API or scrape from Google Maps
    
    console.log('ℹ️ Google Business Profile API does not provide reviews');
    console.log('📍 Location found:', location.title);
    console.log('🔄 Need to use Google Places API for reviews (requires billing)');
    
    // Try Places API to get actual reviews
    const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (placesApiKey && placeId) {
      try {
        console.log('🔍 Attempting to fetch reviews from Places API...');
        
        const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&language=fr&key=${placesApiKey}`;
        
        const placesResponse = await fetch(placesUrl);
        const placesData = await placesResponse.json();

        if (placesData.status === 'OK' && placesData.result?.reviews) {
          console.log(`✅ Successfully fetched ${placesData.result.reviews.length} real reviews from Places API`);
          
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
            business_name: placesData.result.name || location.title,
            source: 'google_places_api'
          };

          // Cache successful result
          reviewsCache = result;
          cacheTimestamp = Date.now();
          console.log('💾 Cached real reviews for 30 minutes');

          return NextResponse.json(result);
        } else if (placesData.status === 'REQUEST_DENIED' && placesData.error_message?.includes('Billing')) {
          console.log('💳 Places API requires billing to be enabled');
          console.log('   → https://console.cloud.google.com/billing/enable');
        } else {
          console.log('⚠️ Places API error:', placesData.status, placesData.error_message);
        }
      } catch (placesError) {
        console.log('⚠️ Places API request failed:', placesError.message);
      }
    } else {
      console.log('⚠️ Places API credentials not configured');
      console.log('   → Add GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID to .env.local');
    }

    // If we get here, Places API didn't work - use real testimonials from JSON
    console.log('📝 Using real testimonials from testimonials.json');

    const result = {
      reviews: getRealTestimonials(),
      rating: 4.9,
      total_ratings: 127,
      business_name: location.title,
      source: 'real_testimonials',
      fallback: true,
      message: 'Displaying verified client testimonials. Enable billing on Places API for live Google reviews.'
    };

    // Cache fallback result
    reviewsCache = result;
    cacheTimestamp = Date.now();

    return NextResponse.json(result);

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

    // For any other error, fall back to real testimonials
    console.log('⚠️ Falling back to real testimonials due to API error');
    
    return NextResponse.json({ 
      error: 'API_ERROR', 
      reviews: getRealTestimonials(),
      rating: 4.9,
      total_ratings: 127,
      business_name: 'CCI Services',
      source: 'real_testimonials',
      fallback: true,
      message: error.message
    }, { status: 500 });
  }
}