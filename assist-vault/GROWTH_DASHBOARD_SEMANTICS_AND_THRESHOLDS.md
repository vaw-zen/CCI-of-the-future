# Growth Dashboard Semantics And Thresholds

Date: 2026-05-09

This document is the Stage 0 semantic lock for the growth dashboard. It freezes the KPI glossary, taxonomy, thresholds, owner model, and stage gates that later roadmap work depends on.

## KPI glossary

| Current dashboard label | Canonical dashboard label | Payload key | Owner | Primary decision |
| --- | --- | --- | --- | --- |
| Nouveaux leads | New leads | `new_leads` | Growth owner | Are we generating enough new demand this period? |
| Qualifiés (activité) | Qualified activity | `qualified_activity` | Admin ops | Is the team moving leads through the pipeline this period? |
| Gagnés (activité) | Won activity | `won_activity` | Growth owner | Are leads converting into real wins this period? |
| Taux qualification cohorte | Cohort qualification rate | `qualified_rate` | Growth owner | Which acquisition periods produce qualified demand? |
| Taux gain cohorte | Cohort win rate | `win_rate` | Growth owner | Which acquisition periods create win-ready leads? |
| Leads non attribués | Unattributed lead rate | `unattributed_rate` | Engineering | Is attribution quality degrading? |
| Proxy CA estimé | Estimated pipeline value | `revenue_proxy` | Growth owner | Are we attracting higher-value demand? |
| CPL | Cost per lead | `cost_per_lead` | Growth owner | Which channels create leads efficiently? |
| CPA | Cost per acquisition | `cost_per_acquisition` | Growth owner | Which channels produce actual wins efficiently? |
| Landing pages suivies | Landing pages tracked | `landing_pages_tracked` | Growth owner | Is search and landing-page coverage broad enough to judge demand? |
| Clicks organiques | Organic clicks | `organic_clicks` | Growth owner | Which pages earn real organic demand? |
| Impressions organiques | Organic impressions | `organic_impressions` | Growth owner | Are SEO pages earning visibility? |
| CTR organique | Organic CTR | `organic_ctr` | Growth owner | Are snippets competitive in search? |
| Qualifiés | Qualified leads | `qualified_leads` | Growth owner | Which pages and channels attract commercially promising demand? |
| Keywords suivis | Tracked keywords | `tracked_keywords` | Growth owner | Are we tracking the keyword universe that matters? |
| Classés desktop | Desktop ranked keywords | `desktop_ranked_keywords` | Growth owner | Is desktop visibility rising or falling? |
| Classés mobile | Mobile ranked keywords | `mobile_ranked_keywords` | Growth owner | Is mobile visibility rising or falling? |
| Meilleure position moyenne | Average best position | `average_position` | Growth owner | Are tracked keywords moving upward overall? |
| Top 10 | Top 10 keywords | `top10_count` | Growth owner | Are more tracked keywords entering page one? |

## Taxonomy freeze

### Source class

| Canonical value | Meaning | Current mapping rule |
| --- | --- | --- |
| `organic_search` | Organic search traffic | `medium = organic` or `source in (google, bing)` |
| `paid_media` | Paid acquisition outside social-native buckets | `medium in (cpc, ppc, paid, display, affiliate)` or ad-source naming |
| `paid_social` | Paid social traffic | `medium = paid_social` |
| `organic_social` | Organic social traffic | `medium = social` or `source in (facebook, instagram, linkedin, tiktok)` |
| `referral` | Referral traffic | `medium = referral` |
| `messaging` | WhatsApp or other messaging traffic | `medium = messaging` or `source = whatsapp` |
| `email` | Email or newsletter traffic | `medium = email` or `source in (email, newsletter)` |
| `direct` | Direct or effectively unattributed traffic | direct / empty source with `(none)` or missing medium |
| `other` | Unclassified traffic | Anything that does not match the rules above |

### Page type

| Canonical value | Meaning | Current mapping rule |
| --- | --- | --- |
| `home` | Home page | `/` |
| `service` | Core service or commercial page | `/services`, `/entreprises`, `/salon`, `/tapis`, `/tapisserie`, `/marbre`, `/tfc` |
| `article` | Editorial article | `/conseils/...` |
| `contact` | Contact page | `/contact` |
| `quote` | Quote flow | `/devis` |
| `faq` | FAQ page | `/faq...` |
| `about` | About page | `/about...` |
| `newsletter` | Newsletter page | `/newsletter...` |
| `admin` | Internal admin page | `/admin...` |
| `other` | Any unclassified path | Fallback |

