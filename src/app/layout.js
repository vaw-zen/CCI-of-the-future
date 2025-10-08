import { DM_Sans, Roboto_Condensed } from 'next/font/google';
import "./globals.css";
import dynamic from 'next/dynamic';
import Script from 'next/script';
import Initializer from '@/utils/initializer/initalizer';
import ClientHeader from '@/layout/header/ClientHeader';
import HydrationSuppressor from '@/utils/HydrationSuppressor';

// Dynamically import components that might cause hydration issues
const Footer = dynamic(() => import('@/layout/footer/footer'));


const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const roboto = Roboto_Condensed({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400']
});

export const metadata = {
  title: "CCI Tunisie — Leader du Nettoyage Professionnel & Tissus Ignifuges",
description: "Chez CCI Services, nous transformons l'entretien professionnel en un art ! Leader en Tunisie pour le nettoyage de moquettes, salons et tous types de tapisseries et ameublement, ainsi que pour l'entretien du marbre (polissage, lustrage, ponçage, protection, cristallisation). Nous offrons également des services de tapisserie sur mesure et un nettoyage post-chantier complet. Avec CCI, bénéficiez d'un service fiable, de qualité et personnalisé, qui redonne vie à vos espaces.",   alternates: {
 
  },
};

export const viewport = {
  viewport: "width=device-width, initial-scale=1",
  themeColor: "rgba(203, 251, 66, 0.5)",
};

export default function RootLayout({ children }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const SITE_NAME = "CCI"; // or "Chaabane's Cleaning Intelligence"
  const SITE_LOGO = `${SITE_URL}/favicon.ico`;

  // WebSite schema with SearchAction
  const websiteJSONLD = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/?s={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // LocalBusiness schema
  const localBusinessJSONLD = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": SITE_LOGO,
    "telephone": "+216-98-557-766",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "06 Rue Galant de nuit, El Aouina",
      "addressLocality": "Tunis",
      "addressCountry": "TN"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/Chaabanes.Cleaning.Intelligence/",
      "https://www.instagram.com/cci.services/",
      "https://www.linkedin.com/company/chaabanes-cleaning-int/"
    ]
  };

  const breadcrumbJSONLD = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 3, name: "Contact", item: `${SITE_URL}/contact` },
      { "@type": "ListItem", position: 4, name: "Blog", item: `${SITE_URL}/blogs` }

    ]
  };
  const FB_APP_ID = process.env.FB_APP_ID || '';
  const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
  return (
    <html lang="fr" className={dmSans.className} suppressHydrationWarning>
      <head>
        <HydrationSuppressor />
        {/* Global Open Graph / Twitter / canonical / icons */}
        <link rel="canonical" href={SITE_URL} />
        <meta name="keywords" content="nettoyage moquette,nettoyage professionnel tunisie, nettoyage salon tunisie restauration marbre, services de tapisserie, nettoyage post-chantier, Tunisie, CCI" />
        <meta name="author" content="CCI" />
        <meta name="robots" content="index,follow" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={metadata.title || SITE_NAME} />
        <meta property="og:description" content={metadata.description || 'Services de nettoyage professionnels CCI'} />
        <meta property="og:image" content={SITE_LOGO} />
        <meta property="og:image:alt" content={`${SITE_NAME} logo`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@cciservices" />
        <meta name="twitter:title" content={metadata.title || SITE_NAME} />
        <meta name="twitter:description" content={metadata.description || ''} />
        <meta name="twitter:image" content={SITE_LOGO} />

{/* Icons & Manifest for PWA */}
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
<link rel="manifest" href="/site.webmanifest" />

{/* Theme & Status Bar */}
<meta name="theme-color" content="rgba(203, 251, 66, 1)" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="CCI Services" />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0RDH6DH7TS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0RDH6DH7TS');
          `}
        </Script>

        {/* JSON-LD site-wide */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJSONLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJSONLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJSONLD) }} />
        {/* Conditionally load Facebook SDK: only when app id is set and in production or when explicitly allowed in env */}
        {FB_APP_ID && (process.env.NODE_ENV === 'production' || process.env.ALLOW_FB_IN_DEV === 'true') && (
          <>
            <Script
              id="fb-init"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                window.fbAsyncInit = function() {
                  try {
                    FB.init({
                      appId      : '${FB_APP_ID}',
                      cookie     : true,
                      xfbml      : true,
                      version    : '${FB_API_VERSION}'
                    });
                    if (FB.AppEvents && FB.AppEvents.logPageView) FB.AppEvents.logPageView();
                  } catch (e) {
                    console.warn('FB SDK init failed', e);
                  }
                };
              ` }}
            />
           
          </>
        )}
      </head>
      <Initializer />
      <body suppressHydrationWarning>
        <ClientHeader roboto={roboto} />
        {children}
        <Footer />

      </body>
    </html>
  );
}
