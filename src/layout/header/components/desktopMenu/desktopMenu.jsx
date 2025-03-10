'use client'
import { useState, useEffect } from 'react';
import styles from './desktopMenu.module.css';
import { EpCloseBold, LineMdPhoneTwotone, SiMailDuotone, UilArrowRight } from '@/utils/components/icons';
import Link from 'next/link';
import contact from '@/app/contact/data.json';
import ResponsiveImage from '@/utils/components/Image/Image';

export default function DesktopMenu({ desktopMenuStyles, handleMenuButton }) {
    const mail = `mailto:${contact.mail.link}?subject=${contact.mail.subject}&body=${contact.mail.body}`;
    const phone = 'tel:' + contact.phone;
    
    // Track checkbox state in React state instead of directly manipulating the DOM
    const [checkboxChecked, setCheckboxChecked] = useState(false);
    // Add client-side flag to prevent hydration mismatch
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleCheckboxChange = (e) => {
        setCheckboxChecked(e.target.checked);
    };

    return (
        <div className={desktopMenuStyles(styles.menu, styles.activeMenu)}>
            <ResponsiveImage sizes={[100]} quality={100} src='/home/1-hero/background.jpg' alt="Background" className={styles.backgroundImage} skeleton />
            <div className={styles.overlay}>
                <div className={styles.content}>
                    <div className={styles.leftSection}>
                        <div className={styles.leftSidebarLabels}>
                            <p>Qui sommes-nous ?</p>
                            <p>Réseaux sociaux</p>
                        </div>
                        <div className={styles.leftLinks}>
                            <div className={styles.linkGroup}>
                                <Link href='/about'>À propos de nous</Link>
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
                                            checked={checkboxChecked}
                                            style={isClient ? {
                                                background: checkboxChecked 
                                                    ? `radial-gradient(circle at center, var(--t-primary) 50%, transparent 50%)`
                                                    : 'transparent'
                                            } : {}}
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
                                <ResponsiveImage src='/contact/location.png' alt='location' skeleton sizes={12.5} className={styles.locationImage} />
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