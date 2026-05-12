import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { createServiceClient } from '@/libs/supabase';
import { getClientIp, rateLimitRequest } from '@/libs/security';
import {
  applyAdminLeadListFilters,
  getAdminLeadConfig,
  getSafeAdminLeadCursor,
  getSafeAdminLeadLimit,
  isMissingAdminLeadSchemaError,
  runAdminLeadSelect
} from '@/libs/adminLeadReads.mjs';

export const dynamic = 'force-dynamic';

const ADMIN_LEADS_LIST_RATE_LIMIT = {
  scope: 'admin-leads-list',
  limit: 60,
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

export async function GET(request) {
  const rateLimitResponse = rateLimitRequest(request, ADMIN_LEADS_LIST_RATE_LIMIT);
  if (rateLimitResponse) {
    console.warn('[admin][leads] list request rate limited:', {
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
  const kind = searchParams.get('kind') || '';
  const config = getAdminLeadConfig(kind);

  if (!config) {
    return getErrorResponse('invalid_kind', 'Type de lead invalide.', 400);
  }

  const limit = getSafeAdminLeadLimit(searchParams.get('limit'));
  const cursor = getSafeAdminLeadCursor(searchParams.get('cursor'));
  const filters = {
    leadStatus: searchParams.get('leadStatus') || '',
    leadQualityOutcome: searchParams.get('leadQualityOutcome') || '',
    serviceType: searchParams.get('serviceType') || '',
    operationalStatus: searchParams.get('operationalStatus') || '',
    sector: searchParams.get('sector') || '',
    businessLine: searchParams.get('businessLine') || '',
    scheduledType: searchParams.get('scheduledType') || '',
    leadOwner: searchParams.get('leadOwner') || '',
    sessionSource: searchParams.get('sessionSource') || '',
    sessionMedium: searchParams.get('sessionMedium') || '',
    phone: searchParams.get('phone') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || ''
  };

  try {
    const { data, error } = await runAdminLeadSelect({
      supabase,
      kind,
      select: config.summarySelect,
      channel: 'admin-leads',
      applyQuery: (query) => {
        const filteredQuery = applyAdminLeadListFilters(kind, query, filters);

        return filteredQuery
          .order(config.listOrderColumn, { ascending: false })
          .order('id', { ascending: false })
          .range(cursor, cursor + limit);
      }
    });

    if (error) {
      if (isMissingAdminLeadSchemaError(kind, error)) {
        return getErrorResponse('schema_missing', 'Le schéma demandé n’est pas encore appliqué sur cette base.', 409);
      }

      console.error('[admin][leads] list failed:', error);
      return getErrorResponse('fetch_failed', 'Impossible de charger les leads.', 500);
    }

    const rows = Array.isArray(data) ? data : [];
    const hasMore = rows.length > limit;
    const nextCursor = hasMore ? String(cursor + limit) : null;

    return NextResponse.json({
      status: 'success',
      data: rows.slice(0, limit),
      details: {
        kind,
        limit,
        cursor: String(cursor),
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    console.error('[admin][leads] list unexpected error:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors du chargement des leads.', 500);
  }
}
