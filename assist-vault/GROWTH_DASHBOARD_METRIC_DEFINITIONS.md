# Growth Dashboard Metric Definitions

Date: 2026-05-06

This sheet is the source of truth for the upgraded admin growth dashboard. It defines what each KPI means, where it comes from, how often it refreshes, and what decision it is meant to support.

## Ownership defaults

| Owner | Responsibility |
| --- | --- |
| Growth owner | Acquisition, SEO/content, experiments, weekly review decisions |
| Admin ops | Lead follow-up queue, stale lead handling, CRM hygiene |
| Engineering | Connector health, schema integrity, dashboard correctness |

## Overview

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| New leads | Count of leads with `created_at` in selected range | `devis_requests`, `convention_requests` | Growth owner | Live | Are we generating enough new demand this period? |
| Qualified (activity) | Count of leads with `qualified_at` in selected range | `devis_requests`, `convention_requests` | Admin ops | Live | Is the team moving leads through the pipeline this period? |
| Wins (activity) | Count of leads with `closed_at` in selected range and status `closed_won` | `devis_requests`, `convention_requests` | Growth owner | Live | Are leads converting into real wins this period? |
| Cohort qualification rate | `created_in_range_that_reached_qualified_or_beyond / leads_created_in_range` | `devis_requests`, `convention_requests` | Growth owner | Live | Which acquisition periods produce qualified demand? |
| Cohort win rate | `created_in_range_currently_closed_won / leads_created_in_range` | `devis_requests`, `convention_requests` | Growth owner | Live | Which acquisition periods create win-ready leads? |
| Unattributed lead rate | `direct_or_missing_source_medium_leads / leads_created_in_range` | `devis_requests`, `convention_requests` | Engineering | Live | Is attribution quality degrading? |
| Revenue proxy | Sum of `calculator_estimate` for leads created in range | `devis_requests`, `convention_requests` | Growth owner | Live | Are we attracting higher-value demand? |

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
| Sessions | Sum of `sessions` on reporting snapshots in range | `growth_channel_daily_metrics` (`ga4`) | Growth owner | Daily 06:00 Africa/Tunis | Which channels are bringing traffic volume? |
| Clicks | Sum of `clicks` on reporting snapshots in range | `growth_channel_daily_metrics` (`gsc`, `paid_manual`, `social_manual`) | Growth owner | Daily / manual | Which channels are generating actual visits or intent? |
| Impressions | Sum of `impressions` on reporting snapshots in range | `growth_channel_daily_metrics` | Growth owner | Daily / manual | Are campaigns and pages earning visibility? |
| Spend | Sum of `spend` on paid/social manual imports in range | `growth_channel_daily_metrics` (`paid_manual`, `social_manual`) | Growth owner | Daily / manual | How much did we invest to generate demand? |
| CPL | `spend / leads_created_in_range` grouped by acquisition grain | `growth_channel_daily_metrics` + lead tables | Growth owner | Daily / live | Which channels create leads efficiently? |
| CPA | `spend / current_wins_from_created_cohort` grouped by acquisition grain | `growth_channel_daily_metrics` + lead tables | Growth owner | Daily / live | Which channels are producing actual acquisitions? |
| Qualified leads by channel | Count of created-in-range leads that have reached qualified or beyond, grouped by `source + medium + campaign` | Lead tables + snapshots | Growth owner | Live / daily | Which channels generate commercially promising leads? |

## SEO & Content

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| Organic clicks | Sum of snapshot clicks where source is Google / medium organic | `growth_channel_daily_metrics` (`gsc`) | Growth owner | Daily 06:00 Africa/Tunis | Which SEO pages are earning real search demand? |
| Organic CTR | `organic_clicks / organic_impressions` | `growth_channel_daily_metrics` (`gsc`) | Growth owner | Daily | Are snippets/title tags competitive enough? |
| Landing page lead rate | `leads / sessions` when sessions exist, otherwise `leads / clicks` | Lead tables + `growth_channel_daily_metrics` | Growth owner | Daily / live | Which landing pages convert traffic into leads? |
| Qualified leads by landing page | Count of created-in-range leads that reached qualified or beyond, grouped by `landing_page` | Lead tables | Growth owner | Live | Which pages attract quality demand, not just curiosity? |

## Operations

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| Stale queue | Open leads with last open-stage timestamp older than `48h` | `devis_requests`, `convention_requests` | Admin ops | Live | Which leads need follow-up now? |
| Latest submissions | Most recent `submitted_at` values across both lead tables | `devis_requests`, `convention_requests` | Admin ops | Live | What came in most recently? |
| Lifecycle trend | Daily counts of `created_at`, `qualified_at`, `closed_at` in range | Lead tables | Admin ops | Live | Is throughput improving across the lifecycle? |
| Recent admin activity | Latest rows from `admin_lead_status_events` | `admin_lead_status_events` | Engineering / Admin ops | Live | Are status changes happening as expected, and were any rejected? |

## Data health

| KPI | Formula | Source table / API | Owner | Refresh cadence | Intended decision |
| --- | --- | --- | --- | --- | --- |
| Source freshness | Latest success timestamp or latest metric date vs source threshold | `growth_reporting_source_health` | Engineering | Live / daily | Can the dashboard be trusted right now? |
| Connector status | Explicit source state: `fresh`, `stale`, `missing`, `error` | `growth_reporting_source_health` | Engineering | Live / daily | Which upstream system needs attention? |
