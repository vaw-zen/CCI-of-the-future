import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { createServiceClient } from '@/libs/supabase';
import {
  buildWhatsAppDirectLeadInsert,
  isMissingWhatsAppDirectLeadIntentFieldError,
  isMissingWhatsAppDirectLeadSchemaError,
  WHATSAPP_DIRECT_INTENT_MIGRATION_HINT,
  WHATSAPP_DIRECT_LEAD_MIGRATION_HINT,
  WHATSAPP_DIRECT_LEAD_SELECT_FIELDS,
  WHATSAPP_DIRECT_LEAD_TABLE
} from '@/libs/whatsappDirectLeads.mjs';
import {
  buildUnclaimedWhatsAppIntents,
  collectClaimedWhatsAppClickIds,
  WHATSAPP_INTENT_SELECT_FIELDS
} from '@/libs/whatsappIntents.mjs';
import {
  getClientIp,
  guardMutationRequest,
  rateLimitRequest
} from '@/libs/security';
import {
  isMissingOptionalLeadTrackingColumnError,
  runLeadSelectWithOptionalTrackingFallback,
  WHATSAPP_TRACKING_MIGRATION_HINT
} from '@/libs/leadTrackingSchemaCompat.mjs';
import {
  filterTrackedWhatsAppClicks,
  shouldTrackWhatsAppClick
} from '@/libs/whatsappAttribution.mjs';

export const dynamic = 'force-dynamic';

const ADMIN_WHATSAPP_INTENTS_LIST_RATE_LIMIT = {
  scope: 'admin-whatsapp-intents-list',
  limit: 60,
  windowMs: 60 * 1000
};

const ADMIN_WHATSAPP_INTENTS_CONVERT_RATE_LIMIT = {
  scope: 'admin-whatsapp-intents-convert',
  limit: 20,
  windowMs: 60 * 1000
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_INTENT_LIMIT = 50;
const MAX_INTENT_QUERY_BATCHES = 12;

function getErrorResponse(status, message, httpStatus) {
  return NextResponse.json({
    status,
    message,
    data: null,
    details: {
      failureType: status
    }
  }, { status: httpStatus });
}

function getSafeLimit(value, fallback = DEFAULT_INTENT_LIMIT) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(1, Math.min(200, Math.round(numericValue)));
}

function getSafeCursor(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(0, Math.round(numericValue));
}

function normalizeIntentTimestamp(value, { endOfDay = false } = {}) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return `${text}${endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z'}`;
  }

  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString();
}

function isMissingWhatsAppClickSchemaError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();

  return (
    error?.code === '42P01'
    || (message.includes('whatsapp_click_events') && (message.includes('does not exist') || message.includes('schema cache')))
  );
}

async function fetchDirectLeadById(supabase, leadId) {
  return runLeadSelectWithOptionalTrackingFallback({
    supabase,
    table: WHATSAPP_DIRECT_LEAD_TABLE,
    select: WHATSAPP_DIRECT_LEAD_SELECT_FIELDS,
    channel: 'admin-whatsapp-intents',
    applyQuery: (query) => query
      .eq('id', leadId)
      .single()
  });
}

