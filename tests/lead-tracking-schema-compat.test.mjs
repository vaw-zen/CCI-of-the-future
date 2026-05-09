import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEAD_OPERATIONS_MIGRATION_HINT,
  WHATSAPP_TRACKING_MIGRATION_HINT,
  resetLeadTrackingSchemaCompatWarningsForTests,
  runLeadSelectWithOptionalTrackingFallback,
  withoutOptionalLeadOperationFields,
  withoutOptionalLeadTrackingFields
} from '../src/libs/leadTrackingSchemaCompat.mjs';

function createSupabaseStub() {
  return {
    from(table) {
      return {
        table,
        select(selectClause) {
          return {
            table,
            selectClause
          };
        }
      };
    }
  };
}

test('withoutOptionalLeadTrackingFields removes optional WhatsApp and lead-operations columns from a select clause', () => {
  const selectClause = [
    'id',
    'created_at',
    'landing_page',
    'whatsapp_click_id',
    'whatsapp_clicked_at',
    'lead_quality_outcome',
    'lead_owner',
    'follow_up_sla_at',
    'last_worked_at',
    'session_source',
    'whatsapp_manual_tag'
  ].join(',');

  const strippedSelect = withoutOptionalLeadTrackingFields(selectClause);

  assert.equal(strippedSelect, 'id,created_at,landing_page,session_source');
});

test('withoutOptionalLeadOperationFields strips operational-only write fields from a payload', () => {
  const strippedPayload = withoutOptionalLeadOperationFields({
    lead_quality_outcome: 'sales_accepted',
    lead_owner: 'ops@cciservices.online',
    follow_up_sla_at: '2026-05-10T08:00:00.000Z',
    last_worked_at: '2026-05-09T08:00:00.000Z',
    submitted_at: '2026-05-09T07:00:00.000Z',
    session_source: 'google'
  });

  assert.deepEqual(strippedPayload, {
    submitted_at: '2026-05-09T07:00:00.000Z',
    session_source: 'google'
  });
});

test('runLeadSelectWithOptionalTrackingFallback retries with a legacy select and logs only once per channel/table', async () => {
  resetLeadTrackingSchemaCompatWarningsForTests();

  const warnMessages = [];
  const supabase = createSupabaseStub();
  const seenSelects = [];

  const runQuery = async () => runLeadSelectWithOptionalTrackingFallback({
    supabase,
    table: 'devis_requests',
    select: 'id,landing_page,whatsapp_click_id,whatsapp_manual_tag',
    channel: 'dashboard',
    warn: (message) => warnMessages.push(message),
    applyQuery: async (query) => {
      seenSelects.push(query.selectClause);

      if (seenSelects.length % 2 === 1) {
        return {
          data: null,
          error: {
            code: '42703',
            message: 'column devis_requests.whatsapp_click_id does not exist'
          }
        };
      }

      return {
        data: [{ id: 'lead-1' }],
        error: null
      };
    }
  });

  const firstResult = await runQuery();
  const secondResult = await runQuery();

  assert.deepEqual(firstResult.data, [{ id: 'lead-1' }]);
  assert.deepEqual(secondResult.data, [{ id: 'lead-1' }]);
  assert.deepEqual(seenSelects, [
    'id,landing_page,whatsapp_click_id,whatsapp_manual_tag',
    'id,landing_page',
    'id,landing_page,whatsapp_click_id,whatsapp_manual_tag',
    'id,landing_page'
  ]);
  assert.equal(warnMessages.length, 1);
  assert.match(warnMessages[0], /\[admin\]\[dashboard\] using legacy lead select for devis_requests/);
  assert.match(warnMessages[0], new RegExp(WHATSAPP_TRACKING_MIGRATION_HINT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  resetLeadTrackingSchemaCompatWarningsForTests();
});

test('runLeadSelectWithOptionalTrackingFallback also retries when lead operations columns are missing', async () => {
  resetLeadTrackingSchemaCompatWarningsForTests();

  const warnMessages = [];
  const supabase = createSupabaseStub();
  const seenSelects = [];

  const result = await runLeadSelectWithOptionalTrackingFallback({
    supabase,
    table: 'convention_requests',
    select: 'id,landing_page,lead_quality_outcome,lead_owner,follow_up_sla_at,last_worked_at',
    channel: 'lead-status',
    warn: (message) => warnMessages.push(message),
    applyQuery: async (query) => {
      seenSelects.push(query.selectClause);

      if (seenSelects.length === 1) {
        return {
          data: null,
          error: {
            code: '42703',
            message: 'column convention_requests.lead_quality_outcome does not exist'
          }
        };
      }

      return {
        data: [{ id: 'lead-2' }],
        error: null
      };
    }
  });

  assert.deepEqual(result.data, [{ id: 'lead-2' }]);
  assert.deepEqual(seenSelects, [
    'id,landing_page,lead_quality_outcome,lead_owner,follow_up_sla_at,last_worked_at',
    'id,landing_page'
  ]);
  assert.equal(warnMessages.length, 1);
  assert.match(warnMessages[0], /\[admin\]\[lead-status\] using legacy lead select for convention_requests/);
  assert.match(warnMessages[0], new RegExp(LEAD_OPERATIONS_MIGRATION_HINT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  resetLeadTrackingSchemaCompatWarningsForTests();
});
