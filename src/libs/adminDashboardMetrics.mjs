const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_RANGE_DAYS = 365;
export const DEFAULT_RANGE_DAYS = 30;
export const STALE_OPEN_LEAD_HOURS = 48;

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
  return lead.qualifiedAt || lead.submittedAt || lead.createdAt;
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

export function isUnattributedLead(lead) {
  const source = String(lead.source || '').trim().toLowerCase();
  const medium = String(lead.medium || '').trim().toLowerCase();

  const sourceUnknown = !source || source === 'direct' || source === '(direct)' || source === 'unknown';
  const mediumUnknown = !medium || medium === '(none)' || medium === 'none' || medium === '(not set)' || medium === 'unknown';

  return sourceUnknown && mediumUnknown;
}

export function normalizeLead(row, kind, nowIso) {
  const services = getLeadServices(row, kind);
  const status = getLeadStatus(row, kind);
  const serviceKey = kind === 'devis'
    ? (row.type_service || services[0] || 'unknown')
    : (services[0] || row.secteur_activite || 'unknown');

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
    source: normalizeText(row.session_source, 'direct'),
    medium: normalizeText(row.session_medium, '(none)'),
    campaign: normalizeText(row.session_campaign, '(not set)'),
    landingPage: normalizeText(row.landing_page || row.entry_path, 'Non renseignée'),
    referrerHost: normalizeText(row.referrer_host, 'Non renseigné'),
    serviceKey,
    serviceLabel: getServiceLabel(serviceKey),
    services: services.map((service) => ({
      key: service,
      label: getServiceLabel(service)
    })),
    calculatorEstimate: normalizeNumber(row.calculator_estimate),
    hoursToQualify: getHoursBetween(row.submitted_at || row.created_at, row.qualified_at),
    hoursToClose: getHoursBetween(row.submitted_at || row.created_at, row.closed_at)
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

  return [
    {
      key: 'new_leads',
      label: 'Nouveaux leads',
      value: currentLeads.length,
      type: 'number',
      meta: 'Cohorte créée sur la période',
      delta: getNumberDelta(currentLeads.length, previousLeads.length)
    },
    {
      key: 'qualified_activity',
      label: 'Qualifiés (activité)',
      value: qualifiedActivity,
      type: 'number',
      meta: 'qualified_at sur la période'
    },
    {
      key: 'won_activity',
      label: 'Gagnés (activité)',
      value: wonActivity,
      type: 'number',
      meta: 'closed_at sur la période'
    },
    {
      key: 'qualified_rate',
      label: 'Taux qualification cohorte',
      value: qualifiedRate,
      type: 'percent',
      meta: 'Leads créés sur la période ayant atteint le statut qualifié ou plus',
      delta: getPercentDelta(qualifiedRate, previousQualifiedRate)
    },
    {
      key: 'win_rate',
      label: 'Taux gain cohorte',
      value: winRate,
      type: 'percent',
      meta: 'Leads créés sur la période actuellement gagnés',
      delta: getPercentDelta(winRate, previousWinRate)
    },
    {
      key: 'unattributed_rate',
      label: 'Leads non attribués',
      value: unattributedRate,
      type: 'percent',
      meta: 'Source + medium absents ou direct / (none)',
      delta: getPercentDelta(unattributedRate, previousUnattributedRate)
    },
    {
      key: 'revenue_proxy',
      label: 'Proxy CA estimé',
      value: revenueProxy,
      type: 'currency',
      meta: 'Somme calculator_estimate sur la cohorte créée',
      delta: getNumberDelta(revenueProxy, previousRevenueProxy)
    }
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

  leads.forEach((lead) => {
    addBreakdownValue(source, lead.source, lead.source);
    addBreakdownValue(medium, lead.medium, lead.medium);
    addBreakdownValue(campaign, lead.campaign, lead.campaign);
    addBreakdownValue(kind, lead.kind, lead.kindLabel);
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
    kind: finalizeBreakdown(kind, leads.length)
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
    createdAt: lead.createdAt,
    submittedAt: lead.submittedAt,
    qualifiedAt: lead.qualifiedAt,
    closedAt: lead.closedAt,
    calculatorEstimate: lead.calculatorEstimate,
    ageHours: lead.ageHours
  };
}

function normalizeExternalMetricRow(row = {}) {
  return {
    metricDate: row.metric_date,
    metricSource: normalizeText(row.metric_source, 'unknown'),
    source: normalizeText(row.source, 'unknown'),
    medium: normalizeText(row.medium, '(none)'),
    campaign: normalizeText(row.campaign, '(not set)'),
    landingPage: normalizeText(row.landing_page, '/'),
    sessions: Number(row.sessions || 0),
    users: Number(row.users || 0),
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    spend: Number(row.spend || 0),
    metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : {}
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
  return {
    key: seed.key,
    metricDate: seed.metricDate,
    source: seed.source,
    medium: seed.medium,
    campaign: seed.campaign,
    landingPage: seed.landingPage,
    sessions: 0,
    users: 0,
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
    const ctr = getPercent(bucket.clicks, bucket.impressions);
    const leadRateBase = bucket.sessions > 0 ? 'sessions' : bucket.clicks > 0 ? 'clicks' : 'none';
    const denominator = leadRateBase === 'sessions' ? bucket.sessions : leadRateBase === 'clicks' ? bucket.clicks : 0;

    return {
      ...bucket,
      ctr,
      leadRate: getPercent(bucket.leads, denominator),
      leadRateBase,
      costPerLead: bucket.leads > 0 ? Math.round((bucket.spend / bucket.leads) * 100) / 100 : null,
      costPerAcquisition: bucket.wonLeads > 0 ? Math.round((bucket.spend / bucket.wonLeads) * 100) / 100 : null
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
      landingPage: row.landingPage
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
      landingPage: lead.landingPage
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
      sessions: 0,
      users: 0,
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
      ctr: getPercent(row.clicks, row.impressions),
      leadRate: getPercent(row.leads, row.sessions > 0 ? row.sessions : row.clicks),
      costPerLead: row.leads > 0 ? Math.round((row.spend / row.leads) * 100) / 100 : null,
      costPerAcquisition: row.wonLeads > 0 ? Math.round((row.spend / row.wonLeads) * 100) / 100 : null
    }))
    .sort((a, b) => (
      b.qualifiedLeads - a.qualifiedLeads
      || b.wonLeads - a.wonLeads
      || b.leads - a.leads
      || b.clicks - a.clicks
    ))
    .slice(0, limit);
}

function buildAcquisition(currentLeads, externalMetricRows) {
  const combinedRows = buildCombinedChannelPerformance(currentLeads, externalMetricRows);
  const totals = combinedRows.reduce((accumulator, row) => ({
    sessions: accumulator.sessions + row.sessions,
    users: accumulator.users + row.users,
    clicks: accumulator.clicks + row.clicks,
    impressions: accumulator.impressions + row.impressions,
    spend: accumulator.spend + row.spend,
    leads: accumulator.leads + row.leads,
    qualifiedLeads: accumulator.qualifiedLeads + row.qualifiedLeads,
    wonLeads: accumulator.wonLeads + row.wonLeads
  }), {
    sessions: 0,
    users: 0,
    clicks: 0,
    impressions: 0,
    spend: 0,
    leads: 0,
    qualifiedLeads: 0,
    wonLeads: 0
  });

  return {
    totals: {
      ...totals,
      ctr: getPercent(totals.clicks, totals.impressions),
      costPerLead: totals.leads > 0 ? Math.round((totals.spend / totals.leads) * 100) / 100 : null,
      costPerAcquisition: totals.wonLeads > 0 ? Math.round((totals.spend / totals.wonLeads) * 100) / 100 : null
    },
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
    notes: {
      leadBasis: 'Leads créés sur la période',
      externalMetricBasis: 'Sessions, clics, impressions et spend issus des snapshots externes journaliers'
    }
  };
}

function buildSeoContent(currentLeads, externalMetricRows) {
  const combinedRows = buildCombinedChannelPerformance(currentLeads, externalMetricRows);
  const pageRows = aggregateCombinedRows(
    combinedRows,
    (row) => row.landingPage,
    (row) => row.landingPage,
    { limit: 12 }
  );

  const organicRows = combinedRows.filter((row) => (
    row.source.toLowerCase() === 'google'
    || row.medium.toLowerCase() === 'organic'
  ));

  const organicTotals = organicRows.reduce((accumulator, row) => ({
    clicks: accumulator.clicks + row.clicks,
    impressions: accumulator.impressions + row.impressions,
    sessions: accumulator.sessions + row.sessions,
    leads: accumulator.leads + row.leads,
    qualifiedLeads: accumulator.qualifiedLeads + row.qualifiedLeads
  }), {
    clicks: 0,
    impressions: 0,
    sessions: 0,
    leads: 0,
    qualifiedLeads: 0
  });

  return {
    totals: {
      landingPagesTracked: pageRows.length,
      clicks: organicTotals.clicks,
      impressions: organicTotals.impressions,
      sessions: organicTotals.sessions,
      ctr: getPercent(organicTotals.clicks, organicTotals.impressions),
      leadRate: getPercent(organicTotals.leads, organicTotals.sessions > 0 ? organicTotals.sessions : organicTotals.clicks),
      qualifiedLeads: organicTotals.qualifiedLeads
    },
    landingPages: pageRows,
    notes: {
      leadRateDefinition: 'Leads / sessions lorsque disponibles, sinon leads / clicks',
      organicDefinition: 'Source google ou medium organic'
    }
  };
}

function buildOperations(universeLeads, auditEvents, range, nowIso) {
  const staleCutoff = new Date(new Date(nowIso).getTime() - (STALE_OPEN_LEAD_HOURS * 60 * 60 * 1000));
  const staleLeads = universeLeads
    .filter(isOpenLead)
    .filter((lead) => new Date(getMostRecentOpenTimestamp(lead)) < staleCutoff)
    .sort((a, b) => (b.ageHours || 0) - (a.ageHours || 0));

  const latestSubmitted = [...universeLeads]
    .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))
    .slice(0, 8);

  return {
    staleLeadHours: STALE_OPEN_LEAD_HOURS,
    staleQueue: {
      count: staleLeads.length,
      leads: staleLeads.slice(0, 8).map(summarizeLead)
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

function buildDataHealth(sourceHealthRows, externalMetricRows, nowIso) {
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
    const matchingRows = (externalMetricRows || []).filter((row) => expectation.metricSources.includes(row.metric_source));
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
        : 'Aucune synchronisation disponible'),
      lastError: healthRow?.last_error || null,
      recordCount: matchingRows.length
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

export function buildAdminDashboardData({
  currentRows,
  previousRows,
  universeRows,
  externalMetricRows = [],
  sourceHealthRows = [],
  auditEvents = [],
  range,
  nowIso = new Date().toISOString()
}) {
  const currentLeads = normalizeLeadRows(currentRows, nowIso);
  const previousLeads = normalizeLeadRows(previousRows, nowIso);
  const universeLeads = normalizeLeadRows(universeRows, nowIso);

  return {
    range: {
      from: range.from,
      to: range.to,
      days: range.days,
      staleLeadHours: STALE_OPEN_LEAD_HOURS
    },
    overview: {
      cards: buildOverviewCards(currentLeads, previousLeads, universeLeads, range),
      cohort: {
        currentLeads: currentLeads.length,
        qualifiedReached: currentLeads.filter(hasReachedQualified).length,
        won: currentLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length,
        unattributed: currentLeads.filter(isUnattributedLead).length
      }
    },
    pipeline: buildPipeline(currentLeads, range),
    acquisition: buildAcquisition(currentLeads, externalMetricRows),
    seoContent: buildSeoContent(currentLeads, externalMetricRows),
    operations: buildOperations(universeLeads, auditEvents, range, nowIso),
    dataHealth: buildDataHealth(sourceHealthRows, externalMetricRows, nowIso)
  };
}
