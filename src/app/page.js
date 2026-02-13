import { Suspense } from 'react';
import Home from "./home/home";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: "CCI Services Tunis | Nettoyage Professionnel Moquettes, Salons & Marbre | Devis Gratuit",
    description: "🏆 N°1 nettoyage professionnel à Tunis. Moquettes dès 5 DT/m², salons à domicile, polissage marbre. ✅ Résultats garantis ✅ Devis gratuit ☎ +216 98 557 766",
    keywords: "cci services, nettoyage professionnel tunisie, nettoyage moquette tunis, nettoyage salon tunis, restauration marbre tunis, polissage marbre tunisie, tapisserie tunisie, lavage tapis tunis, nettoyage canapé tunis",
    alternates: {
      canonical: SITE_URL
    },
    openGraph: {
      title: "CCI Services - N°1 Nettoyage Professionnel Tunis | Moquettes, Salons & Marbre",
      description: "Leader du nettoyage professionnel en Tunisie. Moquettes, salons, marbre. Devis gratuit et résultats garantis.",
      url: SITE_URL,
      type: "website",
      locale: "fr_TN",
      siteName: "CCI Services",
      images: [
        {
          url: `${SITE_URL}/home/1-hero/main.webp`,
          width: 1200,
          height: 630,
          alt: 'CCI Services - Nettoyage Professionnel Tunisie'
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "CCI Services - N°1 Nettoyage Professionnel Tunis",
      description: "Moquettes, salons, marbre. Devis gratuit ☎ +216 98 557 766",
      images: [`${SITE_URL}/home/1-hero/main.webp`]
    },
    other: {
      // Preload critical LCP images for mobile performance
      'link': [
        '</_next/image?url=%2Ffeedback%2Fcontent%20(2).jpeg&w=640&q=70>; rel=preload; as=image; fetchpriority=high',
        '</_next/image?url=%2Fhome%2F1-hero%2FlinesGlow.webp&w=640&q=40>; rel=preload; as=image'
      ].join(', ')
    }
  };
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>}>
      <Home />
    </Suspense>
  );
}
