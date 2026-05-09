# Growth Dashboard System Guide

Date: 2026-05-09

This guide documents the full growth dashboard system that now powers `/admin/dashboard`. It covers the shipped dashboard UI, API contract, Supabase reporting model, keyword catalog flow, dual-device SERP tracking, data-health behavior, and the admin auth stability fix that keeps admin pages usable during background session refreshes.

## Scope

The completed work includes:

- Upgrading the existing admin dashboard instead of creating a second reporting surface
- Keeping `GET /api/admin/dashboard` as the single dashboard entrypoint, now with date + Stage 2 segment filters and sectioned responses
- Adding a Supabase reporting layer for GA4, Search Console, paid media, and social media snapshots
- Adding a keyword reference and canonical catalog flow driven by a cleaned CSV and stored in Supabase
- Tracking live keyword rankings from SerpApi on both `desktop` and `mobile`
- Adding source-health reporting so missing or stale connectors are visible in the UI
- Stabilizing admin auth refreshes so background Supabase token events no longer blank admin pages
- Separating keyword visibility trend from true keyword position trend in the SEO dashboard section
- Adding Stage 1 lead-quality operations fields and admin controls for queue ownership, SLA, and last-worked tracking
- Adding normalized Supabase reporting views for acquisition and lead-dimension rollups
- Adding the first Stage 3 growth intelligence layer with query-level Search Console persistence, content opportunities, landing-page scoring, and lifecycle funnel diagnostics

## Core Files

| Area | Files |
| --- | --- |
| Dashboard UI | `src/app/admin/dashboard/page.jsx` |
| Dashboard API | `src/app/api/admin/dashboard/route.js` |
| Lead ops APIs | `src/app/api/admin/leads/[kind]/[id]/status/route.js`, `src/app/api/admin/leads/[kind]/[id]/attribution/route.js`, `src/app/api/admin/leads/[kind]/[id]/ops/route.js` |
| Dashboard metric builders | `src/libs/adminDashboardMetrics.mjs` |
| Growth reporting connectors and sync logic | `src/libs/growthReporting.mjs` |
| Keyword catalog normalization and import logic | `src/libs/growthKeywordCatalog.mjs` |
| Lead schema compatibility helpers | `src/libs/leadTrackingSchemaCompat.mjs` |
| Site inventory / valid target discovery | `src/libs/sitePathInventory.mjs` |
| Admin auth stability | `src/hooks/useAdminAuth.js` |
| Growth scripts | `scripts/growth/*` |
| Growth SQL migrations | `supabase/20260506_growth_reporting.sql`, `supabase/20260506_growth_keyword_rankings.sql`, `supabase/20260506_growth_keyword_catalog.sql`, `supabase/20260509_stage1_lead_quality_dimensions.sql`, `supabase/20260509_stage3_growth_intelligence.sql` |
| Consolidated schema | `supabase/schema.sql` |

## Supabase Model

The growth dashboard is now backed by seven reporting tables plus five reporting views:

| Table | Purpose |
| --- | --- |
| `growth_channel_daily_metrics` | Daily acquisition, traffic, click, impression, and spend snapshots from GA4, GSC, and manual paid/social imports |
| `growth_reporting_source_health` | Freshness, status, last success, and connector metadata for each dashboard source |
| `growth_keyword_reference_imports` | Import batches for source keyword CSV files |
| `growth_keyword_reference_rows` | Raw imported keyword CSV rows, preserved exactly as imported |
| `growth_keyword_catalog` | Canonical active/inactive keyword catalog keyed by normalized keyword plus canonical target |
| `growth_keyword_rankings_daily` | Daily live SERP ranking snapshots per keyword, per device, linked back to the canonical catalog row |
| `growth_query_daily_metrics` | Daily query-level Search Console rows linked to landing pages, clusters, business lines, services, and page types |
| `growth_channel_daily_metrics_normalized` | Normalized source / medium / campaign / landing-page view with `source_class` and `page_type` ready for segmentation |
| `growth_lead_reporting_dimensions` | Unified lead-dimension view across `devis_requests` and `convention_requests` including `business_line`, `lead_quality_outcome`, `lead_owner`, `follow_up_sla_at`, and `last_worked_at` |
| `growth_keyword_clusters` | Active keyword catalog rollup view that maps keywords into reusable query/content clusters |
| `growth_funnel_daily_metrics` | Lifecycle-based funnel view by date, business line, service, source class, and page type |
| `growth_landing_page_scores_daily` | Landing-page scoring view blending traffic, qualified demand, wins, and estimated pipeline value |

