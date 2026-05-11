import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import {
  normalizeWhatsAppClickPayload,
  shouldTrackWhatsAppClick
} from '@/libs/whatsappAttribution.mjs';
import {
  DEFAULT_WHATSAPP_PHONE_NUMBER,
  SESSION_ATTRIBUTION_COOKIE_KEY,
  buildWhatsAppDestinationUrl,
  extractGaClientIdFromGaCookie,
  getHostnameFromUrl,
  getPathFromUrl,
  getPathnameFromUrl,
  normalizeWhatsAppPhoneNumber,
  parseSessionAttributionCookie
} from '@/libs/whatsappTracking.mjs';

function buildRedirectResponse(url) {
  const response = NextResponse.redirect(url, { status: 307 });
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const cleanPhoneNumber = normalizeWhatsAppPhoneNumber(
    searchParams.get('phone'),
    DEFAULT_WHATSAPP_PHONE_NUMBER
  );
  const cleanMessage = String(searchParams.get('text') || '');
  const destinationUrl = buildWhatsAppDestinationUrl({
    phoneNumber: cleanPhoneNumber,
    message: cleanMessage
  });

  const requestReferrer = request.headers.get('referer') || request.headers.get('referrer') || '';
  const sessionAttribution = parseSessionAttributionCookie(
    request.cookies.get(SESSION_ATTRIBUTION_COOKIE_KEY)?.value || ''
  );
  const clickPayload = normalizeWhatsAppClickPayload({
    ga_client_id: extractGaClientIdFromGaCookie(request.cookies.get('_ga')?.value || ''),
    event_label: searchParams.get('label') || 'unknown',
    page_path: searchParams.get('pagePath') || getPathFromUrl(requestReferrer) || sessionAttribution.landing_page || '/',
    landing_page: searchParams.get('landingPage') || sessionAttribution.landing_page || getPathnameFromUrl(requestReferrer) || '/',
    session_source: sessionAttribution.source,
    session_medium: sessionAttribution.medium,
    session_campaign: sessionAttribution.campaign,
    referrer_host: sessionAttribution.referrer_host || getHostnameFromUrl(requestReferrer)
  }, new Date().toISOString());

  if (shouldTrackWhatsAppClick(clickPayload)) {
    try {
      const supabase = createServiceClient();
      const { error } = await supabase
        .from('whatsapp_click_events')
        .insert(clickPayload);

      if (error) {
        console.error('[outbound][whatsapp] insert failed:', error);
      }
    } catch (error) {
      console.error('[outbound][whatsapp] tracking failed:', error);
    }
  }

  return buildRedirectResponse(destinationUrl);
}