async function fetchClaimedClickIds(supabase, clickIds = []) {
  if (!Array.isArray(clickIds) || clickIds.length === 0) {
    return { claimedIds: new Set(), error: null, missingHint: null };
  }

  const [devisResult, conventionResult, whatsappResult] = await Promise.all([
    supabase
      .from('devis_requests')
      .select('whatsapp_click_id')
      .in('whatsapp_click_id', clickIds),
    supabase
      .from('convention_requests')
      .select('whatsapp_click_id')
      .in('whatsapp_click_id', clickIds),
    supabase
      .from(WHATSAPP_DIRECT_LEAD_TABLE)
      .select('whatsapp_click_id')
      .in('whatsapp_click_id', clickIds)
  ]);

  if (devisResult.error) {
    if (isMissingOptionalLeadTrackingColumnError(devisResult.error)) {
      return { claimedIds: new Set(), error: devisResult.error, missingHint: WHATSAPP_TRACKING_MIGRATION_HINT };
    }

    return { claimedIds: new Set(), error: devisResult.error, missingHint: null };
  }

  if (conventionResult.error) {
    if (isMissingOptionalLeadTrackingColumnError(conventionResult.error)) {
      return { claimedIds: new Set(), error: conventionResult.error, missingHint: WHATSAPP_TRACKING_MIGRATION_HINT };
    }

    return { claimedIds: new Set(), error: conventionResult.error, missingHint: null };
  }

  if (whatsappResult.error) {
    if (isMissingWhatsAppDirectLeadIntentFieldError(whatsappResult.error)) {
      return { claimedIds: new Set(), error: whatsappResult.error, missingHint: WHATSAPP_DIRECT_INTENT_MIGRATION_HINT };
    }

    if (isMissingWhatsAppDirectLeadSchemaError(whatsappResult.error)) {
      return { claimedIds: new Set(), error: whatsappResult.error, missingHint: WHATSAPP_DIRECT_LEAD_MIGRATION_HINT };
    }

    return { claimedIds: new Set(), error: whatsappResult.error, missingHint: null };
  }

  return {
    claimedIds: collectClaimedWhatsAppClickIds(
      devisResult.data || [],
      conventionResult.data || [],
      whatsappResult.data || []
    ),
    error: null,
    missingHint: null
  };
}

async function fetchWhatsAppIntentPage(supabase, {
  cursor = 0,
  limit = DEFAULT_INTENT_LIMIT,
  clickedAtFrom = '',
  clickedAtTo = ''
} = {}) {
  const batchSize = Math.min(Math.max(limit * 2, 50), 200);
  const visibleRows = [];
  let rawCursor = getSafeCursor(cursor);
  let nextCursor = null;
  let hasMore = false;

  for (let batchIndex = 0; batchIndex < MAX_INTENT_QUERY_BATCHES; batchIndex += 1) {
    let clickQuery = supabase
      .from('whatsapp_click_events')
      .select(WHATSAPP_INTENT_SELECT_FIELDS)
      .order('clicked_at', { ascending: false })
      .order('id', { ascending: false })
      .range(rawCursor, rawCursor + batchSize - 1);

    if (clickedAtFrom) {
      clickQuery = clickQuery.gte('clicked_at', clickedAtFrom);
    }

    if (clickedAtTo) {
      clickQuery = clickQuery.lte('clicked_at', clickedAtTo);
    }

    const { data: clickRows, error: clickError } = await clickQuery;
    if (clickError) {
      return {
        rows: [],
        nextCursor: null,
        hasMore: false,
        error: clickError,
        missingHint: null
      };
    }

    const batchRows = clickRows || [];
    if (batchRows.length === 0) {
      break;
    }

    const filteredClickRows = filterTrackedWhatsAppClicks(batchRows);
    const clickIds = filteredClickRows.map((row) => row.id).filter(Boolean);
    const claimedResult = await fetchClaimedClickIds(supabase, clickIds);
    if (claimedResult.error) {
      return {
        rows: [],
        nextCursor: null,
        hasMore: false,
        error: claimedResult.error,
        missingHint: claimedResult.missingHint
      };
    }

    const batchIntents = buildUnclaimedWhatsAppIntents(filteredClickRows, claimedResult.claimedIds);
    const batchIntentMap = new Map(batchIntents.map((intent) => [intent.id, intent]));

    for (let index = 0; index < batchRows.length; index += 1) {
      const row = batchRows[index];
      const intent = batchIntentMap.get(row.id);
      if (!intent) {
        continue;
      }

      visibleRows.push(intent);

      if (visibleRows.length === limit) {
        nextCursor = String(rawCursor + index + 1);
      }

      if (visibleRows.length > limit) {
        hasMore = true;
        return {
          rows: visibleRows.slice(0, limit),
          nextCursor,
          hasMore,
          error: null,
          missingHint: null
        };
      }
    }

    rawCursor += batchRows.length;

    if (batchRows.length < batchSize) {
      break;
    }
  }

  return {
    rows: visibleRows.slice(0, limit),
    nextCursor: hasMore ? nextCursor : null,
    hasMore,
    error: null,
    missingHint: null
  };
}

