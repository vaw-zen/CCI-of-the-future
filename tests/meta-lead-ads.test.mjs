import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMetaLeadAdAutoCreateCandidate,
  buildMetaLeadAdSubmissionRow,
  normalizeMetaLeadWebhookEntries
} from '../src/libs/metaLeadAds.mjs';

test('normalizeMetaLeadWebhookEntries extracts leadgen notifications from webhook payloads', () => {
  const entries = normalizeMetaLeadWebhookEntries({
    entry: [
      {
        id: 'page_1',
        changes: [
          {
            field: 'leadgen',
            value: {
              leadgen_id: 'leadgen_1',
              form_id: 'form_1',
              page_id: 'page_1'
            }
          }
        ]
      }
    ]
  });

  assert.equal(entries.length, 1);
  assert.equal(entries[0].leadgen_id, 'leadgen_1');
  assert.equal(entries[0].form_id, 'form_1');
});

test('buildMetaLeadAdSubmissionRow normalizes core Lead Ads intake fields', () => {
  const row = buildMetaLeadAdSubmissionRow({
    leadgen_id: 'leadgen_1',
    form_id: 'form_1',
    page_id: 'page_1',
    platform: 'instagram',
    campaign_id: 'cmp_1',
    campaign_name: 'Lead Ad Campaign',
    field_data: [
      { name: 'full_name', values: ['Jane Doe'] },
      { name: 'email', values: ['jane@example.com'] },
      { name: 'phone_number', values: ['+216 11 222 333'] }
    ]
  });

  assert.equal(row.meta_leadgen_id, 'leadgen_1');
  assert.equal(row.meta_platform, 'instagram');
  assert.equal(row.session_source, 'instagram');
  assert.equal(row.session_medium, 'paid_social');
  assert.equal(row.contact_name, 'Jane Doe');
  assert.equal(row.email, 'jane@example.com');
});

test('buildMetaLeadAdAutoCreateCandidate only creates mapped devis leads when required fields are complete', () => {
  const candidate = buildMetaLeadAdAutoCreateCandidate({
    meta_platform: 'facebook',
    meta_leadgen_id: 'leadgen_1',
    meta_form_id: 'form_1',
    session_source: 'facebook',
    session_medium: 'paid_social',
    session_campaign: 'lead_ad_campaign',
    field_payload: {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      telephone: '+216 11 222 333',
      adresse: 'Rue de Test',
      ville: 'Tunis',
      type_service: 'salon'
    }
  }, {
    target_kind: 'devis',
    auto_create_enabled: true,
    default_service_type: 'salon'
  });

  assert.equal(candidate.mappingStatus, 'mapped_ready');
  assert.equal(candidate.targetKind, 'devis');
  assert.equal(candidate.insertValues.meta_lead_source, 'lead_ad');
  assert.equal(candidate.insertValues.type_service, 'salon');
});
