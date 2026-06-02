#!/usr/bin/env node

import {
  buildAdminDashboardData,
  getDashboardRange
} from '../../src/libs/adminDashboardMetrics.mjs';
import {
  createGrowthServiceClient,
  loadGrowthEnv
} from '../../src/libs/growthReporting.mjs';
import { fetchGrowthKeywordCatalogRows } from '../../src/libs/growthKeywordCatalog.mjs';
import { runLeadSelectWithOptionalTrackingFallback } from '../../src/libs/leadTrackingSchemaCompat.mjs';
import {
  buildOrganicSearchReview,
  formatOrganicSearchReviewMarkdown,
  getLastCompleteDateRange,
  getPriorDateRange
} from '../../src/libs/organicSearchReview.mjs';

const NORMALIZED_EXTERNAL_METRIC_VIEW = 'growth_channel_daily_metrics_normalized';

const LEAD_SELECT_FIELDS = {
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
    'fbclid',
    'meta_fbc',
    'meta_fbp',
    'meta_platform',
    'meta_lead_source',
    'meta_campaign_id',
    'meta_adset_id',
    'meta_ad_id',
    'meta_leadgen_id',
    'meta_form_id',
    'meta_page_id',
    'selected_services'
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
    'fbclid',
    'meta_fbc',
    'meta_fbp',
    'meta_platform',
    'meta_lead_source',
    'meta_campaign_id',
    'meta_adset_id',
    'meta_ad_id',
    'meta_leadgen_id',
    'meta_form_id',
    'meta_page_id',
    'selected_services'
  ].join(',')
};

const EMPTY_LEAD_ROWS = {
  devis: [],
  conventions: [],
  whatsapp: []
};

function normalizeJson(value) {
  return JSON.stringify(value, null, 2);
}

function parseArgs(argv = []) {
  const defaults = getLastCompleteDateRange({ days: 28 });
  const args = {
    from: defaults.from,
    to: defaults.to,
    json: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--json') {
      args.json = true;
      continue;
    }

    if (value === '--from') {
      args.from = argv[index + 1] || args.from;
      index += 1;
      continue;
    }

    if (value.startsWith('--from=')) {
      args.from = value.split('=').slice(1).join('=') || args.from;
      continue;
    }

    if (value === '--to') {
      args.to = argv[index + 1] || args.to;
      index += 1;
      continue;
    }

    if (value.startsWith('--to=')) {
      args.to = value.split('=').slice(1).join('=') || args.to;
    }
  }

  return args;
}

async function selectLeadRows({
  supabase,
  table,
  select,
  applyQuery
}) {
  return runLeadSelectWithOptionalTrackingFallback({
    supabase,
    table,
    select,
    applyQuery,
    channel: 'organic-review'
  });
}

