import {
  DEFAULT_KEYWORD_SITE_URL,
  KEYWORD_TRACKED_DEVICES,
  buildKeywordCatalogLookupKey,
  buildKeywordCatalogLookupKeyFromValues,
  buildKeywordCatalogUrl,
  normalizeKeywordForKey
} from './growthKeywordCatalog.mjs';
import {
  getAttributionSiteHost,
  normalizeAttributionHost,
  normalizeAttributionPath,
  resolveCanonicalAttribution
} from './attributionHygiene.mjs';
import {
  WHATSAPP_MATCH_WINDOW_DAYS,
  getWhatsAppAttributionSummary,
  hasWhatsAppAutoAttribution,
  hasWhatsAppManualTag,
  isWhatsAppAttributed,
  normalizeWhatsAppClickRow
} from './whatsappAttribution.mjs';
import {
  LEAD_QUALITY_OUTCOME_LABELS,
  LEAD_QUALITY_OUTCOMES,
  normalizeLeadQualityOutcome
} from '../utils/leadLifecycle.js';

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_RANGE_DAYS = 365;
export const DEFAULT_RANGE_DAYS = 30;
export const STALE_OPEN_LEAD_HOURS = 48;
export const DASHBOARD_ALERT_THRESHOLDS = {
  unattributedLeadRateWarning: 25,
  unattributedLeadRateCritical: 40,
  staleQueueBreachCount: 5,
  staleQueueCriticalAgeHours: 72,
  thinVolume: {
    costPerLeadMinLeads: 5,
    costPerAcquisitionMinWins: 3,
    leadRateMinSessions: 20,
    leadRateMinClicks: 20
  }
};

export const LEAD_STATUSES = {
  SUBMITTED: 'submitted',
  QUALIFIED: 'qualified',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
};

const CONVENTION_STATUS_TO_LEAD_STATUS = {
  nouveau: LEAD_STATUSES.SUBMITTED,
  contacte: LEAD_STATUSES.QUALIFIED,
  audit_planifie: LEAD_STATUSES.QUALIFIED,
  devis_envoye: LEAD_STATUSES.QUALIFIED,
  signe: LEAD_STATUSES.CLOSED_WON,
  refuse: LEAD_STATUSES.CLOSED_LOST
};

const LEAD_STATUS_LABELS = {
  [LEAD_STATUSES.SUBMITTED]: 'Soumis',
  [LEAD_STATUSES.QUALIFIED]: 'Qualifié',
  [LEAD_STATUSES.CLOSED_WON]: 'Gagné',
  [LEAD_STATUSES.CLOSED_LOST]: 'Perdu'
};

const SERVICE_LABELS = {
  salon: 'Salon',
  tapis: 'Tapis / moquettes',
  tapisserie: 'Tapisserie',
  marbre: 'Marbre',
  tfc: 'TFC',
  banque: 'Banque',
  assurance: 'Assurance',
  clinique: 'Clinique',
  hotel: 'Hôtel',
  bureau: 'Bureau',
  commerce: 'Commerce',
  autre: 'Autre'
};

const SOURCE_CLASS_LABELS = {
  organic_search: 'Organic search',
  paid_media: 'Paid media',
  paid_social: 'Paid social',
  organic_social: 'Organic social',
  referral: 'Referral',
  messaging: 'Messaging',
  email: 'Email',
  direct: 'Direct',
  other: 'Other'
};

const PAGE_TYPE_LABELS = {
  home: 'Home',
  service: 'Service page',
  article: 'Article',
  contact: 'Contact page',
  quote: 'Quote flow',
  faq: 'FAQ',
  about: 'About',
  newsletter: 'Newsletter',
  admin: 'Admin',
  other: 'Other'
};

const BUSINESS_LINE_LABELS = {
  b2c: 'B2C',
  b2b: 'B2B',
  unknown: 'Unknown'
};

const B2C_SERVICE_KEYS = new Set([
  'salon',
  'tapis',
  'tapisserie',
  'marbre',
  'tfc'
]);

const B2B_SERVICE_KEYS = new Set([
  'hotel',
  'banque',
  'assurance',
  'clinique',
  'bureau',
  'commerce'
]);

const DASHBOARD_FILTER_KEYS = [
  'businessLine',
  'service',
  'sourceClass',
  'device',
  'pageType'
];

const KPI_SEMANTICS = {
  new_leads: {
    canonicalLabel: 'New leads',
    owner: 'Growth owner',
    decisionIntent: 'Are we generating enough new demand this period?'
  },
  qualified_activity: {
    canonicalLabel: 'Qualified activity',
    owner: 'Admin ops',
    decisionIntent: 'Is the team moving leads through the pipeline this period?'
  },
  won_activity: {
    canonicalLabel: 'Won activity',
    owner: 'Growth owner',
    decisionIntent: 'Are leads converting into real wins this period?'
  },
  qualified_rate: {
    canonicalLabel: 'Cohort qualification rate',
    owner: 'Growth owner',
    decisionIntent: 'Which acquisition periods produce qualified demand?'
  },
  win_rate: {
    canonicalLabel: 'Cohort win rate',
    owner: 'Growth owner',
    decisionIntent: 'Which acquisition periods create win-ready leads?'
  },
  unattributed_rate: {
    canonicalLabel: 'Unattributed lead rate',
    owner: 'Engineering',
    decisionIntent: 'Is attribution quality degrading?'
  },
  revenue_proxy: {
    canonicalLabel: 'Estimated pipeline value',
    owner: 'Growth owner',
    decisionIntent: 'Are we attracting higher-value demand this period?'
  },
  sessions: {
    canonicalLabel: 'Sessions',
    owner: 'Growth owner',
    decisionIntent: 'Which channels are bringing traffic volume?'
  },
  clicks: {
    canonicalLabel: 'Clicks',
    owner: 'Growth owner',
    decisionIntent: 'Which channels and pages are generating actual visits or intent?'
  },
  impressions: {
    canonicalLabel: 'Impressions',
    owner: 'Growth owner',
    decisionIntent: 'Are campaigns and pages earning visibility?'
  },
  spend: {
    canonicalLabel: 'Spend',
    owner: 'Growth owner',
    decisionIntent: 'How much did we invest to generate demand?'
  },
  cost_per_lead: {
    canonicalLabel: 'Cost per lead',
    owner: 'Growth owner',
    decisionIntent: 'Which channels create leads efficiently?'
  },
  cost_per_acquisition: {
    canonicalLabel: 'Cost per acquisition',
    owner: 'Growth owner',
    decisionIntent: 'Which channels are producing actual acquisitions?'
  },
  landing_pages_tracked: {
    canonicalLabel: 'Landing pages tracked',
    owner: 'Growth owner',
    decisionIntent: 'Do we have enough landing-page coverage to evaluate search demand?'
  },
  organic_clicks: {
    canonicalLabel: 'Organic clicks',
    owner: 'Growth owner',
    decisionIntent: 'Which SEO pages are earning real search demand?'
  },
  organic_impressions: {
    canonicalLabel: 'Organic impressions',
    owner: 'Growth owner',
    decisionIntent: 'Are SEO pages earning visibility?'
  },
  organic_ctr: {
    canonicalLabel: 'Organic CTR',
    owner: 'Growth owner',
    decisionIntent: 'Are search snippets competitive enough?'
  },
  lead_rate: {
    canonicalLabel: 'Lead rate',
    owner: 'Growth owner',
    decisionIntent: 'Which pages turn traffic into leads?'
  },
  qualified_leads: {
    canonicalLabel: 'Qualified leads',
    owner: 'Growth owner',
    decisionIntent: 'Which pages and channels generate commercially promising demand?'
  },
  tracked_keywords: {
    canonicalLabel: 'Tracked keywords',
    owner: 'Growth owner',
    decisionIntent: 'Are we tracking the full keyword universe that matters?'
  },
  desktop_ranked_keywords: {
    canonicalLabel: 'Desktop ranked keywords',
    owner: 'Growth owner',
    decisionIntent: 'Is desktop visibility improving or falling?'
  },
  mobile_ranked_keywords: {
    canonicalLabel: 'Mobile ranked keywords',
    owner: 'Growth owner',
    decisionIntent: 'Is mobile visibility improving or falling?'
  },
  average_position: {
    canonicalLabel: 'Average best position',
    owner: 'Growth owner',
    decisionIntent: 'Are our tracked keywords moving upward or downward overall?'
  },
  top10_count: {
    canonicalLabel: 'Top 10 keywords',
    owner: 'Growth owner',
    decisionIntent: 'Are more tracked keywords entering page one?'
  }
};

const DATA_HEALTH_EXPECTATIONS = [
  {
    key: 'supabase_live',
    label: 'Supabase live',
    connectorType: 'database',
    staleAfterHours: 1,
    metricSources: []
  },
  {
    key: 'ga4',
    label: 'GA4',
    connectorType: 'api',
    staleAfterHours: 36,
    metricSources: ['ga4']
  },
  {
    key: 'search_console',
    label: 'Search Console',
    connectorType: 'api',
    staleAfterHours: 72,
    metricSources: ['gsc']
  },
  {
    key: 'serp_keyword_rankings',
    label: 'SERP rankings',
    connectorType: 'api',
    staleAfterHours: 48,
    metricSources: [],
    keywordRankings: true
  },
  {
    key: 'paid_media',
    label: 'Paid media',
    connectorType: 'manual',
    staleAfterHours: 48,
    metricSources: ['paid_manual']
  },
  {
    key: 'social_media',
    label: 'Social media',
    connectorType: 'manual',
    staleAfterHours: 48,
    metricSources: ['social_manual']
  }
];

function startOfUtcDay(date) {
  const nextDate = new Date(date);
  nextDate.setUTCHours(0, 0, 0, 0);
  return nextDate;
}

function endOfUtcDay(date) {
  const nextDate = new Date(date);
  nextDate.setUTCHours(23, 59, 59, 999);
  return nextDate;
}

export function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function parseDateParam(value, { endOfDay = false } = {}) {
  if (!value) {
    return { value: null };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: 'invalid_date' };
  }

  const parsedDate = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
  if (Number.isNaN(parsedDate.getTime()) || formatDateKey(parsedDate) !== value) {
    return { error: 'invalid_date' };
  }

  return { value: parsedDate };
}

export function getDashboardRange({ from, to } = {}) {
  const todayEnd = endOfUtcDay(new Date());
  const parsedTo = parseDateParam(to, { endOfDay: true });
  if (parsedTo.error) {
    return { error: 'invalid_date', message: 'Date de fin invalide.' };
  }

  const toDate = parsedTo.value || todayEnd;
  const parsedFrom = parseDateParam(from);
  if (parsedFrom.error) {
    return { error: 'invalid_date', message: 'Date de début invalide.' };
  }

  const fromDate = parsedFrom.value || startOfUtcDay(new Date(toDate.getTime() - ((DEFAULT_RANGE_DAYS - 1) * DAY_MS)));
  if (fromDate > toDate) {
    return { error: 'invalid_range', message: 'La date de début doit précéder la date de fin.' };
  }

  const days = Math.floor((endOfUtcDay(toDate).getTime() - startOfUtcDay(fromDate).getTime()) / DAY_MS) + 1;
  if (days > MAX_RANGE_DAYS) {
    return { error: 'range_too_large', message: 'La période ne peut pas dépasser 365 jours.' };
  }

  const normalizedFrom = startOfUtcDay(fromDate);
  const normalizedTo = endOfUtcDay(toDate);
  const previousTo = new Date(normalizedFrom.getTime() - 1);
  const previousFrom = startOfUtcDay(new Date(normalizedFrom.getTime() - (days * DAY_MS)));

  return {
    ok: true,
    range: {
      from: formatDateKey(normalizedFrom),
      to: formatDateKey(normalizedTo),
      fromIso: normalizedFrom.toISOString(),
      toIso: normalizedTo.toISOString(),
      days,
      staleLeadHours: STALE_OPEN_LEAD_HOURS
    },
    previousRange: {
      fromIso: previousFrom.toISOString(),
      toIso: previousTo.toISOString()
    }
  };
}

function normalizeText(value, fallback = 'Non défini') {
  const text = String(value || '').trim();
  return text || fallback;
}

function buildKpiCard({
  key,
  label,
  value,
  type = 'number',
  meta = '',
  delta = null,
  warning = null
}) {
  const semantics = KPI_SEMANTICS[key] || {};

  return {
    key,
    label,
    value,
    type,
    meta,
    delta,
    warning,
    canonicalLabel: semantics.canonicalLabel || label,
    owner: semantics.owner || null,
    decisionIntent: semantics.decisionIntent || null
  };
}

function normalizePathForClassification(value = '') {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return '/';
  }

  try {
    if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
      const url = new URL(rawValue);
      return url.pathname || '/';
    }
  } catch (error) {
    return rawValue.startsWith('/') ? rawValue : `/${rawValue}`;
  }

  return rawValue.startsWith('/') ? rawValue.split('?')[0] || '/' : `/${rawValue.split('?')[0] || ''}`;
}

