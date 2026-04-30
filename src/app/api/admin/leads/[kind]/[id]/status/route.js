import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import {
  buildLeadMeasurementParams,
  sendLifecycleMeasurementEvent
} from '@/libs/analyticsLifecycle';
import {
  CONVENTION_OPERATIONAL_STATUSES,
  deriveLeadStatusFromConventionStatus,
  getLifecycleTimestampPatch,
  isLeadStatusTransitionAllowed,
  LEAD_STATUS_OPTIONS,
  LEAD_STATUSES
} from '@/utils/leadLifecycle';

async function authenticateAdmin(request, supabase) {
  const authorizationHeader = request.headers.get('authorization') || '';
  const accessToken = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length).trim()
    : '';

  if (!accessToken) {
    return { error: 'missing_token', status: 401 };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData?.user?.email) {
    return { error: 'invalid_token', status: 401 };
  }

  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', authData.user.email)
    .eq('is_active', true)
    .single();

  if (adminError || !adminData) {
    return { error: 'forbidden', status: 403 };
  }

  return { user: authData.user };
}

function getLeadConfig(kind) {
  if (kind === 'devis') {
    return {
      table: 'devis_requests',
      leadType: 'devis',
      businessLine: 'b2c'
    };
  }

  if (kind === 'convention') {
    return {
      table: 'convention_requests',
      leadType: 'convention',
      businessLine: 'b2b'
    };
  }

  return null;
}

export async function PATCH(request, { params }) {
  try {
    const { kind, id } = params;
    const config = getLeadConfig(kind);

    if (!config || !id) {
      return NextResponse.json({
        status: 'invalid_request',
        message: 'Type de lead invalide.'
      }, { status: 400 });
    }

    const supabase = createServiceClient();
    const authResult = await authenticateAdmin(request, supabase);

    if (authResult.error) {
      return NextResponse.json({
        status: authResult.error,
        message: 'Accès administrateur requis.'
      }, { status: authResult.status });
    }

    const body = await request.json().catch(() => ({}));
    let { leadStatus, operationalStatus } = body;

    const { data: currentLead, error: fetchError } = await supabase
      .from(config.table)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentLead) {
      return NextResponse.json({
        status: 'not_found',
        message: 'Lead introuvable.'
      }, { status: 404 });
    }

    const previousLeadStatus = currentLead.lead_status
      || (kind === 'convention'
        ? deriveLeadStatusFromConventionStatus(currentLead.statut)
        : LEAD_STATUSES.SUBMITTED);

    const patch = {};

    if (kind === 'convention') {
      const nextOperationalStatus = operationalStatus || currentLead.statut || 'nouveau';

      if (!CONVENTION_OPERATIONAL_STATUSES.includes(nextOperationalStatus)) {
        return NextResponse.json({
          status: 'invalid_status',
          message: 'Statut opérationnel invalide.'
        }, { status: 400 });
      }

      const derivedLeadStatus = deriveLeadStatusFromConventionStatus(nextOperationalStatus);
      if (leadStatus && leadStatus !== derivedLeadStatus) {
        return NextResponse.json({
          status: 'status_mismatch',
          message: 'Le statut lead ne correspond pas au statut opérationnel.'
        }, { status: 400 });
      }

      leadStatus = derivedLeadStatus;
      patch.statut = nextOperationalStatus;
    }

    if (!LEAD_STATUS_OPTIONS.includes(leadStatus)) {
      return NextResponse.json({
        status: 'invalid_status',
        message: 'Statut lead invalide.'
      }, { status: 400 });
    }

    if (!isLeadStatusTransitionAllowed(previousLeadStatus, leadStatus)) {
      return NextResponse.json({
        status: 'transition_not_allowed',
        message: 'Transition de statut non autorisée.'
      }, { status: 409 });
    }

    Object.assign(
      patch,
      {
        lead_status: leadStatus
      },
      getLifecycleTimestampPatch(previousLeadStatus, leadStatus)
    );

    const { data: updatedLead, error: updateError } = await supabase
      .from(config.table)
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError || !updatedLead) {
      return NextResponse.json({
        status: 'update_failed',
        message: 'Impossible de mettre à jour le lead.'
      }, { status: 500 });
    }

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
            businessLine: config.businessLine,
            previousStatus: previousLeadStatus
          })
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      data: updatedLead
    });
  } catch (error) {
    console.error('[admin][lead-status] update failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du lead.',
      details: error?.message
    }, { status: 500 });
  }
}
