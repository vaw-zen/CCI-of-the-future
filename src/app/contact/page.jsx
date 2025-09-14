import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Actions from "./1-actions/actions";
import Welcome from "./2-welcoming/welcome";
import Form from "./3-form/form";


export const metadata = {
  title: 'Contact & Devis — CCI',
  description: 'Contactez CCI pour un devis gratuit : polissage marbre, nettoyage moquettes, tapisserie et nettoyages post-chantier.',
};

const contactImages = ['/home/1.webp','/home/3.webp'];
export default function ContactPage() {
  const socials = {
    facebook: "https://www.facebook.com/your-profile",
    twitter: "https://twitter.com/your-profile",
    linkedin: "https://www.linkedin.com/in/your-profile",
    instagram: "https://www.instagram.com/your-profile",
  };

  return (
    <>
      <HeroHeader title="Contact Us" />
      <script type="application/ld+json">{JSON.stringify({
        "@context":"https://schema.org",
        "@type":"ContactPage",
        "mainEntity":{
          "@type":"Organization",
          name: "CCI",
          url: "https://cciservices.online",
          contactPoint: [{
            "@type": "ContactPoint",
            telephone: "+216-XX-XXX-XXX",
            contactType: "customer service",
            areaServed: "TN"
          }]
        }
      })}</script>
      <Actions />
      <Welcome/>
      <Form/>
   
    </>
  );
}
