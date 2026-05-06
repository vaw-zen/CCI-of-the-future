import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export const GROWTH_METRIC_SOURCES = {
  GA4: 'ga4',
  GSC: 'gsc',
  PAID_MANUAL: 'paid_manual',
  SOCIAL_MANUAL: 'social_manual'
};

export const GROWTH_SOURCE_HEALTH_KEYS = {
  SUPABASE: 'supabase_live',
  GA4: 'ga4',
  SEARCH_CONSOLE: 'search_console',
  PAID_MEDIA: 'paid_media',
  SOCIAL_MEDIA: 'social_media'
};

const GROWTH_SOURCE_STATUS_VALUES = new Set(['fresh', 'stale', 'missing', 'error']);
const DEFAULT_ENV_PATH = path.resolve('.env.local');

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function toDateString(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const stringValue = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  if (/^\d{8}$/.test(stringValue)) {
    return `${stringValue.slice(0, 4)}-${stringValue.slice(4, 6)}-${stringValue.slice(6, 8)}`;
  }

  const parsedDate = new Date(stringValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, 10);
}

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizePathname(value, fallback = '/') {
  const text = normalizeText(value, fallback);

  if (!text) {
    return fallback;
  }

  if (text.startsWith('http://') || text.startsWith('https://')) {
    try {
      const url = new URL(text);
      return url.pathname || fallback;
    } catch (error) {
      return fallback;
    }
  }

  return text.startsWith('/') ? text : `/${text}`;
}

function normalizeInteger(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.round(numericValue));
}

function normalizeNumeric(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(numericValue * 100) / 100;
}

function resolveSourceHealthStatus(status = '') {
  if (GROWTH_SOURCE_STATUS_VALUES.has(status)) {
    return status;
  }

  return 'missing';
}

function getMaxMetricDate(rows = []) {
  const values = rows
    .map((row) => toDateString(row.metric_date))
    .filter(Boolean)
    .sort();

  return values.at(-1) || null;
}

function getGoogleCredentials() {
  const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || process.env.GSC_CREDENTIALS;
  if (!rawCredentials) {
    const error = new Error('Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS or GSC_CREDENTIALS');
    error.code = 'missing_google_credentials';
    throw error;
  }

  const credentials = safeJsonParse(rawCredentials);
  if (!credentials) {
    const error = new Error('Invalid Google service account JSON');
    error.code = 'invalid_google_credentials';
    throw error;
  }

  if (!credentials.client_email || !credentials.private_key || !credentials.project_id) {
    const error = new Error('Google service account JSON must include client_email, private_key, and project_id');
    error.code = 'invalid_google_credentials';
    throw error;
  }

  return {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/g, '\n'),
    project_id: credentials.project_id
  };
}

export function loadGrowthEnv(envPath = DEFAULT_ENV_PATH) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  return envPath;
}

export function createGrowthServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const error = new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    error.code = 'missing_supabase_credentials';
    throw error;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function createGrowthGoogleAuth(scopes = []) {
  const credentials = getGoogleCredentials();

  return new google.auth.GoogleAuth({
    credentials,
    scopes
  });
}

export function getGa4PropertyId() {
  const propertyId = normalizeText(process.env.GA4_PROPERTY_ID);
  if (!propertyId) {
    const error = new Error('Missing GA4_PROPERTY_ID');
    error.code = 'missing_ga4_property_id';
    throw error;
  }

  return propertyId;
}

export function getSearchConsoleProperty() {
  if (process.env.GSC_SITE_URL) {
    return process.env.GSC_SITE_URL;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    const error = new Error('Missing GSC_SITE_URL or NEXT_PUBLIC_SITE_URL');
    error.code = 'missing_gsc_property';
    throw error;
  }

  const hostname = new URL(siteUrl).hostname;
  return `sc-domain:${hostname}`;
}

export function getDefaultSnapshotRange({ daysBack = 1 } = {}) {
  const endDate = new Date();
  endDate.setUTCDate(endDate.getUTCDate() - Math.max(0, daysBack));

  return {
    startDate: toDateString(endDate),
    endDate: toDateString(endDate)
  };
}

