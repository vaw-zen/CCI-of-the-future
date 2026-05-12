import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import {
  buildKeywordCatalogLookupKeyFromValues,
  DEFAULT_KEYWORD_SITE_URL,
  KEYWORD_TRACKED_DEVICES,
  fetchGrowthKeywordCatalogRows,
  normalizeKeywordForKey
} from './growthKeywordCatalog.mjs';

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
  SERP_KEYWORD_RANKINGS: 'serp_keyword_rankings',
  PAID_MEDIA: 'paid_media',
  SOCIAL_MEDIA: 'social_media'
};

const SEARCH_CONSOLE_ROW_LIMIT = 25000;
export const SEARCH_CONSOLE_RECENT_SYNC_WINDOW_DAYS = 5;
export const SEARCH_CONSOLE_TIME_ZONE = 'America/Los_Angeles';
const BRAND_QUERY_PATTERNS = [
  'cci',
  'cci services',
  'cciservices',
  'cci services online',
  'chaabane'
];

const GROWTH_SOURCE_STATUS_VALUES = new Set(['fresh', 'stale', 'missing', 'error']);
const DEFAULT_ENV_PATH = path.resolve('.env.local');
const OPTIONAL_GROWTH_EVENTS_WARNINGS = new Set();

function isMissingGrowthEventsColumnError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return error?.code === '42703' && message.includes('events');
}

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

function getDatePartsInTimeZone(value, timeZone) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return { year, month, day };
}

