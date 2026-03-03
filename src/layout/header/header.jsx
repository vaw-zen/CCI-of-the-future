'use client'
import { memo, useState } from 'react'
import dynamic from 'next/dynamic'
import styles from './header.module.css'
import content from './header.json'
import Link from 'next/link'
import { useHeaderLogic } from './header.func'
import { ChatIcon, CiCaretDownSm, FaCaretUp, MingcuteMenuFill, UilArrowRight } from '@/utils/components/icons'
import DesktopMenu from './components/desktopMenu/desktopMenu'
import ResponsiveImage from '@/utils/components/Image/Image'

// Lazy load ChatWidget only when needed - saves ~80KB on initial load
const ChatWidget = dynamic(() => import('./components/chatWidget/chatWidget'), {
    ssr: false,
    loading: () => null
})

// Memoized navigation link component
const NavLink = memo(({ link, name, isActive }) => (
    <Link
        href={link}
        className={isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
    >
        {name}
    </Link>
));

// Memoized dropdown button component
const DropdownButton = memo(({ name, onClick, isActive, hasActiveSublink }) => (
    <button
        onClick={onClick}
        className={hasActiveSublink ? `${styles.button} ${styles.activeLink}` : styles.button}
        aria-label="ouvrir-dropdown"
    >
        {name}
        <CiCaretDownSm
            className={isActive ? `${styles.icon} ${styles.activeIcon}` : styles.icon}
        />
    </button>
));

// Memoized dropdown menu component
const DropdownMenu = memo(({ isActive, subLinks, isLinkActive }) => (
    <div className={isActive ? `${styles.dropdown} ${styles.dropdownActive}` : styles.dropdown}>
        <FaCaretUp className={styles.dropdownArrow} />
        {subLinks.map((link, subIndex) => (
            <Link
                key={subIndex}
                href={link.link}
                className={isLinkActive(link.link) ? `${styles.subLink} ${styles.activeLink}` : styles.subLink}
            >
                {link.name}
            </Link>
        ))}
    </div>
));

// Memoized navigation item component
const NavItem = memo(({ element, index, handleDropdownBlur, toggleDropdown, isActive, isLinkActive, hasActiveSublink }) => (
    <li
        key={index}
        className={styles.menuItem}
        onBlur={handleDropdownBlur}
        tabIndex={0}
    >
        {index !== 0 && <div className={styles.dot} />}

        {element.link && (
            <NavLink
                link={element.link}
                name={element.name}
                isActive={isLinkActive(element.link)}
            />
        )}

        {element.subLinks && (
            <>
                <DropdownMenu
                    isActive={isActive(index)}
                    subLinks={element.subLinks}
                    isLinkActive={isLinkActive}
                />

                <DropdownButton
                    name={element.name}
                    onClick={() => toggleDropdown(index)}
                    isActive={isActive(index)}
                    hasActiveSublink={hasActiveSublink(element.subLinks)}
                />
            </>
        )}
    </li>
));

// Main header component
function Header({ roboto }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatLoaded, setChatLoaded] = useState(false);

    const {
        handleDropdownBlur,
        toggleDropdown,
        isActive,
        handleMenuButton,
        handleMenuStyles,
        desktopMenuStyles,
        handleNavBlur,
        scrollToTop,
        hasActiveSublink,
        isLinkActive,
        currentPath,
        menu,
        showTopButton
    } = useHeaderLogic();

    // Load chat widget once when first opened
    const handleChatOpen = () => {
        if (!chatLoaded) {
            setChatLoaded(true);
        }
        setIsChatOpen(true);
    };

    return (
        <>
            <nav
                tabIndex={0}
                onBlur={handleNavBlur}
                className={styles.nav}
                suppressHydrationWarning
            >
                <div className={styles.container}>
                    <Link href="/" className={styles.logo}>
                        <ResponsiveImage skeleton priority sizes={[3, 8, 10]} contain src='/layout/logo.png' alt="cci-logo" title="cci-logo"/>

                        <h2 className={roboto.className}>
                            Chaabane's Cleaning Intelligence
                        </h2>
                    </Link>
                    <button onClick={handleMenuButton} className={styles.menuIcon} aria-label="fermer-menu">
                        <MingcuteMenuFill />
                    </button>
                </div>
                <ul className={handleMenuStyles(styles.menu, styles.activeMenu)} suppressHydrationWarning>
                    {content.map((element, index) => (
                        <NavItem
                            key={index}
                            element={element}
                            index={index}
                            handleDropdownBlur={handleDropdownBlur}
                            toggleDropdown={toggleDropdown}
                            isActive={isActive}
                            isLinkActive={isLinkActive}
                            hasActiveSublink={hasActiveSublink}
                        />
                    ))}
                </ul>
            </nav>

            <div className={styles.stickyBottom}>
                <a href="https://wa.me/21698557766?text=Bonjour%2C%20je%20souhaite%20un%20devis%20gratuit.%20Merci%20!" target="_blank" rel="noopener noreferrer" className={styles.whatsappButton} aria-label="Contacter via WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <button onClick={() => isChatOpen ? setIsChatOpen(false) : handleChatOpen()} className={styles.chatButton} aria-label="Ouvrir le chat d'assistance">
                    <ChatIcon />
                </button>
                <button onClick={scrollToTop} className={`${styles.topButton} ${showTopButton ? styles.active : ''}`} aria-label="Retourner en haut de la page">
                    <UilArrowRight />
                </button>
            </div>

            {/* Chat Widget - Lazy loaded once, then kept mounted for smooth transitions */}
            {chatLoaded && <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}

            <DesktopMenu desktopMenuStyles={desktopMenuStyles} handleMenuButton={handleMenuButton} isMenuOpen={menu} />
        </>
    );
}

export default memo(Header);
