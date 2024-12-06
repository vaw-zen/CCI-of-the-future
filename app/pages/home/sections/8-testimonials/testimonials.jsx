import styles from './testimonials.module.css'
import content from './testimonials.json'
import SliderContainer from './csr/sliderContainer'
export default function Testimonials() {
    const slideAncor = Math.floor((content.testimonials.length * 3) / 2)

    return <>
        <section className={styles.container}>
            <img src={content.img} className={styles.mainImage} />
            <SliderContainer className={styles.sliderContainer}>
                <div className={styles.slider}
                    style={{ transform: `translatex(-${slideAncor}00%)` }}>
                    {[...content.testimonials, ...content.testimonials, ...content.testimonials].map((element, index) => (
                        <div key={index} className={styles.slide}>
                            <div className={styles.profileContainer}>
                                <img className={styles.profileImage} src={element.img} />
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
                <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'transparent', cursor:'grab' }}>

                </div>
            </SliderContainer>
        </section>
    </>
}