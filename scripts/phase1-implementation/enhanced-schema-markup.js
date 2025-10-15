// Enhanced FAQ Schema for Priority Keywords - Add to homepage
const priorityKeywordsFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Que comprennent les CCI services de nettoyage ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CCI services incluent le nettoyage professionnel de moquettes en Tunisie, la restauration marbre Tunis (ponçage, polissage, cristallisation), et le nettoyage salon à domicile. Devis gratuit et intervention rapide."
      }
    },
    {
      "@type": "Question",
      "name": "Comment fonctionne le nettoyage moquettes Tunisie par CCI ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Notre nettoyage moquettes Tunisie utilise la méthode injection-extraction professionnelle. Résultats garantis, séchage rapide (1h), intervention dans toute la Tunisie. CCI services : +216 98 557 766."
      }
    },
    {
      "@type": "Question",
      "name": "La restauration marbre Tunis inclut quels services ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Notre restauration marbre Tunis comprend : ponçage, polissage, cristallisation, protection. Experts certifiés, résultats avant/après garantis, devis gratuit."
      }
    },
    {
      "@type": "Question",
      "name": "Le nettoyage salon Tunis se fait à domicile ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, notre nettoyage salon Tunis s'effectue à domicile. Canapés, fauteuils, toutes matières. Service professionnel, résultats garantis, devis gratuit."
      }
    },
    {
      "@type": "Question",
      "name": "Quels sont les tarifs des CCI services ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CCI services propose des tarifs transparents : devis gratuit pour tous nos services (nettoyage moquettes, restauration marbre, salon). Contactez-nous : +216 98 557 766."
      }
    }
  ]
};

// Service Schema for Homepage
const homepageServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "CCI Services - Nettoyage Professionnel Tunisie",
  "description": "CCI services : nettoyage professionnel en Tunisie. Spécialistes nettoyage moquettes Tunisie, restauration marbre Tunis, nettoyage salon à domicile.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "CCI Services",
    "telephone": "+216-98-557-766",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tunis",
      "addressCountry": "TN"
    }
  },
  "areaServed": {
    "@type": "Country",
    "name": "Tunisia"
  },
  "serviceType": [
    "Nettoyage moquettes Tunisie",
    "Restauration marbre Tunis", 
    "Nettoyage salon Tunis",
    "Services nettoyage professionnel"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "CCI Services Catalog",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Nettoyage Moquettes Tunisie",
        "url": "https://cciservices.online/tapis"
      },
      {
        "@type": "OfferCatalog", 
        "name": "Restauration Marbre Tunis",
        "url": "https://cciservices.online/marbre"
      },
      {
        "@type": "OfferCatalog",
        "name": "Nettoyage Salon Tunis",
        "url": "https://cciservices.online/salon"
      }
    ]
  }
};

// Organization Schema Enhancement
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CCI Services",
  "alternateName": ["CCI Tunisie", "CCI Tunis", "Chaabane's Cleaning Intelligence"],
  "url": "https://cciservices.online",
  "logo": "https://cciservices.online/logo.png",
  "description": "CCI services : leader du nettoyage professionnel en Tunisie. Nettoyage moquettes Tunisie, restauration marbre Tunis, nettoyage salon à domicile.",
  "telephone": "+216-98-557-766",
  "email": "contact@cciservices.online",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "06 Rue Galant de nuit, El Aouina",
    "addressLocality": "Tunis",
    "addressRegion": "Grand Tunis",
    "postalCode": "2045",
    "addressCountry": "TN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.8527438,
    "longitude": 10.254949
  },
  "sameAs": [
    "https://www.facebook.com/Chaabanes.Cleaning.Intelligence/",
    "https://www.instagram.com/cci.services/",
    "https://www.linkedin.com/company/chaabanes-cleaning-int/"
  ],
  "serviceArea": {
    "@type": "Country",
    "name": "Tunisia"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "CCI Services Professional Cleaning",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Nettoyage Moquettes Tunisie",
          "description": "Service professionnel de nettoyage moquettes en Tunisie par injection-extraction"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Restauration Marbre Tunis",
          "description": "Restauration marbre Tunis : ponçage, polissage, cristallisation par experts"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Nettoyage Salon Tunis",
          "description": "Nettoyage salon et canapés à domicile Tunis, toutes matières"
        }
      }
    ]
  }
};