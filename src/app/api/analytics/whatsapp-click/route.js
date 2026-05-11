import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import { guardMutationRequest } from '@/libs/security';
import {
  normalizeWhatsAppClickPayload,
  shouldTrackWhatsAppClick
} from '@/libs/whatsappAttribution.mjs';

const WHATSAPP_CLICK_RATE_LIMIT = {
  scope: 'analytics-whatsapp-click',
  limit: 120,
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
  const guardResponse = guardMutationRequest(request, WHATSAPP_CLICK_RATE_LIMIT);
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
    const payload = normalizeWhatsAppClickPayload(body, new Date().toISOString());

    if (!shouldTrackWhatsAppClick(payload)) {
      return NextResponse.json({
        status: 'ignored',
        message: 'Clic WhatsApp admin ignoré.',
        data: null
      });
    }

    const { data, error } = await supabase
      .from('whatsapp_click_events')
      .insert(payload)
      .select([
        'id',
        'clicked_at',
        'event_label',
        'page_path'
      ].join(','))
      .single();

    if (error) {
      console.error('[analytics][whatsapp-click] insert failed:', error);
      return getErrorResponse('database_error', 'Impossible d’enregistrer le clic WhatsApp.', 500);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Clic WhatsApp enregistré.',
      data
    });
  } catch (error) {
    console.error('[analytics][whatsapp-click] unexpected error:', error);
    return getErrorResponse('unexpected_error', 'Erreur lors de l’enregistrement du clic WhatsApp.', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