export function getPageTypeForPath(path = '') {
  const normalizedPath = normalizePathForClassification(path);

  if (normalizedPath.startsWith('/admin')) {
    return 'admin';
  }

  if (normalizedPath === '/') {
    return 'home';
  }

  if (normalizedPath.startsWith('/conseils/')) {
    return 'article';
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

  return 'other';
}

function getBusinessLineForLeadKind(kind = '') {
  if (kind === 'devis') {
    return 'b2c';
  }

  if (kind === 'convention') {
    return 'b2b';
  }

  return 'unknown';
}

function getBusinessLineLabel(value) {
  return BUSINESS_LINE_LABELS[value] || normalizeText(value, 'Unknown');
}

function getServiceKeyForPath(path = '') {
  const normalizedPath = normalizePathForClassification(path).toLowerCase();
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

function getBusinessLineForPath(path = '') {
  const normalizedPath = normalizePathForClassification(path).toLowerCase();

  if (normalizedPath === '/entreprises' || normalizedPath.startsWith('/entreprises/')) {
    return 'b2b';
  }

  const serviceKey = getServiceKeyForPath(normalizedPath);
  if (serviceKey && B2B_SERVICE_KEYS.has(serviceKey)) {
    return 'b2b';
  }

  if (serviceKey && B2C_SERVICE_KEYS.has(serviceKey)) {
    return 'b2c';
  }

  return 'unknown';
}

function getSourceClassLabel(value) {
  return SOURCE_CLASS_LABELS[value] || normalizeText(value, 'Other');
}

function getPageTypeLabel(value) {
  return PAGE_TYPE_LABELS[value] || normalizeText(value, 'Other');
}

function getDeviceLabel(value) {
  if (value === 'mobile') {
    return 'Mobile';
  }

  if (value === 'desktop') {
    return 'Desktop';
  }

  return normalizeText(value, 'Unknown');
}

export function getSourceClass({ source = '', medium = '' } = {}) {
  const normalizedSource = String(source || '').trim().toLowerCase();
  const normalizedMedium = String(medium || '').trim().toLowerCase();

  const isDirectSource = !normalizedSource || normalizedSource === 'direct' || normalizedSource === '(direct)' || normalizedSource === 'unknown';
  const isDirectMedium = !normalizedMedium || normalizedMedium === '(none)' || normalizedMedium === 'none' || normalizedMedium === '(not set)' || normalizedMedium === 'unknown';

  if (normalizedMedium === 'messaging' || normalizedSource === 'whatsapp') {
    return 'messaging';
  }

  if (normalizedMedium === 'email' || normalizedSource === 'email' || normalizedSource === 'newsletter') {
    return 'email';
  }

  if (normalizedMedium === 'referral') {
    return 'referral';
  }

  if (normalizedMedium === 'paid_social') {
    return 'paid_social';
  }

  if (
    normalizedMedium === 'cpc'
    || normalizedMedium === 'ppc'
    || normalizedMedium === 'paid'
    || normalizedMedium === 'display'
    || normalizedMedium === 'affiliate'
    || normalizedSource.includes('ads')
  ) {
    return 'paid_media';
  }

  if (
    normalizedMedium === 'social'
    || normalizedSource === 'facebook'
    || normalizedSource === 'instagram'
    || normalizedSource === 'linkedin'
    || normalizedSource === 'tiktok'
  ) {
    return 'organic_social';
  }

  if (
    normalizedMedium === 'organic'
    || normalizedSource === 'google'
    || normalizedSource === 'bing'
  ) {
    return 'organic_search';
  }

  if (isDirectSource && isDirectMedium) {
    return 'direct';
  }

  return 'other';
}

function getThinVolumeWarnings({
  sessions = 0,
  clicks = 0,
  leads = 0,
  wonLeads = 0,
  leadRateBase = 'none'
} = {}) {
  const warnings = {};

  if (leads > 0 && leads < DASHBOARD_ALERT_THRESHOLDS.thinVolume.costPerLeadMinLeads) {
    warnings.costPerLead = {
      key: 'cost_per_lead_low_sample',
      level: 'warning',
      message: `Use with caution: fewer than ${DASHBOARD_ALERT_THRESHOLDS.thinVolume.costPerLeadMinLeads} leads in the selected period.`
    };
  }

  if (wonLeads > 0 && wonLeads < DASHBOARD_ALERT_THRESHOLDS.thinVolume.costPerAcquisitionMinWins) {
    warnings.costPerAcquisition = {
      key: 'cost_per_acquisition_low_sample',
      level: 'warning',
      message: `Use with caution: fewer than ${DASHBOARD_ALERT_THRESHOLDS.thinVolume.costPerAcquisitionMinWins} wins in the selected period.`
    };
  }

  if (leadRateBase === 'sessions' && sessions > 0 && sessions < DASHBOARD_ALERT_THRESHOLDS.thinVolume.leadRateMinSessions) {
    warnings.leadRate = {
      key: 'lead_rate_low_session_sample',
      level: 'warning',
      message: `Use with caution: fewer than ${DASHBOARD_ALERT_THRESHOLDS.thinVolume.leadRateMinSessions} sessions in the selected period.`
    };
  }

  if (leadRateBase === 'clicks' && clicks > 0 && clicks < DASHBOARD_ALERT_THRESHOLDS.thinVolume.leadRateMinClicks) {
    warnings.leadRate = {
      key: 'lead_rate_low_click_sample',
      level: 'warning',
      message: `Use with caution: fewer than ${DASHBOARD_ALERT_THRESHOLDS.thinVolume.leadRateMinClicks} clicks in the selected period.`
    };
  }

  return warnings;
}

function getUnattributedRateWarning(rate = 0) {
  if (rate >= DASHBOARD_ALERT_THRESHOLDS.unattributedLeadRateCritical) {
    return {
      key: 'unattributed_rate_critical',
      level: 'critical',
      message: `Critical: unattributed lead rate is ${rate}% and exceeds the ${DASHBOARD_ALERT_THRESHOLDS.unattributedLeadRateCritical}% threshold.`
    };
  }

  if (rate >= DASHBOARD_ALERT_THRESHOLDS.unattributedLeadRateWarning) {
    return {
      key: 'unattributed_rate_warning',
      level: 'warning',
      message: `Warning: unattributed lead rate is ${rate}% and exceeds the ${DASHBOARD_ALERT_THRESHOLDS.unattributedLeadRateWarning}% threshold.`
    };
  }

  return null;
}

function buildCombinedDerivedMetrics({
  sessions = 0,
  clicks = 0,
  impressions = 0,
  spend = 0,
  leads = 0,
  wonLeads = 0
} = {}) {
  const leadRateBase = sessions > 0 ? 'sessions' : clicks > 0 ? 'clicks' : 'none';
  const leadRateDenominator = leadRateBase === 'sessions'
    ? sessions
    : leadRateBase === 'clicks'
      ? clicks
      : 0;

  return {
    ctr: getPercent(clicks, impressions),
    leadRateBase,
    leadRate: getPercent(leads, leadRateDenominator),
    costPerLead: leads > 0 ? Math.round((spend / leads) * 100) / 100 : null,
    costPerAcquisition: wonLeads > 0 ? Math.round((spend / wonLeads) * 100) / 100 : null,
    warnings: getThinVolumeWarnings({
      sessions,
      clicks,
      leads,
      wonLeads,
      leadRateBase
    })
  };
}

function normalizeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function getServiceLabel(value) {
  return SERVICE_LABELS[value] || normalizeText(value);
}

function deriveLeadStatusFromConventionStatus(status = '') {
  return CONVENTION_STATUS_TO_LEAD_STATUS[status] || LEAD_STATUSES.SUBMITTED;
}

function getHoursBetween(startValue, endValue) {
  if (!startValue || !endValue) {
    return null;
  }

  const start = new Date(startValue).getTime();
  const end = new Date(endValue).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }

  return Math.round(((end - start) / (60 * 60 * 1000)) * 10) / 10;
}

function getLeadServices(row, kind) {
  if (kind === 'devis') {
    if (Array.isArray(row.selected_services) && row.selected_services.length > 0) {
      return row.selected_services;
    }

    return row.type_service ? [row.type_service] : [];
  }

  if (Array.isArray(row.services_souhaites) && row.services_souhaites.length > 0) {
    return row.services_souhaites;
  }

  if (Array.isArray(row.selected_services) && row.selected_services.length > 0) {
    return row.selected_services;
  }

  return row.secteur_activite ? [row.secteur_activite] : [];
}

function getLeadStatus(row, kind) {
  if (row.lead_status) {
    return row.lead_status;
  }

  return kind === 'convention'
    ? deriveLeadStatusFromConventionStatus(row.statut)
    : LEAD_STATUSES.SUBMITTED;
}

function getMostRecentOpenTimestamp(lead) {
  return lead.lastWorkedAt || lead.qualifiedAt || lead.submittedAt || lead.createdAt;
}

export function hasReachedQualified(lead) {
  return (
    lead.status === LEAD_STATUSES.QUALIFIED
    || lead.status === LEAD_STATUSES.CLOSED_WON
    || lead.status === LEAD_STATUSES.CLOSED_LOST
    || Boolean(lead.qualifiedAt)
  );
}

export function isOpenLead(lead) {
  return lead.status === LEAD_STATUSES.SUBMITTED || lead.status === LEAD_STATUSES.QUALIFIED;
}

export function isLeadSlaBreached(lead, nowIso) {
  if (!isOpenLead(lead) || !lead.followUpSlaAt) {
    return false;
  }

  const slaTimestamp = new Date(lead.followUpSlaAt).getTime();
  const nowTimestamp = new Date(nowIso).getTime();
  if (!Number.isFinite(slaTimestamp) || !Number.isFinite(nowTimestamp)) {
    return false;
  }

  const lastWorkedTimestamp = lead.lastWorkedAt ? new Date(lead.lastWorkedAt).getTime() : null;
  if (Number.isFinite(lastWorkedTimestamp) && lastWorkedTimestamp >= slaTimestamp) {
    return false;
  }

  return nowTimestamp > slaTimestamp;
}

export function isUnattributedLead(lead) {
  const source = String(lead.source || '').trim().toLowerCase();
  const medium = String(lead.medium || '').trim().toLowerCase();

  const sourceUnknown = !source || source === 'direct' || source === '(direct)' || source === 'unknown';
  const mediumUnknown = !medium || medium === '(none)' || medium === 'none' || medium === '(not set)' || medium === 'unknown';

  return sourceUnknown && mediumUnknown;
}

function getCanonicalRowAttribution(row = {}, {
  landingFallback = '/'
} = {}) {
  const referrerHost = normalizeAttributionHost(row.referrer_host);
  const attribution = resolveCanonicalAttribution({
    source: row.normalized_source || row.session_source,
    medium: row.normalized_medium || row.session_medium,
    campaign: row.normalized_campaign || row.session_campaign,
    referrerHost,
    siteHost: getAttributionSiteHost()
  });
  const landingPage = normalizeAttributionPath(
    row.normalized_landing_page || row.landing_page || row.entry_path || row.page_path,
    landingFallback
  );

  return {
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    landingPage,
    referrerHost: referrerHost || null
  };
}

export function normalizeLead(row, kind, nowIso) {
  const services = getLeadServices(row, kind);
  const status = getLeadStatus(row, kind);
  const serviceKey = kind === 'devis'
    ? (row.type_service || services[0] || 'unknown')
    : (services[0] || row.secteur_activite || 'unknown');
  const whatsappAttribution = getWhatsAppAttributionSummary(row);
  const canonicalAttribution = getCanonicalRowAttribution(row, {
    landingFallback: '/'
  });
  const source = normalizeText(canonicalAttribution.source, 'direct');
  const medium = normalizeText(canonicalAttribution.medium, '(none)');
  const campaign = normalizeText(canonicalAttribution.campaign, '(not set)');
  const landingPage = normalizeText(canonicalAttribution.landingPage, 'Non renseignée');
  const sourceClass = normalizeText(row.source_class, getSourceClass({ source, medium }));
  const pageType = normalizeText(row.page_type, getPageTypeForPath(landingPage));
  const businessLine = normalizeText(row.business_line, getBusinessLineForLeadKind(kind));
  const leadQualityOutcome = normalizeLeadQualityOutcome(
    row.lead_quality_outcome,
    status === LEAD_STATUSES.CLOSED_WON
      ? LEAD_QUALITY_OUTCOMES.WON
      : status === LEAD_STATUSES.CLOSED_LOST
        ? LEAD_QUALITY_OUTCOMES.LOST
        : status === LEAD_STATUSES.QUALIFIED
          ? LEAD_QUALITY_OUTCOMES.SALES_ACCEPTED
          : LEAD_QUALITY_OUTCOMES.UNREVIEWED
  );
  const lastWorkedAt = row.last_worked_at || row.closed_at || row.qualified_at || row.submitted_at || row.created_at || null;

  const lead = {
    id: row.id,
    kind,
    kindLabel: kind === 'devis' ? 'Devis' : 'Convention',
    status,
    statusLabel: LEAD_STATUS_LABELS[status] || status,
    operationalStatus: kind === 'convention' ? row.statut || 'nouveau' : null,
    createdAt: row.created_at,
    submittedAt: row.submitted_at || row.created_at,
    qualifiedAt: row.qualified_at,
    closedAt: row.closed_at,
    source,
    medium,
    campaign,
    landingPage,
    referrerHost: normalizeText(canonicalAttribution.referrerHost, 'Non renseigné'),
    sourceClass,
    sourceClassLabel: SOURCE_CLASS_LABELS[sourceClass] || sourceClass,
    pageType,
    pageTypeLabel: PAGE_TYPE_LABELS[pageType] || pageType,
    businessLine,
    businessLineLabel: BUSINESS_LINE_LABELS[businessLine] || businessLine,
    leadQualityOutcome,
    leadQualityLabel: LEAD_QUALITY_OUTCOME_LABELS[leadQualityOutcome] || leadQualityOutcome,
    leadOwner: normalizeText(row.lead_owner, ''),
    followUpSlaAt: row.follow_up_sla_at || null,
    lastWorkedAt,
    serviceKey,
    serviceLabel: getServiceLabel(serviceKey),
    services: services.map((service) => ({
      key: service,
      label: getServiceLabel(service)
    })),
    calculatorEstimate: normalizeNumber(row.calculator_estimate),
    hoursToQualify: getHoursBetween(row.submitted_at || row.created_at, row.qualified_at),
    hoursToClose: getHoursBetween(row.submitted_at || row.created_at, row.closed_at),
    whatsappClickId: row.whatsapp_click_id || null,
    whatsappClickedAt: row.whatsapp_clicked_at || null,
    whatsappClickLabel: row.whatsapp_click_label || null,
    whatsappClickPage: row.whatsapp_click_page || null,
    whatsappManualTag: Boolean(row.whatsapp_manual_tag),
    whatsappManualTaggedAt: row.whatsapp_manual_tagged_at || null,
    whatsappAttribution,
    whatsappAttributionMode: whatsappAttribution.mode,
    whatsappAttributionLabel: whatsappAttribution.label
  };

  lead.ageHours = getHoursBetween(getMostRecentOpenTimestamp(lead), nowIso);
  return lead;
}

export function normalizeLeadRows(rows, nowIso) {
  return [
    ...(rows.devis || []).map((row) => normalizeLead(row, 'devis', nowIso)),
    ...(rows.conventions || []).map((row) => normalizeLead(row, 'convention', nowIso))
  ];
}

function normalizeFilterValue(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text || text === 'all') {
    return null;
  }

  return text;
}

function normalizeDashboardFilters(filters = {}) {
  return DASHBOARD_FILTER_KEYS.reduce((accumulator, key) => {
    accumulator[key] = normalizeFilterValue(filters[key]);
    return accumulator;
  }, {});
}

function addFilterOption(map, value, label) {
  if (!value) {
    return;
  }

  if (!map.has(value)) {
    map.set(value, {
      value,
      label
    });
  }
}

function buildDashboardFilterOptions({
  universeLeads = [],
  externalMetricRows = [],
  keywordCatalogRows = [],
  keywordRankingRows = []
} = {}) {
  const businessLine = new Map();
  const service = new Map();
  const sourceClass = new Map();
  const pageType = new Map();

  universeLeads.forEach((lead) => {
    addFilterOption(businessLine, lead.businessLine, lead.businessLineLabel);
    addFilterOption(sourceClass, lead.sourceClass, lead.sourceClassLabel);
    addFilterOption(pageType, lead.pageType, lead.pageTypeLabel);
    addFilterOption(service, lead.serviceKey, lead.serviceLabel);
    lead.services.forEach((leadService) => {
      addFilterOption(service, leadService.key, leadService.label);
    });
  });

  externalMetricRows.forEach((row) => {
    const normalizedRow = normalizeExternalMetricRow(row);
    const inferredBusinessLine = getBusinessLineForPath(normalizedRow.landingPage);
    const inferredService = getServiceKeyForPath(normalizedRow.landingPage);

    addFilterOption(businessLine, inferredBusinessLine, getBusinessLineLabel(inferredBusinessLine));
    addFilterOption(sourceClass, normalizedRow.sourceClass, normalizedRow.sourceClassLabel);
    addFilterOption(pageType, normalizedRow.pageType, normalizedRow.pageTypeLabel);
    addFilterOption(service, inferredService, inferredService ? getServiceLabel(inferredService) : null);
  });

  keywordCatalogRows.forEach((row) => {
    const targetPath = row.canonical_target_path || row.target_path || row.canonical_target_url || row.target_url || '/';
    const inferredBusinessLine = getBusinessLineForPath(targetPath);
    const inferredService = getServiceKeyForPath(targetPath);
    const inferredPageType = getPageTypeForPath(targetPath);

    addFilterOption(businessLine, inferredBusinessLine, getBusinessLineLabel(inferredBusinessLine));
    addFilterOption(pageType, inferredPageType, getPageTypeLabel(inferredPageType));
    addFilterOption(service, inferredService, inferredService ? getServiceLabel(inferredService) : null);
  });

  const deviceValues = new Set(KEYWORD_TRACKED_DEVICES);
  keywordRankingRows.forEach((row) => {
    deviceValues.add(normalizeText(row.device, 'desktop'));
  });

  return {
    businessLine: Array.from(businessLine.values()).sort((a, b) => a.label.localeCompare(b.label)),
    service: Array.from(service.values()).sort((a, b) => a.label.localeCompare(b.label)),
    sourceClass: Array.from(sourceClass.values()).sort((a, b) => a.label.localeCompare(b.label)),
    device: Array.from(deviceValues)
      .filter(Boolean)
      .sort((a, b) => {
        const aIndex = KEYWORD_TRACKED_DEVICES.indexOf(a);
        const bIndex = KEYWORD_TRACKED_DEVICES.indexOf(b);
        const safeAIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
        const safeBIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
        return safeAIndex - safeBIndex || a.localeCompare(b);
      })
      .map((value) => ({
        value,
        label: getDeviceLabel(value)
      })),
    pageType: Array.from(pageType.values()).sort((a, b) => a.label.localeCompare(b.label))
  };
}

function buildActiveFilterChips(filters = {}) {
  const chips = [];

  if (filters.businessLine) {
    chips.push({
      key: 'businessLine',
      label: 'Business line',
      value: getBusinessLineLabel(filters.businessLine)
    });
  }

  if (filters.service) {
    chips.push({
      key: 'service',
      label: 'Service',
      value: getServiceLabel(filters.service)
    });
  }

  if (filters.sourceClass) {
    chips.push({
      key: 'sourceClass',
      label: 'Source class',
      value: getSourceClassLabel(filters.sourceClass)
    });
  }

  if (filters.device) {
    chips.push({
      key: 'device',
      label: 'SEO device',
      value: getDeviceLabel(filters.device)
    });
  }

  if (filters.pageType) {
    chips.push({
      key: 'pageType',
      label: 'Page type',
      value: getPageTypeLabel(filters.pageType)
    });
  }

  return chips;
}

function buildDashboardFilterLabel(filters = {}) {
  const parts = [];

  if (filters.businessLine) {
    parts.push(getBusinessLineLabel(filters.businessLine));
  }

  if (filters.service) {
    parts.push(getServiceLabel(filters.service));
  }

  if (filters.sourceClass) {
    parts.push(getSourceClassLabel(filters.sourceClass));
  }

  if (filters.pageType) {
    parts.push(getPageTypeLabel(filters.pageType));
  }

  if (parts.length === 0) {
    return 'All traffic and lead cohorts';
  }

  return parts.join(' · ');
}

function buildDashboardFilterNotes(filters = {}) {
  const notes = [];

  if (filters.businessLine) {
    notes.push('Business line for traffic and SEO views is inferred from landing-page and keyword target paths.');
  }

  if (filters.service) {
    notes.push('Service slices in traffic and SEO views are path-based for now; generic B2B entry pages remain outside service-specific segments.');
  }

  if (filters.device) {
    notes.push('Device currently filters keyword visibility snapshots only; lead, pipeline, and acquisition KPIs remain cross-device.');
  }

  return notes;
}

function matchesLeadFilters(lead, filters = {}) {
  if (filters.businessLine && lead.businessLine !== filters.businessLine) {
    return false;
  }

  if (filters.service) {
    const serviceKeys = new Set([
      lead.serviceKey,
      ...lead.services.map((service) => service.key)
    ]);
    if (!serviceKeys.has(filters.service)) {
      return false;
    }
  }

  if (filters.sourceClass && lead.sourceClass !== filters.sourceClass) {
    return false;
  }

  if (filters.pageType && lead.pageType !== filters.pageType) {
    return false;
  }

  return true;
}

function matchesExternalMetricFilters(row = {}, filters = {}) {
  const normalizedRow = normalizeExternalMetricRow(row);
  const inferredBusinessLine = getBusinessLineForPath(normalizedRow.landingPage);
  const inferredService = getServiceKeyForPath(normalizedRow.landingPage);

  if (filters.businessLine && inferredBusinessLine !== filters.businessLine) {
    return false;
  }

  if (filters.service && inferredService !== filters.service) {
    return false;
  }

  if (filters.sourceClass && normalizedRow.sourceClass !== filters.sourceClass) {
    return false;
  }

  if (filters.pageType && normalizedRow.pageType !== filters.pageType) {
    return false;
  }

  return true;
}

function matchesKeywordCatalogFilters(row = {}, filters = {}) {
  if (filters.sourceClass && filters.sourceClass !== 'organic_search') {
    return false;
  }

  const targetPath = row.canonical_target_path || row.target_path || row.canonical_target_url || row.target_url || '/';
  const inferredBusinessLine = getBusinessLineForPath(targetPath);
  const inferredService = getServiceKeyForPath(targetPath);
  const pageType = getPageTypeForPath(targetPath);

  if (filters.businessLine && inferredBusinessLine !== filters.businessLine) {
    return false;
  }

  if (filters.service && inferredService !== filters.service) {
    return false;
  }

  if (filters.pageType && pageType !== filters.pageType) {
    return false;
  }

  return true;
}

function matchesKeywordRankingFilters(row = {}, filters = {}) {
  if (filters.sourceClass && filters.sourceClass !== 'organic_search') {
    return false;
  }

  const targetPath = row.target_path || row.matched_path || row.matched_url || '/';
  const inferredBusinessLine = getBusinessLineForPath(targetPath);
  const inferredService = getServiceKeyForPath(targetPath);
  const pageType = getPageTypeForPath(targetPath);
  const device = normalizeText(row.device, 'desktop');

  if (filters.businessLine && inferredBusinessLine !== filters.businessLine) {
    return false;
  }

  if (filters.service && inferredService !== filters.service) {
    return false;
  }

  if (filters.pageType && pageType !== filters.pageType) {
    return false;
  }

  if (filters.device && device !== filters.device) {
    return false;
  }

  return true;
}

function matchesQueryMetricFilters(row = {}, filters = {}) {
  if (filters.sourceClass && filters.sourceClass !== 'organic_search') {
    return false;
  }

  if (filters.businessLine && row.businessLine !== filters.businessLine) {
    return false;
  }

  if (filters.service && row.serviceKey !== filters.service) {
    return false;
  }

  if (filters.pageType && row.pageType !== filters.pageType) {
    return false;
  }

  return true;
}

