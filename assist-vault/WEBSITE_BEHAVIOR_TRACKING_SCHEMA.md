# Website Behavior Tracking Schema

Date: 2026-05-10

## Goal

This document defines the exact behavior-tracking schema that should be treated as the next implementation target for the website.

It is designed to:

- strengthen Stage 3 dashboard evidence instead of creating a second analytics system
- standardize the events already emitted through `src/utils/analytics.js` and `src/utils/analyticsGateway.js`
- make CTA, form, and lead behavior decision-safe enough for SEO, CRO, and later targeted ads

This schema does **not** replace the growth dashboard roadmap. It hardens the measurement layer that Stage 3, Stage 4, and Stage 5 depend on.

## Current Repo Reality

The repo already has a solid analytics base:

- client-side event transport through `pushAnalyticsEvent()` in `src/utils/analyticsGateway.js`
- GA4 + GTM page view and UTM handling in `src/utils/components/GoogleAnalytics.jsx`
- attribution-aware lead submission in `src/services/devisService.js` and `src/services/conventionService.js`
- server-side lifecycle measurement helpers in `src/libs/analyticsLifecycle.js`
- CTA/contact-intent tracking in `src/utils/analytics.js`

The main gap is not event emission. The main gap is that CTA click, form-start, and form-completion behavior is **not yet persisted into a reporting mart** that the dashboard can use. The dashboard currently says this explicitly in `src/libs/adminDashboardMetrics.mjs`.

## Principles

1. Measure intent before vanity.
2. Keep one canonical meaning per event.
3. Reuse existing attribution context instead of inventing a new source model.
4. Keep PII out of analytics payloads.
5. Pair client behavior with server-confirmed outcomes.
6. Favor a small set of decision-ready events over a large set of low-signal events.

## Canonical Context Fields

These fields should be treated as the standard context layer for behavior events.

| Field | Required | Allowed / expected values | Notes |
| --- | --- | --- | --- |
| `page_type` | Yes | `home`, `service_page`, `article_page`, `quote_page`, `contact_page`, `b2b_page`, `faq_page`, `about_page`, `team_page`, `other` | Required on every behavior event. |
| `business_line` | Yes | `b2c`, `b2b`, `content`, `brand` | `content` is for article consumption; `brand` is for non-commercial pages. |
| `service_type` | When relevant | `salon`, `tapis`, `marbre`, `tapisserie`, `tfc`, `convention`, `multi_service`, `unknown` | Required on service, quote, and lead events. |
| `lead_type` | When relevant | `quote_request`, `convention_request`, `newsletter_signup` | Used on lead and lead-adjacent events. |
| `form_name` | When relevant | `devis_form`, `contact_quote_form`, `convention_form`, `newsletter_form` | Keep this stable across client and server events. |
| `form_placement` | When relevant | `devis_page`, `contact_page`, `entreprises_page`, `article_inline`, `modal`, `footer` | Helps distinguish intent by placement. |
| `funnel_name` | When relevant | `quote_request`, `convention_request`, `newsletter_signup` | Canonical funnel label. |
| `step_name` | When relevant | `form_start`, `service_selected`, `details_completed`, `validation_failed`, `submit_success`, `submit_failed` | Current code already emits step-like events; this standardizes names. |
| `step_number` | When relevant | integer | Use only when there is a real progression. |
| `cta_id` | When relevant | stable slug such as `service_whatsapp_primary`, `article_quote_inline_35`, `header_phone` | Canonical identifier. |
| `cta_location` | When relevant | `header`, `footer`, `service_hero`, `service_cta_block`, `article_inline_35`, `article_inline_70`, `mobile_sticky`, `confirmation_page` | Stable location taxonomy for CRO and ads audiences later. |
| `cta_type` | When relevant | `primary`, `secondary`, `contact`, `lead_cta`, `navigation` | Used for CTA impression and click reporting. |
| `contact_method` | When relevant | `form`, `phone`, `email`, `whatsapp` | Use on lead and contact-intent events. |
| `content_type` | When relevant | `service_page`, `article`, `faq`, `video`, `gallery` | Use for content engagement events. |
| `content_cluster` | Optional | article/service cluster slug | Useful for SEO clustering later. |
| `landing_page` | Yes | normalized path | Already available from attribution context. |
| `entry_path` | Yes | normalized path with query when useful | Already available from attribution context. |
| `session_source` | Yes | normalized source | Already available from attribution context. |
| `session_medium` | Yes | normalized medium | Already available from attribution context. |
| `session_campaign` | Optional | normalized campaign | Already available from attribution context. |
| `ga_client_id` | Yes when available | GA4 client id | Needed for joining behavior to later outcomes. |
| `value` | Optional | numeric | Use only when there is a defensible business proxy. |

