'use client'
import { useState, useEffect } from 'react';
import styles from './desktopMenu.module.css';
import { EpCloseBold, LineMdPhoneTwotone, SiMailDuotone, UilArrowRight } from '@/utils/components/icons';
import Link from 'next/link';
import contact from '@/app/contact/data.json';
import ResponsiveImage from '@/utils/components/Image/Image';
import {AnalyticsLink } from '@/utils/components/analytics/AnalyticsComponents';
import { useEmailClick } from '@/hooks/useEmailClick';

export default function DesktopMenu({ desktopMenuStyles, handleMenuButton }) {
    const mail = `mailto:${contact.mail.link}?subject=${encodeURIComponent(contact.mail.subject)}&body=${encodeURIComponent(contact.mail.body)}`;
    const phone = 'tel:' + contact.phone;
    
    // Use the email click hook for enhanced mailto handling
    const { handleContactEmail } = useEmailClick();
    const handleEmailClick = handleContactEmail('desktop_menu_email');
    
    // Debug: Log the mailto URL to console
    console.log('Mailto URL:', mail);
    
    // Track checkbox state in React state instead of directly manipulating the DOM
    const [checkboxChecked, setCheckboxChecked] = useState(false);
    // Add client-side flag to prevent hydration mismatch
    const [isClient, setIsClient] = useState(false);
    // Newsletter form state
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState(''); // 'success', 'error', ''

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleCheckboxChange = (e) => {
        setCheckboxChecked(e.target.checked);
    };

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setSubmitMessage('Veuillez saisir votre adresse email.');
            setSubmitStatus('error');
            return;
        }

        if (!checkboxChecked) {
            setSubmitMessage('Vous devez accepter la politique de confidentialité.');
            setSubmitStatus('error');
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage('');
        setSubmitStatus('');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    acceptedPrivacy: checkboxChecked,
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setSubmitMessage('🎉 Inscription réussie ! Vérifiez votre boîte mail.');
                setSubmitStatus('success');
                setEmail('');
                setCheckboxChecked(false);
            } else {
                setSubmitMessage(data.message || 'Erreur lors de l\'inscription.');
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitMessage('Erreur de connexion. Veuillez réessayer.');
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
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
                                <Link href='/services'>Carrière</Link>
                            </div>
                            <div className={styles.socialLinks}>
                                    <a href="https://www.facebook.com/Chaabanes.Cleaning.Intelligence" target="_blank" rel="noopener noreferrer">Facebook</a>
                                    <a href="https://www.instagram.com/cci.services/" target="_blank" rel="noopener noreferrer">Instagram</a>
                                    <a href="https://twitter.com/your-profile" target="_blank" rel="noopener noreferrer">Twitter</a>
                                    <a href="https://www.linkedin.com/company/chaabanes-cleaning-int" target="_blank" rel="noopener noreferrer">Linkedin</a>
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
                                    <Link href='/contact'>Contact</Link>
                                    <Link href='/blogs'>Nouveauté</Link>
                                </div>
                                <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                                    <label>Restez à jour</label>
                                    <input 
                                        type="email"
                                        placeholder='Adresse Email' 
                                        className={styles.emailInput}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                    />
                                    <button 
                                        type="submit"
                                        className={styles.submitButton} 
                                        aria-label="S'abonner à la newsletter"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? '...' : <UilArrowRight className={styles.arrowIcon} />}
                                    </button>
                                    <div className={styles.checkboxContainer}>
                                        <input
                                            type="checkbox"
                                            id="privacy-checkbox"
                                            className={styles.checkbox}
                                            onChange={handleCheckboxChange}
                                            checked={checkboxChecked}
                                            disabled={isSubmitting}
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
                                    {submitMessage && (
                                        <div className={`${styles.submitMessage} ${styles[submitStatus]}`}>
                                            {submitMessage}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                        <div className={styles.contactSection}>
                            {/* link for google map or google search here */}
                            <a href='/' target='_blank' className={styles.locationLink}>
                                <ResponsiveImage src='/contact/location.png' alt='location' skeleton sizes={12.5} className={styles.locationImage} />
                            </a>
                            <AnalyticsLink
                                href={phone}
                                eventName="phone_click"
                                eventCategory="conversion"
                                eventLabel="desktop_menu_phone"
                                className={styles.contactItem}
                            >
                                <LineMdPhoneTwotone className={styles.contactIcon} />
                                <strong>Appelez maintenant</strong>
                                <abbr>+216 98 55 77 66</abbr>
                            </AnalyticsLink>
                            <AnalyticsLink
                                href={mail}
                                eventName="email_click"
                                eventCategory="conversion"
                                eventLabel="desktop_menu_email"
                                className={styles.contactItem}
                                onClick={handleEmailClick}
                            >
                                <SiMailDuotone className={styles.contactIcon} />
                                <strong>E-mail</strong>
                                <abbr>contact@cciservices.online</abbr>
                            </AnalyticsLink>
                            <div className={styles.divider} />
                        </div>
                    </div>
                    <button onClick={handleMenuButton} className={styles.closeButton} aria-label="Fermer le menu">
                        <EpCloseBold className={styles.closeIcon} />
                    </button>
                </div>
            </div>
        </div>
    );
}