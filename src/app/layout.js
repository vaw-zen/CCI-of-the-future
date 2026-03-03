import { DM_Sans, Roboto_Condensed } from 'next/font/google';
import "./globals.css";
import Script from 'next/script';
import Initializer from '@/utils/initializer/initalizer';
import ClientHeader from '@/layout/header/ClientHeader';
import HydrationSuppressor from '@/utils/HydrationSuppressor';
import Footer from '@/layout/footer/footer';


const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'optional',
  weight: ['400', '500', '600', '700'],
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const roboto = Roboto_Condensed({
  subsets: ['latin'],
  display: 'optional',
  weight: ['400'],
  preload: true,
  fallback: ['sans-serif'],
  adjustFontFallback: true,
});

export const metadata = {
  title: "CCI Services — Leader du Nettoyage Professionnel en Tunisie | Moquettes, Salons & Marbre",
  description: "CCI Services : Leader du nettoyage professionnel en Tunisie ✓ Nettoyage moquettes ✓ Restauration marbre ✓ Salon à domicile ✓ Devis gratuit ✓ +216 98 557 766",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'),
  alternates: {},
  openGraph: {
    locale: 'fr_TN',
    siteName: 'CCI Services',
    type: 'website',
    images: [
      {
        url: '/home/1-hero/main.webp',
        width: 1200,
        height: 630,
        alt: 'CCI Services - Nettoyage Professionnel Tunisie'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cciservices',
    images: ['/home/1-hero/main.webp']
  },
  robots: { index: true, follow: true },
  authors: [{ name: 'CCI Tunisie' }],
  verification: {
    google: 'sJRXBYO6D1wSw4INn0E56VlSp8hSgSQHYc4p6Czr78U'
  }
};

export const viewport = {
  viewport: "width=device-width, initial-scale=1",
  themeColor: "rgba(203, 251, 66, 0.5)",
};

export default function RootLayout({ children }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const SITE_NAME = "CCI"; // or "Chaabane's Cleaning Intelligence"
  const SITE_LOGO = `${SITE_URL}/home/1-hero/main.webp`;

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
    "@id": `${SITE_URL}#localbusiness`,
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

  // Breadcrumb removed from global layout — each page injects its own contextual breadcrumb
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
        {/* OG/Twitter tags handled by Next.js metadata API — no manual tags needed */}
        {/* Geo and business meta for local SEO */}
        <meta name="geo.region" content="TN-11" />
        <meta name="geo.placename" content="Tunis" />
        <meta name="geo.position" content="36.8527438;10.254949" />
        <meta name="ICBM" content="36.8527438, 10.254949" />

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

        {/* Google Site Verification now handled via metadata.verification */}

        {/* Google Analytics - non-blocking via Next.js Script */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-0RDH6DH7TS" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-0RDH6DH7TS', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true,
            campaign_source: new URLSearchParams(window.location.search).get('utm_source'),
            campaign_medium: new URLSearchParams(window.location.search).get('utm_medium'),
            campaign_name: new URLSearchParams(window.location.search).get('utm_campaign'),
            campaign_content: new URLSearchParams(window.location.search).get('utm_content'),
            campaign_term: new URLSearchParams(window.location.search).get('utm_term')
          });

          gtag('config', 'AW-17696563349', {
            campaign_source: new URLSearchParams(window.location.search).get('utm_source'),
            campaign_medium: new URLSearchParams(window.location.search).get('utm_medium'),
            campaign_name: new URLSearchParams(window.location.search).get('utm_campaign')
          });

          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('utm_source')) {
            try{console.log('UTM Parameters detected:', {
              source: urlParams.get('utm_source'),
              medium: urlParams.get('utm_medium'),
              campaign: urlParams.get('utm_campaign'),
              content: urlParams.get('utm_content'),
              term: urlParams.get('utm_term')
            });}catch(e){}

            gtag('event', 'utm_arrival', {
              event_category: 'traffic_source',
              utm_source: urlParams.get('utm_source'),
              utm_medium: urlParams.get('utm_medium'),
              utm_campaign: urlParams.get('utm_campaign'),
              utm_content: urlParams.get('utm_content'),
              utm_term: urlParams.get('utm_term'),
              page_location: window.location.href
            });
          }
        ` }} />

        {/* Google Ads Conversion Tracking (non-blocking) */}
        <Script id="gtag-conversion" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
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
        ` }} />

        {/* JSON-LD site-wide */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJSONLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJSONLD) }} />
        {/* Conditionally load Facebook SDK: only when app id is set and in production or when explicitly allowed in env */}
        {FB_APP_ID && (process.env.NODE_ENV === 'production' || process.env.ALLOW_FB_IN_DEV === 'true') && (
          <>
            <Script
              id="fb-init"
              strategy="lazyOnload"
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