## Privacy Guardrails

Do not send raw PII in behavior events.

The existing sanitizer in `src/utils/analyticsGateway.js` already blocks:

- email
- phone / telephone
- message
- user agent
- arbitrary `form_data`

That guard should remain in place.

## Canonical Event List

This is the exact event list that should power the next measurement pass. The table intentionally distinguishes between:

- **canonical use**: the meaning we want in reporting
- **current event name**: what the repo already emits today

### Acquisition and page context

| Canonical use | Current event name | Status | Required fields | Notes |
| --- | --- | --- | --- | --- |
| Page view | `page_view` | Live | `page_type`, `business_line`, `page_path`, `landing_page`, `session_source`, `session_medium` | Base event for all sessions. |
| UTM arrival | `utm_arrival` | Live | `page_type`, `business_line`, `utm_source`, `utm_medium` | Keep for attribution debugging. |
| Page type view | `view_page_type` | Partially used | `page_type`, `business_line` | Good standard event, but not consistently emitted across templates yet. |
| Service page view | `view_service_page` or `service_interaction` with `action_name=view_service_page` | Live but uneven | `page_type=service_page|b2b_page`, `business_line`, `service_type` | Standardize across every service page. |

### CTA visibility and clicks

| Canonical use | Current event name | Status | Required fields | Notes |
| --- | --- | --- | --- | --- |
| CTA impression | `view_promotion` | Live but narrow | `cta_id`, `cta_location`, `cta_type`, `page_type`, `business_line` | Currently strongest on service-page CTA blocks. |
| CTA click | `cta_click` | Live but uneven | `cta_id`, `cta_location`, `cta_type`, `page_type`, `business_line`, `link_destination` | This should be the reporting-friendly click event. |
| CTA click compatibility | `select_promotion` | Live | `promotion_name`, `creative_slot`, `cta_destination` | Keep for compatibility, normalize into CTA click reporting. |
| Phone intent click | `phone_click` | Live | `cta_id`, `cta_location`, `page_type`, `business_line`, `contact_method=phone` | High-intent signal. |
| Email intent click | `email_click` | Live | `cta_id`, `cta_location`, `page_type`, `business_line`, `contact_method=email` | High-intent signal. |
| WhatsApp intent click | `whatsapp_click` | Live | `cta_id`, `cta_location`, `page_type`, `business_line`, `contact_method=whatsapp` | Highest-intent assisted channel in current repo. |

### Quote calculator

| Canonical use | Current event name | Status | Required fields | Notes |
| --- | --- | --- | --- | --- |
| Quote calculator start | `quote_calculator_started` | Live | `page_type=quote_page`, `business_line=b2c`, `service_type`, `form_placement=devis_page` | Good pre-lead intent signal. |
| Quote calculator result | `quote_calculator_calculated` | Live | `page_type=quote_page`, `business_line=b2c`, `service_type`, `calculator_estimate`, `selected_services` | Useful for value-weighted prioritization. |

### Form funnel behavior

