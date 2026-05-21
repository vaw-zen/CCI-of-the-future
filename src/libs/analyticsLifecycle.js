import { sendMeasurementEvent } from './ga4Measurement.js';
import { normalizeAnalyticsAttributionContext } from './attributionHygiene.mjs';
import { sanitizePayload } from '../utils/analyticsGateway.js';

const ATTRIBUTION_KEYS = [
  'ga_client_id',
  'landing_page',
  'landing_location',
  'session_source',
  'session_medium',
  'session_campaign',
  'referrer_host',
  'entry_path',
  'page_path',
  'page_location',
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
  'calculator_estimate',
  'selected_services'
];

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return items.length > 0 ? items : null;
}

function normalizeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function extractAnalyticsContext(rawContext = {}, options = {}) {
  const context = Object.fromEntries(
    ATTRIBUTION_KEYS.map((key) => [key, rawContext?.[key]])
  );

  const sanitizedContext = sanitizePayload(context);
  const normalizedAttribution = normalizeAnalyticsAttributionContext(sanitizedContext, options);

  return {
    ...normalizedAttribution,
    selected_services: normalizeStringArray(sanitizedContext.selected_services),
    calculator_estimate: normalizeNumber(sanitizedContext.calculator_estimate)
  };
}

export function buildAttributionColumns(rawContext = {}, options = {}) {
  const context = extractAnalyticsContext(rawContext, options);

  return {
    ga_client_id: context.ga_client_id || null,
    landing_page: context.landing_page || null,
    session_source: context.session_source || null,
    session_medium: context.session_medium || null,
    session_campaign: context.session_campaign || null,
    referrer_host: context.referrer_host || null,
    entry_path: context.entry_path || context.landing_page || null,
    fbclid: context.fbclid || null,
    meta_fbc: context.meta_fbc || null,
    meta_fbp: context.meta_fbp || null,
    meta_platform: context.meta_platform || null,
    meta_lead_source: context.meta_lead_source || null,
    meta_campaign_id: context.meta_campaign_id || null,
    meta_adset_id: context.meta_adset_id || null,
    meta_ad_id: context.meta_ad_id || null,
    meta_leadgen_id: context.meta_leadgen_id || null,
    meta_form_id: context.meta_form_id || null,
    meta_page_id: context.meta_page_id || null,
    calculator_estimate: context.calculator_estimate,
    selected_services: context.selected_services
  };
}

export async function sendLifecycleMeasurementEvent({
  clientId = '',
  eventName,
  eventParams = {}
} = {}) {
  if (!clientId || !eventName) {
    return { sent: false, reason: 'missing_client_id_or_event_name' };
  }

  try {
    return await sendMeasurementEvent({
      clientId,
      eventName,
      eventParams: sanitizePayload(eventParams)
    });
  } catch (error) {
    return {
      sent: false,
      reason: error?.message || 'request_failed'
    };
  }
}

export function buildLeadMeasurementParams({
  leadRecord,
  leadType,
  businessLine,
  previousStatus = '',
  additionalParams = {}
} = {}) {
  return sanitizePayload({
    lead_id: leadRecord?.id,
    lead_type: leadType,
    business_line: businessLine,
    lead_status: leadRecord?.lead_status,
    lead_quality_outcome: leadRecord?.lead_quality_outcome,
    previous_status: previousStatus || undefined,
    service_type: leadRecord?.type_service,
    services_count: Array.isArray(leadRecord?.services_souhaites)
      ? leadRecord.services_souhaites.length
      : additionalParams.services_count,
    calculator_estimate: leadRecord?.calculator_estimate,
    session_source: leadRecord?.session_source,
    session_medium: leadRecord?.session_medium,
    session_campaign: leadRecord?.session_campaign,
    landing_page: leadRecord?.landing_page,
    referrer_host: leadRecord?.referrer_host,
    meta_platform: leadRecord?.meta_platform,
    meta_lead_source: leadRecord?.meta_lead_source,
    meta_campaign_id: leadRecord?.meta_campaign_id,
    meta_adset_id: leadRecord?.meta_adset_id,
    meta_ad_id: leadRecord?.meta_ad_id,
    whatsapp_attributed: Boolean(
      leadRecord?.whatsapp_click_id
      || leadRecord?.whatsapp_clicked_at
      || leadRecord?.whatsapp_manual_tag
    ),
    whatsapp_manual_tag: leadRecord?.whatsapp_manual_tag,
    whatsapp_click_label: leadRecord?.whatsapp_click_label,
    whatsapp_click_page: leadRecord?.whatsapp_click_page,
    ...additionalParams
  });
}
