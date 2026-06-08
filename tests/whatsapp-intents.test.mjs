import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildUnclaimedWhatsAppIntents,
  collectClaimedWhatsAppClickIds
} from '../src/libs/whatsappIntents.mjs';

test('collectClaimedWhatsAppClickIds merges click ids from multiple lead tables', () => {
  const claimedIds = collectClaimedWhatsAppClickIds(
    [{ whatsapp_click_id: 'wa-1' }, { whatsapp_click_id: null }],
    [{ whatsapp_click_id: 'wa-2' }],
    [{ whatsapp_click_id: 'wa-3' }]
  );

  assert.deepEqual(Array.from(claimedIds).sort(), ['wa-1', 'wa-2', 'wa-3']);
});

test('buildUnclaimedWhatsAppIntents excludes already claimed clicks and sorts newest first', () => {
  const intents = buildUnclaimedWhatsAppIntents([
    {
      id: 'admin-1',
      clicked_at: '2026-05-11T11:00:00.000Z',
      event_label: 'sticky_header_whatsapp',
      page_path: '/admin/dashboard',
      landing_page: '/admin/dashboard',
      session_source: 'direct',
      session_medium: '(none)',
      session_campaign: '(not set)'
    },
    {
      id: 'wa-1',
      clicked_at: '2026-05-11T09:00:00.000Z',
      event_label: 'sticky_header_whatsapp',
      page_path: '/contact',
      landing_page: '/contact',
      session_source: 'direct',
      session_medium: '(none)',
      session_campaign: '(not set)'
    },
    {
      id: 'wa-2',
      clicked_at: '2026-05-11T10:00:00.000Z',
      event_label: 'home_hero_whatsapp_main',
      page_path: '/',
      landing_page: '/',
      session_source: 'google',
      session_medium: 'organic',
      session_campaign: '(not set)'
    }
  ], new Set(['wa-1']));

  assert.equal(intents.length, 1);
  assert.equal(intents[0]?.id, 'wa-2');
  assert.equal(intents[0]?.eventLabel, 'home_hero_whatsapp_main');
  assert.equal(intents[0]?.sessionSource, 'google');
  assert.equal(intents[0]?.attributionDiagnosisKey, 'attributed_session');
  assert.equal(intents[0]?.attributionDiagnosisLabel, 'Source capturée');
  assert.equal(intents[0]?.isFallbackDirect, false);
});

test('buildUnclaimedWhatsAppIntents marks root direct clicks without referrer as fallback direct', () => {
  const [intent] = buildUnclaimedWhatsAppIntents([
    {
      id: 'wa-1',
      clicked_at: '2026-06-08T14:30:00.000Z',
      event_label: 'sticky_header_whatsapp',
      page_path: '/',
      landing_page: '/',
      session_source: 'direct',
      session_medium: '(none)',
      session_campaign: '(not set)',
      referrer_host: null
    }
  ], new Set());

  assert.equal(intent?.attributionDiagnosisKey, 'fallback_direct_missing_context');
  assert.equal(intent?.attributionDiagnosisLabel, 'Fallback direct');
  assert.equal(intent?.isFallbackDirect, true);
});

test('buildUnclaimedWhatsAppIntents marks direct clicks with preserved page context as true direct', () => {
  const [intent] = buildUnclaimedWhatsAppIntents([
    {
      id: 'wa-1',
      clicked_at: '2026-06-08T15:31:00.000Z',
      event_label: 'sticky_header_whatsapp',
      page_path: '/conseils/tarif-nettoyage-tapis-tunis-2025',
      landing_page: '/conseils/tarif-nettoyage-tapis-tunis-2025',
      session_source: 'direct',
      session_medium: '(none)',
      session_campaign: '(not set)',
      referrer_host: null
    }
  ], new Set());

  assert.equal(intent?.attributionDiagnosisKey, 'true_direct');
  assert.equal(intent?.attributionDiagnosisLabel, 'True direct');
  assert.equal(intent?.isFallbackDirect, false);
});
