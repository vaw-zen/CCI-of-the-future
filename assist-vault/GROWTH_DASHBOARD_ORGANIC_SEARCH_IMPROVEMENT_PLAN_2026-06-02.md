# Growth Dashboard Organic Search Improvement Plan

Date: 2026-06-02

## Goal

Use the live organic review from `2026-05-05` to `2026-06-01` to improve the current weak points before considering paid acquisition.

Primary objective:

- convert existing organic demand into qualified demand

Secondary objective:

- strengthen page ownership and service-page capture so existing visibility becomes more commercially useful

Seasonal commercial focus for this cycle:

- `tapis / moquette / carpet cleaning`
- `salon / canape / sofa cleaning`
- `tapisserie / retapissage / rembourrage`

`/contact` is the canonical B2C quote path for this cycle. WhatsApp is treated as a first-class conversion path and must be counted in the review when article or service demand is claimed from `/admin/whatsapp`.

Seasonal conversion proof should be read in this order:

1. claimed WhatsApp leads
2. WhatsApp clicks and unclaimed high-intent intents
3. phone intent
4. form starts and submit success
5. qualified leads

## Current Priorities

Order of execution:

1. restore trust for ranking and page-target decisions
2. fix mixed SEO + CRO bottlenecks on the two strongest organic pages
3. reduce cannibalization across non-branded service intent
4. tighten the seasonal cluster owners for `/tapis`, `/salon`, `/tapisserie`, and the tapis pricing article before expanding supporting content
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
2. Add a stronger direct path from the article to `/tapisserie` and `/contact`.
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
- claimed WhatsApp leads from this page
- phone intent from this page
- `formHealth.submitSuccesses`
- qualified organic leads from this page

### Route

- `Mixed SEO + CRO`

## 2B. `/conseils/nettoyage-voiture-interieur-tunis-2025`

### Problem

- meaningful traffic
- no qualified demand
- commercial fit may be weaker or less explicit than the tapis, moquette, and upholstery families

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
2. `salon / canape / sofa cleaning` family
   - primary service target should remain `/salon`
3. `tapisserie / retapissage` family
   - primary service target should remain `/tapisserie`
4. `pricing` family
   - transactional price-intent should likely stay anchored to `/conseils/prix-nettoyage-tapis-tunis-tarifs-2025`
   - but must route strongly into `/tapis` and `/contact`

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

## 4A. `/conseils/prix-nettoyage-tapis-tunis-tarifs-2025`

### Why it matters

- it already gets organic traffic
- price-intent is commercially strong in the current season
- it should carry moquette and tapis tariff intent without forcing users to search again for the service path

### Plan

1. Treat it as the primary tariff-intent asset for the tapis and moquette family, not a generic article.
2. Make the commercial route explicit inside the current layout:
   - pricing framework
   - quote CTA
   - clear route to `/tapis`
   - clear route to `/contact`
3. Add stronger internal links from related tapis and moquette articles.
4. Review title, description, and service promise for higher local-commercial clarity.
5. Make moquette a first-class use case in the copy instead of a secondary mention.

### KPI

- CTR on pricing queries
- WhatsApp clicks and contact intent from this page
- phone intent from this page
- quote starts and attributable leads from this page

### Route

- `SEO-only` first, then `Mixed` if traffic rises without conversion

## 4B. `/salon`

### Why it matters

- sofa and salon cleaning stay one of the clearest seasonal commercial use cases
- the service page should own the family instead of leaving demand stranded in supporting pages

### Plan

1. Preserve the current layout and tighten the commercial hierarchy:
   - cleaner service promise
   - stronger quote / WhatsApp emphasis
   - clearer local trust copy
2. Review internal links from sofa- and salon-related articles so they reinforce `/salon`.
3. Use weekly review to judge it on contact intent and WhatsApp-assisted demand, not just direct qualified leads.

### KPI

- contact intent
- WhatsApp clicks
- phone intent
- quote starts
- attributable leads from the salon family

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

## 4D. Secondary room: `lavage interieur voiture`

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
2. Stage 3 is mechanically validated on `/contact` and `/entreprises`.
3. At least one upholstery path and one tapis/moquette path produce real lead capture, WhatsApp-assisted demand proof, or phone-assisted demand proof.
4. The first cannibalization cleanup wave has assigned primary targets to the main seasonal service families.

Paid can move from `not needed yet` to `test later` only after those four conditions are satisfied.

## 30-Day Sequence

### Week 1

- refresh SERP trust
- verify prior-period baseline integrity
- confirm business role of the voiture-intent article

### Week 2

- CRO and CTA-routing pass on `/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure`
- seasonal tightening of `/conseils/prix-nettoyage-tapis-tunis-tarifs-2025`
- confirm `/salon` remains the owner page for sofa demand

### Week 3

- cannibalization mapping for `tapis`, `salon`, `tapisserie`, and pricing clusters
- internal-link adjustments
- weekly WhatsApp claiming review for seasonal pages

### Week 4

- `/tapis` moquette emphasis and routing cleanup
- `/tapisserie` ownership reinforcement for `tapissier tunis`
- secondary SEO work on non-core pages only after the seasonal owner pages are stable

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
3. fewer unresolved cannibalization cases in the primary seasonal service families
4. stronger commercial routing from seasonal articles into `/tapis`, `/salon`, `/tapisserie`, and `/contact`
5. a cleaner basis for deciding whether paid should stay blocked or move to a small seasonal pilot
