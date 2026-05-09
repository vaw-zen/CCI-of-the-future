# Growth Dashboard Audit And Enhancement Strategy

Date: 2026-05-07

## Scope And Method

This is a repo-first audit of the current growth dashboard system. It is grounded in the shipped admin dashboard, its API contract, metric builders, Supabase schema, analytics instrumentation, refresh scripts, and test suite.

Primary evidence base:

| Layer | Files reviewed | What it proves |
| --- | --- | --- |
| Product documentation | `assist-vault/GROWTH_DASHBOARD_SYSTEM_GUIDE.md`, `assist-vault/GROWTH_DASHBOARD_METRIC_DEFINITIONS.md`, `assist-vault/GROWTH_DASHBOARD_RUNBOOK.md`, `assist-vault/GA4_MEASUREMENT_PLAN.md`, `assist-vault/UTM_GUIDE.md` | Current KPI intent, ownership model, known measurement issues, refresh process, and growth operating assumptions |
| Dashboard UI | `src/app/admin/dashboard/page.jsx`, `src/app/admin/devis/admin.module.css` | Information architecture, section hierarchy, navigation model, charting approach, and executive readability |
| Dashboard API | `src/app/api/admin/dashboard/route.js` | Single reporting contract, selected sources, safety constraints, and payload structure |
| Metric logic | `src/libs/adminDashboardMetrics.mjs` | Exact KPI formulas, fallbacks, comparisons, source-health rules, and current decision model |
| Tracking and attribution | `src/utils/analytics.js`, `src/libs/analyticsLifecycle.js`, `src/libs/ga4Measurement.js`, `src/libs/whatsappAttribution.mjs`, `src/utils/analyticsGateway.js` | Captured event taxonomy, lead attribution context, lifecycle measurement, and WhatsApp-assisted funnel logic |
| Reporting schema | `supabase/20260506_growth_reporting.sql`, `supabase/20260506_growth_keyword_catalog.sql`, `supabase/20260506_growth_keyword_rankings.sql`, `supabase/20260430_analytics_lifecycle.sql`, `supabase/20260507_whatsapp_funnel_attribution.sql`, `supabase/schema.sql` | Data model, freshness logging, keyword catalog design, lifecycle fields, and attribution tables |
| Automation layer | `src/libs/growthReporting.mjs`, `src/app/api/internal/growth-reporting/refresh/route.js`, `scripts/growth/*`, `vercel.json` | Daily refresh model, connector boundary, manual import boundary, and cron schedule |
| Validation | `tests/admin-dashboard-metrics.test.mjs`, `tests/admin-dashboard-payload.test.mjs`, `tests/growth-keyword-catalog.test.mjs`, `tests/whatsapp-attribution.test.mjs` | Current logic is tested for KPI construction, payload shape, keyword matching, and WhatsApp attribution |

Out of scope in this first pass:

- Live dashboard screenshots or browser QA
- GA4, GSC, Supabase, or SerpApi production exports
- Stakeholder interviews
- Commercial performance benchmarking against real traffic/revenue

Current validation status:

- `npm run test:dashboard` passed on 2026-05-07
- Current dashboard test coverage validates metric construction, payload contract, keyword catalog normalization, and WhatsApp attribution logic

## Executive Summary

The current dashboard is a strong internal analytics foundation, but not yet a world-class growth operating system.

It already does the hard foundational work that many teams never finish: one admin dashboard entrypoint, explicit KPI definitions, daily snapshot tables, source-health monitoring, cohort-based pipeline logic, page-level organic performance, keyword catalog normalization, dual-device SERP snapshots, and a working WhatsApp attribution layer. The codebase also shows healthy discipline: tests exist for the metric builder, payload contract, keyword catalog workflow, and attribution matching.

Where the system falls short is not plumbing. It falls short in strategic leverage. The current dashboard answers "what happened" better than "what should we do next." It lacks an executive narrative layer, experimentation workflow, growth opportunity scoring, query-level SEO intelligence, anomaly detection, strong segmentation controls, and automation beyond data refresh. Paid and social are still manual. SEO intelligence is page-level and tracked-keyword-level, not query-cluster-level. CRO instrumentation exists in parts, but it is not yet turned into a decision-ready funnel and experimentation surface.

### Current dashboard score

**6.3 / 10**

This score reflects operating-system readiness, not channel performance.

### Score by lens

| Lens | Score / 10 | Why |
| --- | --- | --- |
| Data architecture | 7.8 | Clean reporting tables, explicit source health, normalized keyword catalog, lifecycle fields, and a single dashboard contract |
| KPI quality | 7.2 | Most KPIs are formula-defined and decision-oriented, but some still need semantic cleanup and stronger segmentation |
| UX / information design | 6.4 | Clear sections and readable cards, but the executive layer, action framing, benchmarks, and drilldown hierarchy are still thin |
| SEO intelligence | 5.9 | Strong tracked-keyword and landing-page base, but missing query-level analysis, clustering, decay, cannibalization, and technical monitoring |
| CRO / funnel tracking | 6.5 | Lead lifecycle and WhatsApp attribution exist, but micro-conversions and experiment-ready funnel diagnostics do not |
| Growth readiness | 5.3 | Useful for monitoring, weak for hypothesis generation, prioritization, and roadmap planning |
| Automation maturity | 5.7 | Daily refresh and source-health exist, but alerts, anomaly detection, reporting automation, and workflow routing are missing |
| Executive reporting quality | 5.4 | Executives can see activity, but not yet a compressed trend-risk-opportunity-ROI story with recommended actions |

