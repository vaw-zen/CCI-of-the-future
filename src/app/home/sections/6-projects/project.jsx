import content from './projects.json'
import pageStyles from '../../home.module.css'
import styles from './project.module.css'
import { MdiArrowTopRightThin } from '@/utils/components/icons'
import Link from 'next/link'
import ResponsiveImage from '@/utils/components/Image/Image'

export default function Project() {
    const [firstArticle] = content.articles

    return (
        <section className={styles.projects}>
            <div className={styles.mainColumn}>
                <h2 className={pageStyles.slug}>{content.slug}</h2>
                <h3 className={pageStyles.highlight}>{content.highlight}</h3>
                <div className={styles.imageContainer}>
                    <ResponsiveImage
                        sizes={[40, 47.5, 93]} skeleton className={styles.image} src={firstArticle.img} alt='project 1' />
                    <div className={styles.overlay}>
                        <div className={styles.contentWrapper}>
                            <Link href={firstArticle.link} className={styles.title}>{firstArticle.title}</Link>
                            <p className={styles.tags}>
                                {firstArticle.tags.map((tag, index) => (
                                    <Link href={tag.link} key={index}>{tag.name},</Link>
                                ))}
                            </p>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <button className={styles.button} aria-label="voir-projet">
                                <MdiArrowTopRightThin className={styles.icon} />
                            </button>
                        </div>
                    </div>
                </div>
                <button className={styles.showProjects}>
                    <div className={styles.spinContainer}>
                        {Array.from({ length: 15 }, (ç, index) => (
                            <div
                                key={index}
                                className={styles.line}
                                style={{ transform: `translate(-50%, -50%) rotate(${15 * index}deg)` }}
                            />
                        ))}
                    </div>
                    <div className={styles.innerButton}>
                        <h2 className={styles.text}>voir tout les projets</h2>
                    </div>
                </button>
            </div>
            <div className={styles.articleGrid}>
                {content.articles.map((article, i) => !i ? null : (
                    <div className={styles.articleContainer} key={i}>
                        <ResponsiveImage
                            alt={'project ' + (i + 1)} skeleton
                            sizes={[27, 47.5, 93]} className={styles.articleImage} src={article.img} />
                        <div className={styles.overlay}>
                            <div className={styles.contentWrapper}>
                                <Link href={article.link} className={styles.title}>{article.title}</Link>
                                <p className={styles.tags}>
                                    {article.tags.map((tag, index) => (
                                        <Link href={tag.link} key={index}>{tag.name},</Link>
                                    ))}
                                </p>
                            </div>
                            <div className={styles.buttonWrapper}>
                                <button className={styles.button} aria-label="voir-projet" >
                                    <MdiArrowTopRightThin className={styles.icon} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </section>
    )
}