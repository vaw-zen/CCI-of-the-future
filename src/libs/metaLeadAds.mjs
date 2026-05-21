import { normalizeCampaignName } from './attributionHygiene.mjs';
import {
  META_LEAD_SOURCES,
  META_PLATFORMS,
  buildMetaAttributionFields,
  normalizeMetaIdentifier,
  normalizeMetaPlatform
} from './metaAttribution.mjs';
import {
  getDefaultFollowUpSlaAt,
  LEAD_QUALITY_OUTCOMES,
  LEAD_STATUSES
} from '../utils/leadLifecycle.js';

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeNullableText(value) {
  const text = normalizeText(value, '');
  return text || null;
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    const items = value.map((item) => normalizeText(item, '')).filter(Boolean);
    return items.length > 0 ? items : [];
  }

  const text = normalizeText(value, '');
  if (!text) {
    return [];
  }

  return text
    .split(/[,\n;]/)
    .map((item) => normalizeText(item, ''))
    .filter(Boolean);
}

function slugify(value, fallback = '') {
  const normalized = normalizeText(value, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || fallback;
}

const FIELD_ALIASES = {
  first_name: ['first_name', 'prenom', 'contact_prenom', 'first name'],
  last_name: ['last_name', 'nom', 'contact_nom', 'last name'],
  full_name: ['full_name', 'name', 'nom_complet', 'contact_name', 'full name'],
  email: ['email', 'email_address', 'courriel'],
  telephone: ['phone_number', 'telephone', 'phone', 'mobile_number', 'numero_telephone'],
  adresse: ['address', 'adresse', 'street_address'],
  ville: ['city', 'ville'],
  company_name: ['company_name', 'raison_sociale', 'societe', 'business_name'],
  matricule_fiscale: ['matricule_fiscale', 'tax_id', 'matricule'],
  secteur_activite: ['secteur_activite', 'industry', 'sector', 'business_sector'],
  type_service: ['type_service', 'service_type', 'service', 'requested_service'],
  services_souhaites: ['services_souhaites', 'services', 'requested_services'],
  frequence: ['frequence', 'frequency'],
  duree_contrat: ['duree_contrat', 'contract_duration'],
  message: ['message', 'notes', 'comment'],
  contact_fonction: ['contact_fonction', 'job_title', 'fonction'],
  nombre_sites: ['nombre_sites', 'site_count'],
  surface_totale: ['surface_totale', 'surface', 'area'],
  meta_platform: ['platform'],
  campaign_name: ['campaign_name'],
  adset_name: ['adset_name', 'ad_group_name'],
  ad_name: ['ad_name']
};

function getAliasKey(fieldName = '') {
  const normalized = slugify(fieldName, '');
  return Object.entries(FIELD_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] || normalized;
}

function parseMetaLeadFieldData(fieldData = []) {
  return fieldData.reduce((accumulator, field) => {
    const key = getAliasKey(field?.name);
    if (!key) {
      return accumulator;
    }

    const values = Array.isArray(field?.values) ? field.values : [field?.values];
    const cleanValues = values
      .map((value) => normalizeText(value, ''))
      .filter(Boolean);

    if (cleanValues.length === 0) {
      return accumulator;
    }

    accumulator[key] = cleanValues.length === 1 ? cleanValues[0] : cleanValues;
    return accumulator;
  }, {});
}

function splitFullName(fullName = '') {
  const cleanValue = normalizeText(fullName, '');
  if (!cleanValue) {
    return {
      firstName: '',
      lastName: ''
    };
  }

  const parts = cleanValue.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: parts[0]
    };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1)
  };
}

export function normalizeMetaLeadWebhookEntries(payload = {}) {
  if (payload?.leadgen_id) {
    return [payload];
  }

  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  return entries.flatMap((entry) => {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    return changes
      .filter((change) => normalizeText(change?.field, '') === 'leadgen')
      .map((change) => ({
        page_id: change?.value?.page_id || entry?.id,
        form_id: change?.value?.form_id,
        leadgen_id: change?.value?.leadgen_id,
        created_time: change?.value?.created_time
      }));
  });
}