export function normalizeGrowthMetricRow(row = {}) {
  return {
    metric_date: toDateString(row.metric_date),
    metric_source: normalizeText(row.metric_source, GROWTH_METRIC_SOURCES.PAID_MANUAL),
    source: normalizeText(row.source, 'unknown'),
    medium: normalizeText(row.medium, '(none)'),
    campaign: normalizeText(row.campaign, '(not set)'),
    landing_page: normalizePathname(row.landing_page, '/'),
    sessions: normalizeInteger(row.sessions),
    users: normalizeInteger(row.users),
    clicks: normalizeInteger(row.clicks),
    impressions: normalizeInteger(row.impressions),
    spend: normalizeNumeric(row.spend),
    metadata: row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? row.metadata
      : {}
  };
}

export async function upsertGrowthMetricRows(supabase, rows = []) {
  const sanitizedRows = rows
    .map((row) => normalizeGrowthMetricRow(row))
    .filter((row) => row.metric_date);

  if (sanitizedRows.length === 0) {
    return { count: 0 };
  }

  const { error } = await supabase
    .from('growth_channel_daily_metrics')
    .upsert(sanitizedRows, {
      onConflict: 'metric_date,metric_source,source,medium,campaign,landing_page'
    });

  if (error) {
    throw error;
  }

  return {
    count: sanitizedRows.length,
    freshestMetricDate: getMaxMetricDate(sanitizedRows)
  };
}

export function buildSourceHealthRecord(record = {}) {
  return {
    source_key: normalizeText(record.source_key),
    source_label: normalizeText(record.source_label, record.source_key),
    connector_type: normalizeText(record.connector_type, 'manual'),
    status: resolveSourceHealthStatus(record.status),
    last_attempt_at: record.last_attempt_at || new Date().toISOString(),
    last_success_at: record.last_success_at || null,
    freshest_metric_date: toDateString(record.freshest_metric_date) || null,
    message: normalizeText(record.message, ''),
    last_error: normalizeText(record.last_error, ''),
    metadata: record.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)
      ? record.metadata
      : {}
  };
}

export async function upsertGrowthSourceHealth(supabase, rows = []) {
  const sanitizedRows = rows
    .map((row) => buildSourceHealthRecord(row))
    .filter((row) => row.source_key);

  if (sanitizedRows.length === 0) {
    return { count: 0 };
  }

  const { error } = await supabase
    .from('growth_reporting_source_health')
    .upsert(sanitizedRows, {
      onConflict: 'source_key'
    });

  if (error) {
    throw error;
  }

  return { count: sanitizedRows.length };
}

function parseGa4Row(row) {
  const dimensionValues = row.dimensionValues || [];
  const metricValues = row.metricValues || [];

  return normalizeGrowthMetricRow({
    metric_date: dimensionValues[0]?.value,
    metric_source: GROWTH_METRIC_SOURCES.GA4,
    source: dimensionValues[1]?.value,
    medium: dimensionValues[2]?.value,
    campaign: dimensionValues[3]?.value,
    landing_page: dimensionValues[4]?.value?.split('?')[0] || '/',
    sessions: metricValues[0]?.value,
    users: metricValues[1]?.value,
    metadata: {
      source_connector: 'ga4'
    }
  });
}

export async function fetchGa4SnapshotRows({ startDate, endDate }) {
  const propertyId = getGa4PropertyId();
  const auth = createGrowthGoogleAuth(['https://www.googleapis.com/auth/analytics.readonly']);
  const authClient = await auth.getClient();
  const analyticsdata = google.analyticsdata({
    version: 'v1beta',
    auth: authClient
  });

  const response = await analyticsdata.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'date' },
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'sessionCampaignName' },
        { name: 'landingPagePlusQueryString' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' }
      ],
      limit: '100000'
    }
  });

  return (response.data.rows || []).map(parseGa4Row);
}

export async function fetchSearchConsoleSnapshotRows({ startDate, endDate }) {
  const property = getSearchConsoleProperty();
  const auth = createGrowthGoogleAuth(['https://www.googleapis.com/auth/webmasters.readonly']);
  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole({
    version: 'v1',
    auth: authClient
  });

  const response = await searchconsole.searchanalytics.query({
    siteUrl: property,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['date', 'page'],
      rowLimit: 25000,
      type: 'web'
    }
  });

  return (response.data.rows || []).map((row) => {
    const [metricDate, pageUrl] = row.keys || [];

    return normalizeGrowthMetricRow({
      metric_date: metricDate,
      metric_source: GROWTH_METRIC_SOURCES.GSC,
      source: 'google',
      medium: 'organic',
      campaign: '(not set)',
      landing_page: pageUrl,
      clicks: row.clicks,
      impressions: row.impressions,
      metadata: {
        ctr: typeof row.ctr === 'number'
          ? Math.round(row.ctr * 10000) / 100
          : 0,
        position: typeof row.position === 'number'
          ? Math.round(row.position * 100) / 100
          : null,
        source_connector: 'search_console'
      }
    });
  });
}

