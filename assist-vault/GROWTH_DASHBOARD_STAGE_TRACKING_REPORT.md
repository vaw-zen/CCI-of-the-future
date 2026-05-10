# Growth Dashboard Stage Tracking Report

Date: 2026-05-10

This report tracks what has been shipped in the growth dashboard program so far, what remains open, and what should happen next. It is meant to be the current execution checkpoint for engineering, Growth, and Admin ops.

## Delivery Snapshot

| Stage | Status | Delivery state | Notes |
| --- | --- | --- | --- |
| Stage 0 | Complete | Program, semantics, taxonomy, and thresholds are locked in docs | Ready and in use |
| Stage 1 | Complete | Lead quality, ownership, SLA, stale-queue readiness, normalized dimensions, KPI semantics, trust signals, and attribution QA workflow are implemented | Ready to support segmented reviews |
| Stage 2 | Product complete, workflow adoption pending | Dashboard filters, segmented section outputs, executive summary, and dedicated pipeline navigation are implemented | Weekly review should now move to segment-first usage |
| Stage 3 | In progress, first slice shipped | Query intelligence, content opportunities, landing-page scorecard, lifecycle funnel diagnostics, and GA4 event-aware organic evidence are now live in the product | Needs workflow adoption plus two review cycles of stability before downstream automation |
| Stage 4 | Not started | Experiment operating system not yet built | Depends on stable Stage 3 evidence |
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
- WhatsApp attribution compatibility/fallback support is in place.

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

### Stage 3

- Search Console reporting now persists query-level data into `growth_query_daily_metrics`.
- Supabase migration scaffolding now exists for:
  - `growth_query_daily_metrics`
  - `growth_keyword_clusters`
  - `growth_funnel_daily_metrics`
  - `growth_landing_page_scores_daily`
- `GET /api/admin/dashboard` now returns Stage 3 intelligence payloads:
  - `seoQueries`
  - `contentOpportunities`
  - `landingPageScorecard`
  - `funnelDiagnostics`
- The dashboard UI now exposes:
  - query intelligence summary
  - cluster rollups
  - non-branded query opportunities
  - content decay / cannibalization / CTR / conversion-gap opportunity lists
  - landing-page scorecard
  - lifecycle funnel diagnostics and top drop-offs
- Manual and scheduled Search Console refresh paths now sync both page-level and query-level rows.
- Funnel diagnostics are intentionally labeled as lifecycle-based `v1` because CTA/form-start/form-completion events are not yet persisted in the reporting mart.
- GA4 evidence now surfaces sessions, users, and events separately from Search Console clicks and impressions.
- GA4 import hardening now deduplicates normalized snapshot conflicts before upsert so large backfills do not fail on `ON CONFLICT DO UPDATE`.

## Verification Status

| Check | Result | Notes |
| --- | --- | --- |
| `npm run test:dashboard` | Pass | `37/37` green including attribution hygiene, Stage 3 intelligence coverage, and GA4 snapshot dedupe regression coverage |
| `npm run build` | Pass | Production build validates the shipped contract and UI |
| Admin auth redirect loop / stuck verification | Resolved | Admin auth now resolves server-side and avoids endless client-side verification |
| Dev startup lag caused by remote font boot dependency | Resolved | App shell no longer blocks dev startup on remote Google font fetch |
| Dev image optimizer `LRUCache` issue | Mitigated in development | Dev uses unoptimized images to avoid local optimizer failure |
| Dev/build cache collision breaking admin routes | Resolved | Development now writes to `.next-dev`, isolating `next dev` from production build artifacts |

## Stage Gates

| Stage | Gate status | Current read |
| --- | --- | --- |
| Stage 1 gate | Satisfied | Attribution QA is implemented in capture, server fallback, dashboard normalization, and weekly ops workflow |
| Stage 2 gate | Satisfied in product | Filters and executive summary work across overview, pipeline, acquisition, and SEO |
| Stage 3 gate | In progress | Stage 3 marts and payloads now exist; the remaining gate is semantic stability across at least two weekly review cycles |
| Stage 5 gate | Not yet open | Alert calibration should wait until Stage 3 is stable for at least two review cycles |

