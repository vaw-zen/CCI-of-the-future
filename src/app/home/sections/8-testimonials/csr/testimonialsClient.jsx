'use client';

import styles from '../testimonials.module.css';
import SliderContainer from './sliderContainer';
import { UilArrowRight } from '@/utils/components/icons';
import ButtonContainer from './buttonContainer';
import ResponsiveImage from '@/utils/components/Image/Image';
import testimonialsData from '../testimonials.json';

export default function TestimonialsClient({ className, backgroundImage }) {
    const testimonials = testimonialsData.testimonials;
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
