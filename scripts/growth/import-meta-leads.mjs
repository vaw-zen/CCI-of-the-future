import 'dotenv/config';
import { createServiceClient } from '../../src/libs/supabase.js';
import {
  buildMetaLeadAdAutoCreateCandidate,
  buildMetaLeadAdSubmissionRow
} from '../../src/libs/metaLeadAds.mjs';
import {
  isMissingOptionalLeadOperationFieldError,
  isMissingOptionalLeadTrackingColumnError,
  withoutOptionalLeadOperationFields,
  withoutOptionalLeadTrackingFields
} from '../../src/libs/leadTrackingSchemaCompat.mjs';
import { upsertGrowthSourceHealth } from '../../src/libs/growthReporting.mjs';

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

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

async function fetchAllPages(url, accessToken) {
  const rows = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Meta import request failed with status ${response.status}`);
    }

    const payload = await response.json();
    rows.push(...(payload.data || []));
    nextUrl = payload.paging?.next || null;
  }

  return rows;
}

async function fetchMetaLeadForms({ pageId, accessToken, apiVersion, since }) {
  const fields = ['id', 'name', 'status'].join(',');
  const url = `https://graph.facebook.com/${apiVersion}/${pageId}/leadgen_forms?fields=${encodeURIComponent(fields)}&limit=50&access_token=${encodeURIComponent(accessToken)}${since ? `&since=${encodeURIComponent(since)}` : ''}`;
  return fetchAllPages(url, accessToken);
}

async function fetchMetaLeadRowsForForm({ formId, accessToken, apiVersion, since }) {
  const fields = [
    'id',
    'created_time',
    'field_data',
    'ad_id',
    'adgroup_id',
    'campaign_id',
    'form_id',
    'page_id',
    'platform',
    'is_organic',
    'campaign_name',
    'ad_name',
    'adset_name'
  ].join(',');
  const url = `https://graph.facebook.com/${apiVersion}/${formId}/leads?fields=${encodeURIComponent(fields)}&limit=100&access_token=${encodeURIComponent(accessToken)}${since ? `&since=${encodeURIComponent(since)}` : ''}`;
  return fetchAllPages(url, accessToken);
}

async function upsertSubmission(supabase, row) {
  const { data, error } = await supabase
    .from('meta_lead_ad_submissions')
    .upsert([row], {
      onConflict: 'meta_leadgen_id'
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function updateSubmission(supabase, leadgenId, values) {
  const { error } = await supabase
    .from('meta_lead_ad_submissions')
    .update(values)
    .eq('meta_leadgen_id', leadgenId);

  if (error) {
    throw error;
  }
}

async function insertMappedLead(supabase, table, payload) {
  let insertPayload = payload;
  let result = await supabase
    .from(table)
    .insert([insertPayload])
    .select()
    .single();

  if (result.error && isMissingOptionalLeadTrackingColumnError(result.error)) {
    insertPayload = withoutOptionalLeadTrackingFields(insertPayload);
    result = await supabase
      .from(table)
      .insert([insertPayload])
      .select()
      .single();
  }

  if (result.error && isMissingOptionalLeadOperationFieldError(result.error)) {
    insertPayload = withoutOptionalLeadOperationFields(insertPayload);
    result = await supabase
      .from(table)
      .insert([insertPayload])
      .select()
      .single();
  }

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const since = normalizeText(args.since, '');
  const pageId = normalizeText(process.env.META_PAGE_ID || process.env.FB_PAGE_ID, '');
  const accessToken = normalizeText(process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN, '');
  const apiVersion = normalizeText(process.env.META_API_VERSION || process.env.FB_API_VERSION, 'v20.0');

  if (!pageId || !accessToken) {
    throw new Error('META_PAGE_ID/FB_PAGE_ID and META_PAGE_ACCESS_TOKEN/FB_PAGE_ACCESS_TOKEN are required.');
  }

  const supabase = createServiceClient();
  const forms = await fetchMetaLeadForms({
    pageId,
    accessToken,
    apiVersion,
    since
  });
  const mappingIds = forms.map((form) => form.id).filter(Boolean);
  const { data: mappings } = mappingIds.length > 0
    ? await supabase
      .from('meta_lead_form_mappings')
      .select('*')
      .in('meta_form_id', mappingIds)
    : { data: [] };
  const mappingLookup = new Map((mappings || []).map((row) => [row.meta_form_id, row]));
  let importedCount = 0;
  let createdLeadCount = 0;

  for (const form of forms) {
    const leads = await fetchMetaLeadRowsForForm({
      formId: form.id,
      accessToken,
      apiVersion,
      since
    });

    for (const lead of leads) {
      const submissionRow = buildMetaLeadAdSubmissionRow({
        ...lead,
        form_id: lead.form_id || form.id,
        campaign_name: lead.campaign_name
      });
      const mapping = mappingLookup.get(submissionRow.meta_form_id) || null;
      const candidate = buildMetaLeadAdAutoCreateCandidate(submissionRow, mapping || {});
      const storedRow = await upsertSubmission(supabase, {
        ...submissionRow,
        mapping_status: candidate.mappingStatus,
        mapped_lead_kind: candidate.targetKind === 'standalone' ? null : candidate.targetKind
      });

      if (candidate.insertValues) {
        const table = candidate.targetKind === 'devis' ? 'devis_requests' : 'convention_requests';
        try {
          const insertedLead = await insertMappedLead(supabase, table, candidate.insertValues);
          await updateSubmission(supabase, storedRow.meta_leadgen_id, {
            mapping_status: 'mapped_created',
            mapped_lead_kind: candidate.targetKind,
            mapped_lead_id: insertedLead.id,
            auto_created_at: new Date().toISOString()
          });
          createdLeadCount += 1;
        } catch (error) {
          await updateSubmission(supabase, storedRow.meta_leadgen_id, {
            mapping_status: 'error',
            last_error: error?.message || 'lead_creation_failed'
          });
        }
      }

      importedCount += 1;
    }
  }

  await upsertGrowthSourceHealth(supabase, [{
    source_key: 'meta_lead_ads',
    source_label: 'Meta Lead Ads',
    connector_type: 'api',
    status: 'fresh',
    last_success_at: new Date().toISOString(),
    freshest_metric_date: new Date().toISOString().slice(0, 10),
    message: `${importedCount} Meta lead rows imported`,
    metadata: {
      formsScanned: forms.length,
      createdLeadCount
    }
  }]);

  console.log(JSON.stringify({
    importedCount,
    createdLeadCount,
    formsScanned: forms.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
