# Growth Dashboard Organic Search Report

Date: 2026-06-02

## Scope

- Review source: `/admin/dashboard` evidence model
- Command used:
  - `npm run growth:review:organic -- --from 2026-05-05 --to 2026-06-01`
- Review window:
  - current: `2026-05-05` to `2026-06-01`
  - comparison: `2026-04-07` to `2026-05-04`
- Primary segment:
  - `sourceClass=organic_search`

## Executive Summary

- Overall organic status:
  - `constrained`
- Trust state:
  - `trusted with caveats`
- Main takeaway:
  - Organic demand exists, but cannibalization and page-target clarity are constraining capture.

Top-line movement:

| KPI | Current | Previous | Read |
| --- | --- | --- | --- |
| Organic clicks | `186` | `0` | New versus zero baseline |
| Organic impressions | `4,458` | `0` | New versus zero baseline |
| Organic sessions | `173` | `5` | `+3360%` |
| Qualified organic demand | `0` | `0` | Flat |

Trust caveat:

- SERP keyword snapshots are stale or missing, so device-specific ranking reads remain directional only.

Important interpretation note:

- The prior-period click and impression baseline is effectively zero in the persisted comparison set, so growth direction is visible, but period-over-period SEO lift should not be over-interpreted until historical comparison coverage is normalized.

## Strong Points

### Strong pages

| Page | Strength type | Evidence |
| --- | --- | --- |
| `/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure` | Traffic strength | `38` clicks, `38` sessions |
| `/conseils/nettoyage-voiture-interieur-tunis-2025` | Traffic strength | `30` clicks, `17` sessions |

### Strong segments

| Segment | Strength type | Evidence |
| --- | --- | --- |
| `B2C` | Traffic strength | `136` clicks |
| `Article` | Traffic strength | `107` clicks |
| `Tapis / moquettes` | Traffic strength | `61` clicks |

What this means:

- Organic visibility is no longer hypothetical. The site is already winning meaningful article-led and service-adjacent traffic.
- B2C and article content are currently carrying the largest share of organic volume.
- The carpet/moquette service family is the clearest existing commercial SEO cluster.

## Weak Points

### 1. Cannibalization is large enough to limit capture

- `62` non-branded queries currently map to more than one landing page.
- Evidence:
  - `seoQueries.summary`
- Why this matters:
  - authority is split
  - page ownership is unclear
  - internal-linking and content refresh work becomes less efficient

### 2. Organic traffic is not yet producing qualified demand

- `173` sessions and `186` clicks produced `0` qualified organic leads.
- Evidence:
  - `seoContent.totals`
- Why this matters:
  - more traffic would likely mask a conversion or qualification problem instead of fixing it

### 3. Form completion is not yet proven

- `14` form starts with `0` submit successes in the selected period.
- Evidence:
  - `formHealth.summary`
- Why this matters:
  - the bottleneck may be form friction or intent mismatch, not reach alone

### 4. Article traffic is outrunning commercial conversion

- The `Article` page type produced `107` clicks and `0` qualified leads.
- Evidence:
  - `pageType` segment
- Why this matters:
  - content is attracting demand, but the path from article to service intent is weak

### 5. SERP trust is incomplete

- SERP snapshots are stale or missing.
- Evidence:
  - `dataHealth`
- Why this matters:
  - ranking-window, desktop/mobile, and snippet-priority decisions cannot yet be treated as fully decision-safe

## Opportunities

### Primary mixed SEO + CRO opportunities

| Page | Route | KPI to move | Why now |
| --- | --- | --- | --- |
| `/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure` | `Mixed SEO + CRO` | Qualified organic leads | `38` clicks and `38` sessions already exist, but the page is not converting into qualified demand |
| `/conseils/nettoyage-voiture-interieur-tunis-2025` | `Mixed SEO + CRO` | Qualified organic leads | `30` clicks and `17` sessions already exist, but the page is not converting into qualified demand |

### Secondary SEO improvement room

| Target | Current evidence | Best interpretation |
| --- | --- | --- |
| `/marbre` | `30` clicks, `19` sessions | Service page has existing demand but is not yet a top-ranked action candidate |
| `/conseils/prix-nettoyage-tapis-tunis-tarifs-2025` | `22` clicks, `20` sessions | Pricing-intent article has usable traffic and likely needs stronger transactional routing |
| `tapissier tunis` | `42` impressions, `9.5%` CTR | Query exists; page-target ownership and commercial routing need tightening |
| `lavage interieur voiture` | `55` impressions, `3.6%` CTR | Query has visibility but weak click capture and unclear commercial path |

## Paid Campaign Decision

- Decision:
  - `not needed yet`
- Exact reason:
  - Paid should stay blocked because organic trust is not fully clean, form completion is not yet proven, organic traffic is not yet proving qualified demand, and the current bottleneck still looks like mixed SEO + CRO rather than reach alone.

## 30-Day Action Board

| Action | Segment | Evidence panel | Owner | KPI to move | Route | Why now |
| --- | --- | --- | --- | --- | --- | --- |
| Trust and alignment check | All organic | `dataHealth` + `executiveSummary.organicEvidence` | Growth owner | Decision-safe review state | Operational | SERP keyword visibility is not fresh enough for full ranking confidence |
| CRO handoff on `/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure` | B2C · Organic · Article | `landingPageScorecard.rows` | Growth owner | Qualified organic leads | Mixed | The page already has enough traffic to justify conversion-path fixes first |
| CRO handoff on `/conseils/nettoyage-voiture-interieur-tunis-2025` | B2C · Organic · Article | `landingPageScorecard.rows` | Growth owner | Qualified organic leads | Mixed | The page already has enough traffic to justify conversion-path fixes first |
| Keep paid blocked | All organic | Paid decision gate | Growth owner | Qualified organic leads | Governance | CRO and trust blockers are still unresolved |

## Conclusion

The current organic picture is not weak on visibility. It is weak on capture efficiency, page ownership clarity, and commercial conversion. The next month should not focus on buying more traffic. It should focus on:

1. clearing cannibalization and page-target ambiguity
2. improving article-to-service conversion paths on the two top pages
3. strengthening service-page support for `/marbre`, `/tapis`, and `/tapisserie`
4. restoring full trust in SERP comparison evidence

Only after those are in place should paid demand-generation be reconsidered.
