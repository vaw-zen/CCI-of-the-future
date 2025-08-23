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

export default function Page() {
  const sliderImages = [
    { src: '/home/1.webp', title: 'Before', description: 'Before restoration' },
    { src: '/home/3.webp', title: 'During', description: 'Work in progress' },
    { src: '/home/4.webp', title: 'After', description: 'Final result' },
    { src: '/home/4.webp', title: 'After', description: 'Final result' },
  ];
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
        <AboutUsTab
          historyText="Depuis sa création, CCI s’est spécialisée dans la restauration et l’entretien du marbre et du carrelage pour répondre aux besoins des particuliers et des professionnels. Notre histoire est marquée par la passion du travail bien fait et l’innovation dans les techniques de traitement des surfaces."
          missionText="Notre mission est d’offrir des solutions de restauration et d’entretien de haute qualité pour le marbre et le carrelage : ponçage, lustrage, cristallisation et protection. Nous nous engageons à garantir beauté, durabilité et sécurité à nos clients."
          visionText="Être la référence en Tunisie pour la rénovation et la préservation du marbre, reconnue pour notre savoir-faire, notre accompagnement personnalisé et la qualité de nos finitions."
        />
        <PartnerTab tabData={marbreTabData} />
        <ServiceList
          title="Nos services marbre"
          text="Des solutions professionnelles pour la restauration et l’entretien du marbre."
          items={[
            { id: "1", text: "Ponçage", icon: "/icons/polisher.png" },
            { id: "2", text: "Lustrage", icon: "/icons/polisher1.png" },
            { id: "3", text: "Cristallisation", icon: "/icons/crystal3.png" },
            { id: "4", text: "Protection", icon: "/icons/shield.png" },
          ]}
        />
 <ServiceDetails
          title="Restauration et entretien de marbre"
          text="CCI vous propose des services spécialisés pour la restauration et l’entretien de vos surfaces en marbre et carrelage : ponçage, lustrage, cristallisation et protection. Notre équipe utilise des techniques professionnelles et des produits adaptés pour redonner éclat, brillance et durabilité à vos sols et surfaces. Confiez-nous vos projets pour un résultat haut de gamme et durable."
        />
        <ImageSlider
          images={sliderImages}
          autoPlay={true}
          interval={4000}
          showThumbnails={true}
          showDots={true}
          startIndex={0}
        />
      </div>
    </>
  );
}