function matchesWhatsAppClickFilters(row = {}, filters = {}) {
  const canonicalAttribution = getCanonicalRowAttribution(row, {
    landingFallback: '/'
  });
  const source = normalizeText(canonicalAttribution.source, 'direct');
  const medium = normalizeText(canonicalAttribution.medium, '(none)');
  const landingPage = normalizeText(canonicalAttribution.landingPage, '/');
  const sourceClass = getSourceClass({ source, medium });
  const pageType = getPageTypeForPath(landingPage);
  const businessLine = getBusinessLineForPath(landingPage);
  const service = getServiceKeyForPath(landingPage);

  if (filters.businessLine && businessLine !== filters.businessLine) {
    return false;
  }

  if (filters.service && service !== filters.service) {
    return false;
  }

  if (filters.sourceClass && sourceClass !== filters.sourceClass) {
    return false;
  }

  if (filters.pageType && pageType !== filters.pageType) {
    return false;
  }

  return true;
}

function filterAuditEvents(auditEvents = [], leads = []) {
  const allowedLeadKeys = new Set(
    leads.map((lead) => `${lead.kind}||${lead.id}`)
  );

  if (allowedLeadKeys.size === 0) {
    return [];
  }

  return auditEvents.filter((event) => {
    const kind = event.lead_kind === 'convention' ? 'convention' : event.lead_kind;
    return allowedLeadKeys.has(`${kind}||${event.lead_id}`);
  });
}

function isWithinRange(value, range) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return timestamp >= new Date(range.fromIso).getTime() && timestamp <= new Date(range.toIso).getTime();
}

function getPercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 1000) / 10;
}

function getAverage(values) {
  const cleanValues = values.filter((value) => Number.isFinite(value));
  if (cleanValues.length === 0) {
    return null;
  }

  const total = cleanValues.reduce((sum, value) => sum + value, 0);
  return Math.round((total / cleanValues.length) * 10) / 10;
}

function getNumberDelta(currentValue, previousValue) {
  if (!Number.isFinite(previousValue)) {
    return null;
  }

  return currentValue - previousValue;
}

function getPercentDelta(currentValue, previousValue) {
  if (!Number.isFinite(previousValue)) {
    return null;
  }

  return Math.round((currentValue - previousValue) * 10) / 10;
}

function buildOverviewCards(currentLeads, previousLeads, universeLeads, range) {
  const previousQualifiedRate = getPercent(
    previousLeads.filter(hasReachedQualified).length,
    previousLeads.length
  );
  const previousWinRate = getPercent(
    previousLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length,
    previousLeads.length
  );
  const previousUnattributedRate = getPercent(
    previousLeads.filter(isUnattributedLead).length,
    previousLeads.length
  );
  const previousRevenueProxy = previousLeads.reduce((sum, lead) => sum + (lead.calculatorEstimate || 0), 0);

  const qualifiedActivity = universeLeads.filter((lead) => isWithinRange(lead.qualifiedAt, range)).length;
  const wonActivity = universeLeads.filter((lead) => (
    lead.status === LEAD_STATUSES.CLOSED_WON && isWithinRange(lead.closedAt, range)
  )).length;
  const qualifiedCohort = currentLeads.filter(hasReachedQualified).length;
  const wonCohort = currentLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length;
  const unattributedLeads = currentLeads.filter(isUnattributedLead).length;
  const revenueProxy = currentLeads.reduce((sum, lead) => sum + (lead.calculatorEstimate || 0), 0);

  const qualifiedRate = getPercent(qualifiedCohort, currentLeads.length);
  const winRate = getPercent(wonCohort, currentLeads.length);
  const unattributedRate = getPercent(unattributedLeads, currentLeads.length);
  const unattributedWarning = getUnattributedRateWarning(unattributedRate);

  return [
    buildKpiCard({
      key: 'new_leads',
      label: 'New leads',
      value: currentLeads.length,
      type: 'number',
      meta: 'Created cohort in selected period',
      delta: getNumberDelta(currentLeads.length, previousLeads.length)
    }),
    buildKpiCard({
      key: 'qualified_activity',
      label: 'Qualified activity',
      value: qualifiedActivity,
      type: 'number',
      meta: '`qualified_at` inside selected period'
    }),
    buildKpiCard({
      key: 'won_activity',
      label: 'Won activity',
      value: wonActivity,
      type: 'number',
      meta: '`closed_at` for won leads inside selected period'
    }),
    buildKpiCard({
      key: 'qualified_rate',
      label: 'Cohort qualification rate',
      value: qualifiedRate,
      type: 'percent',
      meta: 'Share of created leads that reached qualified or beyond',
      delta: getPercentDelta(qualifiedRate, previousQualifiedRate)
    }),
    buildKpiCard({
      key: 'win_rate',
      label: 'Cohort win rate',
      value: winRate,
      type: 'percent',
      meta: 'Share of created leads currently marked won',
      delta: getPercentDelta(winRate, previousWinRate)
    }),
    buildKpiCard({
      key: 'unattributed_rate',
      label: 'Unattributed lead rate',
      value: unattributedRate,
      type: 'percent',
      meta: 'Leads with missing or direct-only source / medium',
      delta: getPercentDelta(unattributedRate, previousUnattributedRate),
      warning: unattributedWarning
    }),
    buildKpiCard({
      key: 'revenue_proxy',
      label: 'Estimated pipeline value',
      value: revenueProxy,
      type: 'currency',
      meta: 'Sum of `calculator_estimate` across created cohort',
      delta: getNumberDelta(revenueProxy, previousRevenueProxy)
    })
  ];
}

function buildFunnel(leads) {
  const total = leads.length;
  const reachedQualified = leads.filter(hasReachedQualified).length;
  const closedWon = leads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length;
  const closedLost = leads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_LOST).length;

  return [
    {
      key: 'created',
      label: 'Créés',
      count: total,
      rate: total ? 100 : 0
    },
    {
      key: 'qualified',
      label: 'Qualifiés ou plus',
      count: reachedQualified,
      rate: getPercent(reachedQualified, total)
    },
    {
      key: 'closed_won',
      label: 'Gagnés',
      count: closedWon,
      rate: getPercent(closedWon, total)
    },
    {
      key: 'closed_lost',
      label: 'Perdus',
      count: closedLost,
      rate: getPercent(closedLost, total)
    }
  ];
}

function addBreakdownValue(map, key, label) {
  const cleanKey = normalizeText(key, 'Non défini');
  const cleanLabel = normalizeText(label || key, 'Non défini');
  const current = map.get(cleanKey) || {
    key: cleanKey,
    label: cleanLabel,
    count: 0
  };

  current.count += 1;
  map.set(cleanKey, current);
}

function finalizeBreakdown(map, total, limit = 8) {
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map((item) => ({
      ...item,
      rate: getPercent(item.count, total)
    }));
}

function buildBreakdowns(leads) {
  const source = new Map();
  const medium = new Map();
  const campaign = new Map();
  const serviceMentions = new Map();
  const primaryService = new Map();
  const kind = new Map();
  const sourceClass = new Map();
  const pageType = new Map();
  const businessLine = new Map();

  leads.forEach((lead) => {
    addBreakdownValue(source, lead.source, lead.source);
    addBreakdownValue(medium, lead.medium, lead.medium);
    addBreakdownValue(campaign, lead.campaign, lead.campaign);
    addBreakdownValue(kind, lead.kind, lead.kindLabel);
    addBreakdownValue(sourceClass, lead.sourceClass, lead.sourceClassLabel);
    addBreakdownValue(pageType, lead.pageType, lead.pageTypeLabel);
    addBreakdownValue(businessLine, lead.businessLine, lead.businessLineLabel);
    addBreakdownValue(primaryService, lead.serviceKey, lead.serviceLabel);

    const services = lead.services.length > 0
      ? lead.services
      : [{ key: lead.serviceKey, label: lead.serviceLabel }];

    services.forEach((leadService) => {
      addBreakdownValue(serviceMentions, leadService.key, leadService.label);
    });
  });

  return {
    source: finalizeBreakdown(source, leads.length),
    medium: finalizeBreakdown(medium, leads.length),
    campaign: finalizeBreakdown(campaign, leads.length),
    serviceMentions: finalizeBreakdown(serviceMentions, leads.length),
    primaryService: finalizeBreakdown(primaryService, leads.length),
    kind: finalizeBreakdown(kind, leads.length),
    sourceClass: finalizeBreakdown(sourceClass, leads.length),
    pageType: finalizeBreakdown(pageType, leads.length),
    businessLine: finalizeBreakdown(businessLine, leads.length)
  };
}

function buildCreatedTrend(leads, range) {
  const byDate = new Map();

  for (let offset = 0; offset < range.days; offset += 1) {
    const date = new Date(`${range.from}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    byDate.set(formatDateKey(date), {
      date: formatDateKey(date),
      created: 0
    });
  }

  leads.forEach((lead) => {
    const createdAt = lead.createdAt;
    if (!createdAt) {
      return;
    }

    const key = formatDateKey(new Date(createdAt));
    const bucket = byDate.get(key);
    if (!bucket) {
      return;
    }

    bucket.created += 1;
  });

  return Array.from(byDate.values());
}

export function buildLifecycleTrend(universeLeads, range) {
  const byDate = new Map();

  for (let offset = 0; offset < range.days; offset += 1) {
    const date = new Date(`${range.from}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    byDate.set(formatDateKey(date), {
      date: formatDateKey(date),
      created: 0,
      qualified: 0,
      won: 0,
      lost: 0
    });
  }

  universeLeads.forEach((lead) => {
    const timestamps = [
      [lead.createdAt, 'created'],
      [lead.qualifiedAt, 'qualified'],
      [lead.closedAt, lead.status === LEAD_STATUSES.CLOSED_WON ? 'won' : lead.status === LEAD_STATUSES.CLOSED_LOST ? 'lost' : null]
    ];

    timestamps.forEach(([timestamp, bucketKey]) => {
      if (!timestamp || !bucketKey || !isWithinRange(timestamp, range)) {
        return;
      }

      const dateKey = formatDateKey(new Date(timestamp));
      const bucket = byDate.get(dateKey);
      if (!bucket) {
        return;
      }

      bucket[bucketKey] += 1;
    });
  });

  return Array.from(byDate.values());
}

function summarizeLead(lead) {
  return {
    id: lead.id,
    kind: lead.kind,
    kindLabel: lead.kindLabel,
    status: lead.status,
    statusLabel: lead.statusLabel,
    operationalStatus: lead.operationalStatus,
    serviceLabel: lead.serviceLabel,
    source: lead.source,
    medium: lead.medium,
    campaign: lead.campaign,
    landingPage: lead.landingPage,
    sourceClass: lead.sourceClass,
    sourceClassLabel: lead.sourceClassLabel,
    pageType: lead.pageType,
    pageTypeLabel: lead.pageTypeLabel,
    businessLine: lead.businessLine,
    businessLineLabel: lead.businessLineLabel,
    leadQualityOutcome: lead.leadQualityOutcome,
    leadQualityLabel: lead.leadQualityLabel,
    leadOwner: lead.leadOwner,
    followUpSlaAt: lead.followUpSlaAt,
    lastWorkedAt: lead.lastWorkedAt,
    createdAt: lead.createdAt,
    submittedAt: lead.submittedAt,
    qualifiedAt: lead.qualifiedAt,
    closedAt: lead.closedAt,
    calculatorEstimate: lead.calculatorEstimate,
    ageHours: lead.ageHours,
    drilldownHref: lead.kind === 'devis' ? `/admin/devis?lead=${lead.id}` : `/admin/conventions?lead=${lead.id}`,
    whatsappAttributionMode: lead.whatsappAttributionMode,
    whatsappAttributionLabel: lead.whatsappAttributionLabel,
    whatsappClickLabel: lead.whatsappClickLabel,
    whatsappClickPage: lead.whatsappClickPage,
    whatsappClickedAt: lead.whatsappClickedAt,
    whatsappManualTag: lead.whatsappManualTag,
    whatsappManualTaggedAt: lead.whatsappManualTaggedAt
  };
}

function normalizeExternalMetricRow(row = {}) {
  const source = normalizeText(row.normalized_source || row.source, 'unknown');
  const medium = normalizeText(row.normalized_medium || row.medium, '(none)');
  const landingPage = normalizeText(row.normalized_landing_page || row.landing_page, '/');
  const sourceClass = normalizeText(row.source_class, getSourceClass({ source, medium }));
  const pageType = normalizeText(row.page_type, getPageTypeForPath(landingPage));

  return {
    metricDate: row.metric_date,
    metricSource: normalizeText(row.metric_source, 'unknown'),
    source,
    medium,
    campaign: normalizeText(row.normalized_campaign || row.campaign, '(not set)'),
    landingPage,
    sourceClass,
    sourceClassLabel: SOURCE_CLASS_LABELS[sourceClass] || sourceClass,
    pageType,
    pageTypeLabel: PAGE_TYPE_LABELS[pageType] || pageType,
    sessions: Number(row.sessions || 0),
    users: Number(row.users || 0),
    events: Number(row.events || 0),
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    spend: Number(row.spend || 0),
    metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : {}
  };
}

function buildWhatsAppTouchpoints(clickRows = [], attributedLeads = []) {
  const map = new Map();

  clickRows.forEach((row) => {
    const key = `${row.eventLabel}||${row.pagePath}`;
    const current = map.get(key) || {
      key,
      label: row.eventLabel,
      pagePath: row.pagePath,
      clicks: 0,
      clickerIds: new Set(),
      autoAttributedLeads: 0,
      totalAttributedLeads: 0
    };

    current.clicks += 1;
    if (row.gaClientId) {
      current.clickerIds.add(row.gaClientId);
    }
    map.set(key, current);
  });

  attributedLeads
    .filter(hasWhatsAppAutoAttribution)
    .forEach((lead) => {
      const key = `${normalizeText(lead.whatsappClickLabel, 'unknown')}||${normalizeText(lead.whatsappClickPage, '/')}`;
      const current = map.get(key) || {
        key,
        label: normalizeText(lead.whatsappClickLabel, 'unknown'),
        pagePath: normalizeText(lead.whatsappClickPage, '/'),
        clicks: 0,
        clickerIds: new Set(),
        autoAttributedLeads: 0,
        totalAttributedLeads: 0
      };

      current.autoAttributedLeads += 1;
      current.totalAttributedLeads += 1;
      map.set(key, current);
    });

  return Array.from(map.values())
    .map((row) => ({
      key: row.key,
      label: row.label,
      pagePath: row.pagePath,
      clicks: row.clicks,
      uniqueClickers: row.clickerIds.size,
      autoAttributedLeads: row.autoAttributedLeads,
      totalAttributedLeads: row.totalAttributedLeads
    }))
    .sort((a, b) => (
      b.autoAttributedLeads - a.autoAttributedLeads
      || b.clicks - a.clicks
      || b.uniqueClickers - a.uniqueClickers
      || a.label.localeCompare(b.label)
    ))
    .slice(0, 10);
}

function buildWhatsAppAcquisition(currentLeads, whatsappClickRows = []) {
  const normalizedClickRows = (whatsappClickRows || []).map(normalizeWhatsAppClickRow);
  const attributedLeads = currentLeads
    .filter(isWhatsAppAttributed)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const uniqueClickers = new Set(
    normalizedClickRows
      .map((row) => row.gaClientId)
      .filter(Boolean)
  );

  return {
    summary: {
      clicks: normalizedClickRows.length,
      uniqueClickers: uniqueClickers.size,
      autoAttributedLeads: currentLeads.filter(hasWhatsAppAutoAttribution).length,
      manualTaggedLeads: currentLeads.filter(hasWhatsAppManualTag).length,
      totalAttributedLeads: attributedLeads.length
    },
    funnel: buildFunnel(attributedLeads),
    touchpoints: buildWhatsAppTouchpoints(normalizedClickRows, attributedLeads),
    recentLeads: attributedLeads.slice(0, 8).map((lead) => ({
      ...summarizeLead(lead),
      metaLinePrimary: `${lead.whatsappAttributionLabel} • ${lead.source} / ${lead.medium}`,
      metaLineSecondary: lead.whatsappClickLabel
        ? `${lead.whatsappClickLabel}${lead.whatsappClickPage ? ` • ${lead.whatsappClickPage}` : ''}`
        : lead.landingPage,
      metaLineTertiary: lead.whatsappManualTag
        ? (hasWhatsAppAutoAttribution(lead) ? 'Match auto + tag manuel' : 'Tag manuel WhatsApp')
        : 'Match automatique',
      metaDateTime: lead.createdAt
    })),
    notes: {
      clickBasis: 'Clics WhatsApp enregistrés côté serveur sur la période sélectionnée.',
      funnelBasis: 'Leads créés sur la période sélectionnée avec attribution WhatsApp auto, manuelle, ou les deux.',
      manualTagExplanation: 'Le tag manuel permet d’inclure les leads créés hors formulaire après une conversation WhatsApp.',
      autoMatchWindow: `Matching automatique sur le dernier clic WhatsApp du même navigateur dans les ${WHATSAPP_MATCH_WINDOW_DAYS} derniers jours.`
    }
  };
}

function normalizeTextArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item, ''))
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return String(value)
    .split(/\s*\|\s*/)
    .map((item) => normalizeText(item, ''))
    .filter(Boolean);
}

function normalizeKeywordCatalogMetricRow(row = {}) {
  const normalizedKeyword = normalizeKeywordForKey(row.normalized_keyword || row.display_keyword || '');
  const canonicalTargetUrl = normalizeText(
    row.canonical_target_url,
    buildKeywordCatalogUrl(row.canonical_target_path || '/', process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_KEYWORD_SITE_URL)
  );
  const referencePosition = normalizeNumber(row.reference_current_position);
  const referenceLastUpdated = row.reference_last_updated
    ? normalizeText(row.reference_last_updated)
    : null;

  return {
    id: row.id || null,
    lookupKey: buildKeywordCatalogLookupKey({
      normalizedKeyword,
      canonicalTargetUrl
    }),
    normalizedKeyword,
    label: normalizeText(row.display_keyword || row.normalized_keyword, 'Non renseigné'),
    targetUrl: canonicalTargetUrl,
    targetPath: normalizeText(row.canonical_target_path, '/'),
    targetDomain: normalizeText(row.target_domain, 'Non renseigné'),
    categoryTags: normalizeTextArray(row.category_tags),
    searchIntentTags: normalizeTextArray(row.search_intent_tags),
    contentTypeTags: normalizeTextArray(row.content_type_tags),
    priorityTags: normalizeTextArray(row.priority_tags),
    trendTags: normalizeTextArray(row.trend_tags),
    referenceClicks: normalizeNumber(row.reference_clicks),
    referenceImpressions: normalizeNumber(row.reference_impressions),
    referencePosition: referencePosition !== null && referencePosition > 0 ? referencePosition : null,
    referenceCtr: normalizeNumber(row.reference_ctr),
    referenceLastUpdated
  };
}

