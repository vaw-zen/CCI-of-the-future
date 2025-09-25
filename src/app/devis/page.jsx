import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import DevisIntro from "./1-intro/devisIntro";
import DevisCalculator from "./2-calculator/devisCalculator";
import DevisForm from "./3-form/devisForm";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: 'Devis Gratuit — CCI Services',
    description: 'Obtenez votre devis gratuit et personnalisé pour tous nos services de nettoyage : marbre, moquettes, salons, post-chantier, bateaux et plus.',
    alternates: {
      canonical: `${SITE_URL}/devis`
    },
    openGraph: {
      title: 'Devis Gratuit — CCI Services',
      description: 'Obtenez votre devis gratuit et personnalisé pour tous nos services de nettoyage : marbre, moquettes, salons, post-chantier, bateaux et plus.',
      url: `${SITE_URL}/devis`,
      type: 'website'
    },
    twitter: {
      title: 'Devis Gratuit — CCI Services', 
      description: 'Obtenez votre devis gratuit et personnalisé pour tous nos services de nettoyage : marbre, moquettes, salons, post-chantier, bateaux et plus.'
    }
  };
}

export default function DevisPage() {

  const devisPageJSONLD = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Devis Gratuit CCI Services",
    "description": "Calculateur de devis gratuit pour services de nettoyage professionnel",
    "url": "https://cciservices.online/devis",
    "mainEntity": {
      "@type": "Service",
      "name": "Devis Gratuit Services de Nettoyage",
      "description": "Estimation gratuite et personnalisée pour tous nos services de nettoyage professionnel",
      "provider": {
        "@type": "LocalBusiness",
        "name": "CCI",
        "url": "https://cciservices.online/",
        "telephone": "+216-98-557-766",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "06 Rue Galant de nuit, El Aouina, Tunis",
          "addressLocality": "Tunis",
          "addressCountry": "TN"
        }
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TND",
        "description": "Devis gratuit et sans engagement"
      }
    }
  };

  return (
    <>
      <HeroHeader title="Devis Gratuit" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(devisPageJSONLD) }}
      />

      <DevisIntro />
      <DevisCalculator />
      <DevisForm />
    </>
  );
}