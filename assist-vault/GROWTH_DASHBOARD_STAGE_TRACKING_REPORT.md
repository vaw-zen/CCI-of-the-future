# Growth Dashboard Stage Tracking Report

Date: 2026-05-12

This report is the current execution checkpoint for engineering, Growth, and Admin ops. It tracks what is shipped, what remains open, and what must happen before Stage 4 experimentation can begin.

## Delivery Snapshot

| Stage | Status | Delivery state | Notes |
| --- | --- | --- | --- |
| Stage 0 | Complete | Program, semantics, taxonomy, and thresholds are locked in docs | Ready and in use |
| Stage 1 | Complete | Lead quality, ownership, SLA, stale-queue readiness, normalized dimensions, KPI semantics, trust signals, and attribution QA workflow are implemented | Ready to support segmented reviews |
| Stage 2 | Product complete, workflow adoption pending | Dashboard filters, segmented section outputs, executive summary, and dedicated pipeline navigation are implemented | Weekly review should continue moving to segment-first usage |
| Stage 3 | In progress, behavior layer shipped, stabilization pending | Query intelligence, content opportunities, landing-page scorecard, lifecycle funnel diagnostics, behavior persistence, and Stage 3 behavior panels are now live in product | Stage 3 gate remains open until live validation, workflow adoption, and heuristic tuning are completed across two review cycles |
| Stage 4 | Not started | Experiment operating system not yet built | Depends on stable Stage 3 evidence and formal gate review |
| Stage 5 | Not started | Alerts, digests, and proactive monitoring not yet built | Depends on stable Stage 3 baselines |
| Stage 6 | Deferred | Forecasting, ROI, attribution, and modeled planning remain deferred | Wait for 90+ days of stable segmented history |

## What Is Shipped

### Stage 0

- Audit, roadmap, execution program, semantics, metric definitions, runbook, and system guide are in `assist-vault`.
- KPI naming, taxonomy, and threshold decisions are documented and reflected in runtime behavior.
- Ownership expectations for Growth, Admin ops, and Engineering are defined.

### Stage 1

- Lead operations fields are live in the product and schema:
  - `lead_quality_outcome`
  - `lead_owner`
  - `follow_up_sla_at`
  - `last_worked_at`
- Admin ops can update those fields from the existing `devis` and `conventions` drawers.
- Dashboard operations now surface:
  - stale queue
  - SLA breaches
  - open lead quality mix
  - ownership coverage
- Dashboard KPI cards now carry canonical semantics, owner, and decision intent in payload.
- Thin-volume warnings ship for CPL, CPA, and lead-rate metrics.
- Normalized dimensions now exist across the reporting layer and metric builder:
  - `sourceClass`
  - `pageType`
  - `businessLine`
- Attribution hygiene now normalizes new lead payloads and reclassifies suspicious historical `direct/(none)` rows at read time using referrer evidence.
- A named weekly attribution QA workflow now exists through:
  - `npm run growth:audit:attribution -- --days 7`
  - `assist-vault/GROWTH_DASHBOARD_ATTRIBUTION_QA_CHECKLIST.md`
- WhatsApp attribution compatibility and fallback support are in place.

### Stage 2

- `GET /api/admin/dashboard` remains the only dashboard endpoint and now supports:
  - `from`
  - `to`
  - `businessLine`
  - `service`
  - `sourceClass`
  - `device`
  - `pageType`
- The API payload now includes:
  - `filters`
  - `executiveSummary`
  - segmented `overview`
  - segmented `pipeline`
  - segmented `acquisition`
  - segmented `seoContent`
  - segmented `operations`
- The dashboard UI now includes:
  - a segment control bar
  - an executive summary band
  - a dedicated `Pipeline` section tab
  - filter-aware context above the section views
- Executive summary now produces:
  - `trend`
  - `risk`
  - `opportunity`
  - `nextAction`
- Segment-first review workflow is scaffolded in:
  - `assist-vault/GROWTH_DASHBOARD_WEEKLY_REVIEW_TEMPLATE.md`

### Stage 3

- Search Console reporting persists query-level data into `growth_query_daily_metrics`.
- Supabase migration scaffolding exists for:
  - `growth_query_daily_metrics`
  - `growth_keyword_clusters`
  - `growth_landing_page_scores_daily`
  - upgraded `growth_funnel_daily_metrics`
- `GET /api/admin/dashboard` returns Stage 3 intelligence payloads:
  - `seoQueries`
  - `contentOpportunities`
  - `landingPageScorecard`
  - `funnelDiagnostics`
  - `ctaPerformance`
  - `contactIntent`
  - `formHealth`
