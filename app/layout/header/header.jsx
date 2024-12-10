'use client'
import { CiCaretDownSm, FaCaretUp, MingcuteMenuFill } from '@/app/utils/components/icons'
import styles from './header.module.css'
import content from './header.json'
import Link from 'next/link'
import { useHeaderLogic } from './header.func'
import Image from 'next/image'

export default function Header({ roboto }) {
    const {
        handleDropdownBlur,
        toggleDropdown,
        isActive,
        handleMenuButton,
        handleMenuStyles,
        handleNavBlur
    } = useHeaderLogic()


    return (
        <nav
            tabIndex={0}
            onBlur={handleNavBlur}
            className={styles.nav}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    {/* <img src='/layout/logo.png' /> */}
                    <Image width={0} height={0} priority sizes="25vw" src='/layout/logo.png' alt="cci-logo" />

                    <h2 className={roboto.className}>
                        Chaabane Cleaning Inteligence
                    </h2>
                </div>
                <button onClick={handleMenuButton} className={styles.menuIcon}>
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
    )
}
