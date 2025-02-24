import React from 'react'
import Services from './sections/2-services/services'
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'

export default function page() {
    return (
        <main style={{ width: '100%', paddingBottom: '50vw' }}>
            <HeroHeader title={'Services'} />
            <Services />
        </main>
    )
}
