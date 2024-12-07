import styles from './header.module.css'

export default function Header() {
    return <>
        <nav className={styles.nav} style={{ width: '100%', height: '5.2084vw', background: 'brown', position: 'fixed', top: 0, left: 0, zIndex:99999 }}>

        </nav>
        <div style={{ marginTop: '5.2084vw' }} />
    </>
}