export async function fetchMetaLeadAdDetails({
  leadgenId = '',
  accessToken = '',
  apiVersion = 'v20.0'
} = {}) {
  const normalizedLeadgenId = normalizeMetaIdentifier(leadgenId);
  if (!normalizedLeadgenId || !accessToken) {
    return null;
  }

  const fields = [
    'id',
    'created_time',
    'field_data',
    'ad_id',
    'adgroup_id',
    'campaign_id',
    'form_id',
    'page_id',
    'platform',
    'is_organic',
    'campaign_name',
    'ad_name',
    'adset_name'
  ].join(',');
  const url = `https://graph.facebook.com/${apiVersion}/${normalizedLeadgenId}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Meta lead fetch failed with status ${response.status}`);
  }

  return response.json();
}

export function buildMetaLeadAdSubmissionRow(rawPayload = {}, {
  receivedAt = new Date().toISOString()
} = {}) {
  const fieldPayload = parseMetaLeadFieldData(rawPayload.field_data || []);
  const normalizedPlatform = normalizeMetaPlatform(
    rawPayload.platform || fieldPayload.meta_platform,
    {
      source: META_PLATFORMS.FACEBOOK
    }
  ) || META_PLATFORMS.FACEBOOK;
  const campaignName = normalizeCampaignName(rawPayload.campaign_name || fieldPayload.campaign_name, '(not set)');

  return {
    meta_leadgen_id: normalizeMetaIdentifier(rawPayload.leadgen_id || rawPayload.id),
    meta_form_id: normalizeMetaIdentifier(rawPayload.form_id),
    meta_page_id: normalizeMetaIdentifier(rawPayload.page_id),
    meta_platform: normalizedPlatform,
    meta_campaign_id: normalizeMetaIdentifier(rawPayload.campaign_id),
    meta_adset_id: normalizeMetaIdentifier(rawPayload.adgroup_id || rawPayload.adset_id),
    meta_ad_id: normalizeMetaIdentifier(rawPayload.ad_id),
    campaign_name: campaignName,
    adset_name: normalizeNullableText(rawPayload.adset_name || fieldPayload.adset_name),
    ad_name: normalizeNullableText(rawPayload.ad_name || fieldPayload.ad_name),
    contact_name: normalizeNullableText(fieldPayload.full_name),
    company_name: normalizeNullableText(fieldPayload.company_name),
    email: normalizeNullableText(fieldPayload.email),
    telephone: normalizeNullableText(fieldPayload.telephone),
    field_payload: fieldPayload,
    raw_payload: rawPayload,
    mapping_status: 'unmapped',
    synced_at: receivedAt,
    lead_created_at: rawPayload.created_time || receivedAt,
    session_source: normalizedPlatform,
    session_medium: 'paid_social',
    session_campaign: campaignName
  };
}

function getMappedServiceType(fieldPayload = {}, mapping = {}) {
  const rawFieldValue = normalizeText(fieldPayload.type_service, '');
  if (rawFieldValue) {
    return slugify(rawFieldValue, rawFieldValue);
  }

  return slugify(mapping.default_service_type, normalizeText(mapping.default_service_type, ''));
}

