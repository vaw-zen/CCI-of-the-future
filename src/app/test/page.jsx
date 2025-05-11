import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails'
import PartnerTab from '@/utils/components/servicesComponents/partnerTab/PartnerTab'
import React from 'react'
import Feedback from '@/utils/components/servicesComponents/feedbackComponent/feedback'

export default function Page() {
    return (
        <div style={{background:"#141416"}}>
            <HeroHeader title={'Test'} />
            <ServiceDetails />
            <PartnerTab />
            <Feedback />
        </div>
    )
}