function normalizeKeywordRankingMetricRow(row = {}) {
  const numericPosition = Number(row.position);
  const targetPath = normalizeText(row.target_path, '/');

  return {
    keywordCatalogId: row.keyword_catalog_id || null,
    metricDate: row.metric_date,
    keyword: normalizeText(row.keyword, 'Non renseigné'),
    keywordLabel: normalizeText(row.keyword_label || row.keyword, normalizeText(row.keyword, 'Non renseigné')),
    targetDomain: normalizeText(row.target_domain, 'Non renseigné'),
    targetPath,
    matchedDomain: row.matched_domain ? normalizeText(row.matched_domain) : null,
    matchedPath: row.matched_path ? normalizeText(row.matched_path) : null,
    matchedUrl: row.matched_url ? normalizeText(row.matched_url) : null,
    resultTitle: row.result_title ? normalizeText(row.result_title) : null,
    resultSnippet: row.result_snippet ? normalizeText(row.result_snippet) : null,
    position: Number.isFinite(numericPosition) ? numericPosition : null,
    isRanked: Boolean(row.is_ranked ?? Number.isFinite(numericPosition)),
    device: normalizeText(row.device, 'desktop'),
    googleDomain: normalizeText(row.google_domain, 'google.com'),
    gl: normalizeText(row.gl, ''),
    hl: normalizeText(row.hl, ''),
    location: normalizeText(row.location, ''),
    resultsCount: Number(row.results_count || 0),
    catalogLookupKey: buildKeywordCatalogLookupKeyFromValues({
      keyword: row.keyword,
      targetPath,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_KEYWORD_SITE_URL
    }),
    metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : {}
  };
}

function getKeywordPriorityScore(priorityTags = []) {
  const priorityMap = {
    high: 3,
    medium: 2,
    low: 1
  };

  return priorityTags.reduce((maxScore, tag) => (
    Math.max(maxScore, priorityMap[String(tag).toLowerCase()] || 0)
  ), 0);
}

function buildDeviceKeywordDistribution(items, deviceKey) {
  const latestPositions = items.map((item) => item[deviceKey].latestPosition);
  const buckets = [
    {
      key: `${deviceKey}_top_3`,
      label: 'Top 3',
      count: latestPositions.filter((value) => value !== null && value <= 3).length
    },
    {
      key: `${deviceKey}_top_10`,
      label: '4-10',
      count: latestPositions.filter((value) => value !== null && value >= 4 && value <= 10).length
    },
    {
      key: `${deviceKey}_top_20`,
      label: '11-20',
      count: latestPositions.filter((value) => value !== null && value >= 11 && value <= 20).length
    },
    {
      key: `${deviceKey}_not_ranked`,
      label: 'Non classés',
      count: latestPositions.filter((value) => value === null).length
    }
  ];

  return buckets.map((bucket) => ({
    ...bucket,
    rate: getPercent(bucket.count, items.length)
  }));
}

function buildReferenceKeywordDistribution(items = [], deviceKey) {
  const referencePositions = items.map((item) => item.reference?.position ?? null);
  const buckets = [
    {
      key: `${deviceKey}_top_3`,
      label: 'Top 3',
      count: referencePositions.filter((value) => value !== null && value <= 3).length
    },
    {
      key: `${deviceKey}_top_10`,
      label: '4-10',
      count: referencePositions.filter((value) => value !== null && value >= 4 && value <= 10).length
    },
    {
      key: `${deviceKey}_top_20`,
      label: '11-20',
      count: referencePositions.filter((value) => value !== null && value >= 11 && value <= 20).length
    },
    {
      key: `${deviceKey}_not_ranked`,
      label: 'Non classés',
      count: referencePositions.filter((value) => value === null).length
    }
  ];

  return buckets.map((bucket) => ({
    ...bucket,
    rate: getPercent(bucket.count, items.length)
  }));
}