export function buildMetaLeadAdAutoCreateCandidate(submissionRow = {}, mapping = {}) {
  const fieldPayload = submissionRow.field_payload && typeof submissionRow.field_payload === 'object'
    ? submissionRow.field_payload
    : {};
  const mappingEnabled = Boolean(mapping?.auto_create_enabled);
  const targetKind = normalizeText(mapping?.target_kind, 'standalone');

  if (!mappingEnabled || !['devis', 'convention'].includes(targetKind)) {
    return {
      mappingStatus: mapping ? 'mapped_pending' : 'unmapped',
      targetKind,
      insertValues: null
    };
  }

  const fullName = splitFullName(fieldPayload.full_name || submissionRow.contact_name);
  const firstName = normalizeText(fieldPayload.first_name || fullName.firstName, '');
  const lastName = normalizeText(fieldPayload.last_name || fullName.lastName, '');
  const sourceCampaign = normalizeText(submissionRow.session_campaign, '(not set)');
  const metaFields = buildMetaAttributionFields({
    meta_platform: submissionRow.meta_platform,
    meta_lead_source: META_LEAD_SOURCES.LEAD_AD,
    meta_campaign_id: submissionRow.meta_campaign_id,
    meta_adset_id: submissionRow.meta_adset_id,
    meta_ad_id: submissionRow.meta_ad_id,
    meta_leadgen_id: submissionRow.meta_leadgen_id,
    meta_form_id: submissionRow.meta_form_id,
    meta_page_id: submissionRow.meta_page_id
  }, {
    source: submissionRow.session_source,
    fallbackLeadSource: META_LEAD_SOURCES.LEAD_AD
  });
  const submittedAt = submissionRow.lead_created_at || new Date().toISOString();

  if (targetKind === 'devis') {
    const typeService = getMappedServiceType(fieldPayload, mapping);
    const devisValues = {
      type_personne: 'physique',
      nom: lastName,
      prenom: firstName,
      email: normalizeText(fieldPayload.email || submissionRow.email, ''),
      telephone: normalizeText(fieldPayload.telephone || submissionRow.telephone, ''),
      adresse: normalizeText(fieldPayload.adresse, ''),
      ville: normalizeText(fieldPayload.ville, ''),
      type_service: typeService,
      message: normalizeNullableText(fieldPayload.message),
      newsletter: false,
      conditions: true,
      lead_status: LEAD_STATUSES.SUBMITTED,
      lead_quality_outcome: LEAD_QUALITY_OUTCOMES.UNREVIEWED,
      submitted_at: submittedAt,
      follow_up_sla_at: getDefaultFollowUpSlaAt(submittedAt),
      last_worked_at: submittedAt,
      landing_page: null,
      entry_path: null,
      session_source: submissionRow.session_source || META_PLATFORMS.FACEBOOK,
      session_medium: submissionRow.session_medium || 'paid_social',
      session_campaign: sourceCampaign,
      ...metaFields
    };

    const isComplete = Boolean(
      devisValues.nom
      && devisValues.prenom
      && devisValues.email
      && devisValues.telephone
      && devisValues.adresse
      && devisValues.ville
      && devisValues.type_service
    );

    return {
      mappingStatus: isComplete ? 'mapped_ready' : 'partial',
      targetKind,
      insertValues: isComplete ? devisValues : null
    };
  }

  const requestedServices = normalizeStringArray(fieldPayload.services_souhaites);
  const conventionValues = {
    raison_sociale: normalizeText(fieldPayload.company_name || submissionRow.company_name, ''),
    matricule_fiscale: normalizeText(fieldPayload.matricule_fiscale, ''),
    secteur_activite: slugify(fieldPayload.secteur_activite, ''),
    contact_nom: lastName,
    contact_prenom: firstName,
    contact_fonction: normalizeNullableText(fieldPayload.contact_fonction),
    email: normalizeText(fieldPayload.email || submissionRow.email, ''),
    telephone: normalizeText(fieldPayload.telephone || submissionRow.telephone, ''),
    nombre_sites: Number(fieldPayload.nombre_sites || 1),
    surface_totale: fieldPayload.surface_totale ? Number(fieldPayload.surface_totale) : null,
    services_souhaites: requestedServices.map((service) => slugify(service, service)),
    frequence: slugify(fieldPayload.frequence, ''),
    duree_contrat: slugify(fieldPayload.duree_contrat, ''),
    message: normalizeNullableText(fieldPayload.message),
    statut: 'nouveau',
    lead_status: LEAD_STATUSES.SUBMITTED,
    lead_quality_outcome: LEAD_QUALITY_OUTCOMES.UNREVIEWED,
    submitted_at: submittedAt,
    follow_up_sla_at: getDefaultFollowUpSlaAt(submittedAt),
    last_worked_at: submittedAt,
    landing_page: null,
    entry_path: null,
    session_source: submissionRow.session_source || META_PLATFORMS.FACEBOOK,
    session_medium: submissionRow.session_medium || 'paid_social',
    session_campaign: sourceCampaign,
    ...metaFields
  };

  const isComplete = Boolean(
    conventionValues.raison_sociale
    && conventionValues.matricule_fiscale
    && conventionValues.secteur_activite
    && conventionValues.contact_nom
    && conventionValues.contact_prenom
    && conventionValues.email
    && conventionValues.telephone
    && conventionValues.frequence
    && conventionValues.duree_contrat
    && conventionValues.services_souhaites.length > 0
  );

  return {
    mappingStatus: isComplete ? 'mapped_ready' : 'partial',
    targetKind,
    insertValues: isComplete ? conventionValues : null
  };
}