## Current Dashboard Inventory

### Dashboard surface

| Section | Current implemented elements | Primary decisions supported today | Primary decision gaps |
| --- | --- | --- | --- |
| `overview` | New leads, qualified activity, wins activity, cohort qualification rate, cohort win rate, unattributed lead rate, revenue proxy | Is demand growing, is lead quality improving, is attribution degrading | No target tracking, no executive narrative, no segmented performance view, no forecast |
| `pipeline` | Funnel cohort, avg time to qualify, avg time to close, created trend, source/medium/campaign breakdowns, service mentions, primary service | Where the cohort stalls, which services dominate demand, whether velocity is improving | No reason-coded drop-off, no owner/SLA view, no segment comparison, no conversion leak diagnosis |
| `acquisition` | Sessions, clicks, impressions, spend, CPL, CPA, top sources, top campaigns, WhatsApp summary, WhatsApp funnel, top WhatsApp touchpoints | Which channels create traffic, leads, and wins, whether WhatsApp contributes materially | No branded vs non-branded split, no assisted attribution, no automated paid/social ingestion, no cohort confidence thresholds |
| `seoContent` | Organic landing pages, organic clicks/impressions/CTR, landing-page lead rate, qualified leads, tracked keywords, ranked keywords, device visibility, visibility trend, average position trend | Which landing pages and tracked keywords are contributing now | No query-level GSC intelligence, no content decay, no cannibalization, no topic authority, no internal linking or technical SEO view |
| `operations` | Stale queue, latest submissions, lifecycle trend, recent admin status audit feed | Which leads need attention, whether throughput is moving | No SLA breaches by owner, no follow-up adherence, no queue prioritization by value/quality |
| `dataHealth` | Source freshness/status for Supabase, GA4, Search Console, SERP, paid media, social media | Can the dashboard be trusted right now | No proactive alerting, no run-level diagnostics, no accountability workflow, no anomaly monitoring |

### KPI inventory summary

Detailed formulas already live in `assist-vault/GROWTH_DASHBOARD_METRIC_DEFINITIONS.md`. The dashboard currently exposes the following KPI families:

| KPI family | Current KPIs |
| --- | --- |
| Overview | New leads, qualified activity, wins activity, cohort qualification rate, cohort win rate, unattributed lead rate, revenue proxy |
| Pipeline | Funnel cohort, avg hours to qualify, avg hours to close, service mentions, primary service, created trend |
| Acquisition | Sessions, clicks, impressions, spend, CPL, CPA, source/campaign performance, WhatsApp clicks, WhatsApp attributed leads |
| SEO & Content | Organic clicks, organic impressions, organic CTR, landing-page lead rate, qualified leads by landing page, tracked keywords, ranked keywords, device-specific visibility, average position, top 10 count |
| Operations | Stale queue count, latest submissions, lifecycle trend, recent admin activity |
| Data health | Source freshness, connector status, latest metric date, record counts, SERP device row counts |

### Current label mapping for implementation

Use these canonical names when extending the dashboard so UI copy, docs, and metric semantics stay aligned.

| Current label | Canonical English meaning |
| --- | --- |
| `Nouveaux leads` | New leads |
| `Qualifiés (activité)` / `Qualifiés` | Qualified activity |
| `Gagnés (activité)` / `Gagnés` | Won activity |
| `Taux qualification cohorte` | Cohort qualification rate |
| `Taux gain cohorte` | Cohort win rate |
| `Leads non attribués` | Unattributed lead rate |
| `Proxy CA estimé` | Estimated pipeline value |
| `Temps moyen qualification` | Average hours to qualify |
| `Temps moyen clôture` | Average hours to close |
| `Queue à relancer > 48h` | Stale lead follow-up queue |
| `Tendance des leads créés` | Lead creation trend |
| `Tendance de visibilité des mots-clés` | Keyword visibility trend |
| `Tendance de position moyenne` | Keyword average position trend |
| `À jour / À vérifier / Manquant / Erreur` | Fresh / Stale / Missing / Error |

## Source Of Truth Matrix

