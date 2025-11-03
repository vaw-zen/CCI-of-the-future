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
import salonData from "./salon.json";
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { trackServiceInteraction, SERVICE_TYPES } from '@/utils/analytics';

// Metadata is now in layout.jsx (server component) - this page is client for analytics

export default function Page() {
  // Track page engagement
  useScrollTracking('salon_page');
  useTimeTracking('salon_page');

  useEffect(() => {
    // Track service page view
    trackServiceInteraction(SERVICE_TYPES.SALON, 'page_view', {
      page_title: salonData.metadata.title
    });
  }, []);

  return (
    <>
      <style>{`
        .responsive-padding { padding: 115px 0px; }
        @media (max-width: 900px) { .responsive-padding { padding: 60px 0px; } }
        @media (max-width: 600px) { .responsive-padding { padding: 0px 0px; } }
      `}</style>
      <HeroHeader title={salonData.heroTitle} />
      <script type="application/ld+json">{JSON.stringify(salonData.localBusinessJSONLD)}</script>
      <script type="application/ld+json">{JSON.stringify(salonData.serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title={salonData.sections.mainService.title}
          text={salonData.sections.mainService.text}
        />

        <Feedback />

        <ServiceDetails
          title={salonData.sections.secondaryService.title}
          text={salonData.sections.secondaryService.text}
        />

        {/* <AboutUsTab
          historyText={salonData.aboutUs.historyText}
          missionText={salonData.aboutUs.missionText}
          visionText={salonData.aboutUs.visionText}
        /> */}

        <PartnerTab tabData={salonData.tabData} />

        <ServiceList
          title={salonData.serviceList.title}
          text={salonData.serviceList.text}
          items={salonData.serviceList.items}
          image={salonData.serviceList.image}
        />

        <ServiceDetails
          title={salonData.sections.whyChooseUs.title}
          text={salonData.sections.whyChooseUs.text}
        />

        <ImageSlider images={salonData.images} />
        
        <RelatedArticles 
          articles={salonData.relatedArticles} 
          sectionTitle="Guides Nettoyage & Entretien Salon"
        />
      </div>
    </>
  );
}
