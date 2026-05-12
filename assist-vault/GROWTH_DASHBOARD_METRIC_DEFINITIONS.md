# Growth Dashboard Metric Definitions

Date: 2026-05-12

This sheet is the source of truth for the upgraded admin growth dashboard. It defines what each KPI means, where it comes from, how often it refreshes, and what decision it is meant to support.

## Ownership defaults

| Owner | Responsibility |
| --- | --- |
| Growth owner | Acquisition, SEO/content, experiments, weekly review decisions |
| Admin ops | Lead follow-up queue, stale lead handling, CRM hygiene |
| Engineering | Connector health, schema integrity, dashboard correctness |

## Stage 1 runtime semantics

- KPI cards returned by the dashboard API now include `canonicalLabel`, `owner`, and `decisionIntent` metadata so the UI can render consistent definitions without rebuilding them client-side.
- Cost and rate metrics can include thin-volume warnings when sample size is too small to support reliable decisions.
- Lead and combined acquisition rows now expose dimension-ready normalization fields including `sourceClass`, `pageType`, and `businessLine`.
- Lead operations now persist `lead_quality_outcome`, `lead_owner`, `follow_up_sla_at`, and `last_worked_at`, and the operations section uses `last_worked_at` before lifecycle timestamps when determining whether an open lead is stale.
- Reporting reads can use `growth_channel_daily_metrics_normalized` and `growth_lead_reporting_dimensions` when normalized source, campaign, landing-page, and page-type dimensions are needed directly from Supabase.
- Attribution capture and ingestion now normalize source, medium, campaign, landing-page, and entry-path context, while weekly QA uses `npm run growth:audit:attribution`.

## Overview

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| New leads | Count of leads with `created_at` in selected range | `devis_requests`, `convention_requests` | Growth owner | Live | Are we generating enough new demand this period? |
| Qualified (activity) | Count of leads with `qualified_at` in selected range | `devis_requests`, `convention_requests` | Admin ops | Live | Is the team moving leads through the pipeline this period? |
| Wins (activity) | Count of leads with `closed_at` in selected range and status `closed_won` | `devis_requests`, `convention_requests` | Growth owner | Live | Are leads converting into real wins this period? |
| Cohort qualification rate | `created_in_range_that_reached_qualified_or_beyond / leads_created_in_range` | `devis_requests`, `convention_requests` | Growth owner | Live | Which acquisition periods produce qualified demand? |
| Cohort win rate | `created_in_range_currently_closed_won / leads_created_in_range` | `devis_requests`, `convention_requests` | Growth owner | Live | Which acquisition periods create win-ready leads? |
| Unattributed lead rate | `direct_or_missing_source_medium_leads / leads_created_in_range` | `devis_requests`, `convention_requests` | Engineering | Live | Is attribution quality degrading? |
| Estimated pipeline value | Sum of `calculator_estimate` for leads created in range | `devis_requests`, `convention_requests` | Growth owner | Live | Are we attracting higher-value demand? |

## Pipeline

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| Funnel cohort | Current status snapshot of leads created in selected range | `devis_requests`, `convention_requests` | Growth owner | Live | Where does the current lead cohort stall? |
| Avg hours to qualify | Average `qualified_at - submitted_at` on leads created in range | `devis_requests`, `convention_requests` | Admin ops | Live | Is qualification speed improving or slowing down? |
| Avg hours to close | Average `closed_at - submitted_at` on leads created in range | `devis_requests`, `convention_requests` | Growth owner | Live | How long does it take to close the current cohort? |
| Service mentions | Multi-service count across `services_souhaites` / `selected_services` for leads created in range | `devis_requests`, `convention_requests` | Growth owner | Live | Which service intents appear most often in current demand? |
| Primary service | Count of first commercial service associated with each lead in range | `devis_requests`, `convention_requests` | Growth owner | Live | Which service should own each lead as a primary line? |

