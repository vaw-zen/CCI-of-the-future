# Growth Dashboard Stage 3 Sprint Selection Workflow

Date: 2026-05-12

This workflow operationalizes Stage 3 stabilization. It makes the Stage 3 panels the required input for SEO refresh selection and CRO sprint planning without changing the roadmap order or pulling Stage 4 work forward.

## Goal

Use Stage 3 evidence to choose:

- 1 primary SEO refresh candidate each week
- 1 primary CRO sprint candidate each week
- up to 2 secondary candidates for backlog

## Mandatory Inputs

Do not select work unless all relevant panels were reviewed:

| Work type | Required panels |
| --- | --- |
| SEO refresh | `seoQueries`, `contentOpportunities`, `Organic search evidence`, `landingPageScorecard` |
| CRO sprint | `landingPageScorecard`, `funnelDiagnostics`, `Executive summary`, `Attribution review leads`, `ctaPerformance`, `formHealth`, and `contactIntent` when those panels are populated in the active environment |
| Mixed SEO + CRO | All of the above |

## Decision Rules

### SEO refresh candidate

A page can be selected only if:

1. Attribution trust is not `not decision-safe`.
2. The page appears in at least one of:
   - `seoQueries.opportunities`
   - `contentOpportunities.rows`
   - `landingPageScorecard.rows`
3. The page has a plausible improvement path:
   - CTR issue
   - ranking-window issue
   - query/page mismatch
   - decay issue
   - conversion gap with real search demand

Choose the primary SEO refresh by this priority order:

1. High non-branded query demand with clear CTR or rank upside
2. Existing traffic with weak lead quality or lead-rate conversion
3. Clear decay or cannibalization risk on commercially relevant pages

### CRO sprint candidate

A page or segment can be selected only if:

1. Attribution trust is not `not decision-safe`.
2. The issue appears in `landingPageScorecard` or `funnelDiagnostics`.
3. The issue is also visible in `ctaPerformance`, `formHealth`, or `contactIntent` when those panels are populated in the active environment.
4. The problem is specific enough to turn into a hypothesis next week.

Choose the primary CRO sprint by this priority order:

1. High-traffic page with weak qualified-lead conversion
2. Large drop-off segment in `funnelDiagnostics`
3. Executive summary page opportunity supported by scorecard evidence

## Required Selection Record

For every candidate, record:

| Field | Requirement |
| --- | --- |
| Candidate type | `SEO`, `CRO`, or `Mixed` |
| Segment | Exact dashboard segment |
| Page or cluster | URL, landing page, or query cluster |
| Evidence panels | Exact Stage 3 panels used |
| Core metrics | 2-4 metrics only |
| Why now | One sentence |
| Expected outcome | One measurable result |
| Owner | Growth owner or Engineering |
| Next step | `refresh`, `test`, `investigate`, or `defer` |

## Tie-Breakers

If two candidates look equally strong, choose in this order:

1. Higher qualified-lead density
2. Stronger non-branded demand
3. Cleaner attribution state
4. Lower execution complexity
5. Higher reuse across multiple services or pages

## Deferral Rules

Defer the candidate if any of these are true:

- attribution trust is `not decision-safe`
- the page is in `Query gap` and the decision depends on page-level evidence
- traffic is too thin to be decision-safe this week
- the segment is stale because source freshness is missing
- the behavior panels are populated but the CRO candidate has no supporting behavior evidence
- the issue is operational follow-up quality, not page or acquisition quality

## Weekly Output Format

Produce this summary every week:

### SEO selection

- Primary candidate:
- Segment:
- Evidence:
- Why now:
- Expected outcome:

### CRO selection

- Primary candidate:
- Segment:
- Evidence:
- Why now:
- Expected outcome:

### Secondary backlog

- Candidate 1:
- Candidate 2:

### Deferred this week

- Deferred candidate:
- Reason:

## Stage 3 Stabilization Guardrail

This workflow supports Stage 3 stabilization, not Stage 4 experimentation yet.

- Use this to choose work.
- Treat behavior evidence as mandatory for CRO selection whenever the panels are populated in the active environment.
- Do not create a formal experiment registry requirement until Stage 4 starts.
- Do not add alerts or anomaly routing on top of unstable heuristics yet.
- Keep tuning decay, CTR, cannibalization, and drop-off thresholds through the next two review cycles.
- If any behavior panel is empty during a closeout review, record whether the cause is migration drift, mart staleness, or low traffic rather than silently skipping the evidence.