## Known Scope Notes

- `device` is currently an SEO-only segment in practice.
- Keyword visibility and ranking outputs respect `device`.
- Lead, pipeline, acquisition, and operations metrics remain cross-device until device-aware lead/acquisition inputs exist in the reporting model.
- The dashboard remains the only internal reporting surface; no parallel dashboard has been introduced.
- GA4 `events` extend the existing acquisition evidence model but do not change stage sequencing, ownership, or stage-gate criteria.

## Roadmap Alignment

- These changes do not change the roadmap order.
- They strengthen existing stages instead of creating a new one:
  - attribution hygiene and import dedupe reinforce Stage 1 trust
  - GA4 events improve Stage 3 evidence quality
  - dev/build cache isolation protects delivery reliability across all active stages
- Stage 4, Stage 5, and Stage 6 remain unchanged in scope and timing.

## Remaining Open Items Before Stage 3 Is Fully Stabilized

| ID | Type | Owner | Status | Next step |
| --- | --- | --- | --- | --- |
| S2-05 | Workflow | Growth owner | Open | Require weekly review actions to reference a dashboard segment, not just top-line totals |
| S3-07 | Workflow | Growth owner | Open | Make `seoQueries`, `contentOpportunities`, `landingPageScorecard`, and `funnelDiagnostics` the default input for SEO and CRO sprint selection |
| S3-08 | Validation | Engineering + Growth owner | Open | Validate Stage 3 outputs across two weekly review cycles and tune heuristics for decay, CTR lift, and drop-off prioritization |

## Recommended Next Implementation

### Next build target: Stage 3 stabilization

Priority order:

1. Apply the Stage 3 migration on every target database and confirm scheduled refreshes are writing query rows daily.
2. Run two weekly growth reviews directly from `seoQueries`, `contentOpportunities`, `landingPageScorecard`, and `funnelDiagnostics`.
3. Tune Stage 3 heuristics with real review feedback:
   - decay thresholds
   - CTR lift scoring
   - cannibalization detection
   - lifecycle drop-off thresholds
4. Make Stage 3 outputs mandatory inputs for SEO refresh selection and CRO sprint planning.
5. Only after that stability window, open Stage 4 experimentation work and Stage 5 alert calibration.

### Why Stage 3 next

- Stage 1 restored trust.
- Stage 2 created a usable segmented decision surface.
- Stage 3 is the first stage that turns the dashboard from reporting into prioritization.
- The first Stage 3 product slice is now shipped, so the next leverage point is adoption and stability, not another reporting surface.
- Experimentation and alerting should be built on top of stable segmented intelligence, not before it.
- Stage 1 attribution hygiene now has a named ops workflow, so it should stay in cadence rather than remain a backlog item.

## Current Program Assessment

| Dimension | Status |
| --- | --- |
| Trust in dashboard semantics | Stronger than baseline and now production-usable |
| Executive readability | Materially improved with `executiveSummary` |
| Segmentation readiness | Live for Stage 2 dimensions |
| SEO usefulness | Materially improved with query-level opportunity, cluster rollups, and content-opportunity scaffolding now live |
| CRO usefulness | Improved through segmented pipeline views plus lifecycle funnel diagnostics and landing-page scorecard prioritization |
| Experiment readiness | Not yet operationalized |
| Automation maturity | Connector/source health exists, but proactive alerting and digests are not yet live |

## Checkpoint Summary

The program has completed the foundational architecture, the first decision-making layer, and the first Stage 3 prioritization slice.

- Stages shipped in product: Stage 1 and Stage 2
- Stage 3 status: first intelligence slice shipped, stabilization pending
- Stages documented and locked: Stage 0 through Stage 6
- Highest-leverage next engineering move: stabilize the Stage 3 marts and apply the migration everywhere
- Highest-leverage next operating move: make weekly reviews segment-first, keep attribution QA in weekly ops cadence, and require Stage 3 evidence in sprint selection
