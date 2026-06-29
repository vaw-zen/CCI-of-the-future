# Growth Dashboard Organic Search Review Playbook

Date: 2026-06-01

## Purpose

Use this playbook to run a repeatable dashboard-first organic search and SEO review from the existing `/admin/dashboard` contract.

The review must answer five questions every cycle:

1. How are we doing in organic search right now?
2. What are the strongest pages, queries, and segments?
3. What are the weakest areas or risks?
4. Where are the clearest improvement opportunities?
5. Is paid marketing justified yet, or would it hide an SEO, CRO, or attribution problem?

This is an operating workflow, not a new reporting surface and not a new scoring model.

## Default Review Setup

Use these defaults unless the review explicitly states otherwise:

- Review window: last 28 complete days vs the prior 28 complete days
- Live runner:
  - `npm run growth:review:organic`
- Primary filter set:
  - `sourceClass=organic_search`
  - `businessLine=all`
  - `service=all`
  - `pageType=all`
  - `device=all`
- Dashboard contract:
  - `GET /api/admin/dashboard?from&to&businessLine&service&sourceClass&device&pageType`

Important repo semantics:

- query intelligence is currently cross-device
- device-specific SEO analysis belongs to SERP ranking snapshots
- `landingPageScorecard` is directional prioritization, not forecasting
- behavior panels should block bad SEO conclusions when the real issue is CRO

Current seasonal commercial focus:

- `tapis / moquette / carpet cleaning`
- `salon / canape / sofa cleaning`
- `tapisserie / retapissage / rembourrage`

During this season, review should prioritize those families before marble or broader informational expansion.

## Trust Hierarchy

Use the current dashboard trust order and record the trust state before any recommendation:

1. `dataHealth`
2. `seoQueries`
3. `landingPageScorecard`
4. `contentOpportunities`
5. `seoContent`
6. `ctaPerformance`, `formHealth`, `contactIntent` when conversion quality is relevant

Trust states:

- `trusted`
- `trusted with caveats`
- `not decision-safe`

Do not make strong SEO or paid recommendations if Search Console freshness, SERP freshness, or attribution trust is not decision-safe.

## Review Flow

Run the review in this order every time.

### 1. Trust check

Start with:

- `dataHealth`
- attribution trust state from the weekly attribution workflow
- any `Query gap` or `Check pages` signals in `executiveSummary.organicEvidence`

Decision rules:

- `trusted`: all required SEO sources are fresh enough and attribution is usable
- `trusted with caveats`: the review can continue, but conclusions must be downgraded
- `not decision-safe`: block paid decisions and major SEO commitments

### 2. Top-line organic performance

Read:

- `seoContent.totals`
- `executiveSummary.organicEvidence`
- `seoQueries.summary`

Answer:

- are organic clicks, impressions, CTR, sessions, and qualified demand up or down?
- is growth quality improving, not only volume?
- do GSC and GA4 tell the same story, or is there a page/query alignment caveat?

### 3. Segment diagnosis

Repeat the top-line read in this order:

1. all organic
2. `businessLine`
3. `service`
4. `pageType`

Only drill deeper when the prior layer shows a meaningful gain, loss, or mismatch.

Use segmentation to answer:

- is the issue global or concentrated?
- which service or page type explains the biggest share of upside or drag?

### 4. Strong points

Pull winners from:

- `landingPageScorecard.rows`
- `seoQueries.opportunities` when the target page is already winning
- `seoContent.landingPages`

Classify every strength as one of:

- traffic strength
- CTR strength
- ranking strength
- qualified-demand strength
- mixed SEO + CRO strength

Only keep strengths that are decision-relevant, not vanity movement.

During the current season, explicitly call out whether a strength belongs to:

- `tapis / moquette`
- `salon / canape`
- `tapisserie / retapissage`

### 5. Weak points

Pull losses and risks from:

- `contentOpportunities.rows`
- `seoQueries.summary`
- `seoContent.keywordPerformance`
- `executiveSummary.risk`

Classify every weakness as one of:

- low visibility
- weak CTR
- ranking window loss
- decay risk
- cannibalization
- query-page mismatch
- conversion gap

If the weakness is actually on-page funnel friction, route it to CRO instead of treating it as pure SEO.

### 6. Opportunities

