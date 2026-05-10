#!/usr/bin/env node

import {
  buildAttributionAuditSummary,
  getAttributionSiteHost
} from '../../src/libs/attributionHygiene.mjs';
import {
  createGrowthServiceClient,
  loadGrowthEnv
} from '../../src/libs/growthReporting.mjs';

function normalizeInteger(value, fallback = 30) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return Math.round(numericValue);
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

function formatDateTime(value) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
}

function parseArgs(argv = []) {
  const args = {
    days: 30,
    strict: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--strict') {
      args.strict = true;
      continue;
    }

    if (value === '--days') {
      args.days = normalizeInteger(argv[index + 1], 30);
      index += 1;
    }
  }

  return args;
}

function getRange(days) {
  const endDate = new Date();
  endDate.setUTCHours(23, 59, 59, 999);
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - Math.max(0, days - 1));
  startDate.setUTCHours(0, 0, 0, 0);

  return {
    fromIso: startDate.toISOString(),
    toIso: endDate.toISOString(),
    fromDate: startDate.toISOString().slice(0, 10),
    toDate: endDate.toISOString().slice(0, 10)
  };
}

async function fetchLeadRows(supabase, range) {
  const { data, error } = await supabase
    .from('growth_lead_reporting_dimensions')
    .select([
      'lead_kind',
      'id',
      'created_at',
      'landing_page',
      'entry_path',
      'referrer_host',
      'session_source',
      'session_medium',
      'session_campaign',
      'normalized_source',
      'normalized_medium',
      'normalized_campaign',
      'normalized_landing_page'
    ].join(','))
    .gte('created_at', range.fromIso)
    .lte('created_at', range.toIso)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

function printSummary(summary, range) {
  console.log(`Attribution hygiene audit (${range.fromDate} -> ${range.toDate})`);
  console.log(`Overall status: ${summary.status.toUpperCase()}`);
  console.log('');
  console.log(`- Leads audited: ${summary.totals.leads}`);
  console.log(`- Direct/(none) leads: ${summary.totals.directNoneCount} (${formatPercent(summary.totals.unattributedRate)})`);
  console.log(`- Missing landing page: ${summary.totals.missingLandingPageCount}`);
  console.log(`- Missing entry path: ${summary.totals.missingEntryPathCount}`);
  console.log(`- Suspicious direct leads with external referrer: ${summary.totals.suspiciousDirectCount}`);
  console.log(`- Campaign naming issues: ${summary.totals.campaignNormalizationIssueCount}`);

  if (summary.campaignVariants.length > 0) {
    console.log('');
    console.log('Campaign naming drift:');
    summary.campaignVariants.slice(0, 10).forEach((group) => {
      console.log(`- ${group.normalizedCampaign}: ${group.rawVariants.join(', ')}`);
    });
  }

  if (summary.problematicRows.length > 0) {
    console.log('');
    console.log('Recent problematic rows:');
    summary.problematicRows.forEach((row) => {
      console.log(
        `- ${row.leadKind}:${row.id} @ ${formatDateTime(row.createdAt)} ` +
        `source=${row.source} medium=${row.medium} campaign=${row.campaign} ` +
        `landing=${row.landingPage} entry=${row.entryPath} referrer=${row.referrerHost || 'N/A'} ` +
        `issues=${row.issues.join('|')}`
      );
    });
  }
}

async function main() {
  loadGrowthEnv();

  const args = parseArgs(process.argv.slice(2));
  const range = getRange(args.days);
  const supabase = createGrowthServiceClient();
  const leadRows = await fetchLeadRows(supabase, range);
  const summary = buildAttributionAuditSummary(leadRows, {
    siteHost: getAttributionSiteHost()
  });

  printSummary(summary, range);

  if (args.strict && summary.status !== 'pass') {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
