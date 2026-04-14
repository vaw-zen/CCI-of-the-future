'use client';

import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ServiceDetails from "@/utils/components/servicesComponents/serviceDetails/serviceDetails";
import PartnerTab from "@/utils/components/servicesComponents/partnerTab/PartnerTab";
import React, { useEffect } from "react";
import entreprisesData from "./entreprises.json";
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { trackServiceInteraction, SERVICE_TYPES } from '@/utils/analytics';
import Secteurs from "./2-secteurs/Secteurs";
import ServicesConvention from "./3-services/ServicesConvention";
import Avantages from "./4-avantages/Avantages";
import Processus from "./5-processus/Processus";
import ConventionForm from "./6-form/ConventionForm";
import FaqEntreprises from "./7-faq/FaqEntreprises";
import NodeNetwork from "./1-background/NodeNetwork";
import RelatedArticles from "@/utils/components/servicesComponents/relatedArticles/relatedArticles";
import OtherServices from "@/utils/components/servicesComponents/otherServices/otherServices";

export default function Page() {
  useScrollTracking('entreprises_page');
  useTimeTracking('entreprises_page');

  useEffect(() => {
    trackServiceInteraction(SERVICE_TYPES.CONVENTION, 'view_service_page', {
      page_title: entreprisesData.metadata.title
    });
  }, []);

  return (
    <>
      <style>{`
        .responsive-padding { padding: 115px 0px; }
        @media (max-width: 900px) { .responsive-padding { padding: 60px 0px; } }
        @media (max-width: 600px) { .responsive-padding { padding: 0px 0px; } }
        `}</style>
      <HeroHeader title={entreprisesData.heroTitle} />
      <script type="application/ld+json">{JSON.stringify(entreprisesData.serviceJSONLD)}</script>
      <main className="responsive-padding">
        <ServiceDetails
          title={entreprisesData.sections.mainService.title}
          text={entreprisesData.sections.mainService.text}
        />

        <Secteurs secteurs={entreprisesData.secteurs} />

        <PartnerTab tabData={entreprisesData.tabData} />

        <ServicesConvention services={entreprisesData.services} />

        <Avantages avantages={entreprisesData.avantages} />

        <Processus etapes={entreprisesData.processus} />

        <ServiceDetails
          title={entreprisesData.sections.whyChooseUs.title}
          text={entreprisesData.sections.whyChooseUs.text}
        />

        <ConventionForm />
        {/* <NodeNetwork /> */}

        <FaqEntreprises faqItems={entreprisesData.faq} />

        <OtherServices currentSlug="entreprises" />

        <RelatedArticles 
          articles={entreprisesData.relatedArticles} 
          serviceName="Conventions Entreprises"
        />
      </main>
    </>
  );
}
