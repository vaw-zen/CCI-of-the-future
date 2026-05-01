import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { createServiceClient } from '@/libs/supabase';
import { getClientIp, rateLimitRequest } from '@/libs/security';
import { deriveLeadStatusFromConventionStatus, LEAD_STATUSES } from '@/utils/leadLifecycle';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 365;
const DEFAULT_RANGE_DAYS = 30;
const STALE_LEAD_HOURS = 48;
const ADMIN_DASHBOARD_RATE_LIMIT = {
  scope: 'admin-dashboard',
  limit: 60,
  windowMs: 60 * 1000
};

const DASHBOARD_SELECT_FIELDS = {
  devis: [
    'id',
    'created_at',
    'type_service',
    'lead_status',
    'submitted_at',
    'qualified_at',
    'closed_at',
    'landing_page',
    'session_source',
    'session_medium',
    'session_campaign',
    'referrer_host',
    'entry_path',
    'selected_services'
  ].join(','),
  convention: [
    'id',
    'created_at',
    'secteur_activite',
    'services_souhaites',
    'statut',
    'lead_status',
    'submitted_at',
    'qualified_at',
    'closed_at',
    'landing_page',
    'session_source',
    'session_medium',
    'session_campaign',
    'referrer_host',
    'entry_path',
    'selected_services'
  ].join(',')
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

function getErrorResponse(status, message, httpStatus) {
  return NextResponse.json({
    status,
    message,
    data: null,
    details: {
      failureType: status
    }
  }, { status: httpStatus });
}

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

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseDateParam(value, { endOfDay = false } = {}) {
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

function getDashboardRange(request) {
  const { searchParams } = new URL(request.url);
  const toParam = searchParams.get('to');
  const fromParam = searchParams.get('from');
  const todayEnd = endOfUtcDay(new Date());

  const parsedTo = parseDateParam(toParam, { endOfDay: true });
  if (parsedTo.error) {
    return { error: 'invalid_date', message: 'Date de fin invalide.' };
  }

  const toDate = parsedTo.value || todayEnd;
  const parsedFrom = parseDateParam(fromParam);
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
      staleLeadHours: STALE_LEAD_HOURS
    },
    previousRange: {
      fromIso: previousFrom.toISOString(),
      toIso: previousTo.toISOString()
    }
  };
}

async function fetchLeadRows(supabase, range) {
  const [devisResult, conventionResult] = await Promise.all([
    supabase
      .from('devis_requests')
      .select(DASHBOARD_SELECT_FIELDS.devis)
      .gte('created_at', range.fromIso)
      .lte('created_at', range.toIso)
      .order('created_at', { ascending: true }),
    supabase
      .from('convention_requests')
      .select(DASHBOARD_SELECT_FIELDS.convention)
      .gte('created_at', range.fromIso)
      .lte('created_at', range.toIso)
      .order('created_at', { ascending: true })
  ]);

  if (devisResult.error) {
    throw devisResult.error;
  }

  if (conventionResult.error) {
    throw conventionResult.error;
  }

  return {
    devis: devisResult.data || [],
    conventions: conventionResult.data || []
  };
}

async function fetchAuditEvents(supabase) {
  const { data, error } = await supabase
    .from('admin_lead_status_events')
    .select([
      'id',
      'created_at',
      'lead_kind',
      'lead_id',
      'previous_status',
      'next_status',
      'previous_operational_status',
      'next_operational_status',
      'action_result',
      'rejection_reason'
    ].join(','))
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return data || [];
}

function getLeadStatus(row, kind) {
  if (row.lead_status) {
    return row.lead_status;
  }

  return kind === 'convention'
    ? deriveLeadStatusFromConventionStatus(row.statut)
    : LEAD_STATUSES.SUBMITTED;
}

function normalizeText(value, fallback = 'Non défini') {
  const text = String(value || '').trim();
  return text || fallback;
}