function buildKeywordVisibilityTrend(rows) {
  const byDate = new Map();

  rows.forEach((row) => {
    const bucket = byDate.get(row.metricDate) || {
      date: row.metricDate,
      desktopRanked: 0,
      mobileRanked: 0,
      desktopTop10: 0,
      mobileTop10: 0
    };
    const rankedKey = row.device === 'mobile' ? 'mobileRanked' : 'desktopRanked';
    const top10Key = row.device === 'mobile' ? 'mobileTop10' : 'desktopTop10';

    if (row.isRanked && row.position !== null) {
      bucket[rankedKey] += 1;
      if (row.position <= 10) {
        bucket[top10Key] += 1;
      }
    }

    byDate.set(row.metricDate, bucket);
  });

  return Array.from(byDate.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildKeywordPositionTrend(rows) {
  const byDate = new Map();

  rows.forEach((row) => {
    const bucket = byDate.get(row.metricDate) || {
      date: row.metricDate,
      desktopPositions: [],
      mobilePositions: []
    };
    const positionsKey = row.device === 'mobile' ? 'mobilePositions' : 'desktopPositions';

    if (row.isRanked && row.position !== null) {
      bucket[positionsKey].push(row.position);
    }

    byDate.set(row.metricDate, bucket);
  });

  return Array.from(byDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((bucket) => ({
      date: bucket.date,
      desktopAveragePosition: getAverage(bucket.desktopPositions),
      mobileAveragePosition: getAverage(bucket.mobilePositions),
      desktopBestPosition: bucket.desktopPositions.length > 0 ? Math.min(...bucket.desktopPositions) : null,
      mobileBestPosition: bucket.mobilePositions.length > 0 ? Math.min(...bucket.mobilePositions) : null,
      desktopRanked: bucket.desktopPositions.length,
      mobileRanked: bucket.mobilePositions.length
    }))
    .filter((bucket) => bucket.desktopAveragePosition !== null || bucket.mobileAveragePosition !== null);
}

function buildReferenceKeywordVisibilityTrend(items = []) {
  const byDate = new Map();

  items.forEach((item) => {
    const metricDate = item.reference?.lastUpdated;

    if (!metricDate) {
      return;
    }

    const bucket = byDate.get(metricDate) || {
      date: metricDate,
      desktopRanked: 0,
      mobileRanked: 0,
      desktopTop10: 0,
      mobileTop10: 0
    };

    if (item.reference.position !== null && item.reference.position !== undefined) {
      bucket.desktopRanked += 1;
      bucket.mobileRanked += 1;

      if (item.reference.position <= 10) {
        bucket.desktopTop10 += 1;
        bucket.mobileTop10 += 1;
      }
    }

    byDate.set(metricDate, bucket);
  });

  return Array.from(byDate.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildReferenceKeywordPositionTrend(items = []) {
  const byDate = new Map();

  items.forEach((item) => {
    const metricDate = item.reference?.lastUpdated;

    if (!metricDate || item.reference.position === null || item.reference.position === undefined) {
      return;
    }

    const bucket = byDate.get(metricDate) || {
      date: metricDate,
      positions: []
    };

    bucket.positions.push(item.reference.position);
    byDate.set(metricDate, bucket);
  });

  return Array.from(byDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((bucket) => ({
      date: bucket.date,
      desktopAveragePosition: getAverage(bucket.positions),
      mobileAveragePosition: getAverage(bucket.positions),
      desktopBestPosition: bucket.positions.length > 0 ? Math.min(...bucket.positions) : null,
      mobileBestPosition: bucket.positions.length > 0 ? Math.min(...bucket.positions) : null,
      desktopRanked: bucket.positions.length,
      mobileRanked: bucket.positions.length
    }))
    .filter((bucket) => bucket.desktopAveragePosition !== null || bucket.mobileAveragePosition !== null);
}

function summarizeKeywordDeviceRows(rows = []) {
  if (rows.length === 0) {
    return {
      earliestMetricDate: null,
      latestMetricDate: null,
      latestPosition: null,
      previousPosition: null,
      positionChange: null,
      bestPosition: null,
      trackedSnapshots: 0,
      rankedSnapshots: 0,
      isRanked: false,
      matchedPath: null,
      matchedUrl: null,
      resultTitle: null
    };
  }

  const sortedRows = [...rows].sort((a, b) => a.metricDate.localeCompare(b.metricDate));
  const latestRow = sortedRows.at(-1);
  const previousRow = sortedRows.length > 1 ? sortedRows.at(-2) : null;
  const rankedPositions = sortedRows
    .filter((row) => row.isRanked && row.position !== null)
    .map((row) => row.position);

  return {
    earliestMetricDate: sortedRows[0]?.metricDate || null,
    latestMetricDate: latestRow.metricDate,
    latestPosition: latestRow.isRanked ? latestRow.position : null,
    previousPosition: previousRow?.isRanked ? previousRow.position : null,
    positionChange: latestRow.isRanked && previousRow?.isRanked
      ? Math.round((previousRow.position - latestRow.position) * 10) / 10
      : null,
    bestPosition: rankedPositions.length > 0 ? Math.min(...rankedPositions) : null,
    trackedSnapshots: sortedRows.length,
    rankedSnapshots: rankedPositions.length,
    isRanked: Boolean(latestRow.isRanked && latestRow.position !== null),
    matchedPath: latestRow.matchedPath,
    matchedUrl: latestRow.matchedUrl,
    resultTitle: latestRow.resultTitle
  };
}

function getBestCurrentKeywordPosition(keywordRow) {
  const candidates = [
    keywordRow.desktop.latestPosition,
    keywordRow.mobile.latestPosition
  ].filter((value) => value !== null);

  if (candidates.length === 0) {
    return null;
  }

  return Math.min(...candidates);
}

function resolveCatalogRowForRanking(row, catalogById, catalogByLookupKey) {
  if (row.keywordCatalogId && catalogById.has(row.keywordCatalogId)) {
    return catalogById.get(row.keywordCatalogId);
  }

  if (row.catalogLookupKey && catalogByLookupKey.has(row.catalogLookupKey)) {
    return catalogByLookupKey.get(row.catalogLookupKey);
  }

  return null;
}

function buildKeywordRankings(keywordCatalogRows = [], keywordRankingRows = [], {
  deviceFilter = null
} = {}) {
  const normalizedCatalogRows = keywordCatalogRows
    .map(normalizeKeywordCatalogMetricRow)
    .filter((row) => row.normalizedKeyword && row.targetUrl);
  const catalogById = new Map(
    normalizedCatalogRows
      .filter((row) => row.id)
      .map((row) => [row.id, row])
  );
  const catalogByLookupKey = new Map(
    normalizedCatalogRows.map((row) => [row.lookupKey, row])
  );
  const normalizedRankingRows = keywordRankingRows
    .map(normalizeKeywordRankingMetricRow)
    .filter((row) => row.metricDate && row.keyword);
  const resolvedRankingRows = normalizedRankingRows.map((row) => ({
    row,
    catalogRow: resolveCatalogRowForRanking(row, catalogById, catalogByLookupKey)
  }));
  const matchedRankingRows = resolvedRankingRows
    .filter(({ catalogRow }) => Boolean(catalogRow))
    .map(({ row }) => row);
  const rawMetricDates = normalizedRankingRows.map((row) => row.metricDate).sort();
  const matchedMetricDates = matchedRankingRows.map((row) => row.metricDate).sort();
  const snapshotDiagnostics = {
    rawSnapshotCount: normalizedRankingRows.length,
    matchedSnapshotCount: matchedRankingRows.length,
    unmatchedSnapshotCount: Math.max(normalizedRankingRows.length - matchedRankingRows.length, 0),
    earliestRawMetricDate: rawMetricDates[0] || null,
    latestRawMetricDate: rawMetricDates.at(-1) || null,
    earliestMatchedMetricDate: matchedMetricDates[0] || null,
    latestMatchedMetricDate: matchedMetricDates.at(-1) || null,
    referenceRankedCount: 0,
    earliestReferenceMetricDate: null,
    latestReferenceMetricDate: null,
    usingReferenceFallback: false
  };

  if (normalizedCatalogRows.length === 0) {
    return {
      latestMetricDate: null,
      earliestMetricDate: null,
      totals: {
        trackedKeywords: 0,
        rankedKeywords: 0,
        desktopRankedKeywords: 0,
        mobileRankedKeywords: 0,
        averagePosition: null,
        top10Count: 0
      },
      rows: [],
      distributionByDevice: {
        desktop: [],
        mobile: []
      },
      visibilityTrend: [],
      positionTrend: [],
      trend: [],
      snapshotDiagnostics,
      devices: {
        desktop: { latestMetricDate: null, earliestMetricDate: null },
        mobile: { latestMetricDate: null, earliestMetricDate: null }
      },
      usingReferenceFallback: false
    };
  }

  const rowsByCatalogAndDevice = new Map();
  resolvedRankingRows.forEach(({ row, catalogRow }) => {
    if (!catalogRow) {
      return;
    }

    const groupKey = `${catalogRow.lookupKey}||${row.device}`;
    const current = rowsByCatalogAndDevice.get(groupKey) || [];
    current.push(row);
    rowsByCatalogAndDevice.set(groupKey, current);
  });

  const keywordRowsBase = normalizedCatalogRows.map((catalogRow) => {
    const desktop = summarizeKeywordDeviceRows(rowsByCatalogAndDevice.get(`${catalogRow.lookupKey}||desktop`) || []);
    const mobile = summarizeKeywordDeviceRows(rowsByCatalogAndDevice.get(`${catalogRow.lookupKey}||mobile`) || []);
    const currentBestPosition = getBestCurrentKeywordPosition({
      desktop,
      mobile
    });

    return {
      key: catalogRow.lookupKey,
      id: catalogRow.id,
      label: catalogRow.label,
      keyword: catalogRow.normalizedKeyword,
      targetPath: catalogRow.targetPath,
      targetUrl: catalogRow.targetUrl,
      categoryTags: catalogRow.categoryTags,
      searchIntentTags: catalogRow.searchIntentTags,
      contentTypeTags: catalogRow.contentTypeTags,
      priorityTags: catalogRow.priorityTags,
      trendTags: catalogRow.trendTags,
      reference: {
        clicks: catalogRow.referenceClicks,
        impressions: catalogRow.referenceImpressions,
        position: catalogRow.referencePosition,
        ctr: catalogRow.referenceCtr,
        lastUpdated: catalogRow.referenceLastUpdated
      },
      desktop,
      mobile,
      currentBestPosition,
      hasLiveSnapshots: desktop.trackedSnapshots > 0 || mobile.trackedSnapshots > 0
    };
  });

  const referenceRows = keywordRowsBase.filter((row) => row.reference.position !== null);
  const referenceMetricDates = referenceRows
    .map((row) => row.reference.lastUpdated)
    .filter(Boolean)
    .sort();
  const usingReferenceFallback = !deviceFilter && matchedRankingRows.length === 0 && referenceRows.length > 0;
  snapshotDiagnostics.referenceRankedCount = referenceRows.length;
  snapshotDiagnostics.earliestReferenceMetricDate = referenceMetricDates[0] || null;
  snapshotDiagnostics.latestReferenceMetricDate = referenceMetricDates.at(-1) || null;
  snapshotDiagnostics.usingReferenceFallback = usingReferenceFallback;

  const keywordRows = keywordRowsBase.map((row) => {
    const effectiveBestPosition = row.currentBestPosition ?? (usingReferenceFallback ? row.reference.position : null);

    return {
      ...row,
      effectiveBestPosition,
      hasReferencePosition: row.reference.position !== null,
      usesReferenceFallback: usingReferenceFallback && row.reference.position !== null && !row.hasLiveSnapshots
    };
  });

  keywordRows.sort((a, b) => (
    getKeywordPriorityScore(b.priorityTags) - getKeywordPriorityScore(a.priorityTags)
    || (a.effectiveBestPosition === null ? 1 : 0) - (b.effectiveBestPosition === null ? 1 : 0)
    || (a.effectiveBestPosition ?? Number.MAX_SAFE_INTEGER) - (b.effectiveBestPosition ?? Number.MAX_SAFE_INTEGER)
    || a.label.localeCompare(b.label)
  ));

  const rankedRows = keywordRows.filter((row) => row.effectiveBestPosition !== null);
  const desktopRows = keywordRows.filter((row) => (
    usingReferenceFallback
      ? row.reference.position !== null
      : row.desktop.latestPosition !== null
  ));
  const mobileRows = keywordRows.filter((row) => (
    usingReferenceFallback
      ? row.reference.position !== null
      : row.mobile.latestPosition !== null
  ));
  const visibilityTrend = usingReferenceFallback
    ? buildReferenceKeywordVisibilityTrend(keywordRows)
    : buildKeywordVisibilityTrend(matchedRankingRows);
  const positionTrend = usingReferenceFallback
    ? buildReferenceKeywordPositionTrend(keywordRows)
    : buildKeywordPositionTrend(matchedRankingRows);
  const deviceDates = KEYWORD_TRACKED_DEVICES.reduce((accumulator, device) => {
    if (usingReferenceFallback) {
      accumulator[device] = {
        earliestMetricDate: referenceMetricDates[0] || null,
        latestMetricDate: referenceMetricDates.at(-1) || null
      };
      return accumulator;
    }

    const metricDates = matchedRankingRows
      .filter((row) => row.device === device)
      .map((row) => row.metricDate)
      .sort();

    accumulator[device] = {
      earliestMetricDate: metricDates[0] || null,
      latestMetricDate: metricDates.at(-1) || null
    };
    return accumulator;
  }, {});

  return {
    latestMetricDate: usingReferenceFallback
      ? referenceMetricDates.at(-1) || null
      : matchedRankingRows.map((row) => row.metricDate).sort().at(-1) || null,
    earliestMetricDate: usingReferenceFallback
      ? referenceMetricDates[0] || null
      : matchedRankingRows.map((row) => row.metricDate).sort()[0] || null,
    totals: {
      trackedKeywords: keywordRows.length,
      rankedKeywords: rankedRows.length,
      desktopRankedKeywords: desktopRows.length,
      mobileRankedKeywords: mobileRows.length,
      averagePosition: getAverage(rankedRows.map((row) => row.effectiveBestPosition)),
      top10Count: rankedRows.filter((row) => row.effectiveBestPosition <= 10).length
    },
    rows: keywordRows.slice(0, 12),
    distributionByDevice: {
      desktop: usingReferenceFallback
        ? buildReferenceKeywordDistribution(keywordRows, 'desktop')
        : buildDeviceKeywordDistribution(keywordRows, 'desktop'),
      mobile: usingReferenceFallback
        ? buildReferenceKeywordDistribution(keywordRows, 'mobile')
        : buildDeviceKeywordDistribution(keywordRows, 'mobile')
    },
    visibilityTrend,
    positionTrend,
    trend: visibilityTrend,
    snapshotDiagnostics,
    devices: deviceDates,
    usingReferenceFallback
  };
}

function roundMetric(value, digits = 1) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(numericValue * factor) / factor;
}

function normalizeQueryMetricDashboardRow(row = {}) {
  const query = String(row.query || '').trim();
  const landingPage = normalizeText(row.normalized_landing_page || row.landing_page, '/');
  const serviceKey = String(row.service_key || getServiceKeyForPath(landingPage) || '').trim() || null;
  const pageType = normalizeText(row.page_type, getPageTypeForPath(landingPage));
  const businessLine = normalizeText(row.business_line, getBusinessLineForPath(landingPage));
  const clusterLabel = String(
    row.cluster_label
      || (serviceKey ? getServiceLabel(serviceKey) : getPageTypeLabel(pageType))
      || 'Other'
  ).trim();
  const impressions = Number(row.impressions || 0);
  const clicks = Number(row.clicks || 0);

  return {
    metricDate: row.metric_date,
    query: query || 'Query non définie',
    normalizedQuery: normalizeKeywordForKey(row.normalized_query || query),
    landingPage,
    keywordCatalogId: row.keyword_catalog_id || null,
    clusterKey: String(row.cluster_key || normalizeKeywordForKey(clusterLabel || 'other')).trim() || 'other',
    clusterLabel: clusterLabel || 'Other',
    businessLine,
    businessLineLabel: getBusinessLineLabel(businessLine),
    serviceKey,
    serviceLabel: serviceKey ? getServiceLabel(serviceKey) : 'Autre',
    pageType,
    pageTypeLabel: getPageTypeLabel(pageType),
    sourceClass: 'organic_search',
    sourceClassLabel: getSourceClassLabel('organic_search'),
    clicks,
    impressions,
    ctr: normalizeNumber(row.ctr) ?? getPercent(clicks, impressions),
    position: normalizeNumber(row.position),
    isBranded: Boolean(row.is_branded),
    matchedCatalog: Boolean(row.keyword_catalog_id || row.metadata?.matched_catalog),
    metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : {}
  };
}

function buildQueryAggregateRows(queryMetricRows = []) {
  const byQuery = new Map();
  const byCluster = new Map();

  queryMetricRows.forEach((row) => {
    const queryKey = row.normalizedQuery;
    const currentQuery = byQuery.get(queryKey) || {
      key: queryKey,
      label: row.query,
      normalizedQuery: row.normalizedQuery,
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
      positionWeight: 0,
      landingPages: new Map(),
      clusterCounts: new Map(),
      businessLineCounts: new Map(),
      serviceCounts: new Map(),
      pageTypeCounts: new Map(),
      isBranded: false,
      matchedCatalogCount: 0
    };

    currentQuery.clicks += row.clicks;
    currentQuery.impressions += row.impressions;
    currentQuery.isBranded = currentQuery.isBranded || row.isBranded;
    currentQuery.matchedCatalogCount += row.matchedCatalog ? 1 : 0;

    if (row.position !== null) {
      const weight = Math.max(row.impressions, 1);
      currentQuery.weightedPosition += row.position * weight;
      currentQuery.positionWeight += weight;
    }

    const landingPageEntry = currentQuery.landingPages.get(row.landingPage) || {
      landingPage: row.landingPage,
      clicks: 0,
      impressions: 0
    };
    landingPageEntry.clicks += row.clicks;
    landingPageEntry.impressions += row.impressions;
    currentQuery.landingPages.set(row.landingPage, landingPageEntry);

    currentQuery.clusterCounts.set(
      row.clusterKey,
      {
        key: row.clusterKey,
        label: row.clusterLabel,
        count: (currentQuery.clusterCounts.get(row.clusterKey)?.count || 0) + 1
      }
    );
    currentQuery.businessLineCounts.set(
      row.businessLine,
      {
        key: row.businessLine,
        label: row.businessLineLabel,
        count: (currentQuery.businessLineCounts.get(row.businessLine)?.count || 0) + 1
      }
    );
    if (row.serviceKey) {
      currentQuery.serviceCounts.set(
        row.serviceKey,
        {
          key: row.serviceKey,
          label: row.serviceLabel,
          count: (currentQuery.serviceCounts.get(row.serviceKey)?.count || 0) + 1
        }
      );
    }
    currentQuery.pageTypeCounts.set(
      row.pageType,
      {
        key: row.pageType,
        label: row.pageTypeLabel,
        count: (currentQuery.pageTypeCounts.get(row.pageType)?.count || 0) + 1
      }
    );
    byQuery.set(queryKey, currentQuery);

    const currentCluster = byCluster.get(row.clusterKey) || {
      key: row.clusterKey,
      label: row.clusterLabel,
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
      positionWeight: 0,
      queryKeys: new Set(),
      landingPages: new Set(),
      nonBrandedClicks: 0
    };

    currentCluster.clicks += row.clicks;
    currentCluster.impressions += row.impressions;
    currentCluster.queryKeys.add(queryKey);
    currentCluster.landingPages.add(row.landingPage);
    if (!row.isBranded) {
      currentCluster.nonBrandedClicks += row.clicks;
    }
    if (row.position !== null) {
      const weight = Math.max(row.impressions, 1);
      currentCluster.weightedPosition += row.position * weight;
      currentCluster.positionWeight += weight;
    }
    byCluster.set(row.clusterKey, currentCluster);
  });

  const queryRows = Array.from(byQuery.values()).map((item) => {
    const landingPages = Array.from(item.landingPages.values())
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions || a.landingPage.localeCompare(b.landingPage));
    const cluster = Array.from(item.clusterCounts.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0] || {
      key: 'other',
      label: 'Other'
    };
    const businessLine = Array.from(item.businessLineCounts.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0] || {
      key: 'unknown',
      label: 'Unknown'
    };
    const service = Array.from(item.serviceCounts.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0] || null;
    const pageType = Array.from(item.pageTypeCounts.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0] || {
      key: 'other',
      label: 'Other'
    };
    const position = item.positionWeight > 0
      ? roundMetric(item.weightedPosition / item.positionWeight, 1)
      : null;
    const ctr = getPercent(item.clicks, item.impressions);
    const opportunityScoreBase = (
      (Math.min(item.impressions, 2000) / 20)
      + (position !== null && position >= 3 && position <= 20 ? (21 - position) * 3 : 0)
      + (item.impressions >= 100 ? Math.max(0, 5 - ctr) * 8 : 0)
      + (landingPages.length > 1 ? 12 : 0)
    );

    return {
      key: item.key,
      label: item.label,
      normalizedQuery: item.normalizedQuery,
      clicks: item.clicks,
      impressions: item.impressions,
      ctr,
      position,
      isBranded: item.isBranded,
      landingPageCount: landingPages.length,
      landingPages: landingPages.slice(0, 3),
      primaryLandingPage: landingPages[0]?.landingPage || '/',
      clusterKey: cluster.key,
      clusterLabel: cluster.label,
      businessLine: businessLine.key,
      businessLineLabel: businessLine.label,
      serviceKey: service?.key || null,
      serviceLabel: service?.label || 'Autre',
      pageType: pageType.key,
      pageTypeLabel: pageType.label,
      matchedCatalogCount: item.matchedCatalogCount,
      opportunityScore: roundMetric(
        opportunityScoreBase * (item.isBranded ? 0.35 : 1),
        1
      ) || 0
    };
  });

  queryRows.sort((a, b) => (
    b.clicks - a.clicks
    || b.impressions - a.impressions
    || a.label.localeCompare(b.label)
  ));

  const clusterRows = Array.from(byCluster.values())
    .map((item) => ({
      key: item.key,
      label: item.label,
      clicks: item.clicks,
      impressions: item.impressions,
      nonBrandedClicks: item.nonBrandedClicks,
      queryCount: item.queryKeys.size,
      landingPageCount: item.landingPages.size,
      ctr: getPercent(item.clicks, item.impressions),
      position: item.positionWeight > 0
        ? roundMetric(item.weightedPosition / item.positionWeight, 1)
        : null
    }))
    .sort((a, b) => (
      b.nonBrandedClicks - a.nonBrandedClicks
      || b.clicks - a.clicks
      || b.impressions - a.impressions
      || a.label.localeCompare(b.label)
    ));

  const weightedPositionSum = queryRows.reduce((total, row) => (
    total + ((row.position || 0) * Math.max(row.impressions, 1))
  ), 0);
  const weightedPositionWeight = queryRows.reduce((total, row) => (
    total + (row.position === null ? 0 : Math.max(row.impressions, 1))
  ), 0);

  return {
    queryRows,
    clusterRows,
    summary: {
      totalQueries: queryRows.length,
      brandedClicks: queryRows.filter((row) => row.isBranded).reduce((sum, row) => sum + row.clicks, 0),
      nonBrandedClicks: queryRows.filter((row) => !row.isBranded).reduce((sum, row) => sum + row.clicks, 0),
      totalClicks: queryRows.reduce((sum, row) => sum + row.clicks, 0),
      totalImpressions: queryRows.reduce((sum, row) => sum + row.impressions, 0),
      averagePosition: weightedPositionWeight > 0
        ? roundMetric(weightedPositionSum / weightedPositionWeight, 1)
        : null,
      cannibalizedQueryCount: queryRows.filter((row) => row.landingPageCount > 1).length
    }
  };
}

function buildSeoQueries(queryMetricRows = [], filters = {}) {
  const { queryRows, clusterRows, summary } = buildQueryAggregateRows(queryMetricRows);
  const opportunityRows = [...queryRows]
    .filter((row) => !row.isBranded && row.impressions > 0)
    .sort((a, b) => (
      b.opportunityScore - a.opportunityScore
      || b.impressions - a.impressions
      || b.clicks - a.clicks
      || a.label.localeCompare(b.label)
    ))
    .slice(0, 8);

  return {
    summary: {
      ...summary,
      nonBrandedClickShare: getPercent(summary.nonBrandedClicks, summary.totalClicks),
      organicCtr: getPercent(summary.totalClicks, summary.totalImpressions)
    },
    topQueries: queryRows.slice(0, 10),
    opportunities: opportunityRows,
    clusters: clusterRows.slice(0, 8),
    notes: {
      basis: 'Search Console query rows aggregated across the selected period.',
      brandedDefinition: 'Branded queries are matched with the internal brand pattern list and separated from non-branded opportunity work.',
      deviceScope: filters.device
        ? 'Query intelligence is currently cross-device; the device filter still only narrows SERP keyword visibility snapshots.'
        : null
    }
  };
}

function buildLandingPageScorecard(currentLeads, externalMetricRows, queryMetricRows = []) {
  const combinedRows = buildCombinedChannelPerformance(currentLeads, externalMetricRows);
  const pageRows = aggregateCombinedRows(
    combinedRows,
    (row) => row.landingPage,
    (row) => row.landingPage,
    { limit: 250 }
  );
  const queryCoverage = new Map();

  queryMetricRows.forEach((row) => {
    const current = queryCoverage.get(row.landingPage) || {
      queryKeys: new Set(),
      nonBrandedClicks: 0,
      clusterCounts: new Map()
    };

    current.queryKeys.add(row.normalizedQuery);
    if (!row.isBranded) {
      current.nonBrandedClicks += row.clicks;
    }
    current.clusterCounts.set(
      row.clusterKey,
      {
        key: row.clusterKey,
        label: row.clusterLabel,
        count: (current.clusterCounts.get(row.clusterKey)?.count || 0) + 1
      }
    );
    queryCoverage.set(row.landingPage, current);
  });

  const rows = pageRows
    .map((row) => {
      const serviceKey = getServiceKeyForPath(row.label);
      const businessLine = getBusinessLineForPath(row.label);
      const pageType = getPageTypeForPath(row.label);
      const coverage = queryCoverage.get(row.label) || null;
      const dominantCluster = coverage
        ? Array.from(coverage.clusterCounts.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0]
        : null;
      const opportunityScore = roundMetric(
        (row.qualifiedLeads * 25)
        + (row.wonLeads * 50)
        + (Math.min(row.clicks, 500) / 10)
        + (Math.min(row.revenueProxy, 5000) / 250)
        + row.leadRate
        + ((coverage?.nonBrandedClicks || 0) / 20),
        1
      ) || 0;

      return {
        ...row,
        businessLine,
        businessLineLabel: getBusinessLineLabel(businessLine),
        serviceKey,
        serviceLabel: serviceKey ? getServiceLabel(serviceKey) : 'Autre',
        pageType,
        pageTypeLabel: getPageTypeLabel(pageType),
        queryCount: coverage?.queryKeys.size || 0,
        nonBrandedClicks: coverage?.nonBrandedClicks || 0,
        dominantClusterLabel: dominantCluster?.label || 'Other',
        opportunityScore
      };
    })
    .sort((a, b) => (
      b.opportunityScore - a.opportunityScore
      || b.qualifiedLeads - a.qualifiedLeads
      || b.leads - a.leads
      || b.clicks - a.clicks
      || a.label.localeCompare(b.label)
    ))
    .slice(0, 12);

  return {
    rows,
    notes: {
      basis: 'Landing-page score blends traffic, qualified demand, wins, non-branded search support, and estimated pipeline value.',
      scoreDefinition: 'Opportunity score is directional and should be used to rank sprint candidates, not as a financial forecast.'
    }
  };
}

function getDecayComparisonWindow(range) {
  if (!range?.from || !range?.to || Number(range.days || 0) < 14) {
    return null;
  }

  const recentEnd = new Date(`${range.to}T00:00:00.000Z`);
  const recentStart = new Date(recentEnd);
  recentStart.setUTCDate(recentStart.getUTCDate() - 6);
  const previousEnd = new Date(recentStart);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - 6);
  const rangeStart = new Date(`${range.from}T00:00:00.000Z`);

  if (previousStart < rangeStart) {
    return null;
  }

  return {
    recentStart: formatDateKey(recentStart),
    recentEnd: formatDateKey(recentEnd),
    previousStart: formatDateKey(previousStart),
    previousEnd: formatDateKey(previousEnd)
  };
}

function buildContentOpportunities(queryMetricRows = [], landingPageScorecard = { rows: [] }, range) {
  const { queryRows } = buildQueryAggregateRows(queryMetricRows);
  const rows = [];
  const decayWindow = getDecayComparisonWindow(range);

  if (decayWindow) {
    const landingPagePeriods = new Map();

    queryMetricRows.forEach((row) => {
      const current = landingPagePeriods.get(row.landingPage) || {
        landingPage: row.landingPage,
        previousClicks: 0,
        previousImpressions: 0,
        recentClicks: 0,
        recentImpressions: 0
      };

      if (row.metricDate >= decayWindow.previousStart && row.metricDate <= decayWindow.previousEnd) {
        current.previousClicks += row.clicks;
        current.previousImpressions += row.impressions;
      }

      if (row.metricDate >= decayWindow.recentStart && row.metricDate <= decayWindow.recentEnd) {
        current.recentClicks += row.clicks;
        current.recentImpressions += row.impressions;
      }

      landingPagePeriods.set(row.landingPage, current);
    });

    landingPagePeriods.forEach((item) => {
      if (item.previousClicks < 20 || item.recentClicks >= item.previousClicks * 0.75) {
        return;
      }

      const dropoffRate = roundMetric(((item.previousClicks - item.recentClicks) / item.previousClicks) * 100, 1) || 0;
      rows.push({
        key: `decay:${item.landingPage}`,
        type: 'decay_risk',
        typeLabel: 'Decay risk',
        label: item.landingPage,
        detail: `Organic clicks fell from ${item.previousClicks} to ${item.recentClicks} over the last two 7-day windows.`,
        recommendation: 'Refresh the page, review snippet changes, and verify internal-link support before rankings erode further.',
        priorityScore: roundMetric((dropoffRate / 2) + (item.previousClicks / 5), 1) || 0,
        impressions: item.recentImpressions,
        clicks: item.recentClicks,
        deltaClicks: item.recentClicks - item.previousClicks
      });
    });
  }

  queryRows
    .filter((row) => row.landingPageCount > 1 && row.impressions >= 50)
    .slice(0, 6)
    .forEach((row) => {
      rows.push({
        key: `cannibalization:${row.key}`,
        type: 'cannibalization',
        typeLabel: 'Cannibalization watch',
        label: row.label,
        detail: `${row.landingPageCount} pages share this query intent: ${row.landingPages.map((item) => item.landingPage).join(', ')}.`,
        recommendation: 'Choose a clear primary target page, align internal links, and reduce overlapping intent between pages.',
        priorityScore: roundMetric(row.opportunityScore + (row.landingPageCount * 8), 1) || 0,
        impressions: row.impressions,
        clicks: row.clicks,
        pages: row.landingPageCount
      });
    });

  queryRows
    .filter((row) => !row.isBranded && row.impressions >= 100 && row.ctr < 4 && row.position !== null && row.position <= 12)
    .slice(0, 6)
    .forEach((row) => {
      rows.push({
        key: `ctr:${row.key}`,
        type: 'ctr_lift',
        typeLabel: 'CTR lift',
        label: row.label,
        detail: `${row.primaryLandingPage} is visible enough to win more clicks without waiting for a new ranking step-change.`,
        recommendation: 'Test titles, meta descriptions, and richer snippet alignment for this query cluster.',
        priorityScore: roundMetric(row.opportunityScore + ((4 - row.ctr) * 6), 1) || 0,
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: row.ctr
      });
    });

  (landingPageScorecard.rows || [])
    .filter((row) => (row.clicks >= 50 || row.sessions >= 50) && row.qualifiedLeads === 0)
    .slice(0, 6)
    .forEach((row) => {
      rows.push({
        key: `conversion:${row.key}`,
        type: 'conversion_gap',
        typeLabel: 'Conversion gap',
        label: row.label,
        detail: `${row.clicks} clicks and ${row.sessions} sessions produced no qualified demand in the selected period.`,
        recommendation: 'Audit CTA hierarchy, form friction, offer clarity, and qualification mismatch before driving more traffic here.',
        priorityScore: roundMetric(row.opportunityScore + (row.clicks / 5), 1) || 0,
        impressions: row.impressions,
        clicks: row.clicks,
        leadRate: row.leadRate
      });
    });

  const dedupedRows = Array.from(
    new Map(rows.map((row) => [row.key, row])).values()
  )
    .sort((a, b) => (
      b.priorityScore - a.priorityScore
      || (b.impressions || 0) - (a.impressions || 0)
      || (b.clicks || 0) - (a.clicks || 0)
      || a.label.localeCompare(b.label)
    ))
    .slice(0, 10);

  return {
    rows: dedupedRows,
    notes: {
      basis: 'Stage 3 content opportunities combine query-level CTR upside, decay checks, cannibalization watch-outs, and page-level conversion gaps.',
      decayDefinition: decayWindow
        ? `Decay compares ${decayWindow.previousStart} to ${decayWindow.previousEnd} against ${decayWindow.recentStart} to ${decayWindow.recentEnd}.`
        : 'Decay needs at least 14 days in the selected range before a prior-vs-recent comparison is meaningful.'
    }
  };
}

function buildFunnelDiagnostics(currentLeads = [], range) {
  const steps = buildFunnel(currentLeads);
  const summary = {
    createdLeads: currentLeads.length,
    qualifiedLeads: currentLeads.filter(hasReachedQualified).length,
    wonLeads: currentLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length,
    lostLeads: currentLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_LOST).length,
    avgHoursToQualify: getAverage(currentLeads.map((lead) => lead.hoursToQualify)),
    avgHoursToClose: getAverage(currentLeads.map((lead) => lead.hoursToClose))
  };
  const segmentDefinitions = [
    {
      key: 'sourceClass',
      label: 'Source class',
      getValue: (lead) => lead.sourceClass,
      getLabel: (lead) => lead.sourceClassLabel
    },
    {
      key: 'service',
      label: 'Service',
      getValue: (lead) => lead.serviceKey,
      getLabel: (lead) => lead.serviceLabel
    },
    {
      key: 'pageType',
      label: 'Page type',
      getValue: (lead) => lead.pageType,
      getLabel: (lead) => lead.pageTypeLabel
    },
    {
      key: 'businessLine',
      label: 'Business line',
      getValue: (lead) => lead.businessLine,
      getLabel: (lead) => lead.businessLineLabel
    }
  ];
  const dropoffRows = [];

  segmentDefinitions.forEach((definition) => {
    const groups = new Map();

    currentLeads.forEach((lead) => {
      const groupKey = definition.getValue(lead);
      if (!groupKey) {
        return;
      }

      const current = groups.get(groupKey) || {
        key: groupKey,
        label: definition.getLabel(lead),
        created: 0,
        qualified: 0,
        won: 0
      };

      current.created += 1;
      current.qualified += hasReachedQualified(lead) ? 1 : 0;
      current.won += lead.status === LEAD_STATUSES.CLOSED_WON ? 1 : 0;
      groups.set(groupKey, current);
    });

    groups.forEach((group) => {
      if (group.created >= 3) {
        const conversionRate = getPercent(group.qualified, group.created);
        dropoffRows.push({
          key: `${definition.key}:${group.key}:created_to_qualified`,
          label: `${definition.label}: ${group.label}`,
          stageLabel: 'Created -> Qualified',
          fromCount: group.created,
          toCount: group.qualified,
          conversionRate,
          dropoffRate: roundMetric(100 - conversionRate, 1) || 0,
          recommendation: 'Review intent match, landing-page clarity, and form friction in this segment.'
        });
      }

      if (group.qualified >= 2) {
        const conversionRate = getPercent(group.won, group.qualified);
        dropoffRows.push({
          key: `${definition.key}:${group.key}:qualified_to_won`,
          label: `${definition.label}: ${group.label}`,
          stageLabel: 'Qualified -> Won',
          fromCount: group.qualified,
          toCount: group.won,
          conversionRate,
          dropoffRate: roundMetric(100 - conversionRate, 1) || 0,
          recommendation: 'Review qualification quality, follow-up discipline, and close-stage friction in this segment.'
        });
      }
    });
  });

  return {
    summary,
    steps,
    topDropoffs: dropoffRows
      .sort((a, b) => (
        b.dropoffRate - a.dropoffRate
        || b.fromCount - a.fromCount
        || a.label.localeCompare(b.label)
      ))
      .slice(0, 8),
    notes: {
      basis: `Lifecycle-based funnel v1 on leads created between ${range.from} and ${range.to}.`,
      coverage: 'CTA click, form-start, and form-completion steps are not yet persisted in the reporting mart, so this view currently starts at lead creation.'
    }
  };
}

function getChannelKey({
  metricDate,
  source,
  medium,
  campaign,
  landingPage
}) {
  return [
    metricDate,
    source,
    medium,
    campaign,
    landingPage
  ].join('||');
}

function createCombinedChannelBucket(seed) {
  const sourceClass = seed.sourceClass || getSourceClass({ source: seed.source, medium: seed.medium });
  const pageType = seed.pageType || getPageTypeForPath(seed.landingPage);

  return {
    key: seed.key,
    metricDate: seed.metricDate,
    source: seed.source,
    medium: seed.medium,
    campaign: seed.campaign,
    landingPage: seed.landingPage,
    sourceClass,
    sourceClassLabel: SOURCE_CLASS_LABELS[sourceClass] || sourceClass,
    pageType,
    pageTypeLabel: PAGE_TYPE_LABELS[pageType] || pageType,
    sessions: 0,
    users: 0,
    events: 0,
    clicks: 0,
    impressions: 0,
    spend: 0,
    leads: 0,
    qualifiedLeads: 0,
    wonLeads: 0,
    unattributedLeads: 0,
    revenueProxy: 0
  };
}

function finalizeCombinedChannelBuckets(map) {
  return Array.from(map.values()).map((bucket) => {
    const derived = buildCombinedDerivedMetrics(bucket);

    return {
      ...bucket,
      ...derived
    };
  });
}

export function buildCombinedChannelPerformance(currentLeads, externalMetricRows) {
  const map = new Map();

  externalMetricRows.map(normalizeExternalMetricRow).forEach((row) => {
    const key = getChannelKey({
      metricDate: row.metricDate,
      source: row.source,
      medium: row.medium,
      campaign: row.campaign,
      landingPage: row.landingPage,
      sourceClass: row.sourceClass,
      pageType: row.pageType
    });

    const bucket = map.get(key) || createCombinedChannelBucket({
      key,
      metricDate: row.metricDate,
      source: row.source,
      medium: row.medium,
      campaign: row.campaign,
      landingPage: row.landingPage
    });

    bucket.sessions += row.sessions;
    bucket.users += row.users;
    bucket.events += row.events;
    bucket.clicks += row.clicks;
    bucket.impressions += row.impressions;
    bucket.spend += row.spend;
    map.set(key, bucket);
  });

  currentLeads.forEach((lead) => {
    const metricDate = formatDateKey(new Date(lead.createdAt));
    const key = getChannelKey({
      metricDate,
      source: lead.source,
      medium: lead.medium,
      campaign: lead.campaign,
      landingPage: lead.landingPage,
      sourceClass: lead.sourceClass,
      pageType: lead.pageType
    });

    const bucket = map.get(key) || createCombinedChannelBucket({
      key,
      metricDate,
      source: lead.source,
      medium: lead.medium,
      campaign: lead.campaign,
      landingPage: lead.landingPage
    });

    bucket.leads += 1;
    bucket.qualifiedLeads += hasReachedQualified(lead) ? 1 : 0;
    bucket.wonLeads += lead.status === LEAD_STATUSES.CLOSED_WON ? 1 : 0;
    bucket.unattributedLeads += isUnattributedLead(lead) ? 1 : 0;
    bucket.revenueProxy += lead.calculatorEstimate || 0;
    map.set(key, bucket);
  });

  return finalizeCombinedChannelBuckets(map);
}

function aggregateCombinedRows(rows, keyGetter, labelGetter, { limit = 8 } = {}) {
  const map = new Map();

  rows.forEach((row) => {
    const key = keyGetter(row);
    if (!key) {
      return;
    }

    const current = map.get(key) || {
      key,
      label: labelGetter(row),
      sourceClass: row.sourceClass,
      sourceClassLabel: row.sourceClassLabel,
      pageType: row.pageType,
      pageTypeLabel: row.pageTypeLabel,
      sessions: 0,
      users: 0,
      events: 0,
      clicks: 0,
      impressions: 0,
      spend: 0,
      leads: 0,
      qualifiedLeads: 0,
      wonLeads: 0,
      unattributedLeads: 0,
      revenueProxy: 0
    };

    current.sessions += row.sessions;
    current.users += row.users;
    current.events += row.events;
    current.clicks += row.clicks;
    current.impressions += row.impressions;
    current.spend += row.spend;
    current.leads += row.leads;
    current.qualifiedLeads += row.qualifiedLeads;
    current.wonLeads += row.wonLeads;
    current.unattributedLeads += row.unattributedLeads;
    current.revenueProxy += row.revenueProxy;
    map.set(key, current);
  });

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      ...buildCombinedDerivedMetrics(row)
    }))
    .sort((a, b) => (
      b.qualifiedLeads - a.qualifiedLeads
      || b.wonLeads - a.wonLeads
      || b.leads - a.leads
      || b.clicks - a.clicks
    ))
    .slice(0, limit);
}

