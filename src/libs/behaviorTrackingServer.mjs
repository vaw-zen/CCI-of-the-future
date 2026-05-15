import { createServiceClient } from './supabase.js';
import { normalizeBehaviorEventPayload } from './behaviorTracking.mjs';

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeNullableText(value) {
  const text = normalizeText(value, '');
  return text || null;
}

function buildServerBehaviorSourcePayload(analyticsContext = {}) {
  return {
    ga_client_id: normalizeNullableText(analyticsContext.ga_client_id),
    landing_page: normalizeText(analyticsContext.landing_page, '/'),
    entry_path: normalizeText(
      analyticsContext.entry_path || analyticsContext.landing_page,
      normalizeText(analyticsContext.landing_page, '/')
    ),
    session_source: normalizeText(analyticsContext.session_source, 'direct'),
    session_medium: normalizeText(analyticsContext.session_medium, '(none)'),
    session_campaign: normalizeText(analyticsContext.session_campaign, '(not set)')
  };
}

export function buildServerTerminalBehaviorPayload({
  rawEventName = '',
  analyticsContext = {},
  formName = '',
  formPlacement = '',
  funnelName = '',
  businessLine = '',
  serviceType = '',
  leadType = '',
  occurredAt = new Date().toISOString(),
  additionalPayload = {}
} = {}) {
  return normalizeBehaviorEventPayload(rawEventName, {
    ...buildServerBehaviorSourcePayload(analyticsContext),
    form_name: formName,
    form_placement: formPlacement,
    funnel_name: funnelName,
    business_line: businessLine,
    service_type: normalizeNullableText(serviceType) || undefined,
    lead_type: normalizeNullableText(leadType) || undefined,
    contact_method: 'form',
    ...additionalPayload
  }, occurredAt);
}

export async function persistServerTerminalBehaviorEvent({
  supabase = null,
  rawEventName = '',
  analyticsContext = {},
  formName = '',
  formPlacement = '',
  funnelName = '',
  businessLine = '',
  serviceType = '',
  leadType = '',
  occurredAt = new Date().toISOString(),
  additionalPayload = {}
} = {}) {
  const payload = buildServerTerminalBehaviorPayload({
    rawEventName,
    analyticsContext,
    formName,
    formPlacement,
    funnelName,
    businessLine,
    serviceType,
    leadType,
    occurredAt,
    additionalPayload
  });

  if (!payload) {
    return {
      persisted: false,
      reason: 'ignored',
      payload: null
    };
  }

  let client = supabase;
  try {
    client = client || createServiceClient();
  } catch (error) {
    return {
      persisted: false,
      reason: 'config_error',
      error,
      payload
    };
  }

  const { data, error } = await client
    .from('growth_behavior_events')
    .insert(payload)
    .select([
      'id',
      'occurred_at',
      'event_name',
      'step_name',
      'form_name',
      'business_line'
    ].join(','))
    .single();

  if (error) {
    console.error('[behavior][server] terminal event insert failed:', error);
    return {
      persisted: false,
      reason: 'database_error',
      error,
      payload
    };
  }

  return {
    persisted: true,
    reason: 'success',
    payload,
    data
  };
}
