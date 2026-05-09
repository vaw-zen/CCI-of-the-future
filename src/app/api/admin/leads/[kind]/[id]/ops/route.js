import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { getClientIp, guardMutationRequest } from '@/libs/security';
import {
  isMissingOptionalLeadOperationFieldError,
  LEAD_OPERATIONS_MIGRATION_HINT
} from '@/libs/leadTrackingSchemaCompat.mjs';
import { LEAD_QUALITY_OUTCOME_OPTIONS } from '@/utils/leadLifecycle';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ADMIN_OPS_RATE_LIMIT = {
  scope: 'admin-lead-ops',
  limit: 30,
  windowMs: 60 * 1000
};
const ALLOWED_KEYS = new Set([
  'leadQualityOutcome',
  'leadOwner',
  'followUpSlaAt',
  'lastWorkedAt'
]);

function getLeadTable(kind) {
  if (kind === 'devis') {
    return 'devis_requests';
  }

  if (kind === 'convention') {
    return 'convention_requests';
  }

  return null;
}

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

function normalizeOptionalText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
}

function normalizeOptionalIso(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const isoCandidate = new Date(value);
  if (!Number.isFinite(isoCandidate.getTime())) {
    return null;
  }

  return isoCandidate.toISOString();
}

function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'invalid_payload', message: 'Payload invalide.' };
  }

  const keys = Object.keys(body);
  if (keys.length === 0 || !keys.every((key) => ALLOWED_KEYS.has(key))) {
    return { error: 'invalid_payload', message: 'Payload opérationnel invalide.' };
  }

  if ('leadQualityOutcome' in body && !LEAD_QUALITY_OUTCOME_OPTIONS.includes(body.leadQualityOutcome)) {
    return { error: 'invalid_quality_outcome', message: 'Niveau de qualité invalide.' };
  }

  if ('leadOwner' in body && body.leadOwner !== null && typeof body.leadOwner !== 'string') {
    return { error: 'invalid_lead_owner', message: 'Responsable de lead invalide.' };
  }

  if ('followUpSlaAt' in body && body.followUpSlaAt !== null && !normalizeOptionalIso(body.followUpSlaAt)) {
    return { error: 'invalid_follow_up_sla', message: 'Date SLA invalide.' };
  }

  if ('lastWorkedAt' in body && body.lastWorkedAt !== null && !normalizeOptionalIso(body.lastWorkedAt)) {
    return { error: 'invalid_last_worked_at', message: 'Date de suivi invalide.' };
  }

  return { ok: true };
}

export async function PATCH(request, { params }) {
  const guardResponse = guardMutationRequest(request, ADMIN_OPS_RATE_LIMIT);
  if (guardResponse) {
    console.warn('[admin][lead-ops] request blocked by guard:', {
      path: request.nextUrl?.pathname,
      ip: getClientIp(request),
      status: guardResponse.status
    });
    return guardResponse;
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    return getErrorResponse('config_error', 'Service de base de données non configuré.', 500);
  }

  const { kind, id } = await params;
  const table = getLeadTable(kind);

  if (!table || !UUID_PATTERN.test(id || '')) {
    return getErrorResponse('invalid_request', 'Type de lead ou identifiant invalide.', 400);
  }

  const authResult = await authenticateAdminRequest(request, supabase);
  if (authResult.error) {
    return getErrorResponse(authResult.error, 'Accès administrateur requis.', authResult.status);
  }

  const body = await request.json().catch(() => null);
  const validation = validatePayload(body);
  if (!validation.ok) {
    return getErrorResponse(validation.error, validation.message, 400);
  }

  const nowIso = new Date().toISOString();
  const patch = {
    last_worked_at: normalizeOptionalIso(body.lastWorkedAt) || nowIso
  };

  if ('leadQualityOutcome' in body) {
    patch.lead_quality_outcome = body.leadQualityOutcome;
  }

  if ('leadOwner' in body) {
    patch.lead_owner = normalizeOptionalText(body.leadOwner);
  }

  if ('followUpSlaAt' in body) {
    patch.follow_up_sla_at = normalizeOptionalIso(body.followUpSlaAt);
  }

  try {
    const { data: updatedLead, error } = await supabase
      .from(table)
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updatedLead) {
      if (isMissingOptionalLeadOperationFieldError(error)) {
        return getErrorResponse('schema_missing', `Le schéma lead operations n’est pas encore appliqué. ${LEAD_OPERATIONS_MIGRATION_HINT}`, 409);
      }
      return getErrorResponse('update_failed', 'Impossible de mettre à jour le suivi du lead.', 500);
    }

    return NextResponse.json({
      status: 'success',
      data: updatedLead
    });
  } catch (error) {
    console.error('[admin][lead-ops] update failed:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors de la mise à jour du suivi.', 500);
  }
}
