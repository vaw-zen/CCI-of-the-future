# Growth Dashboard Organic Search Improvement Plan

Date: 2026-06-02

## Goal

Use the live organic review from `2026-05-05` to `2026-06-01` to improve the current weak points before considering paid acquisition.

Primary objective:

- convert existing organic demand into qualified demand

Secondary objective:

- strengthen page ownership and service-page capture so existing visibility becomes more commercially useful

## Current Priorities

Order of execution:

1. restore trust for ranking and page-target decisions
2. fix mixed SEO + CRO bottlenecks on the two strongest organic pages
3. reduce cannibalization across non-branded service intent
4. upgrade the secondary SEO room on `/marbre`, the tapis pricing article, and the tapisserie / voiture-intent queries
5. keep paid blocked until the funnel is healthier

## Workstream 1 — Trust And Measurement Cleanup

### Objective

Make the organic review fully decision-safe for ranking and page-priority choices.

### Actions

1. Refresh SERP keyword snapshots for all tracked SEO families.
2. Verify why the comparison window still shows `0` clicks and `0` impressions in the prior period.
3. Confirm the next weekly review uses the same explicit date windows, not the UTC default fallback.
4. Record whether the missing optional lead attribution fields in the live environment are still expected or now drift.

### Owner

- Engineering + Growth owner

### KPI

- `dataHealth.serp_keyword_rankings = fresh`
- prior-period SEO comparison no longer collapses to zero without explanation

### Definition of done

- the next organic review can use ranking-window language without the current trust caveat

## Workstream 2 — Mixed SEO + CRO Fixes On The Top Two Pages

## 2A. `/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure`

### Problem

- strong traffic
- no qualified organic leads
- likely article-to-service leakage

### Plan

1. Make the primary commercial outcome explicit above the fold.
2. Add a stronger direct path from the article to `/tapisserie` and `/devis`.
3. Move at least one quote CTA higher on the page.
4. Add a Tunis-specific trust block:
   - zone served
   - use cases
   - short proof or service confidence copy
5. Review the article intent:
   - keep the article informational
   - but stop making users search for the service route manually

### Expected KPI movement

- `contactIntent`
- `ctaPerformance.clicks`
- `formHealth.submitSuccesses`
- qualified organic leads from this page

### Route

- `Mixed SEO + CRO`

## 2B. `/conseils/nettoyage-voiture-interieur-tunis-2025`

### Problem

- meaningful traffic
- no qualified demand
- commercial fit may be weaker or less explicit than the tapisserie/tapis families

### Plan

1. Confirm whether this topic is a true lead-generation target or mainly a topical authority asset.
2. If it is a lead target:
   - strengthen the CTA hierarchy
   - connect it to the right request path
   - make the commercial service promise clearer
3. If it is not a core lead target:
   - treat it as awareness/supporting content
   - use stronger internal links to the nearest real commercial services
   - stop evaluating it only on direct qualified leads
4. Improve SERP click capture for the supporting query family before creating more similar pages.

### Expected KPI movement

- either:
  - qualified organic leads
- or:
  - stronger internal click-through into a commercial service path

### Route

- `Mixed SEO + CRO`

## Workstream 3 — Cannibalization Cleanup

### Problem

- `62` non-branded queries currently map to more than one landing page

### Objective

Choose one primary page per commercial intent family and make the supporting pages reinforce, not compete.

### Priority clusters

1. `tapis / moquette` family
   - primary service target should remain `/tapis`
2. `marbre` family
   - primary service target should remain `/marbre`
3. `tapisserie / retapissage` family
   - primary service target should remain `/tapisserie`
4. `pricing` family
   - transactional price-intent should likely stay anchored to `/conseils/prix-nettoyage-tapis-tunis-tarifs-2025`
   - but must route strongly into `/tapis` and `/devis`

### Actions

1. Export the current cannibalized query set from `seoQueries`.
2. Tag each query to one primary target page.
3. Update internal links so supporting articles link into the primary target.
4. Reduce overlapping H1/title/intro copy between competing pages.
5. Review CTA destination consistency across the affected cluster.

### KPI

- lower `cannibalizedQueryCount`
- more non-branded clicks concentrated on the chosen primary page

### Route

- `SEO-only` for page ownership
- `Mixed` when conversion routing also needs work

## Workstream 4 — Secondary SEO Improvement Room

## 4A. `/marbre`

