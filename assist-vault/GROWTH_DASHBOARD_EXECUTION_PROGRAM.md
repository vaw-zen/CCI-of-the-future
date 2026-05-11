# Growth Dashboard Execution Program

Date: 2026-05-10

This document operationalizes the audit strategy into a delivery program that engineering, growth, and admin ops can execute without creating a second reporting surface. The target remains the current `/admin/dashboard`, its API contract, and its reporting layer.

## Program frame

| Item | Decision |
| --- | --- |
| Delivery model | Lean sequential execution with one primary engineering stream |
| Reporting surface | Extend existing `/admin/dashboard` only |
| Program length | 24 weeks for Stages 0-5, then months 6-12 for Stage 6 |
| Core owners | Growth owner, Admin ops, Engineering |
| Source of truth | Dashboard API, metric definitions, runbook, and execution docs in `assist-vault` |

## Current implementation snapshot

| Area | Status on 2026-05-09 | Notes |
| --- | --- | --- |
| Stage 0 program artifacts | Implemented | This doc plus the semantics/thresholds doc are now committed |
| Canonical KPI semantics in payload | Implemented | Overview, acquisition, SEO, and keyword cards now carry `canonicalLabel`, `owner`, and `decisionIntent` |
| Thin-volume warnings | Implemented | CPL, CPA, and SEO lead-rate warnings now surface in payload and UI |
| Ambiguous KPI cleanup | Implemented | `Proxy CA estimé` is now `Estimated pipeline value` |
| Dimension-ready normalization | Implemented in metric layer | Leads and combined rows now expose `sourceClass`, `pageType`, and `businessLine` |
| Lead-quality operations fields | Implemented in schema + admin UI | `lead_quality_outcome`, `lead_owner`, `follow_up_sla_at`, and `last_worked_at` now flow through forms, admin drawers, and status/attribution updates |
| Normalized reporting views | Implemented in reporting layer | Supabase now exposes normalized growth metric and lead-dimension views for Stage 2 segmentation work |
| Attribution hygiene normalization and audit | Implemented | New lead payloads normalize source/medium/campaign and landing paths, historical suspicious direct rows are reclassified at read time, and weekly QA now has a named audit command |
| Stage 2 segmentation contract | Implemented | Dashboard now supports `businessLine`, `service`, `sourceClass`, `device`, and `pageType` filters plus `executiveSummary` in the API payload |
| Stage 2 UI layer | Implemented | `/admin/dashboard` now has a summary band, segment controls, and a dedicated pipeline section |
| Stage 3 first intelligence slice | Implemented in product, stabilization pending | Query sync, Stage 3 payload keys, and the first prioritization panels are live; workflow adoption and heuristic tuning remain open |
| GA4 events completeness | Implemented as a reporting enhancement | GA4 snapshots now support `events`, the dashboard surfaces GA4 events alongside sessions/users, and imports dedupe normalized conflicts before upsert |
| Dev/build artifact isolation | Implemented as an engineering reliability enhancement | `next dev` now writes to `.next-dev` while production builds keep using `.next`, preventing cache collisions from breaking admin routes |
| Stage 4+ intelligence and automation backlog | Pending | Tracked in backlog below |

## Delivery order

| Stage | Window | Objective | Gate to next stage |
| --- | --- | --- | --- |
| Stage 0 | Week 0-1 | Lock semantics, thresholds, owners, and backlog | KPI glossary, taxonomy, thresholds, and owners approved |
| Stage 1 | Weeks 1-4 | Restore trust in the existing dashboard | Attribution QA stable and lead-quality taxonomy operational |
| Stage 2 | Weeks 5-8 | Add executive layer and segmentation | Filters work consistently across overview, pipeline, acquisition, and SEO |
| Stage 3 | Weeks 9-14 | Add first growth intelligence marts | Query/funnel/page marts remain stable across two weekly review cycles |
| Stage 4 | Weeks 15-18 | Add experimentation operating system | Weekly review creates and closes experiments from dashboard evidence |
| Stage 5 | Weeks 19-24 | Add monitoring, alerts, and automated digests | Alert thresholds calibrated against stable Stage 3 baselines |
| Stage 6 | Months 6-12 | Add forecasting, ROI, and advanced attribution | At least 90 days of stable segmented history and high lead-quality adoption |

## Stage plans

### Stage 0

| Work item | Tag | Owner | Output | Status |
| --- | --- | --- | --- | --- |
| Freeze KPI glossary and canonical labels | `workflow` | Growth owner + Engineering | Approved glossary in `GROWTH_DASHBOARD_SEMANTICS_AND_THRESHOLDS.md` | Implemented |
| Freeze taxonomy for source, medium, campaign, source class, page type, business line | `workflow` | Growth owner + Engineering | Approved taxonomy doc | Implemented |
| Freeze thresholds for attribution, stale queue, and thin-volume warnings | `workflow` | Growth owner + Admin ops + Engineering | Approved thresholds doc | Implemented |
| Convert roadmap into execution backlog with owners and dependencies | `workflow` | Engineering | This execution program | Implemented |

