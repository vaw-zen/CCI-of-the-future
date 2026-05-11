import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppDirectLeadInsert,
  getWhatsAppDirectLeadAttributionLabel,
  isMissingWhatsAppDirectLeadSchemaError,
  matchesWhatsAppDirectPhone,
  validateWhatsAppDirectLeadPayload
} from '../src/libs/whatsappDirectLeads.mjs';

test('validateWhatsAppDirectLeadPayload accepts required direct whatsapp lead fields', () => {
  const validation = validateWhatsAppDirectLeadPayload({
    businessLine: 'b2c',
    contactName: 'Client WhatsApp',
    telephone: '+216 11 222 333',
    leadCapturedAt: '2026-05-11T08:30:00.000Z',
    leadStatus: 'submitted'
  });

  assert.equal(validation.ok, true);
  assert.equal(validation.data.businessLine, 'b2c');
  assert.equal(validation.data.contactName, 'Client WhatsApp');
  assert.equal(validation.data.telephone, '+216 11 222 333');
  assert.equal(validation.data.leadCapturedAt, '2026-05-11T08:30:00.000Z');
});

test('validateWhatsAppDirectLeadPayload requires a company name for b2b direct whatsapp leads', () => {
  const validation = validateWhatsAppDirectLeadPayload({
    businessLine: 'b2b',
    contactName: 'Contact B2B',
    telephone: '+216 22 333 444',
    leadCapturedAt: '2026-05-11T08:30:00.000Z'
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.error, 'missing_company_name');
});

test('buildWhatsAppDirectLeadInsert backdates lifecycle timestamps from lead_captured_at and defaults follow-up SLA to scheduled_at', () => {
  const buildResult = buildWhatsAppDirectLeadInsert({
    businessLine: 'b2b',
    contactName: 'Inspection 7h',
    companyName: 'Inspection SARL',
    telephone: '+216 20 000 002',
    email: 'ops@example.com',
    serviceKey: 'bureau',
    leadCapturedAt: '2026-05-10T07:00:00.000Z',
    scheduledType: 'inspection',
    scheduledAt: '2026-05-12T07:00:00.000Z',
    leadStatus: 'qualified'
  }, '2026-05-11T10:00:00.000Z');

  assert.equal(buildResult.ok, true);
  assert.deepEqual(buildResult.data, {
    lead_captured_at: '2026-05-10T07:00:00.000Z',
    business_line: 'b2b',
    contact_name: 'Inspection 7h',
    company_name: 'Inspection SARL',
    telephone: '+216 20 000 002',
    email: 'ops@example.com',
    service_key: 'bureau',
    notes: null,
    scheduled_type: 'inspection',
    scheduled_at: '2026-05-12T07:00:00.000Z',
    lead_status: 'qualified',
    lead_quality_outcome: 'sales_accepted',
    lead_owner: null,
    submitted_at: '2026-05-10T07:00:00.000Z',
    qualified_at: '2026-05-10T07:00:00.000Z',
    closed_at: null,
    follow_up_sla_at: '2026-05-12T07:00:00.000Z',
    last_worked_at: '2026-05-10T07:00:00.000Z',
    session_source: 'whatsapp',
    session_medium: 'messaging',
    session_campaign: 'direct_chat',
    referrer_host: null,
    landing_page: null,
    entry_path: null,
    whatsapp_manual_tag: true,
    whatsapp_manual_tagged_at: '2026-05-11T10:00:00.000Z'
  });
});

test('buildWhatsAppDirectLeadInsert preserves source and click metadata when converting a site intent', () => {
  const buildResult = buildWhatsAppDirectLeadInsert({
    businessLine: 'b2c',
    contactName: 'Client site WhatsApp',
    telephone: '+216 98 765 432',
    leadCapturedAt: '2026-05-11T08:45:00.000Z',
    leadStatus: 'submitted',
    sessionSource: 'google',
    sessionMedium: 'organic',
    sessionCampaign: '(not set)',
    referrerHost: 'google.com',
    landingPage: '/salon',
    entryPath: '/salon',
    whatsappClickId: '11111111-1111-4111-8111-111111111111',
    whatsappClickedAt: '2026-05-11T08:45:00.000Z',
    whatsappClickLabel: 'home_hero_whatsapp_main',
    whatsappClickPage: '/salon'
  }, '2026-05-11T10:00:00.000Z');

  assert.equal(buildResult.ok, true);
  assert.equal(buildResult.data.session_source, 'google');
  assert.equal(buildResult.data.session_medium, 'organic');
  assert.equal(buildResult.data.referrer_host, 'google.com');
  assert.equal(buildResult.data.whatsapp_click_id, '11111111-1111-4111-8111-111111111111');
  assert.equal(buildResult.data.whatsapp_click_label, 'home_hero_whatsapp_main');
  assert.equal(buildResult.data.whatsapp_click_page, '/salon');
});

test('matchesWhatsAppDirectPhone ignores spaces and punctuation when filtering by phone', () => {
  assert.equal(matchesWhatsAppDirectPhone('+216 20 000 002', '20000002'), true);
  assert.equal(matchesWhatsAppDirectPhone('+216 20 000 002', '333'), false);
});

test('getWhatsAppDirectLeadAttributionLabel distinguishes manual leads from converted site intents', () => {
  assert.equal(getWhatsAppDirectLeadAttributionLabel({}), 'Manuel (direct chat)');
  assert.equal(getWhatsAppDirectLeadAttributionLabel({
    whatsapp_click_id: '11111111-1111-4111-8111-111111111111'
  }), 'Intent site converti');
});

test('isMissingWhatsAppDirectLeadSchemaError recognizes missing-table responses from Postgres and PostgREST', () => {
  assert.equal(isMissingWhatsAppDirectLeadSchemaError({
    code: '42P01',
    message: 'relation "public.whatsapp_direct_leads" does not exist'
  }), true);

  assert.equal(isMissingWhatsAppDirectLeadSchemaError({
    code: 'PGRST205',
    message: 'Could not find the table public.whatsapp_direct_leads in the schema cache'
  }), true);

  assert.equal(isMissingWhatsAppDirectLeadSchemaError({
    code: '42703',
    message: 'column whatsapp_direct_leads.foo does not exist'
  }), false);
});
