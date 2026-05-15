#!/usr/bin/env node

import {
  createGrowthServiceClient,
  loadGrowthEnv
} from '../../src/libs/growthReporting.mjs';
import {
  buildStage3ReadinessAudit,
  DEFAULT_STAGE3_BASELINE_DATE,
  DEFAULT_STAGE3_JOIN_WINDOW_DAYS,
  DEFAULT_STAGE3_LEAD_WINDOW_DAYS,
  DEFAULT_STAGE3_WINDOW_DAYS,
  mergeLeadMarkerRows,
  STAGE3_ARTIFACT_SPECS
} from '../../src/libs/stage3ReadinessAudit.mjs';

function normalizeInteger(value, fallback) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return Math.round(numericValue);
}

function parseArgs(argv = []) {
  const args = {
    baselineDate: DEFAULT_STAGE3_BASELINE_DATE,
    windowDays: DEFAULT_STAGE3_WINDOW_DAYS,
    leadWindowDays: DEFAULT_STAGE3_LEAD_WINDOW_DAYS,
    joinWindowDays: DEFAULT_STAGE3_JOIN_WINDOW_DAYS,
    json: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--json') {
      args.json = true;
      continue;
    }

    if (value === '--baseline-date') {
      args.baselineDate = argv[index + 1] || args.baselineDate;
      index += 1;
      continue;
    }

    if (value.startsWith('--baseline-date=')) {
      args.baselineDate = value.split('=').slice(1).join('=') || args.baselineDate;
      continue;
    }

    if (value === '--window-days') {
      args.windowDays = normalizeInteger(argv[index + 1], args.windowDays);
      index += 1;
      continue;
    }

    if (value.startsWith('--window-days=')) {
      args.windowDays = normalizeInteger(value.split('=').slice(1).join('='), args.windowDays);
      continue;
    }

    if (value === '--lead-window-days') {
      args.leadWindowDays = normalizeInteger(argv[index + 1], args.leadWindowDays);
      index += 1;
      continue;
    }

    if (value.startsWith('--lead-window-days=')) {
      args.leadWindowDays = normalizeInteger(value.split('=').slice(1).join('='), args.leadWindowDays);
      continue;
    }

    if (value === '--join-window-days') {
      args.joinWindowDays = normalizeInteger(argv[index + 1], args.joinWindowDays);
      index += 1;
      continue;
    }

    if (value.startsWith('--join-window-days=')) {
      args.joinWindowDays = normalizeInteger(value.split('=').slice(1).join('='), args.joinWindowDays);
    }
  }

  return args;
}

function shiftDate(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getWindowRange(days) {
  const toDate = new Date();
  const fromDate = shiftDate(toDate, -(Math.max(1, days) - 1));
  fromDate.setUTCHours(0, 0, 0, 0);

  return {
    fromDate,
    fromIso: fromDate.toISOString(),
    fromDateOnly: fromDate.toISOString().slice(0, 10),
    toIso: toDate.toISOString()
  };
}

async function fetchArtifactSnapshot(supabase, spec, recentFromDate) {
  const [{ data: latestRows, error: latestError }, { count, error: countError }] = await Promise.all([
    supabase
      .from(spec.key)
      .select(spec.dateColumn)
      .order(spec.dateColumn, { ascending: false })
      .limit(1),
    supabase
      .from(spec.key)
      .select(spec.dateColumn, { head: true, count: 'exact' })
      .gte(spec.dateColumn, recentFromDate)
  ]);

  if (latestError) {
    throw latestError;
  }

  if (countError) {
    throw countError;
  }

  return {
    ...spec,
    latestValue: latestRows?.[0]?.[spec.dateColumn] || null,
    recentRowCount: count || 0
  };
}

async function fetchBehaviorEvents(supabase, fromIso, toIso) {
  const { data, error } = await supabase
    .from('growth_behavior_events')
    .select([
      'id',
      'occurred_at',
      'event_name',
      'step_name',
      'form_name',
      'cta_id',
      'contact_method',
      'ga_client_id',
      'landing_page',
      'session_source',
      'session_medium',
      'session_campaign',
      'business_line',
      'service_type',
      'metadata'
    ].join(','))
    .gte('occurred_at', fromIso)
    .lte('occurred_at', toIso)
    .order('occurred_at', { ascending: false })
    .limit(5000);

  if (error) {
    throw error;
  }

  return data || [];
}

async function fetchReportingLeads(supabase, fromIso, toIso) {
  const { data, error } = await supabase
    .from('growth_lead_reporting_dimensions')
    .select([
      'lead_kind',
      'id',
      'created_at',
      'ga_client_id',
      'landing_page',
      'normalized_landing_page',
      'entry_path',
      'business_line',
      'primary_service',
      'source_class',
      'page_type'
    ].join(','))
    .gte('created_at', fromIso)
    .lte('created_at', toIso)
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) {
    throw error;
  }

  return data || [];
}

async function fetchRawLeadMarkers(supabase, fromIso, toIso) {
  const [devisResult, conventionResult] = await Promise.all([
    supabase
      .from('devis_requests')
      .select('id,nom,prenom,email,message,created_at')
      .gte('created_at', fromIso)
      .lte('created_at', toIso)
      .order('created_at', { ascending: false })
      .limit(2000),
    supabase
      .from('convention_requests')
      .select('id,raison_sociale,contact_nom,contact_prenom,email,message,created_at')
      .gte('created_at', fromIso)
      .lte('created_at', toIso)
      .order('created_at', { ascending: false })
      .limit(2000)
  ]);

  if (devisResult.error) {
    throw devisResult.error;
  }

  if (conventionResult.error) {
    throw conventionResult.error;
  }

  return [
    ...(devisResult.data || []).map((row) => ({
      lead_kind: 'devis',
      ...row
    })),
    ...(conventionResult.data || []).map((row) => ({
      lead_kind: 'convention',
      ...row
    }))
  ];
}