| Canonical use | Current event name | Status | Required fields | Notes |
| --- | --- | --- | --- | --- |
| Funnel step | `begin_checkout` | Live | `funnel_name`, `form_name`, `step_name`, `step_number`, `page_type`, `business_line` | Current helper name is misleading but usable. |
| Funnel completion step | `checkout_progress` | Live | `funnel_name`, `form_name`, `step_name`, `step_number`, `page_type`, `business_line` | Normalize with funnel-step reporting. |
| Field focus | `form_field_focus` | Live but uneven | `form_name`, `field_name`, `field_type`, `page_type`, `business_line` | Strong on the main devis page, weak elsewhere. |
| Field complete | `form_field_complete` | Live | `form_name`, `field_name`, `page_type`, `business_line` | Good for friction analysis. |
| Validation failure | `form_validation_failed` | Live | `form_name`, `failure_type`, `field_names`, `page_type`, `business_line` | Must be persisted into reporting. |
| Form abandonment | `form_abandonment` | Live but uneven | `form_name`, `last_field`, `completion_rate`, `page_type`, `business_line` | Important missing signal on the contact page today. |
| Submit failure | `form_submit_failed` | Live | `form_name`, `failure_type`, `page_type`, `business_line`, `service_type` | Already emitted client-side and server-side. |
| Generic form submit | `form_submit` | Available but low priority | `form_name`, `page_type`, `business_line` | Optional; do not make this the core KPI. |

### Lead creation and lifecycle

| Canonical use | Current event name | Status | Required fields | Notes |
| --- | --- | --- | --- | --- |
| Lead generated | `generate_lead` | Live | `lead_type`, `business_line`, `service_type`, `contact_method`, `landing_page`, `session_source`, `session_medium` | Main lead KPI. |
| Lead contact compatibility | `conversion_event_contact` | Live legacy bridge | `lead_type`, `business_line`, `service_type`, `contact_method` | Keep temporarily if external reporting still depends on it. |
| Lead submitted on server | `lead_submitted` | Live on server | `lead_type`, `business_line`, `lead_status`, `lead_quality_outcome`, `service_type`, attribution context | Use as trusted server-confirmed outcome. |
| Qualified lead | `qualify_lead` | Future | `lead_type`, `business_line`, `lead_status`, `lead_quality_outcome`, attribution context | Should come from admin ops, not browser events. |
| Closed-won lead | `close_convert_lead` | Future | `lead_type`, `business_line`, `lead_status`, `lead_quality_outcome`, attribution context | Needed before serious ad-ROI work. |

### Content engagement

| Canonical use | Current event name | Status | Required fields | Notes |
| --- | --- | --- | --- | --- |
| Article read milestone | `article_read_progress` | Live | `page_type=article_page`, `business_line=content`, `content_cluster`, `read_progress` | Good for editorial quality. |
| Article complete | `article_complete` | Live | `page_type=article_page`, `business_line=content`, `content_cluster`, `time_spent` | Good for content-depth quality. |
| FAQ interaction | `faq_expanded` | Live | `page_type`, `business_line`, `faq_question` | Useful but secondary. |
| Section view | `view_section` | Available | `page_type`, `business_line`, `section_name`, `section_type` | Optional for layout analysis. |
| Scroll depth | `scroll_depth` | Available | `page_type`, `business_line`, `scroll_percentage` | Secondary signal only. |
| Time on page | `timing_complete` | Available | `page_type`, `business_line`, `name=time_on_page`, `value` | Helpful if sampled carefully. |

## Canonical Value Taxonomy

### `page_type`

| Value | Meaning |
| --- | --- |
| `home` | Homepage |
| `service_page` | Commercial B2C service page such as `/marbre`, `/tapis`, `/salon`, `/tapisserie`, `/tfc` |
| `article_page` | `/conseils/<slug>` pages |
| `quote_page` | `/devis` |
| `contact_page` | `/contact` |
| `b2b_page` | `/entreprises` and related B2B convention flow |
| `faq_page` | `/faq` |
| `about_page` | `/about`, `/team` |
| `other` | Any page not intentionally mapped yet |

### `business_line`