## Acquisition

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| Sessions | Sum of `sessions` on reporting snapshots in range | `growth_channel_daily_metrics_normalized` (`ga4`) | Growth owner | Daily cron / manual refresh | Which channels are bringing traffic volume? |
| Events | Sum of `events` on reporting snapshots in range | `growth_channel_daily_metrics_normalized` (`ga4`) | Growth owner | Daily cron / manual refresh | Is traffic actually engaging with the site once it arrives? |
| Clicks | Sum of `clicks` on reporting snapshots in range | `growth_channel_daily_metrics_normalized` (`gsc`, `paid_manual`, `social_manual`) | Growth owner | Daily / manual | Which channels are generating actual visits or intent? |
| Impressions | Sum of `impressions` on reporting snapshots in range | `growth_channel_daily_metrics_normalized` | Growth owner | Daily / manual | Are campaigns and pages earning visibility? |
| Spend | Sum of `spend` on paid/social manual imports in range | `growth_channel_daily_metrics_normalized` (`paid_manual`, `social_manual`) | Growth owner | Daily / manual | How much did we invest to generate demand? |
| Cost per lead | `spend / leads_created_in_range` grouped by acquisition grain | `growth_channel_daily_metrics_normalized` + lead tables | Growth owner | Daily / live | Which channels create leads efficiently? |
| Cost per acquisition | `spend / current_wins_from_created_cohort` grouped by acquisition grain | `growth_channel_daily_metrics_normalized` + lead tables | Growth owner | Daily / live | Which channels are producing actual acquisitions? |
| Qualified leads by channel | Count of created-in-range leads that have reached qualified or beyond, grouped by `source + medium + campaign` | Lead tables + snapshots | Growth owner | Live / daily | Which channels generate commercially promising leads? |

## SEO & Content

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| Organic clicks | Sum of snapshot clicks where source is Google / medium organic | `growth_channel_daily_metrics_normalized` (`gsc`) | Growth owner | Daily cron / manual refresh | Which SEO pages are earning real search demand? |
| Organic CTR | `organic_clicks / organic_impressions` | `growth_channel_daily_metrics_normalized` (`gsc`) | Growth owner | Daily | Are snippets/title tags competitive enough? |
| Landing page lead rate | `leads / sessions` when sessions exist, otherwise `leads / clicks` | Lead tables + `growth_channel_daily_metrics_normalized` | Growth owner | Daily / live | Which landing pages convert traffic into leads? |
| Qualified leads by landing page | Count of created-in-range leads that reached qualified or beyond, grouped by `landing_page` | Lead tables | Growth owner | Live | Which pages attract quality demand, not just curiosity? |
| Tracked keywords | Count of active canonical keyword rows with valid targets | `growth_keyword_catalog` | Growth owner | On import / live read | Are we tracking the full keyword universe we care about? |
| Ranked keywords | Count of active keywords whose best current position is not null across desktop or mobile | `growth_keyword_catalog` + `growth_keyword_rankings_daily` | Growth owner | Daily / manual SERP sync | How many tracked keywords are currently visible in Google? |
| Desktop ranked keywords | Count of active keywords with a current desktop rank | `growth_keyword_catalog` + `growth_keyword_rankings_daily` | Growth owner | Daily / manual SERP sync | Is desktop visibility improving or falling? |
| Mobile ranked keywords | Count of active keywords with a current mobile rank | `growth_keyword_catalog` + `growth_keyword_rankings_daily` | Growth owner | Daily / manual SERP sync | Is mobile visibility improving or falling? |
| Average current position | Average of each ranked keyword's best current position, where best current position = `min(latest_desktop_position, latest_mobile_position)` | `growth_keyword_catalog` + `growth_keyword_rankings_daily` | Growth owner | Daily / manual SERP sync | Are our tracked keywords moving upward or downward overall? |
| Top 10 keywords | Count of ranked keywords whose best current position is `<= 10` | `growth_keyword_catalog` + `growth_keyword_rankings_daily` | Growth owner | Daily / manual SERP sync | Are more of our tracked keywords entering page one? |
| Keyword visibility trend | Daily counts of ranked and top-10 keywords by device | `growth_keyword_rankings_daily` | Growth owner | Daily / manual SERP sync | Is visibility expanding across the tracked keyword set? |
| Keyword average position trend | Daily average and best ranked position by device | `growth_keyword_rankings_daily` | Growth owner | Daily / manual SERP sync | Are rank gains real, or are we only changing visibility counts? |

## Operations

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| Stale queue | Open leads with `last_worked_at` older than `48h`, falling back to the latest open-stage lifecycle timestamp when no work timestamp exists | `devis_requests`, `convention_requests` | Admin ops | Live | Which leads need follow-up now? |
| Follow-up SLA breaches | Open leads whose `follow_up_sla_at` is in the past and whose `last_worked_at` has not met that deadline | `devis_requests`, `convention_requests` | Admin ops | Live | Which leads are breaching the follow-up promise? |
| Lead quality mix | Breakdown of open leads by `lead_quality_outcome` | `devis_requests`, `convention_requests` | Admin ops | Live | Is the open queue reviewed and commercially triaged? |
| Latest submissions | Most recent `submitted_at` values across both lead tables | `devis_requests`, `convention_requests` | Admin ops | Live | What came in most recently? |
| Lifecycle trend | Daily counts of `created_at`, `qualified_at`, `closed_at` in range | Lead tables | Admin ops | Live | Is throughput improving across the lifecycle? |
| Recent admin activity | Latest rows from `admin_lead_status_events` | `admin_lead_status_events` | Engineering / Admin ops | Live | Are status changes happening as expected, and were any rejected? |