### Business line

| Canonical value | Meaning | Current mapping rule |
| --- | --- | --- |
| `b2c` | Consumer demand | `devis` flow |
| `b2b` | Business demand | `convention` flow |
| `unknown` | Fallback | Any future lead type not yet mapped |

### Lead quality taxonomy

These fields are the Stage 1 schema target and should be added before Stage 2 segmentation is treated as decision-ready.

| Field | Allowed values | Owner | Purpose |
| --- | --- | --- | --- |
| `lead_quality_outcome` | `unreviewed`, `sales_accepted`, `sales_rejected`, `won`, `lost` | Admin ops | Distinguish raw status from commercial quality |
| `lead_owner` | Team member or queue owner | Admin ops | Make stale queue accountability explicit |
| `follow_up_sla_at` | Timestamp | Admin ops | Measure whether follow-up SLA is met |
| `last_worked_at` | Timestamp | Admin ops | Separate genuinely stale leads from recently touched leads |

## Threshold lock

### Dashboard warning thresholds

| Threshold | Value | Meaning | Action |
| --- | --- | --- | --- |
| Unattributed lead rate warning | `25%` | Attribution quality is degrading | Review source/medium capture and recent direct leads this week |
| Unattributed lead rate critical | `40%` | Dashboard acquisition interpretation is at risk | Trigger engineering + growth triage immediately |
| Thin-volume CPL minimum | `5 leads` | CPL is not decision-safe below this volume | Show warning badge and avoid ranking channels by CPL alone |
| Thin-volume CPA minimum | `3 wins` | CPA is not decision-safe below this volume | Show warning badge and avoid budget decisions from CPA alone |
| Thin-volume lead-rate minimum (session-based) | `20 sessions` | Lead rate is unstable at low session volume | Show warning badge |
| Thin-volume lead-rate minimum (click-based) | `20 clicks` | Click-based fallback lead rate is unstable at low click volume | Show warning badge |
| Stale queue breach count | `5 open leads` | Queue is backing up | Review queue in daily ops |
| Stale queue critical age | `72h` | Oldest untouched lead is too old | Escalate with Admin ops lead owner |

### Source freshness thresholds

| Source | Stale after | Reason |
| --- | --- | --- |
| Supabase live | `1h` | Direct read layer should be available continuously |
| GA4 | `36h` | Daily snapshot ingestion buffer |
| Search Console | `72h` | Search Console latency plus import buffer |
| SERP rankings | `48h` | Daily or near-daily sync expectation |
| Paid media | `48h` | Manual import or connector sync expectation |
| Social media | `48h` | Manual import or connector sync expectation |

## Owner model

| Role | Decision rights | Required weekly actions |
| --- | --- | --- |
| Growth owner | KPI definitions, prioritization, executive reporting, experiment queue | Run weekly review, approve roadmap tradeoffs, own monthly executive summary |
| Admin ops | Lead quality, queue discipline, follow-up SLA, manual attribution clean-up | Review stale queue, update lead quality states, flag operational blockers |
| Engineering | API contract, schema, ETL, alerts, dashboard correctness | Maintain data health, fix tracking/connector issues, ship stage backlog |

## Stage gates

| Gate | Must be true before continuing |
| --- | --- |
| Stage 0 -> Stage 1 | KPI glossary, taxonomy, thresholds, owners, and backlog are approved |
| Stage 1 -> Stage 2 | Attribution QA is stable and lead-quality taxonomy is operational |
| Stage 2 -> Stage 3 | Filters work consistently across overview, pipeline, acquisition, and SEO |
| Stage 3 -> Stage 4/5 | Query, funnel, and landing-page marts remain semantically stable for two weekly review cycles |
| Stage 5 -> Stage 6 | Stable segmented history exists for at least 90 days and lead-quality adoption is high |

## QA checklist lock

Detailed weekly operating steps live in `GROWTH_DASHBOARD_ATTRIBUTION_QA_CHECKLIST.md`.

The following checks are required before metrics are treated as trustworthy in weekly review:

1. Check unattributed lead rate and review any spike above the warning threshold.
2. Confirm direct leads are not hiding a broken `session_source` or `session_medium` capture path.
3. Reconcile at least one acquisition source, one landing page, and one stale queue count against raw data.
4. Confirm connector freshness stays inside the thresholds above.
5. Treat any KPI with a thin-volume warning as directional only, not budget-decision-ready.
