import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ServiceDetails from "@/utils/components/servicesComponents/serviceDetails/serviceDetails";
import PartnerTab from "@/utils/components/servicesComponents/partnerTab/PartnerTab";
import React from "react";
import Feedback from "@/utils/components/servicesComponents/feedbackComponent/feedback";
import AboutUsTab from "@/utils/components/servicesComponents/aboutUsTab/AboutUsTab";
import ServiceList from "@/utils/components/servicesComponents/serviceList/serviceList";
import { ImageSlider } from "@/utils/components/imageSlider/imageSlider";
import salonData from "./salon.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: salonData.metadata.title,
    description: salonData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/salon`
    },
    openGraph: {
      title: salonData.metadata.title,
      description: salonData.metadata.description,
      url: `${SITE_URL}/salon`,
      type: 'website'
    },
    twitter: {
      title: salonData.metadata.title,
      description: salonData.metadata.description
    }
  };
}

export default function Page() {
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

        <AboutUsTab
          historyText={salonData.aboutUs.historyText}
          missionText={salonData.aboutUs.missionText}
          visionText={salonData.aboutUs.visionText}
        />

        <PartnerTab tabData={salonData.tabData} />

        <ServiceList
          title={salonData.serviceList.title}
          text={salonData.serviceList.text}
          items={salonData.serviceList.items}
        />

        <ServiceDetails
          title={salonData.sections.whyChooseUs.title}
          text={salonData.sections.whyChooseUs.text}
        />

        <ImageSlider images={salonData.images} />
      </div>
    </>
  );
}