## Stage 3 behavior metrics

These definitions now power the Stage 3 behavior panels. They are live runtime evidence for CRO prioritization, but they should still be treated as stabilization metrics until the Stage 3 closeout gate is satisfied.

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| CTA impression rate | `unique_clients_with_cta_impression / unique_clients_with_page_view` grouped by `landing_page`, `page_type`, `cta_id`, and `cta_location` | `growth_behavior_daily_metrics` | Growth owner | Daily once the behavior mart is populated | Are the right CTAs actually being seen on the pages that matter? |
| CTA click-through rate | `unique_clients_with_cta_click / unique_clients_with_cta_impression` grouped by `cta_id` and `cta_location` | `growth_behavior_daily_metrics` | Growth owner | Daily once the behavior mart is populated | Which CTA copy or placement turns visibility into intent? |
| Form-start rate | `unique_clients_with_form_start / unique_clients_with_page_view` grouped by `form_name`, `landing_page`, and `form_placement` | `growth_behavior_daily_metrics` | Growth owner | Daily once the behavior mart is populated | Which pages and placements are strong enough to make visitors begin the form? |
| Validation-failure rate | `unique_clients_with_validation_failed / unique_clients_with_form_start` grouped by `form_name` and `field_name` when available | `growth_behavior_daily_metrics` | Engineering + Growth owner | Daily once the behavior mart is populated | Which forms or fields create avoidable friction? |
| Form abandonment rate | `unique_clients_with_form_abandonment / unique_clients_with_form_start` grouped by `form_name` and `form_placement` | `growth_behavior_daily_metrics` | Growth owner | Daily once the behavior mart is populated | Where do users start but fail to finish the funnel? |
| Submit-success rate | `unique_clients_with_submit_success / unique_clients_with_form_start` grouped by `form_name`, `service_type`, and `landing_page` | `growth_behavior_daily_metrics` + upgraded `growth_funnel_daily_metrics` | Growth owner | Daily once the behavior mart is populated | Which forms turn intent into successful submission before lead-quality review? |
| Contact-intent rate by method | `unique_clients_with_contact_intent / unique_clients_with_page_view` grouped by `contact_method` (`form`, `phone`, `email`, `whatsapp`) and page context | `growth_behavior_daily_metrics` | Growth owner | Daily once the behavior mart is populated | Which contact method should be prioritized by page, audience, and business line? |

## Data health

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| Source freshness | Latest success timestamp or latest metric date vs source threshold | `growth_reporting_source_health` | Engineering | Live / daily | Can the dashboard be trusted right now? |
| Connector status | Explicit source state: `fresh`, `stale`, `missing`, `error` | `growth_reporting_source_health` | Engineering | Live / daily | Which upstream system needs attention? |
| SERP keyword sync health | Latest successful keyword sync, latest metric date, tracked keyword count, and per-device row counts | `growth_reporting_source_health` (`serp_keyword_rankings`) | Engineering | Daily / manual SERP sync | Are keyword rankings current and complete for both desktop and mobile? |

## Notes

- Thin-volume warnings should appear when:
  - leads `< 5` for cost per lead
  - wins `< 3` for cost per acquisition
  - sessions `< 20` or clicks `< 20` for lead-rate calculations
- Attribution quality should be reviewed whenever unattributed lead rate exceeds `25%`, and escalated immediately above `40%`.
- Executive summary attribution risk should be treated as directional only when the filtered cohort is below `5 leads`, even if the unattributed rate is high.
- Weekly attribution QA should be run with `npm run growth:audit:attribution -- --days 7` before using CPL, CPA, or landing-page efficiency in the growth review.
- Stage 3 behavior metrics should use canonical names from `WEBSITE_BEHAVIOR_TRACKING_SCHEMA.md`, especially `contact_quote_form`, `cta_click`, `cta_id`, and `cta_location`.
- Pipeline and revenue decisions should continue to use server-confirmed lifecycle metrics even after behavior metrics ship; behavior data explains intent and friction but does not replace business outcomes.
- Keyword reference fields in `growth_keyword_catalog` such as imported position, CTR, and CSV trend labels are baseline reference metadata only.
- Live keyword KPIs and keyword trend charts in the dashboard come from `growth_keyword_rankings_daily`.
- The dashboard now separates keyword visibility trend from keyword average position trend. The old `trend` payload key remains only as a backward-compatible alias to visibility.
