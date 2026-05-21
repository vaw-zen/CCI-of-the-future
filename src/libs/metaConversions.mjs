import crypto from 'node:crypto';
import { META_LEAD_SOURCES, normalizeMetaLeadSource } from './metaAttribution.mjs';

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeNullableText(value) {
  const text = normalizeText(value, '');
  return text || null;
}

function hashIfPresent(value = '') {
  const normalized = normalizeText(value, '').toLowerCase();
  if (!normalized) {
    return null;
  }

  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function normalizePhoneForHash(value = '') {
  return normalizeText(value, '').replace(/\D+/g, '');
}

function getLeadIdentity(leadRecord = {}) {
  if (leadRecord.nom || leadRecord.prenom) {
    return {
      firstName: normalizeNullableText(leadRecord.prenom),
      lastName: normalizeNullableText(leadRecord.nom)
    };
  }

  if (leadRecord.contact_nom || leadRecord.contact_prenom) {
    return {
      firstName: normalizeNullableText(leadRecord.contact_prenom),
      lastName: normalizeNullableText(leadRecord.contact_nom)
    };
  }

  return {
    firstName: normalizeNullableText(leadRecord.contact_prenom),
    lastName: normalizeNullableText(leadRecord.contact_nom)
  };
}

export function createMetaLeadEventId(prefix = 'meta_lead') {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function buildMetaLeadUserData({
  leadRecord = {},
  analyticsContext = {},
  request = null
} = {}) {
  const leadIdentity = getLeadIdentity(leadRecord);
  const clientIpAddress = normalizeText(
    request?.headers?.get?.('x-forwarded-for')?.split(',')[0]
    || request?.headers?.get?.('x-real-ip')
    || '',
    ''
  );

  return {
    em: hashIfPresent(leadRecord.email),
    ph: hashIfPresent(normalizePhoneForHash(leadRecord.telephone)),
    fn: hashIfPresent(leadIdentity.firstName),
    ln: hashIfPresent(leadIdentity.lastName),
    client_ip_address: clientIpAddress || undefined,
    client_user_agent: normalizeText(request?.headers?.get?.('user-agent'), '') || undefined,
    fbc: normalizeNullableText(leadRecord.meta_fbc || analyticsContext.meta_fbc) || undefined,
    fbp: normalizeNullableText(leadRecord.meta_fbp || analyticsContext.meta_fbp) || undefined
  };
}

export function buildMetaLeadConversionPayload({
  leadKind = '',
  leadRecord = {},
  analyticsContext = {},
  request = null,
  eventId = createMetaLeadEventId(),
  eventTime = Math.floor(Date.now() / 1000)
} = {}) {
  const userData = buildMetaLeadUserData({
    leadRecord,
    analyticsContext,
    request
  });
  const eventSourceUrl = normalizeText(
    analyticsContext.page_location
    || analyticsContext.landing_location
    || request?.headers?.get?.('referer')
    || leadRecord.landing_page,
    ''
  );

  return {
    event_id: eventId,
    event_name: 'Lead',
    event_time: Number.isFinite(Number(eventTime)) ? Number(eventTime) : Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: eventSourceUrl || undefined,
    user_data: Object.fromEntries(
      Object.entries(userData).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ),
    custom_data: Object.fromEntries(
      Object.entries({
        lead_kind: normalizeText(leadKind, ''),
        business_line: normalizeText(leadRecord.business_line || analyticsContext.business_line, ''),
        service_type: normalizeText(leadRecord.type_service || leadRecord.primary_service || analyticsContext.service_type, ''),
        session_source: normalizeText(leadRecord.session_source || analyticsContext.session_source, ''),
        session_medium: normalizeText(leadRecord.session_medium || analyticsContext.session_medium, ''),
        session_campaign: normalizeText(leadRecord.session_campaign || analyticsContext.session_campaign, ''),
        meta_platform: normalizeText(leadRecord.meta_platform || analyticsContext.meta_platform, ''),
        meta_lead_source: normalizeMetaLeadSource(
          leadRecord.meta_lead_source || analyticsContext.meta_lead_source,
          META_LEAD_SOURCES.WEBSITE
        )
      }).filter(([, value]) => value)
    )
  };
}

async function logMetaConversionEvent(client, record = {}) {
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('meta_conversion_event_log')
    .insert(record)
    .select([
      'id',
      'event_id',
      'event_name',
      'send_status',
      'created_at'
    ].join(','))
    .single();

  if (error) {
    console.error('[meta] conversion log insert failed:', error);
    return null;
  }

  return data;
}

export async function sendMetaLeadConversion({
  supabase,
  request = null,
  leadKind = '',
  leadRecord = {},
  analyticsContext = {},
  eventId = createMetaLeadEventId()
} = {}) {
  const pixelId = normalizeText(process.env.META_PIXEL_ID || process.env.FB_PIXEL_ID, '');
  const accessToken = normalizeText(process.env.META_CONVERSIONS_API_ACCESS_TOKEN, '');
  const apiVersion = normalizeText(process.env.META_API_VERSION || process.env.FB_API_VERSION, 'v20.0');
  const testEventCode = normalizeText(process.env.META_TEST_EVENT_CODE, '');
  const payload = buildMetaLeadConversionPayload({
    leadKind,
    leadRecord,
    analyticsContext,
    request,
    eventId
  });

  const logBaseRecord = {
    event_id: payload.event_id,
    event_name: payload.event_name,
    lead_kind: normalizeNullableText(leadKind),
    lead_id: normalizeNullableText(leadRecord.id),
    meta_fbc: normalizeNullableText(payload.user_data?.fbc),
    meta_fbp: normalizeNullableText(payload.user_data?.fbp)
  };

  if (!pixelId || !accessToken) {
    await logMetaConversionEvent(supabase, {
      ...logBaseRecord,
      send_status: 'skipped_config',
      response_summary: {
        reason: 'missing_meta_config'
      }
    });

    return {
      sent: false,
      eventId,
      status: 'skipped_config'
    };
  }

  const body = {
    data: [payload]
  };
  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const responseSummary = await response.json().catch(() => ({}));

    await logMetaConversionEvent(supabase, {
      ...logBaseRecord,
      send_status: response.ok ? 'sent' : 'failed',
      response_summary: {
        request: payload,
        response: responseSummary
      }
    });

    return {
      sent: response.ok,
      eventId,
      status: response.ok ? 'sent' : 'failed',
      responseSummary
    };
  } catch (error) {
    await logMetaConversionEvent(supabase, {
      ...logBaseRecord,
      send_status: 'request_error',
      response_summary: {
        request: payload,
        message: error?.message || 'request_failed'
      }
    });

    return {
      sent: false,
      eventId,
      status: 'request_error',
      error
    };
  }
}
