import React from 'react'
import Hero from './sections/1-hero/hero'
import About from './sections/2-about/about'
import Services from './sections/3-services/services'
import styles from './home.module.css'
import Band from './sections/4-band/band'

export default function Home() {
    return <>
        <Hero />
        <main className={styles.Home}>
            <About />
            <Services />
            <Band/>
        </main>
    </>
}