Apply these migrations in order on any new environment:

1. `supabase/20260506_growth_reporting.sql`
2. `supabase/20260506_growth_keyword_rankings.sql`
3. `supabase/20260506_growth_keyword_catalog.sql`
4. `supabase/20260509_stage1_lead_quality_dimensions.sql`
5. `supabase/20260509_stage3_growth_intelligence.sql`

## Dashboard API Contract

`GET /api/admin/dashboard` remains the only admin dashboard endpoint.

Supported query params:

- `from`
- `to`
- `businessLine`
- `service`
- `sourceClass`
- `device`
- `pageType`

It now returns these top-level sections:

- `filters`
- `executiveSummary`
- `overview`
- `pipeline`
- `acquisition`
- `seoQueries`
- `contentOpportunities`
- `landingPageScorecard`
- `funnelDiagnostics`
- `seoContent`
- `operations`
- `dataHealth`

The dashboard is intentionally PII-safe. It uses aggregates, keyword summaries, landing-page rollups, and safe drilldown rows rather than raw lead payloads.

Important Stage 2 scope note:

- `device` currently scopes keyword visibility and ranking snapshots only
- Lead, pipeline, acquisition, and operations sections remain cross-device until a device dimension exists in lead and acquisition reporting inputs
- Stage 3 query intelligence is also currently cross-device because query-level Search Console persistence does not yet store a device dimension

## Stage 3 Intelligence Layer

The first Stage 3 slice adds four decision-oriented payloads on top of the Stage 2 segmented dashboard:

- `seoQueries`: query-level demand, non-branded opportunity, and cluster rollups
- `contentOpportunities`: CTR lift, decay-risk, cannibalization-watch, and conversion-gap candidates
- `landingPageScorecard`: ranked landing pages scored by demand, qualified pipeline, wins, and estimated value
- `funnelDiagnostics`: lifecycle-based funnel `v1` with top drop-off segments

Important Stage 3 scope notes:

- `funnelDiagnostics` currently starts at lead creation, not CTA click or form start
- CTA/form-step diagnostics require persisted event marts that do not exist yet
- `landingPageScorecard` is directional prioritization, not financial forecasting
- `contentOpportunities` uses heuristics that should be reviewed after each weekly growth review until the thresholds stabilize

## Keyword Data Model and Trend Semantics

The keyword portion of the dashboard has two distinct data layers:

- `growth_keyword_catalog`: the reference and targeting layer imported from the cleaned CSV
- `growth_keyword_rankings_daily`: the live daily ranking history from SerpApi

Important distinction:

- Catalog fields such as `reference_current_position`, `reference_ctr`, `reference_last_updated`, and `trend_tags` are imported reference metadata from the cleaned CSV
- Live dashboard ranking KPIs and charts come from `growth_keyword_rankings_daily`, not from those reference fields

The SEO keyword payload now exposes:

- `totals.trackedKeywords`
- `totals.rankedKeywords`
- `totals.desktopRankedKeywords`
- `totals.mobileRankedKeywords`
- `totals.averagePosition`
- `totals.top10Count`
- `visibilityTrend`
- `positionTrend`
- `trend`

`trend` is kept only as a backward-compatible alias and points to `visibilityTrend`.

Current chart meaning:

- `visibilityTrend`: daily counts of ranked and top-10 keywords by device
- `positionTrend`: daily average/best ranked position by device

If only one ranked snapshot day exists, the position chart should show an insufficient-history state instead of implying a real trend.

## Keyword Catalog Workflow

