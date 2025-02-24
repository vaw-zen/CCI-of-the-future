import React from 'react'
import Services from './sections/2-services/services'
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import Details from './sections/1-details/details'

export default function page() {
    return (
        <main style={{ width: '100%', paddingBottom: '0' }}>
            <HeroHeader title={'Services'} />
            <Details />
            <Services />
        </main>
    )
}
