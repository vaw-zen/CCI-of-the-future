import Link from 'next/link'
import content from './footer.json'
import styles from './footer.module.css'

export default function Footer() {
    const mail = `mailto:${content.mail.link}?subject=${content.mail.subject}&body=${content.mail.body}`
    const phone = 'tel:' + content.phone
    return (
        <footer className={styles.footer}>
            <div className={styles.contentWrapper}>
                <div className={styles.leftSection}>
                    <h2 className={styles.title}>
                        Contactez-nous à <br />
                        <a href={mail} className={styles.mailLink}>
                            {content.mail.link}
                            <div className={styles.underline} />
                        </a>
                    </h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoBlock}>
                            <p className={styles.label}>Notre Numéro</p>
                            <a href={phone} className={styles.value}>{content.number}</a>
                        </div>
                        <div className={styles.infoBlock}>
                            <p className={styles.label}>Notre localisation</p>
                            <h3 className={styles.value}>{content.location}</h3>
                        </div>
                    </div>
                </div>

                <ul className={styles.navigation}>
                    {content.pages.map((element, index) => (
                        <Link href={element.link} key={index} className={styles.navLink}>
                            <div className={styles.index}>
                                <div className={styles.line} />
                                <span>0{index + 1}</span>
                            </div>
                            <div className={styles.pageName}>{element.name}</div>
                        </Link>
                    ))}
                </ul>
            </div>

            <div className={styles.bottom}>
                <div className={styles.copyright}>
                    Copyright © <strong className={styles.highlight}>CCI</strong>
                    <span className={styles.divider}>|</span>
                    Designed and developed by - <Link href='https://www.vawzen.org/' target='_blank' className={styles.highlight}>Vawzen</Link>
                </div>

                <ul className={styles.socials}>
                    {content.socialMedias.map((element, index) => (
                        <li key={index}>
                            <Link target='_blank' href={element.link}>{element.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    )
}