function buildAcquisition(currentLeads, externalMetricRows, whatsappClickRows = []) {
  const combinedRows = buildCombinedChannelPerformance(currentLeads, externalMetricRows);
  const totalsBase = combinedRows.reduce((accumulator, row) => ({
    sessions: accumulator.sessions + row.sessions,
    users: accumulator.users + row.users,
    events: accumulator.events + row.events,
    clicks: accumulator.clicks + row.clicks,
    impressions: accumulator.impressions + row.impressions,
    spend: accumulator.spend + row.spend,
    leads: accumulator.leads + row.leads,
    qualifiedLeads: accumulator.qualifiedLeads + row.qualifiedLeads,
    wonLeads: accumulator.wonLeads + row.wonLeads
  }), {
    sessions: 0,
    users: 0,
    events: 0,
    clicks: 0,
    impressions: 0,
    spend: 0,
    leads: 0,
    qualifiedLeads: 0,
    wonLeads: 0
  });
  const totals = {
    ...totalsBase,
    ...buildCombinedDerivedMetrics(totalsBase)
  };

  return {
    totals,
    cards: [
      buildKpiCard({
        key: 'sessions',
        label: 'Sessions',
        value: totals.sessions,
        type: 'number',
        meta: 'GA4 daily snapshots'
      }),
      buildKpiCard({
        key: 'events',
        label: 'Events',
        value: totals.events,
        type: 'number',
        meta: 'GA4 daily snapshots'
      }),
      buildKpiCard({
        key: 'clicks',
        label: 'Clicks',
        value: totals.clicks,
        type: 'number',
        meta: 'Search Console + manual paid/social snapshots'
      }),
      buildKpiCard({
        key: 'impressions',
        label: 'Impressions',
        value: totals.impressions,
        type: 'number',
        meta: 'Search Console + manual paid/social snapshots'
      }),
      buildKpiCard({
        key: 'spend',
        label: 'Spend',
        value: totals.spend,
        type: 'currency',
        meta: 'Manual paid/social imports'
      }),
      buildKpiCard({
        key: 'cost_per_lead',
        label: 'Cost per lead',
        value: totals.costPerLead,
        type: 'currency',
        meta: 'Spend / created leads',
        warning: totals.warnings.costPerLead || null
      }),
      buildKpiCard({
        key: 'cost_per_acquisition',
        label: 'Cost per acquisition',
        value: totals.costPerAcquisition,
        type: 'currency',
        meta: 'Spend / won leads from created cohort',
        warning: totals.warnings.costPerAcquisition || null
      })
    ],
    sources: aggregateCombinedRows(
      combinedRows,
      (row) => row.source,
      (row) => row.source,
      { limit: 8 }
    ),
    campaigns: aggregateCombinedRows(
      combinedRows,
      (row) => `${row.source}||${row.medium}||${row.campaign}`,
      (row) => `${row.source} / ${row.medium} / ${row.campaign}`,
      { limit: 10 }
    ),
    whatsapp: buildWhatsAppAcquisition(currentLeads, whatsappClickRows),
    notes: {
      leadBasis: 'Leads créés sur la période',
      externalMetricBasis: 'Sessions, events, clics, impressions et spend issus des snapshots externes journaliers'
    }
  };
}

function buildSeoContent(currentLeads, externalMetricRows, keywordCatalogRows, keywordRankingRows, filters = {}) {
  const combinedRows = buildCombinedChannelPerformance(currentLeads, externalMetricRows);
  const pageRows = aggregateCombinedRows(
    combinedRows,
    (row) => row.landingPage,
    (row) => row.landingPage,
    { limit: 12 }
  );
  const keywordRankings = buildKeywordRankings(keywordCatalogRows, keywordRankingRows, {
    deviceFilter: filters.device || null
  });

  const organicRows = combinedRows.filter((row) => (
    row.source.toLowerCase() === 'google'
    || row.medium.toLowerCase() === 'organic'
  ));

  const organicTotals = organicRows.reduce((accumulator, row) => ({
    clicks: accumulator.clicks + row.clicks,
    impressions: accumulator.impressions + row.impressions,
    sessions: accumulator.sessions + row.sessions,
    events: accumulator.events + row.events,
    leads: accumulator.leads + row.leads,
    qualifiedLeads: accumulator.qualifiedLeads + row.qualifiedLeads
  }), {
    clicks: 0,
    impressions: 0,
    sessions: 0,
    events: 0,
    leads: 0,
    qualifiedLeads: 0
  });
  const organicDerived = buildCombinedDerivedMetrics({
    sessions: organicTotals.sessions,
    clicks: organicTotals.clicks,
    impressions: organicTotals.impressions,
    leads: organicTotals.leads,
    wonLeads: 0,
    spend: 0
  });
  const keywordSnapshotDiagnostics = keywordRankings.snapshotDiagnostics;
  const hasLiveKeywordSnapshots = keywordSnapshotDiagnostics.matchedSnapshotCount > 0;
  const hasRawKeywordSnapshots = keywordSnapshotDiagnostics.rawSnapshotCount > 0;
  const usingReferenceKeywordFallback = keywordRankings.usingReferenceFallback;
  const latestReferenceMetricDate = keywordSnapshotDiagnostics.latestReferenceMetricDate;
  const referenceFallbackSuffix = latestReferenceMetricDate
    ? ` (référence importée du ${latestReferenceMetricDate})`
    : ' (référence importée du catalogue actif)';

  const keywordDefinition = hasLiveKeywordSnapshots
    ? `Snapshots SERP live catalogués jusqu'au ${keywordRankings.latestMetricDate}.`
    : usingReferenceKeywordFallback
      ? hasRawKeywordSnapshots
        ? `Des snapshots SERP existent sur la période (${keywordSnapshotDiagnostics.rawSnapshotCount} lignes brutes), mais aucun ne correspond encore au catalogue actif. Le dashboard bascule temporairement sur le catalogue Supabase actif${referenceFallbackSuffix}.`
        : `Aucun snapshot SERP live catalogué sur la période. Le dashboard bascule temporairement sur le catalogue Supabase actif${referenceFallbackSuffix}.`
      : hasRawKeywordSnapshots
        ? `Des snapshots SERP existent sur la période (${keywordSnapshotDiagnostics.rawSnapshotCount} lignes brutes), mais aucun ne correspond encore au catalogue actif.`
        : 'Aucun snapshot SERP live catalogué sur la période.';
  const keywordTrendDefinition = hasLiveKeywordSnapshots
    ? `${keywordDefinition} Les KPI keywords utilisent la meilleure position courante entre desktop et mobile.`
    : usingReferenceKeywordFallback
      ? hasRawKeywordSnapshots
        ? `${keywordDefinition} Cela arrive après un remap ou une réimportation du catalogue tant que de nouveaux snapshots live ne sont pas resynchronisés sur le catalogue courant.`
        : `${keywordDefinition} Les panneaux de tendance utilisent la référence importée jusqu'à la première synchronisation SERP correspondante.`
      : hasRawKeywordSnapshots
        ? `${keywordDefinition} Cela arrive après un remap ou une réimportation du catalogue tant que de nouveaux snapshots ne sont pas resynchronisés.`
        : `${keywordDefinition} Les panneaux de tendance resteront vides jusqu'à la première synchronisation SERP.`;
  const keywordRowDefinition = hasLiveKeywordSnapshots
    ? 'Chaque ligne regroupe desktop et mobile à partir du catalogue Supabase actif. Les badges affichent le live puis la référence importée quand elle existe.'
    : usingReferenceKeywordFallback
      ? 'Chaque ligne reste basée sur le catalogue Supabase actif. Quand aucun snapshot live correspondant n’est disponible, desktop et mobile reprennent la référence importée jusqu’à la prochaine resynchronisation device.'
      : hasRawKeywordSnapshots
        ? 'Chaque ligne reste basée sur le catalogue Supabase actif. Les positions live sont absentes tant que les snapshots SERP ne correspondent pas encore au catalogue courant; la référence importée reste affichée quand elle existe.'
        : 'Chaque ligne reste basée sur le catalogue Supabase actif. Les positions de référence importées restent visibles quand elles existent.';

  return {
    totals: {
      landingPagesTracked: pageRows.length,
      clicks: organicTotals.clicks,
      impressions: organicTotals.impressions,
      sessions: organicTotals.sessions,
      events: organicTotals.events,
      ctr: organicDerived.ctr,
      leadRateBase: organicDerived.leadRateBase,
      leadRate: organicDerived.leadRate,
      qualifiedLeads: organicTotals.qualifiedLeads
    },
    cards: [
      buildKpiCard({
        key: 'landing_pages_tracked',
        label: 'Landing pages tracked',
        value: pageRows.length,
        type: 'number',
        meta: 'Pages with SEO or landing-page performance rows in selected period'
      }),
      buildKpiCard({
        key: 'organic_clicks',
        label: 'Organic clicks',
        value: organicTotals.clicks,
        type: 'number',
        meta: 'Rows where source is Google or medium is organic'
      }),
      buildKpiCard({
        key: 'organic_impressions',
        label: 'Organic impressions',
        value: organicTotals.impressions,
        type: 'number',
        meta: 'Rows where source is Google or medium is organic'
      }),
      buildKpiCard({
        key: 'organic_ctr',
        label: 'Organic CTR',
        value: organicDerived.ctr,
        type: 'percent',
        meta: 'Organic clicks / organic impressions'
      }),
      buildKpiCard({
        key: 'lead_rate',
        label: 'Lead rate',
        value: organicDerived.leadRate,
        type: 'percent',
        meta: organicTotals.sessions > 0 ? 'Leads / sessions' : 'Leads / clicks',
        warning: organicDerived.warnings.leadRate || null
      }),
      buildKpiCard({
        key: 'qualified_leads',
        label: 'Qualified leads',
        value: organicTotals.qualifiedLeads,
        type: 'number',
        meta: 'Organic cohort leads that reached qualified or beyond'
      })
    ],
    landingPages: pageRows,
    keywordRankings,
    keywordCards: [
      buildKpiCard({
        key: 'tracked_keywords',
        label: 'Tracked keywords',
        value: keywordRankings.totals.trackedKeywords,
        type: 'number',
        meta: keywordDefinition
      }),
      buildKpiCard({
        key: 'desktop_ranked_keywords',
        label: 'Desktop ranked keywords',
        value: keywordRankings.totals.desktopRankedKeywords,
        type: 'number'
      }),
      buildKpiCard({
        key: 'mobile_ranked_keywords',
        label: 'Mobile ranked keywords',
        value: keywordRankings.totals.mobileRankedKeywords,
        type: 'number'
      }),
      buildKpiCard({
        key: 'average_position',
        label: 'Average best position',
        value: keywordRankings.totals.averagePosition,
        type: 'position'
      }),
      buildKpiCard({
        key: 'top10_count',
        label: 'Top 10 keywords',
        value: keywordRankings.totals.top10Count,
        type: 'number'
      })
    ],
    notes: {
      leadRateDefinition: 'Leads / sessions lorsque disponibles, sinon leads / clicks',
      organicDefinition: 'Source google ou medium organic',
      keywordDefinition,
      keywordTrendDefinition,
      keywordRowDefinition
    }
  };
}

