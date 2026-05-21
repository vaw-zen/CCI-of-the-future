import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import {
  buildMetaLeadAdAutoCreateCandidate,
  buildMetaLeadAdSubmissionRow,
  fetchMetaLeadAdDetails,
  normalizeMetaLeadWebhookEntries
} from '@/libs/metaLeadAds.mjs';
import {
  isMissingOptionalLeadOperationFieldError,
  isMissingOptionalLeadTrackingColumnError,
  withoutOptionalLeadOperationFields,
  withoutOptionalLeadTrackingFields
} from '@/libs/leadTrackingSchemaCompat.mjs';

export const dynamic = 'force-dynamic';

function jsonResponse(status, message, data = null, httpStatus = 200) {
  return NextResponse.json({
    status,
    message,
    data
  }, { status: httpStatus });
}

async function upsertMetaLeadAdSubmission(supabase, row = {}) {
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

async function updateMetaLeadAdSubmission(supabase, leadgenId, values = {}) {
  const { data, error } = await supabase
    .from('meta_lead_ad_submissions')
    .update(values)
    .eq('meta_leadgen_id', leadgenId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
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

async function maybeCreateMappedLead({
  supabase,
  submissionRow,
  mapping
} = {}) {
  const candidate = buildMetaLeadAdAutoCreateCandidate(submissionRow, mapping);
  if (!candidate.insertValues) {
    return {
      created: false,
      mappingStatus: candidate.mappingStatus,
      targetKind: candidate.targetKind,
      leadId: null
    };
  }

  const table = candidate.targetKind === 'devis' ? 'devis_requests' : 'convention_requests';
  const insertedLead = await insertMappedLead(supabase, table, candidate.insertValues);

  return {
    created: true,
    mappingStatus: 'mapped_created',
    targetKind: candidate.targetKind,
    leadId: insertedLead.id
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const verifyToken = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || '';

  if (mode === 'subscribe' && verifyToken && expectedToken && verifyToken === expectedToken) {
    return new NextResponse(challenge || '', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request) {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    return jsonResponse('config_error', 'Service de base de données non configuré.', null, 500);
  }

  const payload = await request.json().catch(() => ({}));
  const normalizedEntries = normalizeMetaLeadWebhookEntries(payload);

  if (normalizedEntries.length === 0) {
    return jsonResponse('success', 'Aucun lead Meta à traiter.', {
      processedCount: 0,
      entries: []
    });
  }

  const formIds = Array.from(new Set(
    normalizedEntries
      .map((entry) => entry.form_id)
      .filter(Boolean)
  ));
  const { data: mappingRows, error: mappingError } = formIds.length > 0
    ? await supabase
      .from('meta_lead_form_mappings')
      .select('*')
      .in('meta_form_id', formIds)
    : { data: [], error: null };

  if (mappingError) {
    return jsonResponse('database_error', 'Impossible de charger les mappings Meta.', null, 500);
  }

  const mappingLookup = new Map((mappingRows || []).map((row) => [row.meta_form_id, row]));
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN || '';
  const apiVersion = process.env.META_API_VERSION || process.env.FB_API_VERSION || 'v20.0';
  const processedEntries = [];
  const receivedAt = new Date().toISOString();

  for (const entry of normalizedEntries) {
    let rawLeadPayload = entry;
    let fetchErrorMessage = '';

    if (!Array.isArray(entry.field_data) && entry.leadgen_id && accessToken) {
      try {
        rawLeadPayload = {
          ...entry,
          ...(await fetchMetaLeadAdDetails({
            leadgenId: entry.leadgen_id,
            accessToken,
            apiVersion
          }))
        };
      } catch (error) {
        fetchErrorMessage = error?.message || 'meta_fetch_failed';
      }
    }

    const baseRow = buildMetaLeadAdSubmissionRow(rawLeadPayload, {
      receivedAt
    });
    const mapping = mappingLookup.get(baseRow.meta_form_id) || null;
    const candidate = buildMetaLeadAdAutoCreateCandidate(baseRow, mapping || {});
    const submissionRow = {
      ...baseRow,
      mapping_status: fetchErrorMessage
        ? 'fetch_pending'
        : candidate.mappingStatus,
      mapped_lead_kind: candidate.targetKind === 'standalone' ? null : candidate.targetKind,
      last_error: fetchErrorMessage || null
    };

    const storedRow = await upsertMetaLeadAdSubmission(supabase, submissionRow);
    let leadResult = {
      created: false,
      leadId: null,
      targetKind: candidate.targetKind,
      mappingStatus: submissionRow.mapping_status
    };

    if (!fetchErrorMessage) {
      try {
        leadResult = await maybeCreateMappedLead({
          supabase,
          submissionRow: storedRow,
          mapping
        });

        if (leadResult.created) {
          await updateMetaLeadAdSubmission(supabase, storedRow.meta_leadgen_id, {
            mapping_status: leadResult.mappingStatus,
            mapped_lead_kind: leadResult.targetKind,
            mapped_lead_id: leadResult.leadId,
            auto_created_at: receivedAt
          });
        }
      } catch (error) {
        leadResult = {
          created: false,
          leadId: null,
          targetKind: candidate.targetKind,
          mappingStatus: 'error',
          error: error?.message || 'lead_creation_failed'
        };
        await updateMetaLeadAdSubmission(supabase, storedRow.meta_leadgen_id, {
          mapping_status: 'error',
          last_error: leadResult.error
        });
      }
    }

    processedEntries.push({
      metaLeadgenId: storedRow.meta_leadgen_id,
      metaFormId: storedRow.meta_form_id,
      mappingStatus: leadResult.mappingStatus,
      mappedLeadKind: leadResult.targetKind,
      mappedLeadId: leadResult.leadId,
      createdLead: leadResult.created,
      fetchError: fetchErrorMessage || undefined
    });
  }

  return jsonResponse('success', 'Leads Meta traités.', {
    processedCount: processedEntries.length,
    createdLeadCount: processedEntries.filter((entry) => entry.createdLead).length,
    entries: processedEntries
  });
}
