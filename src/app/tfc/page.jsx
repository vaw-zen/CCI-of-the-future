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
import LeadCTA from "@/utils/components/servicesComponents/leadCTA/leadCTA";
import OtherServices from "@/utils/components/servicesComponents/otherServices/otherServices";
import tfcData from "./tfc.json";
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { trackServiceInteraction, SERVICE_TYPES } from '@/utils/analytics';

// Metadata is now in layout.jsx (server component) - this page is client for analytics

export default function Page() {
  // Track page engagement
  useScrollTracking('tfc_page');
  useTimeTracking('tfc_page');

  useEffect(() => {
    // Track service page view
    trackServiceInteraction(SERVICE_TYPES.TFC, 'view_service_page', {
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
      <script type="application/ld+json">{JSON.stringify(tfcData.serviceJSONLD)}</script>
      <main className="responsive-padding">
        <ServiceDetails
          title={tfcData.sections.mainService.title}
          text={tfcData.sections.mainService.text}
        />

        <Feedback />

        <ServiceDetails
          title={tfcData.sections.secondaryService.title}
          text={tfcData.sections.secondaryService.text}
        />

        {/* <AboutUsTab
          historyText={tfcData.aboutUs.historyText}
          missionText={tfcData.aboutUs.missionText}
          visionText={tfcData.aboutUs.visionText}
        /> */}

        <PartnerTab tabData={tfcData.tabData} />

        <ServiceList
          title={tfcData.serviceList.title}
          text={tfcData.serviceList.text}
          items={tfcData.serviceList.items}
          image={tfcData.serviceList.image}
        />

        <ServiceDetails
          title={tfcData.sections.whyChooseUs.title}
          text={tfcData.sections.whyChooseUs.text}
        />

        <ImageSlider images={tfcData.images} />

        <LeadCTA
          serviceName="Nettoyage Fin de Chantier"
          serviceType="tfc"
          pricing="10 DT/m²"
          whatsappMessage="Bonjour, je souhaite un devis gratuit pour un nettoyage fin de chantier. Merci !"
        />

        <OtherServices currentSlug="tfc" />

        <RelatedArticles 
          articles={tfcData.relatedArticles} 
          sectionTitle="Guides Nettoyage Post-Chantier"
        />
      </main>
    </>
  );
}
