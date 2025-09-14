import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ServiceDetails from "@/utils/components/servicesComponents/serviceDetails/serviceDetails";
import PartnerTab from "@/utils/components/servicesComponents/partnerTab/PartnerTab";
import React from "react";
import Feedback from "@/utils/components/servicesComponents/feedbackComponent/feedback";
import AboutUsTab from "@/utils/components/servicesComponents/aboutUsTab/AboutUsTab";
import ServiceList from "@/utils/components/servicesComponents/serviceList/serviceList";
import { ImageSlider } from "@/utils/components/imageSlider/imageSlider";

const tapisTabData = [
  {
    id: "mission",
    title: "Notre mission",
    content:
      "Offrir des prestations professionnelles de nettoyage et désinfection de tapis et moquettes, en combinant méthodes efficaces et produits respectueux des fibres pour restaurer l’apparence et la durée de vie de vos textiles.",
  },
  {
    id: "vision",
    title: "Notre vision",
    content:
      "Devenir la référence locale en nettoyage de tapis et moquettes, reconnue pour notre soin du détail, notre respect de l’environnement et la qualité durable de nos interventions.",
  },
  {
    id: "philosophy",
    title: "Notre philosophie",
    content:
      "Préserver la santé et le confort de nos clients grâce à des techniques qui éliminent taches, odeurs et acariens, tout en respectant les fibres et couleurs d’origine.",
  },
];

export const metadata = {
  title: "Nettoyage de Tapis & Moquettes — CCI",
  description:
    "Nettoyage professionnel de tapis et moquettes : shampooing, détachage, désinfection et traitement anti-acariens. Intervention rapide en Tunisie.",
};

export default function Page() {
 const tapisImages = [
  { src: "/gallery/moquette/moquette1.jpg", title: "Moquette 1", description: "Service professionnel" },
  // { src: "/gallery/moquette/moquette2.jpg", title: "Moquette 2", description: "Entretien textile" },
  { src: "/gallery/moquette/moquette3.jpg", title: "Moquette 3", description: "Anti-acariens" },
  { src: "/gallery/moquette/moquette4.jpg", title: "Moquette 4", description: "Nettoyage rapide" },
  { src: "/gallery/moquette/moquette5.jpg", title: "Moquette 5", description: "Résultat impeccable" },
  { src: "/gallery/moquette/moquette6.jpg", title: "Moquette 6", description: "Confort préservé" },
];


  const localBusinessJSONLD = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "CCI",
    url: "https://cciservices.online/",
    logo: "https://cciservices.online/layout/logo.png",
    telephone: "+216-XX-XXX-XXX",
    address: {
      "@type": "PostalAddress",
      streetAddress: "",
      addressLocality: "Tunisie",
      addressCountry: "TN",
    },
  };

  const serviceJSONLD = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Nettoyage de tapis et moquettes",
    description:
      "Shampooing, détachage et désinfection pour tapis et moquettes, avec méthodes adaptées aux fibres et séchage rapide.",
    provider: { "@type": "LocalBusiness", name: "CCI", url: "https://cciservices.online/" },
  };
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
  <HeroHeader title={"Nettoyage tapis et moquette"} />
  <script type="application/ld+json">{JSON.stringify(localBusinessJSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title="Nettoyage professionnel de tapis"
          text="CCI propose un nettoyage profond et une désinfection de tapis et moquettes : aspiration spécialisée, pré-traitement des taches, shampooing professionnel et rinçage à basse humidité. Nous garantissons un résultat propre, sans résidus et un séchage rapide."
        />
        <Feedback />
        <ServiceDetails
          title="Notre expertise"
          text="Nos techniciens sont formés aux meilleures méthodes de nettoyage : traitement anti-acariens, élimination des odeurs, détachage complexe et protection des fibres. Nous adaptons la méthode au type de tissu pour préserver couleurs et texture."
        />
        <AboutUsTab
          historyText="Depuis notre création, nous nous sommes spécialisés dans l’entretien textile et le nettoyage professionnel de tapis et moquettes, au service des particuliers et des entreprises."
          missionText="Offrir des nettoyages performants, sûrs pour la santé et respectueux des matériaux, tout en garantissant un service rapide et soigné."
          visionText="Être le partenaire de confiance pour tous les besoins de nettoyage textile, avec des solutions innovantes et durables."
        />
        <PartnerTab tabData={tapisTabData} />
        <ServiceList
          title="Nos services tapis & moquettes"
          text="Solutions complètes pour l’entretien de vos tapis et moquettes, chez vous ou en livraison atelier."
          items={[
            { id: "1", text: "Shampooing profond", icon: "/icons/polisher.png" },
            { id: "2", text: "Détachage professionnel", icon: "/icons/polisher1.png" },
            { id: "3", text: "Désinfection & anti-acariens", icon: "/icons/crystal3.png" },
            { id: "4", text: "Traitement anti-taches & protection", icon: "/icons/shield.png" },
              { id: "5", text: "Plusieurs méthodes de nettoyage", icon: "/icons/shield.png" },
                { id: "6", text: "Une fléxibilité technique", icon: "/icons/shield.png" },
          ]}
        />

        <ServiceDetails
          title="Pourquoi choisir CCI pour vos tapis"
          text="Nous utilisons des équipements professionnels, des produits adaptés et des protocoles testés pour prolonger la vie de vos textiles, assurer l’élimination des allergènes et rendre vos espaces plus sains."
        />
  <ImageSlider images={tapisImages} />
      </div>
    </>
  );
}
