import React, { Suspense } from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Actions from "./1-actions/actions";
import Welcome from "./2-welcoming/welcome";
import Form from "./3-form/form";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: 'Contactez CCI Tunisie | Appelez le +216 98 557 766 | Devis Gratuit Tunis',
    description: 'Contactez CCI Services à Tunis pour un devis gratuit ✆ +216 98 557 766 ✉ contact@cciservices.online 📍 06 Rue Galant de nuit, El Aouina. Réponse rapide garantie.',
    alternates: {
      canonical: `${SITE_URL}/contact`
    },
    openGraph: {
      title: 'Contactez CCI Tunisie | +216 98 557 766 | Devis Gratuit',
      description: 'Contactez CCI Services à Tunis pour un devis gratuit. Nettoyage moquettes, restauration marbre, tapisserie. Réponse sous 24h.',
      url: `${SITE_URL}/contact`,
      type: 'website'
    },
    twitter: {
      title: 'Contactez CCI Tunisie | +216 98 557 766 | Devis Gratuit',
      description: 'Contactez CCI Services à Tunis pour un devis gratuit. Nettoyage moquettes, restauration marbre, tapisserie. Réponse sous 24h.'
    }
  };
}

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
      <HeroHeader title="Contactez-nous -CCI Tunisie" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJSONLD) }}
      />
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>}>
        <Actions />
        <Welcome />
        <Form />
      </Suspense>
    </>
  );
}
