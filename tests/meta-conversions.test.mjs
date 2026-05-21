import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMetaLeadConversionPayload,
  createMetaLeadEventId
} from '../src/libs/metaConversions.mjs';

test('createMetaLeadEventId returns a stable prefixed identifier', () => {
  const eventId = createMetaLeadEventId('devis_lead');
  assert.match(eventId, /^devis_lead_[0-9a-f-]+$/);
});

test('buildMetaLeadConversionPayload shapes a Meta Lead event with hashed user data', () => {
  const payload = buildMetaLeadConversionPayload({
    leadKind: 'devis',
    leadRecord: {
      id: 'lead_1',
      prenom: 'Jane',
      nom: 'Doe',
      email: 'jane@example.com',
      telephone: '+21611222333',
      meta_fbc: 'fb.1.123.click',
      meta_fbp: 'fb.1.123.browser',
      meta_platform: 'facebook',
      session_source: 'facebook',
      session_medium: 'cpc',
      session_campaign: 'meta_ads_launch'
    },
    analyticsContext: {
      business_line: 'b2c',
      service_type: 'salon',
      page_location: 'https://cciservices.online/contact?utm_source=facebook'
    },
    request: {
      headers: {
        get(name) {
          if (name === 'user-agent') return 'Mozilla/5.0';
          if (name === 'x-forwarded-for') return '203.0.113.10';
          return '';
        }
      }
    },
    eventId: 'devis_lead_test'
  });

  assert.equal(payload.event_id, 'devis_lead_test');
  assert.equal(payload.event_name, 'Lead');
  assert.equal(payload.action_source, 'website');
  assert.equal(payload.user_data.fbc, 'fb.1.123.click');
  assert.equal(payload.user_data.fbp, 'fb.1.123.browser');
  assert.equal(payload.custom_data.meta_platform, 'facebook');
  assert.equal(payload.custom_data.business_line, 'b2c');
});
