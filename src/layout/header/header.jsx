'use client'
import { memo } from 'react'
import styles from './header.module.css'
import content from './header.json'
import Link from 'next/link'
import { useHeaderLogic } from './header.func'
import { CiCaretDownSm, FaCaretUp, MingcuteMenuFill, UilArrowRight } from '@/utils/components/icons'
import DesktopMenu from './components/desktopMenu/desktopMenu'
import ResponsiveImage from '@/utils/components/Image/Image'

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
const DropdownMenu = memo(({ isActive, subLinks, currentPath }) => (
    <div className={isActive ? `${styles.dropdown} ${styles.dropdownActive}` : styles.dropdown}>
        <FaCaretUp className={styles.dropdownArrow} />
        {subLinks.map((link, subIndex) => (
            <Link
                key={subIndex}
                href={link.link}
                className={currentPath === link.link ? `${styles.subLink} ${styles.activeLink}` : styles.subLink}
            >
                {link.name}
            </Link>
        ))}
    </div>
));

// Memoized navigation item component
const NavItem = memo(({ element, index, handleDropdownBlur, toggleDropdown, isActive, currentPath, hasActiveSublink }) => (
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
                isActive={currentPath === element.link} 
            />
        )}
        
        {element.subLinks && (
            <>
                <DropdownMenu 
                    isActive={isActive(index)} 
                    subLinks={element.subLinks} 
                    currentPath={currentPath} 
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
        currentPath
    } = useHeaderLogic();

    return (
        <>
            <nav
                tabIndex={0}
                onBlur={handleNavBlur}
                className={styles.nav}
                suppressHydrationWarning
            >
                <div className={styles.container}>
                    <div className={styles.logo}>
                        <ResponsiveImage skeleton priority sizes={[3, 8, 10]} contain src='/layout/logo.png' alt="cci-logo" />

                        <h2 className={roboto.className}>
                            Chaabane's Cleaning Intelligence
                        </h2>
                    </div>
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
                            currentPath={currentPath}
                            hasActiveSublink={hasActiveSublink}
                        />
                    ))}
                </ul>
            </nav>

            <button onClick={scrollToTop} className={styles.topButton}>
                <UilArrowRight />
            </button>

            <DesktopMenu desktopMenuStyles={desktopMenuStyles} handleMenuButton={handleMenuButton} />
        </>
    );
}

export default memo(Header);