| Interface / table | Grain | Refresh | Current owner | Strength | Key risk / gap |
| --- | --- | --- | --- | --- | --- |
| `GET /api/admin/dashboard?from&to` | Period-based aggregate payload | Live query time | Engineering | Single contract, PII-safe, sectioned response | Payload is broad but still monitoring-oriented; no executive summary object or experimentation object |
| `devis_requests` + `convention_requests` lifecycle fields | Lead-level | Live | Growth owner + Admin ops + Engineering | Supports cohort logic, lead status, lifecycle timestamps, attribution context | No standardized lead-quality score, no owner/SLA dimension, no explicit invalid lead taxonomy |
| `growth_channel_daily_metrics` | Daily channel x source x medium x campaign x landing page | Daily cron or manual CSV import | Growth owner + Engineering | Good base for channel rollups, page performance, spend joins | Paid/social remain manual; no event-level or query-level breakdowns; no benchmark/targets layer |
| `growth_reporting_source_health` | Source-level freshness/status | On each sync or read | Engineering | Trust layer already exists | No alert routing, no run history, no SLA acknowledgements |
| `growth_keyword_catalog` | Canonical keyword x canonical target | On CSV import | Growth owner + Engineering | Strong normalization layer and target governance | No keyword clustering model, no brand flag, no topic authority logic |
| `growth_keyword_rankings_daily` | Daily keyword x device snapshot | Daily manual or cron-like sync | Growth owner + Engineering | Strong live ranking trend base with desktop/mobile split | Only tracked-keyword SERP snapshots; not enough for full SEO intelligence |
| `whatsapp_click_events` | Click-level | Real-time write | Growth owner + Engineering | Strong assisted funnel step for WhatsApp | Only one assisted journey channel is modeled server-side |

## What The Current Dashboard Does Well

1. It is built on explicit semantics, not loose screenshots.
2. It uses one dashboard endpoint instead of fragmented reporting.
3. It separates live operational data from snapshot-based external traffic data.
4. It already includes a source-health trust layer, which is essential for growth teams.
5. It distinguishes cohort metrics from activity metrics, which improves decision quality.
6. It treats keyword tracking as a governed catalog, not a free-text list.
7. It handles dual-device keyword tracking and a reference fallback gracefully.
8. It includes WhatsApp attribution and manual override logic, which matches the real sales motion better than pure GA4.
9. It has meaningful tests around the most failure-prone areas.

## Main Weaknesses

| Weakness | Why it matters | Finding tag |
| --- | --- | --- |
| No executive summary layer | Executives still have to interpret many cards instead of seeing trend, risk, opportunity, and next action in one place | Executive reporting risk |
| Limited segmentation | The dashboard is not yet designed around business line, device, page template, service family, or lead quality segments | Growth gap |
| SEO intelligence stops at landing pages and tracked keywords | Without query-level joins, clustering, and decay/cannibalization logic, content strategy remains partially blind | Growth gap |
| CRO instrumentation is not translated into funnel analytics | CTA, form, and engagement events are not yet materialized into a growth funnel model inside the dashboard | Growth gap |
| Paid and social reporting are manual imports | This limits freshness, reliability, and trust when acquisition spend scales | Scalability risk |
| No anomaly detection or alert routing | The team must manually notice freshness issues, direct spikes, or sudden page drops | Automation maturity gap |
| No experiment registry or prioritization engine | The dashboard can monitor outcomes, but it does not yet manage the growth loop from hypothesis to readout | Operational gap |
| Revenue proxy is useful but not decision-complete | `calculator_estimate` is not the same as validated pipeline value, revenue, or LTV | KPI weakness |
| Language and audience layering are mixed | English section tabs and French KPI labels reduce polish and executive readability | UX weakness |
| No formal semantic layer between raw snapshots and decision-ready marts | This will become a bottleneck as SEO, CRO, and forecasting views expand | Technical architecture risk |

## Main Opportunities

| Opportunity | Why it is high leverage | Finding tag |
| --- | --- | --- |
| Normalize attribution and segmentation first | It unlocks every later capability: page scoring, channel ROI, experiments, and executive reporting | Opportunity unlock |
| Build a query-level SEO mart | It unlocks non-brand tracking, clustering, content decay, cannibalization, and topic authority | Opportunity unlock |
| Add an executive action layer | It shortens time-to-decision for founders and leadership | Opportunity unlock |
| Turn existing event instrumentation into funnel analytics | The site already emits meaningful events; the missing layer is modeling and presentation | Opportunity unlock |
| Add alerting to source health and growth anomalies | It makes the system proactive rather than reactive | Opportunity unlock |
| Formalize experiments in the same operating system | It moves the dashboard from reporting to growth management | Opportunity unlock |

## KPI Evaluation And Recommendations

### Keep as core operating KPIs

| KPI | Keep because | Recommendation |
| --- | --- | --- |
| Cohort qualification rate | It measures demand quality rather than activity only | Keep in top line and segment by business line, service, and source |
| Cohort win rate | It connects acquisition to commercial outcome | Keep, but only show once lead volume threshold is met |
| Unattributed lead rate | It is a health KPI for growth trust | Keep and convert into an alert threshold |
| Avg hours to qualify | It connects marketing quality to operational speed | Keep and segment by source, service, and owner |
| CPL and CPA | They are decision-relevant when paired with volume and quality | Keep, but show sample-size warning and confidence band |
| Landing-page lead rate | It is the bridge between SEO/CRO and pipeline | Keep and expand into a landing-page score |
| Ranked keywords and top 10 count | They make SEO visibility tangible | Keep, but augment with opportunity, decay, and cannibalization metrics |
| Stale queue | It is operationally actionable | Keep and add SLA breach severity |

