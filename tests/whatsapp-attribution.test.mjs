import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WHATSAPP_MATCH_WINDOW_DAYS,
  buildWhatsAppManualTagPatch,
  getWhatsAppAttributionMode,
  isWithinWhatsAppMatchWindow,
  matchesWhatsAppFilter,
  normalizeWhatsAppClickPayload,
  pickLatestEligibleWhatsAppClick
} from '../src/libs/whatsappAttribution.mjs';

test('normalizeWhatsAppClickPayload keeps only safe WhatsApp attribution fields', () => {
  const payload = normalizeWhatsAppClickPayload({
    gaClientId: '123.456',
    eventLabel: 'home_hero_whatsapp_main',
    pagePath: '/contact?utm_source=whatsapp',
    sessionSource: 'instagram',
    sessionMedium: 'social',
    sessionCampaign: 'bio_link',
    referrerHost: 'instagram.com',
    email: 'sensitive@example.com',
    linkDestination: 'https://wa.me/21698557766?text=Bonjour'
  }, '2026-05-07T12:00:00.000Z');

  assert.deepEqual(payload, {
    ga_client_id: '123.456',
    event_label: 'home_hero_whatsapp_main',
    page_path: '/contact?utm_source=whatsapp',
    landing_page: '/contact?utm_source=whatsapp',
    session_source: 'instagram',
    session_medium: 'social',
    session_campaign: 'bio_link',
    referrer_host: 'instagram.com',
    clicked_at: '2026-05-07T12:00:00.000Z'
  });
});

test('pickLatestEligibleWhatsAppClick returns the latest click inside the 30 day match window', () => {
  const leadCreatedAt = '2026-05-07T12:00:00.000Z';
  const matchedClick = pickLatestEligibleWhatsAppClick([
    {
      id: 'too-old',
      clicked_at: '2026-04-01T09:00:00.000Z',
      event_label: 'old',
      page_path: '/'
    },
    {
      id: 'eligible-1',
      clicked_at: '2026-05-01T09:00:00.000Z',
      event_label: 'home',
      page_path: '/'
    },
    {
      id: 'eligible-2',
      clicked_at: '2026-05-06T08:30:00.000Z',
      event_label: 'sticky',
      page_path: '/contact'
    },
    {
      id: 'future',
      clicked_at: '2026-05-08T08:30:00.000Z',
      event_label: 'future',
      page_path: '/contact'
    }
  ], leadCreatedAt);

  assert.equal(WHATSAPP_MATCH_WINDOW_DAYS, 30);
  assert.equal(isWithinWhatsAppMatchWindow('2026-04-07T12:00:00.000Z', leadCreatedAt), true);
  assert.equal(isWithinWhatsAppMatchWindow('2026-04-06T11:59:59.000Z', leadCreatedAt), false);
  assert.equal(matchedClick?.id, 'eligible-2');
});

test('manual tag patch and filter matching distinguish auto, manual, both, and none', () => {
  const autoLead = { whatsapp_click_id: 'wa-1' };
  const manualLead = { whatsapp_manual_tag: true };
  const bothLead = { whatsapp_click_id: 'wa-1', whatsapp_manual_tag: true };
  const noneLead = {};

  assert.deepEqual(buildWhatsAppManualTagPatch(true, '2026-05-07T12:00:00.000Z'), {
    whatsapp_manual_tag: true,
    whatsapp_manual_tagged_at: '2026-05-07T12:00:00.000Z'
  });
  assert.equal(getWhatsAppAttributionMode(autoLead), 'auto');
  assert.equal(getWhatsAppAttributionMode(manualLead), 'manual');
  assert.equal(getWhatsAppAttributionMode(bothLead), 'auto_manual');
  assert.equal(getWhatsAppAttributionMode(noneLead), 'none');
  assert.equal(matchesWhatsAppFilter(autoLead, 'auto'), true);
  assert.equal(matchesWhatsAppFilter(manualLead, 'auto'), false);
  assert.equal(matchesWhatsAppFilter(bothLead, 'manual'), true);
  assert.equal(matchesWhatsAppFilter(noneLead, 'none'), true);
});
