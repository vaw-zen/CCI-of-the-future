# Growth Dashboard All Funnels Enhancement Plan

Date: 2026-05-15

## Goal

Extend Stage 3 from a partially validated behavior layer into a complete, decision-safe funnel operating system across every important commercial and content-to-contact path, while keeping the current roadmap intact.

This plan does **not** add a new phase and does **not** introduce a second dashboard.

It builds on:

- `assist-vault/WEBSITE_BEHAVIOR_TRACKING_SCHEMA.md`
- `assist-vault/GROWTH_DASHBOARD_EXECUTION_PROGRAM.md`
- `assist-vault/GROWTH_DASHBOARD_STAGE3_CLOSEOUT_CHECKLIST.md`
- the Stage 3 hardening checkpoint that added:
  - server-side terminal behavior persistence
  - `npm run growth:audit:stage3`
  - controlled-test readiness markers

## Planning Rules

1. Keep `/admin/dashboard` as the only reporting surface.
2. Treat the behavior schema as the canonical measurement contract.
3. Fix forward; do not spend Stage 3 time reconstructing historical rows.
4. Prove each funnel mechanically before optimizing it.
5. Do not open Stage 4 experiments until the core funnel baselines are decision-safe.

## Funnel Inventory

| Funnel | Current state | Main gap | Priority | Roadmap position |
| --- | --- | --- | --- | --- |
| `/contact` quote funnel | Client events exist; server uses `/api/devis`; terminal persistence is now shipped | Controlled validation and abandonment parity still need live proof | P0 | Stage 3 closeout |
| `/devis` quote funnel | Calculator, form-start, and submit paths exist; server terminal persistence is now shipped | Need live `submit_success`, `validation_failed`, and post-baseline lead joins | P0 | Stage 3 closeout |
| `/entreprises` convention funnel | Form behavior exists; server terminal persistence is now shipped | Need live proof, stronger field-friction coverage, and lead joins | P0 | Stage 3 closeout |
| Service-page CTA funnel | CTA impressions and clicks exist on main blocks | Coverage parity and stable ranking of CTA leaks by page/service still need validation | P1 | Stage 3 stabilization |
| Article CTA funnel | Click tracking exists; impression coverage is still uneven | Need standardized article CTA placements and consistent impression capture | P1 | Stage 3 stabilization |
| Quote calculator funnel | Start and estimate events exist | Need stronger linkage to downstream form starts and submit outcomes | P1 | Stage 3 stabilization |
| WhatsApp / phone / email contact-intent funnel | Intent clicks exist and dashboard contact-intent panel is live | Need better funnel ranking by method and alert thresholds | P1 | Late Stage 3 / Stage 5 |
| Newsletter funnel | Tracking exists but is not yet a first-class growth funnel in the dashboard | Needs normalized form-health treatment and Stage 4 experiment readiness | P2 | Stage 4 prep |

## What “All Funnels” Means In This Roadmap

The target funnel model should ultimately cover:

1. CTA impression
2. CTA click
3. Form start
4. Field completion / friction
5. Validation failure
6. Abandonment
7. Submit success
8. Qualified lead
9. Closed-won lead

This applies differently by funnel:

- Lead forms: full 1-9 path
- Contact-intent methods: 1-2 plus downstream assisted lead attribution where available
- Calculator funnel: calculator start -> estimate -> form start -> submit success
- Newsletter funnel: form start -> validation -> submit success
- Content-to-lead funnels: article read depth -> CTA interaction -> form/contact intent

## Delivery Waves

### Wave 1 — Core Lead Funnel Proof

Objective: prove the three core form funnels mechanically.

Scope:

- `/contact`
- `/devis`
- `/entreprises`

Tasks:

1. Run controlled `[STAGE3 TEST]` validation failure and success submissions on all three flows.
2. Re-run `npm run growth:audit:stage3 -- --baseline-date=2026-05-12 --window-days=14 --lead-window-days=30`.
3. Confirm these move off zero:
   - `form_validation_failed`
   - `submit_success`
4. Confirm controlled post-baseline leads have at least one join key:
   - `ga_client_id`
   - `landing_page`
5. Confirm at least one controlled success matches behavior by `ga_client_id` or normalized landing page inside the 7-day window.

Exit signal:

- Stage 3 is at least `mechanically_validated`, even if still `insufficient_evidence` for Stage 4.

### Wave 2 — Pre-Submit Friction Coverage

Objective: make the top-of-funnel and mid-funnel behavior complete enough for CRO prioritization.

Scope:

- `/contact` field focus / completion / abandonment parity
- `/devis` field-friction consistency
- `/entreprises` field focus parity
- service-page CTA parity
- article CTA impression parity

Tasks:

