import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ServiceDetails from "@/utils/components/servicesComponents/serviceDetails/serviceDetails";
import PartnerTab from "@/utils/components/servicesComponents/partnerTab/PartnerTab";
import React from "react";
import Feedback from "@/utils/components/servicesComponents/feedbackComponent/feedback";
import AboutUsTab from "@/utils/components/servicesComponents/aboutUsTab/AboutUsTab";
import ServiceList from "@/utils/components/servicesComponents/serviceList/serviceList";
import { ImageSlider } from "@/utils/components/imageSlider/imageSlider";

const marbreTabData = [
  {
    id: "mission",
    title: "Notre mission",
    content:
      "Proposer des solutions complètes pour la restauration et l’entretien du marbre et du carrelage : ponçage, lustrage, cristallisation et protection. Nous nous engageons à garantir la beauté, la durabilité et la sécurité de vos surfaces.",
  },
  {
    id: "vision",
    title: "Notre vision",
    content:
      "Être la référence en Tunisie pour la rénovation et la préservation du marbre, reconnue pour notre expertise, notre accompagnement personnalisé et la qualité de nos finitions.",
  },
  {
    id: "philosophy",
    title: "Notre philosophie",
    content:
      "Trouver une solution à chaque défi technique, qu’il s’agisse de taches, de rayures, de fissures ou de protection, grâce à notre savoir-faire et à l’utilisation de techniques professionnelles.",
  },
  
];

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: "Restauration, Ponçage, Lustrage, Polissage, Protection & cristallisation du Marbre — CCI",
    description: "Restauration professionnelle du marbre : ponçage, polissage, cristallisation et protections pour sols et plans de travail. Devis gratuit.",
    alternates: {
      canonical: `${SITE_URL}/marbre`
    },
    openGraph: {
      title: "Restauration, Ponçage, Lustrage, Polissage, Protection & cristallisation du Marbre — CCI",
      description: "Restauration professionnelle du marbre : ponçage, polissage, cristallisation et protections pour sols et plans de travail. Devis gratuit.",
      url: `${SITE_URL}/marbre`,
      type: 'website'
    },
    twitter: {
      title: "Restauration, Ponçage, Lustrage, Polissage, Protection & cristallisation du Marbre — CCI",
      description: "Restauration professionnelle du marbre : ponçage, polissage, cristallisation et protections pour sols et plans de travail. Devis gratuit."
    }
  };
}

export default function Page() {
  const marbreImages = [
     // { src: "/gallery/moquette/moquette2.jpg", title: "Moquette 2", description: "Entretien textile" },
  { 
    src: "/gallery/marbre/marbre.jpg", 
    title: "Cristallisation Sol Marbre", 
    description: "Cristallisation professionnelle sol marbre. Ponçage, polissage et protection pour brillance durable et résistance aux taches." 
  },
  { 
    src: "/gallery/marbre/marbre1.png", 
    title: "Polissage Plan Travail Marbre", 
    description: "Restoration plan de travail marbre cuisine. Ponçage fins, lustrage et traitement hydrofuge pour usage alimentaire." 
  },
  ];

  const localBusinessJSONLD = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
     "provider": {
    "@type": "LocalBusiness",
    "name": "CCI",
    "url": "https://cciservices.online/" // keep your main business URL here
  },
    logo: "https://cciservices.online/logo.png"
,
    telephone: "+216-98-557-766",
    address: {
      "@type": "PostalAddress",
      streetAddress: "06 Rue Galant de nuit, El Aouina,Tunis",
      addressLocality: "Tunisie",
      addressCountry: "TN",
    },
  };

const serviceJSONLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://cciservices.online/marbre", // identifiant unique pour cette page
  "name": "Restauration du marbre",
  "description":
    "Ponçage, polissage, cristallisation et protection des surfaces en marbre pour particuliers et professionnels.",
  "url": "https://cciservices.online/marbre", // URL de cette page spécifique
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
  <HeroHeader title={"Marbre"} />
  <script type="application/ld+json">{JSON.stringify(localBusinessJSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title="Restauration et entretien de marbre"
          text="CCI vous propose des services spécialisés pour la restauration et l’entretien de vos surfaces en marbre et carrelage : ponçage, lustrage, cristallisation et protection. Notre équipe utilise des techniques professionnelles et des produits adaptés pour redonner éclat, brillance et durabilité à vos sols et surfaces. Confiez-nous vos projets pour un résultat haut de gamme et durable."
        />
        <Feedback />
        <ServiceDetails
          title="Notre expertise"
          text="Notre équipe maîtrise toutes les étapes de la restauration et de l’entretien du marbre : du diagnostic précis à la mise en œuvre des techniques les plus adaptées, nous assurons un accompagnement personnalisé pour chaque projet. Nous utilisons des matériaux et équipements de qualité afin de garantir la durabilité, la brillance et la protection optimale de vos surfaces. Faites confiance à CCI pour redonner vie et éclat à vos sols, escaliers ou plans de travail."
        />
          <PartnerTab tabData={marbreTabData} />
        <AboutUsTab
          historyText="Depuis sa création, CCI s’est spécialisée dans la restauration et l’entretien du marbre et du carrelage pour répondre aux besoins des particuliers et des professionnels. Notre histoire est marquée par la passion du travail bien fait et l’innovation dans les techniques de traitement des surfaces."
          missionText="Notre mission est d’offrir des solutions de restauration et d’entretien de haute qualité pour le marbre et le carrelage : ponçage, lustrage, cristallisation et protection. Nous nous engageons à garantir beauté, durabilité et sécurité à nos clients."
          visionText="Être la référence en Tunisie pour la rénovation et la préservation du marbre, reconnue pour notre savoir-faire, notre accompagnement personnalisé et la qualité de nos finitions."
        />
        <ServiceList
          title="Nos services pour l'entretien et la réstauration marbre"
          text="Des solutions professionnelles pour la restauration et l’entretien du marbre."
          items={[
            { id: "1", text: "Ponçage", icon: "/icons/polisher.png" },
            { id: "2", text: "Lustrage", icon: "/icons/polisher1.png" },
            { id: "3", text: "Cristallisation", icon: "/icons/crystal3.png" },
            { id: "4", text: "Protection", icon: "/icons/shield.png" },
            { id: "5", text: "Réstauration", icon: "/icons/shield.png" },
             { id: "6", text: "Ebauche", icon: "/icons/shield.png" },
          ]}
        />
 {/* <ServiceDetails
          title="Restauration et entretien de marbre"
          text="CCI vous propose des services spécialisés pour la restauration et l’entretien de vos surfaces en marbre et carrelage : ponçage, lustrage, cristallisation et protection. Notre équipe utilise des techniques professionnelles et des produits adaptés pour redonner éclat, brillance et durabilité à vos sols et surfaces. Confiez-nous vos projets pour un résultat haut de gamme et durable."
        /> */}
  <ImageSlider images={marbreImages} />
      </div>
    </>
  );
}
