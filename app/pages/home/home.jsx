import React from 'react'
import Hero from './sections/1-hero/hero'
import About from './sections/2-about/about'
import Services from './sections/3-services/services'
import styles from './home.module.css'
import Band from './sections/4-band/band'
import Showcase from './sections/5-showcase/showcase'
import Project from './sections/6-projects/project'
import Clients from './sections/7-clients/clients'
import GreenBand from '@/app/utils/components/GreenBand/GreenBand'
import Testimonials from './sections/8-testimonials/testimonials'
import Overlay from './sections/9-overlay/overlay'
import Initalizer from '@/app/utils/initializer/initalizer'

export default function Home() {
    return <>
        <Initalizer />
        <Hero />
        <main className={styles.Home}>
            <div className={styles.wrapper}>
                <About />
                <Services />
                <Band />
                <Showcase />
                <Project />
                <Clients />
                <GreenBand />
                <Testimonials />
            </div>
        </main>
        <Overlay />
    </>
}
