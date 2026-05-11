import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import {
  buildLeadMeasurementParams,
  sendLifecycleMeasurementEvent
} from '@/libs/analyticsLifecycle';
import {
  CONVENTION_OPERATIONAL_STATUSES,
  deriveLeadQualityOutcomeFromStatus,
  deriveLeadStatusFromConventionStatus,
  getLifecycleTimestampPatch,
  isLeadStatusTransitionAllowed,
  LEAD_STATUS_OPTIONS,
  LEAD_STATUSES,
  LEAD_QUALITY_OUTCOMES
} from '@/utils/leadLifecycle';
import {
  getClientIp,
  guardMutationRequest,
  hashRequestValue
} from '@/libs/security';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';
import {
  isMissingOptionalLeadOperationFieldError,
  runLeadSelectWithOptionalTrackingFallback,
  withoutOptionalLeadOperationFields
} from '@/libs/leadTrackingSchemaCompat.mjs';
import { WHATSAPP_DIRECT_LEAD_SELECT_FIELDS } from '@/libs/whatsappDirectLeads.mjs';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ADMIN_STATUS_RATE_LIMIT = {
  scope: 'admin-status',
  limit: 30,
  windowMs: 60 * 1000
};
const LEAD_SELECT_FIELDS = {
  devis: [
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
  ].join(','),
  convention: [
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
  ].join(','),
  whatsapp: [
    WHATSAPP_DIRECT_LEAD_SELECT_FIELDS
  ].join(',')
};

