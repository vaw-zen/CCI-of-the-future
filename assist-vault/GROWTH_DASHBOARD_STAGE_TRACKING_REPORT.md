# Growth Dashboard Stage Tracking Report

Date: 2026-05-09

This report tracks what has been shipped in the growth dashboard program so far, what remains open, and what should happen next. It is meant to be the current execution checkpoint for engineering, Growth, and Admin ops.

## Delivery Snapshot

| Stage | Status | Delivery state | Notes |
| --- | --- | --- | --- |
| Stage 0 | Complete | Program, semantics, taxonomy, and thresholds are locked in docs | Ready and in use |
| Stage 1 | Product complete, workflow follow-through pending | Lead quality, ownership, SLA, stale-queue readiness, normalized dimensions, KPI semantics, and trust signals are implemented | Attribution QA operating cadence still needs to be formalized as a recurring workflow |
| Stage 2 | Product complete, workflow adoption pending | Dashboard filters, segmented section outputs, executive summary, and dedicated pipeline navigation are implemented | Weekly review should now move to segment-first usage |
| Stage 3 | In progress, first slice shipped | Query intelligence, content opportunities, landing-page scorecard, and lifecycle funnel diagnostics are now live in the product | Needs workflow adoption plus two review cycles of stability before downstream automation |
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

## Verification Status

| Check | Result | Notes |
| --- | --- | --- |
| `npm run test:dashboard` | Pass | `29/29` green including Stage 3 query, content, scorecard, and funnel diagnostics coverage |
| `npm run build` | Pass | Production build validates the shipped contract and UI |
| Admin auth redirect loop / stuck verification | Resolved | Admin auth now resolves server-side and avoids endless client-side verification |
| Dev startup lag caused by remote font boot dependency | Resolved | App shell no longer blocks dev startup on remote Google font fetch |
| Dev image optimizer `LRUCache` issue | Mitigated in development | Dev uses unoptimized images to avoid local optimizer failure |

## Stage Gates

| Stage | Gate status | Current read |
| --- | --- | --- |
| Stage 1 gate | Mostly satisfied | Attribution QA logic exists in product, but the recurring ops checklist still needs to be enforced operationally |
| Stage 2 gate | Satisfied in product | Filters and executive summary work across overview, pipeline, acquisition, and SEO |
| Stage 3 gate | In progress | Stage 3 marts and payloads now exist; the remaining gate is semantic stability across at least two weekly review cycles |
| Stage 5 gate | Not yet open | Alert calibration should wait until Stage 3 is stable for at least two review cycles |

## Known Scope Notes

- `device` is currently an SEO-only segment in practice.
- Keyword visibility and ranking outputs respect `device`.
- Lead, pipeline, acquisition, and operations metrics remain cross-device until device-aware lead/acquisition inputs exist in the reporting model.
- The dashboard remains the only internal reporting surface; no parallel dashboard has been introduced.

## Remaining Open Items Before Stage 3 Is Fully Stabilized

| ID | Type | Owner | Status | Next step |
| --- | --- | --- | --- | --- |
| S1-06 | Workflow | Admin ops + Engineering | Open | Turn attribution QA and reconciliation into a named weekly checklist with explicit pass/fail review |
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
- Highest-leverage next operating move: make weekly reviews segment-first, formalize attribution QA, and require Stage 3 evidence in sprint selection
