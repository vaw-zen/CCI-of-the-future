
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader';
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails';
import ConseilsClient from './components/conseilsClient/conseilsClient';
import { getAllArticles } from './data/articles.js';
import styles from './conseils.module.css';

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
  // Server-side: get all articles for SSR link rendering
  const allArticles = getAllArticles();

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
      
      {/* Interactive client component for filters and article cards */}
      <Suspense fallback={
        <div style={{ 
          padding: '60px 20px', 
          textAlign: 'center',
          color: 'var(--t-secondary)' 
        }}>
          <div style={{ 
            fontSize: '1.2rem', 
            marginBottom: '10px' 
          }}>
            🔄 Chargement des articles...
          </div>
          <div style={{ 
            fontSize: '0.9rem' 
          }}>
            Préparation de nos guides d'expert
          </div>
        </div>
      }>
        <ConseilsClient />
      </Suspense>

      {/* 
        SSR article links for search engine crawlers.
        These are rendered server-side so Google sees all article URLs 
        in the initial HTML without needing JavaScript execution.
        Hidden visually since ConseilsClient handles the UI.
      */}
      <nav aria-label="Tous les articles" style={{ 
        position: 'absolute', 
        width: '1px', 
        height: '1px', 
        padding: 0, 
        margin: '-1px', 
        overflow: 'hidden', 
        clip: 'rect(0, 0, 0, 0)', 
        whiteSpace: 'nowrap', 
        borderWidth: 0 
      }}>
        <h2>Tous nos articles et guides</h2>
        <ul>
          {allArticles.map((article) => (
            <li key={article.id}>
              <Link href={`/conseils/${article.slug}`}>
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}