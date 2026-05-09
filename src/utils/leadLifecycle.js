export const LEAD_STATUSES = {
  SUBMITTED: 'submitted',
  QUALIFIED: 'qualified',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
};

export const LEAD_STATUS_OPTIONS = Object.values(LEAD_STATUSES);

export const LEAD_QUALITY_OUTCOMES = {
  UNREVIEWED: 'unreviewed',
  SALES_ACCEPTED: 'sales_accepted',
  SALES_REJECTED: 'sales_rejected',
  WON: 'won',
  LOST: 'lost'
};

export const LEAD_QUALITY_OUTCOME_OPTIONS = Object.values(LEAD_QUALITY_OUTCOMES);

export const LEAD_QUALITY_OUTCOME_LABELS = {
  [LEAD_QUALITY_OUTCOMES.UNREVIEWED]: 'Non revu',
  [LEAD_QUALITY_OUTCOMES.SALES_ACCEPTED]: 'Accepté commercialement',
  [LEAD_QUALITY_OUTCOMES.SALES_REJECTED]: 'Rejeté commercialement',
  [LEAD_QUALITY_OUTCOMES.WON]: 'Gagné',
  [LEAD_QUALITY_OUTCOMES.LOST]: 'Perdu'
};

export const DEFAULT_FOLLOW_UP_SLA_HOURS = 24;

export const CONVENTION_OPERATIONAL_STATUSES = [
  'nouveau',
  'contacte',
  'audit_planifie',
  'devis_envoye',
  'signe',
  'refuse'
];

export const CONVENTION_STATUS_TO_LEAD_STATUS = {
  nouveau: LEAD_STATUSES.SUBMITTED,
  contacte: LEAD_STATUSES.QUALIFIED,
  audit_planifie: LEAD_STATUSES.QUALIFIED,
  devis_envoye: LEAD_STATUSES.QUALIFIED,
  signe: LEAD_STATUSES.CLOSED_WON,
  refuse: LEAD_STATUSES.CLOSED_LOST
};

const ALLOWED_TRANSITIONS = {
  [LEAD_STATUSES.SUBMITTED]: new Set([LEAD_STATUSES.QUALIFIED, LEAD_STATUSES.CLOSED_LOST]),
  [LEAD_STATUSES.QUALIFIED]: new Set([LEAD_STATUSES.CLOSED_WON, LEAD_STATUSES.CLOSED_LOST]),
  [LEAD_STATUSES.CLOSED_WON]: new Set(),
  [LEAD_STATUSES.CLOSED_LOST]: new Set()
};

export function deriveLeadStatusFromConventionStatus(status = '') {
  return CONVENTION_STATUS_TO_LEAD_STATUS[status] || LEAD_STATUSES.SUBMITTED;
}

export function isLeadStatusTransitionAllowed(previousStatus, nextStatus) {
  if (!nextStatus || previousStatus === nextStatus) {
    return true;
  }

  const allowedTargets = ALLOWED_TRANSITIONS[previousStatus];
  return Boolean(allowedTargets && allowedTargets.has(nextStatus));
}

export function getLifecycleTimestampPatch(previousStatus, nextStatus, nowIso = new Date().toISOString()) {
  if (!nextStatus || previousStatus === nextStatus) {
    return {};
  }

  const patch = {};

  if (nextStatus === LEAD_STATUSES.SUBMITTED) {
    patch.submitted_at = nowIso;
  }

  if (nextStatus === LEAD_STATUSES.QUALIFIED) {
    patch.qualified_at = nowIso;
  }

  if (nextStatus === LEAD_STATUSES.CLOSED_WON || nextStatus === LEAD_STATUSES.CLOSED_LOST) {
    patch.closed_at = nowIso;
  }

  return patch;
}

export function normalizeLeadQualityOutcome(value, fallback = LEAD_QUALITY_OUTCOMES.UNREVIEWED) {
  if (!value) {
    return fallback;
  }

  return LEAD_QUALITY_OUTCOME_OPTIONS.includes(value) ? value : fallback;
}

export function deriveLeadQualityOutcomeFromStatus(status, previousOutcome = LEAD_QUALITY_OUTCOMES.UNREVIEWED) {
  if (status === LEAD_STATUSES.QUALIFIED) {
    return LEAD_QUALITY_OUTCOMES.SALES_ACCEPTED;
  }

  if (status === LEAD_STATUSES.CLOSED_WON) {
    return LEAD_QUALITY_OUTCOMES.WON;
  }

  if (status === LEAD_STATUSES.CLOSED_LOST) {
    return LEAD_QUALITY_OUTCOMES.LOST;
  }

  return normalizeLeadQualityOutcome(previousOutcome);
}

export function getDefaultFollowUpSlaAt(baseIso, hours = DEFAULT_FOLLOW_UP_SLA_HOURS) {
  const baseDate = new Date(baseIso || '');
  if (!Number.isFinite(baseDate.getTime())) {
    return null;
  }

  return new Date(baseDate.getTime() + (hours * 60 * 60 * 1000)).toISOString();
}

export function isLeadFollowUpOverdue({
  leadStatus,
  followUpSlaAt,
  lastWorkedAt
} = {}, nowIso = new Date().toISOString()) {
  if (leadStatus !== LEAD_STATUSES.SUBMITTED && leadStatus !== LEAD_STATUSES.QUALIFIED) {
    return false;
  }

  if (!followUpSlaAt) {
    return false;
  }

  const slaTimestamp = new Date(followUpSlaAt).getTime();
  const nowTimestamp = new Date(nowIso).getTime();
  if (!Number.isFinite(slaTimestamp) || !Number.isFinite(nowTimestamp)) {
    return false;
  }

  const lastWorkedTimestamp = lastWorkedAt ? new Date(lastWorkedAt).getTime() : null;
  if (Number.isFinite(lastWorkedTimestamp) && lastWorkedTimestamp >= slaTimestamp) {
    return false;
  }

  return nowTimestamp > slaTimestamp;
}

export function formatDateTimeLocalInputValue(value) {
  if (!value) {
    return '';
  }

  const parsedValue = new Date(value);
  if (!Number.isFinite(parsedValue.getTime())) {
    return '';
  }

  const timezoneOffsetMs = parsedValue.getTimezoneOffset() * 60 * 1000;
  return new Date(parsedValue.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

export function parseDateTimeLocalInputValue(value) {
  if (!value) {
    return null;
  }

  const parsedValue = new Date(value);
  if (!Number.isFinite(parsedValue.getTime())) {
    return null;
  }

  return parsedValue.toISOString();
}
