'use client';

import { useEffect } from 'react';

const ANALYTICS_COOKIE_NAME = 'cci_analytics';
const GA_MEASUREMENT_ID = 'G-0RDH6DH7TS';
const GOOGLE_ADS_ID = 'AW-17696563349';

function getCookieValue(name) {
  if (typeof document === 'undefined') {
    return '';
  }

  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const match = cookies.find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

export default function GoogleAnalytics() {
  useEffect(() => {
    const shouldLoadAnalytics =
      process.env.NODE_ENV !== 'production' ||
      getCookieValue(ANALYTICS_COOKIE_NAME) === '1';

    if (!shouldLoadAnalytics || document.getElementById('gtag-loader')) {
      return;
    }

    const loaderScript = document.createElement('script');
    loaderScript.id = 'gtag-loader';
    loaderScript.async = true;
    loaderScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

    const initScript = document.createElement('script');
    initScript.id = 'gtag-init';
    initScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        campaign_source: new URLSearchParams(window.location.search).get('utm_source'),
        campaign_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        campaign_name: new URLSearchParams(window.location.search).get('utm_campaign'),
        campaign_content: new URLSearchParams(window.location.search).get('utm_content'),
        campaign_term: new URLSearchParams(window.location.search).get('utm_term')
      });

      gtag('config', '${GOOGLE_ADS_ID}', {
        campaign_source: new URLSearchParams(window.location.search).get('utm_source'),
        campaign_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        campaign_name: new URLSearchParams(window.location.search).get('utm_campaign')
      });

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('utm_source')) {
        try {
          console.log('UTM Parameters detected:', {
            source: urlParams.get('utm_source'),
            medium: urlParams.get('utm_medium'),
            campaign: urlParams.get('utm_campaign'),
            content: urlParams.get('utm_content'),
            term: urlParams.get('utm_term')
          });
        } catch (error) {}

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
    `;

    const conversionScript = document.createElement('script');
    conversionScript.id = 'gtag-conversion';
    conversionScript.text = `
      function gtag_report_conversion(url) {
        var callback = function () {
          if (typeof(url) != 'undefined') {
            window.location = url;
          }
        };
        gtag('event', 'conversion', {
          'send_to': '${GOOGLE_ADS_ID}/oZpbCJfSzrgbEJXBsPZB',
          'value': 1.0,
          'currency': 'USD',
          'event_callback': callback
        });
        return false;
      }
    `;

    document.head.appendChild(loaderScript);
    document.head.appendChild(initScript);
    document.head.appendChild(conversionScript);
  }, []);

  return null;
}
