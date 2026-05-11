import {
  deriveLeadQualityOutcomeFromStatus,
  getDefaultFollowUpSlaAt,
  LEAD_STATUSES,
  LEAD_STATUS_OPTIONS
} from '../utils/leadLifecycle.js';

export const WHATSAPP_DIRECT_LEAD_TABLE = 'whatsapp_direct_leads';
export const WHATSAPP_DIRECT_LEAD_KIND = 'whatsapp';
export const WHATSAPP_DIRECT_ATTRIBUTION_LABEL = 'Manuel (direct chat)';
export const WHATSAPP_DIRECT_LEAD_MIGRATION_HINT = 'Appliquez la migration `supabase/20260511_whatsapp_direct_leads.sql` sur la base ciblée.';

export const WHATSAPP_DIRECT_LEAD_BUSINESS_LINES = [
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b', label: 'B2B' }
];

export const WHATSAPP_DIRECT_LEAD_SCHEDULE_TYPES = [
  { value: 'service', label: 'Prestation' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'meeting', label: 'Rendez-vous' },
  { value: 'callback', label: 'Rappel' },
  { value: 'other', label: 'Autre' }
];

export const WHATSAPP_DIRECT_LEAD_SERVICE_OPTIONS = [
  { value: 'salon', label: 'Salon', businessLine: 'b2c' },
  { value: 'tapis', label: 'Tapis / moquettes', businessLine: 'b2c' },
  { value: 'tapisserie', label: 'Tapisserie', businessLine: 'b2c' },
  { value: 'marbre', label: 'Marbre', businessLine: 'b2c' },
  { value: 'tfc', label: 'TFC', businessLine: 'b2c' },
  { value: 'banque', label: 'Banque', businessLine: 'b2b' },
  { value: 'assurance', label: 'Assurance', businessLine: 'b2b' },
  { value: 'clinique', label: 'Clinique', businessLine: 'b2b' },
  { value: 'hotel', label: 'Hôtel', businessLine: 'b2b' },
  { value: 'bureau', label: 'Bureau', businessLine: 'b2b' },
  { value: 'commerce', label: 'Commerce', businessLine: 'b2b' },
  { value: 'autre', label: 'Autre', businessLine: 'all' }
];

export const WHATSAPP_DIRECT_LEAD_SELECT_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'lead_captured_at',
  'business_line',
  'contact_name',
  'company_name',
  'telephone',
  'email',
  'service_key',
  'notes',
  'scheduled_type',
  'scheduled_at',
  'lead_status',
  'lead_quality_outcome',
  'lead_owner',
  'submitted_at',
  'qualified_at',
  'closed_at',
  'follow_up_sla_at',
  'last_worked_at',
  'session_source',
  'session_medium',
  'session_campaign',
  'referrer_host',
  'landing_page',
  'entry_path',
  'whatsapp_manual_tag',
  'whatsapp_manual_tagged_at'
].join(',');

const VALID_BUSINESS_LINES = new Set(
  WHATSAPP_DIRECT_LEAD_BUSINESS_LINES.map((option) => option.value)
);
const VALID_SCHEDULE_TYPES = new Set(
  WHATSAPP_DIRECT_LEAD_SCHEDULE_TYPES.map((option) => option.value)
);
const VALID_SERVICE_KEYS = new Set(
  WHATSAPP_DIRECT_LEAD_SERVICE_OPTIONS.map((option) => option.value)
);

function normalizeText(value, fallback = '') {
  const normalized = String(value || '').trim();
  return normalized || fallback;
}

function normalizeNullableText(value) {
  const normalized = normalizeText(value, '');
  return normalized || null;
}

