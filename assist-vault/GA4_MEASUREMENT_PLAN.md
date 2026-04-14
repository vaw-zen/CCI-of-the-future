# GA4 Measurement Plan

Date: 2026-04-13
Property reviewed: `afrah-49957`

## Current implementation in the repo

- Global GA4 loader in [`src/utils/components/GoogleAnalytics.jsx`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/utils/components/GoogleAnalytics.jsx)
- Custom analytics helpers in [`src/utils/analytics.js`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/utils/analytics.js)
- Global contact-link listener in [`src/utils/initializer/initalizer.jsx`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/utils/initializer/initalizer.jsx)
- Homepage GTM snippet in [`src/app/home/home.jsx`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/app/home/home.jsx)
- B2C lead forms:
  - contact form in [`src/app/contact/3-form/form.jsx`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/app/contact/3-form/form.jsx)
  - devis form in [`src/app/devis/3-form/devisForm.func.js`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/app/devis/3-form/devisForm.func.js)
- B2B convention form in [`src/app/entreprises/6-form/ConventionForm.func.js`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/app/entreprises/6-form/ConventionForm.func.js)
- UTM capture/storage in [`src/utils/utmGenerator.js`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/utils/utmGenerator.js)

## What the data says

Period analyzed: 2026-03-16 to 2026-04-12

- 220 active users
- 218 new users
- 46.2s average engagement per active user
- 2,565 events
- 5 key events total

### Pages with the most visibility

- Home page: 97 views, 45.8% bounce
- `/marbre`: 71 views, 10.0% bounce
- `/tapisserie`: 60 views, 15.4% bounce
- article about retapissage: 42 views, 32.4% bounce
- article about interior car cleaning: 41 views, 35.3% bounce
- `/contact`: 38 views, 76.0% bounce

### Acquisition reality

- GA4 session source shows almost all traffic as `direct / (none)`: 250 sessions
- Instagram/social shows 15 sessions
- Search Console export shows 177 organic clicks and 4,941 impressions
- 19 of 21 organic landing pages with clicks show `0` active GA users in the linked organic landing-page report

This is the strongest anomaly in the whole dataset. It means search demand already exists, but GA4 is not attributing or joining it correctly enough for decision-making.

### Conversion reality

- `generate_lead`: 4 key events
- `conversion_event_contact`: 1 key event
- That is very low versus total traffic and intent-heavy pages

### Geographic anomaly

- Top city is Tunis as expected
- But there is also non-trivial traffic from places like Singapore, Karachi, Los Angeles, Amsterdam, Novorossiysk

That suggests a mix of VPN, internal/testing traffic, or incomplete filtering. It should not be trusted blindly.

## Anomalies to treat first

### 1. Organic search is being flattened in GA4

Likely cause:

- GA config was manually passing campaign fields on every page load, which can interfere with GA4's native source/medium attribution when no UTM is present.

Impact:

- SEO traffic looks like direct traffic
- Organic landing pages cannot be evaluated properly
- lead quality by channel becomes invisible

### 2. SPA page views were under-instrumented

Likely cause:

- initial GA config fired page view on first load, but route-change page views were not handled globally in the App Router

Impact:

- internal navigation can be undercounted
- time-on-site and path analysis become less trustworthy

### 3. GA4 key-event configuration is stale

Observed in the screenshot:

- `close_convert_lead`
- `qualify_lead`
- `conversion_event_request_quote`
- `purchase`

These are configured in GA4, but the repo does not currently emit them in a meaningful live flow. They create reporting noise.

### 4. B2B leads were not counted as standard leads

Observed in code:

- convention form emitted a custom `convention_form_submit`
- it did not emit `generate_lead`

Impact:

- B2B demand was not included in the main lead KPI

### 5. Contact page bounce is too high

Observed:

- 38 views
- 76% bounce

Possible reasons:

- visitors get contact info and leave without a second meaningful interaction
- weak trust/qualification content on the page
- CTA hierarchy may not match user intent

## Changes implemented today

### Tracking fixes

- Removed campaign-field overrides from the GA4 and Google Ads bootstrap config
- Added persistent session attribution capture on first landing
- Added explicit route-change `page_view` tracking for App Router navigation
- Enriched lead/contact events with landing page and session attribution context
- Upgraded B2B convention form submissions to also fire `generate_lead`

Files changed:

- [`src/utils/components/GoogleAnalytics.jsx`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/utils/components/GoogleAnalytics.jsx)
- [`src/utils/analytics.js`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/utils/analytics.js)
- [`src/app/entreprises/6-form/ConventionForm.func.js`](/Users/fareschaabane/Documents/dev/CCI-of-the-future/src/app/entreprises/6-form/ConventionForm.func.js)

## Measurement plan

### P0. Trust the data again

- Keep `generate_lead` as the main GA4 lead KPI
- Keep `conversion_event_contact` only as a temporary legacy bridge if reporting still depends on it
- Remove or unmark stale GA4 key events that are not emitted
- Create GA4 custom definitions for:
  - `landing_page`
  - `session_source`
  - `session_medium`
  - `session_campaign`
  - `lead_type`
  - `business_line`
- Add internal traffic filters for office/dev/test traffic
- Verify the fixed attribution in Realtime, DebugView, and standard acquisition reports

### P1. Measure qualified intent, not just clicks

- Distinguish lead types:
  - `quote_request`
  - `convention_request`
  - `phone_click`
  - `whatsapp_click`
  - `email_click`
- Add a sales-stage event later from admin/CRM:
  - `qualify_lead`
  - only after human validation
- Add a closed-won stage later:
  - `close_convert_lead`
  - only after real payment or signed agreement

### P2. Increase time on site

- Turn high-traffic articles into funnels, not dead ends
- Every top article should have:
  - sticky CTA
  - related service block
  - proof block before the CTA
  - short FAQ near the CTA
- Prioritize the current winners:
  - `/marbre`
  - `/tapisserie`
  - `/salon`
  - `/conseils/nettoyage-voiture-interieur-tunis-2025`
  - `/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure`

### P3. Increase real clients

- Treat B2B and B2C separately in reporting
- Build a weekly lead-quality review:
  - source
  - landing page
  - service requested
  - valid lead or invalid lead
  - closed or not closed
- Use the data to answer:
  - which pages create real calls
  - which pages create qualified quote requests
  - which pages attract curiosity but no commercial intent

## Conversion plan by page type

### Service pages

- Put one primary CTA above the fold
- Keep WhatsApp/phone as secondary actions, not competing primaries
- Add turnaround promise: response time, service zone, proof
- Add before/after proof near CTA

### Article pages

- Add in-article CTA around 35% and 70% read depth
- Use context-specific CTA copy
- Route readers to the matching service page, not only `/contact`
- Add trust signals:
  - Tunis coverage
  - pricing anchor
  - real reviews
  - response promise

### Contact page

- Reduce generic content
- Move strongest intent block higher:
  - phone
  - WhatsApp
  - response time
  - operating zone
- Add “why contact now” reasons and a short reassurance block

## Short experiments to launch next

- Test a sticky mobile CTA on top service and article pages
- Test article CTA copy focused on price vs speed vs expertise
- Test a lighter contact page with stronger proof near the form
- Test a “request callback in 15 min” CTA for high-intent mobile visitors

## Success targets for the next cycle

- Organic search becomes visible in GA4 acquisition reports again
- Contact-page bounce falls below 55%
- Lead rate rises above 4% of active users
- B2B and B2C leads are visible separately
- Top organic landing pages can be ranked by real lead generation, not just clicks
