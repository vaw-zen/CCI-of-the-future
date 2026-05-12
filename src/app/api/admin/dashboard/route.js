import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { createServiceClient } from '@/libs/supabase';
import { getClientIp, rateLimitRequest } from '@/libs/security';
import {
  buildAdminDashboardAcquisitionSectionData,
  buildAdminDashboardCoreData,
  buildAdminDashboardData,
  buildAdminDashboardOperationsSectionData,
  buildAdminDashboardOverviewSectionData,
  buildAdminDashboardPipelineSectionData,
  buildAdminDashboardSeoSectionData,
  getDashboardRange
} from '@/libs/adminDashboardMetrics.mjs';
import { fetchFacebookAdminSnapshot } from '@/libs/facebookAdminSnapshot.mjs';
import { fetchGrowthKeywordCatalogRows } from '@/libs/growthKeywordCatalog.mjs';
import { runLeadSelectWithOptionalTrackingFallback } from '@/libs/leadTrackingSchemaCompat.mjs';
import { filterTrackedWhatsAppClicks } from '@/libs/whatsappAttribution.mjs';
import {
  isMissingWhatsAppDirectLeadSchemaError,
  WHATSAPP_DIRECT_LEAD_SELECT_FIELDS
} from '@/libs/whatsappDirectLeads.mjs';

export const dynamic = 'force-dynamic';

const ADMIN_DASHBOARD_RATE_LIMIT = {
  scope: 'admin-dashboard',
  limit: 60,
  windowMs: 60 * 1000
};
const NORMALIZED_EXTERNAL_METRIC_VIEW = 'growth_channel_daily_metrics_normalized';
const NORMALIZED_EXTERNAL_METRIC_VIEW_WARNINGS = new Set();
const GROWTH_QUERY_METRIC_WARNINGS = new Set();
const GROWTH_BEHAVIOR_METRIC_WARNINGS = new Set();
const OPTIONAL_GROWTH_EVENTS_WARNINGS = new Set();
const DASHBOARD_SECTION_KEYS = ['core', 'overview', 'pipeline', 'acquisition', 'seo', 'operations'];

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
  ].join(','),
  whatsapp: [
    WHATSAPP_DIRECT_LEAD_SELECT_FIELDS
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

function isMissingGrowthEventsColumnError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return error?.code === '42703' && message.includes('events');
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
  const [devisResult, conventionResult, whatsappResult] = await Promise.all([
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
    }),
    runLeadSelectWithFallback({
      supabase,
      table: 'whatsapp_direct_leads',
      select: DASHBOARD_SELECT_FIELDS.whatsapp,
      applyQuery: (query) => query
        .gte('lead_captured_at', range.fromIso)
        .lte('lead_captured_at', range.toIso)
        .order('lead_captured_at', { ascending: true })
    })
  ]);

  if (devisResult.error) {
    throw devisResult.error;
  }

  if (conventionResult.error) {
    throw conventionResult.error;
  }

  const warnings = [];

  if (whatsappResult.error && isMissingWhatsAppDirectLeadSchemaError(whatsappResult.error)) {
    warnings.push('whatsapp_direct_leads_unavailable');
  } else if (whatsappResult.error) {
    throw whatsappResult.error;
  }

  return {
    rows: {
      devis: devisResult.data || [],
      conventions: conventionResult.data || [],
      whatsapp: warnings.includes('whatsapp_direct_leads_unavailable') ? [] : (whatsappResult.data || [])
    },
    warnings
  };
}