| Value | Meaning |
| --- | --- |
| `b2c` | Consumer lead generation |
| `b2b` | Convention / enterprise lead generation |
| `content` | Educational / SEO content behavior |
| `brand` | Brand/navigation pages that are not direct conversion surfaces |

### `service_type`

| Value | Meaning |
| --- | --- |
| `salon` | Salon cleaning |
| `tapis` | Tapis / moquette cleaning |
| `marbre` | Marble / floor care |
| `tapisserie` | Upholstery / retapissage |
| `tfc` | Post-construction cleaning |
| `convention` | B2B cleaning convention |
| `multi_service` | Multi-service or bundle intent |
| `unknown` | No clear service intent yet |

### `form_name`

| Value | Meaning |
| --- | --- |
| `devis_form` | Main quote form on `/devis` |
| `contact_quote_form` | Quote-style form embedded on `/contact` |
| `convention_form` | B2B form on `/entreprises` |
| `newsletter_form` | Newsletter subscribe flow |

### `cta_location`

| Value | Meaning |
| --- | --- |
| `header` | Header nav / top contact CTA |
| `footer` | Footer CTA |
| `service_hero` | Service page hero CTA |
| `service_cta_block` | Main service-page CTA block |
| `article_inline_35` | Mid-article CTA at ~35% read depth |
| `article_inline_70` | Lower-article CTA at ~70% read depth |
| `mobile_sticky` | Sticky mobile CTA |
| `confirmation_page` | Post-submit confirmation CTA |

## Compatibility Rules

These rules keep the next implementation aligned with the current codebase without forcing a risky analytics rewrite.

1. Treat `cta_click` as the canonical CTA click event in reporting.
   Keep `select_promotion` as a compatibility alias until all CTA components converge.

2. Treat `begin_checkout` and `checkout_progress` as the current transport for form funnel steps.
   In reporting, normalize both into one funnel-step model keyed by `funnel_name`, `form_name`, `step_name`, and `step_number`.

3. Keep `conversion_event_contact` only as a legacy bridge.
   The long-term primary lead events should be `generate_lead`, `lead_submitted`, `qualify_lead`, and `close_convert_lead`.

4. Prefer server-confirmed lifecycle events for business reporting.
   Client-side behavior should explain intent and friction; server-side events should confirm pipeline outcomes.

## Current Coverage Snapshot

This is the repo-specific coverage picture as of 2026-05-10.

| Flow / surface | Current coverage | Main gaps |
| --- | --- | --- |
| `/devis` main quote form | form start, field focus, field complete, abandonment, validation failure, submit failure, submit success, calculator start, calculator estimate | focus tracking is partial, page-type/business-line context is not consistently explicit |
| `/contact` quote-style form | form start, service selected, validation failure, submit failure, submit success | no field focus, no field complete, no abandonment, no completion-rate tracking, naming mismatch with quote flow |
| `/entreprises` convention form | form start, field complete, abandonment, validation failure, submit failure, submit success | no field focus, placement/context standardization still needed |
| service-page CTA block | CTA impression, CTA click compatibility, WhatsApp, phone, devis clicks | needs stable `cta_id` taxonomy and parity across all commercial pages |
| article pages | read progress, read complete, CTA clicks | no consistent CTA impressions, no standardized article CTA placement taxonomy |
| dashboard funnel diagnostics | lifecycle-based `v1` only | CTA click, form start, form progression, and validation-failure steps are not persisted into a reporting mart |

## Implementation Checklist

### P0. Freeze naming and context first

- Keep the event transport exactly where it is:
  - client -> `pushAnalyticsEvent()`
  - server -> `sendLifecycleMeasurementEvent()`
- Freeze the canonical values in this doc before renaming helpers.
- Standardize on `contact_quote_form` instead of mixing `contact_form` on the client with `devis_request` / `quote_request` on the server.
- Require `page_type`, `business_line`, and `service_type` whenever a flow is commercial.
- Require `cta_id` and `cta_location` whenever a CTA is tracked.

### P1. Close the instrumentation gaps

#### Contact page quote form

Files:

- `src/app/contact/3-form/form.jsx`

