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

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: "Nettoyage de Tapis & Moquettes — CCI",
    description: "Nettoyage professionnel de tapis et moquettes : shampooing, détachage, désinfection et traitement anti-acariens. Intervention rapide en Tunisie.",
    alternates: {
      canonical: `${SITE_URL}/tapis`
    },
    openGraph: {
      title: "Nettoyage de Tapis & Moquettes — CCI",
      description: "Nettoyage professionnel de tapis et moquettes : shampoinage, détachage, désinfection et traitement anti-acariens. Intervention rapide en Tunisie.",
      url: `${SITE_URL}/tapis`,
      type: 'website'
    },
    twitter: {
      title: "Nettoyage de Tapis & Moquettes — CCI",
      description: "Nettoyage professionnel de tapis et moquettes : shampoinage, détachage, désinfection et traitement anti-acariens. Intervention rapide en Tunisie."
    }
  };
}

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
    logo: "https://cciservices.online/logo.png"
,
    telephone: "+216-98-557-766",
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
  "@id": "https://cciservices.online/tapis-moquettes", // identifiant unique pour cette page
  "name": "Nettoyage de tapis et moquettes",
  "description":
    "Shampooing, détachage et désinfection pour tapis et moquettes, avec méthodes adaptées aux fibres et séchage rapide.",
  "url": "https://cciservices.online/tapis-moquettes", // URL de cette page spécifique
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
  <HeroHeader title={"Nettoyage tapis et moquette"} />
  <script type="application/ld+json">{JSON.stringify(localBusinessJSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(serviceJSONLD)}</script>
      <div className="responsive-padding">
        <ServiceDetails
          title="Nettoyage professionnel de tapis"
              text={"Diagnostic de la fibre (laine, polyamide B1, polypropylène bouclé, velours coupé) et repérage des zones à trafic (couloirs, plateaux open‑space), suivis d’une pré‑aspiration haute filtration (HEPA) anti‑particulaire puis d’un pré‑détachage sélectif (tanins, graisses, protéines, chewing‑gum avec gel enzymatique). Selon le niveau d’encrassement et les contraintes d’exploitation, nous appliquons l’injection‑extraction (rinçage contrôlé, récupération >90 % d’humidité) pour les salissures profondes, l’encapsulation polymère basse humidité pour les centres d’appel nécessitant une remise en service rapide (< 1 h), le bonnet / pad orbital pour un rafraîchissement intermédiaire sur grandes surfaces, ou ponctuellement la vapeur sèche localisée pour la désodorisation et la réduction de la charge microbienne dans les zones sensibles. Résultat : remontée limitée des salissures, fibres redressées et temps d’indisponibilité réduit."}
        />
        <Feedback />
        <ServiceDetails
          title="Notre expertise"
            text={"Adaptation par secteur :\n• Bureaux & open‑space : protocole cyclique (entretien préventif + corrective deep clean trimestriel).\n• Centres d’appel : intervention en fenêtres nocturnes avec encapsulation faible humidité pour reprise immédiate des postes.\n• Salles de cinéma : gestion taches grasses + boissons sucrées + neutralisation odeurs (enzymes + oxygène actif stabilisé).\n• Mosquées : traitement des zones de prière (désinfection douce, anti‑acariens, respect des personnes sensibles), orientation des fibres sans trace. Protection optionnelle anti‑taches / anti-salissure re‑déposée et plan de maintenance documenté."}
        />
        <AboutUsTab
          historyText="Depuis notre création, nous nous sommes spécialisés dans l’entretien textile et le nettoyage professionnel de tapis et moquettes, au service des particuliers et des entreprises."
          missionText="Offrir des nettoyages performants, sûrs pour la santé et respectueux des matériaux, tout en garantissant un service rapide et soigné."
          visionText="Être le partenaire de confiance pour tous les besoins de nettoyage textile, avec des solutions innovantes et durables."
        />
        <PartnerTab tabData={tapisTabData} />
        <ServiceList
          title="Nos services tapis & moquettes"
            text="Solutions spécialisées pour moquettes en environnements exigeants : réduction du temps d’arrêt, maîtrise des allergènes dans espaces fermés, neutralisation des odeurs persistantes (cinéma / forte occupation), protocoles adaptés lieux de culte (respect sanitaire & discrétion), plans de maintenance prédictifs pour limiter usure en zones de trafic." 
          items={[
            { id: "6", text: "Maintenance bureaux & centres d’appel", icon: "/icons/shield.png" },
            { id: "3", text: "Traitement anti‑acariens & bio‑charge réduite", icon: "/icons/crystal3.png" },
              { id: "1", text: "Injection‑extraction profonde", icon: "/icons/polisher.png" },
              { id: "2", text: "Encapsulation basse humidité ", icon: "/icons/polisher1.png" },
              { id: "4", text: "Neutralisation odeurs cinéma ", icon: "/icons/shield.png" },
              { id: "5", text: "Entretien mosquées ", icon: "/icons/shield.png" },
          ]}
        />

        <ServiceDetails
          title="Pourquoi choisir CCI pour vos tapis"
         text={"Chaîne de valeur structurée : audit initial (cartographie trafic / points critiques), mesure humidité résiduelle post‑traitement, contrôle pH pour stabilité colorimétrique, fiches produits disponibles (conformité & sécurité). Matériel : injecteurs bi‑turbine haut débit, machines orbitales basse vitesse, pads microfibre encapsulation, buses chewing‑gum spot. Objectifs : prolonger la durée de vie (retarder écrasement), réduire charges allergènes, optimiser l’image des espaces accueillant public ou collaborateurs. Intervention discrète, traçabilité et conseils préventifs inclus."}
        />
  <ImageSlider images={tapisImages} />
      </div>
    </>
  );
}