function getServiceLabel(value) {
  return SERVICE_LABELS[value] || normalizeText(value);
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

function normalizeLead(row, kind, nowIso) {
  const services = getLeadServices(row, kind);
  const status = getLeadStatus(row, kind);
  const serviceKey = kind === 'devis'
    ? row.type_service
    : (services[0] || row.secteur_activite);

  return {
    id: row.id,
    kind,
    kindLabel: kind === 'devis' ? 'Devis' : 'Convention',
    status,
    statusLabel: LEAD_STATUS_LABELS[status] || status,
    operationalStatus: kind === 'convention' ? row.statut || 'nouveau' : null,
    createdAt: row.created_at,
    submittedAt: row.submitted_at,
    qualifiedAt: row.qualified_at,
    closedAt: row.closed_at,
    source: normalizeText(row.session_source, 'direct'),
    medium: normalizeText(row.session_medium, '(none)'),
    campaign: normalizeText(row.session_campaign, '(not set)'),
    landingPage: normalizeText(row.landing_page || row.entry_path, 'Non renseignée'),
    referrerHost: normalizeText(row.referrer_host, 'Non renseigné'),
    serviceKey: serviceKey || 'unknown',
    serviceLabel: getServiceLabel(serviceKey || 'unknown'),
    services: services.map((service) => ({
      key: service,
      label: getServiceLabel(service)
    })),
    ageHours: getHoursBetween(row.submitted_at || row.created_at, nowIso),
    hoursToQualify: getHoursBetween(row.submitted_at || row.created_at, row.qualified_at),
    hoursToClose: getHoursBetween(row.submitted_at || row.created_at, row.closed_at)
  };
}

function normalizeLeadRows(rows, nowIso) {
  return [
    ...rows.devis.map((row) => normalizeLead(row, 'devis', nowIso)),
    ...rows.conventions.map((row) => normalizeLead(row, 'convention', nowIso))
  ];
}

function getReachedQualifiedCount(leads) {
  return leads.filter((lead) => (
    lead.status === LEAD_STATUSES.QUALIFIED
    || lead.status === LEAD_STATUSES.CLOSED_WON
    || lead.status === LEAD_STATUSES.CLOSED_LOST
    || Boolean(lead.qualifiedAt)
  )).length;
}

function getAverage(values) {
  const cleanValues = values.filter((value) => Number.isFinite(value));
  if (cleanValues.length === 0) {
    return null;
  }

  const total = cleanValues.reduce((sum, value) => sum + value, 0);
  return Math.round((total / cleanValues.length) * 10) / 10;
}

function getPercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 1000) / 10;
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
    ageHours: lead.ageHours
  };
}

function buildTotals(leads, staleLeadCount) {
  const totalLeads = leads.length;
  const submitted = leads.filter((lead) => lead.status === LEAD_STATUSES.SUBMITTED).length;
  const qualified = leads.filter((lead) => lead.status === LEAD_STATUSES.QUALIFIED).length;
  const closedWon = leads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length;
  const closedLost = leads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_LOST).length;
  const closedTotal = closedWon + closedLost;
  const reachedQualified = getReachedQualifiedCount(leads);

  return {
    totalLeads,
    devisLeads: leads.filter((lead) => lead.kind === 'devis').length,
    conventionLeads: leads.filter((lead) => lead.kind === 'convention').length,
    submitted,
    qualified,
    reachedQualified,
    closedWon,
    closedLost,
    closedTotal,
    staleSubmitted: staleLeadCount,
    qualificationRate: getPercent(reachedQualified, totalLeads),
    closeRate: getPercent(closedTotal, totalLeads),
    winRate: getPercent(closedWon, closedTotal),
    avgHoursToQualify: getAverage(leads.map((lead) => lead.hoursToQualify)),
    avgHoursToClose: getAverage(leads.map((lead) => lead.hoursToClose))
  };
}

function buildComparison(currentLeads, previousLeads) {
  const totalDelta = currentLeads.length - previousLeads.length;
  const previousClosedWon = previousLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length;
  const currentClosedWon = currentLeads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length;

  return {
    previousTotal: previousLeads.length,
    totalDelta,
    totalDeltaRate: previousLeads.length ? getPercent(totalDelta, previousLeads.length) : null,
    previousClosedWon,
    closedWonDelta: currentClosedWon - previousClosedWon
  };
}

