# Growth Dashboard Attribution QA Checklist

Date: 2026-05-09

This checklist turns attribution QA into a named weekly pass/fail workflow. Use it before the weekly growth review whenever acquisition efficiency, landing-page performance, or campaign comparisons are being used for decisions.

## Owners

| Role | Responsibility |
| --- | --- |
| Engineering | Maintain capture logic, fallback normalization, audit script, and fix broken source or landing-page capture |
| Admin ops | Review recent problematic leads, correct obvious manual attribution issues, and flag repeat patterns |
| Growth owner | Decide whether acquisition efficiency is trusted enough for channel and landing-page prioritization |

## Command

Run the audit for the period you want to review:

```bash
npm run growth:audit:attribution -- --days 7
```

Use `--strict` when you want CI or a release checklist to fail on warning or critical status:

```bash
npm run growth:audit:attribution -- --days 7 --strict
```

## Pass / Warning / Critical Rules

| Status | Trigger | Meaning | Required action |
| --- | --- | --- | --- |
| `pass` | Unattributed rate below `25%` and no landing-path gaps or suspicious direct rows | Acquisition reporting is trusted for the weekly review | Keep monitoring |
| `warning` | Unattributed rate `>= 25%`, or missing landing page / entry path, or suspicious direct rows, or campaign naming drift | Growth review can proceed, but efficiency reads need caveats and follow-up | Review problematic rows and assign fixes before next review |
| `critical` | Unattributed rate `>= 40%` | Channel efficiency is not decision-safe | Escalate to Engineering + Growth owner immediately and avoid budget or channel ranking decisions until fixed |

## Weekly Review Steps

1. Run `npm run growth:audit:attribution -- --days 7`.
2. Record the overall status and unattributed rate in the weekly ops notes.
3. Review the `Recent problematic rows` section and group issues into:
   - suspicious `direct/(none)` with external referrer
   - missing `landing_page`
   - missing `entry_path`
   - campaign naming normalization drift
4. Check whether the issue is isolated or systemic:
   - isolated = a handful of leads or one campaign setup mistake
   - systemic = repeated rows across multiple days, pages, or forms
5. For suspicious `direct/(none)` rows:
   - inspect `referrer_host`
   - confirm whether the row should really be social, organic, referral, messaging, or email
   - if the pattern repeats, open an Engineering fix instead of manual cleanup only
6. For landing-page capture gaps:
   - verify `landing_page` and `entry_path` are present on new leads
   - compare one raw lead row to the actual page path used in the form journey
   - if gaps cluster on one form or CTA, treat it as a tracking defect
7. For campaign naming drift:
   - normalize variants into one canonical snake_case campaign name
   - fix the naming at the source (UTM builder, paid export, link generator, CRM note template)
8. Sample-check at least:
   - 1 direct / unattributed row
   - 1 social or paid row
   - 1 landing page used in the weekly growth review
9. Mark the weekly review as:
   - `trusted`
   - `trusted with caveats`
   - `not decision-safe`

## Required Weekly Output

- Current unattributed rate
- Count of suspicious direct rows
- Count of missing landing pages / entry paths
- Campaign naming variants found
- One owner and due date for every systemic issue
- Explicit statement on whether acquisition efficiency is trusted for the next growth review

## Escalation Rules

- Escalate to Engineering the same day if unattributed rate is `>= 40%`.
- Escalate to Engineering if the same landing-page capture gap appears on two or more days.
- Escalate to Growth owner if campaign naming drift makes channel or page comparisons ambiguous.
- Do not rank channels by CPL or CPA when attribution audit status is `critical`.
