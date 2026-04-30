export const LEAD_STATUSES = {
  SUBMITTED: 'submitted',
  QUALIFIED: 'qualified',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
};

export const LEAD_STATUS_OPTIONS = Object.values(LEAD_STATUSES);

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