- The dashboard UI exposes:
  - query intelligence summary
  - cluster rollups
  - non-branded query opportunities
  - content decay / cannibalization / CTR / conversion-gap opportunity lists
  - landing-page scorecard
  - lifecycle funnel diagnostics and top drop-offs
  - CTA performance rows
  - form-health rows
  - contact-intent rows
- Manual and scheduled Search Console refresh paths sync both page-level and query-level rows.
- GA4 evidence surfaces sessions, users, and events separately from Search Console clicks and impressions.
- GA4 import hardening deduplicates normalized snapshot conflicts before upsert so large backfills do not fail on `ON CONFLICT DO UPDATE`.
- Behavior capture now persists through:
  - `src/app/api/analytics/behavior/route.js`
  - `public.growth_behavior_events`
  - `public.growth_behavior_daily_metrics`
- Stage 3 sprint-selection workflow is scaffolded in:
  - `assist-vault/GROWTH_DASHBOARD_STAGE3_SPRINT_SELECTION_WORKFLOW.md`

### Behavior tracking integration

- `assist-vault/WEBSITE_BEHAVIOR_TRACKING_SCHEMA.md` is the canonical measurement spec.
- Current repo reality is now:
  - canonical behavior taxonomy is implemented in runtime normalization
  - behavior events are persisted into `growth_behavior_events`
  - dashboard-ready aggregates are exposed through `growth_behavior_daily_metrics`
  - `ctaPerformance`, `contactIntent`, and `formHealth` are live dashboard panels
  - `funnelDiagnostics` still remains lifecycle-based `v1` in the dashboard while the combined funnel read path stabilizes
- The closeout focus is now validation and adoption, not net-new Stage 3 feature invention.

## Verification Status

| Check | Result | Notes |
| --- | --- | --- |
| `npm run test:dashboard` | Pass | `41/41` green including behavior tracking, attribution hygiene, Stage 3 intelligence, and GA4 snapshot dedupe regression coverage |
| `npm run build` | Pass | Production build validates the shipped contract and UI |
| Behavior persistence route | Implemented | `/api/analytics/behavior` now ingests canonical behavior events |
| Behavior mart migration | Implemented in repo | `supabase/20260511_growth_behavior_tracking.sql` creates the raw table, daily mart, and upgraded funnel view |
| Admin auth redirect loop / stuck verification | Resolved | Admin auth now resolves server-side and avoids endless client-side verification |
| Dev startup lag caused by remote font boot dependency | Resolved | App shell no longer blocks dev startup on remote Google font fetch |
| Dev image optimizer `LRUCache` issue | Mitigated in development | Dev uses unoptimized images to avoid local optimizer failure |
| Dev/build cache collision breaking admin routes | Resolved | Development now writes to `.next-dev`, isolating `next dev` from production build artifacts |

## Stage Gates

| Stage | Gate status | Current read |
| --- | --- | --- |
| Stage 1 gate | Satisfied | Attribution QA is implemented in capture, server fallback, dashboard normalization, and weekly ops workflow |
| Stage 2 gate | Satisfied in product | Filters and executive summary work across overview, pipeline, acquisition, and SEO |
| Stage 3 gate | In progress | Query intelligence, behavior persistence, and behavior panels are shipped; the remaining gate is live validation of behavior joins plus two weekly review cycles of stable usage and threshold tuning |
| Stage 4 gate | Blocked | Experiments should not open until Stage 3 closeout is signed off |
| Stage 5 gate | Not yet open | Alert calibration should wait until Stage 3 is stable for at least two review cycles |

## Known Scope Notes

- `device` is currently an SEO-only segment in practice.
- Keyword visibility and ranking outputs respect `device`.
- Lead, pipeline, acquisition, and operations metrics remain cross-device until device-aware lead/acquisition inputs exist in the reporting model.
- The dashboard remains the only internal reporting surface; no parallel dashboard has been introduced.
- GA4 `events` extend the existing acquisition evidence model but do not change stage sequencing, ownership, or stage-gate criteria.
- `ctaPerformance`, `contactIntent`, and `formHealth` now provide pre-lead behavior evidence, but `funnelDiagnostics` is still intentionally labeled lifecycle-based `v1`.
- Stage 3 is not complete until the behavior mart is validated in the target environment and the weekly operating cadence actually uses the new panels.

## Roadmap Alignment

- These changes do not change the roadmap order.
- They strengthen existing stages instead of creating a new one:
  - attribution hygiene and import dedupe reinforce Stage 1 trust
  - GA4 events improve Stage 3 evidence quality
  - behavior persistence and panels extend Stage 3 rather than creating a separate analytics track
  - dev/build cache isolation protects delivery reliability across all active stages
- Stage 4, Stage 5, and Stage 6 remain unchanged in scope and timing.

## Remaining Open Items Before Stage 3 Is Fully Stabilized

