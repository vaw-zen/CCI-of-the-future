import { sanitizePayload } from '../utils/analyticsGateway.js';

export const WHATSAPP_MATCH_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeText(value, fallback = '') {
  const text = String(value || '').trim();
  if (!text) {
    return fallback;
  }

  return text;
}

function normalizeNullableText(value) {
  const text = normalizeText(value, '');
  return text || null;
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeIsoTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getLeadField(source, snakeKey, camelKey) {
  return source?.[snakeKey] ?? source?.[camelKey];
}

export function normalizeWhatsAppClickPayload(rawPayload = {}, nowIso = new Date().toISOString()) {
  const payload = sanitizePayload(rawPayload);
  const clickedAt = normalizeIsoTimestamp(payload.clicked_at) || nowIso;

  return {
    ga_client_id: normalizeNullableText(payload.ga_client_id),
    event_label: normalizeText(payload.event_label || payload.location, 'unknown'),
    page_path: normalizeText(
      payload.page_path || payload.entry_path || payload.page_location || payload.landing_page,
      '/'
    ),
    landing_page: normalizeText(
      payload.landing_page || payload.page_path || payload.entry_path,
      '/'
    ),
    session_source: normalizeText(payload.session_source, 'direct'),
    session_medium: normalizeText(payload.session_medium, '(none)'),
    session_campaign: normalizeText(payload.session_campaign, '(not set)'),
    referrer_host: normalizeNullableText(payload.referrer_host),
    clicked_at: clickedAt
  };
}

export function normalizeWhatsAppClickRow(row = {}) {
  return {
    id: row.id || null,
    gaClientId: normalizeNullableText(row.ga_client_id),
    eventLabel: normalizeText(row.event_label, 'unknown'),
    pagePath: normalizeText(row.page_path, '/'),
    landingPage: normalizeText(row.landing_page, '/'),
    sessionSource: normalizeText(row.session_source, 'direct'),
    sessionMedium: normalizeText(row.session_medium, '(none)'),
    sessionCampaign: normalizeText(row.session_campaign, '(not set)'),
    referrerHost: normalizeNullableText(row.referrer_host),
    clickedAt: normalizeIsoTimestamp(row.clicked_at),
    createdAt: normalizeIsoTimestamp(row.created_at)
  };
}

export function getWhatsAppMatchWindowStart(beforeIso, lookbackDays = WHATSAPP_MATCH_WINDOW_DAYS) {
  const beforeDate = new Date(beforeIso);
  if (Number.isNaN(beforeDate.getTime())) {
    return null;
  }

  return new Date(beforeDate.getTime() - (lookbackDays * DAY_MS)).toISOString();
}

export function isWithinWhatsAppMatchWindow(clickedAt, leadCreatedAt, lookbackDays = WHATSAPP_MATCH_WINDOW_DAYS) {
  const clickDate = new Date(clickedAt);
  const leadDate = new Date(leadCreatedAt);

  if (Number.isNaN(clickDate.getTime()) || Number.isNaN(leadDate.getTime())) {
    return false;
  }

  if (clickDate.getTime() > leadDate.getTime()) {
    return false;
  }

  return (leadDate.getTime() - clickDate.getTime()) <= (lookbackDays * DAY_MS);
}

export function pickLatestEligibleWhatsAppClick(clickRows = [], leadCreatedAt, lookbackDays = WHATSAPP_MATCH_WINDOW_DAYS) {
  return (clickRows || [])
    .map(normalizeWhatsAppClickRow)
    .filter((row) => row.clickedAt && isWithinWhatsAppMatchWindow(row.clickedAt, leadCreatedAt, lookbackDays))
    .sort((a, b) => b.clickedAt.localeCompare(a.clickedAt))[0] || null;
}

export async function findLatestWhatsAppClickMatch(supabase, {
  gaClientId,
  beforeIso,
  lookbackDays = WHATSAPP_MATCH_WINDOW_DAYS
} = {}) {
  const cleanClientId = normalizeNullableText(gaClientId);
  const cleanBeforeIso = normalizeIsoTimestamp(beforeIso);

  if (!supabase || !cleanClientId || !cleanBeforeIso) {
    return null;
  }

  const fromIso = getWhatsAppMatchWindowStart(cleanBeforeIso, lookbackDays);
  if (!fromIso) {
    return null;
  }

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
    .eq('ga_client_id', cleanClientId)
    .gte('clicked_at', fromIso)
    .lte('clicked_at', cleanBeforeIso)
    .order('clicked_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] ? normalizeWhatsAppClickRow(data[0]) : null;
}

export function buildWhatsAppAttributionColumns(clickRow = null) {
  const normalizedRow = clickRow ? normalizeWhatsAppClickRow(clickRow) : null;

  return {
    whatsapp_click_id: normalizedRow?.id || null,
    whatsapp_clicked_at: normalizedRow?.clickedAt || null,
    whatsapp_click_label: normalizedRow?.eventLabel || null,
    whatsapp_click_page: normalizedRow?.pagePath || null
  };
}

export function buildWhatsAppManualTagPatch(enabled, nowIso = new Date().toISOString()) {
  return {
    whatsapp_manual_tag: Boolean(enabled),
    whatsapp_manual_tagged_at: enabled ? nowIso : null
  };
}

export function hasWhatsAppAutoAttribution(value = {}) {
  return Boolean(
    getLeadField(value, 'whatsapp_click_id', 'whatsappClickId')
    || getLeadField(value, 'whatsapp_clicked_at', 'whatsappClickedAt')
    || getLeadField(value, 'whatsapp_click_label', 'whatsappClickLabel')
    || getLeadField(value, 'whatsapp_click_page', 'whatsappClickPage')
  );
}

export function hasWhatsAppManualTag(value = {}) {
  return normalizeBoolean(getLeadField(value, 'whatsapp_manual_tag', 'whatsappManualTag'));
}

export function getWhatsAppAttributionMode(value = {}) {
  const hasAuto = hasWhatsAppAutoAttribution(value);
  const hasManual = hasWhatsAppManualTag(value);

  if (hasAuto && hasManual) {
    return 'auto_manual';
  }

  if (hasAuto) {
    return 'auto';
  }

  if (hasManual) {
    return 'manual';
  }

  return 'none';
}

export function isWhatsAppAttributed(value = {}) {
  return getWhatsAppAttributionMode(value) !== 'none';
}

export function getWhatsAppAttributionLabel(value = {}) {
  const mode = typeof value === 'string' ? value : getWhatsAppAttributionMode(value);

  if (mode === 'auto_manual') {
    return 'Auto + manuel';
  }

  if (mode === 'auto') {
    return 'Auto';
  }

  if (mode === 'manual') {
    return 'Manuel';
  }

  return 'Aucun';
}

export function matchesWhatsAppFilter(value = {}, filter = 'all') {
  const mode = getWhatsAppAttributionMode(value);

  if (filter === 'all') {
    return true;
  }

  if (filter === 'any') {
    return mode !== 'none';
  }

  if (filter === 'auto') {
    return mode === 'auto' || mode === 'auto_manual';
  }

  if (filter === 'manual') {
    return mode === 'manual' || mode === 'auto_manual';
  }

  if (filter === 'both') {
    return mode === 'auto_manual';
  }

  if (filter === 'none') {
    return mode === 'none';
  }

  return true;
}

export function getWhatsAppAttributionSummary(value = {}) {
  return {
    mode: getWhatsAppAttributionMode(value),
    label: getWhatsAppAttributionLabel(value),
    isAttributed: isWhatsAppAttributed(value),
    hasAutomaticMatch: hasWhatsAppAutoAttribution(value),
    hasManualTag: hasWhatsAppManualTag(value),
    clickLabel: normalizeNullableText(getLeadField(value, 'whatsapp_click_label', 'whatsappClickLabel')),
    clickPage: normalizeNullableText(getLeadField(value, 'whatsapp_click_page', 'whatsappClickPage')),
    clickedAt: normalizeIsoTimestamp(getLeadField(value, 'whatsapp_clicked_at', 'whatsappClickedAt')),
    manualTaggedAt: normalizeIsoTimestamp(getLeadField(value, 'whatsapp_manual_tagged_at', 'whatsappManualTaggedAt'))
  };
}
