import dynamic from 'next/dynamic';
import Hero from "./sections/1-hero/hero";
import styles from './home.module.css';
import Head from 'next/head';

export const metadata = {
  title: "CCI Tunisie | Nettoyage Professionnel Moquettes, Salons & Restauration Marbre | Devis Gratuit",
  description: "🏆 Leader du nettoyage professionnel en Tunisie. Spécialistes moquettes, salons, tapisserie, restauration marbre. Service post-chantier. Devis gratuit ✅ +216 98 557 766",
  keywords: "nettoyage moquette tunisie, nettoyage salon tunis, restauration marbre, polissage marbre, nettoyage professionnel, tapisserie tunisie, nettoyage post chantier, CCI services",
  openGraph: {
    title: "CCI Tunisie - Nettoyage Professionnel & Restauration Marbre",
    description: "Leader du nettoyage professionnel en Tunisie. Moquettes, salons, marbre. Devis gratuit.",
    type: "website",
    locale: "fr_TN",
    siteName: "CCI Services Tunisie"
  },
  twitter: {
    card: "summary_large_image",
    title: "CCI Tunisie - Nettoyage Professionnel",
    description: "Leader du nettoyage professionnel en Tunisie. Devis gratuit."
  },
  alternates: {
    canonical: "https://cciservices.online"
  }
};

const About = dynamic(() => import("./sections/2-about/about"));
const Services = dynamic(() => import("./sections/3-services/services"));
const Band = dynamic(() => import("./sections/4-band/band"));
const Showcase = dynamic(() => import("./sections/5-showcase/showcase"));
const Project = dynamic(() => import("./sections/6-projects/project"));
const Refrences = dynamic(() => import("./sections/7-refrences/refrences"));
const GreenBand = dynamic(() => import("@/utils/components/GreenBand/GreenBand"));
const Testimonials = dynamic(() => import("./sections/8-testimonials/testimonials"));
const Overlay = dynamic(() => import("./sections/9-overlay/overlay"));
const Initializer = dynamic(() => import("@/utils/initializer/initalizer"));

