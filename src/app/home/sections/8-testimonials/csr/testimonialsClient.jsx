'use client';

import { useState, useEffect } from 'react';
import styles from '../testimonials.module.css';
import SliderContainer from './sliderContainer';
import { UilArrowRight } from '@/utils/components/icons';
import ButtonContainer from './buttonContainer';
import ResponsiveImage from '@/utils/components/Image/Image';
import testimonialsData from '../testimonials.json';

export default function TestimonialsClient({ className, fallbackTestimonials, backgroundImage }) {
    const [testimonials, setTestimonials] = useState(testimonialsData.testimonials);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState('static');

    useEffect(() => {
        const fetchGoogleReviews = async () => {
            try {
                console.log('🔍 Attempting to fetch Google Business Profile reviews...');
                
                // Try the new Google Business Profile API first
                const businessResponse = await fetch('/api/google-business-reviews', {
                    next: { revalidate: 86400 }
                });
                
                const businessData = await businessResponse.json();
                
                if (businessData.reviews && businessData.reviews.length > 0 && !businessData.fallback) {
                    console.log('✅ Successfully loaded Google Business Profile reviews');
                    
                    // Format Business Profile reviews to match testimonial structure
                    const formattedBusinessReviews = businessData.reviews.map((review, index) => ({
                        id: `business-${index}`,
                        testimonial: review.text || 'Service exceptionnel et équipe très professionnelle.',
                        img: review.profile_photo_url || '/reviews/default-avatar.png',
                        name: review.author_name || 'Client Google',
                        position: 'Client Google Business',
                        role: 'Client Google Business',
                        rating: review.rating || 5
                    }));
                    
                    setTestimonials(formattedBusinessReviews);
                    setSource('google_business');
                    setLoading(false);
                    return;
                }
                
                // If Business Profile API fails, try Places API as backup
                console.log('⚠️ Business Profile API failed, trying Places API...');
                
                const placesResponse = await fetch('/api/google-reviews', {
                    next: { revalidate: 86400 }
                });
                
                const placesData = await placesResponse.json();
                
                if (placesData.reviews && placesData.reviews.length > 0) {
                    console.log('✅ Successfully loaded Google Places reviews');
                    
                    // Format Places reviews to match testimonial structure
                    const formattedPlacesReviews = placesData.reviews.map((review, index) => ({
                        id: `places-${index}`,
                        testimonial: review.text || 'Service exceptionnel et équipe très professionnelle.',
                        img: review.profile_photo_url || '/reviews/default-avatar.png',
                        name: review.author_name || 'Client Google',
                        position: 'Client Google',
                        role: 'Client Google',
                        rating: review.rating || 5
                    }));
                    
                    setTestimonials(formattedPlacesReviews);
                    setSource('google_places');
                } else {
                    console.log('ℹ️ Using static testimonials (APIs unavailable)');
                    setSource('static');
                }
                
            } catch (error) {
                console.error('❌ Error fetching Google reviews:', error);
                console.log('ℹ️ Using static testimonials as fallback');
                setSource('static');
            } finally {
                setLoading(false);
            }
        };

        fetchGoogleReviews();
    }, []);

    const slideAnchor = Math.floor((testimonials.length * 3) / 2);

    if (loading) {
        return (
            <section className={`${styles.container} ${className || ''}`}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}>🔄</div>
                    <p>Chargement des avis clients...</p>
                </div>
            </section>
        );
    }

    if (testimonials.length === 0) {
        return (
            <section className={`${styles.container} ${className || ''}`}>
                <p>Aucun avis pour le moment.</p>
            </section>
        );
    }

    return (
        <section className={`${styles.container} ${className || ''}`}>
            {/* API Source Badge */}
            {source !== 'static' && (
                <div className={styles.sourceBadge}>
                    {source === 'google_business' && (
                        <span className={styles.googleBusiness}>
                            📍 Google Business Profile
                        </span>
                    )}
                    {source === 'google_places' && (
                        <span className={styles.googlePlaces}>
                            🗺️ Google Places
                        </span>
                    )}
                </div>
            )}
            
            <ResponsiveImage
                sizes={[22, 55, 86]} 
                skeleton 
                src={backgroundImage} 
                className={styles.mainImage} 
                alt='testimonials' 
            />
            <SliderContainer className={styles.sliderContainer}>
                <div
                    className={styles.slider}
                    style={{ transform: `translatex(-${slideAnchor}00%)` }}
                >
                    {[...testimonials, ...testimonials, ...testimonials].map((element, index) => (
                        <div key={`${element.id}-${index}`} className={styles.slide}>
                            <div className={styles.profileContainer}>
                                <ResponsiveImage
                                    skeleton 
                                    sizes={[9, 23, 43]}
                                    className={styles.profileImage} 
                                    src={element.img} 
                                    alt={element.name} 
                                    title={element.name} 
                                />
                                <h3 className={styles.name}>{element.name}</h3>
                                <p className={styles.role}>{element.role || element.position}</p>
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.testimonialWrapper}>
                                <div className={styles.testimonialContent}>
                                    <p className={styles.testimonialText}>{element.testimonial}</p>
                                    {element.rating && (
                                        <div className={styles.testimonialRating}>
                                            {'⭐'.repeat(element.rating)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.controlsOverlay}>
                    <div className={styles.buttonsContainer}>
                        <ButtonContainer className={`${styles.navButton} ${styles.prevButton}`} left={'true'}>
                            <UilArrowRight className={styles.arrowIcon} />
                        </ButtonContainer>

                        <ButtonContainer className={styles.navButton}>
                            <UilArrowRight className={styles.arrowIcon} />
                        </ButtonContainer>
                    </div>
                </div>
            </SliderContainer>
        </section>
    );
}
