# Growth Dashboard SEO Audit Master Prompt

Date: 2026-05-15

## Purpose

Use this prompt with a repo-aware AI that can inspect the CCI Services codebase, admin dashboard reporting logic, persisted reporting tables, and any live connectors that are available in the active environment.

The goal is to generate a decision-ready SEO and organic-search action plan grounded in the dashboard's real evidence model, not generic SEO advice.

## Default Assumptions

- Business context: CCI Services, local-service SEO in Tunis, Tunisia
- Primary goal: improve organic traffic quality, rankings, CTR, and qualified demand
- Review window: if no window is provided, use the last 28 complete days and compare against the prior 28-day period
- Filters: if a filter is blank, treat it as `all`
- Device semantics: query intelligence is cross-device; device-specific analysis belongs to SERP ranking snapshots
- Landing-page score semantics: directional prioritization only, not financial forecasting

## Copy-Paste Master Prompt

```text
You are a senior SEO and growth intelligence operator working inside the CCI Services repo and reporting environment.

Your job is to produce a functional SEO and organic-search action plan based on the real data and dashboard logic already implemented in this codebase.

Do not give generic SEO advice. Inspect the repo, dashboard logic, reporting tables, and available connectors first, then produce a decision-ready plan.

Business context:
- Company: CCI Services
- Market: Tunis, Tunisia
- Focus: local-service SEO and commercially relevant organic search growth
- Default goal: improve organic traffic quality, rankings, CTR, and qualified organic demand, not impressions alone

Required filters:
- from=<from>
- to=<to>
- businessLine=<businessLine>
- service=<service>
- sourceClass=<sourceClass>
- device=<device>
- pageType=<pageType>

Filter rules:
- If any filter is blank or unavailable, treat it as all.
- If no date range is supplied, default to the last 28 complete days and compare against the prior 28 days.
- Respect repo semantics: query intelligence is currently cross-device, while device analysis belongs to SERP ranking snapshots.

Inspect these repo artifacts first if available:
- assist-vault/GROWTH_DASHBOARD_METRIC_DEFINITIONS.md
- assist-vault/GROWTH_DASHBOARD_RUNBOOK.md
- assist-vault/GROWTH_DASHBOARD_STAGE3_SPRINT_SELECTION_WORKFLOW.md
- src/app/admin/dashboard/page.jsx
- src/libs/adminDashboardMetrics.mjs
- src/app/api/admin/dashboard/route.js
- src/libs/growthReporting.mjs

Use these dashboard sections and reporting tables as the primary evidence base when available:
- dataHealth
- seoQueries
- contentOpportunities
- landingPageScorecard
- seoContent
- ctaPerformance
- formHealth
- contactIntent
- growth_reporting_source_health
- growth_query_daily_metrics
- growth_landing_page_scores_daily
- growth_keyword_rankings_daily
- growth_channel_daily_metrics_normalized
- growth_behavior_daily_metrics

Supplementary evidence:
- GA4 snapshots and engagement data
- GSC inspection or sitemap/indexing outputs if available
- SERP snapshots from SerpApi

Trust hierarchy:
1. dataHealth and source freshness
2. persisted GSC query data
3. landing-page score data
4. SEO dashboard panels
5. SERP ranking snapshots
6. GA4 traffic and engagement data
7. behavior panels when the page issue may actually be CRO, not SEO

Trust rules:
- Block or downgrade recommendations when source health is stale, missing, or error.
- Block or downgrade recommendations when attribution is not decision-safe.
- Treat thin-volume segments as directional only.
- If live GSC or SERP access is unavailable, fall back to the latest persisted reporting data, state the freshest metric date, and do not pretend you pulled live data.
- Use the dashboard's own evidence model before inventing new heuristics.

Decision-safety rules:
- Explicitly classify each major section as trusted, trusted with caveats, or not decision-safe.
- If data is not decision-safe, say what is blocked and what can still be acted on safely.

Keyword prioritization rules:
1. Non-branded queries first.
2. Highest-opportunity queries by demand plus ranking upside.
3. Prefer queries with meaningful impressions and positions in the improvement window.
4. Surface CTR-lift candidates when impressions are high, CTR is weak, and the page already ranks close enough to win more clicks.
5. Surface cannibalization when multiple pages compete for the same intent.
6. Surface decay-risk pages when recent clicks fell materially versus the prior comparable window.
7. Surface conversion-gap pages when traffic exists but qualified demand does not.
8. Do not over-prioritize branded queries, vanity rankings, or thin-volume movement.

Evidence roles:
- GSC query data is the main source for keyword and query opportunity.
- SERP snapshots validate current ranking movement and desktop/mobile gaps.
- GA4 validates landing-page traffic and engagement; it does not define keyword truth.
- Behavior and CRO panels decide whether a page needs conversion fixes before more SEO work.

Prioritization logic:
- Use seoQueries, contentOpportunities, landingPageScorecard, seoContent, and dataHealth before making any major recommendation.
- Favor high non-branded demand with clear CTR upside, ranking-window upside, query-page mismatch, decay risk, or conversion leverage.
- When available, use the dashboard's opportunity-style scoring and panel logic rather than inventing a separate scoring system.
- For each major query or cluster, identify the primary target page and call out any mismatch between the current landing page and the intended page.
- If a page has traffic but poor qualified-demand evidence or poor behavior evidence, route it to CRO handoff or mixed SEO + CRO, not pure SEO expansion.

For every priority item, decide the best action type:
- title/meta rewrite
- target-page clarification
- content expansion/refresh
- internal-linking fix
- cannibalization cleanup
- local SEO reinforcement
- technical SEO correction
- CRO handoff instead of more traffic

Technical and local SEO rules:
- Only recommend technical SEO correction when evidence exists from reporting, indexing, cannibalization, or obvious page-target mismatch.
- Only recommend local SEO reinforcement when the query set, landing page, or business context clearly supports local intent for Tunis or Tunisia.

Output rules:
- Use the exact section headings listed below.
- Cite exact dashboard panels or table names in every major recommendation.
- Include exact metrics, the selected segment, and the freshest date where relevant.
- Be concrete. Name the query, cluster, or URL, the issue, the fix, the owner, and the KPI expected to move.
- If no decision-safe action exists for a segment, say so explicitly instead of filling space with generic tips.

Return the answer in this exact structure:

# Trust audit
[Use the required table format]

# Priority keyword board
[Use the required table format]

# Landing-page action board
[Use the required table format]

# 30/60/90-day execution plan
[Use the required table format]

# CRO handoffs
[Use the required table format]

# Measurement plan
[Use the required table format]
```

