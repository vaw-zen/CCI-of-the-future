import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import { guardMutationRequest } from '@/libs/security';
import { normalizeBehaviorEventPayload } from '@/libs/behaviorTracking.mjs';

const BEHAVIOR_EVENT_RATE_LIMIT = {
  scope: 'analytics-behavior',
  limit: 240,
  windowMs: 60 * 1000
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

async function readRequestBody(request) {
  const rawText = await request.text().catch(() => '');

  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    return {};
  }
}

export async function POST(request) {
  const guardResponse = guardMutationRequest(request, BEHAVIOR_EVENT_RATE_LIMIT);
  if (guardResponse) {
    return guardResponse;
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    return getErrorResponse('config_error', 'Service de base de données non configuré.', 500);
  }

  try {
    const body = await readRequestBody(request);
    const payload = normalizeBehaviorEventPayload(
      body.eventName,
      body.payload || {},
      body.occurredAt || new Date().toISOString()
    );

    if (!payload) {
      return NextResponse.json({
        status: 'ignored',
        message: 'Événement comportemental ignoré.',
        data: null
      }, { status: 202 });
    }

    const { data, error } = await supabase
      .from('growth_behavior_events')
      .insert(payload)
      .select([
        'id',
        'occurred_at',
        'event_name',
        'page_type',
        'business_line'
      ].join(','))
      .single();

    if (error) {
      console.error('[analytics][behavior] insert failed:', error);
      return getErrorResponse('database_error', 'Impossible d’enregistrer l’événement comportemental.', 500);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Événement comportemental enregistré.',
      data
    });
  } catch (error) {
    console.error('[analytics][behavior] unexpected error:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors de l’enregistrement du comportement.', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