### Stage 1

| ID | Tag | Owner | Work item | Dependency | Exit signal | Status |
| --- | --- | --- | --- | --- | --- | --- |
| S1-01 | `schema` | Engineering | Add `lead_quality_outcome`, `lead_owner`, `follow_up_sla_at`, and `last_worked_at` to lead operations | Stage 0 | Admin ops can triage and measure readiness state consistently | Implemented |
| S1-02 | `ETL` | Engineering | Create normalized source/medium/campaign and page classification views in Supabase | Stage 0 | Acquisition joins no longer depend on ad-hoc string cleanup | Implemented |
| S1-03 | `metric-builder` | Engineering | Attach canonical KPI semantics to cards | Stage 0 | UI consumes card semantics from API, not local hardcoded labels | Implemented |
| S1-04 | `metric-builder` | Engineering | Add thin-volume warnings for CPL, CPA, and lead-rate metrics | Stage 0 | Low-sample efficiency metrics show warnings automatically | Implemented |
| S1-05 | `UI` | Engineering | Render KPI warnings and replace ambiguous labels | S1-03, S1-04 | Dashboard surfaces trust signals directly in cards | Implemented |
| S1-06 | `workflow` | Admin ops + Engineering | Formalize attribution QA checklist and weekly reconciliation | Stage 0 | Unattributed lead spikes are detected and reviewed weekly | Implemented |
| S1-07 | `documentation` | Engineering | Update metric definitions and launch runbook to reflect Stage 1 semantics | S1-03, S1-04 | Docs and runtime contract match | Implemented |

### Stage 2

| ID | Tag | Owner | Work item | Dependency | Exit signal | Status |
| --- | --- | --- | --- | --- | --- | --- |
| S2-01 | `API` | Engineering | Add filter params `businessLine`, `service`, `sourceClass`, `device`, `pageType` to `GET /api/admin/dashboard` | Stage 1 | API filters all major sections with consistent semantics | Implemented |
| S2-02 | `metric-builder` | Engineering | Recompute overview, pipeline, acquisition, and SEO sections under active filters | S2-01 | Filtered views reconcile to underlying facts | Implemented |
| S2-03 | `metric-builder` | Engineering | Add `executiveSummary` with `trend`, `risk`, `opportunity`, and `nextAction` | S2-02 | Leadership can understand the period in under two minutes | Implemented |
| S2-04 | `UI` | Engineering | Add top executive summary band and segment controls | S2-03 | Weekly review can be run from segmented dashboard views | Implemented |
| S2-05 | `workflow` | Growth owner | Require every weekly action to reference a dashboard segment | S2-04 | Review notes point to segments instead of top-line totals | Scaffolded in docs, adoption pending |

### Stage 3

| ID | Tag | Owner | Work item | Dependency | Exit signal | Status |
| --- | --- | --- | --- | --- | --- | --- |
| S3-01 | `schema` | Engineering | Create `growth_query_daily_metrics` | Stage 2 | Query-level Search Console analysis becomes available | Implemented in migration |
| S3-02 | `schema` | Engineering | Create `growth_funnel_daily_metrics` | Stage 2 | Funnel diagnostics can be evaluated by step and segment | Implemented in migration |
| S3-03 | `schema` | Engineering | Create `growth_keyword_clusters` | S3-01 | Query opportunity can be rolled up by cluster | Implemented in migration |
| S3-04 | `schema` | Engineering | Create `growth_landing_page_scores_daily` | S3-02 | Landing-page prioritization no longer depends on raw lists | Implemented in migration |
| S3-05 | `metric-builder` | Engineering | Add `seoQueries`, `contentOpportunities`, `funnelDiagnostics`, and `landingPageScorecard` | S3-01 to S3-04 | Growth team can prioritize SEO and CRO from the dashboard | Implemented |
| S3-06 | `UI` | Engineering | Add query, funnel, and landing-page scorecard panels to existing dashboard | S3-05 | Query intelligence is clearly separated from tracked keyword monitoring | Implemented |
| S3-07 | `workflow` | Growth owner | Make Stage 3 outputs the default input for SEO refresh and CRO sprint planning | S3-06 | Roadmap selection references dashboard evidence each week | Scaffolded in docs, adoption pending |

### Stage 4

| ID | Tag | Owner | Work item | Dependency | Exit signal |
| --- | --- | --- | --- | --- | --- |
| S4-01 | `schema` | Engineering | Create `growth_experiments` and `growth_experiment_readouts` | Stage 3 | Experiment state exists in the reporting layer |
| S4-02 | `API` | Engineering | Add `experiments` to dashboard payload | S4-01 | Dashboard exposes backlog, active tests, and readouts |
| S4-03 | `UI` | Engineering | Add experiment backlog, active experiments, and readout views | S4-02 | Experimentation moves out of side spreadsheets |
| S4-04 | `workflow` | Growth owner | Require hypothesis, segment, target metric, owner, dates, and success threshold for every test | S4-03 | Weekly review produces a scored experiment queue |