async function fetchLeadRowsForRange(supabase, range) {
  const [devisResult, conventionResult] = await Promise.all([
    selectLeadRows({
      supabase,
      table: 'devis_requests',
      select: LEAD_SELECT_FIELDS.devis,
      applyQuery: (query) => query
        .gte('created_at', range.fromIso)
        .lte('created_at', range.toIso)
        .order('created_at', { ascending: true })
    }),
    selectLeadRows({
      supabase,
      table: 'convention_requests',
      select: LEAD_SELECT_FIELDS.convention,
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
    conventions: conventionResult.data || [],
    whatsapp: []
  };
}

async function fetchAllLeadRows(supabase) {
  const [devisResult, conventionResult] = await Promise.all([
    selectLeadRows({
      supabase,
      table: 'devis_requests',
      select: LEAD_SELECT_FIELDS.devis,
      applyQuery: (query) => query.order('created_at', { ascending: true })
    }),
    selectLeadRows({
      supabase,
      table: 'convention_requests',
      select: LEAD_SELECT_FIELDS.convention,
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
    conventions: conventionResult.data || [],
    whatsapp: []
  };
}

function isMissingEventsColumnError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return error?.code === '42703' && message.includes('events');
}

async function fetchExternalMetricRows(supabase, range) {
  const normalizedWithEvents = [
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
  const normalizedLegacy = [
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

  let result = await supabase
    .from(NORMALIZED_EXTERNAL_METRIC_VIEW)
    .select(normalizedWithEvents)
    .gte('metric_date', range.from)
    .lte('metric_date', range.to)
    .order('metric_date', { ascending: true });

  if (result.error && isMissingEventsColumnError(result.error)) {
    result = await supabase
      .from(NORMALIZED_EXTERNAL_METRIC_VIEW)
      .select(normalizedLegacy)
      .gte('metric_date', range.from)
      .lte('metric_date', range.to)
      .order('metric_date', { ascending: true });
  }

  if (result.error) {
    throw result.error;
  }

  return result.data || [];
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
    throw error;
  }

  return data || [];
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
    throw error;
  }

  return data || [];
}

async function fetchKeywordRankingRows(supabase, range) {
  const select = [
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
  ].join(',');
  const { data, error } = await supabase
    .from('growth_keyword_rankings_daily')
    .select(select)
    .gte('metric_date', range.from)
    .lte('metric_date', range.to)
    .order('metric_date', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

async function fetchSourceHealthRows(supabase) {
  const select = [
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
  ].join(',');
  const { data, error } = await supabase
    .from('growth_reporting_source_health')
    .select(select);

  if (error) {
    throw error;
  }

  return data || [];
}

async function fetchSharedData(supabase) {
  const [universeRows, keywordCatalogResult, sourceHealthRows] = await Promise.all([
    fetchAllLeadRows(supabase),
    fetchGrowthKeywordCatalogRows(supabase, { activeOnly: true }),
    fetchSourceHealthRows(supabase)
  ]);

  if (keywordCatalogResult.error) {
    throw keywordCatalogResult.error;
  }

  return {
    universeRows,
    keywordCatalogRows: keywordCatalogResult.rows || [],
    sourceHealthRows
  };
}

async function fetchRangeData(supabase, range) {
  const [
    leadRows,
    externalMetricRows,
    queryMetricRows,
    behaviorMetricRows,
    keywordRankingRows
  ] = await Promise.all([
    fetchLeadRowsForRange(supabase, range),
    fetchExternalMetricRows(supabase, range),
    fetchQueryMetricRows(supabase, range),
    fetchBehaviorMetricRows(supabase, range),
    fetchKeywordRankingRows(supabase, range)
  ]);

  return {
    leadRows,
    externalMetricRows,
    queryMetricRows,
    behaviorMetricRows,
    keywordRankingRows
  };
}

function buildSnapshot({
  currentRows,
  previousRows,
  universeRows,
  externalMetricRows,
  queryMetricRows,
  behaviorMetricRows,
  keywordCatalogRows,
  keywordRankingRows,
  sourceHealthRows,
  range,
  filters,
  nowIso
}) {
  return buildAdminDashboardData({
    currentRows,
    previousRows,
    universeRows,
    externalMetricRows,
    queryMetricRows,
    behaviorMetricRows,
    whatsappClickRows: [],
    metaLeadAdRows: [],
    metaConversionEventRows: [],
    facebookSnapshot: null,
    keywordCatalogRows,
    keywordRankingRows,
    sourceHealthRows,
    auditEvents: [],
    range,
    filters,
    nowIso
  });
}

function getOptionValues(options = []) {
  return options
    .filter((option) => option?.value)
    .map((option) => ({
      value: option.value,
      label: option.label || option.value
    }));
}

function buildSegmentSnapshots({
  filters,
  currentRangeData,
  previousRangeData,
  sharedData,
  currentRange,
  previousRange,
  nowIso
}) {
  const segmentSnapshots = {
    businessLine: [],
    service: [],
    pageType: []
  };

  const sourceClass = filters.sourceClass;
  const axes = [
    ['businessLine', filters.options?.businessLine || []],
    ['service', filters.options?.service || []],
    ['pageType', filters.options?.pageType || []]
  ];

  axes.forEach(([axis, options]) => {
    getOptionValues(options).forEach((option) => {
      const scopedFilters = {
        sourceClass,
        [axis]: option.value
      };
      const current = buildSnapshot({
        currentRows: currentRangeData.leadRows,
        previousRows: previousRangeData.leadRows,
        universeRows: sharedData.universeRows,
        externalMetricRows: currentRangeData.externalMetricRows,
        queryMetricRows: currentRangeData.queryMetricRows,
        behaviorMetricRows: currentRangeData.behaviorMetricRows,
        keywordCatalogRows: sharedData.keywordCatalogRows,
        keywordRankingRows: currentRangeData.keywordRankingRows,
        sourceHealthRows: sharedData.sourceHealthRows,
        range: currentRange,
        filters: scopedFilters,
        nowIso
      });
      const previous = buildSnapshot({
        currentRows: previousRangeData.leadRows,
        previousRows: EMPTY_LEAD_ROWS,
        universeRows: sharedData.universeRows,
        externalMetricRows: previousRangeData.externalMetricRows,
        queryMetricRows: previousRangeData.queryMetricRows,
        behaviorMetricRows: previousRangeData.behaviorMetricRows,
        keywordCatalogRows: sharedData.keywordCatalogRows,
        keywordRankingRows: previousRangeData.keywordRankingRows,
        sourceHealthRows: sharedData.sourceHealthRows,
        range: previousRange,
        filters: scopedFilters,
        nowIso
      });

      const hasSignal = (
        (current.seoContent?.totals?.clicks || 0) > 0
        || (current.seoContent?.totals?.sessions || 0) > 0
        || (current.seoQueries?.summary?.totalQueries || 0) > 0
      );

      if (!hasSignal) {
        return;
      }

      segmentSnapshots[axis].push({
        type: axis,
        key: option.value,
        label: option.label,
        current,
        previous
      });
    });
  });

  return segmentSnapshots;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rangeResult = getDashboardRange({
    from: args.from,
    to: args.to
  });

  if (!rangeResult.ok) {
    throw new Error(rangeResult.message || 'Invalid review range.');
  }

  loadGrowthEnv();
  const supabase = createGrowthServiceClient();
  const nowIso = new Date().toISOString();
  const currentRange = rangeResult.range;
  const previousRangeLabel = getPriorDateRange({
    from: currentRange.from,
    to: currentRange.to
  });
  const previousRange = {
    from: previousRangeLabel.from,
    to: previousRangeLabel.to,
    fromIso: `${previousRangeLabel.from}T00:00:00.000Z`,
    toIso: `${previousRangeLabel.to}T23:59:59.999Z`,
    days: currentRange.days
  };

  const [sharedData, currentRangeData, previousRangeData] = await Promise.all([
    fetchSharedData(supabase),
    fetchRangeData(supabase, currentRange),
    fetchRangeData(supabase, previousRange)
  ]);

  const baseFilters = {
    sourceClass: 'organic_search'
  };

  const currentDashboardData = buildSnapshot({
    currentRows: currentRangeData.leadRows,
    previousRows: previousRangeData.leadRows,
    universeRows: sharedData.universeRows,
    externalMetricRows: currentRangeData.externalMetricRows,
    queryMetricRows: currentRangeData.queryMetricRows,
    behaviorMetricRows: currentRangeData.behaviorMetricRows,
    keywordCatalogRows: sharedData.keywordCatalogRows,
    keywordRankingRows: currentRangeData.keywordRankingRows,
    sourceHealthRows: sharedData.sourceHealthRows,
    range: currentRange,
    filters: baseFilters,
    nowIso
  });

  const previousDashboardData = buildSnapshot({
    currentRows: previousRangeData.leadRows,
    previousRows: EMPTY_LEAD_ROWS,
    universeRows: sharedData.universeRows,
    externalMetricRows: previousRangeData.externalMetricRows,
    queryMetricRows: previousRangeData.queryMetricRows,
    behaviorMetricRows: previousRangeData.behaviorMetricRows,
    keywordCatalogRows: sharedData.keywordCatalogRows,
    keywordRankingRows: previousRangeData.keywordRankingRows,
    sourceHealthRows: sharedData.sourceHealthRows,
    range: previousRange,
    filters: baseFilters,
    nowIso
  });

  const segmentSnapshots = buildSegmentSnapshots({
    filters: currentDashboardData.filters,
    currentRangeData,
    previousRangeData,
    sharedData,
    currentRange,
    previousRange,
    nowIso
  });

  const review = buildOrganicSearchReview({
    currentDashboardData,
    previousDashboardData,
    segmentSnapshots,
    range: currentRange,
    previousRange
  });

  if (args.json) {
    console.log(normalizeJson(review));
    return;
  }

  console.log(formatOrganicSearchReviewMarkdown(review));
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
