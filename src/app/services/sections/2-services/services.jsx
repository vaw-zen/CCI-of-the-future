import AnimatedText from '@/utils/components/splitText/animatedText'
import content from './services.json'
import AnimatedLink from '@/utils/components/animatedLink/animatedLink'
import ServiceLinkLayout from './CSR/ServiceLinkLayout'
import styles from './services.module.css'
import ResponsiveImage from '@/utils/components/Image/Image'
import { CiArrowUpRightMd } from '@/utils/components/icons'

export default function Services({ className = '' }) {
  return (
    <section className={`${styles.section} ${className}`}>
      <div className={styles.container}>
        <div className={styles.topContent}>
          <div className={styles.headerContainer}>
            <strong className={styles.slug}>
              <AnimatedText selector={styles.slug} text={content.section.slug} />
            </strong>
            <h2 className={styles.title}>
              <AnimatedText selector={styles.title} styles={{ fontWeight: 'bolder' }} text={content.section.title} parse={[15, 15, 100]} />
            </h2>
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.description}>
              <AnimatedText selector={styles.description} text={content.section.desc} parse={[60, 40, 40]} delay={0.25} />
            </div>
            <div className={styles.viewAllButton}>
              <AnimatedLink observer href="/services">
                View <br /> All Services
              </AnimatedLink>
            </div>
          </div>
        </div>

        <div className={styles.servicesContent}>
          <div className={styles.imagesContainer}>
            <div className={styles.serviceImages}>
              {content.services.map((service, index) => (
                <ResponsiveImage
                  key={index}
                  src={service.img}
                  skeleton='dark'
                  size={25}
                  alt={'service' + (index + 1)}
                  className={styles.serviceImage}
                />
              ))}
            </div>
            <div className={styles.decorativeElements}>
              {content.services.map((_, index) => (
                <span
                  key={index}
                  className={styles.decorativeElement}
                />
              ))}
            </div>
          </div>
          <div className={styles.servicesList}>
            {content.services.map((service, index) => (
              <ServiceLinkLayout
                href={service.link}
                key={index}
                index={index}
                className={`${styles.serviceItem} ${index === 0 ? styles.firstServiceItem : ''}`}
              >
                <abbr className={styles.serviceNumber}>0{index + 1}</abbr>
                <abbr className={styles.serviceTitle}>
                  {service.title.map((element, index) => (
                    <span key={index} className={styles.serviceTitleLine}>{element}</span>
                  ))}
                </abbr>
                <p className={styles.serviceDescription}>{service.desc}</p>
                <div className={styles.serviceIcon}>
                  <CiArrowUpRightMd className={styles.icon} />
                  <CiArrowUpRightMd className={styles.icon} />
                </div>
              </ServiceLinkLayout>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}