import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import { getClientIp, guardMutationRequest } from '@/libs/security';
import { buildWhatsAppManualTagPatch } from '@/libs/whatsappAttribution.mjs';
import {
  isMissingOptionalLeadOperationFieldError,
  withoutOptionalLeadOperationFields
} from '@/libs/leadTrackingSchemaCompat.mjs';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ADMIN_ATTRIBUTION_RATE_LIMIT = {
  scope: 'admin-attribution',
  limit: 30,
  windowMs: 60 * 1000
};

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

function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'invalid_payload', message: 'Payload invalide.' };
  }

  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== 'whatsappManualTag' || typeof body.whatsappManualTag !== 'boolean') {
    return { error: 'invalid_payload', message: 'Payload attribution invalide.' };
  }

  return { ok: true };
}

export async function PATCH(request, { params }) {
  const guardResponse = guardMutationRequest(request, ADMIN_ATTRIBUTION_RATE_LIMIT);
  if (guardResponse) {
    console.warn('[admin][lead-attribution] request blocked by guard:', {
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

  try {
    const attributionPatch = {
      ...buildWhatsAppManualTagPatch(body.whatsappManualTag),
      last_worked_at: new Date().toISOString()
    };

    let { data: updatedLead, error } = await supabase
      .from(table)
      .update(attributionPatch)
      .eq('id', id)
      .select('*')
      .single();

    if (error && isMissingOptionalLeadOperationFieldError(error)) {
      console.warn(`[admin][lead-attribution] retrying update without optional lead-operations columns for ${table}: ${error.message}`);
      ({ data: updatedLead, error } = await supabase
        .from(table)
        .update(withoutOptionalLeadOperationFields(attributionPatch))
        .eq('id', id)
        .select('*')
        .single());
    }

    if (error || !updatedLead) {
      return getErrorResponse('update_failed', 'Impossible de mettre à jour l’attribution du lead.', 500);
    }

    return NextResponse.json({
      status: 'success',
      data: updatedLead
    });
  } catch (error) {
    console.error('[admin][lead-attribution] update failed:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors de la mise à jour de l’attribution.', 500);
  }
}