export default function Home() {
  return <>
  {/* Enhanced JSON-LD Schema for Better SEO */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://cciservices.online/#organization",
        name: "CCI - Chaabane's Cleaning Intelligence",
        alternateName: "CCI Services Tunisie",
        description: "Leader du nettoyage professionnel en Tunisie. Spécialistes en nettoyage de moquettes, salons, restauration marbre, tapisserie et nettoyage post-chantier.",
        url: "https://cciservices.online",
        logo: {
          "@type": "ImageObject",
          url: "https://cciservices.online/logo.png",
          width: 400,
          height: 400
        },
        image: "https://cciservices.online/logo.png",
        telephone: "+216-98-557-766",
        email: "contact@cciservices.online",
        priceRange: "$$",
        currenciesAccepted: "TND",
        paymentAccepted: "Cash, Bank Transfer",
        address: {
          "@type": "PostalAddress",
          streetAddress: "06 Rue Galant de nuit",
          addressLocality: "El Aouina",
          addressRegion: "Tunis",
          postalCode: "2045",
          addressCountry: "TN"
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 36.8527438,
          longitude: 10.254949
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "18:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "08:00",
            closes: "14:00"
          }
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+216-98-557-766",
          contactType: "customer service",
          areaServed: "TN",
          availableLanguage: ["French", "Arabic", "English"],
          contactOption: "TollFree"
        },
        areaServed: [
          {
            "@type": "City",
            name: "Tunis"
          },
          {
            "@type": "City",
            name: "Ariana"
          },
          {
            "@type": "City",
            name: "Ben Arous"
          },
          {
            "@type": "City",
            name: "Manouba"
          }
        ],
        serviceArea: {
          "@type": "GeoCircle",
          geoMidpoint: {
            "@type": "GeoCoordinates",
            latitude: 36.8527438,
            longitude: 10.254949
          },
          geoRadius: "50000"
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services de Nettoyage Professionnel CCI",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Nettoyage et Restauration Marbre",
                description: "Polissage, lustrage, ponçage et cristallisation du marbre. Restauration complète de vos sols en marbre.",
                category: "Restauration Marbre",
                provider: {
                  "@id": "https://cciservices.online/#organization"
                }
              },
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "TND",
                price: "Sur devis"
              }
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Nettoyage Moquettes et Tapis",
                description: "Nettoyage professionnel en profondeur des moquettes et tapis. Élimination des taches et désinfection.",
                category: "Nettoyage Moquettes",
                provider: {
                  "@id": "https://cciservices.online/#organization"
                }
              }
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Nettoyage Salons et Tapisserie",
                description: "Nettoyage spécialisé des salons, canapés, fauteuils et tous types de tapisserie d'ameublement.",
                category: "Nettoyage Salons",
                provider: {
                  "@id": "https://cciservices.online/#organization"
                }
              }
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Nettoyage Post-Chantier",
                description: "Nettoyage complet après travaux de construction ou rénovation. Service professionnel et minutieux.",
                category: "Nettoyage Post-Chantier",
                provider: {
                  "@id": "https://cciservices.online/#organization"
                }
              }
            }
          ]
        },
        sameAs: [
          "https://www.facebook.com/Chaabanes.Cleaning.Intelligence",
          "https://www.instagram.com/cci.services/",
          "https://www.linkedin.com/company/chaabanes-cleaning-int/"
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "127",
          bestRating: "5",
          worstRating: "1"
        },
        review: [
          {
            "@type": "Review",
            author: {
              "@type": "Person",
              name: "Ahmed Ben Salem"
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5"
            },
            reviewBody: "Service exceptionnel pour le nettoyage de mon salon. Équipe professionnelle et résultats parfaits."
          }
        ]
      }),
    }}
  />

  {/* FAQ Schema for Rich Snippets */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Quels services de nettoyage propose CCI en Tunisie ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CCI Services propose le nettoyage professionnel de moquettes, salons, canapés, restauration et polissage de marbre, nettoyage de tapisserie d'ameublement, et nettoyage post-chantier. Nous intervenons dans tout le Grand Tunis."
            }
          },
          {
            "@type": "Question",
            name: "Combien coûte un nettoyage de moquette en Tunisie ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Le tarif dépend de la surface, du type de moquette et de l'état de salissure. CCI Services propose un devis gratuit sur place. Contactez-nous au +216 98 557 766 pour une estimation personnalisée."
            }
          },
          {
            "@type": "Question",
            name: "CCI Services intervient dans quelles zones de Tunisie ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nous intervenons principalement dans le Grand Tunis : Tunis, Ariana, Ben Arous, Manouba et environs. Basés à El Aouina, nous nous déplaçons dans un rayon de 50km."
            }
          },
          {
            "@type": "Question",
            name: "Comment prendre rendez-vous avec CCI Services ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Contactez-nous par téléphone au +216 98 557 766, par WhatsApp, ou par email à contact@cciservices.online. Nous proposons un devis gratuit et nous déplaçons chez vous."
            }
          },
          {
            "@type": "Question",
            name: "CCI Services utilise quels produits pour le nettoyage ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nous utilisons des produits professionnels écologiques et adaptés à chaque type de surface. Nos techniques respectent vos textiles et garantissent un résultat durable sans résidus chimiques."
            }
          }
        ]
      }),
    }}
  />

    <Head>
      {/* Preload critical resources */}
      <link
        rel="preload"
        as="image"
        href="/home/1-hero/linesGlow.webp"
        fetchpriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/home/1-hero/main.webp"
        fetchpriority="high"
      />
      
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//www.google.com" />
      <link rel="dns-prefetch" href="//www.facebook.com" />
      <link rel="dns-prefetch" href="//www.instagram.com" />
      
      {/* Additional SEO meta tags */}
      <meta name="geo.region" content="TN-11" />
      <meta name="geo.placename" content="Tunis" />
      <meta name="geo.position" content="36.8527438;10.254949" />
      <meta name="ICBM" content="36.8527438, 10.254949" />
      
      {/* Business specific meta */}
      <meta name="business:contact_data:street_address" content="06 Rue Galant de nuit" />
      <meta name="business:contact_data:locality" content="El Aouina" />
      <meta name="business:contact_data:region" content="Tunis" />
      <meta name="business:contact_data:postal_code" content="2045" />
      <meta name="business:contact_data:country_name" content="Tunisia" />
      <meta name="business:contact_data:phone_number" content="+216-98-557-766" />
      <meta name="business:contact_data:email" content="contact@cciservices.online" />
    </Head>
  {/* site JSON-LD is injected globally in layout.js; page-specific Service JSON-LD could be added here if needed */}
    <Hero />
    <main className={styles.Home} role="main" itemScope itemType="https://schema.org/WebPage">
      <div className={styles.wrapper}>
        <About />
        <Services />
        <Band />
        <Showcase />
        <Project />
        <Refrences />
        <GreenBand />
        <Testimonials />
      </div>
    </main>
    <Overlay />
  </>
}