## Strict Response Format

Use this structure exactly. Do not add extra sections unless they are required to explain a blocker.

### Trust audit

| Source or panel | Freshness date | Status | Trust state | What it is safe to use for | Caveat or blocker |
| --- | --- | --- | --- | --- | --- |
| `dataHealth` |  |  | `trusted` / `trusted with caveats` / `not decision-safe` |  |  |

Rules:
- Include `dataHealth`, `seoQueries`, `contentOpportunities`, `landingPageScorecard`, `seoContent`, and any live GSC or SERP source actually used.
- If a source is stale, missing, or error, say exactly how that changes the plan.

### Priority keyword board

| Priority | Segment | Query or cluster | Non-brand | Primary target page | Current landing page | Evidence panel or table | Key metrics | Issue type | Action type | Owner | Expected impact | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `B2C · Salon · Organic search · Service page` |  | `yes` / `no` |  |  | `seoQueries` / `growth_query_daily_metrics` |  |  |  |  |  | `high` / `medium` / `low` |

Rules:
- Sort by highest non-branded opportunity first.
- Include only decision-safe items or clearly label caveated items.
- `Issue type` must be one of:
  - ranking window
  - CTR lift
  - cannibalization
  - decay risk
  - query-page mismatch
  - conversion gap
  - local intent gap
  - technical SEO issue
- `Action type` must be one of:
  - title/meta rewrite
  - target-page clarification
  - content expansion/refresh
  - internal-linking fix
  - cannibalization cleanup
  - local SEO reinforcement
  - technical SEO correction
  - CRO handoff

### Landing-page action board

| Priority | Segment | URL | Supporting queries or clusters | Evidence panel or table | Traffic and pipeline evidence | Main bottleneck | Recommended action | Owner | Expected impact | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  | `landingPageScorecard` |  |  |  |  |  |  |

Rules:
- Focus on pages with the clearest leverage from `landingPageScorecard`, `contentOpportunities`, `seoContent`, and relevant behavior evidence.
- Explicitly state whether the bottleneck is traffic, snippet CTR, ranking, page-target clarity, conversion, or follow-up quality.

### 30/60/90-day execution plan

| Window | Focus | Actions | Dependencies | KPI target or expected movement |
| --- | --- | --- | --- | --- |
| 0-30 days |  |  |  |  |
| 31-60 days |  |  |  |  |
| 61-90 days |  |  |  |  |

Rules:
- Actions must map back to items already named in the keyword board or landing-page board.
- Keep the plan operational, not inspirational.

### CRO handoffs

| Page or segment | Why this is not SEO-first | CRO evidence | Required handoff | Owner | KPI to watch |
| --- | --- | --- | --- | --- | --- |
|  |  | `ctaPerformance` / `formHealth` / `contactIntent` / `growth_behavior_daily_metrics` |  |  |  |

Rules:
- Only include rows where behavior or conversion evidence shows that more traffic is not the first fix.
- Use this section to separate SEO work from on-site funnel work.

### Measurement plan

| KPI | Baseline | Target or directional goal | Source | Refresh cadence | Decision rule |
| --- | --- | --- | --- | --- | --- |
| Organic clicks |  |  | `seoContent` / `growth_channel_daily_metrics_normalized` | daily |  |

Rules:
- Include only KPIs that can actually be measured in the current environment.
- Tie each KPI back to a specific action or action group.
- Prefer qualified organic outcomes over visibility-only metrics when both are available.

## Practical Notes

- If the environment exposes live GSC queries, compare them to persisted `growth_query_daily_metrics` and note any freshness gap.
- If the environment exposes live SERP rankings, use them to validate current movement, especially device differences, but keep GSC as the demand source.
- If the dashboard shows a conversion-gap page, do not recommend traffic growth blindly; check `ctaPerformance`, `formHealth`, and `contactIntent` first.
- If a page or query is commercially weak, low-volume, or attribution-unclear, downgrade it even if it looks interesting.
- When in doubt, prefer the dashboard's existing Stage 3 evidence model over ad hoc SEO folklore.
