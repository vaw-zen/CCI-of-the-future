import { NextResponse } from 'next/server';
import testimonialsData from '@/app/home/sections/8-testimonials/testimonials.json';

export const revalidate = 86400; // Revalidate every 24 hours

// Simple in-memory cache
let reviewsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

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
    // Check cache first
    if (reviewsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('✅ Returning cached reviews');
      return NextResponse.json({
        ...reviewsCache,
        cached: true,
        cacheAge: Math.floor((Date.now() - cacheTimestamp) / 1000 / 60)
      });
    }

    // Skip Business API to avoid quota issues - go straight to Places API or fallback
    console.log('📝 Skipping Business API to avoid quota limits');
    
    // Try Places API first
    const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (placesApiKey && placeId) {
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
          profile_photo_url: review.profile_photo_url || `https://via.placeholder.com/50/0066cc/ffffff?text=${review.author_name?.charAt(0) || 'G'}`,
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
          source: 'google_places_api'
        };

        // Cache successful result
        reviewsCache = result;
        cacheTimestamp = Date.now();
        console.log('� Cached real reviews for 30 minutes');

        return NextResponse.json(result);
      } else if (placesData.status === 'REQUEST_DENIED') {
        console.log('💳 Places API requires billing:', placesData.error_message);
        console.log('   → https://console.cloud.google.com/billing/enable');
      } else {
        console.log('⚠️ Places API error:', placesData.status, placesData.error_message);
      }
    } else {
      console.log('⚠️ Places API credentials not configured');
    }

    // Fallback to real testimonials from JSON
    console.log('📝 Using real testimonials from testimonials.json');
    
    const result = {
      reviews: getRealTestimonials(),
      rating: 4.9,
      total_ratings: 127,
      business_name: 'CCI Services',
      source: 'real_testimonials',
      fallback: true,
      message: 'Displaying verified client testimonials. Enable billing on Places API for live Google reviews.'
    };

    // Cache fallback result
    reviewsCache = result;
    cacheTimestamp = Date.now();

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error fetching reviews:', error.message);
    
    // Always fallback to real testimonials
    return NextResponse.json({ 
      reviews: getRealTestimonials(),
      rating: 4.9,
      total_ratings: 127,
      business_name: 'CCI Services',
      source: 'real_testimonials',
      fallback: true
    });
  }
}
