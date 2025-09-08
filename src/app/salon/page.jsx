import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ServiceDetails from "@/utils/components/servicesComponents/serviceDetails/serviceDetails";
import PartnerTab from "@/utils/components/servicesComponents/partnerTab/PartnerTab";
import React from "react";
import Feedback from "@/utils/components/servicesComponents/feedbackComponent/feedback";
import AboutUsTab from "@/utils/components/servicesComponents/aboutUsTab/AboutUsTab";
import ServiceList from "@/utils/components/servicesComponents/serviceList/serviceList";
import { ImageSlider } from "@/utils/components/imageSlider/imageSlider";

const salonTabData = [
  {
    id: "mission",
    title: "Notre mission",
    content:
      "Proposer un nettoyage professionnel des espaces de vie et de l’ameublement pour retrouver confort, hygiène et esthétique. Nous respectons les matériaux et garantissons un séchage rapide.",
  },
  {
    id: "vision",
    title: "Notre vision",
    content:
      "Offrir un service de nettoyage salon qui allie efficacité et respect de l’environnement, afin d’améliorer le bien-être à la maison et prolonger la durée de vie des meubles.",
  },
  {
    id: "philosophy",
    title: "Notre philosophie",
    content:
      "Traiter chaque textile avec soin : diagnostic, nettoyage adapté, protection des fibres et finition soignée pour un rendu naturel.",
  },
];

export const metadata = {
  title: "Nettoyage salon & Ameublement — CCI",
  description:
    "Nettoyage et rénovation de canapés, fauteuils et textiles d’ameublement : détachage, shampooing et désinfection pour un intérieur sain et accueillant.",
};

export default function Page() {
  const salonImages = [
    "/home/1.webp",
    "/home/3.webp",
    "/home/4.webp",
  ];

  const localBusinessJSONLD = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "CCI",
    url: "https://cciservices.online/",
    logo: "https://cciservices.online/layout/logo.png",
    telephone: "+216-XX-XXX-XXX",
    address: { "@type": "PostalAddress", streetAddress: "", addressLocality: "Tunisie", addressCountry: "TN" },
  };

  const serviceJSONLD = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Nettoyage salon & ameublement",
    description:
      "Nettoyage et entretien de canapés, rideaux et textiles d’ameublement. Détachage, désodorisation et protection des fibres.",
    provider: { "@type": "LocalBusiness", name: "CCI", url: "https://cciservices.online/" },
  };
  return (
    <>
      <style>{`
        .responsive-padding { padding: 115px 0px; }
        @media (max-width: 900px) { .responsive-padding { padding: 60px 0px; } }
        @media (max-width: 600px) { .responsive-padding { padding: 0px 0px; } }
      `}</style>
      <HeroHeader title={"Nettoyage salon & ameublement"} />
  <script type="application/ld+json">{JSON.stringify(localBusinessJSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title="Nettoyage canapé et tissus d’ameublement"
          text="Nettoyage en profondeur des canapés, fauteuils et coussins : aspiration, détachage spécialisé, shampooing et séchage contrôlé. Nous restaurons les couleurs et la texture sans abîmer les matériaux."
        />

        <Feedback />

        <ServiceDetails
          title="Entretien rideaux et textiles"
          text="Nettoyage et remise en forme des rideaux, stores et textiles d’ameublement, avec des procédés adaptés pour éviter rétrécissement ou décoloration."
        />

        <AboutUsTab
          historyText="Notre équipe intervient depuis des années pour l’entretien textile des intérieurs, chez les particuliers et les professionnels."
          missionText="Garantir des interventions rapides et soignées tout en préservant la qualité des fibres et la santé des occupants."
          visionText="Devenir le partenaire privilégié pour l’entretien de l’ameublement dans la région, grâce à des protocoles éprouvés."
        />

        <PartnerTab tabData={salonTabData} />

        <ServiceList
          title="Services salon"
          text="Solutions sur mesure pour tous les textiles d’ameublement."
          items={[
            {
              id: "1",
              text: "Nettoyage canapé et tissue d'ameublement",
              icon: "/icons/polisher.png",
            },
            {
              id: "2",
              text: "Détachage & désodorisation",
              icon: "/icons/polisher1.png",
            },
            { id: "3", text: "Nettoyage rideaux", icon: "/icons/crystal3.png" },
            {
              id: "4",
              text: "Nettoyage intérieur de voitures et bus",
              icon: "/icons/shield.png",
            },
            {
              id: "5",
              text: "Nettoayeg siéges cinéma",
              icon: "/icons/shield.png",
            },
            {
              id: "6",
              text: "Nettoyage bateaux et avions",
              icon: "/icons/shield.png",
            },
          ]}
        />

        <ServiceDetails
          title="Pourquoi nous choisir"
          text="Équipements professionnels, produits adaptés et techniciens formés : nous intervenons avec soin et rapidité pour rendre vos espaces sains et accueillants."
        />

  <ImageSlider images={salonImages} />
      </div>
    </>
  );
}
