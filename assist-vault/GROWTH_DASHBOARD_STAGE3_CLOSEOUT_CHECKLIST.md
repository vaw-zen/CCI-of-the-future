# Growth Dashboard Stage 3 Closeout Checklist

Date: 2026-05-12

This checklist is the formal gate for moving from Stage 3 to Stage 4. It assumes the Stage 3 code is already shipped and focuses on production validation, workflow adoption, and heuristic stabilization.

## Current Read

- Query intelligence is shipped.
- Behavior persistence is shipped.
- `ctaPerformance`, `contactIntent`, and `formHealth` are shipped.
- `funnelDiagnostics` still remains lifecycle-based `v1` in the dashboard.
- Stage 4 stays blocked until this checklist is completed.

## Preconditions

Complete these before starting the closeout window:

1. Confirm the target environment has all Stage 3 migrations applied:
   - `supabase/20260509_stage3_growth_intelligence.sql`
   - `supabase/20260511_growth_behavior_tracking.sql`
2. Refresh or backfill the current reporting window:
   - `npm run growth:import:ga4`
   - `npm run growth:import:gsc`
   - `npm run growth:import:serp`
3. Confirm the shipped contract still passes locally:
   - `npm run test:dashboard`
   - `npm run build`
4. Lock the review window that will be used for both weekly reviews.
5. Confirm Growth owner and Admin ops know the next two weekly reviews are part of the Stage 3 gate, not ordinary status meetings.

## Baseline Lock

Mark each item `pass`, `warn`, or `fail`.

| Check | Result | Notes |
| --- | --- | --- |
| `growth_query_daily_metrics` exists and has recent rows |  |  |
| `growth_landing_page_scores_daily` exists and has recent rows |  |  |
| `growth_behavior_daily_metrics` exists and has recent rows |  |  |
| `growth_funnel_daily_metrics` exists and has recent rows |  |  |
| `/admin/dashboard` shows `seoQueries` for the active window |  |  |
| `/admin/dashboard` shows `contentOpportunities` for the active window |  |  |
| `/admin/dashboard` shows `landingPageScorecard` for the active window |  |  |
| `/admin/dashboard` shows `funnelDiagnostics` for the active window |  |  |
| `/admin/dashboard` shows `ctaPerformance` for the active window |  |  |
| `/admin/dashboard` shows `formHealth` for the active window |  |  |
| `/admin/dashboard` shows `contactIntent` for the active window |  |  |

## SQL Validation Queries

Use these in Supabase SQL editor to validate the reporting baseline.

### Freshness and row counts

```sql
SELECT 'growth_query_daily_metrics' AS artifact,
       MAX(metric_date) AS freshest_date,
       COUNT(*) FILTER (WHERE metric_date >= CURRENT_DATE - 14) AS recent_rows
FROM public.growth_query_daily_metrics
UNION ALL
SELECT 'growth_landing_page_scores_daily' AS artifact,
       MAX(metric_date) AS freshest_date,
       COUNT(*) FILTER (WHERE metric_date >= CURRENT_DATE - 14) AS recent_rows
FROM public.growth_landing_page_scores_daily
UNION ALL
SELECT 'growth_behavior_daily_metrics' AS artifact,
       MAX(event_date) AS freshest_date,
       COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE - 14) AS recent_rows
FROM public.growth_behavior_daily_metrics
UNION ALL
SELECT 'growth_funnel_daily_metrics' AS artifact,
       MAX(metric_date) AS freshest_date,
       COUNT(*) FILTER (WHERE metric_date >= CURRENT_DATE - 14) AS recent_rows
FROM public.growth_funnel_daily_metrics;
```

### Behavior event coverage

```sql
SELECT event_name,
       COUNT(*) AS event_rows,
       COUNT(DISTINCT ga_client_id) FILTER (
         WHERE ga_client_id IS NOT NULL
           AND BTRIM(ga_client_id) <> ''
       ) AS unique_clients,
       MAX(occurred_at) AS latest_event_at
FROM public.growth_behavior_events
WHERE occurred_at >= NOW() - INTERVAL '14 days'
GROUP BY event_name
ORDER BY event_rows DESC, event_name ASC;
```

### Lead-to-behavior joinability