Work:

- add `trackFormFieldFocus()` for all high-intent fields
- add `trackFormFieldComplete()` on first completion
- add `trackFormAbandonment()` on exit
- add time-to-submit tracking
- rename the funnel/form context to `contact_quote_form`
- pass explicit `page_type=contact_page` and `business_line=b2c`

#### Main quote form

Files:

- `src/app/devis/3-form/devisForm.jsx`
- `src/app/devis/3-form/devisForm.func.js`
- `src/app/devis/2-calculator/devisCalculator.func.js`

Work:

- extend field-focus tracking beyond the few currently focused inputs
- pass explicit `page_type=quote_page`, `business_line=b2c`, `form_placement=devis_page`
- keep calculator and submission contexts aligned on the same `service_type`

#### Convention form

Files:

- `src/app/entreprises/6-form/ConventionForm.func.js`

Work:

- add `trackFormFieldFocus()` coverage
- pass explicit `page_type=b2b_page`, `business_line=b2b`, `form_placement=entreprises_page`
- keep sector and selected-service context on validation and submit events

#### Service and article CTAs

Files:

- `src/utils/components/servicesComponents/leadCTA/leadCTA.jsx`
- `src/app/conseils/components/CTAButton/CTAButtons.jsx`
- `src/app/conseils/[slug]/ArticleAnalyticsWrapper.jsx`

Work:

- assign stable `cta_id` values
- keep `cta_location` values from the taxonomy in this doc
- add article CTA impression tracking, not just click tracking
- add article CTA placement milestones around 35% and 70% read depth when those CTAs exist

#### Page-type coverage

Files:

- service pages: `src/app/marbre/page.jsx`, `src/app/tapis/page.jsx`, `src/app/salon/page.jsx`, `src/app/tapisserie/page.jsx`, `src/app/tfc/page.jsx`, `src/app/entreprises/page.jsx`

Work:

- emit `view_page_type`
- standardize `view_service_page`
- ensure every commercial template passes explicit `page_type`, `business_line`, and `service_type`

### P2. Persist behavior into reporting

The next dashboard unlock is not more client events. It is a reporting mart for those events.

Minimum reporting grain:

- `event_date`
- `event_name`
- `page_type`
- `landing_page`
- `business_line`
- `service_type`
- `form_name`
- `step_name`
- `cta_id`
- `cta_location`
- `session_source`
- `session_medium`
- `session_campaign`

Minimum reporting metrics:

- `event_count`
- `unique_client_count`

Minimum joins:

- `ga_client_id`
- `landing_page`
- normalized attribution dimensions already used in dashboard reporting

Recommended next artifact:

- create a dedicated behavior/funnel mart so dashboard funnel diagnostics can start at:
  - CTA impression
  - CTA click
  - form start
  - field completion / validation failure
  - submit success
  - qualified
  - closed won

### P3. Update the dashboard after the mart exists

- upgrade `funnelDiagnostics` from lifecycle-only `v1` to full on-site behavior + lifecycle
- add validation-failure hotspots by form and field
- add contact-intent rollups by page type and landing page
- add CTA performance views by `cta_id` and `cta_location`

### P4. Use the stabilized data for targeted ads

Only after P0-P3 are stable should this measurement be used for serious ad activation.

At that point, the same schema can support:

- remarketing audiences based on service-page views + CTA clicks
- audiences based on quote calculator use without form completion
- qualified-lead and closed-won conversion imports
- segment-specific landing-page and ad creative testing

## Minimum Next Slice

If only one implementation sprint is available right now, do this in order:

1. Standardize naming:
   - `contact_quote_form`
   - `page_type`
   - `business_line`
   - `cta_id`
   - `cta_location`
2. Fill the contact-form instrumentation gap.
3. Persist form and CTA events into a reporting mart.
4. Rebuild `funnelDiagnostics` on top of that persisted behavior data.

That is the fastest path from "we track behavior" to "we can make trusted SEO, CRO, and later targeted-ads decisions."
