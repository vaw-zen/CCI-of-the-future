# Growth Dashboard Stage 3 Controlled Test Matrix

Date: 2026-05-19

## Goal

Run the minimum controlled production checks needed to prove that the Stage 3 terminal funnel path is mechanically working for the three core lead funnels:

- `/contact`
- `/devis`
- `/entreprises`

This matrix is designed to clear the current blockers:

- `submit_success = 0`
- `form_validation_failed = 0`
- `controlled [STAGE3 TEST] post-baseline leads = 0`

It does **not** by itself open Stage 4. It proves the path mechanically so Stage 3 can move from “unproven” toward “mechanically validated”.

## Shared Rules

1. Run these checks in a normal browser with JavaScript enabled.
2. Use an incognito/private window so the session is clean, but keep the **same tab** for the validation-failure step and the success step of each funnel.
3. Wait at least 5 seconds after page load before interacting so the analytics context and `_ga` cookie can exist.
4. Do not use ad blockers or privacy extensions during the test run.
5. Leave `honeypotWebsite` empty.
6. Keep the `[STAGE3 TEST]` marker exactly as written in the values below.
7. After the test run, mark resulting leads as non-business in admin ops handling.

## Success Criteria

After all six checks, the next audit should ideally show:

- `formValidationFailed >= 3`
- `submitSuccesses >= 3`
- `postBaselineLeads.controlledCount >= 3`
- `postBaselineLeads.withJoinKey >= 3`
- `joinability.controlledJoinKeyRate = 100`
- `joinability.controlledBehaviorMatchRate = 100`

The audit may still stay `insufficient_evidence` if organic leads remain below 3. That is acceptable. The point of this matrix is to prove the mechanical path.

## Shared Future Dates

Use these absolute dates so the form values stay valid relative to the current date of **May 19, 2026**:

- `2026-05-22`
- `2026-05-26`

## Funnel 1 — `/contact`

Open: `https://cciservices.online/contact` or the equivalent production URL.

### Step 1A — Intentional validation failure

Fill these values:

| Field | Value |
| --- | --- |
| `typePersonne` | `physique` |
| `nom` | `[STAGE3 TEST] Contact` |
| `prenom` | `Validation` |
| `email` | `chaaben.fares94+stage3-contact@gmail.com` |
| `telephone` | `22111222` |
| `adresse` | `10 Rue des Tests, El Aouina` |
| `ville` | `Tunis` |
| `typeLogement` | `appartement` |
| `typeService` | `salon` |
| `nombrePlaces` | leave blank on purpose |
| `message` | `[STAGE3 TEST] contact validation failure` |
| `conditions` | checked |

Expected result:

- the page blocks submit client-side
- the visible error should complain about missing `nombrePlaces`
- this should create a client-side `form_validation_failed` path for `contact_quote_form`

### Step 1B — Successful submission

Stay on the same tab and add:

| Field | Value |
| --- | --- |
| `nombrePlaces` | `5` |

Keep all the other values unchanged and submit again.

Expected result:

- success message is shown
- one controlled post-baseline lead is created
- the server-side terminal persistence path should record `submit_success`

## Funnel 2 — `/devis`

Open: `https://cciservices.online/devis` or the equivalent production URL.

### Step 2A — Intentional validation failure

Fill these values:

| Field | Value |
| --- | --- |
| `typePersonne` | `physique` |
| `nom` | `[STAGE3 TEST] Devis` |
| `prenom` | `Validation` |
| `email` | `chaaben.fares94+stage3-devis@gmail.com` |
| `telephone` | `22111333` |
| `adresse` | `20 Rue des Tests, La Marsa` |
| `ville` | `Tunis` |
| `typeLogement` | `appartement` |
| `typeService` | `tapis` |
| `surfaceService` | leave blank on purpose |
| `datePreferee` | `2026-05-22` |
| `heurePreferee` | `matin` |
| `message` | `[STAGE3 TEST] devis validation failure` |
| `conditions` | checked |

Expected result:

- the page blocks submit client-side
- the visible error should complain about missing `surfaceService`
- this should create a client-side `form_validation_failed` path for `devis_form`

### Step 2B — Successful submission

Stay on the same tab and add:

| Field | Value |
| --- | --- |
| `surfaceService` | `18` |

Keep all the other values unchanged and submit again.

Expected result:

- success message is shown
- one controlled post-baseline lead is created
- the server-side terminal persistence path should record `submit_success`

## Funnel 3 — `/entreprises`

Open: `https://cciservices.online/entreprises` or the equivalent production URL.

### Step 3A — Intentional validation failure

Fill these values:

| Field | Value |
| --- | --- |
| `raisonSociale` | `[STAGE3 TEST] QA Convention` |
| `matriculeFiscale` | `1234567A` |
| `secteurActivite` | `hotel` |
| `contactNom` | `Test` |
| `contactPrenom` | `Convention` |
| `contactFonction` | `Responsable exploitation` |
| `email` | `chaaben.fares94+stage3-convention@gmail.com` |
| `telephone` | `22111444` |
| `nombreSites` | `2` |
| `surfaceTotale` | `1200` |
| `servicesSouhaites` | leave empty on purpose |
| `frequence` | `hebdomadaire` |
| `dureeContrat` | `1_an` |
| `dateDebutSouhaitee` | `2026-05-26` |
| `message` | `[STAGE3 TEST] convention validation failure` |
| `conditions` | checked |

Expected result:

- the page blocks submit client-side
- the visible error should complain about missing `servicesSouhaites`
- this should create a client-side `form_validation_failed` path for `convention_form`

### Step 3B — Successful submission

Stay on the same tab and select:

| Field | Value |
| --- | --- |
| `servicesSouhaites` | `locaux` |

Keep all the other values unchanged and submit again.

Expected result:

- success message is shown
- one controlled post-baseline lead is created
- the server-side terminal persistence path should record `submit_success`

## Immediate Verification

After the six checks, run:

```bash
npm run growth:audit:stage3 -- --baseline-date=2026-05-12 --window-days=14 --lead-window-days=30
```

## What Should Change In The Audit

Minimum expected movement:

| Audit field | Target after the matrix |
| --- | --- |
| `terminalOutcomes.formValidationFailed` | at least `3` |
| `terminalOutcomes.submitSuccesses` | at least `3` |
| `postBaselineLeads.controlledCount` | at least `3` |
| `postBaselineLeads.withJoinKey` | at least `3` |
| `joinability.controlledJoinKeyRate` | `100` |
| `joinability.controlledBehaviorMatchRate` | `100` |

Expected blocker cleanup:

- `No controlled [STAGE3 TEST] post-baseline leads were detected.` should disappear
- `No form_validation_failed events were observed in the audit window.` should disappear
- `No submit_success terminal events were observed in the audit window.` should disappear

Expected remaining blocker:

- `Only 0 post-baseline organic leads were found; Stage 4 requires at least 3.` may remain until real leads arrive

## Admin Ops Cleanup

After verification:

1. Open the created test leads in admin.
2. Mark them as non-business / internal test handling.
3. Do not allow them to enter normal sales follow-up.
4. Keep the audit output attached to the Stage 3 closeout checklist.

## If The Audit Still Does Not Move

Interpretation order:

1. If validation failures still stay at `0`, the issue is in client-side capture or behavior persistence.
2. If submit successes still stay at `0`, the issue is in server-side terminal persistence or route integration.
3. If controlled leads exist but joinability stays `0`, the issue is attribution capture on lead creation.
4. If controlled paths work but the overall audit remains `insufficient_evidence`, the remaining blocker is organic lead volume, not instrumentation.
