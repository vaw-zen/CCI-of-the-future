import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppDirectLeadInsert,
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

test('matchesWhatsAppDirectPhone ignores spaces and punctuation when filtering by phone', () => {
  assert.equal(matchesWhatsAppDirectPhone('+216 20 000 002', '20000002'), true);
  assert.equal(matchesWhatsAppDirectPhone('+216 20 000 002', '333'), false);
});