export function formatDateInTimeZone(value, timeZone) {
  const parts = getDatePartsInTimeZone(value, timeZone);
  if (!parts) {
    return '';
  }

  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function shiftDateString(dateString, days = 0) {
  const normalizedDate = toDateString(dateString);
  if (!normalizedDate) {
    return '';
  }

  const date = new Date(`${normalizedDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return toDateString(date);
}

export function getSearchConsoleSyncWindow({
  startDate,
  endDate,
  now = new Date(),
  recentWindowDays = SEARCH_CONSOLE_RECENT_SYNC_WINDOW_DAYS
} = {}) {
  const explicitStartDate = toDateString(startDate);
  const explicitEndDate = toDateString(endDate);

  if (explicitStartDate || explicitEndDate) {
    const resolvedStartDate = explicitStartDate || explicitEndDate;
    const resolvedEndDate = explicitEndDate || explicitStartDate;

    return resolvedStartDate <= resolvedEndDate
      ? {
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
        mode: 'custom'
      }
      : {
        startDate: resolvedEndDate,
        endDate: resolvedStartDate,
        mode: 'custom'
      };
  }

  const windowDays = Math.max(1, Number(recentWindowDays) || 1);
  const resolvedEndDate = formatDateInTimeZone(now, SEARCH_CONSOLE_TIME_ZONE);
  const resolvedStartDate = shiftDateString(resolvedEndDate, -(windowDays - 1));

  return {
    startDate: resolvedStartDate,
    endDate: resolvedEndDate,
    mode: 'rolling_recent'
  };
}

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeNullableText(value) {
  const text = String(value ?? '').trim();
  return text || null;
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

function normalizeNullablePathname(value) {
  const text = normalizeNullableText(value);
  if (!text) {
    return null;
  }

  return normalizePathname(text, '/');
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

function normalizePositiveIntegerOrNull(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Math.round(numericValue);
}

function normalizeDomain(value) {
  const text = normalizeText(value, '');
  if (!text) {
    return '';
  }

  try {
    const normalizedUrl = text.includes('://')
      ? text
      : `https://${text.replace(/^\/+/, '')}`;
    return new URL(normalizedUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch (error) {
    return text.toLowerCase().replace(/^www\./, '').replace(/\/+$/, '');
  }
}

function isSameDomain(resultDomain, targetDomain) {
  return resultDomain === targetDomain || resultDomain.endsWith(`.${targetDomain}`);
}

function doesPathMatch(resultPath, targetPath) {
  if (!targetPath || targetPath === '/') {
    return true;
  }

  return resultPath === targetPath || resultPath.startsWith(`${targetPath}/`);
}

function getPageTypeForPath(pathname = '') {
  const normalizedPath = normalizePathname(pathname, '/');

  if (normalizedPath === '/') {
    return 'home';
  }

  if (
    normalizedPath === '/services'
    || normalizedPath === '/entreprises'
    || normalizedPath === '/salon'
    || normalizedPath === '/tapis'
    || normalizedPath === '/tapisserie'
    || normalizedPath === '/marbre'
    || normalizedPath === '/tfc'
  ) {
    return 'service';
  }

  if (normalizedPath === '/contact') {
    return 'contact';
  }

  if (normalizedPath === '/devis') {
    return 'quote';
  }

  if (normalizedPath.startsWith('/faq')) {
    return 'faq';
  }

  if (normalizedPath.startsWith('/about')) {
    return 'about';
  }

  if (normalizedPath.startsWith('/newsletter')) {
    return 'newsletter';
  }

  if (normalizedPath.startsWith('/admin')) {
    return 'admin';
  }

  if (normalizedPath.startsWith('/conseils/')) {
    return 'article';
  }

  return 'other';
}

function getServiceKeyForPath(pathname = '') {
  const normalizedPath = normalizePathname(pathname, '/').toLowerCase();
  const servicePatterns = [
    ['tapisserie', 'tapisserie'],
    ['salon', 'salon'],
    ['tapis', 'tapis'],
    ['marbre', 'marbre'],
    ['tfc', 'tfc'],
    ['hotel', 'hotel'],
    ['banque', 'banque'],
    ['assurance', 'assurance'],
    ['clinique', 'clinique'],
    ['bureau', 'bureau'],
    ['commerce', 'commerce']
  ];

  for (const [pattern, serviceKey] of servicePatterns) {
    if (
      normalizedPath === `/${pattern}`
      || normalizedPath.startsWith(`/${pattern}/`)
      || normalizedPath.includes(`/${pattern}-`)
      || normalizedPath.includes(`-${pattern}`)
      || normalizedPath.includes(pattern)
    ) {
      return serviceKey;
    }
  }

  return null;
}

function getBusinessLineForPath(pathname = '') {
  const normalizedPath = normalizePathname(pathname, '/').toLowerCase();

  if (normalizedPath === '/entreprises' || normalizedPath.startsWith('/entreprises/')) {
    return 'b2b';
  }

  const serviceKey = getServiceKeyForPath(normalizedPath);
  if (['hotel', 'banque', 'assurance', 'clinique', 'bureau', 'commerce'].includes(serviceKey)) {
    return 'b2b';
  }

  if (['salon', 'tapis', 'tapisserie', 'marbre', 'tfc'].includes(serviceKey)) {
    return 'b2c';
  }

  return 'unknown';
}

function isBrandedGrowthQuery(query = '') {
  const normalizedQuery = normalizeKeywordForKey(query);
  return BRAND_QUERY_PATTERNS.some((pattern) => normalizedQuery.includes(pattern));
}

function buildQueryClusterMetadata(catalogRow = null, landingPage = '/') {
  const normalizedLandingPage = normalizePathname(landingPage, '/');
  const serviceKey = catalogRow?.service_key || getServiceKeyForPath(normalizedLandingPage);
  const pageType = catalogRow?.page_type || getPageTypeForPath(normalizedLandingPage);
  const businessLine = catalogRow?.business_line || getBusinessLineForPath(normalizedLandingPage);
  const clusterLabel = catalogRow?.cluster_label || (serviceKey || pageType || 'other');
  const clusterKey = catalogRow?.cluster_key || normalizeText(clusterLabel, 'other').toLowerCase().replace(/\s+/g, '_');

  return {
    businessLine,
    serviceKey,
    pageType,
    clusterKey,
    clusterLabel
  };
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

export function getSerpApiKey() {
  const apiKey = normalizeText(process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY);
  if (!apiKey) {
    const error = new Error('Missing SERPAPI_API_KEY or SERPAPI_KEY');
    error.code = 'missing_serpapi_api_key';
    throw error;
  }

  return apiKey;
}

export function getSerpApiTargetDomain() {
  const configuredDomain = normalizeDomain(process.env.SERPAPI_TARGET_DOMAIN || process.env.NEXT_PUBLIC_SITE_URL);
  if (!configuredDomain) {
    const error = new Error('Missing SERPAPI_TARGET_DOMAIN or NEXT_PUBLIC_SITE_URL');
    error.code = 'missing_serpapi_target_domain';
    throw error;
  }

  return configuredDomain;
}

export function getSerpApiConfig() {
  const numValue = Number(process.env.SERPAPI_NUM || 20);

  return {
    apiKey: getSerpApiKey(),
    targetDomain: getSerpApiTargetDomain(),
    googleDomain: normalizeText(process.env.SERPAPI_GOOGLE_DOMAIN, 'google.com'),
    gl: normalizeText(process.env.SERPAPI_GL, ''),
    hl: normalizeText(process.env.SERPAPI_HL, ''),
    location: normalizeText(process.env.SERPAPI_LOCATION, ''),
    num: Number.isFinite(numValue) && numValue > 0 ? Math.min(Math.round(numValue), 100) : 20
  };
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
    events: normalizeInteger(row.events),
    clicks: normalizeInteger(row.clicks),
    impressions: normalizeInteger(row.impressions),
    spend: normalizeNumeric(row.spend),
    metadata: row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? row.metadata
      : {}
  };
}

function getGrowthMetricConflictKey(row = {}) {
  return [
    row.metric_date,
    row.metric_source,
    row.source,
    row.medium,
    row.campaign,
    row.landing_page
  ].join('||');
}

export function combineGrowthMetricRows(rows = []) {
  const combined = new Map();

  rows
    .map((row) => normalizeGrowthMetricRow(row))
    .filter((row) => row.metric_date)
    .forEach((row) => {
      const key = getGrowthMetricConflictKey(row);
      const current = combined.get(key) || {
        ...row,
        sessions: 0,
        users: 0,
        events: 0,
        clicks: 0,
        impressions: 0,
        spend: 0,
        metadata: {}
      };

      current.sessions += row.sessions;
      current.users += row.users;
      current.events += row.events;
      current.clicks += row.clicks;
      current.impressions += row.impressions;
      current.spend = normalizeNumeric(current.spend + row.spend);
      current.metadata = {
        ...current.metadata,
        ...row.metadata
      };

      combined.set(key, current);
    });

  return Array.from(combined.values());
}

export function normalizeGrowthQueryMetricRow(row = {}) {
  return {
    metric_date: toDateString(row.metric_date),
    query: normalizeText(row.query),
    normalized_query: normalizeKeywordForKey(row.normalized_query || row.query),
    landing_page: normalizePathname(row.landing_page, '/'),
    normalized_landing_page: normalizePathname(row.normalized_landing_page || row.landing_page, '/'),
    keyword_catalog_id: normalizeNullableText(row.keyword_catalog_id),
    cluster_key: normalizeNullableText(row.cluster_key),
    cluster_label: normalizeNullableText(row.cluster_label),
    business_line: normalizeText(row.business_line, 'unknown'),
    service_key: normalizeNullableText(row.service_key),
    page_type: normalizeText(row.page_type, 'other'),
    clicks: normalizeInteger(row.clicks),
    impressions: normalizeInteger(row.impressions),
    ctr: row.ctr === null || row.ctr === undefined ? null : normalizeNumeric(row.ctr),
    position: row.position === null || row.position === undefined ? null : normalizeNumeric(row.position),
    is_branded: Boolean(row.is_branded),
    metadata: row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? row.metadata
      : {}
  };
}

export function normalizeGrowthKeywordRankingRow(row = {}) {
  return {
    metric_date: toDateString(row.metric_date),
    keyword_catalog_id: normalizeNullableText(row.keyword_catalog_id),
    keyword: normalizeText(row.keyword),
    keyword_label: normalizeText(row.keyword_label || row.keyword, normalizeText(row.keyword)),
    target_domain: normalizeDomain(row.target_domain),
    target_path: normalizePathname(row.target_path || '/', '/'),
    matched_domain: normalizeNullableText(row.matched_domain ? normalizeDomain(row.matched_domain) : null),
    matched_path: normalizeNullablePathname(row.matched_path),
    matched_url: normalizeNullableText(row.matched_url),
    result_title: normalizeNullableText(row.result_title),
    result_snippet: normalizeNullableText(row.result_snippet),
    position: normalizePositiveIntegerOrNull(row.position),
    is_ranked: Boolean(row.is_ranked ?? normalizePositiveIntegerOrNull(row.position)),
    device: normalizeText(row.device, 'desktop'),
    google_domain: normalizeText(row.google_domain, 'google.com'),
    gl: normalizeText(row.gl, ''),
    hl: normalizeText(row.hl, ''),
    location: normalizeText(row.location, ''),
    results_count: normalizeInteger(row.results_count),
    metadata: row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? row.metadata
      : {}
  };
}

export async function upsertGrowthMetricRows(supabase, rows = []) {
  const sanitizedRows = combineGrowthMetricRows(rows);

  if (sanitizedRows.length === 0) {
    return { count: 0 };
  }

  let { error } = await supabase
    .from('growth_channel_daily_metrics')
    .upsert(sanitizedRows, {
      onConflict: 'metric_date,metric_source,source,medium,campaign,landing_page'
    });

  if (error && isMissingGrowthEventsColumnError(error)) {
    if (!OPTIONAL_GROWTH_EVENTS_WARNINGS.has('growth_channel_daily_metrics')) {
      OPTIONAL_GROWTH_EVENTS_WARNINGS.add('growth_channel_daily_metrics');
      console.warn(
        '[growth][reporting] growth_channel_daily_metrics.events is missing; retrying metric upsert without GA4 events until the schema migration is applied.'
      );
    }

    const legacyRows = sanitizedRows.map(({ events, ...legacyRow }) => legacyRow);
    ({ error } = await supabase
      .from('growth_channel_daily_metrics')
      .upsert(legacyRows, {
        onConflict: 'metric_date,metric_source,source,medium,campaign,landing_page'
      }));
  }

  if (error) {
    throw error;
  }

  return {
    count: sanitizedRows.length,
    freshestMetricDate: getMaxMetricDate(sanitizedRows)
  };
}

export async function upsertGrowthQueryMetricRows(supabase, rows = []) {
  const sanitizedRows = rows
    .map((row) => normalizeGrowthQueryMetricRow(row))
    .filter((row) => row.metric_date && row.normalized_query && row.normalized_landing_page);

  if (sanitizedRows.length === 0) {
    return { count: 0 };
  }

  const { error } = await supabase
    .from('growth_query_daily_metrics')
    .upsert(sanitizedRows, {
      onConflict: 'metric_date,normalized_query,normalized_landing_page'
    });

  if (error) {
    throw error;
  }

  return {
    count: sanitizedRows.length,
    freshestMetricDate: getMaxMetricDate(sanitizedRows)
  };
}

export async function upsertGrowthKeywordRankingRows(supabase, rows = []) {
  const sanitizedRows = rows
    .map((row) => normalizeGrowthKeywordRankingRow(row))
    .filter((row) => row.metric_date && row.keyword && row.target_domain);

  if (sanitizedRows.length === 0) {
    return { count: 0 };
  }

  const { error } = await supabase
    .from('growth_keyword_rankings_daily')
    .upsert(sanitizedRows, {
      onConflict: 'metric_date,keyword,target_domain,target_path,device,google_domain,gl,hl,location'
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
    events: metricValues[2]?.value,
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
        { name: 'totalUsers' },
        { name: 'eventCount' }
      ],
      limit: '100000'
    }
  });

  return (response.data.rows || []).map(parseGa4Row);
}

async function fetchSearchConsoleRows({
  startDate,
  endDate,
  dimensions = [],
  dataState = 'all'
} = {}) {
  const property = getSearchConsoleProperty();
  const auth = createGrowthGoogleAuth(['https://www.googleapis.com/auth/webmasters.readonly']);
  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole({
    version: 'v1',
    auth: authClient
  });
  const rows = [];
  let metadata = null;
  let startRow = 0;

  while (true) {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: property,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit: SEARCH_CONSOLE_ROW_LIMIT,
        startRow,
        type: 'web',
        dataState
      }
    });

    const batchRows = response.data.rows || [];
    metadata = response.data.metadata || metadata;
    rows.push(...batchRows);

    if (batchRows.length < SEARCH_CONSOLE_ROW_LIMIT) {
      break;
    }

    startRow += batchRows.length;
  }

  return {
    rows,
    metadata
  };
}