### Refine or rename

| Current KPI | Issue | Recommendation |
| --- | --- | --- |
| Revenue proxy | Helpful but semantically weak | Rename to `Estimated pipeline value` and keep separate from actual revenue |
| Qualified (activity) and Wins (activity) | Useful for throughput, but easy to misread as cohort conversion | Keep in ops context, not as the main executive headline |
| Sessions and clicks | Good for context, weak alone | Always pair with qualified leads, lead rate, or pipeline value |
| Organic CTR | Useful but incomplete without query/page intent | Split by branded vs non-branded and by page cluster once query data exists |
| Top campaigns by clicks | Can become vanity if not paired with quality | Rank by qualified leads, wins, or opportunity score instead of clicks alone |

### Add next

| KPI to add | Why it matters | Primary change type |
| --- | --- | --- |
| Qualified lead rate by landing page | Better than raw lead rate for CRO and content prioritization | Metric-builder / UI |
| Branded vs non-branded organic share | Essential for SEO growth quality | Schema / ETL |
| Content decay score | Supports refresh planning and content ROI | Metric-builder / UI |
| Cannibalization count by query cluster | Prevents competing pages from splitting demand | Schema / ETL |
| Funnel step completion rate | Turns CRO instrumentation into optimization action | Schema / ETL |
| Experiment throughput and win rate | Measures growth system output, not only site output | Schema / Workflow / UI |
| Source freshness SLA breaches | Makes trust failures operational | UI / Workflow / Automation |
| Estimated pipeline value by source and service line | Makes acquisition prioritization commercial | Metric-builder / UI |

### De-emphasize in the executive layer

| Metric | Why to de-emphasize |
| --- | --- |
| Raw impressions without intent segmentation | Visibility alone does not guide investment |
| Raw users | Sessions and users are context, not decisions |
| Reference keyword position without clear label | It can be misread as live performance unless clearly fenced |
| Top rows sorted by traffic only | Growth teams need quality and opportunity rankings, not volume-only rankings |

## SEO Intelligence Recommendations

| Recommendation | Why | Primary change type |
| --- | --- | --- |
| Import query-level Search Console data into a new daily mart keyed by query, landing page, and date | Required for branded split, clustering, cannibalization, and opportunity sizing | Schema / ETL |
| Add keyword clustering and topic ownership to the canonical catalog | Moves SEO from keyword monitoring to topical strategy | Schema / Workflow |
| Build content decay detection for pages and clusters | Creates a refresh backlog driven by lost clicks and rankings | Metric-builder / UI |
| Surface cannibalization candidates by shared query cluster across multiple landing pages | Prevents diluted ranking equity | Metric-builder / UI |
| Add technical SEO health cards for indexation, sitemap freshness, and crawl-critical templates | Makes technical SEO visible in the same operating system | API / UI |
| Add internal linking opportunity views by cluster and target page | Helps convert content strategy into authority growth | Schema / UI |
| Separate reference metrics from live metrics more aggressively in the UI | Prevents decision mistakes during ranking fallback states | UI |

## CRO Recommendations

| Recommendation | Why | Primary change type |
| --- | --- | --- |
| Build a server-side funnel mart from page/CTA/form/lifecycle events | Converts instrumentation into a usable funnel model | Schema / ETL |
| Track form starts, step progression, validation failures, and abandonment by page template | Makes friction visible | Tracking / ETL |
| Introduce a landing-page scorecard combining traffic, lead rate, qualified lead rate, and estimated value | Prioritizes CRO work better than bounce or traffic alone | Metric-builder / UI |
| Add CTA inventory and CTA performance by page section | Supports copy and placement tests | Tracking / UI |
| Segment every funnel view by device, service family, business line, and source | Supports root-cause analysis | UI / Metric-builder |
| Create an experiment registry with hypothesis, owner, target metric, and readout | Makes CRO repeatable and reviewable | Schema / Workflow / UI |

## Automation Recommendations

| Recommendation | Why | Primary change type |
| --- | --- | --- |
| Add freshness and failure alerts on `growth_reporting_source_health` | Source health should trigger action, not only display status | Automation / Workflow |
| Add anomaly detection for direct spikes, landing-page drop-offs, qualified lead collapse, and SERP mismatch states | Growth teams need proactive issue detection | Automation / Metric-builder |
| Deliver a weekly executive digest with trend, risks, opportunities, and actions | Reduces manual reporting effort | Automation / UI / Workflow |
| Add daily ops alerts for stale queue breaches and missing attribution spikes | Keeps Admin ops responsive | Automation / Workflow |
| Automate paid and social imports when spend volume justifies it | Removes manual reporting bottlenecks | API / ETL |

## Visualization Improvements