function normalizeIso(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function normalizePhone(value) {
  const normalized = normalizeText(value, '');
  return normalized || null;
}

function normalizePhoneDigits(value) {
  return String(value || '').replace(/\D+/g, '');
}

function normalizeServiceKey(value) {
  const normalized = normalizeText(value, '').toLowerCase();
  if (!normalized) {
    return null;
  }

  return VALID_SERVICE_KEYS.has(normalized) ? normalized : 'autre';
}

function normalizeScheduleType(value) {
  const normalized = normalizeText(value, '').toLowerCase();
  if (!normalized) {
    return null;
  }

  return VALID_SCHEDULE_TYPES.has(normalized) ? normalized : 'other';
}

function normalizeBusinessLine(value) {
  const normalized = normalizeText(value, '').toLowerCase();
  return VALID_BUSINESS_LINES.has(normalized) ? normalized : null;
}

function normalizeLeadStatus(value) {
  const normalized = normalizeText(value, LEAD_STATUSES.SUBMITTED);
  return LEAD_STATUS_OPTIONS.includes(normalized) ? normalized : null;
}

function normalizeOptionalEmail(value) {
  const normalized = normalizeNullableText(value);
  if (!normalized) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

export function filterWhatsAppServiceOptions(businessLine = '') {
  if (!businessLine) {
    return WHATSAPP_DIRECT_LEAD_SERVICE_OPTIONS;
  }

  return WHATSAPP_DIRECT_LEAD_SERVICE_OPTIONS.filter((option) => (
    option.businessLine === businessLine || option.businessLine === 'all'
  ));
}

export function normalizePhoneSearchTerm(value) {
  return normalizePhoneDigits(value);
}

export function matchesWhatsAppDirectPhone(value, searchTerm) {
  const normalizedSearch = normalizePhoneSearchTerm(searchTerm);
  if (!normalizedSearch) {
    return true;
  }

  return normalizePhoneDigits(value).includes(normalizedSearch);
}

export function isMissingWhatsAppDirectLeadSchemaError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const referencesTable = message.includes('whatsapp_direct_leads');
  const missingRelation = message.includes('relation') && message.includes('does not exist');
  const missingSchemaCacheEntry = message.includes('schema cache') || message.includes('could not find the table');

  return (
    error?.code === '42P01'
    || (referencesTable && missingRelation)
    || (referencesTable && missingSchemaCacheEntry)
  );
}

export function validateWhatsAppDirectLeadPayload(rawPayload = {}) {
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    return {
      ok: false,
      error: 'invalid_payload',
      message: 'Payload lead WhatsApp invalide.'
    };
  }

  const businessLine = normalizeBusinessLine(rawPayload.businessLine || rawPayload.business_line);
  if (!businessLine) {
    return {
      ok: false,
      error: 'invalid_business_line',
      message: 'Business line WhatsApp invalide.'
    };
  }

  const contactName = normalizeNullableText(rawPayload.contactName || rawPayload.contact_name);
  if (!contactName) {
    return {
      ok: false,
      error: 'missing_contact_name',
      message: 'Le nom du contact est obligatoire.'
    };
  }

  const companyName = normalizeNullableText(rawPayload.companyName || rawPayload.company_name);
  if (businessLine === 'b2b' && !companyName) {
    return {
      ok: false,
      error: 'missing_company_name',
      message: 'La société est obligatoire pour un lead B2B.'
    };
  }

  const telephone = normalizePhone(rawPayload.telephone);
  const phoneDigits = normalizePhoneDigits(telephone);
  if (!telephone || phoneDigits.length < 8) {
    return {
      ok: false,
      error: 'invalid_telephone',
      message: 'Le numéro de téléphone est obligatoire et doit être valide.'
    };
  }

  const leadCapturedAt = normalizeIso(rawPayload.leadCapturedAt || rawPayload.lead_captured_at);
  if (!leadCapturedAt) {
    return {
      ok: false,
      error: 'invalid_lead_captured_at',
      message: 'La date de capture du lead est obligatoire.'
    };
  }

  const leadStatus = normalizeLeadStatus(rawPayload.leadStatus || rawPayload.lead_status || LEAD_STATUSES.SUBMITTED);
  if (!leadStatus) {
    return {
      ok: false,
      error: 'invalid_lead_status',
      message: 'Le statut du lead est invalide.'
    };
  }

  const scheduledAt = normalizeIso(rawPayload.scheduledAt || rawPayload.scheduled_at);
  if ((rawPayload.scheduledAt || rawPayload.scheduled_at) && !scheduledAt) {
    return {
      ok: false,
      error: 'invalid_scheduled_at',
      message: 'La date planifiée est invalide.'
    };
  }

  const followUpSlaAt = normalizeIso(rawPayload.followUpSlaAt || rawPayload.follow_up_sla_at);
  if ((rawPayload.followUpSlaAt || rawPayload.follow_up_sla_at) && !followUpSlaAt) {
    return {
      ok: false,
      error: 'invalid_follow_up_sla_at',
      message: 'La date SLA est invalide.'
    };
  }

  const email = normalizeOptionalEmail(rawPayload.email);
  if (normalizeText(rawPayload.email, '') && !email) {
    return {
      ok: false,
      error: 'invalid_email',
      message: 'L’adresse email est invalide.'
    };
  }

  return {
    ok: true,
    data: {
      businessLine,
      contactName,
      companyName,
      telephone,
      email,
      serviceKey: normalizeServiceKey(rawPayload.serviceKey || rawPayload.service_key),
      notes: normalizeNullableText(rawPayload.notes),
      scheduledType: normalizeScheduleType(rawPayload.scheduledType || rawPayload.scheduled_type),
      scheduledAt,
      leadStatus,
      leadOwner: normalizeNullableText(rawPayload.leadOwner || rawPayload.lead_owner),
      leadCapturedAt,
      followUpSlaAt,
      referrerHost: normalizeNullableText(rawPayload.referrerHost || rawPayload.referrer_host),
      landingPage: normalizeNullableText(rawPayload.landingPage || rawPayload.landing_page),
      entryPath: normalizeNullableText(rawPayload.entryPath || rawPayload.entry_path)
    }
  };
}