function buildTrend(leads, range) {
  const byDate = new Map();

  for (let offset = 0; offset < range.days; offset += 1) {
    const date = new Date(`${range.from}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    byDate.set(formatDateKey(date), {
      date: formatDateKey(date),
      total: 0,
      devis: 0,
      conventions: 0
    });
  }

  leads.forEach((lead) => {
    if (!lead.createdAt) {
      return;
    }

    const key = formatDateKey(new Date(lead.createdAt));
    const bucket = byDate.get(key);
    if (!bucket) {
      return;
    }

    bucket.total += 1;
    if (lead.kind === 'devis') {
      bucket.devis += 1;
    } else {
      bucket.conventions += 1;
    }
  });

  return Array.from(byDate.values());
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
  const service = new Map();
  const kind = new Map();

  leads.forEach((lead) => {
    addBreakdownValue(source, lead.source, lead.source);
    addBreakdownValue(medium, lead.medium, lead.medium);
    addBreakdownValue(campaign, lead.campaign, lead.campaign);
    addBreakdownValue(kind, lead.kind, lead.kindLabel);

    const services = lead.services.length > 0
      ? lead.services
      : [{ key: lead.serviceKey, label: lead.serviceLabel }];

    services.forEach((leadService) => {
      addBreakdownValue(service, leadService.key, leadService.label);
    });
  });

  return {
    source: finalizeBreakdown(source, leads.length),
    medium: finalizeBreakdown(medium, leads.length),
    campaign: finalizeBreakdown(campaign, leads.length),
    service: finalizeBreakdown(service, leads.length),
    kind: finalizeBreakdown(kind, leads.length)
  };
}

function buildFunnel(leads) {
  const total = leads.length;
  const reachedQualified = getReachedQualifiedCount(leads);
  const closedWon = leads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_WON).length;
  const closedLost = leads.filter((lead) => lead.status === LEAD_STATUSES.CLOSED_LOST).length;

  return [
    {
      key: 'submitted',
      label: 'Leads soumis',
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

function buildOperations(leads, nowIso) {
  const staleCutoff = new Date(new Date(nowIso).getTime() - (STALE_LEAD_HOURS * 60 * 60 * 1000));
  const staleLeads = leads
    .filter((lead) => lead.status === LEAD_STATUSES.SUBMITTED)
    .filter((lead) => new Date(lead.submittedAt || lead.createdAt) < staleCutoff)
    .sort((a, b) => (b.ageHours || 0) - (a.ageHours || 0));

  const latestSubmitted = leads
    .filter((lead) => lead.status === LEAD_STATUSES.SUBMITTED)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  return {
    staleLeadHours: STALE_LEAD_HOURS,
    staleSubmittedCount: staleLeads.length,
    staleLeads: staleLeads.slice(0, 8).map(summarizeLead),
    latestSubmitted: latestSubmitted.map(summarizeLead)
  };
}

function sanitizeAuditEvent(event) {
  return {
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
  };
}

function buildDashboardData({ currentRows, previousRows, auditEvents, range, nowIso }) {
  const currentLeads = normalizeLeadRows(currentRows, nowIso);
  const previousLeads = normalizeLeadRows(previousRows, nowIso);
  const operations = buildOperations(currentLeads, nowIso);

  return {
    range: {
      from: range.from,
      to: range.to,
      days: range.days,
      staleLeadHours: STALE_LEAD_HOURS
    },
    totals: buildTotals(currentLeads, operations.staleSubmittedCount),
    comparison: buildComparison(currentLeads, previousLeads),
    trend: buildTrend(currentLeads, range),
    funnel: buildFunnel(currentLeads),
    breakdowns: buildBreakdowns(currentLeads),
    operations,
    auditEvents: auditEvents.map(sanitizeAuditEvent)
  };
}

export async function GET(request) {
  const rateLimitResponse = rateLimitRequest(request, ADMIN_DASHBOARD_RATE_LIMIT);
  if (rateLimitResponse) {
    console.warn('[admin][dashboard] rate limited request:', {
      path: request.nextUrl?.pathname,
      ip: getClientIp(request)
    });
    return rateLimitResponse;
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    return getErrorResponse('config_error', 'Service de base de données non configuré.', 500);
  }

  const authResult = await authenticateAdminRequest(request, supabase);
  if (authResult.error) {
    console.warn('[admin][dashboard] blocked request:', {
      reason: authResult.error,
      path: request.nextUrl?.pathname
    });
    return getErrorResponse(authResult.error, 'Accès administrateur requis.', authResult.status);
  }

  const rangeResult = getDashboardRange(request);
  if (!rangeResult.ok) {
    return getErrorResponse(rangeResult.error, rangeResult.message, 400);
  }

  try {
    const [currentRows, previousRows, auditEvents] = await Promise.all([
      fetchLeadRows(supabase, rangeResult.range),
      fetchLeadRows(supabase, rangeResult.previousRange),
      fetchAuditEvents(supabase)
    ]);

    return NextResponse.json({
      status: 'success',
      message: 'Dashboard KPI chargé.',
      data: buildDashboardData({
        currentRows,
        previousRows,
        auditEvents,
        range: rangeResult.range,
        nowIso: new Date().toISOString()
      }),
      details: {
        piiExcluded: true
      }
    });
  } catch (error) {
    console.error('[admin][dashboard] load failed:', error);
    return getErrorResponse('dashboard_load_failed', 'Impossible de charger les KPI admin.', 500);
  }
}
