import HeroHeader from '@/utils/components/reusableHeader/HeroHeader';
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails';
import ConseilsClient from './components/ConseilsClient';
import styles from './conseils.module.css';
export const metadata = {
  title: 'Conseils Nettoyage & Rénovation Tunis | Blog Expert CCI Services',
  description: 'Guides complets, tutoriels et conseils d\'expert en nettoyage tapis, ponçage marbre et retapissage salon à Tunis. Astuces professionnelles et tarifs 2025.',
  keywords: 'conseils nettoyage tunis, guide tapis, ponçage marbre, retapissage salon, blog nettoyage professionnel',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/conseils`
  },
  openGraph: {
    title: 'Conseils Nettoyage & Rénovation Tunis | CCI Services',
    description: 'Guides, tutoriels et conseils d\'expert en nettoyage et rénovation à Tunis.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/conseils`,
    type: 'website',
    locale: 'fr_TN',
    siteName: 'CCI Services Tunis',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/og-conseils.png`,
        width: 1200,
        height: 630,
        alt: 'Conseils nettoyage professionnel Tunis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conseils Nettoyage & Rénovation Tunis | CCI Services',
    description: 'Guides, tutoriels et conseils d\'expert en nettoyage et rénovation à Tunis.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/og-conseils.png`],
  }
};

// Schema markup pour la page conseils
const conseilsPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Conseils & Guides Nettoyage Professionnel Tunis",
  "description": "Guides complets et conseils d'expert en nettoyage tapis, ponçage marbre et retapissage salon à Tunis par CCI Services.",
  "url": "https://cciservices.online/conseils",
  "publisher": {
    "@type": "LocalBusiness",
    "name": "CCI Services",
    "telephone": "+216-98-557-766",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "06 Rue Galant de nuit",
      "addressLocality": "L'Aouina",
      "addressRegion": "Tunis",
      "postalCode": "2045",
      "addressCountry": "TN"
    }
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://cciservices.online"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Conseils & Guides",
        "item": "https://cciservices.online/conseils"
      }
    ]
  },
  "about": [
    {
      "@type": "Service",
      "name": "Nettoyage Tapis et Moquettes Tunis",
      "serviceType": "Nettoyage professionnel"
    },
    {
      "@type": "Service",
      "name": "Ponçage et Cristallisation Marbre",
      "serviceType": "Rénovation marbre"
    },
    {
      "@type": "Service",
      "name": "Retapissage Salon",
      "serviceType": "Rénovation mobilier"
    }
  ]
};

export default function ConseilsPage() {
  return (
    <main className={styles.main}>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(conseilsPageSchema) }}
      />

      {/* Hero section */}
      <HeroHeader title={'Conseils & Guides d\'Expert'} />

      <ServiceDetails 
        title={"Découvrez nos articles et guides d'expert"} 
        text={"Plongez dans nos conseils professionnels pour le nettoyage de tapis, le ponçage de marbre et le retapissage de salons. Des astuces pratiques, des tutoriels détaillés et des recommandations d'entretien pour prolonger la vie de vos biens. Tout ce que vous devez savoir sur le nettoyage et la rénovation à Tunis. Techniques professionnelles, tarifs 2025 et astuces d'entretien."} 
        image={"/home/cleaning-tunis.jpg"} 
        imageAlt={"Conseils nettoyage professionnel Tunis"} 
      />
      
      {/* Composant client pour les filtres et articles */}
      <ConseilsClient />
    </main>
  );
}