async function fetchAllLeadRows(supabase) {
  const [devisResult, conventionResult, whatsappResult] = await Promise.all([
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
    }),
    runLeadSelectWithFallback({
      supabase,
      table: 'whatsapp_direct_leads',
      select: DASHBOARD_SELECT_FIELDS.whatsapp,
      applyQuery: (query) => query.order('lead_captured_at', { ascending: true })
    })
  ]);

  if (devisResult.error) {
    throw devisResult.error;
  }

  if (conventionResult.error) {
    throw conventionResult.error;
  }

  const warnings = [];

  if (whatsappResult.error && isMissingWhatsAppDirectLeadSchemaError(whatsappResult.error)) {
    warnings.push('whatsapp_direct_leads_unavailable');
  } else if (whatsappResult.error) {
    throw whatsappResult.error;
  }

  return {
    rows: {
      devis: devisResult.data || [],
      conventions: conventionResult.data || [],
      whatsapp: warnings.includes('whatsapp_direct_leads_unavailable') ? [] : (whatsappResult.data || [])
    },
    warnings
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
  const normalizedSelectWithEvents = [
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
    'events',
    'clicks',
    'impressions',
    'spend',
    'metadata'
  ].join(',');
  const normalizedSelectLegacy = [
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
  const rawSelectWithEvents = [
    'metric_date',
    'metric_source',
    'source',
    'medium',
    'campaign',
    'landing_page',
    'sessions',
    'users',
    'events',
    'clicks',
    'impressions',
    'spend',
    'metadata'
  ].join(',');
  const rawSelectLegacy = [
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

  let normalizedResult = await supabase
    .from(NORMALIZED_EXTERNAL_METRIC_VIEW)
    .select(normalizedSelectWithEvents)
    .gte('metric_date', range.from)
    .lte('metric_date', range.to)
    .order('metric_date', { ascending: true });

  if (normalizedResult.error && isMissingGrowthEventsColumnError(normalizedResult.error)) {
    if (!OPTIONAL_GROWTH_EVENTS_WARNINGS.has(NORMALIZED_EXTERNAL_METRIC_VIEW)) {
      OPTIONAL_GROWTH_EVENTS_WARNINGS.add(NORMALIZED_EXTERNAL_METRIC_VIEW);
      console.warn(
        `[admin][dashboard] ${NORMALIZED_EXTERNAL_METRIC_VIEW}.events is missing; retrying without GA4 events until the schema migration is applied.`
      );
    }

    normalizedResult = await supabase
      .from(NORMALIZED_EXTERNAL_METRIC_VIEW)
      .select(normalizedSelectLegacy)
      .gte('metric_date', range.from)
      .lte('metric_date', range.to)
      .order('metric_date', { ascending: true });
  }

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

  let rawResult = await supabase
    .from('growth_channel_daily_metrics')
    .select(rawSelectWithEvents)
    .gte('metric_date', range.from)
    .lte('metric_date', range.to)
    .order('metric_date', { ascending: true });

  if (rawResult.error && isMissingGrowthEventsColumnError(rawResult.error)) {
    if (!OPTIONAL_GROWTH_EVENTS_WARNINGS.has('growth_channel_daily_metrics')) {
      OPTIONAL_GROWTH_EVENTS_WARNINGS.add('growth_channel_daily_metrics');
      console.warn(
        '[admin][dashboard] growth_channel_daily_metrics.events is missing; retrying raw metrics without GA4 events until the schema migration is applied.'
      );
    }

    rawResult = await supabase
      .from('growth_channel_daily_metrics')
      .select(rawSelectLegacy)
      .gte('metric_date', range.from)
      .lte('metric_date', range.to)
      .order('metric_date', { ascending: true });
  }

  const { data, error } = rawResult;

  if (error) {
    return {
      rows: [],
      error
    };
  }

  return {
    rows: filterTrackedWhatsAppClicks(data || []),
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

async function fetchBehaviorMetricRows(supabase, range) {
  const select = [
    'event_date',
    'event_name',
    'page_type',
    'dashboard_page_type',
    'landing_page',
    'business_line',
    'service_type',
    'form_name',
    'form_placement',
    'funnel_name',
    'step_name',
    'step_number',
    'cta_id',
    'cta_location',
    'cta_type',
    'contact_method',
    'content_type',
    'content_cluster',
    'session_source',
    'session_medium',
    'session_campaign',
    'source_class',
    'event_count',
    'unique_client_count'
  ].join(',');

  const { data, error } = await supabase
    .from('growth_behavior_daily_metrics')
    .select(select)
    .gte('event_date', range.from)
    .lte('event_date', range.to)
    .order('event_date', { ascending: true });

  if (error) {
    if (!GROWTH_BEHAVIOR_METRIC_WARNINGS.has('growth_behavior_daily_metrics')) {
      GROWTH_BEHAVIOR_METRIC_WARNINGS.add('growth_behavior_daily_metrics');
      console.warn(
        `[admin][dashboard] growth_behavior_daily_metrics unavailable, Stage 3 behavior panels will stay empty: ${error.message}`
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

function parseDashboardSections(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return {
      hasSectionRequest: false,
      sections: [],
      invalidSections: []
    };
  }

  const rawSections = normalized
    .split(',')
    .map((section) => section.trim().toLowerCase())
    .filter(Boolean);
  const sections = Array.from(new Set(rawSections));
  const invalidSections = sections.filter((section) => !DASHBOARD_SECTION_KEYS.includes(section));

  return {
    hasSectionRequest: true,
    sections: sections.filter((section) => DASHBOARD_SECTION_KEYS.includes(section)),
    invalidSections
  };
}

function buildReportingWarnings({
  currentRowsResult,
  previousRowsResult,
  universeRowsResult,
  externalMetricsResult,
  queryMetricsResult,
  behaviorMetricsResult,
  whatsappClickResult,
  facebookSnapshot,
  keywordCatalogResult,
  keywordRankingResult,
  sourceHealthResult
}) {
  return Array.from(new Set([
    ...(currentRowsResult?.warnings || []),
    ...(previousRowsResult?.warnings || []),
    ...(universeRowsResult?.warnings || []),
    externalMetricsResult?.error ? 'growth_channel_daily_metrics_unavailable' : null,
    queryMetricsResult?.error ? 'growth_query_daily_metrics_unavailable' : null,
    behaviorMetricsResult?.error ? 'growth_behavior_daily_metrics_unavailable' : null,
    whatsappClickResult?.error ? 'whatsapp_click_events_unavailable' : null,
    ...((facebookSnapshot?.warnings || []).map((warning) => warning.key)),
    keywordCatalogResult?.error ? 'growth_keyword_catalog_unavailable' : null,
    keywordRankingResult?.error ? 'growth_keyword_rankings_daily_unavailable' : null,
    sourceHealthResult?.error ? 'growth_reporting_source_health_unavailable' : null
  ].filter(Boolean)));
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
  const sectionParseResult = parseDashboardSections(searchParams.get('sections'));

  if (sectionParseResult.invalidSections.length > 0) {
    return getErrorResponse(
      'invalid_sections',
      `Sections dashboard invalides: ${sectionParseResult.invalidSections.join(', ')}.`,
      400
    );
  }

  try {
    const nowIso = new Date().toISOString();

    if (!sectionParseResult.hasSectionRequest) {
      const [
        currentRowsResult,
        previousRowsResult,
        universeRowsResult,
        auditEvents,
        externalMetricsResult,
        queryMetricsResult,
        behaviorMetricsResult,
        whatsappClickResult,
        facebookSnapshot,
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
        fetchBehaviorMetricRows(supabase, rangeResult.range),
        fetchWhatsAppClickRows(supabase, rangeResult.range),
        fetchFacebookAdminSnapshot(),
        fetchKeywordCatalogRows(supabase),
        fetchKeywordRankingRows(supabase, rangeResult.range),
        fetchGrowthSourceHealth(supabase)
      ]);
      const reportingWarnings = buildReportingWarnings({
        currentRowsResult,
        previousRowsResult,
        universeRowsResult,
        externalMetricsResult,
        queryMetricsResult,
        behaviorMetricsResult,
        whatsappClickResult,
        facebookSnapshot,
        keywordCatalogResult,
        keywordRankingResult,
        sourceHealthResult
      });
      const dashboardData = buildAdminDashboardData({
        currentRows: currentRowsResult.rows,
        previousRows: previousRowsResult.rows,
        universeRows: universeRowsResult.rows,
        externalMetricRows: externalMetricsResult.rows,
        queryMetricRows: queryMetricsResult.rows,
        behaviorMetricRows: behaviorMetricsResult.rows,
        whatsappClickRows: whatsappClickResult.rows,
        facebookSnapshot,
        keywordCatalogRows: keywordCatalogResult.rows,
        keywordRankingRows: keywordRankingResult.rows,
        sourceHealthRows: sourceHealthResult.rows,
        auditEvents,
        range: rangeResult.range,
        filters,
        nowIso
      });

      return NextResponse.json({
        status: 'success',
        message: 'Dashboard KPI chargé.',
        data: {
          ...dashboardData,
          loadedSections: DASHBOARD_SECTION_KEYS,
          diagnostics: {
            reportingWarnings
          }
        },
        details: {
          piiExcluded: true,
          reportingWarnings,
          loadedSections: DASHBOARD_SECTION_KEYS
        }
      });
    }

    const requestedSections = sectionParseResult.sections;
    const sectionSet = new Set(requestedSections);
    const currentRowsPromise = (
      sectionSet.has('core')
      || sectionSet.has('overview')
      || sectionSet.has('pipeline')
      || sectionSet.has('acquisition')
      || sectionSet.has('seo')
    )
      ? fetchLeadRows(supabase, rangeResult.range)
      : Promise.resolve(null);
    const previousRowsPromise = (sectionSet.has('core') || sectionSet.has('overview'))
      ? fetchLeadRows(supabase, rangeResult.previousRange)
      : Promise.resolve(null);
    const universeRowsPromise = (sectionSet.has('overview') || sectionSet.has('operations'))
      ? fetchAllLeadRows(supabase)
      : Promise.resolve(null);
    const auditEventsPromise = sectionSet.has('operations')
      ? fetchAuditEvents(supabase)
      : Promise.resolve([]);
    const externalMetricsPromise = (sectionSet.has('core') || sectionSet.has('acquisition') || sectionSet.has('seo'))
      ? fetchExternalMetricRows(supabase, rangeResult.range)
      : Promise.resolve(null);
    const queryMetricsPromise = sectionSet.has('seo')
      ? fetchQueryMetricRows(supabase, rangeResult.range)
      : Promise.resolve(null);
    const behaviorMetricsPromise = sectionSet.has('pipeline')
      ? fetchBehaviorMetricRows(supabase, rangeResult.range)
      : Promise.resolve(null);
    const whatsappClickPromise = sectionSet.has('acquisition')
      ? fetchWhatsAppClickRows(supabase, rangeResult.range)
      : Promise.resolve(null);
    const facebookSnapshotPromise = sectionSet.has('acquisition')
      ? fetchFacebookAdminSnapshot()
      : Promise.resolve(null);
    const keywordCatalogPromise = sectionSet.has('seo')
      ? fetchKeywordCatalogRows(supabase)
      : Promise.resolve(null);
    const keywordRankingPromise = sectionSet.has('seo')
      ? fetchKeywordRankingRows(supabase, rangeResult.range)
      : Promise.resolve(null);
    const sourceHealthPromise = sectionSet.has('core')
      ? fetchGrowthSourceHealth(supabase)
      : Promise.resolve(null);

    const [
      currentRowsResult,
      previousRowsResult,
      universeRowsResult,
      auditEvents,
      externalMetricsResult,
      queryMetricsResult,
      behaviorMetricsResult,
      whatsappClickResult,
      facebookSnapshot,
      keywordCatalogResult,
      keywordRankingResult,
      sourceHealthResult
    ] = await Promise.all([
      currentRowsPromise,
      previousRowsPromise,
      universeRowsPromise,
      auditEventsPromise,
      externalMetricsPromise,
      queryMetricsPromise,
      behaviorMetricsPromise,
      whatsappClickPromise,
      facebookSnapshotPromise,
      keywordCatalogPromise,
      keywordRankingPromise,
      sourceHealthPromise
    ]);
    const reportingWarnings = buildReportingWarnings({
      currentRowsResult,
      previousRowsResult,
      universeRowsResult,
      externalMetricsResult,
      queryMetricsResult,
      behaviorMetricsResult,
      whatsappClickResult,
      facebookSnapshot,
      keywordCatalogResult,
      keywordRankingResult,
      sourceHealthResult
    });
    const sectionInput = {
      currentRows: currentRowsResult?.rows,
      previousRows: previousRowsResult?.rows,
      universeRows: universeRowsResult?.rows,
      externalMetricRows: externalMetricsResult?.rows,
      queryMetricRows: queryMetricsResult?.rows,
      behaviorMetricRows: behaviorMetricsResult?.rows,
      whatsappClickRows: whatsappClickResult?.rows,
      facebookSnapshot,
      keywordCatalogRows: keywordCatalogResult?.rows,
      keywordRankingRows: keywordRankingResult?.rows,
      sourceHealthRows: sourceHealthResult?.rows,
      auditEvents,
      range: rangeResult.range,
      filters,
      nowIso
    };

    let dashboardData = {};

    if (sectionSet.has('core')) {
      dashboardData = {
        ...dashboardData,
        ...buildAdminDashboardCoreData(sectionInput)
      };
    }

    if (sectionSet.has('overview')) {
      dashboardData = {
        ...dashboardData,
        ...buildAdminDashboardOverviewSectionData(sectionInput)
      };
    }

    if (sectionSet.has('pipeline')) {
      dashboardData = {
        ...dashboardData,
        ...buildAdminDashboardPipelineSectionData(sectionInput)
      };
    }

    if (sectionSet.has('acquisition')) {
      dashboardData = {
        ...dashboardData,
        ...buildAdminDashboardAcquisitionSectionData(sectionInput)
      };
    }

    if (sectionSet.has('seo')) {
      dashboardData = {
        ...dashboardData,
        ...buildAdminDashboardSeoSectionData(sectionInput)
      };
    }

    if (sectionSet.has('operations')) {
      dashboardData = {
        ...dashboardData,
        ...buildAdminDashboardOperationsSectionData(sectionInput)
      };
    }

    return NextResponse.json({
      status: 'success',
      message: 'Dashboard section chargé.',
      data: {
        ...dashboardData,
        loadedSections: requestedSections,
        diagnostics: {
          reportingWarnings
        }
      },
      details: {
        piiExcluded: true,
        reportingWarnings,
        loadedSections: requestedSections
      }
    });
  } catch (error) {
    console.error('[admin][dashboard] load failed:', error);
    return getErrorResponse('dashboard_load_failed', 'Impossible de charger les KPI admin.', 500);
  }
}