The keyword workflow is:

1. Source CSV arrives
2. `scripts/growth/prepare-keyword-csv.mjs` validates and cleans it
3. Cleaned output is written to `scripts/growth/data/seo-keywords.cleaned.csv`
4. URL remaps come from `scripts/growth/data/seo-keywords-url-map.json`
5. Raw rows are stored in `growth_keyword_reference_rows`
6. Canonical rows are upserted into `growth_keyword_catalog`
7. Missing rows from newer imports are marked inactive, not deleted
8. SerpApi sync reads only active catalog rows
9. Live rankings are written to `growth_keyword_rankings_daily` for both `desktop` and `mobile`

### Target Selection Rules

Valid targets come from:

- static/service URLs in the sitemap route inventory
- priority sitemap URLs
- all `/conseils/<slug>` paths derived from the article source

Broad or invalid targets are reclassified using these rules:

- marbre-family keywords -> `/marbre`
- tapis / moquette-family keywords -> `/tapis`
- tapisserie-family keywords -> `/tapisserie`
- B2B / professional broad keywords -> `/entreprises`
- local broad keywords -> matching local `conseils` article when available
- homepage stays reserved for true brand/navigational keywords only

## Connector Setup

### Supabase

Required for all growth features:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### GA4

Required for dashboard acquisition snapshots:

- `GA4_PROPERTY_ID`
- `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` or `GSC_CREDENTIALS`

Related but separate from dashboard population:

- `GA4_MEASUREMENT_ID`
- `GA4_API_SECRET`

Use the numeric GA4 property ID, not the `G-...` measurement ID.

### Search Console

Required for SEO snapshot imports:

- `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` or `GSC_CREDENTIALS`
- `GSC_SITE_URL` or `NEXT_PUBLIC_SITE_URL`

Use the URL-prefix property for `GSC_SITE_URL`, for example:

```env
GSC_SITE_URL=https://cciservices.online/
```

Do not use the `sc-domain:...` value for this dashboard setup unless the implementation is intentionally changed later.

Search Console refresh now writes two layers:

- page-level rows into `growth_channel_daily_metrics`
- query-level rows into `growth_query_daily_metrics`

### SerpApi

Required for live keyword rankings:

- `SERPAPI_API_KEY` or `SERPAPI_KEY`
- `SERPAPI_TARGET_DOMAIN` or `NEXT_PUBLIC_SITE_URL`

Optional tuning:

- `SERPAPI_NUM`
- `SERPAPI_GOOGLE_DOMAIN`
- `SERPAPI_GL`
- `SERPAPI_HL`
- `SERPAPI_LOCATION`

### Cron

Required for the protected refresh route:

- `CRON_SECRET`

`vercel.json` currently schedules:

- `/api/internal/growth-reporting/refresh` at `0 5 * * *`

### Paid and Social Media

