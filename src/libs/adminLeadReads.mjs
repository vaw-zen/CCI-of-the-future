import { runLeadSelectWithOptionalTrackingFallback } from './leadTrackingSchemaCompat.mjs';
import {
  isMissingWhatsAppDirectLeadSchemaError,
  WHATSAPP_DIRECT_LEAD_SELECT_FIELDS,
  WHATSAPP_DIRECT_LEAD_TABLE
} from './whatsappDirectLeads.mjs';

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;

export const ADMIN_LEAD_KINDS = ['devis', 'convention', 'whatsapp'];

const ADMIN_LEAD_CONFIG = {
  devis: {
    kind: 'devis',
    table: 'devis_requests',
    listOrderColumn: 'created_at',
    summarySelect: [
      'id',
      'created_at',
      'nom',
      'prenom',
      'email',
      'telephone',
      'ville',
      'type_service',
      'lead_status',
      'lead_quality_outcome',
      'lead_owner',
      'follow_up_sla_at',
      'last_worked_at',
      'session_source',
      'session_medium',
      'whatsapp_click_id',
      'whatsapp_clicked_at',
      'whatsapp_click_label',
      'whatsapp_click_page',
      'whatsapp_manual_tag',
      'whatsapp_manual_tagged_at'
    ].join(','),
    detailSelect: [
      'id',
      'created_at',
      'type_personne',
      'matricule_fiscale',
      'nom',
      'prenom',
      'email',
      'telephone',
      'adresse',
      'ville',
      'code_postal',
      'type_logement',
      'surface',
      'type_service',
      'nombre_places',
      'surface_service',
      'date_preferee',
      'heure_preferee',
      'message',
      'newsletter',
      'lead_status',
      'lead_quality_outcome',
      'lead_owner',
      'submitted_at',
      'qualified_at',
      'closed_at',
      'follow_up_sla_at',
      'last_worked_at',
      'ga_client_id',
      'landing_page',
      'session_source',
      'session_medium',
      'session_campaign',
      'referrer_host',
      'entry_path',
      'calculator_estimate',
      'selected_services',
      'whatsapp_click_id',
      'whatsapp_clicked_at',
      'whatsapp_click_label',
      'whatsapp_click_page',
      'whatsapp_manual_tag',
      'whatsapp_manual_tagged_at'
    ].join(',')
  },
  convention: {
    kind: 'convention',
    table: 'convention_requests',
    listOrderColumn: 'created_at',
    summarySelect: [
      'id',
      'created_at',
      'raison_sociale',
      'secteur_activite',
      'contact_nom',
      'contact_prenom',
      'email',
      'telephone',
      'statut',
      'lead_status',
      'lead_quality_outcome',
      'lead_owner',
      'follow_up_sla_at',
      'last_worked_at',
      'session_source',
      'session_medium',
      'whatsapp_click_id',
      'whatsapp_clicked_at',
      'whatsapp_click_label',
      'whatsapp_click_page',
      'whatsapp_manual_tag',
      'whatsapp_manual_tagged_at'
    ].join(','),
    detailSelect: [
      'id',
      'created_at',
      'raison_sociale',
      'matricule_fiscale',
      'secteur_activite',
      'contact_nom',
      'contact_prenom',
      'contact_fonction',
      'email',
      'telephone',
      'nombre_sites',
      'surface_totale',
      'services_souhaites',
      'frequence',
      'duree_contrat',
      'date_debut_souhaitee',
      'message',
      'statut',
      'updated_at',
      'lead_status',
      'lead_quality_outcome',
      'lead_owner',
      'submitted_at',
      'qualified_at',
      'closed_at',
      'follow_up_sla_at',
      'last_worked_at',
      'ga_client_id',
      'landing_page',
      'session_source',
      'session_medium',
      'session_campaign',
      'referrer_host',
      'entry_path',
      'calculator_estimate',
      'selected_services',
      'whatsapp_click_id',
      'whatsapp_clicked_at',
      'whatsapp_click_label',
      'whatsapp_click_page',
      'whatsapp_manual_tag',
      'whatsapp_manual_tagged_at'
    ].join(',')
  },
  whatsapp: {
    kind: 'whatsapp',
    table: WHATSAPP_DIRECT_LEAD_TABLE,
    listOrderColumn: 'lead_captured_at',
    summarySelect: [
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
      'scheduled_type',
      'scheduled_at',
      'lead_status',
      'lead_quality_outcome',
      'lead_owner',
      'follow_up_sla_at',
      'last_worked_at',
      'session_source',
      'session_medium',
      'whatsapp_click_id',
      'whatsapp_clicked_at',
      'whatsapp_click_label',
      'whatsapp_click_page',
      'whatsapp_manual_tag',
      'whatsapp_manual_tagged_at'
    ].join(','),
    detailSelect: WHATSAPP_DIRECT_LEAD_SELECT_FIELDS
  }
};

function normalizeText(value = '') {
  return String(value || '').trim();
}

export function getAdminLeadConfig(kind = '') {
  return ADMIN_LEAD_CONFIG[kind] || null;
}

export function getSafeAdminLeadLimit(value, fallback = DEFAULT_LIST_LIMIT) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(1, Math.min(MAX_LIST_LIMIT, Math.round(numericValue)));
}

export function getSafeAdminLeadCursor(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(0, Math.round(numericValue));
}

