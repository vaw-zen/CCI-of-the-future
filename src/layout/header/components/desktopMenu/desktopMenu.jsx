import styles from './desktopMenu.module.css';
import HeroImage from '@/app/home/sections/1-hero/Image';
import { EpCloseBold, LineMdPhoneTwotone, SiMailDuotone, UilArrowRight } from '@/utils/components/icons';
import Image from 'next/image';
import Link from 'next/link';
import contact from '@/app/contact/data.json';

export default function DesktopMenu({ desktopMenuStyles, handleMenuButton }) {
    const mail = `mailto:${contact.mail.link}?subject=${contact.mail.subject}&body=${contact.mail.body}`;
    const phone = 'tel:' + contact.phone;

    const handleCheckboxChange = (e) => {
        e.target.style.background = e.target.checked
            ? `radial-gradient(circle at center, var(--t-primary) 50%, transparent 50%)`
            : 'transparent';
    };

    return (
        <div className={desktopMenuStyles(styles.menu, styles.activeMenu)}>
            <HeroImage
                responsiveWidth
                sizes="150vw"
                src='/home/1-hero/background.jpg'
                alt="menu-background"
                className={styles.backgroundImage}
            />
            <div className={styles.overlay}>
                <div className={styles.content}>
                    <div className={styles.leftSection}>
                        <div className={styles.leftSidebarLabels}>
                            <p>Qui sommes-nous ?</p>
                            <p>Réseaux sociaux</p>
                        </div>
                        <div className={styles.leftLinks}>
                            <div className={styles.linkGroup}>
                                <Link href='/'>À propos de nous</Link>
                                <Link href='/'>Carrière</Link>
                            </div>
                            <div className={styles.socialLinks}>
                                <Link href='/'>Facebook</Link>
                                <Link href='/'>Instagram</Link>
                                <Link href='/'>Twitter</Link>
                                <Link href='/'>Linkedin</Link>
                            </div>
                        </div>
                    </div>
                    <div className={styles.rightSection}>
                        <h2 className={styles.menuTitle}>Menu</h2>
                        <div className={styles.rightContent}>
                            <div className={styles.rightSidebarLabels}>
                                <p>Plus de pages</p>
                                <p>Newsletter</p>
                            </div>
                            <div className={styles.rightLinks}>
                                <div className={styles.pageLinks}>
                                    <Link href='/'>Contact</Link>
                                    <Link href='/'>Nouveauté</Link>
                                </div>
                                <form className={styles.newsletterForm}>
                                    <label>Restez à jour</label>
                                    <input placeholder='Adresse Email' className={styles.emailInput} />
                                    <button className={styles.submitButton}>
                                        <UilArrowRight className={styles.arrowIcon} />
                                    </button>
                                    <div className={styles.checkboxContainer}>
                                        <input
                                            type="checkbox"
                                            id="privacy-checkbox"
                                            className={styles.checkbox}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label htmlFor="privacy-checkbox" className={styles.checkboxLabel}>
                                            J'accepte la politique de confidentialité
                                        </label>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className={styles.contactSection}>
                            {/* link for google map or google search here */}
                            <a href='/' target='_blank' className={styles.locationLink}>
                                <Image src='/contact/location.png' alt='location' width={650} height={382} className={styles.locationImage} />
                            </a>
                            <a href={phone} className={styles.contactItem}>
                                <LineMdPhoneTwotone className={styles.contactIcon} />
                                <strong>Appelez maintenant</strong>
                                <abbr>+216 98 55 77 66</abbr>
                            </a>
                            <a href={mail} className={styles.contactItem}>
                                <SiMailDuotone className={styles.contactIcon} />
                                <strong>E-mail</strong>
                                <abbr>contact@cciservices.online</abbr>
                            </a>
                            <div className={styles.divider} />
                        </div>
                    </div>
                    <button onClick={handleMenuButton} className={styles.closeButton}>
                        <EpCloseBold className={styles.closeIcon} />
                    </button>
                </div>
            </div>
        </div>
    );
}