function getKeywordClusterLabelFromCatalogRow(catalogRow = {}) {
  const primaryCategory = Array.isArray(catalogRow.category_tags) ? catalogRow.category_tags[0] : null;
  return normalizeNullableText(primaryCategory);
}

function getKeywordClusterKeyFromLabel(label = '') {
  const normalizedLabel = normalizeText(label, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '');

  return normalizedLabel || null;
}

function buildKeywordCatalogLookup(rows = []) {
  const lookup = new Map();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_KEYWORD_SITE_URL;

  rows.forEach((row) => {
    const clusterLabel = getKeywordClusterLabelFromCatalogRow(row);
    const clusterKey = getKeywordClusterKeyFromLabel(clusterLabel || '');
    const clusterMetadata = buildQueryClusterMetadata({
      cluster_key: clusterKey,
      cluster_label: clusterLabel,
      business_line: getBusinessLineForPath(row.canonical_target_path),
      service_key: getServiceKeyForPath(row.canonical_target_path),
      page_type: getPageTypeForPath(row.canonical_target_path)
    }, row.canonical_target_path);
    const lookupKey = buildKeywordCatalogLookupKeyFromValues({
      keyword: row.display_keyword || row.normalized_keyword,
      targetPath: row.canonical_target_path,
      siteUrl
    });

    lookup.set(lookupKey, {
      id: row.id || null,
      clusterKey: clusterMetadata.clusterKey,
      clusterLabel: clusterMetadata.clusterLabel,
      businessLine: clusterMetadata.businessLine,
      serviceKey: clusterMetadata.serviceKey,
      pageType: clusterMetadata.pageType
    });
  });

  return lookup;
}

