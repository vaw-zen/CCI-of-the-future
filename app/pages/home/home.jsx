import React from 'react'
import Hero from './sections/1-hero/hero'
import About from './sections/2-about/about'
import Services from './sections/3-services/services'
import styles from './home.module.css'

export default function Home() {
    return <>
        <Hero />
        <main style={{ height: '300vh' }} className={styles.Home}>
            <About />
            <Services />
        </main>
    </>
}
