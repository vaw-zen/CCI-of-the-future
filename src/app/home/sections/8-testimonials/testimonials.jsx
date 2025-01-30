import styles from './testimonials.module.css'
import content from './testimonials.json'
import SliderContainer from './csr/sliderContainer'
import { UilArrowRight } from '@/utils/components/icons'
import ButtonContainer from './csr/buttonContainer'
import ResponsiveImage from '@/utils/components/Image/Image'

export default function Testimonials() {
    const slideAncor = Math.floor((content.testimonials.length * 3) / 2)

    return (
        <section className={styles.container}>
            <ResponsiveImage
                sizes={[22, 55, 86]} skeleton src={content.img} className={styles.mainImage} alt='testimonials' />
            <SliderContainer className={styles.sliderContainer}>
                <div
                    className={styles.slider}
                    style={{ transform: `translatex(-${slideAncor}00%)` }}
                >
                    {[...content.testimonials, ...content.testimonials, ...content.testimonials].map((element, index) => (
                        <div key={index} className={styles.slide}>
                            <div className={styles.profileContainer}>
                                <ResponsiveImage
                                    skeleton sizes={[9, 23, 43]}
                                    className={styles.profileImage} src={element.img} alt={'testimonial' + index} />
                                <h3 className={styles.name}>Mattew Hunt</h3>
                                <p className={styles.role}>plumber</p>
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

                        <ButtonContainer className={styles.navButton} >
                            <UilArrowRight className={styles.arrowIcon} />
                        </ButtonContainer>
                    </div>
                </div>
            </SliderContainer>
        </section>
    )
}