### Stage 5

| ID | Tag | Owner | Work item | Dependency | Exit signal |
| --- | --- | --- | --- | --- | --- |
| S5-01 | `schema` | Engineering | Create `growth_reporting_run_history` | Stage 3 | Run outcomes persist historically |
| S5-02 | `schema` | Engineering | Create `growth_alert_events` | S5-01 | Alert history exists for analysis and tuning |
| S5-03 | `automation` | Engineering | Persist run-level outcomes from `src/libs/growthReporting.mjs` | S5-01 | Connector freshness and run failures become auditable |
| S5-04 | `automation` | Engineering | Add freshness and anomaly alerts for direct spikes, qualified lead drops, landing-page collapse, and stale SERP states | S5-02 | Growth issues are surfaced proactively |
| S5-05 | `workflow` | Growth owner + Admin ops | Add weekly executive digest and daily operational notifications | S5-03, S5-04 | Weekly and daily reporting no longer require manual assembly |
| S5-06 | `ETL` | Engineering | Automate paid/social imports if connector access exists, otherwise harden manual SLA | S5-03 | Freshness responsibility is explicit and measurable |

### Stage 6

| ID | Tag | Owner | Work item | Dependency | Exit signal |
| --- | --- | --- | --- | --- | --- |
| S6-01 | `schema` | Engineering | Add ROI summary marts for content, channel, and landing pages | Stage 5 | Prioritization can reference modeled value |
| S6-02 | `metric-builder` | Engineering | Add lead, qualified lead, win, and efficiency forecasting | S6-01 | Monthly planning can use forecast views |
| S6-03 | `metric-builder` | Engineering | Add attribution and LTV summary models | S6-01 and stable closed-won history | Budget decisions can compare channels beyond current-period volume |

## Dependency map

| Unlock | Depends on |
| --- | --- |
| Executive segmentation | Stage 1 canonical semantics and normalized dimensions |
| Query opportunity detection | Search Console query mart + stable page taxonomy |
| Funnel diagnostics | Lifecycle tracking + lead-quality fields + stage definitions |
| Experiment OS | Stable segmentation and evidence-backed prioritization |
| Alerts and digests | Stable marts, calibrated thresholds, and run-history persistence |
| Forecasting and ROI | Stable segmented history, lead quality adoption, and alert-calibrated trust |

## Testing program

| Stage | Required verification |
| --- | --- |
| Stage 1 | Contract tests for canonical labels and warnings, reconciliation checks for normalized dimensions, dashboard regression suite |
| Stage 2 | Filter-param API tests, filtered section response tests, and UI checks for summary band and segment persistence |
| Stage 3 | Fixture-based tests for query clusters, decay, cannibalization, funnel math, and landing-page scoring |
| Stage 4 | Experiment lifecycle, scoring, and readout tests |
| Stage 5 | Alert threshold tests, suppression tests, run-history persistence tests, and digest payload validation |
| Stage 6 | Backtests for forecasts, ROI models, and attribution logic before decision use |

## Governance cadence

| Cadence | Owner | Output |
| --- | --- | --- |
| Weekly growth review | Growth owner | Prioritized actions tied to a dashboard segment |
| Weekly ops QA | Admin ops + Engineering | Attribution QA via `npm run growth:audit:attribution`, stale queue review, unresolved data issues |
| Monthly executive review | Growth owner | Trend, risk, opportunity, next action, experiment outcomes |
| Monthly dashboard governance | Engineering | KPI drift review, threshold tuning, deprecated panel cleanup |

## What gets done first

1. Operationalize Stage 2 in the weekly growth review so segmentation becomes the default decision frame instead of an optional view.
2. Keep Stage 1 attribution QA in the weekly ops cadence using the named audit checklist and command.
3. Build Stage 3 adoption and stability before experiments or alerts, because prioritization and anomaly detection need stable, segmented metrics.
4. Add experiments in Stage 4 and automation in Stage 5 only after the Stage 3 logic remains stable for at least two weekly review cycles.
5. Defer ROI, LTV, forecasting, and advanced attribution to Stage 6 until history depth and lead-quality adoption are strong enough.

## Roadmap Impact

- No stage order has changed.
- No new phase has been introduced.
- No dependency gate has been relaxed or bypassed.
- GA4 `events` support enhances the existing acquisition and SEO evidence model inside Stage 3 without changing the program sequence.
- GA4 import deduplication and dev/build cache isolation are delivery hardening changes that protect Stage 1 trust and Stage 3 stability; they do not create new roadmap scope.