function buildSuccessHealthRecord({
  sourceKey,
  sourceLabel,
  connectorType,
  metricCount,
  freshestMetricDate,
  startedAt,
  metadata = {}
}) {
  return buildSourceHealthRecord({
    source_key: sourceKey,
    source_label: sourceLabel,
    connector_type: connectorType,
    status: 'fresh',
    last_attempt_at: startedAt,
    last_success_at: new Date().toISOString(),
    freshest_metric_date: freshestMetricDate,
    message: metricCount > 0
      ? `${metricCount} lignes synchronisées`
      : 'Synchronisation réussie sans nouvelle ligne',
    metadata
  });
}

function buildFailedHealthRecord({
  sourceKey,
  sourceLabel,
  connectorType,
  startedAt,
  error,
  metadata = {}
}) {
  const status = error?.code?.startsWith('missing_') ? 'missing' : 'error';

  return buildSourceHealthRecord({
    source_key: sourceKey,
    source_label: sourceLabel,
    connector_type: connectorType,
    status,
    last_attempt_at: startedAt,
    message: normalizeText(error?.message, 'Synchronisation échouée'),
    last_error: normalizeText(error?.message, 'Synchronisation échouée'),
    metadata
  });
}

export async function refreshGrowthReporting({
  startDate,
  endDate,
  supabase
} = {}) {
  const client = supabase || createGrowthServiceClient();
  const fallbackRange = getDefaultSnapshotRange();
  const resolvedStartDate = toDateString(startDate) || fallbackRange.startDate;
  const resolvedEndDate = toDateString(endDate) || fallbackRange.endDate;

  const tasks = [
    {
      sourceKey: GROWTH_SOURCE_HEALTH_KEYS.GA4,
      sourceLabel: 'GA4',
      connectorType: 'api',
      fetchRows: fetchGa4SnapshotRows
    },
    {
      sourceKey: GROWTH_SOURCE_HEALTH_KEYS.SEARCH_CONSOLE,
      sourceLabel: 'Search Console',
      connectorType: 'api',
      fetchRows: fetchSearchConsoleSnapshotRows
    }
  ];

  const results = [];

  for (const task of tasks) {
    const startedAt = new Date().toISOString();

    try {
      const rows = await task.fetchRows({
        startDate: resolvedStartDate,
        endDate: resolvedEndDate
      });
      const upsertResult = await upsertGrowthMetricRows(client, rows);

      await upsertGrowthSourceHealth(client, [
        buildSuccessHealthRecord({
          sourceKey: task.sourceKey,
          sourceLabel: task.sourceLabel,
          connectorType: task.connectorType,
          metricCount: upsertResult.count,
          freshestMetricDate: upsertResult.freshestMetricDate || resolvedEndDate,
          startedAt,
          metadata: {
            startDate: resolvedStartDate,
            endDate: resolvedEndDate
          }
        })
      ]);

      results.push({
        sourceKey: task.sourceKey,
        status: 'success',
        metricCount: upsertResult.count,
        freshestMetricDate: upsertResult.freshestMetricDate || resolvedEndDate
      });
    } catch (error) {
      await upsertGrowthSourceHealth(client, [
        buildFailedHealthRecord({
          sourceKey: task.sourceKey,
          sourceLabel: task.sourceLabel,
          connectorType: task.connectorType,
          startedAt,
          error,
          metadata: {
            startDate: resolvedStartDate,
            endDate: resolvedEndDate
          }
        })
      ]);

      results.push({
        sourceKey: task.sourceKey,
        status: 'failed',
        error: error?.message || 'Unknown error'
      });
    }
  }

  return {
    range: {
      startDate: resolvedStartDate,
      endDate: resolvedEndDate
    },
    results
  };
}
