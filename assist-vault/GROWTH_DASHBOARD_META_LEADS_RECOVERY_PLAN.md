# Growth Dashboard Meta Leads Recovery Plan

Date: 2026-05-21

This document rebuilds the Meta and Facebook leads plan from the current git working tree after the earlier network interruption. It is a repo-reality checkpoint, not a wish list.

## Working Tree Snapshot

- Branch at inspection time: `main`
- Latest committed baseline: `c777be4` (`Add SEO audit prompt tooling and improve service-page SEO`)
- Pending git entries: `38`
- Tracked modified files: `26`
- Untracked files or directories: `12`

## Reconstructed Scope

The Meta work in progress is the Stage 3 acquisition extension already referenced in the growth dashboard program:

- `S3-14`: website Meta identifier capture
- `S3-15`: Lead Ads intake, mappings, and conversion-event logging
- `S3-16`: dashboard cohorts and Meta data-health reporting
- `S3-17`: live validation and operational signoff

The implementation keeps Meta inside the existing growth system. It does not introduce a second dashboard or CRM.

## What Is Implemented In Code

### 1. Website Meta attribution capture

Implemented in local code:

- `src/utils/analyticsGateway.js`
- `src/libs/attributionHygiene.mjs`
- `src/libs/analyticsLifecycle.js`
- `src/app/api/devis/route.js`
- `src/app/api/conventions/route.js`

Current runtime intent:

- capture `fbclid`, `meta_fbc`, `meta_fbp`
- infer `meta_platform`
- persist `meta_campaign_id`, `meta_adset_id`, `meta_ad_id`
- mark website leads with `meta_lead_source=website`

Status: implemented locally, live validation still pending

### 2. Native Meta Lead Ads intake

Implemented in local code:

- `src/app/api/webhooks/meta/leadgen/route.js`
- `src/libs/metaLeadAds.mjs`
- `scripts/growth/import-meta-leads.mjs`

Current runtime intent:

- receive Lead Ads webhook payloads
- fetch full lead details when needed
- normalize into `meta_lead_ad_submissions`
- dedupe on `meta_leadgen_id`
- optionally auto-create `devis` or `convention` leads from mapped forms

Status: implemented locally, target DB validation and live intake validation pending

### 3. Meta Conversions API logging

Implemented in local code:

- `src/libs/metaConversions.mjs`
- `src/app/api/devis/route.js`
- `src/app/api/conventions/route.js`

Current runtime intent:

- build server-side `Lead` payloads
- hash user identity fields before send
- log send results into `meta_conversion_event_log`

Status: implemented locally, real send-path validation pending

### 4. Dashboard reporting and cohort separation

Implemented in local code:

- `src/libs/adminDashboardMetrics.mjs`
- `src/app/api/admin/dashboard/route.js`
- `src/app/admin/dashboard/page.jsx`

Current runtime intent:

- keep `acquisition.facebook` for content snapshot only
- expose `facebookReferral` for organic/social Meta traffic
- expose `metaAds` for paid website Meta traffic
- expose `metaLeadAds` for native Lead Ads intake
- expose `dataHealth.meta` warnings

Status: implemented locally, operator review still pending

### 5. Schema and reporting layer support

Implemented in local files:

- `supabase/20260520_meta_lead_integration.sql`
- `supabase/schema.sql`
- `supabase/conventions-schema.sql`

Current runtime intent:

- add Meta columns to `devis_requests` and `convention_requests`
- create `meta_lead_form_mappings`
- create `meta_lead_ad_submissions`
- create `meta_conversion_event_log`
- extend `growth_lead_reporting_dimensions`

Status: implemented in repo, not yet confirmed in target environment

### 6. Audit and regression coverage

Implemented in local files:

- `scripts/growth/audit-meta-attribution.mjs`
- `tests/meta-attribution.test.mjs`
- `tests/meta-lead-ads.test.mjs`
- `tests/meta-conversions.test.mjs`
- `tests/admin-dashboard-metrics.test.mjs`

Verified during reconstruction:

- `npm run test:dashboard` passed
- Result: `82/82`

Status: locally verified

## What Is Not Done Yet

These items still block a clean Stage 3 Meta closeout:

| ID | Item | Current read |
| --- | --- | --- |
| `M1` | Apply `supabase/20260520_meta_lead_integration.sql` in the target Supabase project | Not verified from git |
| `M2` | Confirm `meta_lead_ad_submissions`, `meta_lead_form_mappings`, and `meta_conversion_event_log` exist in the target DB | Not verified from git |
| `M3` | Populate real `meta_lead_form_mappings` rows for active Meta Lead Ads forms | Not verified from git |
| `M4` | Validate one real website Meta lead path keeps `fbclid`, `meta_fbc` or `meta_fbp`, and `meta_lead_source=website` | Open |
| `M5` | Validate one real Meta Lead Ads test submission reaches `meta_lead_ad_submissions` | Open |
| `M6` | Validate server-side CAPI sends create usable rows in `meta_conversion_event_log` | Open |
| `M7` | Run `npm run growth:audit:meta` against the target environment and record the result | Open |
| `M8` | Review dashboard cohort split with Growth owner: `facebookReferral` vs `metaAds` vs `metaLeadAds` | Open |

## Git Risk To Resolve Next

Important Meta implementation files are still untracked in git and should be protected soon:

- `scripts/growth/audit-meta-attribution.mjs`
- `scripts/growth/import-meta-leads.mjs`
- `src/app/api/webhooks/meta/leadgen/route.js`
- `src/libs/metaAttribution.mjs`
- `src/libs/metaConversions.mjs`
- `src/libs/metaLeadAds.mjs`
- `supabase/20260520_meta_lead_integration.sql`
- `tests/meta-attribution.test.mjs`
- `tests/meta-conversions.test.mjs`
- `tests/meta-lead-ads.test.mjs`

## Recovery Sequence

Use this order to resume the work safely:

1. Protect the local implementation in git by staging the Meta files and creating a checkpoint commit.
2. Apply `supabase/20260520_meta_lead_integration.sql` to the target environment.
3. Add or verify `meta_lead_form_mappings` rows for the currently active Meta forms.
4. Run `npm run growth:audit:meta`.
5. Submit one controlled website Meta lead and verify stored identifiers on the resulting lead row.
6. Submit one controlled Meta Lead Ads test and verify a row lands in `meta_lead_ad_submissions`.
7. Confirm `meta_conversion_event_log` receives a send result from a website lead submit.
8. Review `facebookReferral`, `metaAds`, `metaLeadAds`, and `dataHealth.meta` in `/admin/dashboard`.
9. Move `S3-17` from open to passed only after the live evidence is recorded.

## Completion Read

Current overall read:

- code implementation: mostly done locally
- tests: done locally
- documentation: mostly aligned
- git protection: incomplete
- target DB rollout: unverified
- live validation: not complete
- Stage 3 Meta closeout: not complete

## Resume Commands

Local verification commands:

```bash
npm run test:dashboard
npm run growth:audit:meta
```

Important live-validation targets:

- website lead submit through `/devis`
- website lead submit through `/entreprises`
- webhook/import path for `/api/webhooks/meta/leadgen`
- dashboard sections `acquisition.facebookReferral`, `acquisition.metaAds`, `acquisition.metaLeadAds`, and `dataHealth.meta`