Prioritize only decision-safe opportunities:

- non-branded query upside
- high-impression low-CTR pages
- pages with traffic but weak qualified demand
- pages with clear query/page mismatch
- service pages with local-intent upside in Tunis or Tunisia

Route each opportunity to one of:

- `SEO-only`
- `CRO-only`
- `Mixed SEO + CRO`

During the current season, opportunity ranking should prefer:

1. proven tapis / moquette traffic with weak conversion proof
2. proven upholstery / retapissage traffic with weak conversion proof
3. sofa-cleaning demand with route-to-service ambiguity
4. secondary SEO room only after the core seasonal owners are stable

### 7. Paid campaign decision gate

The paid section is a gate, not a campaign plan.

Recommend paid only if all of these are true:

- attribution is trusted
- landing-page, CTA, and form-health signals are not broken
- follow-up quality is acceptable
- there is proven commercial demand
- SEO ranking or coverage is still a real bottleneck
- at least one upholstery path and one tapis/moquette path already prove lead capture or WhatsApp-assisted demand

Block paid if the issue is really:

- poor form completion
- weak CTA performance
- attribution unreliability
- weak lead quality or follow-up operations
- thin-volume SEO evidence
- under-optimized organic pages with cheaper SEO wins still available

If paid is eventually allowed, the first seasonal pilot should default to:

1. `tapis / moquette`
2. `tapisserie / retapissage`
3. `salon / canape`

Paid decision states:

- `not needed yet`
- `test later`
- `launch pilot`

## Standard Output Format

Every review should end with these sections.

### Executive summary

Capture:

- overall organic status
- trust state
- main takeaway

### Strong points

Capture:

- top queries, pages, and segments that are clearly working
- why they are working
- which KPI proves it

### Weak points

Capture:

- biggest SEO risks and drag points
- why they matter now
- whether they are SEO-first or CRO-first

### Opportunities

Capture:

- ranked action list
- owner
- KPI expected to move
- route: SEO-only, CRO-only, or Mixed

### Improvement room

Capture:

- areas that are under-optimized but still fixable in the next 30 days
- do not include vague “monitor” items

### Paid campaign decision

Capture:

- `not needed yet`, `test later`, or `launch pilot`
- exact reason
- blocking condition if the answer is not yet

### 30-day action board

Keep this to the top 3-5 actions only.

Use:

| Action | Segment | Evidence panel | Owner | KPI to move | Route | Why now |
| --- | --- | --- | --- | --- | --- | --- |

## Action Classification Rules

Use these action labels only:

- title/meta rewrite
- content expansion/refresh
- internal-linking fix
- cannibalization cleanup
- target-page clarification
- local SEO reinforcement
- technical SEO correction
- CRO handoff
- mixed SEO + CRO fix

Do not recommend more traffic when the review evidence says the page is not conversion-ready.

## Review Scenarios To Handle Correctly

The review is only complete if it handles these cases correctly:

1. Healthy organic growth
   - winners are named
   - scaling actions are clear
2. Traffic up, qualified demand flat
   - route to mixed SEO + CRO
3. High impressions, weak CTR
   - call for snippet/title/meta work
4. Traffic down on a formerly strong page
   - classify as decay risk
5. Multiple pages compete for the same intent
   - call cannibalization and select one primary target page
6. Organic evidence is stale
   - downgrade trust
7. Thin-volume segment
   - mark findings as directional only
8. Paid campaign temptation
   - block paid when CRO or attribution is the real issue
9. Paid campaign justified
   - recommend a pilot only when demand and landing-path quality are both proven

## How This Fits Existing Artifacts

Use this playbook together with:

- `assist-vault/GROWTH_DASHBOARD_WEEKLY_REVIEW_TEMPLATE.md`
- `assist-vault/GROWTH_DASHBOARD_STAGE3_SPRINT_SELECTION_WORKFLOW.md`
- `assist-vault/GROWTH_DASHBOARD_SEO_AUDIT_MASTER_PROMPT.md`

Practical usage:

- use this playbook to run the organic review in the weekly meeting
- use the sprint-selection workflow to turn review findings into one SEO refresh candidate and one CRO candidate
- use the SEO audit master prompt when you want an AI-assisted write-up grounded in the same dashboard evidence model
