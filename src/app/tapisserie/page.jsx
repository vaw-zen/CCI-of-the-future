import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails'
import PartnerTab from '@/utils/components/servicesComponents/partnerTab/PartnerTab'
import React from 'react'
import Feedback from '@/utils/components/servicesComponents/feedbackComponent/feedback'
import AboutUsTab from '@/utils/components/servicesComponents/aboutUsTab/AboutUsTab'
import ServiceList from '@/utils/components/servicesComponents/serviceList/serviceList'
import { ImageSlider } from '@/utils/components/imageSlider/imageSlider'

const tapisserieTabData = [
  {
    id: 'mission',
    title: 'Notre mission',
    content: "Offrir des solutions de tapisserie sur mesure, du retapissage au rembourrage, en passant par le remplacement de mousse et la fourniture de tissus ignifuges pour bateaux et yachts. Nous nous engageons à garantir confort, sécurité et durabilité.",
 
  },
  {
    id: 'vision',
    title: 'Notre vision',
    content: "Être la référence en tapisserie sur mesure en Tunisie, reconnue pour notre savoir-faire, notre accompagnement personnalisé et notre capacité à valoriser chaque espace grâce à des matériaux et des finitions d’exception.",
    
  },
  {
    id: 'philosophy',
    title: 'Notre philosophie',
    content: "Trouver une solution à chaque défi technique, qu'il s'agisse de fixation, de structure bois ou de systèmes à remplacer, grâce à notre expertise et notre créativité.",
   
  }
]

export const metadata = {
  title: "Tapisserie sur mesure & Rénovation d'ameublement— CCI",
  description:
    "Retapissage, remplacement de mousse et rembourrage sur mesure pour canapés, banquettes et nautisme. Tissus ignifuges et finitions soignées.",
};

export default function Page() {
   const tapisserieImages = [
  { src: "/gallery/tapisserie/tapisserie1.jpg", title: "tapisserie 1", description: "Service professionnel" },
  { src: "/gallery/tapisserie/tapisserie2.jpg", title: "tapisserie 2", description: "Entretien textile" },
  { src: "/gallery/tapisserie/tapisserie3.jpg", title: "tapisserie 3", description: "Anti-acariens" },
  { src: "/gallery/tapisserie/tapisserie4.jpg", title: "tapisserie 4", description: "Nettoyage rapide" },
  { src: "/gallery/tapisserie/tapisserie5.jpg", title: "tapisserie 5", description: "Résultat impeccable" },
  { src: "/gallery/tapisserie/tapisserie6.jpg", title: "tapisserie 6", description: "Confort préservé" },
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
  "@id": "https://cciservices.online/tapisserie", // identifiant unique pour cette page
  "name": "Services de tapisserie",
  "description":
    "Retapissage, remplacement de mousse, rembourrage et fourniture de tissus ignifuges pour bateaux et yachts. Solutions sur mesure pour mobiliers et sièges.",
  "url": "https://cciservices.online/tapisserie", // URL de la page spécifique
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
      <HeroHeader title={'Tapisserie'} />
  <script type="application/ld+json">{JSON.stringify(localBusinessJSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(serviceJSONLD)}</script>
      <div className="responsive-padding">
    <ServiceDetails
  title="Services de tapisserie"
  text="CCI propose des services de tapisserie sur mesure adaptés à vos besoins : retapissage de sièges et banquettes, remplacement de mousse, rembourrage professionnel et fourniture de tissus ignifuges spécialement conçus pour bateaux, yachts et espaces publics. Le saviez-vous ? Le choix d’une mousse de densité adaptée améliore non seulement le confort mais aussi la durée de vie de vos assises. De plus, les tissus ignifuges que nous utilisons respectent des normes de sécurité strictes, essentielles dans le secteur nautique ou hôtelier. En choisissant CCI, vous bénéficiez d’un tapissier professionnel qui allie savoir-faire artisanal et matériaux certifiés pour des résultats soignés, esthétiques et durables. Confiez-nous vos projets de rénovation ou d’aménagement : vos sièges, banquettes et mobiliers retrouveront confort, élégance et valeur ajoutée."
/>

<Feedback />

<ServiceDetails
  title="Notre expertise"
  text="Grâce à notre expertise en tapisserie nautique, résidentielle et professionnelle, nous intervenons sur tous types de supports – bois, métal, plastique ou composites – en proposant des solutions adaptées à chaque projet. Chaque matériau requiert une technique spécifique : par exemple, une banquette en structure métallique demandera un rembourrage différent d’un fauteuil en bois massif. Pour garantir la durabilité, nous utilisons des mousses haute résilience, des tissus hydrofuges et anti-UV, parfaits pour résister aux environnements marins ou extérieurs. Notre accompagnement personnalisé couvre chaque étape, de la conception à la réalisation, en intégrant vos attentes esthétiques, techniques et budgétaires. Avec CCI, vous profitez d’un service de tapisserie haut de gamme, de conseils pratiques pour entretenir vos assises et de solutions durables qui valorisent vos espaces intérieurs comme extérieurs."
/>

          <PartnerTab tabData={tapisserieTabData} />
        <AboutUsTab
          historyText="Depuis sa création, CCI s’est spécialisée dans la tapisserie sur mesure pour répondre aux besoins des particuliers, professionnels et du secteur nautique. Notre histoire est marquée par la passion du travail bien fait et l’innovation dans les techniques de tapisserie."
          missionText="Notre mission est d’offrir des solutions de tapisserie de haute qualité : retapissage, remplacement de mousse, rembourrage et fourniture de tissus ignifuges pour bateaux et yachts. Nous nous engageons à garantir confort, sécurité et durabilité à nos clients."
          visionText="Être la référence en tapisserie sur mesure en Tunisie, reconnue pour notre savoir-faire, notre accompagnement personnalisé et notre capacité à valoriser chaque espace grâce à des matériaux et des finitions d’exception."
        />

        <ServiceList 
        title='Nos solutions' text="Des solutions de tapisserie adaptées à tous vos besoins"
  items={[
    { id: '1', text: 'Retapissage de tout type de tapisserie', icon: '/icons/needle.png' },
    { id: '2', text: 'Remplacement de mousse', icon: '/icons/sponge.png' },
    { id: '3', text: 'Rembourrage sur mesure', icon: '/icons/sofa.png' },
    { id: '4', text: 'Fourniture tissus ignifuges M1', icon: '/icons/no-fire.png' },
    { id: '5', text: 'Confection sur mesure', icon: '/icons/measuring-tape.png' },
    { 
      id: '6', 
      text: "Solutions techniques", 
      icon: '/icons/repair-tools.png' 
    }
  ]}/>
  <ImageSlider images={tapisserieImages} />
      </div>
    </>
  )
}
