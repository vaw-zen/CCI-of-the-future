import React from 'react'
import Hero from './sections/1-hero/hero'
import About from './sections/2-about/about'
import Services from './sections/3-services/services'
import styles from './home.module.css'
import Band from './sections/4-band/band'
import Showcase from './sections/5-showcase/showcase'
import Project from './sections/6-projects/project'

export default function Home() {
    return <>
        <Hero />
        <main className={styles.Home}>
            <About />
            <Services />
            <Band />
            <Showcase />
            <Project />
            <div style={{ height: '200vw' }} />
        </main>
    </>
}
