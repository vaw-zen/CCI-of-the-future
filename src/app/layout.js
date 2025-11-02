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
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const roboto = Roboto_Condensed({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  preload: true,
  fallback: ['sans-serif'],
  adjustFontFallback: true,
});

export const metadata = {
  title: "CCI Services — Leader du Nettoyage Professionnel en Tunisie | Moquettes, Salons & Marbre",
  description: "CCI Services : Leader du nettoyage professionnel en Tunisie ✓ Nettoyage moquettes ✓ Restauration marbre ✓ Salon à domicile ✓ Devis gratuit ✓ +216 98 557 766",   alternates: {

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
    "name": "CCI Tunisie - Chaabane's Cleaning Intelligence",
    "alternateName": ["CCI Tunis", "CCI Services Tunisie"],
    "url": SITE_URL,
    "logo": SITE_LOGO,
    "telephone": "+216-98-557-766",
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
        {/* Resource hints for faster loading */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Global Open Graph / Twitter / icons (canonical removed - handled per page) */}
        <meta name="keywords" content="cci tunisie, cci tunis, nettoyage professionnel tunisie,ch nettoyage moquette tunis, nettoyage salon tunisie, restauration marbre tunis, services tapisserie tunisie, nettoyage post-chantier, CCI services" />
        <meta name="author" content="CCI Tunisie" />
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

        {/* Google Site Verification - Method 1 for Search Console */}
        <meta name="google-site-verification" content="sJRXBYO6D1wSw4INn0E56VlSp8hSgSQHYc4p6Czr78U" />

        {/* Google Analytics - G-0RDH6DH7TS */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0RDH6DH7TS"></script>
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0RDH6DH7TS', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true
              });
              gtag('config', 'AW-17696563349');
            `
          }}
        />

        {/* Google Ads Conversion Tracking */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              function gtag_report_conversion(url) {
                var callback = function () {
                  if (typeof(url) != 'undefined') {
                    window.location = url;
                  }
                };
                gtag('event', 'conversion', {
                  'send_to': 'AW-17696563349/oZpbCJfSzrgbEJXBsPZB',
                  'value': 1.0,
                  'currency': 'USD',
                  'event_callback': callback
                });
                return false;
              }
            `
          }}
        />

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
