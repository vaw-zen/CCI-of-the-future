import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildServerTerminalBehaviorPayload,
  persistServerTerminalBehaviorEvent
} from '../src/libs/behaviorTrackingServer.mjs';

function createFakeSupabaseRecorder() {
  const calls = [];

  return {
    calls,
    from(table) {
      assert.equal(table, 'growth_behavior_events');

      return {
        insert(payload) {
          calls.push(payload);

          return {
            select() {
              return {
                async single() {
                  return {
                    data: {
                      id: 'behavior-event-1',
                      occurred_at: payload.occurred_at,
                      event_name: payload.event_name,
                      step_name: payload.step_name,
                      form_name: payload.form_name,
                      business_line: payload.business_line
                    },
                    error: null
                  };
                }
              };
            }
          };
        }
      };
    }
  };
}

test('buildServerTerminalBehaviorPayload normalizes canonical submit-success events', () => {
  const payload = buildServerTerminalBehaviorPayload({
    rawEventName: 'checkout_progress',
    analyticsContext: {
      ga_client_id: 'GA1.2.123.456',
      landing_page: '/devis',
      entry_path: '/devis?utm_source=google',
      session_source: 'google',
      session_medium: 'organic',
      session_campaign: '(not set)'
    },
    formName: 'devis_form',
    formPlacement: 'devis_page',
    funnelName: 'quote_request',
    businessLine: 'b2c',
    serviceType: 'salon',
    leadType: 'quote_request',
    occurredAt: '2026-05-14T10:30:00.000Z',
    additionalPayload: {
      lead_id: 'lead-123',
      lead_kind: 'devis',
      step_name: 'submit_success',
      step_number: 3,
      stage3_test: true
    }
  });

  assert.equal(payload?.transport_event_name, 'checkout_progress');
  assert.equal(payload?.event_name, 'funnel_step');
  assert.equal(payload?.step_name, 'submit_success');
  assert.equal(payload?.step_number, 3);
  assert.equal(payload?.form_name, 'devis_form');
  assert.equal(payload?.form_placement, 'devis_page');
  assert.equal(payload?.funnel_name, 'quote_request');
  assert.equal(payload?.business_line, 'b2c');
  assert.equal(payload?.service_type, 'salon');
  assert.equal(payload?.ga_client_id, 'GA1.2.123.456');
  assert.equal(payload?.metadata.lead_id, 'lead-123');
  assert.equal(payload?.metadata.stage3_test, true);
});

test('persistServerTerminalBehaviorEvent inserts normalized behavior rows through Supabase', async () => {
  const fakeSupabase = createFakeSupabaseRecorder();

  const result = await persistServerTerminalBehaviorEvent({
    supabase: fakeSupabase,
    rawEventName: 'form_submit_failed',
    analyticsContext: {
      ga_client_id: 'GA1.2.999.888',
      landing_page: '/entreprises',
      entry_path: '/entreprises',
      session_source: 'direct',
      session_medium: '(none)',
      session_campaign: '(not set)'
    },
    formName: 'convention_form',
    formPlacement: 'entreprises_page',
    funnelName: 'convention_request',
    businessLine: 'b2b',
    serviceType: 'convention',
    leadType: 'convention_request',
    occurredAt: '2026-05-14T11:00:00.000Z',
    additionalPayload: {
      failure_type: 'database_error'
    }
  });

  assert.equal(result.persisted, true);
  assert.equal(fakeSupabase.calls.length, 1);
  assert.equal(fakeSupabase.calls[0].transport_event_name, 'form_submit_failed');
  assert.equal(fakeSupabase.calls[0].event_name, 'submit_failed');
  assert.equal(fakeSupabase.calls[0].form_name, 'convention_form');
  assert.equal(fakeSupabase.calls[0].business_line, 'b2b');
  assert.equal(fakeSupabase.calls[0].metadata.failure_type, 'database_error');
});
