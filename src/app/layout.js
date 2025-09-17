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
  title: "CCI — Restauration & Nettoyage professionnel",
  description: "CCI offre des services professionnels de restauration de marbre, nettoyage de tapis et moquettes, nettoyage salon, nettoyage Car Ferries et yaghts  et nettoyages post-chantier en Tunisie. CCI est synonyme de qualité et de fiabilité dans le domaine du nettoyage professionnel.",
   alternates: {
    canonical: "https://cciservices.online/",
  },
};

export const viewport = {
  viewport: "width=device-width, initial-scale=1",
  themeColor: "rgba(203, 251, 66, 0.5)",
};

export default function RootLayout({ children }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const SITE_NAME = "CCI"; // or "Chaabane's Cleaning Intelligence"
  const SITE_LOGO = `${SITE_URL}/logo.png`;

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
        <meta name="description" content={metadata.description || 'Services de nettoyage professionnels CCI'} />
        <meta name="keywords" content="nettoyage, restauration marbre, moquette, tapisserie, nettoyage post-chantier, Tunisie, CCI" />
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

        {/* Icons & manifest */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="rgba(203, 251, 66, 1)" />

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
            <Script id="facebook-jssdk" src="https://connect.facebook.net/en_US/sdk.js" strategy="afterInteractive" />
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
