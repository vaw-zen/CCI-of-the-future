import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails'
import PartnerTab from '@/utils/components/servicesComponents/partnerTab/PartnerTab'
import React from 'react'

export default function Page() {
    return (
        <div>
            <HeroHeader title={'Test'} />
            <ServiceDetails />
            <PartnerTab />
        </div>
    )
}
