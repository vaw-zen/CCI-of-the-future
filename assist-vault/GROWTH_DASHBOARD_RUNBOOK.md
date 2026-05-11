# Growth Dashboard Launch Runbook

Date: 2026-05-10

## Before Launch

1. Apply all growth SQL migrations:
   - `supabase/20260506_growth_reporting.sql`
   - `supabase/20260506_growth_keyword_rankings.sql`
   - `supabase/20260506_growth_keyword_catalog.sql`
2. Confirm required env vars are present in the target environment:
   - Supabase service credentials
   - `GA4_PROPERTY_ID`
   - `GSC_SITE_URL`
   - `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` or `GSC_CREDENTIALS`
   - `SERPAPI_API_KEY` or `SERPAPI_KEY`
   - `CRON_SECRET`
3. Run the daily snapshot sync once manually for GA4 and Search Console:
   - `npm run growth:import:ga4`
   - `npm run growth:import:gsc`
4. Import at least one paid/social CSV if paid or social reporting is expected this week.
5. Prepare and import the canonical keyword catalog:
   - `npm run growth:prepare:keyword-csv -- '<csvPath>'`
6. Run one live SERP sync for both devices:
   - `npm run growth:import:serp`
7. Freeze and circulate the Stage 0 operating docs:
   - `GROWTH_DASHBOARD_EXECUTION_PROGRAM.md`
   - `GROWTH_DASHBOARD_SEMANTICS_AND_THRESHOLDS.md`
   - `GROWTH_DASHBOARD_METRIC_DEFINITIONS.md`
8. Confirm threshold ownership:
   - Growth owner approves KPI semantics and weekly review format
   - Admin ops approves stale queue and lead-quality workflow
   - Engineering approves freshness thresholds and alert semantics
9. Complete 10 manual reconciliations:
   - 4 dashboard cards vs Supabase SQL
   - 3 acquisition totals vs GA4 / Search Console / manual import
   - 2 landing-page rows vs source tools
   - 1 stale queue count vs admin lead list
10. Confirm the keyword section is using live Supabase data:
   - active keyword catalog count is correct
   - desktop and mobile rankings both exist
   - visibility trend and position trend behave as expected for the current history depth
11. Run the attribution hygiene audit and review the recent problematic rows:
   - `npm run growth:audit:attribution -- --days 30`
12. For the behavior layer rollout, confirm canonical behavior context coverage on key commercial flows:
   - `/contact` uses `contact_quote_form`
   - `/devis` uses explicit `page_type=quote_page`, `business_line=b2c`, and `form_placement=devis_page`
   - `/entreprises` uses explicit `page_type=b2b_page`, `business_line=b2b`, and `form_placement=entreprises_page`
   - service and article CTAs emit stable `cta_id` and `cta_location`
13. Run `npm run analytics:validate`, `npm run test:dashboard`, and `npm run build`.

## Week 1 Stabilization

- Daily 15-minute review at 09:00 Africa/Tunis.
- Checklist:
  - Confirm data-health badges are green or explain any stale/missing state.
  - Compare yesterday’s GA4 and Search Console snapshots to source tools.
  - Run `npm run growth:audit:attribution -- --days 7` and record pass / warning / critical status.
  - Confirm SERP keyword freshness and that both `desktop` and `mobile` snapshots landed.
  - Check whether the position trend has enough ranked snapshot days to be decision-useful.
  - Check stale queue count and oldest lead age.
  - Review suspicious `direct / (none)` rows with external referrers and landing-page capture gaps.
  - Check campaign naming drift and fix source links or imports when variants appear.
  - Once `growth_behavior_daily_metrics` is live, confirm freshness and spot-check missing `page_type`, `business_line`, `cta_id`, and `form_name` on commercial behavior rows.
  - Flag any KPI card carrying a thin-volume warning and treat it as directional only.
  - Note keyword-target mismatches or catalog rows that should move to better landing pages.
  - Capture any KPI mismatches in a short engineering follow-up list.

## Weekly Monday Review

- Use [GROWTH_DASHBOARD_WEEKLY_REVIEW_TEMPLATE.md](/Users/fareschaabane/Documents/dev/CCI-of-the-future/assist-vault/GROWTH_DASHBOARD_WEEKLY_REVIEW_TEMPLATE.md) as the default meeting format.
- Use [GROWTH_DASHBOARD_STAGE3_SPRINT_SELECTION_WORKFLOW.md](/Users/fareschaabane/Documents/dev/CCI-of-the-future/assist-vault/GROWTH_DASHBOARD_STAGE3_SPRINT_SELECTION_WORKFLOW.md) to choose the weekly SEO refresh and CRO sprint candidates.
- Order of review:
  - Data health first
  - Attribution audit second
  - Acquisition changes third
  - Top landing pages, keyword visibility, and campaigns fourth
  - Stale queue and throughput fifth
  - Next-week action list last
- Required output:
  - 3 KPIs that moved
  - 3 suspected causes
  - 3 actions with owners and due dates
  - Every action references a dashboard segment or taxonomy slice, not only a top-line total
  - Attribution review is marked `trusted`, `trusted with caveats`, or `not decision-safe`
  - The selected SEO refresh and CRO sprint candidates each reference at least one Stage 3 evidence panel
  - Once the behavior mart is live, CRO actions should also reference `ctaPerformance`, `formHealth`, or `contactIntent` when the issue is on-site funnel friction

## Weekly Attribution QA

- Run `npm run growth:audit:attribution -- --days 7`.
- Use [GROWTH_DASHBOARD_ATTRIBUTION_QA_CHECKLIST.md](/Users/fareschaabane/Documents/dev/CCI-of-the-future/assist-vault/GROWTH_DASHBOARD_ATTRIBUTION_QA_CHECKLIST.md) as the named pass/fail workflow.
- Escalate immediately if:
  - unattributed rate is `>= 40%`
  - landing-page capture is missing on new leads
  - campaign naming drift makes acquisition comparisons ambiguous

## Weekly Behavior QA

Activate this section once `growth_behavior_daily_metrics` is live.

- Confirm the behavior mart is fresh for the selected review window.
- Review missing canonical context on commercial behavior rows:
  - `page_type`
  - `business_line`
  - `cta_id`
  - `form_name`
- Confirm service and article CTA rows are grouped by stable `cta_id` and `cta_location`, not ad-hoc labels.
- Confirm behavior rows can still be joined to lead outcomes through `ga_client_id`, landing page, and normalized attribution dimensions.
- Escalate immediately if:
  - a commercial form emits missing `form_name` or `business_line`
  - a tracked CTA emits missing `cta_id` or `cta_location`
  - the behavior mart is stale enough to make CRO review non-decision-safe

## Weekly Friday Closeout

- Record:
  - What changed in traffic, leads, qualified leads, wins, and stale queue
  - Which campaigns, pages, or keyword groups improved / declined
  - Which fixes or experiments should continue next week
  - Which data-quality issues remain open

## Monthly Cleanup

- Remove unused cards and panels that do not trigger a decision.
- Review metric definitions for drift or ambiguity.
- Review whether behavior taxonomy or event naming has drifted from `WEBSITE_BEHAVIOR_TRACKING_SCHEMA.md`.
- Review whether thresholds still reflect real operating risk or need recalibration.
- Archive outdated manual import files after confirming data is loaded.
- Confirm the cleaned keyword CSV and URL remap file still reflect the real site inventory.
- Review inactive keyword catalog rows and confirm deactivations are expected.
- Re-check connector credentials and source freshness thresholds.
