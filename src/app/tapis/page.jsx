'use client';

import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ServiceDetails from "@/utils/components/servicesComponents/serviceDetails/serviceDetails";
import PartnerTab from "@/utils/components/servicesComponents/partnerTab/PartnerTab";
import React, { useEffect } from "react";
import Feedback from "@/utils/components/servicesComponents/feedbackComponent/feedback";
import AboutUsTab from "@/utils/components/servicesComponents/aboutUsTab/AboutUsTab";
import ServiceList from "@/utils/components/servicesComponents/serviceList/serviceList";
import { ImageSlider } from "@/utils/components/imageSlider/imageSlider";
import RelatedArticles from "@/utils/components/servicesComponents/relatedArticles/relatedArticles";
import tapisData from "./tapis.json";
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { trackServiceInteraction, SERVICE_TYPES } from '@/utils/analytics';

// Metadata is now in layout.jsx (server component) - this page is client for analytics

export default function Page() {
  // Track page engagement
  useScrollTracking('tapis_page');
  useTimeTracking('tapis_page');

  useEffect(() => {
    // Track service page view
    trackServiceInteraction(SERVICE_TYPES.TAPIS, 'page_view', {
      page_title: tapisData.metadata.title
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
      <HeroHeader title={tapisData.heroTitle} />
      <script type="application/ld+json">{JSON.stringify(tapisData.localBusinessJSONLD)}</script>
      <script type="application/ld+json">{JSON.stringify(tapisData.serviceJSONLD)}</script>
      <script type="application/ld+json">{JSON.stringify(tapisData.faqJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title={tapisData.sections.mainService.title}
          text={tapisData.sections.mainService.text}
        />
        <Feedback />
        <ServiceDetails
          title={tapisData.sections.secondaryService.title}
          text={tapisData.sections.secondaryService.text}
        />
        {/* <AboutUsTab
          historyText={tapisData.aboutUs.historyText}
          missionText={tapisData.aboutUs.missionText}
          visionText={tapisData.aboutUs.visionText}
        /> */}
        <PartnerTab tabData={tapisData.tabData} />
        <ServiceList
          title={tapisData.serviceList.title}
          text={tapisData.serviceList.text}
          items={tapisData.serviceList.items}
          image={tapisData.serviceList.image}
        />

        <ServiceDetails
          title={tapisData.sections.whyChooseUs.title}
          text={tapisData.sections.whyChooseUs.text}
        />
        <ImageSlider images={tapisData.images} />
        <RelatedArticles 
          articles={tapisData.relatedArticles} 
          sectionTitle="Guides Nettoyage Tapis & Moquettes"
        />
      </div>
    </>
  );
}
