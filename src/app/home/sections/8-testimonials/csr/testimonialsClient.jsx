'use client';

import { useEffect, useState } from 'react';
import styles from '../testimonials.module.css';
import SliderContainer from './sliderContainer';
import { UilArrowRight } from '@/utils/components/icons';
import ButtonContainer from './buttonContainer';
import ResponsiveImage from '@/utils/components/Image/Image';

export default function TestimonialsClient({ className, fallbackTestimonials, backgroundImage }) {
    const [testimonials, setTestimonials] = useState(fallbackTestimonials);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchGoogleReviews() {
            try {
                const response = await fetch('/api/google-reviews');
                const data = await response.json();

                if (data.reviews && data.reviews.length > 0) {
                    // Map Google Reviews to testimonial format
                    const mappedReviews = data.reviews.map((review, index) => ({
                        id: review.time || index,
                        name: review.author_name || 'Client anonyme',
                        role: review.relative_time_description || 'Client vérifié',
                        img: review.profile_photo_url || '/default-avatar.png',
                        testimonial: review.text || '',
                        rating: review.rating || 5,
                        date: new Date(review.time * 1000).toLocaleDateString('fr-FR')
                    }));

                    console.log('✅ Google Reviews loaded:', mappedReviews.length);
                    setTestimonials(mappedReviews);
                } else {
                    console.log('⚠️ No Google Reviews found, using fallback');
                }
            } catch (error) {
                console.error('❌ Error fetching Google reviews:', error);
                // Keep fallback testimonials on error
            } finally {
                setIsLoading(false);
            }
        }

        fetchGoogleReviews();
    }, []);

    const slideAnchor = Math.floor((testimonials.length * 3) / 2);

    if (testimonials.length === 0) {
        return (
            <section className={`${styles.container} ${className || ''}`}>
                <p>Aucun avis pour le moment.</p>
            </section>
        );
    }

    return (
        <section className={`${styles.container} ${className || ''}`}>
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
                                <p className={styles.role}>{element.role}</p>
                                {element.rating && (
                                    <div className={styles.rating}>
                                        {'⭐'.repeat(element.rating)}
                                    </div>
                                )}
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.testimonialWrapper}>
                                <div className={styles.testimonialContent}>
                                    <p className={styles.testimonialText}>{element.testimonial}</p>
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
