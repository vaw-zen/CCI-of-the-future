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