function buildLeadQualityBreakdown(leads = []) {
  const total = leads.length;
  const counts = new Map();

  leads.forEach((lead) => {
    const key = normalizeLeadQualityOutcome(lead.leadQualityOutcome, LEAD_QUALITY_OUTCOMES.UNREVIEWED);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Object.values(LEAD_QUALITY_OUTCOMES)
    .map((key) => {
      const count = counts.get(key) || 0;
      return {
        key,
        label: LEAD_QUALITY_OUTCOME_LABELS[key] || key,
        count,
        rate: getPercent(count, total)
      };
    })
    .filter((item) => item.count > 0 || total === 0 || item.key === LEAD_QUALITY_OUTCOMES.UNREVIEWED);
}

function buildOperations(universeLeads, auditEvents, range, nowIso) {
  const staleCutoff = new Date(new Date(nowIso).getTime() - (STALE_OPEN_LEAD_HOURS * 60 * 60 * 1000));
  const openLeads = universeLeads.filter(isOpenLead);
  const staleLeads = universeLeads
    .filter(isOpenLead)
    .filter((lead) => new Date(getMostRecentOpenTimestamp(lead)) < staleCutoff)
    .sort((a, b) => (b.ageHours || 0) - (a.ageHours || 0));
  const slaBreaches = openLeads
    .filter((lead) => isLeadSlaBreached(lead, nowIso))
    .sort((a, b) => new Date(a.followUpSlaAt || 0) - new Date(b.followUpSlaAt || 0));
  const qualityBreakdown = buildLeadQualityBreakdown(openLeads);
  const reviewedCount = openLeads.filter((lead) => lead.leadQualityOutcome !== LEAD_QUALITY_OUTCOMES.UNREVIEWED).length;
  const ownerAssignedCount = openLeads.filter((lead) => lead.leadOwner).length;

  const latestSubmitted = [...universeLeads]
    .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))
    .slice(0, 8);

  return {
    staleLeadHours: STALE_OPEN_LEAD_HOURS,
    openLeadCount: openLeads.length,
    staleQueue: {
      count: staleLeads.length,
      leads: staleLeads.slice(0, 8).map(summarizeLead)
    },
    slaBreaches: {
      count: slaBreaches.length,
      leads: slaBreaches.slice(0, 8).map(summarizeLead)
    },
    leadQuality: {
      reviewedCount,
      ownerAssignedCount,
      breakdown: qualityBreakdown,
      note: 'Répartition calculée sur les leads encore ouverts dans la file opérationnelle.'
    },
    latestSubmitted: latestSubmitted.map(summarizeLead),
    lifecycleTrend: buildLifecycleTrend(universeLeads, range),
    recentActivityLabel: 'Activité lifecycle récente (globale)',
    auditEvents: auditEvents.map((event) => ({
      id: event.id,
      createdAt: event.created_at,
      leadKind: event.lead_kind,
      leadId: event.lead_id,
      previousStatus: event.previous_status,
      nextStatus: event.next_status,
      previousOperationalStatus: event.previous_operational_status,
      nextOperationalStatus: event.next_operational_status,
      actionResult: event.action_result,
      rejectionReason: event.rejection_reason
    }))
  };
}

function getFreshnessStatus({
  explicitStatus,
  lastSuccessAt,
  freshestMetricDate,
  staleAfterHours,
  nowIso
}) {
  if (explicitStatus === 'error' || explicitStatus === 'missing') {
    return explicitStatus;
  }

  const freshnessAnchor = lastSuccessAt || (freshestMetricDate ? `${freshestMetricDate}T06:00:00.000Z` : null);
  if (!freshnessAnchor) {
    return 'missing';
  }

  const ageHours = getHoursBetween(freshnessAnchor, nowIso);
  if (ageHours === null) {
    return explicitStatus || 'missing';
  }

  if (ageHours > staleAfterHours) {
    return 'stale';
  }

  return explicitStatus || 'fresh';
}

function buildDataHealth(sourceHealthRows, externalMetricRows, keywordCatalogRows, keywordRankingRows, nowIso) {
  const rowByKey = new Map(
    (sourceHealthRows || []).map((row) => [row.source_key, row])
  );

  const items = DATA_HEALTH_EXPECTATIONS.map((expectation) => {
    if (expectation.key === 'supabase_live') {
      return {
        key: expectation.key,
        label: expectation.label,
        connectorType: expectation.connectorType,
        status: 'fresh',
        asOf: nowIso,
        freshestMetricDate: formatDateKey(new Date(nowIso)),
        message: 'Données leads et opérations lues en direct depuis Supabase.',
        recordCount: null
      };
    }

    const healthRow = rowByKey.get(expectation.key);
    const matchingRows = expectation.keywordRankings
      ? (keywordRankingRows || [])
      : (externalMetricRows || []).filter((row) => expectation.metricSources.includes(row.metric_source));
    const fallbackMessage = expectation.keywordRankings && (keywordCatalogRows || []).length > 0
      ? `${keywordCatalogRows.length} keywords actifs dans le catalogue, aucun snapshot sur la période`
      : 'Aucune synchronisation disponible';
    const freshestMetricDate = healthRow?.freshest_metric_date
      || matchingRows.map((row) => row.metric_date).sort().at(-1)
      || null;
    const status = getFreshnessStatus({
      explicitStatus: healthRow?.status,
      lastSuccessAt: healthRow?.last_success_at,
      freshestMetricDate,
      staleAfterHours: expectation.staleAfterHours,
      nowIso
    });

    return {
      key: expectation.key,
      label: expectation.label,
      connectorType: healthRow?.connector_type || expectation.connectorType,
      status,
      asOf: healthRow?.last_success_at || healthRow?.last_attempt_at || null,
      freshestMetricDate,
      message: healthRow?.message || (matchingRows.length > 0
        ? `${matchingRows.length} lignes disponibles sur la période`
        : fallbackMessage),
      lastError: healthRow?.last_error || null,
      recordCount: matchingRows.length,
      metadata: healthRow?.metadata || {}
    };
  });

  const statusPriority = {
    error: 3,
    stale: 2,
    missing: 1,
    fresh: 0
  };

  const overallStatus = items
    .map((item) => item.status)
    .sort((a, b) => statusPriority[b] - statusPriority[a])[0] || 'fresh';

  return {
    generatedAt: nowIso,
    overallStatus,
    items
  };
}

function buildPipeline(currentLeads, range) {
  return {
    notes: {
      funnelBasis: 'Cohorte des leads créés sur la période sélectionnée',
      serviceBreakdownMode: 'Les services affichés sont des mentions multi-services, pas uniquement le service principal',
      primaryServiceMode: 'Le service principal correspond au premier service commercial associé au lead'
    },
    summary: {
      totalLeads: currentLeads.length,
      qualifiedLeads: currentLeads.filter(hasReachedQualified).length,
      closedWon: currentLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length,
      closedLost: currentLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_LOST).length,
      avgHoursToQualify: getAverage(currentLeads.map((lead) => lead.hoursToQualify)),
      avgHoursToClose: getAverage(currentLeads.map((lead) => lead.hoursToClose))
    },
    funnel: buildFunnel(currentLeads),
    createdTrend: buildCreatedTrend(currentLeads, range),
    breakdowns: buildBreakdowns(currentLeads)
  };
}

function formatSummaryCount(value) {
  return Number(value || 0).toLocaleString('fr-FR');
}

function formatSummaryPercent(value) {
  return `${Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}%`;
}

function formatSummaryCurrency(value) {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getLeadRateSnapshot(leads = []) {
  const qualifiedRate = getPercent(
    leads.filter(hasReachedQualified).length,
    leads.length
  );
  const winRate = getPercent(
    leads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length,
    leads.length
  );

  return {
    qualifiedRate,
    winRate
  };
}

function isLowSampleLeadCohort(leads = []) {
  return leads.length > 0 && leads.length < DASHBOARD_ALERT_THRESHOLDS.thinVolume.costPerLeadMinLeads;
}

function buildExecutiveTrend(currentLeads = [], previousLeads = []) {
  const currentRates = getLeadRateSnapshot(currentLeads);
  const previousRates = getLeadRateSnapshot(previousLeads);
  const leadDelta = currentLeads.length - previousLeads.length;
  const qualifiedRateDelta = getPercentDelta(currentRates.qualifiedRate, previousRates.qualifiedRate);
  const winRateDelta = getPercentDelta(currentRates.winRate, previousRates.winRate);

  let headline = 'Lead volume is flat versus the previous period.';
  let tone = 'neutral';

  if (currentLeads.length === 0 && previousLeads.length === 0) {
    headline = 'No new leads in this segment yet.';
  } else if (previousLeads.length === 0 && currentLeads.length > 0) {
    headline = `New demand appeared with ${formatSummaryCount(currentLeads.length)} lead${currentLeads.length > 1 ? 's' : ''}.`;
    tone = 'positive';
  } else if (leadDelta > 0) {
    headline = `New lead volume is up by ${formatSummaryCount(leadDelta)}.`;
    tone = 'positive';
  } else if (leadDelta < 0) {
    headline = `New lead volume is down by ${formatSummaryCount(Math.abs(leadDelta))}.`;
    tone = 'warning';
  } else if (qualifiedRateDelta > 0) {
    headline = 'Lead volume is flat, but qualification quality improved.';
    tone = 'positive';
  } else if (qualifiedRateDelta < 0) {
    headline = 'Lead volume is flat, but qualification quality weakened.';
    tone = 'warning';
  }

  return {
    key: 'trend',
    title: 'Trend',
    headline,
    detail: `${formatSummaryCount(currentLeads.length)} new leads, ${formatSummaryPercent(currentRates.qualifiedRate)} qualified, ${formatSummaryPercent(currentRates.winRate)} won.${qualifiedRateDelta !== null ? ` Qualification rate delta: ${qualifiedRateDelta > 0 ? '+' : ''}${qualifiedRateDelta.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} pts.` : ''}${winRateDelta !== null ? ` Win rate delta: ${winRateDelta > 0 ? '+' : ''}${winRateDelta.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} pts.` : ''}`,
    tone
  };
}

function buildExecutiveRisk({
  currentLeads = [],
  overviewCards = [],
  operations,
  dataHealth
}) {
  const unattributedCard = overviewCards.find((card) => card.key === 'unattributed_rate');
  if (unattributedCard?.warning) {
    if (isLowSampleLeadCohort(currentLeads)) {
      return {
        key: 'attribution_low_sample',
        title: 'Risk',
        headline: 'Attribution signal is still directional in this slice.',
        detail: `${formatSummaryCount(currentLeads.length)} lead${currentLeads.length > 1 ? 's are' : ' is'} in this filtered cohort. ${formatSummaryPercent(unattributedCard.value)} appear unattributed or direct-only, but that is below the ${DASHBOARD_ALERT_THRESHOLDS.thinVolume.costPerLeadMinLeads}-lead reliability threshold for channel interpretation.`,
        tone: 'neutral',
        owner: 'Growth owner'
      };
    }

    return {
      key: 'unattributed_rate',
      title: 'Risk',
      headline: 'Attribution quality is under pressure.',
      detail: `${formatSummaryPercent(unattributedCard.value)} of filtered leads are unattributed or direct-only, above the monitoring threshold.`,
      tone: unattributedCard.warning.level === 'critical' ? 'critical' : 'warning',
      owner: 'Engineering'
    };
  }

  if ((operations?.slaBreaches?.count || 0) > 0) {
    return {
      key: 'sla_breach',
      title: 'Risk',
      headline: 'Follow-up SLA breaches are accumulating.',
      detail: `${formatSummaryCount(operations.slaBreaches.count)} open lead${operations.slaBreaches.count > 1 ? 's are' : ' is'} beyond follow-up SLA in this segment.`,
      tone: 'warning',
      owner: 'Admin ops'
    };
  }

  if ((operations?.staleQueue?.count || 0) > 0) {
    return {
      key: 'stale_queue',
      title: 'Risk',
      headline: 'The open queue needs a refresh.',
      detail: `${formatSummaryCount(operations.staleQueue.count)} lead${operations.staleQueue.count > 1 ? 's are' : ' is'} older than ${operations.staleLeadHours}h without a recent touch.`,
      tone: operations.staleQueue.count >= DASHBOARD_ALERT_THRESHOLDS.staleQueueBreachCount ? 'critical' : 'warning',
      owner: 'Admin ops'
    };
  }

  const staleConnector = (dataHealth?.items || []).find((item) => item.status === 'error' || item.status === 'stale');
  if (staleConnector) {
    return {
      key: 'connector_freshness',
      title: 'Risk',
      headline: `${staleConnector.label} needs attention before the next review.`,
      detail: staleConnector.message || `${staleConnector.label} is stale and should be refreshed before using this slice for planning.`,
      tone: staleConnector.status === 'error' ? 'critical' : 'warning',
      owner: 'Engineering'
    };
  }

  if (currentLeads.length === 0) {
    return {
      key: 'no_demand',
      title: 'Risk',
      headline: 'There is no new lead demand in this slice.',
      detail: 'The selected segment produced no new leads in the current period, so downstream conversion and ROI signals are limited.',
      tone: 'warning',
      owner: 'Growth owner'
    };
  }

  return {
    key: 'no_acute_risk',
    title: 'Risk',
    headline: 'No acute operational risk is currently flagged.',
    detail: 'Attribution, follow-up discipline, and connector freshness are all within the expected monitoring range for this slice.',
    tone: 'neutral',
    owner: 'Growth owner'
  };
}

function buildExecutiveOpportunity({
  acquisition,
  seoContent,
  pipeline,
  landingPageScorecard,
  currentLeads = []
}) {
  const formatOpportunityTrafficDetail = (row = {}, { organicLabel = false } = {}) => {
    const parts = [];

    parts.push(`${formatSummaryCount(row.clicks)} ${organicLabel ? 'GSC organic clicks' : 'GSC clicks'}`);

    if ((row.sessions || 0) > 0 || (row.users || 0) > 0) {
      parts.push(`${formatSummaryCount(row.sessions)} GA4 sessions`);
    }

    if ((row.users || 0) > 0) {
      parts.push(`${formatSummaryCount(row.users)} GA4 users`);
    }

    return parts.join(', ');
  };

  const topScorecardPage = (landingPageScorecard?.rows || []).find((row) => (
    row.qualifiedLeads > 0 || row.leads > 0 || row.clicks > 0 || row.sessions > 0
  ));
  if (topScorecardPage) {
    return {
      key: 'seo_landing_page',
      title: 'Opportunity',
      headline: `${topScorecardPage.label} is the highest-leverage landing-page candidate right now.`,
      detail: `${formatOpportunityTrafficDetail(topScorecardPage)}, ${formatSummaryCount(topScorecardPage.qualifiedLeads)} qualified leads, ${formatSummaryPercent(topScorecardPage.leadRate)} lead rate, ${formatSummaryCurrency(topScorecardPage.revenueProxy)} estimated pipeline value.`,
      tone: topScorecardPage.qualifiedLeads > 0 ? 'positive' : 'neutral',
      owner: 'Growth owner'
    };
  }

  const bestSeoPage = (seoContent?.landingPages || []).find((row) => (
    row.qualifiedLeads > 0 || row.leads > 0 || row.clicks > 0 || row.sessions > 0
  ));
  if (bestSeoPage) {
    return {
      key: 'seo_landing_page',
      title: 'Opportunity',
      headline: `${bestSeoPage.label} is the clearest SEO/CRO opportunity.`,
      detail: `${formatOpportunityTrafficDetail(bestSeoPage, { organicLabel: true })}, ${formatSummaryCount(bestSeoPage.qualifiedLeads)} qualified leads, ${formatSummaryPercent(bestSeoPage.leadRate)} lead rate, ${formatSummaryCurrency(bestSeoPage.revenueProxy)} estimated pipeline value.`,
      tone: bestSeoPage.qualifiedLeads > 0 ? 'positive' : 'neutral',
      owner: 'Growth owner'
    };
  }

  const topSource = (acquisition?.sources || [])[0];
  if (topSource) {
    return {
      key: 'acquisition_source',
      title: 'Opportunity',
      headline: `${topSource.label} is leading this segment.`,
      detail: `${formatSummaryCount(topSource.leads)} leads, ${formatSummaryCount(topSource.qualifiedLeads)} qualified, ${formatSummaryCount(topSource.wonLeads)} won, ${formatSummaryCurrency(topSource.revenueProxy)} estimated pipeline value.`,
      tone: topSource.qualifiedLeads > 0 || topSource.wonLeads > 0 ? 'positive' : 'neutral',
      owner: 'Growth owner'
    };
  }

  const topService = (pipeline?.breakdowns?.primaryService || [])[0];
  if (topService) {
    return {
      key: 'service_slice',
      title: 'Opportunity',
      headline: `${topService.label} is the strongest current service slice.`,
      detail: `${formatSummaryCount(topService.count)} lead${topService.count > 1 ? 's' : ''} in the selected cohort.`,
      tone: 'neutral',
      owner: 'Growth owner'
    };
  }

  return {
    key: 'no_clear_opportunity',
    title: 'Opportunity',
    headline: currentLeads.length > 0
      ? 'No single source or page clearly dominates yet.'
      : 'No clear opportunity until more demand appears in this slice.',
    detail: 'Use the segmented dashboard to keep monitoring source quality, page performance, and qualified demand density before committing effort.',
    tone: 'neutral',
    owner: 'Growth owner'
  };
}

function buildExecutiveNextAction({ risk, opportunity, filters = {} }) {
  if (risk.key === 'attribution_low_sample') {
    return {
      key: 'next_action',
      title: 'Next action',
      headline: 'Validate this low-volume slice before making efficiency decisions.',
      detail: `Inspect the unattributed row manually or widen the date range until the segment reaches at least ${DASHBOARD_ALERT_THRESHOLDS.thinVolume.costPerLeadMinLeads} leads.`,
      tone: 'neutral',
      owner: 'Growth owner'
    };
  }

  if (risk.key === 'unattributed_rate') {
    return {
      key: 'next_action',
      title: 'Next action',
      headline: 'Fix attribution hygiene before scaling this slice.',
      detail: 'Audit direct/(none) entries, landing-page capture, and campaign naming so channel efficiency can be trusted in the next growth review.',
      tone: risk.tone,
      owner: risk.owner
    };
  }

  if (risk.key === 'sla_breach' || risk.key === 'stale_queue') {
    return {
      key: 'next_action',
      title: 'Next action',
      headline: 'Clear the open queue before adding more acquisition pressure.',
      detail: 'Assign owners, refresh `last_worked_at`, and reset overdue SLAs so the segment can move back into an experiment-ready state.',
      tone: 'warning',
      owner: 'Admin ops'
    };
  }

  if (risk.key === 'connector_freshness') {
    return {
      key: 'next_action',
      title: 'Next action',
      headline: 'Restore reporting freshness before the next executive readout.',
      detail: 'Refresh the stale connector and confirm that the segment still holds once live data is back in sync.',
      tone: risk.tone,
      owner: 'Engineering'
    };
  }

  if (opportunity.key === 'seo_landing_page') {
    return {
      key: 'next_action',
      title: 'Next action',
      headline: 'Prioritize the leading landing page in the next sprint.',
      detail: 'Review snippet CTR, on-page CTA hierarchy, and lead capture friction so the current search demand turns into more qualified pipeline.',
      tone: 'positive',
      owner: 'Growth owner'
    };
  }

  if (opportunity.key === 'acquisition_source') {
    return {
      key: 'next_action',
      title: 'Next action',
      headline: 'Use the leading source as the default weekly review slice.',
      detail: 'Anchor channel review, experiment ideas, and spend discussions on the source already producing the densest qualified demand.',
      tone: 'positive',
      owner: 'Growth owner'
    };
  }

  if (filters.device) {
    return {
      key: 'next_action',
      title: 'Next action',
      headline: 'Use this device view to validate SEO visibility before acting.',
      detail: 'Device segmentation currently applies to keyword visibility only, so confirm desktop/mobile movement here before changing broader lead or acquisition plans.',
      tone: 'neutral',
      owner: 'Growth owner'
    };
  }

  return {
    key: 'next_action',
    title: 'Next action',
    headline: 'Use the segmented slice as the default review frame next week.',
    detail: 'Keep decisions anchored to this filtered view so trend, risk, opportunity, and follow-up ownership stay consistent across growth reviews.',
    tone: 'neutral',
    owner: 'Growth owner'
  };
}

function buildExecutiveAttributionDrilldown(currentLeads = [], risk = null) {
  if (!risk || !['unattributed_rate', 'attribution_low_sample'].includes(risk.key)) {
    return null;
  }

  const unattributedLeads = [...currentLeads]
    .filter(isUnattributedLead)
    .sort((a, b) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()))
    .slice(0, 6)
    .map((lead) => ({
      ...summarizeLead(lead),
      title: `${lead.kindLabel} #${lead.id} - ${lead.serviceLabel}`,
      metaLinePrimary: `${lead.source} / ${lead.medium} • ${lead.campaign}`,
      metaLineSecondary: lead.landingPage,
      metaLineTertiary: [
        lead.referrerHost && lead.referrerHost !== 'Non renseigné' ? `Referrer: ${lead.referrerHost}` : null,
        lead.sourceClassLabel ? `Class: ${lead.sourceClassLabel}` : null,
        lead.pageTypeLabel ? `Page: ${lead.pageTypeLabel}` : null
      ].filter(Boolean).join(' • '),
      metaDateTime: lead.createdAt
    }));

  if (unattributedLeads.length === 0) {
    return null;
  }

  const totalCount = currentLeads.filter(isUnattributedLead).length;
  const hiddenCount = Math.max(0, totalCount - unattributedLeads.length);

  return {
    key: 'attribution_drilldown',
    title: 'Attribution review leads',
    note: risk.key === 'attribution_low_sample'
      ? `Low-volume slice: review the specific lead${totalCount > 1 ? 's' : ''} below before treating attribution as a scaling issue.`
      : `Direct / unattributed leads currently driving the executive warning in this filtered cohort.`,
    totalCount,
    hiddenCount,
    leads: unattributedLeads
  };
}