### Why it matters

- the page already has real traffic
- the marbre family in the keyword inventory is commercially meaningful

### Plan

1. Tighten the page around the highest-value commercial variants:
   - restauration marbre tunis
   - traitement marbre tunisie
   - nettoyage marbre tunis
2. Strengthen local intent sections:
   - Tunis
   - Ariana
   - La Marsa when relevant
3. Add internal links from marbre articles back into `/marbre`.
4. Review title, description, and service promise for higher commercial clarity.
5. Use FAQ/supporting proof to strengthen conversion readiness before pushing more traffic.

### KPI

- non-branded clicks to `/marbre`
- CTR on marbre family terms
- qualified organic leads from `/marbre`

### Route

- `SEO-only` first, then `Mixed` if traffic rises without conversion

## 4B. `/conseils/prix-nettoyage-tapis-tunis-tarifs-2025`

### Why it matters

- it already gets organic traffic
- price-intent is usually commercially strong

### Plan

1. Treat it as the primary pricing-intent asset, not a generic blog post.
2. Make the page more transactional:
   - pricing framework
   - quote CTA
   - clear route to `/tapis`
   - local trust signals
3. Align titles/meta for:
   - `prix nettoyage tapis tunis`
   - `tarif nettoyage tapis`
4. Add stronger internal links from service and related articles.
5. Measure whether pricing-intent traffic produces better contact intent than generic article traffic.

### KPI

- CTR
- clicks on pricing queries
- contact intent and form starts from this page

### Route

- `Mixed SEO + CRO`

## 4C. Query: `tapissier tunis`

### Current read

- visibility exists
- page ownership needs to be explicit

### Plan

1. Make `/tapisserie` the primary target page unless live query evidence proves otherwise.
2. Align title/H1/hero copy on `/tapisserie` with Tunis local intent and sur-mesure positioning.
3. Add internal links from:
   - `/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure`
   - related tapisserie articles
4. Review whether article pages are competing with the service page for the same term.

### KPI

- impressions and clicks for `tapissier tunis`
- stronger click concentration to `/tapisserie`

### Route

- `SEO-only`

## 4D. Query: `lavage interieur voiture`

### Current read

- visibility exists
- CTR is weak
- commercial path is still ambiguous

### Plan

1. Confirm the intended target page:
   - likely `/conseils/nettoyage-voiture-interieur-tunis-2025`
2. Improve snippet CTR first:
   - title clarity
   - local cue
   - better intent match
3. Decide whether the page should:
   - push direct quote intent
   - or support nearby commercial services through internal links
4. Do not scale this topic cluster until its business role is explicit.

### KPI

- CTR on `lavage interieur voiture`
- internal click-through to a commercial page
- qualified demand only if this topic is confirmed commercial

### Route

- `SEO-only` first

## Paid Marketing Gate

Paid remains blocked until all of these are true:

1. SERP freshness is restored.
2. At least one of the two primary mixed pages produces real form success or direct qualified intent improvement.
3. Organic traffic-to-qualified-demand is no longer stuck at zero.
4. The first cannibalization cleanup wave has assigned primary targets to the main service families.

Paid can move from `not needed yet` to `test later` only after those four conditions are satisfied.

## 30-Day Sequence

### Week 1

- refresh SERP trust
- verify prior-period baseline integrity
- confirm business role of the voiture-intent article

### Week 2

- CRO pass on `/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure`
- CRO pass on `/conseils/nettoyage-voiture-interieur-tunis-2025`

### Week 3

- cannibalization mapping for `tapis`, `marbre`, `tapisserie`, and pricing clusters
- internal-link adjustments

### Week 4

- secondary SEO work on `/marbre`
- transactional tightening of the tapis pricing article
- `/tapisserie` ownership reinforcement for `tapissier tunis`

## Weekly Tracking

Use the weekly review template and sprint-selection workflow to record:

- trust state
- one primary SEO action
- one primary mixed SEO + CRO action
- one deferred item with reason
- whether paid remains blocked

## Success Criteria

This plan is working if, within the next review cycle, we see:

1. better trust on SEO ranking evidence
2. at least one increase in `ctaPerformance` or `formHealth` on the top two pages
3. fewer unresolved cannibalization cases in the primary service families
4. stronger commercial routing from article pages into service paths
5. a cleaner basis for deciding whether paid should stay blocked or move to `test later`
