import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails'
import PartnerTab from '@/utils/components/servicesComponents/partnerTab/PartnerTab'
import React from 'react'
import Feedback from '@/utils/components/servicesComponents/feedbackComponent/feedback'
import AboutUsTab from '@/utils/components/servicesComponents/aboutUsTab/AboutUsTab'
import ServiceList from '@/utils/components/servicesComponents/serviceList/serviceList'
import { ImageSlider } from '@/utils/components/imageSlider/imageSlider'
import tapisserieData from './tapisserie.json'

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: tapisserieData.metadata.title,
    description: tapisserieData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/tapisserie`
    },
    openGraph: {
      title: tapisserieData.metadata.title,
      description: tapisserieData.metadata.description,
      url: `${SITE_URL}/tapisserie`,
      type: 'website'
    },
    twitter: {
      title: tapisserieData.metadata.title,
      description: tapisserieData.metadata.description
    }
  };
}

export default function Page() {
  return (
    <>
      <style>{`
        .responsive-padding {
          padding: 115px 0px;
        }
        @media (max-width: 900px) {
          .responsive-padding {
            padding: 60px 0px;
          }
        }
        @media (max-width: 600px) {
          .responsive-padding {
            padding: 0px 0px;
          }
        }
      `}</style>
      <HeroHeader title={tapisserieData.heroTitle} />
      <script type="application/ld+json">{JSON.stringify(tapisserieData.localBusinessJSONLD)}</script>
      <script type="application/ld+json">{JSON.stringify(tapisserieData.serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title={tapisserieData.sections.mainService.title}
          text={tapisserieData.sections.mainService.text}
        />

        <Feedback />

        <ServiceDetails
          title={tapisserieData.sections.secondaryService.title}
          text={tapisserieData.sections.secondaryService.text}
        />

        <PartnerTab tabData={tapisserieData.tabData} />
        <AboutUsTab
          historyText={tapisserieData.aboutUs.historyText}
          missionText={tapisserieData.aboutUs.missionText}
          visionText={tapisserieData.aboutUs.visionText}
        />

        <ServiceList
          title={tapisserieData.serviceList.title}
          text={tapisserieData.serviceList.text}
          items={tapisserieData.serviceList.items}
        />
        <ImageSlider images={tapisserieData.images} />
      </div>
    </>
  )
}
