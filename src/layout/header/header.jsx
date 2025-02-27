'use client'
import styles from './header.module.css'
import content from './header.json'
import Link from 'next/link'
import { useHeaderLogic } from './header.func'
import { CiCaretDownSm, FaCaretUp, MingcuteMenuFill, UilArrowRight } from '@/utils/components/icons'
import DesktopMenu from './components/desktopMenu/desktopMenu'
import ResponsiveImage from '@/utils/components/Image/Image'

export default function Header({ roboto }) {
    const {
        handleDropdownBlur,
        toggleDropdown,
        isActive,
        handleMenuButton,
        handleMenuStyles,
        desktopMenuStyles,
        handleNavBlur,
        scrollToTop
    } = useHeaderLogic()


    return (
        <>
            <nav
                tabIndex={0}
                onBlur={handleNavBlur}
                className={styles.nav}>
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
                <ul className={handleMenuStyles(styles.menu, styles.activeMenu)}>
                    {content.map((element, index) => (
                        <li
                            key={index}
                            className={styles.menuItem}
                            onBlur={handleDropdownBlur}
                            tabIndex={0}
                        >
                            {!index ? null : <div className={styles.dot} />}

                            {element.link && (
                                <Link href={element.link} className={styles.link}>
                                    {element.name}
                                </Link>
                            )}
                            {element.subLinks && <>
                                <div className={`${styles.dropdown} ${isActive(index) ? styles.dropdownActive : ''}`}>
                                    <FaCaretUp className={styles.dropdownArrow} />
                                    {element.subLinks.map((link, subIndex) => (
                                        <Link
                                            key={subIndex}
                                            href={link.link}
                                            className={styles.subLink}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                                <button
                                    onClick={() => toggleDropdown(index)}
                                    className={styles.button}
                                    aria-label="ouvrir-dropdown"
                                >
                                    {element.name}
                                    <CiCaretDownSm
                                        className={`${styles.icon} ${isActive(index) ? styles.activeIcon : ''}`}
                                    />
                                </button>
                            </>}
                        </li>
                    ))}
                </ul>
            </nav>

            <button onClick={scrollToTop} className={styles.topButton} >
                <UilArrowRight />
            </button>

            <DesktopMenu desktopMenuStyles={desktopMenuStyles} handleMenuButton={handleMenuButton} />



        </>

    )
}
