import 'dotenv/config';
import { createServiceClient } from '../../src/libs/supabase.js';

function parseCliArgs(argv = []) {
  return argv.reduce((accumulator, token, index, source) => {
    if (!token.startsWith('--')) {
      return accumulator;
    }

    const [rawKey, inlineValue] = token.slice(2).split('=');
    const nextValue = inlineValue ?? source[index + 1];
    accumulator[rawKey] = nextValue && !nextValue.startsWith('--') ? nextValue : 'true';
    return accumulator;
  }, {});
}

function toIsoDaysAgo(days = 30) {
  const now = new Date();
  const start = new Date(now.getTime() - (Number(days) * 24 * 60 * 60 * 1000));
  return {
    fromIso: start.toISOString(),
    toIso: now.toISOString()
  };
}

function formatHours(isoValue = '') {
  if (!isoValue) {
    return null;
  }

  const hours = (Date.now() - new Date(isoValue).getTime()) / (1000 * 60 * 60);
  return Math.round(hours * 10) / 10;
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const days = Number(args.days || 30);
  const asJson = args.json === 'true';
  const { fromIso, toIso } = toIsoDaysAgo(days);
  const supabase = createServiceClient();

  const [leadResult, leadAdsResult, conversionResult] = await Promise.all([
    supabase
      .from('growth_lead_reporting_dimensions')
      .select('lead_kind,id,created_at,meta_lead_source,meta_platform,meta_fbc,meta_fbp,meta_leadgen_id,session_source,session_medium,session_campaign')
      .gte('created_at', fromIso)
      .lte('created_at', toIso),
    supabase
      .from('meta_lead_ad_submissions')
      .select('meta_leadgen_id,meta_form_id,meta_platform,mapping_status,synced_at,lead_created_at')
      .gte('lead_created_at', fromIso)
      .lte('lead_created_at', toIso),
    supabase
      .from('meta_conversion_event_log')
      .select('event_id,event_name,send_status,created_at')
      .gte('created_at', fromIso)
      .lte('created_at', toIso)
  ]);

  if (leadResult.error || leadAdsResult.error || conversionResult.error) {
    throw new Error([
      leadResult.error?.message,
      leadAdsResult.error?.message,
      conversionResult.error?.message
    ].filter(Boolean).join(' | '));
  }

  const leads = leadResult.data || [];
  const leadAds = leadAdsResult.data || [];
  const conversions = conversionResult.data || [];
  const websiteMetaLeads = leads.filter((lead) => lead.meta_lead_source === 'website');
  const nativeMetaLeads = leads.filter((lead) => lead.meta_lead_source === 'lead_ad');
  const missingIdentifierCount = websiteMetaLeads.filter((lead) => !lead.meta_fbc && !lead.meta_fbp).length;
  const failedConversions = conversions.filter((row) => row.send_status !== 'sent').length;
  const unmappedForms = new Set(
    leadAds
      .filter((row) => row.mapping_status === 'unmapped')
      .map((row) => row.meta_form_id)
      .filter(Boolean)
  );
  const latestLeadSyncAt = leadAds
    .map((row) => row.synced_at)
    .filter(Boolean)
    .sort()
    .at(-1) || null;

  const result = {
    status: failedConversions > 0 || missingIdentifierCount > 0 || unmappedForms.size > 0
      ? 'warning'
      : 'pass',
    windowDays: days,
    websiteMetaLeads: websiteMetaLeads.length,
    nativeMetaLeads: nativeMetaLeads.length,
    rawLeadAdRows: leadAds.length,
    missingIdentifierCount,
    conversionLog: {
      total: conversions.length,
      sent: conversions.filter((row) => row.send_status === 'sent').length,
      failed: failedConversions
    },
    unmappedFormsCount: unmappedForms.size,
    latestLeadSyncAt,
    leadSyncAgeHours: formatHours(latestLeadSyncAt)
  };

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Meta attribution audit: ${result.status}`);
  console.log(`Window: last ${days} days`);
  console.log(`Website Meta leads: ${result.websiteMetaLeads}`);
  console.log(`Native Meta leads: ${result.nativeMetaLeads}`);
  console.log(`Raw Lead Ads rows: ${result.rawLeadAdRows}`);
  console.log(`Missing meta_fbc/meta_fbp on website Meta leads: ${result.missingIdentifierCount}`);
  console.log(`CAPI sends: ${result.conversionLog.sent}/${result.conversionLog.total} sent`);
  console.log(`Unmapped Lead Ads forms: ${result.unmappedFormsCount}`);
  console.log(`Latest Lead Ads sync: ${result.latestLeadSyncAt || 'none'}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
