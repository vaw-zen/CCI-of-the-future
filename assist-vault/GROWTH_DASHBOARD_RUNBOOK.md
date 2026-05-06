# Growth Dashboard Launch Runbook

Date: 2026-05-06

## Before Launch

1. Apply the new SQL for growth reporting tables and RLS.
2. Run the daily snapshot sync once manually for GA4 and Search Console.
3. Import at least one paid/social CSV if paid or social reporting is expected this week.
4. Freeze the metric-definition sheet and share it with growth owner, admin ops, and engineering.
5. Complete 10 manual reconciliations:
   - 4 dashboard cards vs Supabase SQL
   - 3 acquisition totals vs GA4 / Search Console / manual import
   - 2 landing-page rows vs source tools
   - 1 stale queue count vs admin lead list
6. Run `npm run analytics:validate`, `npm run test:dashboard`, and `npm run build`.

## Week 1 Stabilization

- Daily 15-minute review at 09:00 Africa/Tunis.
- Checklist:
  - Confirm data-health badges are green or explain any stale/missing state.
  - Compare yesterday’s GA4 and Search Console snapshots to source tools.
  - Check stale queue count and oldest lead age.
  - Note attribution anomalies such as spikes in direct / (none).
  - Capture any KPI mismatches in a short engineering follow-up list.

## Weekly Monday Review

- Order of review:
  - Data health first
  - Acquisition changes second
  - Top landing pages and campaigns third
  - Stale queue and throughput fourth
  - Next-week action list last
- Required output:
  - 3 KPIs that moved
  - 3 suspected causes
  - 3 actions with owners and due dates

## Weekly Friday Closeout

- Record:
  - What changed in traffic, leads, qualified leads, wins, and stale queue
  - Which campaigns or pages improved / declined
  - Which fixes or experiments should continue next week
  - Which data-quality issues remain open

## Monthly Cleanup

- Remove unused cards and panels that do not trigger a decision.
- Review metric definitions for drift or ambiguity.
- Archive outdated manual import files after confirming data is loaded.
- Re-check connector credentials and source freshness thresholds.