function getLeadConfig(kind) {
  if (kind === 'devis') {
    return {
      table: 'devis_requests',
      leadType: 'devis',
      businessLine: 'b2c',
      select: LEAD_SELECT_FIELDS.devis
    };
  }

  if (kind === 'convention') {
    return {
      table: 'convention_requests',
      leadType: 'convention',
      businessLine: 'b2b',
      select: LEAD_SELECT_FIELDS.convention
    };
  }

  if (kind === 'whatsapp') {
    return {
      table: 'whatsapp_direct_leads',
      leadType: 'whatsapp_direct',
      businessLine: null,
      select: LEAD_SELECT_FIELDS.whatsapp
    };
  }

  return null;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateStatusPayload(kind, body) {
  if (!isPlainObject(body)) {
    return { error: 'invalid_payload', message: 'Payload invalide.' };
  }

  const keys = Object.keys(body);

  if (kind === 'devis' || kind === 'whatsapp') {
    if (keys.length !== 1 || keys[0] !== 'leadStatus') {
      return {
        error: 'invalid_payload',
        message: kind === 'whatsapp' ? 'Payload WhatsApp invalide.' : 'Payload devis invalide.'
      };
    }

    if (!LEAD_STATUS_OPTIONS.includes(body.leadStatus)) {
      return { error: 'invalid_status', message: 'Statut lead invalide.' };
    }
  }

  if (kind === 'convention') {
    const allowedKeys = new Set(['operationalStatus', 'leadStatus']);
    const hasOnlyAllowedKeys = keys.every((key) => allowedKeys.has(key));

    if (!hasOnlyAllowedKeys || !body.operationalStatus) {
      return { error: 'invalid_payload', message: 'Payload convention invalide.' };
    }

    if (!CONVENTION_OPERATIONAL_STATUSES.includes(body.operationalStatus)) {
      return { error: 'invalid_status', message: 'Statut opérationnel invalide.' };
    }

    if (body.leadStatus && !LEAD_STATUS_OPTIONS.includes(body.leadStatus)) {
      return { error: 'invalid_status', message: 'Statut lead invalide.' };
    }
  }

  return { ok: true };
}

async function writeStatusAuditEvent(supabase, {
  kind = 'unknown',
  table = null,
  leadId = null,
  previousStatus = null,
  nextStatus = null,
  previousOperationalStatus = null,
  nextOperationalStatus = null,
  adminUser = null,
  actionResult = 'rejected',
  rejectionReason = null,
  request
} = {}) {
  try {
    const userAgent = request.headers.get('user-agent') || '';

    await supabase
      .from('admin_lead_status_events')
      .insert({
        lead_kind: kind,
        lead_table: table,
        lead_id: UUID_PATTERN.test(leadId || '') ? leadId : null,
        previous_status: previousStatus,
        next_status: nextStatus,
        previous_operational_status: previousOperationalStatus,
        next_operational_status: nextOperationalStatus,
        admin_email: adminUser?.email || null,
        admin_user_id: adminUser?.id || null,
        action_result: actionResult,
        rejection_reason: rejectionReason,
        request_ip: getClientIp(request),
        user_agent_hash: hashRequestValue(userAgent)
      });
  } catch (auditError) {
    console.warn('[admin][lead-status] audit write failed:', auditError?.message || auditError);
  }
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

async function runLeadSelectWithFallback({ supabase, table, select, applyQuery }) {
  return runLeadSelectWithOptionalTrackingFallback({
    supabase,
    table,
    select,
    applyQuery,
    channel: 'lead-status'
  });
}

export async function PATCH(request, { params }) {
  const guardResponse = guardMutationRequest(request, ADMIN_STATUS_RATE_LIMIT);
  if (guardResponse) {
    console.warn('[admin][lead-status] request blocked by guard:', {
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
  const config = getLeadConfig(kind);

  if (!config || !UUID_PATTERN.test(id || '')) {
    await writeStatusAuditEvent(supabase, {
      kind: config ? kind : 'unknown',
      table: config?.table || null,
      leadId: id,
      actionResult: 'rejected',
      rejectionReason: !config ? 'invalid_kind' : 'invalid_id',
      request
    });
    return getErrorResponse('invalid_request', 'Type de lead ou identifiant invalide.', 400);
  }

  const authResult = await authenticateAdminRequest(request, supabase);
  if (authResult.error) {
    await writeStatusAuditEvent(supabase, {
      kind,
      table: config.table,
      leadId: id,
      adminUser: authResult.user,
      actionResult: 'rejected',
      rejectionReason: authResult.error,
      request
    });
    return getErrorResponse(authResult.error, 'Accès administrateur requis.', authResult.status);
  }

  const body = await request.json().catch(() => null);
  const payloadValidation = validateStatusPayload(kind, body);
  if (!payloadValidation.ok) {
    await writeStatusAuditEvent(supabase, {
      kind,
      table: config.table,
      leadId: id,
      adminUser: authResult.user,
      actionResult: 'rejected',
      rejectionReason: payloadValidation.error,
      request
    });
    return getErrorResponse(payloadValidation.error, payloadValidation.message, 400);
  }

  let { leadStatus, operationalStatus } = body;

  try {
    const { data: currentLead, error: fetchError } = await runLeadSelectWithFallback({
      supabase,
      table: config.table,
      select: config.select,
      applyQuery: (query) => query
        .eq('id', id)
        .single()
    });

    if (fetchError || !currentLead) {
      await writeStatusAuditEvent(supabase, {
        kind,
        table: config.table,
        leadId: id,
        adminUser: authResult.user,
        actionResult: 'rejected',
        rejectionReason: 'not_found',
        request
      });
      return getErrorResponse('not_found', 'Lead introuvable.', 404);
    }

    const previousLeadStatus = currentLead.lead_status
      || (kind === 'convention'
        ? deriveLeadStatusFromConventionStatus(currentLead.statut)
        : LEAD_STATUSES.SUBMITTED);
    const nowIso = new Date().toISOString();

    const patch = {};
    let nextOperationalStatus = null;

    if (kind === 'convention') {
      nextOperationalStatus = operationalStatus || currentLead.statut || 'nouveau';
      const derivedLeadStatus = deriveLeadStatusFromConventionStatus(nextOperationalStatus);

      if (leadStatus && leadStatus !== derivedLeadStatus) {
        await writeStatusAuditEvent(supabase, {
          kind,
          table: config.table,
          leadId: id,
          previousStatus: previousLeadStatus,
          nextStatus: leadStatus,
          previousOperationalStatus: currentLead.statut,
          nextOperationalStatus,
          adminUser: authResult.user,
          actionResult: 'rejected',
          rejectionReason: 'status_mismatch',
          request
        });
        return getErrorResponse('status_mismatch', 'Le statut lead ne correspond pas au statut opérationnel.', 400);
      }

      leadStatus = derivedLeadStatus;
      patch.statut = nextOperationalStatus;
    }

    if (!isLeadStatusTransitionAllowed(previousLeadStatus, leadStatus)) {
      await writeStatusAuditEvent(supabase, {
        kind,
        table: config.table,
        leadId: id,
        previousStatus: previousLeadStatus,
        nextStatus: leadStatus,
        previousOperationalStatus: currentLead.statut || null,
        nextOperationalStatus,
        adminUser: authResult.user,
        actionResult: 'rejected',
        rejectionReason: 'transition_not_allowed',
        request
      });
      return getErrorResponse('transition_not_allowed', 'Transition de statut non autorisée.', 409);
    }

    Object.assign(
      patch,
      {
        lead_status: leadStatus,
        lead_quality_outcome: deriveLeadQualityOutcomeFromStatus(
          leadStatus,
          currentLead.lead_quality_outcome || LEAD_QUALITY_OUTCOMES.UNREVIEWED
        ),
        last_worked_at: nowIso,
        follow_up_sla_at: leadStatus === LEAD_STATUSES.CLOSED_WON || leadStatus === LEAD_STATUSES.CLOSED_LOST
          ? null
          : currentLead.follow_up_sla_at || null
      },
      getLifecycleTimestampPatch(previousLeadStatus, leadStatus, nowIso)
    );

    let { error: updateError } = await supabase
      .from(config.table)
      .update(patch)
      .eq('id', id);

    if (updateError && isMissingOptionalLeadOperationFieldError(updateError)) {
      console.warn(
        `[admin][lead-status] retrying status update without optional lead-operations columns for ${config.table}: ${updateError.message}`
      );
      ({ error: updateError } = await supabase
        .from(config.table)
        .update(withoutOptionalLeadOperationFields(patch))
        .eq('id', id));
    }

    if (updateError) {
      await writeStatusAuditEvent(supabase, {
        kind,
        table: config.table,
        leadId: id,
        previousStatus: previousLeadStatus,
        nextStatus: leadStatus,
        previousOperationalStatus: currentLead.statut || null,
        nextOperationalStatus,
        adminUser: authResult.user,
        actionResult: 'rejected',
        rejectionReason: 'update_failed',
        request
      });
      return getErrorResponse('update_failed', 'Impossible de mettre à jour le lead.', 500);
    }

    const { data: updatedLead, error: updatedLeadError } = await runLeadSelectWithFallback({
      supabase,
      table: config.table,
      select: config.select,
      applyQuery: (query) => query
        .eq('id', id)
        .single()
    });

    if (updatedLeadError || !updatedLead) {
      await writeStatusAuditEvent(supabase, {
        kind,
        table: config.table,
        leadId: id,
        previousStatus: previousLeadStatus,
        nextStatus: leadStatus,
        previousOperationalStatus: currentLead.statut || null,
        nextOperationalStatus,
        adminUser: authResult.user,
        actionResult: 'rejected',
        rejectionReason: 'update_failed',
        request
      });
      return getErrorResponse('update_failed', 'Impossible de relire le lead mis à jour.', 500);
    }

    await writeStatusAuditEvent(supabase, {
      kind,
      table: config.table,
      leadId: id,
      previousStatus: previousLeadStatus,
      nextStatus: leadStatus,
      previousOperationalStatus: currentLead.statut || null,
      nextOperationalStatus: updatedLead.statut || null,
      adminUser: authResult.user,
      actionResult: 'success',
      request
    });

    if (leadStatus !== previousLeadStatus) {
      const lifecycleEventName = {
        [LEAD_STATUSES.QUALIFIED]: 'lead_qualified',
        [LEAD_STATUSES.CLOSED_WON]: 'lead_closed_won',
        [LEAD_STATUSES.CLOSED_LOST]: 'lead_closed_lost'
      }[leadStatus];

      if (lifecycleEventName) {
        await sendLifecycleMeasurementEvent({
          clientId: updatedLead.ga_client_id,
          eventName: lifecycleEventName,
          eventParams: buildLeadMeasurementParams({
            leadRecord: updatedLead,
            leadType: config.leadType,
            businessLine: currentLead.business_line || config.businessLine,
            previousStatus: previousLeadStatus,
            additionalParams: kind === 'whatsapp'
              ? {
                service_type: updatedLead.service_key
              }
              : {}
          })
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      data: updatedLead,
      details: {
        auditLogged: true
      }
    });
  } catch (error) {
    console.error('[admin][lead-status] update failed:', error);
    await writeStatusAuditEvent(supabase, {
      kind,
      table: config.table,
      leadId: id,
      adminUser: authResult.user,
      actionResult: 'rejected',
      rejectionReason: 'unexpected_error',
      request
    });
    return getErrorResponse('unexpected_error', 'Erreur lors de la mise à jour du lead.', 500);
  }
}
