import ResponsiveImage from '@/utils/components/Image/Image'
import content from './FAQ.json'
import styles from './FAQ.module.css'
import FAQQuestions from './CSR/FAQClient'

export default function FAQ() {
  const { img, title, slug, QA } = content
  
  return (
    <section className={styles.faqSection}>
      <div className={styles.faqContent}>
        <abbr className={styles.slug}>{slug}</abbr>
        <strong className={styles.title}>{title}</strong>
        <FAQQuestions QA={QA} />
      </div>

      <ResponsiveImage
        className={styles.image}
        src={img}
        sizes={[40, 100, 100]}
        alt='FAQ'
        skeleton
        priority
      />
    </section>
  )
}