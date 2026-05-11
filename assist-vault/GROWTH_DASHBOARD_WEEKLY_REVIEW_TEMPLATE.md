# Growth Dashboard Weekly Review Template

Date: 2026-05-10

Use this template to operationalize Stage 2 and Stage 3 in the weekly growth review. The goal is to force every decision to reference a dashboard segment and a concrete evidence panel, not a generic top-line observation.

## Preconditions

Complete these checks before the meeting starts:

1. Run `npm run growth:audit:attribution -- --days 7`.
2. Confirm dashboard `dataHealth` is not missing a required source.
3. Confirm the selected review period is explicitly stated.
4. Confirm the review starts from a defined segment, not `all traffic` by default unless that is intentional.

## Required Segment Header

Capture this at the top of every review note:

- Review window:
- Primary segment:
- Comparison segment:
- Attribution trust state: `trusted`, `trusted with caveats`, or `not decision-safe`
- Growth owner:
- Admin ops reviewer:

## Review Order

Follow this order every week:

1. `Executive summary`
2. `Data health`
3. `Attribution review leads`
4. `Organic search evidence`
5. `SEO query intelligence`
6. `Content opportunities`
7. `Landing-page scorecard`
8. `Funnel diagnostics`
9. `CTA performance` once `growth_behavior_daily_metrics` is live
10. `Form health` once `growth_behavior_daily_metrics` is live
11. `Contact intent` once `growth_behavior_daily_metrics` is live
12. `Acquisition sources / campaigns`
13. `Operations / stale queue / SLA`
14. `Actions and sprint candidates`

## Evidence Capture

Every action must include all fields below:

| Field | Requirement |
| --- | --- |
| Segment | Must reference one of `businessLine`, `service`, `sourceClass`, `device`, or `pageType` |
| Evidence panel | Must name the exact dashboard block used |
| Metric movement | Must describe what changed |
| Suspected cause | Must be a falsifiable explanation |
| Owner | Must be assigned to Growth owner, Admin ops, or Engineering |
| Due date | Must be set |
| Decision type | Must be `observe`, `fix`, `refresh`, `experiment`, or `defer` |

## Mandatory Review Questions

Answer these every week:

### Executive summary

- Does the current `trend` match the segment we actually care about this week?
- Is the `risk` decision-safe or only directional?
- Does the `nextAction` still reflect the best use of the next sprint?

### Organic search evidence

- Do GA4 sessions, users, and events support the same narrative as GSC clicks and impressions?
- Are any lead pages in `Query gap` or `Check pages` status?
- If yes, should the decision be blocked until page evidence is reconciled?

### SEO query intelligence

- Which non-branded queries have the strongest click, CTR, or position upside?
- Which clusters are underperforming relative to impressions?
- Are there multi-page or cannibalization signals that change page ownership?

### Content opportunities

- Which rows reflect CTR upside vs decay vs conversion gap?
- Which opportunities are immediately actionable this week?
- Which are only watchlist items?

### Landing-page scorecard

- Which page has the highest leverage right now?
- Is the bottleneck traffic, conversion, or lead quality?
- Does the page belong in SEO refresh, CRO sprint, or both?

### Funnel diagnostics

- Which segment has the worst drop-off?
- Is the issue acquisition intent, page experience, or follow-up quality?
- Is the drop-off large enough to justify sprint capacity this week?

### CTA performance

- Once the behavior mart is live, which `cta_id` and `cta_location` combinations have the weakest impression-to-click conversion?
- Is the issue low visibility, weak copy, poor placement, or weak audience intent?
- Which CTA problem should feed the next CRO sprint candidate?

### Form health

- Once the behavior mart is live, which form has the highest validation-failure or abandonment rate?
- Do failure hotspots cluster by field, form placement, or service intent?
- Is the friction strong enough to justify an engineering fix or a CRO change this week?

### Contact intent

- Once the behavior mart is live, which contact method is attracting intent on the highest-value pages?
- Are users preferring `form`, `phone`, `email`, or `whatsapp` in a way that should change CTA hierarchy?
- Does contact-intent behavior align with qualified lead outcomes or point to a follow-up mismatch?

## Required Outputs

Leave the meeting with:

1. 3 KPI movements worth attention
2. 3 likely causes
3. 3 actions with owners and due dates
4. 1 SEO refresh candidate
5. 1 CRO sprint candidate
6. 1 issue explicitly deferred with a reason

## Action Log Template

Use this flat structure:

| Action | Segment | Evidence panel | Why now | Owner | Due date | Decision type |
| --- | --- | --- | --- | --- | --- | --- |
| Example: Refresh `/salon` title + CTA hierarchy | `B2C · Salon · Organic search · Service page` | `Organic search evidence` + `Landing-page scorecard` | GA4 sessions exist, GSC clicks exist, qualified lead density is below expected | Growth owner | 2026-05-16 | `refresh` |

## Exit Criteria For A Good Review

The review is complete only if:

- every action references a segment
- every action references a dashboard panel
- attribution trust is explicitly recorded
- at least one Stage 3 panel affected the week’s prioritization
- once the behavior mart is live, at least one CRO action references `CTA performance`, `Form health`, or `Contact intent`
- no action is phrased as a generic “monitor performance”
