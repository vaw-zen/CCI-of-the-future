'use client'
import { memo } from 'react'
import styles from './header.module.css'
import content from './header.json'
import Link from 'next/link'
import { useHeaderLogic } from './header.func'
import { CiCaretDownSm, FaCaretUp, MingcuteMenuFill, UilArrowRight } from '@/utils/components/icons'
import DesktopMenu from './components/desktopMenu/desktopMenu'
import ResponsiveImage from '@/utils/components/Image/Image'
import ChatIcon from './components/chatIcon/chatIcon'

export function LineMdChatRoundDots(props) {
    const handleMouseEnter = (e) => {
        const svg = e.currentTarget;
        const animations = svg.querySelectorAll('animate, set');
        animations.forEach(anim => {
            // Remove the repeat timing and set to play once
            anim.setAttribute('begin', anim.getAttribute('begin').split(';')[0]);
            // Restart the animation
            anim.beginElement();
        });
    };

    const handleMouseLeave = (e) => {
        const svg = e.currentTarget;
        const animations = svg.querySelectorAll('animate, set');
        animations.forEach(anim => {
            const timing = anim.getAttribute('begin').split(';')[0];
            // Restore the repeat timing
            anim.setAttribute('begin', `${timing};${anim.id}.end+0.5s`);
            // Restart the animation
            anim.beginElement();
        });
    };

    return (<svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={24} 
        height={24} 
        viewBox="0 0 24 24" 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
    >
        <path fill="currentColor" fillOpacity={0} d="M5 15.5c1 1 2.5 2 4 2.5c-0.71 -0.24 -1.43 -0.59 -2.09 -1c-0.72 -0.45 -1.39 -0.98 -1.91 -1.5Z">
            <animate 
                id="pathAnim"
                fill="freeze" 
                attributeName="d" 
                begin="0.6s;pathAnim.end+0.5s" 
                dur="0.2s" 
                values="M5 15.5c1 1 2.5 2 4 2.5c-0.71 -0.24 -1.43 -0.59 -2.09 -1c-0.72 -0.45 -1.39 -0.98 -1.91 -1.5Z;M5 15.5c1 1 2.5 2 4 2.5c-2 2 -5 3 -7 3c2 -2 3 -3.5 3 -5.5Z">
            </animate>
            <set 
                id="opacityAnim"
                fill="freeze" 
                attributeName="fill-opacity" 
                begin="0.6s;opacityAnim.end+0.5s" 
                to={1}>
            </set>
        </path>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
            <path strokeDasharray={56} strokeDashoffset={56} d="M7 16.82c-2.41 -1.25 -4 -3.39 -4 -5.82c0 -3.87 4.03 -7 9 -7c4.97 0 9 3.13 9 7c0 3.87 -4.03 7 -9 7c-1.85 0 -3.57 -0.43 -5 -1.18Z">
                <animate 
                    id="outlineAnim"
                    fill="freeze" 
                    attributeName="stroke-dashoffset" 
                    begin="0s;outlineAnim.end+0.5s" 
                    dur="0.6s" 
                    values="56;0">
                </animate>
            </path>
            <path strokeDasharray={2} strokeDashoffset={2} d="M8 11h0.01">
                <animate 
                    id="dot1Anim"
                    fill="freeze" 
                    attributeName="stroke-dashoffset" 
                    begin="outlineAnim.end;dot1Anim.end+0.5s" 
                    dur="0.2s" 
                    values="2;0">
                </animate>
            </path>
            <path strokeDasharray={2} strokeDashoffset={2} d="M12 11h0.01">
                <animate 
                    id="dot2Anim"
                    fill="freeze" 
                    attributeName="stroke-dashoffset" 
                    begin="dot1Anim.end;dot2Anim.end+0.5s" 
                    dur="0.2s" 
                    values="2;0">
                </animate>
            </path>
            <path strokeDasharray={2} strokeDashoffset={2} d="M16 11h0.01">
                <animate 
                    id="dot3Anim"
                    fill="freeze" 
                    attributeName="stroke-dashoffset" 
                    begin="dot2Anim.end;dot3Anim.end+0.5s" 
                    dur="0.2s" 
                    values="2;0">
                </animate>
            </path>
        </g>
    </svg>);
}
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
        currentPath,
        showTopButton
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

            <div className={styles.stickyBottom}>
                <button onClick={scrollToTop} className={styles.chatButton}>
                    <ChatIcon />
                </button>
                <button onClick={scrollToTop} className={`${styles.topButton} ${showTopButton ? styles.active : ''}`}>
                    <UilArrowRight />
                </button>

            </div>

            <DesktopMenu desktopMenuStyles={desktopMenuStyles} handleMenuButton={handleMenuButton} />
        </>
    );
}

export default memo(Header);
