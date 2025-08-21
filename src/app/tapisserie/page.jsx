import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails'
import PartnerTab from '@/utils/components/servicesComponents/partnerTab/PartnerTab'
import React from 'react'
import Feedback from '@/utils/components/servicesComponents/feedbackComponent/feedback'
import AboutUsTab from '@/utils/components/servicesComponents/aboutUsTab/AboutUsTab'
import ServiceList from '@/utils/components/servicesComponents/serviceList/serviceList'

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
      <HeroHeader title={'Tapisserie'} />
      <div className="responsive-padding">
        <ServiceDetails
          title="Services de tapisserie"
          text="CCI propose des services de tapisserie sur mesure pour tous vos besoins : retapissage, remplacement de mousse, rembourrage et fourniture de tissus ignifuges pour bateaux et yachts. Notre équipe expérimentée garantit un travail soigné, durable et conforme aux normes de sécurité. Confiez-nous la rénovation ou l’aménagement de vos sièges, banquettes ou mobiliers pour un résultat à la hauteur de vos attentes."
        />
        <Feedback />
        <ServiceDetails
          title="Notre expertise"
          text="Nous intervenons sur tous types de supports et proposons des solutions adaptées à chaque projet, que ce soit pour des particuliers, des professionnels ou le secteur nautique. Nous sélectionnons des matériaux de qualité et assurons un accompagnement personnalisé, de la conception à la réalisation. Faites confiance à CCI pour valoriser et protéger vos espaces grâce à notre savoir-faire en tapisserie."
        />
        <AboutUsTab
          historyText="Depuis sa création, CCI s’est spécialisée dans la tapisserie sur mesure pour répondre aux besoins des particuliers, professionnels et du secteur nautique. Notre histoire est marquée par la passion du travail bien fait et l’innovation dans les techniques de tapisserie."
          missionText="Notre mission est d’offrir des solutions de tapisserie de haute qualité : retapissage, remplacement de mousse, rembourrage et fourniture de tissus ignifuges pour bateaux et yachts. Nous nous engageons à garantir confort, sécurité et durabilité à nos clients."
          visionText="Être la référence en tapisserie sur mesure en Tunisie, reconnue pour notre savoir-faire, notre accompagnement personnalisé et notre capacité à valoriser chaque espace grâce à des matériaux et des finitions d’exception."
        />
        <PartnerTab tabData={tapisserieTabData} />

        <ServiceList 
  items={[
    { id: '1', text: 'Retapissage de tout type de tapisserie', icon: '/icons/needle.png' },
    { id: '2', text: 'Remplacement de mousse', icon: '/icons/sponge.png' },
    { id: '3', text: 'Rembourrage sur mesure', icon: '/icons/sofa.png' },
    { id: '4', text: 'Fourniture tissus ignifuges M1', icon: '/icons/no-fire.png' },
    { id: '5', text: 'Confection sur mesure', icon: '/icons/measuring-tape.png' },
    { 
      id: '6', 
      text: "Solutions techniques.", 
      icon: '/icons/repair-tools.png' 
    }
  ]}/>
      </div>
    </>
  )
}
