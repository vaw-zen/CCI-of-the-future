'use client';

import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails'
import PartnerTab from '@/utils/components/servicesComponents/partnerTab/PartnerTab'
import React, { useEffect } from 'react'
import Feedback from '@/utils/components/servicesComponents/feedbackComponent/feedback'
import AboutUsTab from '@/utils/components/servicesComponents/aboutUsTab/AboutUsTab'
import ServiceList from '@/utils/components/servicesComponents/serviceList/serviceList'
import { ImageSlider } from '@/utils/components/imageSlider/imageSlider'
import RelatedArticles from '@/utils/components/servicesComponents/relatedArticles/relatedArticles'
import tapisserieData from './tapisserie.json'
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { trackServiceInteraction, SERVICE_TYPES } from '@/utils/analytics';

// Metadata is now in layout.jsx (server component) - this page is client for analytics

export default function Page() {
  // Track page engagement
  useScrollTracking('tapisserie_page');
  useTimeTracking('tapisserie_page');

  useEffect(() => {
    // Track service page view
    trackServiceInteraction(SERVICE_TYPES.TAPISSERIE, 'page_view', {
      page_title: tapisserieData.metadata.title
    });
  }, []);

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
        {/* <AboutUsTab
          historyText={tapisserieData.aboutUs.historyText}
          missionText={tapisserieData.aboutUs.missionText}
          visionText={tapisserieData.aboutUs.visionText}
        /> */}

        <ServiceList
          title={tapisserieData.serviceList.title}
          text={tapisserieData.serviceList.text}
          items={tapisserieData.serviceList.items}
        />
        <ImageSlider images={tapisserieData.images} />
        <RelatedArticles 
          articles={tapisserieData.relatedArticles} 
          sectionTitle="Guides Tapisserie & Retapissage"
        />
      </div>
    </>
  )
}
