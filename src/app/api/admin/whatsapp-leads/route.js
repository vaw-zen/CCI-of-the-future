import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { createServiceClient } from '@/libs/supabase';
import {
  buildWhatsAppDirectLeadInsert,
  isMissingWhatsAppDirectLeadSchemaError,
  WHATSAPP_DIRECT_LEAD_MIGRATION_HINT,
  WHATSAPP_DIRECT_LEAD_SELECT_FIELDS,
  WHATSAPP_DIRECT_LEAD_TABLE
} from '@/libs/whatsappDirectLeads.mjs';
import {
  getClientIp,
  guardMutationRequest,
  rateLimitRequest
} from '@/libs/security';

export const dynamic = 'force-dynamic';

const ADMIN_WHATSAPP_LIST_RATE_LIMIT = {
  scope: 'admin-whatsapp-leads-list',
  limit: 60,
  windowMs: 60 * 1000
};

const ADMIN_WHATSAPP_CREATE_RATE_LIMIT = {
  scope: 'admin-whatsapp-leads-create',
  limit: 30,
  windowMs: 60 * 1000
};

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

function getSafeLimit(value, fallback = 200) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(1, Math.min(500, Math.round(numericValue)));
}

export async function GET(request) {
  const rateLimitResponse = rateLimitRequest(request, ADMIN_WHATSAPP_LIST_RATE_LIMIT);
  if (rateLimitResponse) {
    console.warn('[admin][whatsapp-leads] list request rate limited:', {
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
  const leadId = searchParams.get('leadId') || '';
  const businessLine = searchParams.get('businessLine') || '';
  const leadStatus = searchParams.get('leadStatus') || '';
  const phone = searchParams.get('phone') || '';
  const leadOwner = searchParams.get('leadOwner') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const limit = getSafeLimit(searchParams.get('limit'));

  try {
    let query = supabase
      .from(WHATSAPP_DIRECT_LEAD_TABLE)
      .select(WHATSAPP_DIRECT_LEAD_SELECT_FIELDS)
      .order('lead_captured_at', { ascending: false })
      .limit(limit);

    if (leadId) {
      query = query.eq('id', leadId);
    }

    if (businessLine) {
      query = query.eq('business_line', businessLine);
    }

    if (leadStatus) {
      query = query.eq('lead_status', leadStatus);
    }

    if (phone.trim()) {
      query = query.ilike('telephone', `%${phone.trim()}%`);
    }

    if (leadOwner.trim()) {
      query = query.ilike('lead_owner', `%${leadOwner.trim()}%`);
    }

    if (dateFrom) {
      query = query.gte('lead_captured_at', `${dateFrom}T00:00:00.000Z`);
    }

    if (dateTo) {
      query = query.lte('lead_captured_at', `${dateTo}T23:59:59.999Z`);
    }

    const { data, error } = await query;

    if (error) {
      if (isMissingWhatsAppDirectLeadSchemaError(error)) {
        return getErrorResponse(
          'schema_missing',
          `Le schéma WhatsApp direct n’est pas encore appliqué. ${WHATSAPP_DIRECT_LEAD_MIGRATION_HINT}`,
          409
        );
      }
      console.error('[admin][whatsapp-leads] list failed:', error);
      return getErrorResponse('fetch_failed', 'Impossible de charger les leads WhatsApp.', 500);
    }

    return NextResponse.json({
      status: 'success',
      data: data || []
    });
  } catch (error) {
    console.error('[admin][whatsapp-leads] list unexpected error:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors du chargement des leads WhatsApp.', 500);
  }
}

export async function POST(request) {
  const guardResponse = guardMutationRequest(request, ADMIN_WHATSAPP_CREATE_RATE_LIMIT);
  if (guardResponse) {
    console.warn('[admin][whatsapp-leads] create request blocked:', {
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
  const insertResult = buildWhatsAppDirectLeadInsert(body, new Date().toISOString());
  if (!insertResult.ok) {
    return getErrorResponse(insertResult.error, insertResult.message, 400);
  }

  try {
    const { data, error } = await supabase
      .from(WHATSAPP_DIRECT_LEAD_TABLE)
      .insert(insertResult.data)
      .select(WHATSAPP_DIRECT_LEAD_SELECT_FIELDS)
      .single();

    if (error || !data) {
      if (isMissingWhatsAppDirectLeadSchemaError(error)) {
        return getErrorResponse(
          'schema_missing',
          `Le schéma WhatsApp direct n’est pas encore appliqué. ${WHATSAPP_DIRECT_LEAD_MIGRATION_HINT}`,
          409
        );
      }
      console.error('[admin][whatsapp-leads] create failed:', error);
      return getErrorResponse('create_failed', 'Impossible de créer le lead WhatsApp.', 500);
    }

    return NextResponse.json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('[admin][whatsapp-leads] create unexpected error:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors de la création du lead WhatsApp.', 500);
  }
}
