import ResponsiveImage from '@/utils/components/Image/Image'
import content from './details.json'
import { IconoirArrowUpRight } from '@/utils/components/icons'
import Link from 'next/link'
import styles from './details.module.css'

export default function Details() {
    const { link, title, slug, img } = content
    return (
        <section className={styles.detailsSection}>
            <ResponsiveImage
                skeleton sizes={[32, 43, 95]}
                src={img} alt="service-details"
                className={styles.image}
            />

            <div className={styles.detailsContent}>
                <div className={styles.header}>
                    <strong className={styles.slug}>{slug}</strong>
                    <h2 className={styles.title}>{title}</h2>
                </div>
                <div className={styles.linkContainer}>
                    <Link href={link.url} className={styles.linkWrapper}>
                        <div className={styles.iconWrapper}>
                            <IconoirArrowUpRight className={styles.icon} />
                        </div>
                        <span className={styles.linkText}>
                            {link.text}
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
