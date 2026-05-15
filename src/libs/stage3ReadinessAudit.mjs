import { normalizeAttributionPath } from './attributionHygiene.mjs';
import { isStage3TestSubmission, STAGE3_TEST_MARKER } from './stage3TestMarker.mjs';

export const DEFAULT_STAGE3_BASELINE_DATE = '2026-05-12T00:00:00+01:00';
export const DEFAULT_STAGE3_WINDOW_DAYS = 14;
export const DEFAULT_STAGE3_LEAD_WINDOW_DAYS = 30;
export const DEFAULT_STAGE3_JOIN_WINDOW_DAYS = 7;
export const STAGE3_MIN_ORGANIC_LEADS = 3;

export const STAGE3_ARTIFACT_SPECS = [
  {
    key: 'growth_query_daily_metrics',
    label: 'Query intelligence mart',
    dateColumn: 'metric_date',
    freshnessThresholdHours: 72
  },
  {
    key: 'growth_landing_page_scores_daily',
    label: 'Landing-page scorecard mart',
    dateColumn: 'metric_date',
    freshnessThresholdHours: 72
  },
  {
    key: 'growth_behavior_daily_metrics',
    label: 'Behavior mart',
    dateColumn: 'event_date',
    freshnessThresholdHours: 24
  },
  {
    key: 'growth_funnel_daily_metrics',
    label: 'Funnel mart',
    dateColumn: 'metric_date',
    freshnessThresholdHours: 24
  }
];

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeNullableText(value) {
  const text = normalizeText(value, '');
  return text || null;
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function toDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T00:00:00.000Z`)
    : new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
}

function round(value, digits = 1) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const factor = 10 ** digits;
  return Math.round(numericValue * factor) / factor;
}

function percent(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return round((numerator / denominator) * 100, 1);
}

function incrementGroupCount(map, key, row = {}) {
  const groupKey = normalizeNullableText(key);
  if (!groupKey) {
    return;
  }

  const current = map.get(groupKey) || {
    key: groupKey,
    eventCount: 0,
    uniqueClients: new Set()
  };

  current.eventCount += 1;
  const clientId = normalizeNullableText(row.ga_client_id);
  if (clientId) {
    current.uniqueClients.add(clientId);
  }

  map.set(groupKey, current);
}

function finalizeGroupedCounts(map, limit = null) {
  const rows = Array.from(map.values())
    .map((entry) => ({
      key: entry.key,
      eventCount: entry.eventCount,
      uniqueClients: entry.uniqueClients.size
    }))
    .sort((left, right) => {
      if (right.eventCount !== left.eventCount) {
        return right.eventCount - left.eventCount;
      }

      return left.key.localeCompare(right.key);
    });

  return limit ? rows.slice(0, limit) : rows;
}

function classifyRateStatus(rate, {
  passMin,
  warnMin
}) {
  if (!Number.isFinite(rate)) {
    return 'insufficient_evidence';
  }

  if (rate >= passMin) {
    return 'pass';
  }

  if (rate >= warnMin) {
    return 'warn';
  }

  return 'fail';
}

function mergeStatuses(...statuses) {
  if (statuses.includes('fail')) {
    return 'fail';
  }

  if (statuses.includes('warn')) {
    return 'warn';
  }

  if (statuses.includes('insufficient_evidence')) {
    return 'insufficient_evidence';
  }

  return 'pass';
}

function buildFreshnessSummary(artifacts = [], nowIso = new Date().toISOString()) {
  const now = toDate(nowIso) || new Date();
  const rows = artifacts.map((artifact) => {
    const latestDate = toDate(artifact.latestValue);
    const ageHours = latestDate
      ? round((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60), 1)
      : null;
    const status = latestDate && artifact.recentRowCount > 0
      ? classifyRateStatus(
        artifact.freshnessThresholdHours - ageHours,
        {
          passMin: 0,
          warnMin: -artifact.freshnessThresholdHours
        }
      )
      : 'fail';

    return {
      key: artifact.key,
      label: artifact.label,
      latestValue: latestDate ? latestDate.toISOString() : null,
      recentRowCount: artifact.recentRowCount || 0,
      freshnessThresholdHours: artifact.freshnessThresholdHours,
      ageHours,
      status
    };
  });

  return {
    status: mergeStatuses(...rows.map((row) => row.status)),
    artifacts: rows
  };
}

function buildEventCoverage(behaviorEvents = []) {
  const byEvent = new Map();
  const byForm = new Map();
  const byCta = new Map();
  const byContactMethod = new Map();

  behaviorEvents.forEach((event) => {
    incrementGroupCount(byEvent, event.event_name, event);
    incrementGroupCount(byForm, event.form_name, event);
    incrementGroupCount(byCta, event.cta_id, event);
    incrementGroupCount(byContactMethod, event.contact_method, event);
  });

  return {
    totalEvents: behaviorEvents.length,
    byEvent: finalizeGroupedCounts(byEvent),
    byForm: finalizeGroupedCounts(byForm),
    byCta: finalizeGroupedCounts(byCta, 12),
    byContactMethod: finalizeGroupedCounts(byContactMethod)
  };
}

function buildTerminalOutcomes(behaviorEvents = []) {
  const counts = {
    formValidationFailed: 0,
    formAbandonments: 0,
    formStarts: 0,
    submitSuccesses: 0,
    submitFailures: 0,
    controlledSubmitSuccesses: 0,
    controlledSubmitFailures: 0
  };

  behaviorEvents.forEach((event) => {
    const isControlled = normalizeBoolean(event.metadata?.stage3_test);

    if (event.event_name === 'form_validation_failed') {
      counts.formValidationFailed += 1;
      return;
    }

    if (event.event_name === 'form_abandonment') {
      counts.formAbandonments += 1;
      return;
    }

    if (event.event_name === 'submit_failed') {
      counts.submitFailures += 1;
      if (isControlled) {
        counts.controlledSubmitFailures += 1;
      }
      return;
    }

    if (event.event_name === 'funnel_step' && event.step_name === 'form_start') {
      counts.formStarts += 1;
      return;
    }

    if (event.event_name === 'funnel_step' && event.step_name === 'submit_success') {
      counts.submitSuccesses += 1;
      if (isControlled) {
        counts.controlledSubmitSuccesses += 1;
      }
    }
  });

  const status = counts.submitSuccesses > 0 && counts.formValidationFailed > 0
    ? 'pass'
    : (counts.submitSuccesses > 0 || counts.formValidationFailed > 0 ? 'warn' : 'insufficient_evidence');

  return {
    ...counts,
    status
  };
}

function isWithinJoinWindow(eventOccurredAt, leadCreatedAt, joinWindowDays) {
  const eventDate = toDate(eventOccurredAt);
  const leadDate = toDate(leadCreatedAt);

  if (!eventDate || !leadDate) {
    return false;
  }

  const millisecondsBeforeLead = leadDate.getTime() - eventDate.getTime();
  const maxLookback = joinWindowDays * 24 * 60 * 60 * 1000;
  const maxForwardSkew = 5 * 60 * 1000;

  return millisecondsBeforeLead >= -maxForwardSkew && millisecondsBeforeLead <= maxLookback;
}

function buildLeadMatchAudit(lead = {}, behaviorEvents = [], joinWindowDays = DEFAULT_STAGE3_JOIN_WINDOW_DAYS) {
  const gaClientId = normalizeNullableText(lead.ga_client_id);
  const landingPage = normalizeNullableText(lead.landing_page);
  const normalizedLandingPage = landingPage
    ? normalizeAttributionPath(lead.normalized_landing_page || landingPage, '/', { includeSearch: false })
    : null;

  const matchedByClientId = gaClientId
    ? behaviorEvents.some((event) => (
      normalizeNullableText(event.ga_client_id) === gaClientId
      && isWithinJoinWindow(event.occurred_at, lead.created_at, joinWindowDays)
    ))
    : false;

  const matchedByLandingPage = normalizedLandingPage
    ? behaviorEvents.some((event) => (
      normalizeAttributionPath(event.landing_page, '/', { includeSearch: false }) === normalizedLandingPage
      && isWithinJoinWindow(event.occurred_at, lead.created_at, joinWindowDays)
    ))
    : false;

  return {
    ...lead,
    hasGaClientId: Boolean(gaClientId),
    hasLandingPage: Boolean(landingPage),
    hasJoinKey: Boolean(gaClientId || landingPage),
    matchedByClientId,
    matchedByLandingPage,
    matched: matchedByClientId || matchedByLandingPage
  };
}

function classifyControlledRate(leads = [], predicate) {
  if (leads.length === 0) {
    return 'insufficient_evidence';
  }

  return leads.every(predicate) ? 'pass' : 'fail';
}

function buildPostBaselineLeadSummary({
  leads = [],
  behaviorEvents = [],
  baselineDate = DEFAULT_STAGE3_BASELINE_DATE,
  joinWindowDays = DEFAULT_STAGE3_JOIN_WINDOW_DAYS
} = {}) {
  const baseline = toDate(baselineDate) || toDate(DEFAULT_STAGE3_BASELINE_DATE) || new Date();
  const leadAudits = leads.map((lead) => buildLeadMatchAudit(lead, behaviorEvents, joinWindowDays));
  const legacyExcludedLeadIds = leadAudits
    .filter((lead) => toDate(lead.created_at) && toDate(lead.created_at) < baseline && !lead.hasJoinKey)
    .map((lead) => `${lead.lead_kind}:${lead.id}`);

  const postBaseline = leadAudits.filter((lead) => {
    const createdAt = toDate(lead.created_at);
    return createdAt && createdAt >= baseline;
  });
  const controlled = postBaseline.filter((lead) => lead.isControlledTest);
  const organic = postBaseline.filter((lead) => !lead.isControlledTest);
  const controlledWithJoinKeys = controlled.filter((lead) => lead.hasJoinKey);
  const organicWithJoinKeys = organic.filter((lead) => lead.hasJoinKey);

  const controlledJoinKeyRate = percent(
    controlled.filter((lead) => lead.hasJoinKey).length,
    controlled.length
  );
  const organicJoinKeyRate = percent(
    organic.filter((lead) => lead.hasJoinKey).length,
    organic.length
  );
  const controlledMatchRate = percent(
    controlledWithJoinKeys.filter((lead) => lead.matched).length,
    controlledWithJoinKeys.length
  );
  const organicMatchRate = percent(
    organicWithJoinKeys.filter((lead) => lead.matched).length,
    organicWithJoinKeys.length
  );

  const joinKeyStatus = mergeStatuses(
    classifyControlledRate(controlled, (lead) => lead.hasJoinKey),
    organic.length > 0
      ? classifyRateStatus(organicJoinKeyRate, { passMin: 80, warnMin: 60 })
      : 'insufficient_evidence'
  );

  const behaviorMatchStatus = mergeStatuses(
    classifyControlledRate(controlledWithJoinKeys, (lead) => lead.matched),
    organicWithJoinKeys.length > 0
      ? classifyRateStatus(organicMatchRate, { passMin: 60, warnMin: 30 })
      : 'insufficient_evidence'
  );

  return {
    baselineDate: baseline.toISOString(),
    status: mergeStatuses(joinKeyStatus, behaviorMatchStatus),
    postBaselineLeads: {
      total: postBaseline.length,
      controlledCount: controlled.length,
      organicCount: organic.length,
      withGaClientId: postBaseline.filter((lead) => lead.hasGaClientId).length,
      withLandingPage: postBaseline.filter((lead) => lead.hasLandingPage).length,
      withJoinKey: postBaseline.filter((lead) => lead.hasJoinKey).length
    },
    joinability: {
      status: mergeStatuses(joinKeyStatus, behaviorMatchStatus),
      joinKeyStatus,
      behaviorMatchStatus,
      controlledJoinKeyRate,
      organicJoinKeyRate,
      controlledBehaviorMatchRate: controlledMatchRate,
      organicBehaviorMatchRate: organicMatchRate,
      matchedByClientId: postBaseline.filter((lead) => lead.matchedByClientId).length,
      matchedByLandingPage: postBaseline.filter((lead) => lead.matchedByLandingPage).length,
      matchedAny: postBaseline.filter((lead) => lead.matched).length,
      unmatchedLeadIds: postBaseline.filter((lead) => !lead.matched).map((lead) => `${lead.lead_kind}:${lead.id}`),
      postBaselineLeadIds: postBaseline.map((lead) => `${lead.lead_kind}:${lead.id}`)
    },
    leadAudits,
    legacyExcludedLeadIds
  };
}

export function mergeLeadMarkerRows(reportingRows = [], rawLeadRows = []) {
  const rawLookup = new Map(
    rawLeadRows.map((row) => [`${row.lead_kind}:${row.id}`, row])
  );

  return reportingRows.map((row) => {
    const rawRow = rawLookup.get(`${row.lead_kind}:${row.id}`) || {};
    const isControlledTest = normalizeBoolean(rawRow.stage3_test)
      || isStage3TestSubmission(
        rawRow.nom,
        rawRow.prenom,
        rawRow.raison_sociale,
        rawRow.contact_nom,
        rawRow.contact_prenom,
        rawRow.email,
        rawRow.message
      );

    return {
      ...row,
      isControlledTest
    };
  });
}

export function buildStage3ReadinessAudit({
  baselineDate = DEFAULT_STAGE3_BASELINE_DATE,
  nowIso = new Date().toISOString(),
  artifacts = [],
  behaviorEvents = [],
  joinBehaviorEvents = behaviorEvents,
  leads = [],
  joinWindowDays = DEFAULT_STAGE3_JOIN_WINDOW_DAYS,
  minimumOrganicLeads = STAGE3_MIN_ORGANIC_LEADS
} = {}) {
  const freshness = buildFreshnessSummary(artifacts, nowIso);
  const eventCoverage = buildEventCoverage(behaviorEvents);
  const terminalOutcomes = buildTerminalOutcomes(behaviorEvents);
  const leadSummary = buildPostBaselineLeadSummary({
    leads,
    behaviorEvents: joinBehaviorEvents,
    baselineDate,
    joinWindowDays
  });

  const blockers = [];
  const recommendedNextSteps = [];

  if (terminalOutcomes.submitSuccesses === 0) {
    blockers.push('No submit_success terminal events were observed in the audit window.');
    recommendedNextSteps.push('Run one controlled successful submission each on /contact, /devis, and /entreprises to validate server-side submit_success persistence.');
  }

  if (terminalOutcomes.formValidationFailed === 0) {
    blockers.push('No form_validation_failed events were observed in the audit window.');
    recommendedNextSteps.push('Run one intentional client-side validation failure per form flow and verify the event lands in growth_behavior_events.');
  }

  if (leadSummary.postBaselineLeads.controlledCount === 0) {
    blockers.push(`No controlled ${STAGE3_TEST_MARKER} post-baseline leads were detected.`);
    recommendedNextSteps.push(`Run controlled submissions with the ${STAGE3_TEST_MARKER} prefix so mechanical validation can be proven quickly.`);
  }

  if (leadSummary.postBaselineLeads.organicCount < minimumOrganicLeads) {
    blockers.push(
      `Only ${leadSummary.postBaselineLeads.organicCount} post-baseline organic leads were found; Stage 4 requires at least ${minimumOrganicLeads}.`
    );
    recommendedNextSteps.push('Keep Stage 3 open until at least three post-baseline organic leads are present with acceptable joinability.');
  }

  if (leadSummary.joinability.joinKeyStatus === 'fail' || leadSummary.joinability.joinKeyStatus === 'warn') {
    blockers.push('Lead attribution join-key coverage is not yet strong enough for a decision-safe Stage 4 baseline.');
    recommendedNextSteps.push('Audit ga_client_id and landing_page persistence on new leads and confirm controlled test leads carry at least one join key.');
  }

  if (leadSummary.joinability.behaviorMatchStatus === 'fail' || leadSummary.joinability.behaviorMatchStatus === 'warn') {
    blockers.push('Lead-to-behavior matching is below the target threshold for the post-baseline window.');
    recommendedNextSteps.push('Inspect ga_client_id and normalized landing-page matching within the 7-day window and resolve any missing server-side terminal events.');
  }

  if (leadSummary.legacyExcludedLeadIds.length > 0) {
    recommendedNextSteps.push('Keep legacy leads outside the hard Stage 4 denominator; do not backfill missing historical join keys.');
  }

  const technicalStatus = mergeStatuses(
    freshness.status,
    terminalOutcomes.status,
    leadSummary.joinability.status
  );

  const status = technicalStatus === 'fail'
    ? 'fail'
    : (leadSummary.postBaselineLeads.organicCount < minimumOrganicLeads
      ? 'insufficient_evidence'
      : technicalStatus);

  return {
    baselineDate: (toDate(baselineDate) || toDate(DEFAULT_STAGE3_BASELINE_DATE) || new Date()).toISOString(),
    status,
    freshness,
    eventCoverage,
    terminalOutcomes,
    postBaselineLeads: leadSummary.postBaselineLeads,
    joinability: leadSummary.joinability,
    legacyExcludedLeadIds: leadSummary.legacyExcludedLeadIds,
    blockers,
    recommendedNextSteps
  };
}
