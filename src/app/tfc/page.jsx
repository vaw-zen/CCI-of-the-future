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
import tfcData from "./tfc.json";
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { trackServiceInteraction, SERVICE_TYPES } from '@/utils/analytics';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: tfcData.metadata.title,
    description: tfcData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/tfc`
    },
    openGraph: {
      title: tfcData.metadata.title,
      description: tfcData.metadata.description,
      url: `${SITE_URL}/tfc`,
      type: 'website'
    },
    twitter: {
      title: tfcData.metadata.title,
      description: tfcData.metadata.description
    }
  };
}

export default function Page() {
  // Track page engagement
  useScrollTracking('tfc_page');
  useTimeTracking('tfc_page');

  useEffect(() => {
    // Track service page view
    trackServiceInteraction(SERVICE_TYPES.TFC, 'page_view', {
      page_title: tfcData.metadata.title
    });
  }, []);

  return (
    <>
      <style>{`
        .responsive-padding { padding: 115px 0px; }
        @media (max-width: 900px) { .responsive-padding { padding: 60px 0px; } }
        @media (max-width: 600px) { .responsive-padding { padding: 0px 0px; } }
      `}</style>
      <HeroHeader title={tfcData.heroTitle} />
      <script type="application/ld+json">{JSON.stringify(tfcData.localBusinessJSONLD)}</script>
      <script type="application/ld+json">{JSON.stringify(tfcData.serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title={tfcData.sections.mainService.title}
          text={tfcData.sections.mainService.text}
        />

        <Feedback />

        <ServiceDetails
          title={tfcData.sections.secondaryService.title}
          text={tfcData.sections.secondaryService.text}
        />

        <AboutUsTab
          historyText={tfcData.aboutUs.historyText}
          missionText={tfcData.aboutUs.missionText}
          visionText={tfcData.aboutUs.visionText}
        />

        <PartnerTab tabData={tfcData.tabData} />

        <ServiceList
          title={tfcData.serviceList.title}
          text={tfcData.serviceList.text}
          items={tfcData.serviceList.items}
        />

        <ServiceDetails
          title={tfcData.sections.whyChooseUs.title}
          text={tfcData.sections.whyChooseUs.text}
        />

        <ImageSlider images={tfcData.images} />
        
        <RelatedArticles 
          articles={tfcData.relatedArticles} 
          sectionTitle="Guides Nettoyage Post-Chantier"
        />
      </div>
    </>
  );
}