```sql
WITH recent_leads AS (
  SELECT
    lead.id,
    DATE(lead.created_at) AS lead_date,
    lead.ga_client_id,
    COALESCE(lead.landing_page, '/') AS landing_page
  FROM public.growth_lead_reporting_dimensions AS lead
  WHERE lead.created_at >= NOW() - INTERVAL '30 days'
),
lead_matches AS (
  SELECT
    lead.id,
    COUNT(*) FILTER (
      WHERE lead.ga_client_id IS NOT NULL
        AND BTRIM(lead.ga_client_id) <> ''
        AND event.ga_client_id = lead.ga_client_id
    ) AS client_id_matches,
    COUNT(*) FILTER (
      WHERE public.normalize_growth_path(event.landing_page, '/') = lead.landing_page
    ) AS landing_page_matches
  FROM recent_leads AS lead
  LEFT JOIN public.growth_behavior_events AS event
    ON DATE(event.occurred_at) BETWEEN lead.lead_date - 7 AND lead.lead_date
   AND (
     (
       lead.ga_client_id IS NOT NULL
       AND BTRIM(lead.ga_client_id) <> ''
       AND event.ga_client_id = lead.ga_client_id
     )
     OR public.normalize_growth_path(event.landing_page, '/') = lead.landing_page
   )
  GROUP BY lead.id
)
SELECT
  COUNT(*) AS leads_checked,
  COUNT(*) FILTER (WHERE client_id_matches > 0) AS matched_by_client_id,
  COUNT(*) FILTER (WHERE landing_page_matches > 0) AS matched_by_landing_page,
  COUNT(*) FILTER (
    WHERE client_id_matches = 0
      AND landing_page_matches = 0
  ) AS unmatched_leads
FROM lead_matches;
```

## Live Capture Validation Matrix

Complete one manual validation pass for each flow.

| Flow | Expected context | Must-see events | Result | Notes |
| --- | --- | --- | --- | --- |
| `/contact` | `page_type=contact_page`, `business_line=b2c`, `form_name=contact_quote_form`, `form_placement=contact_page` | `form_field_focus`, `form_field_complete`, `form_validation_failed`, `form_abandonment`, `funnel_step` with `form_start` and `submit_success` |  |  |
| `/devis` | `page_type=quote_page`, `business_line=b2c`, `form_name=devis_form`, `form_placement=devis_page` | `form_field_focus`, `form_field_complete`, `form_validation_failed`, `form_abandonment`, `funnel_step` with `form_start` and `submit_success` |  |  |
| `/entreprises` | `page_type=b2b_page`, `business_line=b2b`, `form_name=convention_form`, `form_placement=entreprises_page` | `form_field_focus`, `form_field_complete`, `form_validation_failed`, `form_abandonment`, `funnel_step` with `form_start` and `submit_success` |  |  |
| Service CTA block | `page_type=service_page`, stable `cta_id`, `cta_location=service_cta_block` | `cta_impression`, `cta_click`, `phone_click`, `whatsapp_click` as applicable |  |  |
| Article CTA block | `page_type=article_page`, `business_line=content`, stable `cta_id`, stable `cta_location` | `cta_impression`, `cta_click`, `phone_click`, `email_click`, `whatsapp_click` as applicable |  |  |

## Dashboard Validation

Check each item under at least one real segment, not only `all traffic`.

| Validation | Result | Notes |
| --- | --- | --- |
| Behavior panels populate without breaking empty-state behavior |  |  |
| `pageType` filter changes behavior panels consistently |  |  |
| `businessLine` filter changes behavior panels consistently |  |  |
| `service` filter changes behavior panels consistently |  |  |
| `sourceClass` filter changes behavior panels consistently |  |  |
| `funnelDiagnostics` tells a coherent story with `ctaPerformance` and `formHealth` for the same segment |  |  |
| `contactIntent` points to a plausible CTA/contact hierarchy on high-value pages |  |  |

## Review Cycle Log

Complete this for the next two weekly reviews.

| Review | Segment | SEO candidate | CRO candidate | Evidence panels cited | Threshold changes | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| Week 1 |  |  |  |  |  |  |
| Week 2 |  |  |  |  |  |  |

## Heuristic Tuning Log

Record every threshold or heuristic adjustment explicitly.

| Area | Old rule | New rule | Why changed | Approved by | Date |
| --- | --- | --- | --- | --- | --- |
| Decay threshold |  |  |  |  |  |
| CTR opportunity rule |  |  |  |  |  |
| Cannibalization sensitivity |  |  |  |  |  |
| CTA drop-off prioritization |  |  |  |  |  |
| Form-friction threshold |  |  |  |  |  |
| Contact-intent interpretation |  |  |  |  |  |

## Stage 3 Gate Review

Stage 4 can open only if all five criteria are `pass`.

| Gate criterion | Result | Notes |
| --- | --- | --- |
| Behavior mart is populated and trusted |  |  |
| Dashboard behavior panels are usable under real segments |  |  |
| Weekly review has run twice on Stage 3 evidence |  |  |
| Sprint selection is using Stage 3 evidence by default |  |  |
| Major false positives in behavior or funnel heuristics are resolved |  |  |

## Default Decision Rule

If any of the gate criteria fail, Stage 3 remains:

- implemented but not validated, or
- validated but not yet adopted, or
- adopted but not yet stable

In any of those states, Stage 4 remains blocked.