function formatDateTime(value) {
  return value ? new Date(value).toISOString() : 'N/A';
}

function printSummary(summary, {
  coverageRange,
  leadRange,
  joinWindowDays
}) {
  console.log(`Stage 3 readiness audit (${coverageRange.fromDateOnly} -> ${new Date().toISOString().slice(0, 10)})`);
  console.log(`Overall status: ${summary.status.toUpperCase()}`);
  console.log(`Baseline date: ${summary.baselineDate}`);
  console.log(`Lead join window: ${leadRange.fromDateOnly} -> ${new Date().toISOString().slice(0, 10)} (match window ${joinWindowDays}d)`);
  console.log('');

  console.log('Freshness');
  summary.freshness.artifacts.forEach((artifact) => {
    console.log(
      `- ${artifact.key}: status=${artifact.status} recentRows=${artifact.recentRowCount} ` +
      `latest=${formatDateTime(artifact.latestValue)} ageHours=${artifact.ageHours ?? 'N/A'}`
    );
  });

  console.log('');
  console.log('Behavior coverage');
  console.log(`- Total events: ${summary.eventCoverage.totalEvents}`);
  summary.eventCoverage.byEvent.slice(0, 8).forEach((row) => {
    console.log(`- ${row.key}: events=${row.eventCount} uniqueClients=${row.uniqueClients}`);
  });

  console.log('');
  console.log('Terminal outcomes');
  console.log(`- form_validation_failed: ${summary.terminalOutcomes.formValidationFailed}`);
  console.log(`- form_abandonment: ${summary.terminalOutcomes.formAbandonments}`);
  console.log(`- form_start: ${summary.terminalOutcomes.formStarts}`);
  console.log(`- submit_success: ${summary.terminalOutcomes.submitSuccesses}`);
  console.log(`- submit_failed: ${summary.terminalOutcomes.submitFailures}`);

  console.log('');
  console.log('Post-baseline leads');
  console.log(`- Total: ${summary.postBaselineLeads.total}`);
  console.log(`- Organic: ${summary.postBaselineLeads.organicCount}`);
  console.log(`- Controlled: ${summary.postBaselineLeads.controlledCount}`);
  console.log(`- With ga_client_id: ${summary.postBaselineLeads.withGaClientId}`);
  console.log(`- With landing_page: ${summary.postBaselineLeads.withLandingPage}`);
  console.log(`- With at least one join key: ${summary.postBaselineLeads.withJoinKey}`);

  console.log('');
  console.log('Joinability');
  console.log(`- Join-key status: ${summary.joinability.joinKeyStatus}`);
  console.log(`- Behavior-match status: ${summary.joinability.behaviorMatchStatus}`);
  console.log(`- Controlled join-key rate: ${summary.joinability.controlledJoinKeyRate}%`);
  console.log(`- Organic join-key rate: ${summary.joinability.organicJoinKeyRate}%`);
  console.log(`- Controlled match rate: ${summary.joinability.controlledBehaviorMatchRate}%`);
  console.log(`- Organic match rate: ${summary.joinability.organicBehaviorMatchRate}%`);
  console.log(`- Matched by ga_client_id: ${summary.joinability.matchedByClientId}`);
  console.log(`- Matched by landing page: ${summary.joinability.matchedByLandingPage}`);
  console.log(`- Unmatched post-baseline leads: ${summary.joinability.unmatchedLeadIds.length}`);

  if (summary.legacyExcludedLeadIds.length > 0) {
    console.log('');
    console.log('Legacy excluded leads');
    summary.legacyExcludedLeadIds.forEach((leadId) => {
      console.log(`- ${leadId}`);
    });
  }

  if (summary.blockers.length > 0) {
    console.log('');
    console.log('Blockers');
    summary.blockers.forEach((blocker) => {
      console.log(`- ${blocker}`);
    });
  }

  if (summary.recommendedNextSteps.length > 0) {
    console.log('');
    console.log('Recommended next steps');
    summary.recommendedNextSteps.forEach((step) => {
      console.log(`- ${step}`);
    });
  }
}

async function main() {
  loadGrowthEnv();

  const args = parseArgs(process.argv.slice(2));
  const coverageRange = getWindowRange(args.windowDays);
  const leadRange = getWindowRange(args.leadWindowDays);
  const behaviorJoinStart = shiftDate(leadRange.fromDate, -args.joinWindowDays);
  const supabase = createGrowthServiceClient();

  const [artifacts, coverageEvents, joinEvents, reportingLeads, rawLeadMarkers] = await Promise.all([
    Promise.all(STAGE3_ARTIFACT_SPECS.map((spec) => fetchArtifactSnapshot(supabase, spec, coverageRange.fromDateOnly))),
    fetchBehaviorEvents(supabase, coverageRange.fromIso, coverageRange.toIso),
    fetchBehaviorEvents(supabase, behaviorJoinStart.toISOString(), coverageRange.toIso),
    fetchReportingLeads(supabase, leadRange.fromIso, coverageRange.toIso),
    fetchRawLeadMarkers(supabase, leadRange.fromIso, coverageRange.toIso)
  ]);

  const mergedLeads = mergeLeadMarkerRows(reportingLeads, rawLeadMarkers);
  const summary = buildStage3ReadinessAudit({
    baselineDate: args.baselineDate,
    artifacts,
    behaviorEvents: coverageEvents,
    joinBehaviorEvents: joinEvents,
    leads: mergedLeads,
    joinWindowDays: args.joinWindowDays
  });

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  printSummary(summary, {
    coverageRange,
    leadRange,
    joinWindowDays: args.joinWindowDays
  });
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