export function buildWhatsAppDirectLeadInsert(rawPayload = {}, nowIso = new Date().toISOString()) {
  const validation = validateWhatsAppDirectLeadPayload(rawPayload);
  if (!validation.ok) {
    return validation;
  }

  const payload = validation.data;
  const followUpSlaAt = payload.followUpSlaAt
    || payload.scheduledAt
    || getDefaultFollowUpSlaAt(payload.leadCapturedAt);

  const qualifiedAt = (
    payload.leadStatus === LEAD_STATUSES.QUALIFIED
    || payload.leadStatus === LEAD_STATUSES.CLOSED_WON
    || payload.leadStatus === LEAD_STATUSES.CLOSED_LOST
  )
    ? payload.leadCapturedAt
    : null;
  const closedAt = (
    payload.leadStatus === LEAD_STATUSES.CLOSED_WON
    || payload.leadStatus === LEAD_STATUSES.CLOSED_LOST
  )
    ? payload.leadCapturedAt
    : null;

  return {
    ok: true,
    data: {
      lead_captured_at: payload.leadCapturedAt,
      business_line: payload.businessLine,
      contact_name: payload.contactName,
      company_name: payload.companyName,
      telephone: payload.telephone,
      email: payload.email,
      service_key: payload.serviceKey,
      notes: payload.notes,
      scheduled_type: payload.scheduledType,
      scheduled_at: payload.scheduledAt,
      lead_status: payload.leadStatus,
      lead_quality_outcome: deriveLeadQualityOutcomeFromStatus(payload.leadStatus),
      lead_owner: payload.leadOwner,
      submitted_at: payload.leadCapturedAt,
      qualified_at: qualifiedAt,
      closed_at: closedAt,
      follow_up_sla_at: followUpSlaAt,
      last_worked_at: payload.leadCapturedAt,
      session_source: 'whatsapp',
      session_medium: 'messaging',
      session_campaign: 'direct_chat',
      referrer_host: payload.referrerHost,
      landing_page: payload.landingPage,
      entry_path: payload.entryPath,
      whatsapp_manual_tag: true,
      whatsapp_manual_tagged_at: nowIso
    }
  };
}
