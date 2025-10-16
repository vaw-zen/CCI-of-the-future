import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ServiceDetails from "@/utils/components/servicesComponents/serviceDetails/serviceDetails";
import PartnerTab from "@/utils/components/servicesComponents/partnerTab/PartnerTab";
import React from "react";
import Feedback from "@/utils/components/servicesComponents/feedbackComponent/feedback";
import AboutUsTab from "@/utils/components/servicesComponents/aboutUsTab/AboutUsTab";
import ServiceList from "@/utils/components/servicesComponents/serviceList/serviceList";
import { ImageSlider } from "@/utils/components/imageSlider/imageSlider";
import RelatedArticles from "@/utils/components/servicesComponents/relatedArticles/relatedArticles";
import marbreData from "./marbre.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: marbreData.metadata.title,
    description: marbreData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/marbre`
    },
    openGraph: {
      title: marbreData.metadata.title,
      description: marbreData.metadata.description,
      url: `${SITE_URL}/marbre`,
      type: 'website'
    },
    twitter: {
      title: marbreData.metadata.title,
      description: marbreData.metadata.description
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
      <HeroHeader title={marbreData.heroTitle} />
      <script type="application/ld+json">{JSON.stringify(marbreData.localBusinessJSONLD)}</script>
      <script type="application/ld+json">{JSON.stringify(marbreData.serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title={marbreData.sections.mainService.title}
          text={marbreData.sections.mainService.text}
        />
        <Feedback />
        <ServiceDetails
          title={marbreData.sections.secondaryService.title}
          text={marbreData.sections.secondaryService.text}
        />
        <PartnerTab tabData={marbreData.tabData} />
        <AboutUsTab
          historyText={marbreData.aboutUs.historyText}
          missionText={marbreData.aboutUs.missionText}
          visionText={marbreData.aboutUs.visionText}
        />
        <ServiceList
          title={marbreData.serviceList.title}
          text={marbreData.serviceList.text}
          items={marbreData.serviceList.items}
        />
        <ImageSlider images={marbreData.images} />
        <RelatedArticles 
          articles={marbreData.relatedArticles} 
          sectionTitle="Guides Restauration & Entretien Marbre"
        />
      </div>
    </>
  );
}
