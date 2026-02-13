import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import DevisIntro from "./1-intro/devisIntro";
import DevisCalculator from "./2-calculator/devisCalculator";
import DevisForm from "./3-form/devisForm";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: 'Devis Gratuit Nettoyage Tunis | Simulateur Prix Instantané - CCI Services',
    description: '🎯 Calculez votre devis nettoyage en ligne en 2 min ! Prix transparent : salon dès 35 DT, tapis dès 5 DT/m², polissage marbre dès 8 DT/m². Résultat instantané, sans engagement. ✆ +216 98 557 766',
    keywords: 'devis nettoyage tunis, simulateur tarif nettoyage, devis gratuit nettoyage tunisie, prix nettoyage salon tunisie, prix polissage marbre tunisie, combien coûte nettoyage tapis tunis, devis en ligne nettoyage',
    alternates: {
      canonical: `${SITE_URL}/devis`
    },
    openGraph: {
      title: 'Devis Gratuit Nettoyage Tunis | Simulateur Prix Instantané',
      description: '🎯 Calculez votre devis nettoyage en ligne ! Prix transparent pour salon, marbre, tapis, moquette. Résultat instantané sans engagement.',
      url: `${SITE_URL}/devis`,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/images/devis-simulator-og.jpg`,
          width: 1200,
          height: 630,
          alt: 'Simulateur de devis nettoyage CCI Services Tunisie'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Simulateur Devis Nettoyage Tunisie | Prix Transparent', 
      description: '🎯 Premier simulateur en ligne en Tunisie ! Prix instantanés et transparents pour tous vos besoins de nettoyage. Devis gratuit en quelques clics.'
    }
  };
}

export default function DevisPage() {

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  const devisPageJSONLD = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Simulateur de Devis Nettoyage en Ligne - Tunisie",
    "description": "Premier simulateur de devis instantané en Tunisie pour services de nettoyage professionnel. Prix transparents et détaillés, résultats immédiats sans attente.",
    "url": `${SITE_URL}/devis`,
    "inLanguage": "fr-TN",
    "isPartOf": {
      "@type": "WebSite",
      "name": "CCI Services",
      "url": SITE_URL
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Accueil",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Simulateur de Devis",
          "item": `${SITE_URL}/devis`
        }
      ]
    },
    "mainEntity": {
      "@type": "Service",
      "name": "Simulateur de Devis Nettoyage Instantané",
      "description": "Premier et seul service en Tunisie à afficher les prix de nettoyage de manière transparente avec simulation instantanée. Aucune surprise, prix clairs avant commande.",
      "serviceType": "Simulateur de devis:Prix Nettoyage Professionnel pour chaque service",
      "areaServed": {
        "@type": "City",
        "name": "Tunis",
        "containedIn": {
          "@type": "Country",
          "name": "Tunisie"
        }
      },
      "provider": {
        "@type": "LocalBusiness",
        "name": "CCI Services",
        "url": SITE_URL,
        "telephone": "+216-98-557-766",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "06 Rue Galant de nuit, El Aouina",
          "addressLocality": "Tunis",
          "addressCountry": "TN"
        }
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TND",
        "description": "Devis gratuit et instantané - Premier service en Tunisie avec transparence totale des prix",
        "availability": "https://schema.org/InStock"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services de Nettoyage avec Prix Transparents",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Nettoyage et Lavage de Salon"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Polissage et Cristallisation de Marbre"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Nettoyage de Tapis et Moquettes"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Nettoyage Post-Chantier"
            }
          }
        ]
      }
    }
  };

  const faqJSONLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Combien coûte le nettoyage de salon en Tunisie ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le prix du nettoyage de salon varie selon le nombre de places et le type de tissu. Utilisez notre simulateur pour obtenir un prix instantané et transparent. CCI Services est le premier en Tunisie à afficher ses tarifs de manière claire, sans surprise."
        }
      },
      {
        "@type": "Question",
        "name": "Comment fonctionne le simulateur de devis en ligne ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Notre simulateur est simple : sélectionnez votre service (salon, marbre, tapis), indiquez les dimensions ou quantités, et obtenez instantanément votre devis détaillé. Aucune attente, résultats immédiats avec prix transparent."
        }
      },
      {
        "@type": "Question",
        "name": "Quel est le prix du polissage de marbre à Tunis ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le tarif de polissage et cristallisation de marbre est calculé au m². Utilisez notre simulateur de devis pour une estimation précise et immédiate selon votre surface. Prix transparents garantis, innovation unique en Tunisie."
        }
      },
      {
        "@type": "Question",
        "name": "Proposez-vous le nettoyage de salon à domicile ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, nous offrons un service de nettoyage de salon et canapé à domicile dans toute la région de Tunis. Notre simulateur vous permet de calculer instantanément le prix selon le nombre de places et le type de tissu. Service professionnel avec équipement spécialisé."
        }
      },
      {
        "@type": "Question",
        "name": "Faites-vous l'entretien et la restauration de marbre ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolument ! Nous proposons l'entretien régulier, la restauration, le polissage, la cristallisation et le détartrage de marbre. Notre simulateur calcule le prix au m² pour chaque service. Expertise professionnelle garantie pour redonner l'éclat à vos sols en marbre."
        }
      },
      {
        "@type": "Question",
        "name": "Le nettoyage de moquette est-il professionnel ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, notre service de nettoyage de moquette professionnel utilise des équipements industriels et produits écologiques. Le simulateur vous donne un prix instantané selon la surface en m². Nous traitons aussi les tapis avec la même expertise professionnelle."
        }
      },
      {
        "@type": "Question",
        "name": "Le devis en ligne est-il vraiment gratuit et sans engagement ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, notre simulateur de devis est 100% gratuit et sans engagement. Vous connaissez le prix exact avant de commander, aucune surprise. C'est notre engagement de transparence, premier du genre en Tunisie."
        }
      },
      {
        "@type": "Question",
        "name": "Quels services puis-je simuler avec le simulateur de devis ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vous pouvez simuler les prix pour : nettoyage de salon (canapé, fauteuils), polissage de marbre, nettoyage de tapis et moquettes, nettoyage post-chantier, nettoyage de bateaux, et plus. Tous avec tarifs transparents et instantanés."
        }
      },
      {
        "@type": "Question",
        "name": "Pourquoi CCI Services affiche ses prix en ligne ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nous sommes pionniers en Tunisie dans la transparence tarifaire. Nous croyons que vous devez connaître le prix avant de commander, sans surprise ni négociation. Notre simulateur révolutionne le secteur du nettoyage avec des prix clairs et honnêtes."
        }
      }
    ]
  };

  return (
    <>
      <HeroHeader title="Simulateur de Devis Gratuit" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(devisPageJSONLD) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJSONLD) }}
      />

      <DevisIntro />
      <DevisCalculator />
      {/* <DevisForm /> */}
    </>
  );
}