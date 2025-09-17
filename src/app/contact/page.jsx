import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Actions from "./1-actions/actions";
import Welcome from "./2-welcoming/welcome";
import Form from "./3-form/form";

export const metadata = {
  title: 'Contact & Devis — CCI',
  description: 'Contactez CCI pour un devis gratuit : polissage marbre, nettoyage moquettes, tapisserie et nettoyages post-chantier.',
};

export default function ContactPage() {

  const contactPageJSONLD = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "CCI",
      "url": "https://cciservices.online/contact",
      "logo": "https://cciservices.online/logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "06 Rue Galant de nuit, El Aouina, Tunis",
        "addressLocality": "Tunis",
        "addressCountry": "TN"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+216-98-557-766",
          "contactType": "customer service",
          "areaServed": "TN"
        },
        {
          "@type": "ContactPoint",
          "email": "contact@cciservices.online",
          "contactType": "customer service",
          "areaServed": "TN"
        }
      ],
      "sameAs": [
         "https://www.facebook.com/Chaabanes.Cleaning.Intelligence/",
      "https://www.instagram.com/cci.services/",
      "https://www.linkedin.com/company/chaabanes-cleaning-int/"
      ]
    }
  };

  return (
    <>
      <HeroHeader title="Contact Us" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJSONLD) }}
      />

      <Actions />
      <Welcome />
      <Form />
    </>
  );
}
