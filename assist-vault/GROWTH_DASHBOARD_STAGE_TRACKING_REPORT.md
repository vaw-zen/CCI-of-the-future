# Growth Dashboard Stage Tracking Report

Date: 2026-05-09

This report tracks what has been shipped in the growth dashboard program so far, what remains open, and what should happen next. It is meant to be the current execution checkpoint for engineering, Growth, and Admin ops.

## Delivery Snapshot

| Stage | Status | Delivery state | Notes |
| --- | --- | --- | --- |
| Stage 0 | Complete | Program, semantics, taxonomy, and thresholds are locked in docs | Ready and in use |
| Stage 1 | Product complete, workflow follow-through pending | Lead quality, ownership, SLA, stale-queue readiness, normalized dimensions, KPI semantics, and trust signals are implemented | Attribution QA operating cadence still needs to be formalized as a recurring workflow |
| Stage 2 | Product complete, workflow adoption pending | Dashboard filters, segmented section outputs, executive summary, and dedicated pipeline navigation are implemented | Weekly review should now move to segment-first usage |
| Stage 3 | Not started | Growth intelligence marts and prioritization layers are next | Highest-leverage next build |
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

## Verification Status

| Check | Result | Notes |
| --- | --- | --- |
| `npm run test:dashboard` | Pass | `28/28` green |
| `npm run build` | Pass | Production build validates the shipped contract and UI |
| Admin auth redirect loop / stuck verification | Resolved | Admin auth now resolves server-side and avoids endless client-side verification |
| Dev startup lag caused by remote font boot dependency | Resolved | App shell no longer blocks dev startup on remote Google font fetch |
| Dev image optimizer `LRUCache` issue | Mitigated in development | Dev uses unoptimized images to avoid local optimizer failure |

## Stage Gates

| Stage | Gate status | Current read |
| --- | --- | --- |
| Stage 1 gate | Mostly satisfied | Attribution QA logic exists in product, but the recurring ops checklist still needs to be enforced operationally |
| Stage 2 gate | Satisfied in product | Filters and executive summary work across overview, pipeline, acquisition, and SEO |
| Stage 3 gate | Not yet open | Stage 3 marts do not exist yet |
| Stage 5 gate | Not yet open | Alert calibration should wait until Stage 3 is stable for at least two review cycles |

## Known Scope Notes

- `device` is currently an SEO-only segment in practice.
- Keyword visibility and ranking outputs respect `device`.
- Lead, pipeline, acquisition, and operations metrics remain cross-device until device-aware lead/acquisition inputs exist in the reporting model.
- The dashboard remains the only internal reporting surface; no parallel dashboard has been introduced.

## Remaining Open Items Before Stage 3 Is Fully Ready

| ID | Type | Owner | Status | Next step |
| --- | --- | --- | --- | --- |
| S1-06 | Workflow | Admin ops + Engineering | Open | Turn attribution QA and reconciliation into a named weekly checklist with explicit pass/fail review |
| S2-05 | Workflow | Growth owner | Open | Require weekly review actions to reference a dashboard segment, not just top-line totals |

## Recommended Next Implementation

### Next build target: Stage 3

Priority order:

1. Create `growth_query_daily_metrics`.
2. Create `growth_funnel_daily_metrics`.
3. Create `growth_keyword_clusters`.
4. Create `growth_landing_page_scores_daily`.
5. Add Stage 3 metric-builder outputs:
   - `seoQueries`
   - `contentOpportunities`
   - `funnelDiagnostics`
   - `landingPageScorecard`
6. Add the minimum UI panels needed to expose those outputs inside the current dashboard.

### Why Stage 3 next

- Stage 1 restored trust.
- Stage 2 created a usable segmented decision surface.
- Stage 3 is the first stage that turns the dashboard from reporting into prioritization.
- Experimentation and alerting should be built on top of stable segmented intelligence, not before it.

## Current Program Assessment

| Dimension | Status |
| --- | --- |
| Trust in dashboard semantics | Stronger than baseline and now production-usable |
| Executive readability | Materially improved with `executiveSummary` |
| Segmentation readiness | Live for Stage 2 dimensions |
| SEO usefulness | Improved, but still missing query-level opportunity and content intelligence marts |
| CRO usefulness | Improved through segmented pipeline and acquisition views, but still missing funnel diagnostics marts |
| Experiment readiness | Not yet operationalized |
| Automation maturity | Connector/source health exists, but proactive alerting and digests are not yet live |

## Checkpoint Summary

The program has completed the foundational architecture and the first decision-making layer.

- Stages shipped in product: Stage 1 and Stage 2
- Stages documented and locked: Stage 0 through Stage 6
- Highest-leverage next engineering move: Stage 3 growth intelligence marts
- Highest-leverage next operating move: make weekly reviews segment-first and formalize attribution QA