export async function GET(request) {
  const rateLimitResponse = rateLimitRequest(request, ADMIN_WHATSAPP_INTENTS_LIST_RATE_LIMIT);
  if (rateLimitResponse) {
    console.warn('[admin][whatsapp-intents] list request rate limited:', {
      path: request.nextUrl?.pathname,
      ip: getClientIp(request)
    });
    return rateLimitResponse;
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    return getErrorResponse('config_error', 'Service de base de données non configuré.', 500);
  }

  const authResult = await authenticateAdminRequest(request, supabase);
  if (authResult.error) {
    return getErrorResponse(authResult.error, 'Accès administrateur requis.', authResult.status);
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = getSafeLimit(searchParams.get('limit'));
  const cursor = getSafeCursor(searchParams.get('cursor'));
  const dateFrom = normalizeIntentTimestamp(searchParams.get('dateFrom') || '', { endOfDay: false });
  const dateTo = normalizeIntentTimestamp(searchParams.get('dateTo') || '', { endOfDay: true });

  try {
    const pageResult = await fetchWhatsAppIntentPage(supabase, {
      cursor,
      limit,
      clickedAtFrom: dateFrom,
      clickedAtTo: dateTo
    });

    if (pageResult.error) {
      if (isMissingWhatsAppClickSchemaError(pageResult.error)) {
        return getErrorResponse(
          'schema_missing',
          `Le tracking des clics WhatsApp n’est pas encore appliqué. ${WHATSAPP_TRACKING_MIGRATION_HINT}`,
          409
        );
      }

      if (pageResult.missingHint) {
        return getErrorResponse(
          'schema_missing',
          `Le rattachement des intentions WhatsApp n’est pas encore appliqué. ${pageResult.missingHint}`,
          409
        );
      }

      console.error('[admin][whatsapp-intents] page fetch failed:', pageResult.error);
      return getErrorResponse('fetch_failed', 'Impossible de charger les intentions WhatsApp.', 500);
    }

    return NextResponse.json({
      status: 'success',
      data: pageResult.rows,
      details: {
        cursor: String(cursor),
        nextCursor: pageResult.nextCursor,
        hasMore: pageResult.hasMore,
        limit,
        returnedCount: pageResult.rows.length
      }
    });
  } catch (error) {
    console.error('[admin][whatsapp-intents] list unexpected error:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors du chargement des intentions WhatsApp.', 500);
  }
}

export async function POST(request) {
  const guardResponse = guardMutationRequest(request, ADMIN_WHATSAPP_INTENTS_CONVERT_RATE_LIMIT);
  if (guardResponse) {
    console.warn('[admin][whatsapp-intents] convert request blocked:', {
      path: request.nextUrl?.pathname,
      ip: getClientIp(request),
      status: guardResponse.status
    });
    return guardResponse;
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    return getErrorResponse('config_error', 'Service de base de données non configuré.', 500);
  }

  const authResult = await authenticateAdminRequest(request, supabase);
  if (authResult.error) {
    return getErrorResponse(authResult.error, 'Accès administrateur requis.', authResult.status);
  }

  const body = await request.json().catch(() => null);
  const clickId = String(body?.clickId || body?.click_id || '').trim();

  if (!UUID_PATTERN.test(clickId)) {
    return getErrorResponse('invalid_click_id', 'Identifiant de clic WhatsApp invalide.', 400);
  }

  try {
    const { data: clickRow, error: clickError } = await supabase
      .from('whatsapp_click_events')
      .select(WHATSAPP_INTENT_SELECT_FIELDS)
      .eq('id', clickId)
      .single();

    if (clickError || !clickRow) {
      if (isMissingWhatsAppClickSchemaError(clickError)) {
        return getErrorResponse(
          'schema_missing',
          `Le tracking des clics WhatsApp n’est pas encore appliqué. ${WHATSAPP_TRACKING_MIGRATION_HINT}`,
          409
        );
      }

      return getErrorResponse('not_found', 'Clic WhatsApp introuvable.', 404);
    }

    if (!shouldTrackWhatsAppClick(clickRow)) {
      return getErrorResponse('admin_click_ignored', 'Ce clic WhatsApp provient de l’interface admin et ne peut pas être converti en lead.', 409);
    }

    const claimedResult = await fetchClaimedClickIds(supabase, [clickId]);
    if (claimedResult.error) {
      if (claimedResult.missingHint) {
        return getErrorResponse(
          'schema_missing',
          `Le rattachement des intentions WhatsApp n’est pas encore appliqué. ${claimedResult.missingHint}`,
          409
        );
      }

      console.error('[admin][whatsapp-intents] claim check failed:', claimedResult.error);
      return getErrorResponse('fetch_failed', 'Impossible de vérifier le clic WhatsApp.', 500);
    }

    if (claimedResult.claimedIds.has(clickId)) {
      return getErrorResponse('already_claimed', 'Ce clic WhatsApp est déjà rattaché à un lead.', 409);
    }

    const insertResult = buildWhatsAppDirectLeadInsert({
      ...body,
      leadCapturedAt: body?.leadCapturedAt || body?.lead_captured_at || clickRow.clicked_at,
      sessionSource: clickRow.session_source,
      sessionMedium: clickRow.session_medium,
      sessionCampaign: clickRow.session_campaign,
      referrerHost: clickRow.referrer_host,
      landingPage: clickRow.landing_page,
      entryPath: clickRow.page_path,
      whatsappClickId: clickRow.id,
      whatsappClickedAt: clickRow.clicked_at,
      whatsappClickLabel: clickRow.event_label,
      whatsappClickPage: clickRow.page_path
    }, new Date().toISOString());

    if (!insertResult.ok) {
      return getErrorResponse(insertResult.error, insertResult.message, 400);
    }

    const { data: insertedLead, error: insertError } = await supabase
      .from(WHATSAPP_DIRECT_LEAD_TABLE)
      .insert(insertResult.data)
      .select('id')
      .single();

    if (insertError || !insertedLead?.id) {
      if (isMissingWhatsAppDirectLeadIntentFieldError(insertError)) {
        return getErrorResponse(
          'schema_missing',
          `Le rattachement des intentions WhatsApp n’est pas encore appliqué. ${WHATSAPP_DIRECT_INTENT_MIGRATION_HINT}`,
          409
        );
      }

      if (isMissingWhatsAppDirectLeadSchemaError(insertError)) {
        return getErrorResponse(
          'schema_missing',
          `Le schéma WhatsApp direct n’est pas encore appliqué. ${WHATSAPP_DIRECT_LEAD_MIGRATION_HINT}`,
          409
        );
      }

      if (insertError?.code === '23505') {
        return getErrorResponse('already_claimed', 'Ce clic WhatsApp est déjà rattaché à un lead.', 409);
      }

      console.error('[admin][whatsapp-intents] convert failed:', insertError);
      return getErrorResponse('create_failed', 'Impossible de convertir cette intention WhatsApp en lead.', 500);
    }

    const { data: createdLead, error: fetchLeadError } = await fetchDirectLeadById(supabase, insertedLead.id);
    if (fetchLeadError || !createdLead) {
      console.error('[admin][whatsapp-intents] fetch after convert failed:', fetchLeadError);
      return getErrorResponse('fetch_failed', 'Lead WhatsApp créé mais impossible à relire.', 500);
    }

    return NextResponse.json({
      status: 'success',
      data: createdLead
    });
  } catch (error) {
    console.error('[admin][whatsapp-intents] convert unexpected error:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors de la conversion de l’intention WhatsApp.', 500);
  }
}
