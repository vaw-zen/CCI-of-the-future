import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { createServiceClient } from '@/libs/supabase';
import { getClientIp, rateLimitRequest } from '@/libs/security';
import { buildAdminDashboardData, getDashboardRange } from '@/libs/adminDashboardMetrics.mjs';
import { fetchGrowthKeywordCatalogRows } from '@/libs/growthKeywordCatalog.mjs';
import { runLeadSelectWithOptionalTrackingFallback } from '@/libs/leadTrackingSchemaCompat.mjs';

export const dynamic = 'force-dynamic';

const ADMIN_DASHBOARD_RATE_LIMIT = {
  scope: 'admin-dashboard',
  limit: 60,
  windowMs: 60 * 1000
};
const NORMALIZED_EXTERNAL_METRIC_VIEW = 'growth_channel_daily_metrics_normalized';
const NORMALIZED_EXTERNAL_METRIC_VIEW_WARNINGS = new Set();
const GROWTH_QUERY_METRIC_WARNINGS = new Set();

const DASHBOARD_SELECT_FIELDS = {
  devis: [
    'id',
    'created_at',
    'type_service',
    'calculator_estimate',
    'lead_status',
    'lead_quality_outcome',
    'lead_owner',
    'submitted_at',
    'qualified_at',
    'closed_at',
    'follow_up_sla_at',
    'last_worked_at',
    'landing_page',
    'session_source',
    'session_medium',
    'session_campaign',
    'referrer_host',
    'entry_path',
    'selected_services',
    'whatsapp_click_id',
    'whatsapp_clicked_at',
    'whatsapp_click_label',
    'whatsapp_click_page',
    'whatsapp_manual_tag',
    'whatsapp_manual_tagged_at'
  ].join(','),
  convention: [
    'id',
    'created_at',
    'secteur_activite',
    'services_souhaites',
    'statut',
    'calculator_estimate',
    'lead_status',
    'lead_quality_outcome',
    'lead_owner',
    'submitted_at',
    'qualified_at',
    'closed_at',
    'follow_up_sla_at',
    'last_worked_at',
    'landing_page',
    'session_source',
    'session_medium',
    'session_campaign',
    'referrer_host',
    'entry_path',
    'selected_services',
    'whatsapp_click_id',
    'whatsapp_clicked_at',
    'whatsapp_click_label',
    'whatsapp_click_page',
    'whatsapp_manual_tag',
    'whatsapp_manual_tagged_at'
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

async function runLeadSelectWithFallback({ supabase, table, select, applyQuery }) {
  return runLeadSelectWithOptionalTrackingFallback({
    supabase,
    table,
    select,
    applyQuery,
    channel: 'dashboard'
  });
}

async function fetchLeadRows(supabase, range) {
  const [devisResult, conventionResult] = await Promise.all([
    runLeadSelectWithFallback({
      supabase,
      table: 'devis_requests',
      select: DASHBOARD_SELECT_FIELDS.devis,
      applyQuery: (query) => query
        .gte('created_at', range.fromIso)
        .lte('created_at', range.toIso)
        .order('created_at', { ascending: true })
    }),
    runLeadSelectWithFallback({
      supabase,
      table: 'convention_requests',
      select: DASHBOARD_SELECT_FIELDS.convention,
      applyQuery: (query) => query
        .gte('created_at', range.fromIso)
        .lte('created_at', range.toIso)
        .order('created_at', { ascending: true })
    })
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
    runLeadSelectWithFallback({
      supabase,
      table: 'devis_requests',
      select: DASHBOARD_SELECT_FIELDS.devis,
      applyQuery: (query) => query.order('created_at', { ascending: true })
    }),
    runLeadSelectWithFallback({
      supabase,
      table: 'convention_requests',
      select: DASHBOARD_SELECT_FIELDS.convention,
      applyQuery: (query) => query.order('created_at', { ascending: true })
    })
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
  const normalizedSelect = [
    'metric_date',
    'metric_source',
    'source',
    'medium',
    'campaign',
    'landing_page',
    'normalized_source',
    'normalized_medium',
    'normalized_campaign',
    'normalized_landing_page',
    'source_class',
    'page_type',
    'sessions',
    'users',
    'clicks',
    'impressions',
    'spend',
    'metadata'
  ].join(',');
  const rawSelect = [
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
  ].join(',');

  const normalizedResult = await supabase
    .from(NORMALIZED_EXTERNAL_METRIC_VIEW)
    .select(normalizedSelect)
    .gte('metric_date', range.from)
    .lte('metric_date', range.to)
    .order('metric_date', { ascending: true });

  if (!normalizedResult.error) {
    return {
      rows: normalizedResult.data || [],
      error: null
    };
  }

  if (!NORMALIZED_EXTERNAL_METRIC_VIEW_WARNINGS.has(NORMALIZED_EXTERNAL_METRIC_VIEW)) {
    NORMALIZED_EXTERNAL_METRIC_VIEW_WARNINGS.add(NORMALIZED_EXTERNAL_METRIC_VIEW);
    console.warn(
      `[admin][dashboard] falling back to raw growth metrics because ${NORMALIZED_EXTERNAL_METRIC_VIEW} is unavailable: ${normalizedResult.error.message}`
    );
  }

  const { data, error } = await supabase
    .from('growth_channel_daily_metrics')
    .select(rawSelect)
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

async function fetchKeywordRankingRows(supabase, range) {
  const { data, error } = await supabase
    .from('growth_keyword_rankings_daily')
    .select([
      'keyword_catalog_id',
      'metric_date',
      'keyword',
      'keyword_label',
      'target_domain',
      'target_path',
      'matched_domain',
      'matched_path',
      'matched_url',
      'result_title',
      'result_snippet',
      'position',
      'is_ranked',
      'device',
      'google_domain',
      'gl',
      'hl',
      'location',
      'results_count',
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

async function fetchKeywordCatalogRows(supabase) {
  return fetchGrowthKeywordCatalogRows(supabase, {
    activeOnly: true
  });
}

async function fetchQueryMetricRows(supabase, range) {
  const select = [
    'metric_date',
    'query',
    'normalized_query',
    'landing_page',
    'normalized_landing_page',
    'keyword_catalog_id',
    'cluster_key',
    'cluster_label',
    'business_line',
    'service_key',
    'page_type',
    'clicks',
    'impressions',
    'ctr',
    'position',
    'is_branded',
    'metadata'
  ].join(',');

  const { data, error } = await supabase
    .from('growth_query_daily_metrics')
    .select(select)
    .gte('metric_date', range.from)
    .lte('metric_date', range.to)
    .order('metric_date', { ascending: true });

  if (error) {
    if (!GROWTH_QUERY_METRIC_WARNINGS.has('growth_query_daily_metrics')) {
      GROWTH_QUERY_METRIC_WARNINGS.add('growth_query_daily_metrics');
      console.warn(
        `[admin][dashboard] growth_query_daily_metrics unavailable, Stage 3 query intelligence will stay empty: ${error.message}`
      );
    }

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

async function fetchWhatsAppClickRows(supabase, range) {
  const { data, error } = await supabase
    .from('whatsapp_click_events')
    .select([
      'id',
      'created_at',
      'clicked_at',
      'ga_client_id',
      'event_label',
      'page_path',
      'landing_page',
      'session_source',
      'session_medium',
      'session_campaign',
      'referrer_host'
    ].join(','))
    .gte('clicked_at', range.fromIso)
    .lte('clicked_at', range.toIso)
    .order('clicked_at', { ascending: true });

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

  const filters = {
    businessLine: searchParams.get('businessLine'),
    service: searchParams.get('service'),
    sourceClass: searchParams.get('sourceClass'),
    device: searchParams.get('device'),
    pageType: searchParams.get('pageType')
  };

  try {
    const [
      currentRows,
      previousRows,
      universeRows,
      auditEvents,
      externalMetricsResult,
      queryMetricsResult,
      whatsappClickResult,
      keywordCatalogResult,
      keywordRankingResult,
      sourceHealthResult
    ] = await Promise.all([
      fetchLeadRows(supabase, rangeResult.range),
      fetchLeadRows(supabase, rangeResult.previousRange),
      fetchAllLeadRows(supabase),
      fetchAuditEvents(supabase),
      fetchExternalMetricRows(supabase, rangeResult.range),
      fetchQueryMetricRows(supabase, rangeResult.range),
      fetchWhatsAppClickRows(supabase, rangeResult.range),
      fetchKeywordCatalogRows(supabase),
      fetchKeywordRankingRows(supabase, rangeResult.range),
      fetchGrowthSourceHealth(supabase)
    ]);
    const reportingWarnings = [
      externalMetricsResult.error ? 'growth_channel_daily_metrics_unavailable' : null,
      queryMetricsResult.error ? 'growth_query_daily_metrics_unavailable' : null,
      whatsappClickResult.error ? 'whatsapp_click_events_unavailable' : null,
      keywordCatalogResult.error ? 'growth_keyword_catalog_unavailable' : null,
      keywordRankingResult.error ? 'growth_keyword_rankings_daily_unavailable' : null,
      sourceHealthResult.error ? 'growth_reporting_source_health_unavailable' : null
    ].filter(Boolean);
    const dashboardData = buildAdminDashboardData({
      currentRows,
      previousRows,
      universeRows,
      externalMetricRows: externalMetricsResult.rows,
      queryMetricRows: queryMetricsResult.rows,
      whatsappClickRows: whatsappClickResult.rows,
      keywordCatalogRows: keywordCatalogResult.rows,
      keywordRankingRows: keywordRankingResult.rows,
      sourceHealthRows: sourceHealthResult.rows,
      auditEvents,
      range: rangeResult.range,
      filters,
      nowIso: new Date().toISOString()
    });

    return NextResponse.json({
      status: 'success',
      message: 'Dashboard KPI chargé.',
      data: {
        ...dashboardData,
        diagnostics: {
          reportingWarnings
        }
      },
      details: {
        piiExcluded: true,
        reportingWarnings
      }
    });
  } catch (error) {
    console.error('[admin][dashboard] load failed:', error);
    return getErrorResponse('dashboard_load_failed', 'Impossible de charger les KPI admin.', 500);
  }
}