| Improvement | Why |
| --- | --- |
| Add a top executive summary band with `trend`, `risk`, `opportunity`, and `next action` | Current top cards are informative but not action-compressing |
| Promote `pipeline` into a first-class top-level section or a persistent summary strip | Pipeline is too central to remain buried under `overview` only |
| Add segmentation controls for business line, service family, device, source class, and page type | Monitoring without slicing limits decision quality |
| Add benchmark lines, target lines, and threshold states to charts | Current charts show direction but not target attainment |
| Add annotations for campaigns, content launches, imports, and outages | Helps explain sudden changes |
| Add drill-through affordances from cards into filtered tables and lead lists | Supports operational follow-through |
| Normalize language in the UI | The dashboard currently mixes English navigation with French KPI labels |

## Tracking Improvements

| Improvement | Why | Primary change type |
| --- | --- | --- |
| Normalize source / medium / campaign naming with an enforced taxonomy | Reduces attribution drift | Tracking / Workflow |
| Capture branded vs non-branded classification in the SEO layer | Required for meaningful SEO reporting | Schema / ETL |
| Persist form-start and step-completion events into reporting tables or importable aggregates | Required for CRO diagnostics | Tracking / ETL |
| Add page template and CTA ID dimensions | Required for page-type benchmarking and CTA testing | Tracking |
| Add lead-quality outcome fields such as `valid`, `spam`, `low_intent`, `high_intent` | Required for true acquisition efficiency | Schema / Workflow |
| Add owner and SLA fields to lead operations | Required for throughput accountability | Schema / Workflow |

## Technical Architecture Recommendations

| Recommendation | Why |
| --- | --- |
| Introduce a semantic layer with dedicated views or materialized views for `exec`, `funnel`, `seo_query`, `landing_page_score`, and `experiments` | Avoids overloading one metric builder with every future concern |
| Add run-history and alert-history tables | `growth_reporting_source_health` is current state, not operational history |
| Add dimension tables for channel, service line, landing page type, keyword cluster, and experiment | Makes modeling and joins more stable |
| Create contract tests for future derived marts, not only the dashboard payload | Prevents silent semantic drift |
| Add QA reconciliation checks to cron output and weekly review checklist | Reduces trust erosion before stakeholders notice |
| Keep the existing dashboard as the presentation layer, but move more logic into reusable data marts | Improves maintainability and scalability |

## Gap Analysis

| Missing capability | Why it matters | Business impact | Technical complexity | Dependency | Priority | Primary change type |
| --- | --- | --- | --- | --- | --- | --- |
| Executive summary and action layer | Executives need compressed decision support, not only monitoring | High | Medium | KPI cleanup | P1 | UI / Metric-builder |
| Segmentation by business line, service, device, page type, and source class | Most growth decisions depend on slices, not totals | High | Medium | Tracking normalization | P1 | UI / Metric-builder |
| Query-level Search Console mart | Enables non-brand, clustering, opportunity, and cannibalization | High | High | New ETL table | P1 | Schema / ETL |
| Content decay scoring | Creates a refresh backlog tied to lost demand | High | Medium | Query/page history | P2 | Metric-builder / UI |
| Cannibalization detection | Prevents multiple pages competing for the same demand | High | High | Query-level mart | P2 | Metric-builder / UI |
| CTA and form funnel analytics | Required for CRO prioritization | High | Medium | Event persistence | P1 | Schema / ETL / UI |
| Landing-page opportunity scoring | Turns traffic and quality into a ranked backlog | High | Medium | Segmentation + funnel metrics | P2 | Metric-builder / UI |
| Experiment registry and readout workflow | Required for systematic growth work | High | Medium | Ownership model | P1 | Schema / Workflow / UI |
| Alerting and anomaly detection | Makes the system proactive | High | Medium | Semantic metrics + thresholds | P2 | Automation |
| Scheduled executive reporting | Reduces manual reporting effort | Medium | Medium | Executive summary layer | P2 | Automation / Workflow |
| Automated paid/social connectors | Improves freshness and reliability | Medium | Medium | API access and import mapping | P3 | API / ETL |
| Lead-quality scoring taxonomy | Separates real demand from noise | High | Medium | Workflow changes in ops | P1 | Schema / Workflow |
| Technical SEO monitoring | Keeps search visibility risks visible | Medium | Medium | Additional connectors or route checks | P3 | API / UI |
| Content ROI engine | Links content investment to pipeline impact | High | High | Query mart + lead quality | P4 | Metric-builder / Schema |
| Forecasting and planning model | Supports resource allocation and target setting | Medium | High | Stable historical marts | P4 | Metric-builder |
| Attribution and LTV modeling | Required for advanced acquisition scaling | High | High | Lead quality + closed-won value history | P4 | Schema / Metric-builder |

## Quick Wins

These are the highest-confidence improvements that should ship first.