1. Close missing field-focus and field-complete coverage on `/contact` and `/entreprises`.
2. Make form abandonment capture consistent across the three core lead forms.
3. Standardize article CTA placements:
   - `article_inline_35`
   - `article_inline_70`
4. Confirm service pages emit stable:
   - `cta_id`
   - `cta_location`
   - `cta_type`
5. Add dashboard QA checks so missing `form_name`, `cta_id`, or `business_line` are visible during weekly review.

Exit signal:

- `formHealth` becomes useful for friction diagnosis instead of only signaling starts.

### Wave 3 — Funnel Unification In Reporting

Objective: graduate the reporting layer from partial panels to a real multi-funnel model.

Scope:

- `growth_behavior_daily_metrics`
- `growth_funnel_daily_metrics`
- dashboard `funnelDiagnostics`

Tasks:

1. Split funnel outputs by canonical funnel:
   - `quote_request`
   - `convention_request`
   - `newsletter_signup`
2. Add calculator-assisted funnel rollups:
   - calculator start
   - estimate produced
   - form start after calculator
   - submit success after calculator
3. Add method-aware contact-intent rollups:
   - WhatsApp
   - phone
   - email
   - form
4. Graduate `funnelDiagnostics` from lifecycle-only `v1` to behavior + lifecycle.
5. Keep the dashboard contract flat:
   - no second endpoint
   - no parallel reporting UI

Exit signal:

- one dashboard view can explain both pre-lead friction and downstream business outcomes.

### Wave 4 — Experiment And Alert Readiness

Objective: use the all-funnels model to unlock Stage 4 and strengthen Stage 5.

Tasks:

1. Define experiment baselines per funnel:
   - CTA CTR
   - form-start rate
   - validation-failure rate
   - abandonment rate
   - submit-success rate
2. Define alert thresholds per funnel:
   - CTA collapse
   - validation-failure spike
   - abandonment spike
   - submit-success drop
3. Require CRO sprint candidates to cite:
   - `ctaPerformance`
   - `formHealth`
   - `contactIntent`
   - behavior-aware `funnelDiagnostics`

Exit signal:

- Stage 4 experiments can use real funnel baselines instead of lifecycle proxies.

## Dashboard Contract Evolution

No new dashboard endpoint is introduced.

The next target shape for `GET /api/admin/dashboard` is:

- existing:
  - `seoQueries`
  - `contentOpportunities`
  - `landingPageScorecard`
  - `funnelDiagnostics`
  - `ctaPerformance`
  - `contactIntent`
  - `formHealth`
- enhanced:
  - `funnelDiagnostics` split by funnel and behavior stage
  - calculator-assisted funnel summaries
  - newsletter form-health rows
  - contact-method leakage summaries by page type and business line

## KPI Expansion

Add or harden these funnel KPIs as the next decision layer:

- CTA impression rate
- CTA click-through rate
- calculator-to-form-start rate
- form-start rate
- field-completion rate
- validation-failure rate
- abandonment rate
- submit-success rate
- qualified-lead rate after submit-success
- closed-won rate after submit-success
- contact-intent rate by method

## Acceptance Criteria By Funnel

### Core form funnels

- `submit_success` is no longer zero
- `form_validation_failed` is no longer zero
- controlled submissions carry join keys
- controlled submissions match behavior rows

### CTA funnels

- primary commercial CTAs have stable `cta_id`
- article CTAs have both impression and click evidence
- CTA ranking is usable by page, service, and business line

### Calculator funnel

- calculator starts and estimates can be tied to later form behavior
- dashboard can distinguish “high intent but no submit” from “no intent”

### Contact-intent funnels

- WhatsApp / phone / email intent can be ranked by page type and service context
- assisted contact methods can be reviewed without leaving the dashboard

### Newsletter funnel

- newsletter submit success and failure are visible in the same form-health model
- newsletter can enter Stage 4 experimentation with the same baseline rules as lead forms

## Immediate Next Steps

1. Run the controlled `[STAGE3 TEST]` matrix on `/contact`, `/devis`, and `/entreprises`.
2. Re-run `npm run growth:audit:stage3 -- --baseline-date=2026-05-12 --window-days=14 --lead-window-days=30`.
3. Record the result in `assist-vault/GROWTH_DASHBOARD_STAGE3_CLOSEOUT_CHECKLIST.md`.
4. If terminal outcomes are proven, start Wave 2 with `/contact` and article CTA parity first.
5. Keep Stage 4 blocked until:
   - technical validation passes
   - at least 3 post-baseline organic leads exist
   - two weekly reviews have been completed
   - threshold tuning is documented

## Roadmap Impact

- This plan enhances Stage 3; it does not replace it.
- It sharpens Stage 4 experiment readiness.
- It gives Stage 5 a better anomaly surface.
- It does not change stage order, ownership, or the single-dashboard rule.
