'use client'
import { CiCaretDownSm, FaCaretUp, MingcuteMenuFill } from '@/app/utils/components/icons'
import styles from './header.module.css'
import content from './header.json'
import Link from 'next/link'
import { useHeaderLogic } from './header.func'

export default function Header() {
    const { toggleDropdown, isActive, closeDropdown } = useHeaderLogic()

    return (
        <nav className={styles.nav}>
            <div className={styles.logo}>LOGO</div>
            <ul className={styles.menu}>
                {content.map((element, index) => (
                    <li
                        key={index}
                        className={styles.menuItem}
                        onBlur={closeDropdown}
                        tabIndex={0}
                    >
                        {!index ? null : <div className={styles.dot} />}
                        {element.subLinks ? (
                            <button
                                onClick={() => toggleDropdown(index)}
                                className={styles.button}
                            >
                                {element.name}
                                <CiCaretDownSm
                                    style={{
                                        transform: `rotate(${isActive(index) ? 180 : 0}deg)`,
                                        color: isActive(index) ? 'var(--ac-primary)' : 'var(--t-primary)',
                                    }}
                                    className={styles.icon}
                                />
                            </button>
                        ) : (
                            <Link href={element.link} className={styles.link}>
                                {element.name}
                            </Link>
                        )}
                        {element.subLinks && (
                            <div
                                className={`${styles.dropdown} ${isActive(index) ? styles.dropdownActive : ''
                                    }`}
                            >
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
                        )}
                    </li>
                ))}
            </ul>
            <div className={styles.menuIcon}>
                <MingcuteMenuFill />
            </div>
        </nav>
    )
}