| Quick win | Why it should happen first | ETA |
| --- | --- | --- |
| Clean up KPI naming and add a dashboard glossary | Improves trust and interpretation immediately | 1-2 weeks |
| Add segmentation controls for B2B/B2C, service, and source | Unlocks higher-quality decisions without major new data sources | 2-3 weeks |
| Add an executive summary strip with top trend, biggest risk, biggest opportunity, and next action | Makes the dashboard usable in leadership reviews | 1-2 weeks |
| Add alert thresholds for stale connectors and unattributed lead spikes | Converts trust issues into operational actions | 1-2 weeks |
| Add landing-page qualified lead rate beside lead rate | Improves CRO and SEO prioritization immediately | 1 week |
| Add sample-size warnings to CPL and CPA tables | Reduces decision risk from thin-volume rows | 1 week |
| Standardize UI language | Improves polish and executive comprehension | 1 week |

## Prioritization Framework

### Scoring rubric

- `Impact`, `Confidence`, `Ease`, `Reach`, and `Effort` use a 1-10 scale.
- `ICE = Impact x Confidence x Ease / 10`
- `RICE = Reach x Impact x Confidence / Effort`

### ICE scoring

| Initiative | Impact | Confidence | Ease | ICE | Why it ranks here |
| --- | --- | --- | --- | --- | --- |
| Tracking taxonomy and attribution QA | 10 | 9 | 7 | 63.0 | Highest leverage enabler for trustworthy growth decisions |
| KPI cleanup and metric glossary | 8 | 10 | 9 | 72.0 | Fastest trust improvement across every audience |
| Executive summary and action layer | 8 | 8 | 8 | 51.2 | Improves leadership usability quickly |
| Segmentation layer v1 | 9 | 8 | 7 | 50.4 | Major decision unlock with manageable effort |
| Experiment registry and workflow | 8 | 9 | 8 | 57.6 | Turns reporting into repeatable growth operations |
| Landing-page opportunity scorecard | 8 | 8 | 7 | 44.8 | Strongly improves CRO and SEO prioritization |
| Funnel diagnostics mart | 9 | 8 | 6 | 43.2 | High value, but requires more modeling work |
| Scheduled executive digest | 7 | 8 | 8 | 44.8 | Useful once the executive layer exists |
| Alerting and anomaly detection | 9 | 7 | 6 | 37.8 | Valuable, but depends on stable semantics |
| Query-level SEO intelligence mart | 10 | 7 | 4 | 28.0 | Transformational, but more complex than Phase 1 work |
| Paid/social connector automation | 7 | 7 | 5 | 24.5 | Important later, but not the first leverage point |
| Content ROI engine | 9 | 6 | 4 | 21.6 | Strong eventual value, but needs earlier foundations |
| Forecasting and planning model | 8 | 6 | 3 | 14.4 | Advanced layer, not a day-one unlock |
| Attribution and LTV model | 9 | 5 | 2 | 9.0 | Valuable only after better quality and revenue data |

### RICE scoring

| Initiative | Reach | Impact | Confidence | Effort | RICE | Priority implication |
| --- | --- | --- | --- | --- | --- | --- |
| KPI cleanup and metric glossary | 9 | 8 | 10 | 3 | 240.0 | Do first |
| Tracking taxonomy and attribution QA | 10 | 10 | 9 | 4 | 225.0 | Do first |
| Segmentation layer v1 | 9 | 9 | 8 | 5 | 129.6 | Early Phase 1 |
| Executive summary and action layer | 8 | 8 | 8 | 4 | 128.0 | Early Phase 1 |
| Experiment registry and workflow | 7 | 8 | 9 | 4 | 126.0 | End of Phase 1 |
| Landing-page opportunity scorecard | 8 | 8 | 8 | 5 | 102.4 | Early Phase 2 |
| Scheduled executive digest | 7 | 7 | 8 | 4 | 98.0 | Phase 3 after exec layer |
| Funnel diagnostics mart | 8 | 9 | 8 | 6 | 96.0 | Phase 2 |
| Alerting and anomaly detection | 8 | 9 | 7 | 6 | 84.0 | Phase 3 |
| Query-level SEO intelligence mart | 8 | 10 | 7 | 8 | 70.0 | Phase 2, but needs focused data work |
| Content ROI engine | 7 | 9 | 6 | 8 | 47.3 | Phase 4 |
| Paid/social connector automation | 6 | 7 | 7 | 7 | 42.0 | Phase 3 if paid spend scales |
| Forecasting and planning model | 6 | 8 | 6 | 9 | 32.0 | Phase 4 |
| Attribution and LTV model | 7 | 9 | 5 | 10 | 31.5 | Phase 4 |

### Impact vs effort matrix

| Quadrant | Initiatives |
| --- | --- |
| High impact / low effort | KPI cleanup and glossary, tracking QA, executive summary layer, sample-size warnings, UI language normalization |
| High impact / medium effort | Segmentation layer, landing-page scorecard, funnel diagnostics mart, experiment registry |
| High impact / high effort | Query-level SEO mart, alerting/anomaly detection, content ROI engine, forecasting, attribution/LTV model |
| Medium impact / medium-high effort | Paid/social connector automation, scheduled executive digest, technical SEO monitoring |

### Implementation dependencies

