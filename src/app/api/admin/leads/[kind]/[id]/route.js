import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { createServiceClient } from '@/libs/supabase';
import { getClientIp, rateLimitRequest } from '@/libs/security';
import {
  getAdminLeadConfig,
  isMissingAdminLeadSchemaError,
  runAdminLeadSelect
} from '@/libs/adminLeadReads.mjs';

export const dynamic = 'force-dynamic';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ADMIN_LEAD_DETAIL_RATE_LIMIT = {
  scope: 'admin-lead-detail',
  limit: 90,
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

export async function GET(request, { params }) {
  const rateLimitResponse = rateLimitRequest(request, ADMIN_LEAD_DETAIL_RATE_LIMIT);
  if (rateLimitResponse) {
    console.warn('[admin][lead-detail] request rate limited:', {
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

  const { kind, id } = await params;
  const config = getAdminLeadConfig(kind);

  if (!config || !UUID_PATTERN.test(id || '')) {
    return getErrorResponse('invalid_request', 'Type de lead ou identifiant invalide.', 400);
  }

  try {
    const { data, error } = await runAdminLeadSelect({
      supabase,
      kind,
      select: config.detailSelect,
      channel: 'admin-lead-detail',
      applyQuery: (query) => query.eq('id', id).single()
    });

    if (error || !data) {
      if (isMissingAdminLeadSchemaError(kind, error)) {
        return getErrorResponse('schema_missing', 'Le schéma demandé n’est pas encore appliqué sur cette base.', 409);
      }

      console.error('[admin][lead-detail] fetch failed:', error);
      return getErrorResponse('fetch_failed', 'Impossible de charger le détail du lead.', 500);
    }

    return NextResponse.json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('[admin][lead-detail] unexpected error:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors du chargement du détail du lead.', 500);
  }
}