function resolveQueryCatalogRow(query, landingPage, catalogLookup) {
  if (!catalogLookup || catalogLookup.size === 0) {
    return null;
  }

  const lookupKey = buildKeywordCatalogLookupKeyFromValues({
    keyword: query,
    targetPath: landingPage,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_KEYWORD_SITE_URL
  });

  return catalogLookup.get(lookupKey) || null;
}

export async function fetchSearchConsoleSnapshotRows({
  startDate,
  endDate,
  dataState = 'all'
} = {}) {
  const { rows, metadata } = await fetchSearchConsoleRows({
    startDate,
    endDate,
    dimensions: ['date', 'page'],
    dataState
  });

  return {
    rows: rows.map((row) => {
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
          source_connector: 'search_console',
          data_state: dataState
        }
      });
    }),
    metadata: metadata || null
  };
}

export async function fetchSearchConsoleQuerySnapshotRows({
  startDate,
  endDate,
  dataState = 'all',
  supabase,
  keywordCatalogRows
} = {}) {
  const { rows, metadata } = await fetchSearchConsoleRows({
    startDate,
    endDate,
    dimensions: ['date', 'page', 'query'],
    dataState
  });
  const resolvedCatalogRows = Array.isArray(keywordCatalogRows)
    ? keywordCatalogRows
    : await loadKeywordCatalogRowsOrEmpty(supabase);
  const catalogLookup = buildKeywordCatalogLookup(resolvedCatalogRows);

  return {
    rows: rows.map((row) => {
      const [metricDate, pageUrl, query] = row.keys || [];
      const normalizedLandingPage = normalizePathname(pageUrl, '/');
      const matchedCatalogRow = resolveQueryCatalogRow(query, normalizedLandingPage, catalogLookup);
      const clusterMetadata = buildQueryClusterMetadata({
        cluster_key: matchedCatalogRow?.clusterKey,
        cluster_label: matchedCatalogRow?.clusterLabel,
        business_line: matchedCatalogRow?.businessLine,
        service_key: matchedCatalogRow?.serviceKey,
        page_type: matchedCatalogRow?.pageType
      }, normalizedLandingPage);

      return normalizeGrowthQueryMetricRow({
        metric_date: metricDate,
        query,
        normalized_query: normalizeKeywordForKey(query),
        landing_page: pageUrl,
        normalized_landing_page: normalizedLandingPage,
        keyword_catalog_id: matchedCatalogRow?.id || null,
        cluster_key: matchedCatalogRow?.clusterKey || clusterMetadata.clusterKey,
        cluster_label: matchedCatalogRow?.clusterLabel || clusterMetadata.clusterLabel,
        business_line: matchedCatalogRow?.businessLine || clusterMetadata.businessLine,
        service_key: matchedCatalogRow?.serviceKey || clusterMetadata.serviceKey,
        page_type: matchedCatalogRow?.pageType || clusterMetadata.pageType,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: typeof row.ctr === 'number'
          ? Math.round(row.ctr * 10000) / 100
          : null,
        position: typeof row.position === 'number'
          ? Math.round(row.position * 100) / 100
          : null,
        is_branded: isBrandedGrowthQuery(query),
        metadata: {
          source_connector: 'search_console',
          matched_catalog: Boolean(matchedCatalogRow),
          data_state: dataState
        }
      });
    }),
    metadata: metadata || null
  };
}