1. Tracking taxonomy and attribution QA unlock segmentation, landing-page scoring, experiment readouts, and later attribution modeling.
2. KPI cleanup unlocks executive reporting, alerts, and cross-team trust.
3. Segmentation unlocks meaningful funnel diagnostics and landing-page prioritization.
4. Query-level SEO ingestion unlocks non-brand reporting, clustering, decay, cannibalization, and content ROI.
5. Lead-quality taxonomy unlocks true acquisition efficiency and LTV-ready modeling.
6. Executive summary layer should exist before automated executive digests.
7. Stable semantic marts should exist before anomaly detection to avoid false positives.

## Detailed Roadmap

### Phase 1 - Foundation

**Timeframe:** Weeks 1-8

**Objective:** Make the dashboard trustworthy, segmented, and leadership-usable.

| Initiative | Deliverable | Success criteria | Owner | Unlocks next |
| --- | --- | --- | --- | --- |
| KPI cleanup and glossary | Canonical KPI language, labels, and definitions aligned across docs and UI | Every top-line KPI has one owner, formula, and decision intent; ambiguous labels removed | Growth owner + Engineering | Executive summary, alerts |
| Tracking taxonomy and attribution QA | Source/medium/campaign normalization, attribution QA checklist, direct spike rules | Attribution fields are consistent; unattributed leads are visible as an explicit health issue | Engineering + Growth owner | Segmentation, acquisition quality |
| Segmentation layer v1 | Filters for business line, service family, source class, and device where applicable | Teams can compare B2B/B2C, service, and source slices without leaving the dashboard | Engineering + Growth owner | Funnel diagnostics, page scoring |
| Executive summary and action layer | Top-band summary with trend, risk, opportunity, and recommended next action | Leadership can understand the period in under 2 minutes | Growth owner + Engineering | Weekly and monthly reporting |
| Lead-quality taxonomy v1 | Admin ops workflow for valid / invalid / low-intent / high-intent classification | Channel and page quality can be separated from raw volume | Admin ops + Growth owner | ROI, forecasting, attribution |

### Phase 2 - Growth Intelligence

**Timeframe:** Weeks 9-16

**Objective:** Convert the dashboard from monitoring into prioritization.

| Initiative | Deliverable | Success criteria | Owner | Unlocks next |
| --- | --- | --- | --- | --- |
| Funnel diagnostics mart | CTA -> form -> lead -> qualified -> won funnel views by segment | Top leaks are visible by template, device, and source | Engineering + Growth owner | CRO roadmap |
| Query-level SEO intelligence mart | Query x page daily dataset, branded split, cluster model | Non-brand growth, decay, and cannibalization are measurable | Engineering + Growth owner | Content ROI |
| Landing-page opportunity scorecard | Ranked page backlog by traffic, quality, and opportunity | Top pages to fix are obvious and prioritized weekly | Growth owner | CRO and SEO sprint planning |
| Experiment registry and workflow | Experiment backlog, score, owner, target metric, readout template | Every major growth change is tracked as a hypothesis with a measured outcome | Growth owner + Admin ops | Growth operating rhythm |

### Phase 3 - Automation

**Timeframe:** Weeks 17-24

**Objective:** Make the system proactive and reduce manual reporting.

| Initiative | Deliverable | Success criteria | Owner | Unlocks next |
| --- | --- | --- | --- | --- |
| Alerting and anomaly detection | Freshness, attribution, SEO, and funnel alerts via email or Slack | Teams learn about failures and drops before weekly review | Engineering | Operational responsiveness |
| Scheduled executive digest | Auto-generated weekly and monthly summary with top movers and actions | Manual reporting time drops materially | Growth owner + Engineering | Executive scale |
| Paid/social connector automation | Automated ingestion replacing manual CSV when justified | Paid and social freshness no longer depend on manual imports | Engineering | Multi-channel scaling |
| Technical SEO monitoring | Basic monitoring for sitemap/indexation/template SEO integrity | Search risk is surfaced without ad hoc investigation | Engineering + Growth owner | Search reliability |

### Phase 4 - Advanced Growth System

**Timeframe:** Months 6-12

**Objective:** Add planning, valuation, and predictive decision support.

| Initiative | Deliverable | Success criteria | Owner | Unlocks next |
| --- | --- | --- | --- | --- |
| Content ROI engine | Cluster/page ROI view using traffic, qualified leads, wins, and pipeline value | Content investment can be ranked by business outcome | Growth owner + Engineering | Editorial portfolio planning |
| Forecasting and planning model | Monthly and quarterly forecast for leads, qualified leads, wins, and spend efficiency | Growth planning uses modeled expectations instead of intuition only | Growth owner | Target setting |
| Attribution and LTV model | Advanced source valuation using lead quality and eventual outcome | Channel scaling decisions are based on value, not only last-touch leads | Growth owner + Engineering | Mature acquisition scaling |

## What Should Be Done First

1. Fix semantics before sophistication.
   The first highest-leverage work is KPI cleanup, tracking QA, and segmentation. Every later feature depends on trusted semantics.

2. Add the executive action layer immediately after semantics.
   Leadership should not wait for advanced modeling to get a usable summary.

3. Build the funnel and query marts before building alerts or AI summaries.
   Automating weak logic only scales confusion.