Paid and social connectors are manual in this version. Populate them by importing CSV snapshots into `growth_channel_daily_metrics`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run analytics:validate` | Validate analytics event wiring |
| `npm run growth:refresh` | Refresh GA4 and GSC reporting snapshots together |
| `npm run growth:import:ga4` | Import GA4 daily snapshots |
| `npm run growth:import:gsc` | Import Search Console daily snapshots |
| `npm run growth:import:csv -- <csvPath> <channelGroup> <metricSource>` | Import paid or social manual CSV snapshots |
| `npm run growth:prepare:keyword-csv -- <csvPath>` | Clean keyword CSV, rebuild catalog, and upsert Supabase rows |
| `npm run growth:prepare:keyword-csv -- <csvPath> --skip-supabase` | Dry-run keyword cleaning without writing to Supabase |
| `npm run growth:import:serp` | Fetch live keyword rankings for active catalog rows on desktop and mobile |
| `npm run test:dashboard` | Run dashboard, payload, and keyword catalog tests |
| `npm run build` | Production build validation |

### Common First-Time Setup Sequence

```bash
npm run growth:import:ga4
npm run growth:import:gsc
npm run growth:prepare:keyword-csv -- '/absolute/path/to/seo-keywords.csv'
npm run growth:import:serp
npm run analytics:validate
npm run test:dashboard
npm run build
```

### Manual Paid / Social Import Example

```bash
npm run growth:import:csv -- ./reports/paid.csv paid_media paid_manual
npm run growth:import:csv -- ./reports/social.csv social_media social_manual
```

Expected CSV columns:

- `metric_date` or `date`
- `source`
- `medium`
- `campaign`
- `landing_page` or `landingPage`
- `sessions`
- `users`
- `clicks`
- `impressions`
- `spend`

## Source Health Cards

The dashboard source-health section now tracks:

- `supabase_live`
- `ga4`
- `search_console`
- `serp_keyword_rankings`
- `paid_media`
- `social_media`

Each source can be marked as:

- `fresh`
- `stale`
- `missing`
- `error`

The source-health row stores:

- latest attempt time
- latest success time
- freshest metric date
- connector type
- summary message
- metadata such as row counts and device counts

## Admin Auth Stability Fix

Admin pages that use `useAdminAuth()` no longer blank the screen on every background auth refresh event.

Behavior now:

- the full-screen admin privilege check only blocks on first bootstrap
- `TOKEN_REFRESHED` and `USER_UPDATED` rechecks are non-blocking
- auth checks have an `8000ms` timeout
- `last_login` writes no longer block refresh events

This applies to admin surfaces that share the hook, including the dashboard and other admin pages.

## Troubleshooting

### Env vars are present but the dashboard is still empty

The dashboard reads Supabase snapshot tables. Adding env vars alone does not populate those tables. Run the import commands.

### `Missing active growth keyword catalog rows`

This means `growth_keyword_catalog` does not have active rows in the environment the script is using. Re-run:

```bash
npm run growth:prepare:keyword-csv -- '/absolute/path/to/seo-keywords.csv'
```

Then run:

```bash
npm run growth:import:serp
```

### SERP sync looks stuck

The SERP sync is sequential and can take several minutes for a full catalog because it runs one request per keyword per device. It now prints progress periodically.

### Is it safe to rerun `growth:import:serp`?

Yes for the database, because same-day keyword/device rows are upserts. No duplicate same-day rows should be created. The real cost is SerpApi credits.

### Why are old keyword rows still in the catalog?

Rows from earlier imports are kept and marked `active=false` when a newer cleaned import moves them to a better target. This is expected after URL remap corrections.

### Why is the keyword trend missing?

Usually one of these is true:

- there is only one snapshot day in `growth_keyword_rankings_daily`
- the chart being inspected is visibility, not average position
- historical ranking rows are tied to old inactive catalog targets and no longer match the current active catalog

### Why does admin verification keep hanging when returning to a tab?

That behavior should be fixed by `src/hooks/useAdminAuth.js`. If it appears again, confirm the deployed environment includes the shared auth-hook update.

### Local dev shows a missing `.next/.../page.js` module

This is usually a corrupted local dev cache. Remove `.next` and restart `npm run dev`.

## Verification Queries

Use these quick checks in Supabase:

```sql
select source_key, status, last_success_at, freshest_metric_date
from growth_reporting_source_health
order by source_key;
```

```sql
select count(*) as active_keywords
from growth_keyword_catalog
where active = true;
```

```sql
select
  metric_date,
  device,
  count(*) as rows,
  count(*) filter (where is_ranked and position is not null) as ranked_rows,
  avg(position) filter (where is_ranked and position is not null) as avg_position
from growth_keyword_rankings_daily
group by 1, 2
order by 1 desc, 2;
```

## Acceptance Checklist

Before considering the dashboard ready:

- all growth SQL migrations are applied
- GA4 and GSC imports succeed
- manual paid/social imports are loaded if required
- keyword CSV is cleaned and catalog rows are active
- SERP sync has populated both desktop and mobile rankings
- source-health cards reflect real freshness states
- `npm run analytics:validate` passes
- `npm run test:dashboard` passes
- `npm run build` passes
