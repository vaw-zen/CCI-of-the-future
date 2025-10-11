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
  title: "CCI Tunisie — Leader du Nettoyage Professionnel à Tunis & Tissus Ignifuges",
description: "CCI Tunisie : Leader du nettoyage professionnel à Tunis et toute la Tunisie. Nettoyage moquettes, salons, restauration marbre (polissage, cristallisation), tapisserie sur mesure. CCI Tunis - Votre partenaire nettoyage depuis des années. Service fiable et qualité garantie.",   alternates: {
 
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
        {/* Global Open Graph / Twitter / icons (canonical removed - handled per page) */}
        <meta name="keywords" content="cci tunisie, cci tunis, nettoyage professionnel tunisie, nettoyage moquette tunis, nettoyage salon tunisie, restauration marbre tunis, services tapisserie tunisie, nettoyage post-chantier, CCI services" />
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

        {/* Google Analytics - Enhanced */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0RDH6DH7TS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Enhanced configuration with better tracking
            gtag('config', 'G-0RDH6DH7TS', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              // Enhanced ecommerce and user engagement
              custom_map: {
                'custom_parameter_1': 'page_type',
                'custom_parameter_2': 'user_engagement'
              },
              // Cookie settings for better privacy compliance
              cookie_flags: 'SameSite=None;Secure',
              // Allow linker for cross-domain tracking if needed
              linker: {
                domains: ['cciservices.online']
              }
            });
            
            // Enhanced tracking for Single Page Application navigation
            if (typeof window !== 'undefined') {
              const originalPushState = history.pushState;
              const originalReplaceState = history.replaceState;
              
              // Track programmatic navigation (Next.js router.push)
              history.pushState = function() {
                originalPushState.apply(history, arguments);
                setTimeout(() => {
                  gtag('config', 'G-0RDH6DH7TS', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname + window.location.search
                  });
                }, 100);
              };
              
              history.replaceState = function() {
                originalReplaceState.apply(history, arguments);
                setTimeout(() => {
                  gtag('config', 'G-0RDH6DH7TS', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname + window.location.search
                  });
                }, 100);
              };
              
              // Track browser back/forward navigation
              window.addEventListener('popstate', function() {
                setTimeout(() => {
                  gtag('config', 'G-0RDH6DH7TS', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname + window.location.search
                  });
                }, 100);
              });
              
              // Enhanced user engagement tracking
              let scrollDepth = 0;
              let timeOnPage = Date.now();
              
              // Track scroll depth
              window.addEventListener('scroll', function() {
                const currentScroll = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                if (currentScroll > scrollDepth && currentScroll % 25 === 0) {
                  scrollDepth = currentScroll;
                  gtag('event', 'scroll', {
                    event_category: 'engagement',
                    event_label: scrollDepth + '%',
                    value: scrollDepth
                  });
                }
              });
              
              // Track time on page when user leaves
              window.addEventListener('beforeunload', function() {
                const timeSpent = Math.round((Date.now() - timeOnPage) / 1000);
                gtag('event', 'time_on_page', {
                  event_category: 'engagement',
                  event_label: window.location.pathname,
                  value: timeSpent
                });
              });
              
              // Track clicks on external links
              document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link && link.href && !link.href.includes(window.location.hostname)) {
                  gtag('event', 'click', {
                    event_category: 'outbound',
                    event_label: link.href,
                    transport_type: 'beacon'
                  });
                }
              });
              
              // Initialize session tracking
              window.sessionStartTime = Date.now();
              
              // Track initial page load performance
              window.addEventListener('load', function() {
                if (window.performance && window.performance.timing) {
                  const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                  gtag('event', 'timing_complete', {
                    name: 'page_load_time',
                    value: loadTime,
                    event_category: 'performance'
                  });
                }
                
                // Track device and browser info for better insights
                gtag('event', 'session_start', {
                  event_category: 'engagement',
                  screen_resolution: screen.width + 'x' + screen.height,
                  viewport_size: window.innerWidth + 'x' + window.innerHeight,
                  connection_type: navigator.connection ? navigator.connection.effectiveType : 'unknown'
                });
              });
            }
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
