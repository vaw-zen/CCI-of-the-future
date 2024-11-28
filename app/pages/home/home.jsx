import React from 'react'
import Hero from './sections/1-hero/hero'
import About from './sections/2-about/about'

export default function Home() {
    return <main style={{ height: '300vh' }}>
        <Hero />
        <About />
    </main>
}