export function runAdminLeadSelect({ supabase, kind, select, applyQuery, channel = 'admin-leads' }) {
  const config = getAdminLeadConfig(kind);
  if (!config) {
    throw new Error(`Unsupported lead kind: ${kind}`);
  }

  return runLeadSelectWithOptionalTrackingFallback({
    supabase,
    table: config.table,
    select,
    applyQuery,
    channel
  });
}

export function isMissingAdminLeadSchemaError(kind, error) {
  if (kind === 'whatsapp') {
    return isMissingWhatsAppDirectLeadSchemaError(error);
  }

  return false;
}

export function applyAdminLeadListFilters(kind, query, filters = {}) {
  let nextQuery = query;

  if (kind === 'devis') {
    if (normalizeText(filters.leadStatus) && filters.leadStatus !== 'all') {
      nextQuery = nextQuery.eq('lead_status', filters.leadStatus);
    }

    if (normalizeText(filters.leadQualityOutcome) && filters.leadQualityOutcome !== 'all') {
      nextQuery = nextQuery.eq('lead_quality_outcome', filters.leadQualityOutcome);
    }

    if (normalizeText(filters.serviceType) && filters.serviceType !== 'all') {
      nextQuery = nextQuery.eq('type_service', filters.serviceType);
    }

    if (normalizeText(filters.leadOwner)) {
      nextQuery = nextQuery.ilike('lead_owner', `%${normalizeText(filters.leadOwner)}%`);
    }

    if (normalizeText(filters.sessionSource)) {
      nextQuery = nextQuery.ilike('session_source', `%${normalizeText(filters.sessionSource)}%`);
    }

    if (normalizeText(filters.sessionMedium)) {
      nextQuery = nextQuery.ilike('session_medium', `%${normalizeText(filters.sessionMedium)}%`);
    }

    if (filters.dateFrom) {
      nextQuery = nextQuery.gte('created_at', `${filters.dateFrom}T00:00:00.000Z`);
    }

    if (filters.dateTo) {
      nextQuery = nextQuery.lte('created_at', `${filters.dateTo}T23:59:59.999Z`);
    }
  }

  if (kind === 'convention') {
    if (normalizeText(filters.leadStatus) && filters.leadStatus !== 'all') {
      nextQuery = nextQuery.eq('lead_status', filters.leadStatus);
    }

    if (normalizeText(filters.leadQualityOutcome) && filters.leadQualityOutcome !== 'all') {
      nextQuery = nextQuery.eq('lead_quality_outcome', filters.leadQualityOutcome);
    }

    if (normalizeText(filters.operationalStatus) && filters.operationalStatus !== 'all') {
      nextQuery = nextQuery.eq('statut', filters.operationalStatus);
    }

    if (normalizeText(filters.sector) && filters.sector !== 'all') {
      nextQuery = nextQuery.eq('secteur_activite', filters.sector);
    }

    if (normalizeText(filters.leadOwner)) {
      nextQuery = nextQuery.ilike('lead_owner', `%${normalizeText(filters.leadOwner)}%`);
    }

    if (normalizeText(filters.sessionSource)) {
      nextQuery = nextQuery.ilike('session_source', `%${normalizeText(filters.sessionSource)}%`);
    }

    if (normalizeText(filters.sessionMedium)) {
      nextQuery = nextQuery.ilike('session_medium', `%${normalizeText(filters.sessionMedium)}%`);
    }

    if (filters.dateFrom) {
      nextQuery = nextQuery.gte('created_at', `${filters.dateFrom}T00:00:00.000Z`);
    }

    if (filters.dateTo) {
      nextQuery = nextQuery.lte('created_at', `${filters.dateTo}T23:59:59.999Z`);
    }
  }

  if (kind === 'whatsapp') {
    if (normalizeText(filters.leadStatus) && filters.leadStatus !== 'all') {
      nextQuery = nextQuery.eq('lead_status', filters.leadStatus);
    }

    if (normalizeText(filters.businessLine) && filters.businessLine !== 'all') {
      nextQuery = nextQuery.eq('business_line', filters.businessLine);
    }

    if (normalizeText(filters.scheduledType) && filters.scheduledType !== 'all') {
      if (filters.scheduledType === 'none') {
        nextQuery = nextQuery.is('scheduled_type', null);
      } else {
        nextQuery = nextQuery.eq('scheduled_type', filters.scheduledType);
      }
    }

    if (normalizeText(filters.leadQualityOutcome) && filters.leadQualityOutcome !== 'all') {
      nextQuery = nextQuery.eq('lead_quality_outcome', filters.leadQualityOutcome);
    }

    if (normalizeText(filters.leadOwner)) {
      nextQuery = nextQuery.ilike('lead_owner', `%${normalizeText(filters.leadOwner)}%`);
    }

    if (normalizeText(filters.phone)) {
      nextQuery = nextQuery.ilike('telephone', `%${normalizeText(filters.phone)}%`);
    }

    if (filters.dateFrom) {
      nextQuery = nextQuery.gte('lead_captured_at', `${filters.dateFrom}T00:00:00.000Z`);
    }

    if (filters.dateTo) {
      nextQuery = nextQuery.lte('lead_captured_at', `${filters.dateTo}T23:59:59.999Z`);
    }
  }

  return nextQuery;
}
