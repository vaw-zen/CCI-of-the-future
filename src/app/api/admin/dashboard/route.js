import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { createServiceClient } from '@/libs/supabase';
import { getClientIp, rateLimitRequest } from '@/libs/security';
import { buildAdminDashboardData, getDashboardRange } from '@/libs/adminDashboardMetrics.mjs';

export const dynamic = 'force-dynamic';

const ADMIN_DASHBOARD_RATE_LIMIT = {
  scope: 'admin-dashboard',
  limit: 60,
  windowMs: 60 * 1000
};

const DASHBOARD_SELECT_FIELDS = {
  devis: [
    'id',
    'created_at',
    'type_service',
    'lead_status',
    'submitted_at',
    'qualified_at',
    'closed_at',
    'landing_page',
    'session_source',
    'session_medium',
    'session_campaign',
    'referrer_host',
    'entry_path',
    'selected_services'
  ].join(','),
  convention: [
    'id',
    'created_at',
    'secteur_activite',
    'services_souhaites',
    'statut',
    'lead_status',
    'submitted_at',
    'qualified_at',
    'closed_at',
    'landing_page',
    'session_source',
    'session_medium',
    'session_campaign',
    'referrer_host',
    'entry_path',
    'selected_services'
  ].join(',')
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

async function fetchLeadRows(supabase, range) {
  const [devisResult, conventionResult] = await Promise.all([
    supabase
      .from('devis_requests')
      .select(DASHBOARD_SELECT_FIELDS.devis)
      .gte('created_at', range.fromIso)
      .lte('created_at', range.toIso)
      .order('created_at', { ascending: true }),
    supabase
      .from('convention_requests')
      .select(DASHBOARD_SELECT_FIELDS.convention)
      .gte('created_at', range.fromIso)
      .lte('created_at', range.toIso)
      .order('created_at', { ascending: true })
  ]);

  if (devisResult.error) {
    throw devisResult.error;
  }

  if (conventionResult.error) {
    throw conventionResult.error;
  }

  return {
    devis: devisResult.data || [],
    conventions: conventionResult.data || []
  };
}

async function fetchAllLeadRows(supabase) {
  const [devisResult, conventionResult] = await Promise.all([
    supabase
      .from('devis_requests')
      .select(DASHBOARD_SELECT_FIELDS.devis)
      .order('created_at', { ascending: true }),
    supabase
      .from('convention_requests')
      .select(DASHBOARD_SELECT_FIELDS.convention)
      .order('created_at', { ascending: true })
  ]);

  if (devisResult.error) {
    throw devisResult.error;
  }

  if (conventionResult.error) {
    throw conventionResult.error;
  }

  return {
    devis: devisResult.data || [],
    conventions: conventionResult.data || []
  };
}

async function fetchAuditEvents(supabase) {
  const { data, error } = await supabase
    .from('admin_lead_status_events')
    .select([
      'id',
      'created_at',
      'lead_kind',
      'lead_id',
      'previous_status',
      'next_status',
      'previous_operational_status',
      'next_operational_status',
      'action_result',
      'rejection_reason'
    ].join(','))
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return data || [];
}

async function fetchExternalMetricRows(supabase, range) {
  const { data, error } = await supabase
    .from('growth_channel_daily_metrics')
    .select([
      'metric_date',
      'metric_source',
      'source',
      'medium',
      'campaign',
      'landing_page',
      'sessions',
      'users',
      'clicks',
      'impressions',
      'spend',
      'metadata'
    ].join(','))
    .gte('metric_date', range.from)
    .lte('metric_date', range.to)
    .order('metric_date', { ascending: true });

  if (error) {
    return {
      rows: [],
      error
    };
  }

  return {
    rows: data || [],
    error: null
  };
}

async function fetchGrowthSourceHealth(supabase) {
  const { data, error } = await supabase
    .from('growth_reporting_source_health')
    .select([
      'source_key',
      'source_label',
      'connector_type',
      'status',
      'last_attempt_at',
      'last_success_at',
      'freshest_metric_date',
      'message',
      'last_error',
      'metadata'
    ].join(','));

  if (error) {
    return {
      rows: [],
      error
    };
  }

  return {
    rows: data || [],
    error: null
  };
}

export async function GET(request) {
  const rateLimitResponse = rateLimitRequest(request, ADMIN_DASHBOARD_RATE_LIMIT);
  if (rateLimitResponse) {
    console.warn('[admin][dashboard] rate limited request:', {
      path: request.nextUrl?.pathname,
      ip: getClientIp(request)
    });
    return rateLimitResponse;
  }

  const { searchParams } = new URL(request.url);
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    return getErrorResponse('config_error', 'Service de base de données non configuré.', 500);
  }

  const authResult = await authenticateAdminRequest(request, supabase);
  if (authResult.error) {
    console.warn('[admin][dashboard] blocked request:', {
      reason: authResult.error,
      path: request.nextUrl?.pathname
    });
    return getErrorResponse(authResult.error, 'Accès administrateur requis.', authResult.status);
  }

  const rangeResult = getDashboardRange({
    from: searchParams.get('from'),
    to: searchParams.get('to')
  });
  if (!rangeResult.ok) {
    return getErrorResponse(rangeResult.error, rangeResult.message, 400);
  }

  try {
    const [currentRows, previousRows, universeRows, auditEvents, externalMetricsResult, sourceHealthResult] = await Promise.all([
      fetchLeadRows(supabase, rangeResult.range),
      fetchLeadRows(supabase, rangeResult.previousRange),
      fetchAllLeadRows(supabase),
      fetchAuditEvents(supabase),
      fetchExternalMetricRows(supabase, rangeResult.range),
      fetchGrowthSourceHealth(supabase)
    ]);

    return NextResponse.json({
      status: 'success',
      message: 'Dashboard KPI chargé.',
      data: buildAdminDashboardData({
        currentRows,
        previousRows,
        universeRows,
        externalMetricRows: externalMetricsResult.rows,
        sourceHealthRows: sourceHealthResult.rows,
        auditEvents,
        range: rangeResult.range,
        nowIso: new Date().toISOString()
      }),
      details: {
        piiExcluded: true,
        reportingWarnings: [
          externalMetricsResult.error ? 'growth_channel_daily_metrics_unavailable' : null,
          sourceHealthResult.error ? 'growth_reporting_source_health_unavailable' : null
        ].filter(Boolean)
      }
    });
  } catch (error) {
    console.error('[admin][dashboard] load failed:', error);
    return getErrorResponse('dashboard_load_failed', 'Impossible de charger les KPI admin.', 500);
  }
}