4. Delay advanced attribution, forecasting, and content ROI until lead quality and query intelligence are stable.
   Those models are powerful only after the foundations are reliable.

## Weekly Growth Review Workflow

**Cadence:** Weekly, 45 minutes, same day and time each week

**Attendees:** Growth owner, Admin ops, Engineering, optional executive sponsor

**Agenda:**

1. Data trust check
   Review `dataHealth`, freshness exceptions, attribution anomalies, and open QA issues.
2. Executive summary review
   Confirm top trend, biggest risk, biggest opportunity, and last week action follow-up.
3. Acquisition and SEO review
   Review channel movement, landing-page scorecards, keyword and query opportunities, and major drops.
4. Funnel and pipeline review
   Review qualification speed, drop-offs, stale queue, and high-value lead bottlenecks.
5. Experiment and action decisions
   Approve the next 1-3 experiments, content refreshes, or tracking fixes with owners and due dates.

**Output required each week:**

- 3 facts that changed
- 3 hypotheses for why
- 3 actions with owner and due date

## Monthly Reporting Workflow

**Cadence:** Monthly, 60 minutes

**Audience:** Leadership plus growth and operations

**Monthly pack structure:**

1. Executive summary
   Trend, wins, losses, risks, next-month actions.
2. Growth scoreboard
   Leads, qualified leads, wins, unattributed rate, estimated pipeline value, and source health.
3. Channel and content ROI
   Performance by source, landing page, service family, and content cluster.
4. Funnel and operations
   Qualification speed, stale queue, SLA breaches, and experiment outcomes.
5. Decisions
   Budget shifts, content priorities, CRO priorities, and tracking or automation investments.

## Experimentation Workflow

| Step | Rule |
| --- | --- |
| Intake | Every idea must state problem, hypothesis, segment, target metric, owner, and expected impact |
| Scoring | Use ICE in weekly review |
| Approval | Run only experiments with a named owner and clear readout date |
| Execution | Track launch date, page/segment, expected duration, and success threshold |
| Readout | Record result as win, loss, inconclusive, or instrumentation issue |
| Archive | Store learnings in the experiment registry and tag related pages/channels |

## Dashboard Governance And Ownership

| Owner | Responsibilities |
| --- | --- |
| Growth owner | KPI definitions, backlog prioritization, weekly review, channel/content decisions, experiment prioritization |
| Admin ops | Lead status hygiene, lead-quality tagging, stale queue management, manual attribution corrections |
| Engineering | Tracking integrity, ETL, schema, dashboard UI/API, alerting, source-health reliability |

Working rule:

- Growth owner owns meaning.
- Admin ops owns lifecycle truth.
- Engineering owns system trust.

## Maintenance Process

### Daily

- Check source health status
- Check stale queue breaches
- Review major attribution anomalies

### Weekly

- Run growth review
- Reconcile top KPI movers against source systems when needed
- Triage failed alerts or stale connectors

### Monthly

- Review KPI relevance and remove non-actionable cards
- Review inactive keywords and cluster mapping
- Review landing-page scorecard and content refresh backlog
- Review experiment throughput and readout quality

### Quarterly

- Re-score roadmap initiatives
- Revisit ownership capacity and reporting needs
- Reassess whether the current stack still supports scale

## Suggested Future Stack

### Extend the current stack now

| Layer | Recommendation |
| --- | --- |
| Presentation | Keep the existing Next.js admin dashboard as the operating surface |
| Database | Keep Supabase as the operational source and reporting store |
| Transformation | Add Supabase SQL views or materialized views for executive, funnel, query, and experiment marts |
| Connectors | Continue GA4, Search Console, SerpApi; add automated paid/social ingestion only once spend volume justifies it |
| Alerts | Start with email; add Slack when the process and thresholds are stable |
| QA | Expand the current test suite with semantic mart checks and reconciliation scripts |

### Add later when justified

| Layer | Recommendation |
| --- | --- |
| Warehouse | Add BigQuery or another warehouse only when query-level SEO, event-level funneling, and attribution modeling outgrow current simplicity |
| Transformation framework | Add dbt or equivalent when transformation complexity spans multiple marts and owners |
| BI layer | Add a BI tool only for external stakeholder reporting or self-serve analysis; keep the admin dashboard as the action surface |
| Experimentation tooling | Add feature flagging or testing infrastructure when experiment volume exceeds manual coordination |

## Final Recommendation

Do not replace the current dashboard. Productize it.

The foundation is already better than most early-stage internal growth dashboards because the system has semantics, tests, lifecycle data, source health, and a governed keyword model. The next 6-12 months should focus on turning this foundation into a real growth operating system by doing four things in order:

1. Tighten trust and semantics.
2. Add segmentation and executive usability.
3. Build real SEO and CRO intelligence layers.
4. Add automation and advanced planning only after the data model is strong enough to support them.

If executed in that order, the dashboard will evolve from a capable reporting tool into the central operating system for SEO growth, CRO optimization, acquisition scaling, experimentation, and executive decision-making.
