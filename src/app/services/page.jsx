import React from 'react'
import Services from './sections/2-services/services'
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import Details from './sections/1-details/details'
import Band from '../home/sections/4-band/band'
import Testimonials from '../home/sections/8-testimonials/testimonials'
import GreenBand from '@/utils/components/GreenBand/GreenBand'
import styles from './page.module.css'
import FAQ from './sections/3-FAQ/FAQ'

export default function page() {
    return (
        <main>
            <HeroHeader title={'Services'} />
            <div className={styles.services}>
                <Details />
                <Services />
                <FAQ />
                <Band />
                <Testimonials className={styles.testimonialsWrapper} />
                <GreenBand className={styles.greenBandWrapper} />
            </div>
        </main>
    )
}
