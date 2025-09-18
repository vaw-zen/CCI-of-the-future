import Link from 'next/link'
import content from './footer.json'
import contact from '../../app/contact/data.json'
import styles from './footer.module.css'

export default function Footer() {
    const mail = `mailto:${contact.mail.link}?subject=${contact.mail.subject}&body=${contact.mail.body}`
    const phone = 'tel:' + content.phone

    return (
        <footer className={styles.footer}>
            <div className={styles.contentWrapper}>
                <div className={styles.leftSection}>
                    <h2 className={styles.title}>
                        Contactez-nous à <br />
                        <a href={mail} className={styles.mailLink}>
                            {contact.mail.link}
                            <div className={styles.underline} />
                        </a>
                    </h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoBlock}>
                            <p className={styles.label}>Notre Numéro</p>
                            <a href={phone} className={styles.value}>{contact.phone}</a>
                        </div>
                        <div className={styles.infoBlock}>
                            <p className={styles.label}>Notre localisation</p>
                      <a
              href="https://www.google.com/maps/dir/36.8432852,10.2488076/Chaabane's+Cleaning+Intelligence,+06+Rue+Galant+De+Nuit%D8%8C+Tunis+2045%E2%80%AD/@36.8379036,10.206256,14z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0xa2d22c796dfcf437:0x7dec63fbbbefa5c2!2m2!1d10.254949!2d36.8527438!5m1!1e2?entry=ttu&g_ep=EgoyMDI1MDkxNS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
            >       <h3 className={styles.value}>               {contact.location}
              
            </h3></a>
             
                        </div>
                    </div>
                </div>

                <ul className={styles.navigation}>
                    {content.pages.map((element, index) => (
                        <li key={index}>
                            <Link href={element.link} className={styles.navLink}>
                                <div className={styles.index}>
                                    <div className={styles.line} />
                                    <span>0{index + 1}</span>
                                </div>
                                <div className={styles.pageName}>{element.name}</div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.bottom}>
                <div className={styles.copyright}>
                    Copyright 2021 <strong className={styles.highlight}>CCI</strong>
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