import { Suspense } from 'react';
import Home from "./home/home";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: "CCI Services | Nettoyage Professionnel à Tunis - Moquettes, Salons & Marbre | Devis Gratuit",
    description: "🏆 CCI Services - Leader nettoyage professionnel Tunis. Spécialistes moquettes, salons, marbre. Devis gratuit ✅ +216 98 557 766",
    keywords: "cci services, nettoyage professionnel tunisie, nettoyage moquette tunis, nettoyage salon tunis, restauration marbre tunis, polissage marbre tunisie, tapisserie tunisie, nettoyage post chantier tunis",
    alternates: {
      canonical: SITE_URL
    },
    openGraph: {
      title: "CCI Services - Leader Nettoyage Professionnel Tunis & Restauration Marbre",
      description: "CCI Services : Leader du nettoyage professionnel à Tunis. Moquettes, salons, marbre. Devis gratuit.",
      url: SITE_URL,
      type: "website",
      locale: "fr_TN",
      siteName: "CCI Services - Nettoyage"
    },
    twitter: {
      card: "summary_large_image",
      title: "CCI Services - Nettoyage Professionnel Tunis",
      description: "CCI Services - Leader du nettoyage professionnel en Tunisie. Devis gratuit."
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