function parseSerpOrganicResult(result, index) {
  const link = result?.link || result?.redirect_link || null;
  if (!link) {
    return null;
  }

  try {
    const url = new URL(link);

    return {
      position: normalizePositiveIntegerOrNull(result.position) || index + 1,
      matchedDomain: normalizeDomain(url.hostname),
      matchedPath: normalizePathname(url.pathname || '/', '/'),
      matchedUrl: url.toString(),
      resultTitle: normalizeNullableText(result.title),
      resultSnippet: normalizeNullableText(result.snippet)
    };
  } catch (error) {
    return null;
  }
}

function findTrackedOrganicResult(organicResults, targetDomain, targetPath = '/') {
  const parsedResults = (organicResults || [])
    .map(parseSerpOrganicResult)
    .filter(Boolean);

  const exactPathMatch = parsedResults.find((result) => (
    isSameDomain(result.matchedDomain, targetDomain)
    && doesPathMatch(result.matchedPath, targetPath)
  ));

  if (exactPathMatch) {
    return exactPathMatch;
  }

  return parsedResults.find((result) => isSameDomain(result.matchedDomain, targetDomain)) || null;
}

export function buildSerpKeywordDeviceCounts(rows = []) {
  return KEYWORD_TRACKED_DEVICES.reduce((accumulator, device) => {
    accumulator[device] = rows.filter((row) => row.device === device).length;
    return accumulator;
  }, {});
}