function buildExecutiveOrganicEvidence({
  currentLeads = [],
  seoContent,
  seoQueries,
  externalMetricRows = [],
  queryMetricRows = []
} = {}) {
  const organicExternalRows = externalMetricRows
    .map(normalizeExternalMetricRow)
    .filter((row) => row.sourceClass === 'organic_search');
  const organicExternalByPage = new Map();

  organicExternalRows.forEach((row) => {
      const current = organicExternalByPage.get(row.landingPage) || {
        landingPage: row.landingPage,
        clicks: 0,
        impressions: 0,
        sessions: 0,
        users: 0,
        events: 0
      };

      current.clicks += row.clicks;
      current.impressions += row.impressions;
      current.sessions += row.sessions;
      current.users += row.users;
      current.events += row.events;
      organicExternalByPage.set(row.landingPage, current);
    });

  const queryByPage = new Map();
  queryMetricRows.forEach((row) => {
    const current = queryByPage.get(row.landingPage) || {
      landingPage: row.landingPage,
      queryClicks: 0,
      queryImpressions: 0,
      queryKeys: new Set()
    };

    current.queryClicks += row.clicks;
    current.queryImpressions += row.impressions;
    current.queryKeys.add(row.normalizedQuery);
    queryByPage.set(row.landingPage, current);
  });

  const pageEvidenceMap = new Map();
  organicExternalByPage.forEach((row, landingPage) => {
    pageEvidenceMap.set(landingPage, {
      landingPage,
      clicks: row.clicks,
      impressions: row.impressions,
      sessions: row.sessions,
      users: row.users,
      events: row.events,
      queryClicks: 0,
      queryImpressions: 0,
      queryCount: 0,
      leads: 0,
      qualifiedLeads: 0
    });
  });
  queryByPage.forEach((row, landingPage) => {
    const current = pageEvidenceMap.get(landingPage) || {
      landingPage,
      clicks: 0,
      impressions: 0,
      sessions: 0,
      users: 0,
      events: 0,
      queryClicks: 0,
      queryImpressions: 0,
      queryCount: 0,
      leads: 0,
      qualifiedLeads: 0
    };

    current.queryClicks = row.queryClicks;
    current.queryImpressions = row.queryImpressions;
    current.queryCount = row.queryKeys.size;
    pageEvidenceMap.set(landingPage, current);
  });
  currentLeads.forEach((lead) => {
    const current = pageEvidenceMap.get(lead.landingPage) || {
      landingPage: lead.landingPage,
      clicks: 0,
      impressions: 0,
      sessions: 0,
      users: 0,
      events: 0,
      queryClicks: 0,
      queryImpressions: 0,
      queryCount: 0,
      leads: 0,
      qualifiedLeads: 0
    };

    current.leads += 1;
    current.qualifiedLeads += hasReachedQualified(lead) ? 1 : 0;
    pageEvidenceMap.set(lead.landingPage, current);
  });

  const topLandingPages = Array.from(pageEvidenceMap.values())
    .filter((row) => (
      row.clicks > 0
      || row.impressions > 0
      || row.sessions > 0
      || row.events > 0
      || row.queryClicks > 0
      || row.leads > 0
    ))
    .sort((a, b) => (
      b.clicks - a.clicks
      || b.impressions - a.impressions
      || b.queryClicks - a.queryClicks
      || b.sessions - a.sessions
      || b.users - a.users
      || b.events - a.events
      || b.qualifiedLeads - a.qualifiedLeads
      || b.leads - a.leads
      || a.landingPage.localeCompare(b.landingPage)
    ))
    .slice(0, 5);

  const leadPages = Array.from(
    new Set(
      currentLeads
        .map((lead) => lead.landingPage)
        .filter(Boolean)
    )
  );
  const pageCoverageRows = leadPages.map((landingPage) => {
    const pageMetrics = organicExternalByPage.get(landingPage);
    const queryMetrics = queryByPage.get(landingPage);
    const pageLeads = currentLeads.filter((lead) => lead.landingPage === landingPage);
    const hasPageMetrics = Boolean(
      (pageMetrics?.clicks || 0) > 0
      || (pageMetrics?.impressions || 0) > 0
      || (pageMetrics?.sessions || 0) > 0
      || (pageMetrics?.events || 0) > 0
    );
    const hasQueryMetrics = Boolean(
      (queryMetrics?.queryClicks || 0) > 0
      || (queryMetrics?.queryImpressions || 0) > 0
      || (queryMetrics?.queryKeys?.size || 0) > 0
    );
    const status = hasPageMetrics
      ? 'page_metrics'
      : hasQueryMetrics
        ? 'query_only'
        : 'no_metrics';

    return {
      landingPage,
      status,
      leads: pageLeads.length,
      qualifiedLeads: pageLeads.filter(hasReachedQualified).length,
      clicks: pageMetrics?.clicks || 0,
      impressions: pageMetrics?.impressions || 0,
      sessions: pageMetrics?.sessions || 0,
      users: pageMetrics?.users || 0,
      events: pageMetrics?.events || 0,
      queryClicks: queryMetrics?.queryClicks || 0,
      queryImpressions: queryMetrics?.queryImpressions || 0,
      queryCount: queryMetrics?.queryKeys?.size || 0
    };
  });
  const queryOnlyPages = pageCoverageRows.filter((row) => row.status === 'query_only');
  const noMetricPages = pageCoverageRows.filter((row) => row.status === 'no_metrics');

  let joinStatus = 'clear';
  let joinNote = 'Landing-page organic evidence is aligned for the current lead pages in this slice.';

  if (pageCoverageRows.length === 0) {
    joinStatus = 'neutral';
    joinNote = 'No current lead landing pages are available to validate in this slice yet.';
  } else if (queryOnlyPages.length > 0) {
    joinStatus = 'warning';
    joinNote = 'Some lead pages have Search Console query evidence but no page-level organic metrics. That suggests a landing-page alignment or page-level import gap for those pages.';
  } else if (noMetricPages.length > 0) {
    joinStatus = 'partial';
    joinNote = 'Some lead pages have no organic page or query evidence in the selected period. This can be true zero demand or a missing page-level import, so inspect the pages below.';
  }

  return {
    summary: {
      organicClicks: seoContent?.totals?.clicks || 0,
      organicImpressions: seoContent?.totals?.impressions || 0,
      organicSessions: seoContent?.totals?.sessions || 0,
      organicUsers: organicExternalRows.reduce((total, row) => total + row.users, 0),
      organicEvents: organicExternalRows.reduce((total, row) => total + row.events, 0),
      qualifiedLeads: seoContent?.totals?.qualifiedLeads || 0,
      organicLandingPages: organicExternalByPage.size,
      queryClicks: seoQueries?.summary?.totalClicks || 0,
      nonBrandedClicks: seoQueries?.summary?.nonBrandedClicks || 0
    },
    topLandingPages,
    joinHealth: {
      status: joinStatus,
      note: joinNote,
      leadPageCount: pageCoverageRows.length,
      pageMetricCoverageCount: pageCoverageRows.filter((row) => row.status === 'page_metrics').length,
      queryCoverageCount: pageCoverageRows.filter((row) => row.status !== 'no_metrics').length,
      problemPages: [...queryOnlyPages, ...noMetricPages].slice(0, 6)
    }
  };
}

function buildExecutiveSummary({
  currentLeads = [],
  previousLeads = [],
  overviewCards = [],
  pipeline,
  acquisition,
  seoQueries,
  seoContent,
  landingPageScorecard,
  operations,
  dataHealth,
  externalMetricRows = [],
  queryMetricRows = [],
  filters = {}
}) {
  const trend = buildExecutiveTrend(currentLeads, previousLeads);
  const risk = buildExecutiveRisk({
    currentLeads,
    overviewCards,
    operations,
    dataHealth
  });
  const opportunity = buildExecutiveOpportunity({
    acquisition,
    seoContent,
    pipeline,
    landingPageScorecard,
    currentLeads
  });
  const nextAction = buildExecutiveNextAction({
    risk,
    opportunity,
    filters
  });
  const attributionDrilldown = buildExecutiveAttributionDrilldown(currentLeads, risk);
  const organicEvidence = buildExecutiveOrganicEvidence({
    currentLeads,
    seoContent,
    seoQueries,
    externalMetricRows,
    queryMetricRows
  });

  return {
    segmentLabel: buildDashboardFilterLabel(filters),
    notes: buildDashboardFilterNotes(filters),
    trend,
    risk,
    opportunity,
    nextAction,
    attributionDrilldown,
    organicEvidence
  };
}

export function buildAdminDashboardData({
  currentRows,
  previousRows,
  universeRows,
  externalMetricRows = [],
  queryMetricRows = [],
  whatsappClickRows = [],
  keywordCatalogRows = [],
  keywordRankingRows = [],
  sourceHealthRows = [],
  auditEvents = [],
  range,
  filters = {},
  nowIso = new Date().toISOString()
}) {
  const currentLeads = normalizeLeadRows(currentRows, nowIso);
  const previousLeads = normalizeLeadRows(previousRows, nowIso);
  const universeLeads = normalizeLeadRows(universeRows, nowIso);
  const normalizedFilters = normalizeDashboardFilters(filters);
  const filterOptions = buildDashboardFilterOptions({
    universeLeads,
    externalMetricRows,
    keywordCatalogRows,
    keywordRankingRows
  });
  const activeFilters = buildActiveFilterChips(normalizedFilters);
  const filteredCurrentLeads = currentLeads.filter((lead) => matchesLeadFilters(lead, normalizedFilters));
  const filteredPreviousLeads = previousLeads.filter((lead) => matchesLeadFilters(lead, normalizedFilters));
  const filteredUniverseLeads = universeLeads.filter((lead) => matchesLeadFilters(lead, normalizedFilters));
  const filteredExternalMetricRows = externalMetricRows.filter((row) => matchesExternalMetricFilters(row, normalizedFilters));
  const filteredQueryMetricRows = queryMetricRows
    .map(normalizeQueryMetricDashboardRow)
    .filter((row) => row.metricDate && row.normalizedQuery)
    .filter((row) => matchesQueryMetricFilters(row, normalizedFilters));
  const filteredWhatsAppClickRows = whatsappClickRows.filter((row) => matchesWhatsAppClickFilters(row, normalizedFilters));
  const filteredKeywordCatalogRows = keywordCatalogRows.filter((row) => matchesKeywordCatalogFilters(row, normalizedFilters));
  const filteredKeywordRankingRows = keywordRankingRows.filter((row) => matchesKeywordRankingFilters(row, normalizedFilters));
  const filteredAuditEvents = filterAuditEvents(auditEvents, filteredUniverseLeads);
  const dataHealth = buildDataHealth(sourceHealthRows, externalMetricRows, keywordCatalogRows, keywordRankingRows, nowIso);
  const overviewCards = buildOverviewCards(filteredCurrentLeads, filteredPreviousLeads, filteredUniverseLeads, range);
  const pipeline = buildPipeline(filteredCurrentLeads, range);
  const acquisition = buildAcquisition(filteredCurrentLeads, filteredExternalMetricRows, filteredWhatsAppClickRows);
  const seoQueries = buildSeoQueries(filteredQueryMetricRows, normalizedFilters);
  const landingPageScorecard = buildLandingPageScorecard(
    filteredCurrentLeads,
    filteredExternalMetricRows,
    filteredQueryMetricRows
  );
  const contentOpportunities = buildContentOpportunities(
    filteredQueryMetricRows,
    landingPageScorecard,
    range
  );
  const funnelDiagnostics = buildFunnelDiagnostics(filteredCurrentLeads, range);
  const seoContent = buildSeoContent(
    filteredCurrentLeads,
    filteredExternalMetricRows,
    filteredKeywordCatalogRows,
    filteredKeywordRankingRows,
    normalizedFilters
  );
  const operations = buildOperations(filteredUniverseLeads, filteredAuditEvents, range, nowIso);
  const executiveSummary = buildExecutiveSummary({
    currentLeads: filteredCurrentLeads,
    previousLeads: filteredPreviousLeads,
    overviewCards,
    pipeline,
    acquisition,
    seoQueries,
    seoContent,
    landingPageScorecard,
    operations,
    dataHealth,
    externalMetricRows: filteredExternalMetricRows,
    queryMetricRows: filteredQueryMetricRows,
    filters: normalizedFilters
  });

  return {
    range: {
      from: range.from,
      to: range.to,
      days: range.days,
      staleLeadHours: STALE_OPEN_LEAD_HOURS
    },
    filters: {
      applied: normalizedFilters,
      active: activeFilters,
      segmentLabel: buildDashboardFilterLabel(normalizedFilters),
      seoDeviceLabel: normalizedFilters.device ? getDeviceLabel(normalizedFilters.device) : null,
      notes: buildDashboardFilterNotes(normalizedFilters),
      options: filterOptions
    },
    executiveSummary,
    overview: {
      cards: overviewCards,
      cohort: {
        currentLeads: filteredCurrentLeads.length,
        qualifiedReached: filteredCurrentLeads.filter(hasReachedQualified).length,
        won: filteredCurrentLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length,
        unattributed: filteredCurrentLeads.filter(isUnattributedLead).length
      }
    },
    pipeline,
    acquisition,
    seoQueries,
    contentOpportunities,
    landingPageScorecard,
    funnelDiagnostics,
    seoContent,
    operations,
    dataHealth
  };
}
