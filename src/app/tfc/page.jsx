import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ServiceDetails from "@/utils/components/servicesComponents/serviceDetails/serviceDetails";
import PartnerTab from "@/utils/components/servicesComponents/partnerTab/PartnerTab";
import React from "react";
import Feedback from "@/utils/components/servicesComponents/feedbackComponent/feedback";
import AboutUsTab from "@/utils/components/servicesComponents/aboutUsTab/AboutUsTab";
import ServiceList from "@/utils/components/servicesComponents/serviceList/serviceList";
import { ImageSlider } from "@/utils/components/imageSlider/imageSlider";

const tfcTabData = [
  {
    id: "mission",
    title: "Notre mission",
    content:
      "Proposer des prestations de nettoyage après travaux (TFC) et réaménagement : élimination des poussières fines, nettoyages des surfaces, vitrification des sols si nécessaire, et remise en état pour livraison.",
  },
  {
    id: "vision",
    title: "Notre vision",
    content:
      "Assurer une transition propre et sans stress entre la fin du chantier et la remise des lieux, en garantissant sécurité et propreté irréprochable.",
  },
  {
    id: "philosophy",
    title: "Notre philosophie",
    content:
      "Organiser les opérations de fin de chantier avec méthode : tri des déchets, nettoyage technique, traitement des sols et surfaces, et vérification qualité avant livraison.",
  },
];

export const metadata = {
  title: "Nettoyage technique après travaux (TFC) — CCI",
  description:
    "Nettoyage technique après travaux : dépoussiérage, enlèvement de gravats, lavage des surfaces, traitement de tout types de sol et mur  et préparation avant livraison. Interventions pro et rapides. Finitions soignées. Satisfaction garantie.",
};

export default function Page() {
  const tfcImages = [
  { src: "/gallery/tfc/marbre.jpg", title: "tfc 1", description: "Service professionnel" },
  { src: "/gallery/tfc/tfc.webp", title: "tfc 2", description: "Entretien textile" },
  ];

  const localBusinessJSONLD = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "CCI",
    url: "https://cciservices.online/",
    logo: "https://cciservices.online/logo.png"
,
    telephone: "+216-98-557-766",
    address: { "@type": "PostalAddress", streetAddress: "06, rue galant de nuit, l'aouina,tunis", addressLocality: "Tunisie", addressCountry: "TN" },
  };
const serviceJSONLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://cciservices.online/nettoyage-apres-chantier", // identifiant unique pour cette page
  "name": "Nettoyage après chantier",
  "description":
    "Prestations de fin de chantier : nettoyage technique, enlèvement de gravats et préparation des locaux pour réception.",
  "url": "https://cciservices.online/nettoyage-apres-chantier", // URL de la page spécifique
  "provider": {
    "@type": "LocalBusiness",
    "name": "CCI",
    "url": "https://cciservices.online/", // URL principale du business
    "telephone": "+216-98-557-766",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "06 Rue Galant de nuit, El Aouina, Tunis",
      "addressLocality": "Tunis",
      "addressCountry": "TN"
    },
    "logo": "https://cciservices.online/logo.png"
  }
};

  return (
    <>
      <style>{`
        .responsive-padding { padding: 115px 0px; }
        @media (max-width: 900px) { .responsive-padding { padding: 60px 0px; } }
        @media (max-width: 600px) { .responsive-padding { padding: 0px 0px; } }
      `}</style>
      <HeroHeader title={"Travaux de fin de chantier (TFC)"} />
  <script type="application/ld+json">{JSON.stringify(localBusinessJSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title="Nettoyage technique après chantier"
          text="Nettoyage complet après travaux : dépoussiérage industriel, nettoyage des menuiseries, élimination des traces de peintures et enduits, lavage des sols et surfaces, et mise en conformité pour réception."
        />

        <Feedback />

        <ServiceDetails
          title="Gestion de réaménagement"
          text="Nous proposons aussi des services de remise en état post-rénovation et aide au réaménagement : enlèvement des gravats, nettoyage ciblé, et préparation des surfaces pour les finitions."
        />

        <AboutUsTab
          historyText="CCI intervient sur des chantiers de toutes tailles pour garantir une livraison propre et professionnelle."
          missionText="Offrir un service TFC rigoureux, sécurisé et respectueux des délais convenus."
          visionText="Être le partenaire fiable pour les entreprises du bâtiment et les particuliers lors de la phase finale des projets."
        />

        <PartnerTab tabData={tfcTabData} />

        <ServiceList
          title="Services TFC"
          text="Prestations complètes pour la remise en état post-chantiers."
          items={[
            { id: "1", text: "Dépoussiérage technique", icon: "/icons/polisher.png" },
            { id: "2", text: "Nettoyage sols et vitreries", icon: "/icons/polisher1.png" },
            { id: "3", text: "Enlèvement gravats", icon: "/icons/crystal3.png" },
            { id: "4", text: "Vérification qualité & livraison", icon: "/icons/shield.png" },
              { id: "5", text: "Entretien de tout type de sol", icon: "/icons/shield.png" },

          ]}
        />

        <ServiceDetails
          title="Pourquoi choisir nos service TFC"
          text="Méthodologie professionnelle, équipe professionnelle trés bien équipée et respect des normes de sécurité : nous assurons une livraison prête à l’usage."
        />

  <ImageSlider images={tfcImages} />
      </div>
    </>
  );
}