async function loadActiveKeywordCatalogRows(supabase) {
  const client = supabase || createGrowthServiceClient();
  const { rows, error } = await fetchGrowthKeywordCatalogRows(client, {
    activeOnly: true
  });

  if (error) {
    throw error;
  }

  if (rows.length === 0) {
    const missingCatalogError = new Error('Missing active growth keyword catalog rows');
    missingCatalogError.code = 'missing_serp_keyword_catalog';
    throw missingCatalogError;
  }

  return rows;
}

async function loadKeywordCatalogRowsOrEmpty(supabase) {
  try {
    return await loadActiveKeywordCatalogRows(supabase);
  } catch (error) {
    if (error?.code === 'missing_serp_keyword_catalog') {
      return [];
    }

    throw error;
  }
}

async function fetchSerpApiJson(query = {}) {
  const url = new URL('https://serpapi.com/search.json');

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    headers: {
      accept: 'application/json'
    }
  });

  const responseText = await response.text();
  let payload = null;

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.error || `SerpApi request failed (${response.status})`);
    error.code = response.status === 401 || response.status === 403
      ? 'serpapi_auth_failed'
      : 'serpapi_request_failed';
    throw error;
  }

  if (payload?.error) {
    const error = new Error(payload.error);
    error.code = 'serpapi_request_failed';
    throw error;
  }

  return payload || {};
}