| ID | Type | Owner | Status | Next step |
| --- | --- | --- | --- | --- |
| S2-05 | Workflow | Growth owner | Scaffolded in docs, adoption pending | Run the next two weekly reviews from the segment-first template and keep action logs tied to explicit segments |
| S3-07 | Workflow | Growth owner | Scaffolded in docs, adoption pending | Use the Stage 3 sprint-selection workflow to choose the next SEO refresh and CRO sprint candidates from Stage 3 evidence |
| S3-08 | Validation | Engineering + Growth owner | Open | Complete the Stage 3 closeout checklist, validate live data paths, and tune heuristics across two review cycles |
| S3-09 | Tracking | Engineering + Growth owner | Implemented in product, QA pending | Spot-check canonical behavior dimensions against live captures and fix any drift from `WEBSITE_BEHAVIOR_TRACKING_SCHEMA.md` |
| S3-10 | Tracking | Engineering | Implemented in product, live QA pending | Validate `/contact`, `/devis`, `/entreprises`, service CTAs, and article CTAs under real traffic and capture any missing context |
| S3-11 | Schema / ETL | Engineering | Implemented in repo, target DB validation pending | Confirm `growth_behavior_daily_metrics` is applied, fresh, and populated in the target environment |
| S3-12 | Metric-builder | Engineering | Partially implemented, stabilization pending | Keep dashboard `funnelDiagnostics` on lifecycle `v1` until the combined behavior + lifecycle read path is validated as decision-safe |
| S3-13 | UI | Engineering + Growth owner | Implemented in product, adoption pending | Make `ctaPerformance`, `contactIntent`, and `formHealth` mandatory CRO inputs in the next two weekly reviews |

## Recommended Next Implementation

### Next build target: Stage 3 closeout

Priority order:

1. Confirm `supabase/20260511_growth_behavior_tracking.sql` is applied in the target database.
2. Run `npm run growth:audit:stage3 -- --baseline-date=2026-05-12 --window-days=14 --lead-window-days=30` and use its output as the default Stage 3 closeout evidence pack.
3. Validate that these reporting artifacts exist and are populated for the active review window:
   - `growth_query_daily_metrics`
   - `growth_landing_page_scores_daily`
   - `growth_behavior_daily_metrics`
   - `growth_funnel_daily_metrics`
4. Validate live behavior capture on:
   - `/contact`
   - `/devis`
   - `/entreprises`
   - service CTA blocks
   - article CTA blocks
5. Validate joinability from behavior rows to lifecycle evidence through `ga_client_id`, landing page, and normalized attribution dimensions.
6. Run two weekly growth reviews directly from:
   - `seoQueries`
   - `contentOpportunities`
   - `landingPageScorecard`
   - `funnelDiagnostics`
   - `ctaPerformance`
   - `formHealth`
   - `contactIntent`
7. Record threshold updates after each review:
   - decay thresholds
   - CTR lift scoring
   - cannibalization detection
   - CTA drop-off thresholds
   - form-friction thresholds
   - contact-intent interpretation
8. Hold a formal Stage 3 gate review using:
   - `assist-vault/GROWTH_DASHBOARD_STAGE3_CLOSEOUT_CHECKLIST.md`
9. Only after that sign-off, open Stage 4 experimentation work and Stage 5 alert calibration.

### Why Stage 3 closeout next

- Stage 1 restored trust.
- Stage 2 created a usable segmented decision surface.
- Stage 3 now has both the query-intelligence layer and the behavior layer in product.
- The next leverage point is not more Stage 3 surface area. It is proving that the shipped Stage 3 evidence is trustworthy, adopted, and stable enough to become the experiment baseline.

## Current Program Assessment

| Dimension | Status |
| --- | --- |
| Trust in dashboard semantics | Strong and production-usable |
| Executive readability | Materially improved with `executiveSummary` |
| Segmentation readiness | Live for Stage 2 dimensions |
| SEO usefulness | Materially improved with query-level opportunity, cluster rollups, and content-opportunity scaffolding |
| CRO usefulness | Improved materially with landing-page scorecard, lifecycle funnel diagnostics, and the shipped behavior panels |
| Experiment readiness | Not yet operationalized; blocked on Stage 3 closeout |
| Automation maturity | Connector/source health exists, but proactive alerting and digests are not yet live |

## Checkpoint Summary

The program has completed the foundational architecture, the segmented decision layer, the first Stage 3 intelligence slice, and the first Stage 3 behavior slice.

- Stages shipped in product: Stage 1 and Stage 2
- Stage 3 status: behavior layer shipped, closeout pending
- Stages documented and locked: Stage 0 through Stage 6
- Highest-leverage next engineering move: validate the live behavior mart and close the Stage 3 gate
- Highest-leverage next operating move: run the next two weekly reviews from Stage 3 evidence and document any threshold changes before opening Stage 4