export async function fetchSerpKeywordRankingRows({
  metricDate,
  supabase,
  keywordCatalogRows,
  onProgress
} = {}) {
  const serpConfig = getSerpApiConfig();
  const resolvedMetricDate = toDateString(metricDate) || toDateString(new Date());
  const resolvedCatalogRows = Array.isArray(keywordCatalogRows) && keywordCatalogRows.length > 0
    ? keywordCatalogRows
    : await loadActiveKeywordCatalogRows(supabase);
  const totalRequests = resolvedCatalogRows.length * KEYWORD_TRACKED_DEVICES.length;
  const rows = [];
  let completedRequests = 0;

  for (const catalogRow of resolvedCatalogRows) {
    for (const device of KEYWORD_TRACKED_DEVICES) {
      const payload = await fetchSerpApiJson({
        engine: 'google',
        api_key: serpConfig.apiKey,
        q: catalogRow.display_keyword,
        google_domain: serpConfig.googleDomain,
        gl: serpConfig.gl,
        hl: serpConfig.hl,
        location: serpConfig.location,
        device,
        num: serpConfig.num
      });

      const organicResults = Array.isArray(payload.organic_results) ? payload.organic_results : [];
      const matchedResult = findTrackedOrganicResult(
        organicResults,
        catalogRow.target_domain || serpConfig.targetDomain || normalizeDomain(DEFAULT_KEYWORD_SITE_URL),
        catalogRow.canonical_target_path
      );

      rows.push(normalizeGrowthKeywordRankingRow({
        metric_date: resolvedMetricDate,
        keyword_catalog_id: catalogRow.id,
        keyword: catalogRow.display_keyword,
        keyword_label: catalogRow.display_keyword,
        target_domain: catalogRow.target_domain || serpConfig.targetDomain,
        target_path: catalogRow.canonical_target_path,
        matched_domain: matchedResult?.matchedDomain || null,
        matched_path: matchedResult?.matchedPath || null,
        matched_url: matchedResult?.matchedUrl || null,
        result_title: matchedResult?.resultTitle || null,
        result_snippet: matchedResult?.resultSnippet || null,
        position: matchedResult?.position || null,
        is_ranked: Boolean(matchedResult),
        device,
        google_domain: serpConfig.googleDomain,
        gl: serpConfig.gl,
        hl: serpConfig.hl,
        location: serpConfig.location,
        results_count: organicResults.length,
        metadata: {
          serpapi_search_id: payload?.search_metadata?.id || null,
          keywordCatalogId: catalogRow.id,
          requested_target_path: catalogRow.canonical_target_path,
          query: catalogRow.display_keyword,
          source_connector: 'serpapi',
          categoryTags: catalogRow.category_tags || [],
          priorityTags: catalogRow.priority_tags || [],
          search_parameters: {
            google_domain: serpConfig.googleDomain,
            gl: serpConfig.gl,
            hl: serpConfig.hl,
            location: serpConfig.location,
            device,
            num: serpConfig.num
          }
        }
      }));

      completedRequests += 1;
      if (typeof onProgress === 'function') {
        onProgress({
          completedRequests,
          totalRequests,
          keyword: catalogRow.display_keyword,
          device,
          keywordCatalogId: catalogRow.id
        });
      }
    }
  }

  return rows;
}

export async function syncSearchConsoleGrowthReporting({
  startDate,
  endDate,
  supabase,
  keywordCatalogRows
} = {}) {
  const client = supabase || createGrowthServiceClient();
  const syncWindow = getSearchConsoleSyncWindow({
    startDate,
    endDate
  });
  const resolvedCatalogRows = Array.isArray(keywordCatalogRows)
    ? keywordCatalogRows
    : await loadKeywordCatalogRowsOrEmpty(client);
  const [pageResult, queryResult] = await Promise.all([
    fetchSearchConsoleSnapshotRows({
      startDate: syncWindow.startDate,
      endDate: syncWindow.endDate
    }),
    fetchSearchConsoleQuerySnapshotRows({
      startDate: syncWindow.startDate,
      endDate: syncWindow.endDate,
      supabase: client,
      keywordCatalogRows: resolvedCatalogRows
    })
  ]);
  const pageRows = pageResult.rows || [];
  const queryRows = queryResult.rows || [];
  const [pageUpsertResult, queryUpsertResult] = await Promise.all([
    upsertGrowthMetricRows(client, pageRows),
    upsertGrowthQueryMetricRows(client, queryRows)
  ]);
  const freshestMetricDate = [
    pageUpsertResult.freshestMetricDate,
    queryUpsertResult.freshestMetricDate,
    syncWindow.endDate
  ]
    .filter(Boolean)
    .sort()
    .at(-1) || null;

  return {
    count: pageUpsertResult.count + queryUpsertResult.count,
    freshestMetricDate,
    pageRows,
    queryRows,
    pageRowCount: pageRows.length,
    queryRowCount: queryRows.length,
    matchedCatalogQueryCount: queryRows.filter((row) => row.keyword_catalog_id).length,
    keywordCatalogRowCount: resolvedCatalogRows.length,
    syncWindow,
    pageMetadata: pageResult.metadata || null,
    queryMetadata: queryResult.metadata || null
  };
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
  const requestedStartDate = toDateString(startDate);
  const requestedEndDate = toDateString(endDate);
  const fallbackRange = getDefaultSnapshotRange();
  const resolvedStartDate = requestedStartDate || fallbackRange.startDate;
  const resolvedEndDate = requestedEndDate || fallbackRange.endDate;
  const serpMetricDate = toDateString(new Date());

  const tasks = [
    {
      sourceKey: GROWTH_SOURCE_HEALTH_KEYS.GA4,
      sourceLabel: 'GA4',
      connectorType: 'api',
      fetchRows: () => fetchGa4SnapshotRows({
        startDate: resolvedStartDate,
        endDate: resolvedEndDate
      }),
      upsertRows: upsertGrowthMetricRows,
      freshestMetricDate: resolvedEndDate,
      metadata: {
        startDate: resolvedStartDate,
        endDate: resolvedEndDate
      }
    },
    {
      sourceKey: GROWTH_SOURCE_HEALTH_KEYS.SEARCH_CONSOLE,
      sourceLabel: 'Search Console',
      connectorType: 'api',
      run: () => syncSearchConsoleGrowthReporting({
        startDate: requestedStartDate,
        endDate: requestedEndDate,
        supabase: client
      }),
      freshestMetricDate: requestedEndDate || null,
      metadata: {
        startDate: requestedStartDate || null,
        endDate: requestedEndDate || null,
        syncMode: requestedStartDate || requestedEndDate ? 'custom' : 'rolling_recent'
      },
      buildSuccessMetadata: (_rows, executionResult) => ({
        startDate: executionResult.syncWindow?.startDate || null,
        endDate: executionResult.syncWindow?.endDate || null,
        syncMode: executionResult.syncWindow?.mode || 'custom',
        firstIncompleteDate: executionResult.pageMetadata?.firstIncompleteDate
          || executionResult.queryMetadata?.firstIncompleteDate
          || null,
        pageRowCount: executionResult.pageRowCount,
        queryRowCount: executionResult.queryRowCount,
        matchedCatalogQueryCount: executionResult.matchedCatalogQueryCount,
        keywordCatalogRowCount: executionResult.keywordCatalogRowCount
      })
    },
    {
      sourceKey: GROWTH_SOURCE_HEALTH_KEYS.SERP_KEYWORD_RANKINGS,
      sourceLabel: 'SERP keyword rankings',
      connectorType: 'api',
      fetchRows: () => fetchSerpKeywordRankingRows({
        metricDate: serpMetricDate,
        supabase: client
      }),
      upsertRows: upsertGrowthKeywordRankingRows,
      freshestMetricDate: serpMetricDate,
      metadata: {
        metricDate: serpMetricDate
      },
      buildSuccessMetadata: (rows) => ({
        rowCount: rows.length,
        activeKeywordCount: new Set(rows.map((row) => row.keyword_catalog_id).filter(Boolean)).size,
        deviceRowCounts: buildSerpKeywordDeviceCounts(rows)
      })
    }
  ];

  const results = [];

  for (const task of tasks) {
    const startedAt = new Date().toISOString();

    try {
      const executionResult = task.run
        ? await task.run()
        : await (async () => {
          const rows = await task.fetchRows();
          const upsertResult = await task.upsertRows(client, rows);

          return {
            rows,
            ...upsertResult
          };
        })();
      const successMetadata = task.buildSuccessMetadata
        ? task.buildSuccessMetadata(executionResult.rows || [], executionResult)
        : {
          rowCount: Array.isArray(executionResult.rows)
            ? executionResult.rows.length
            : executionResult.count
        };

      await upsertGrowthSourceHealth(client, [
        buildSuccessHealthRecord({
          sourceKey: task.sourceKey,
          sourceLabel: task.sourceLabel,
          connectorType: task.connectorType,
          metricCount: executionResult.count,
          freshestMetricDate: executionResult.freshestMetricDate || task.freshestMetricDate,
          startedAt,
          metadata: {
            ...task.metadata,
            ...successMetadata
          }
        })
      ]);

      results.push({
        sourceKey: task.sourceKey,
        status: 'success',
        metricCount: executionResult.count,
        freshestMetricDate: executionResult.freshestMetricDate || task.freshestMetricDate
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
            ...task.metadata
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
