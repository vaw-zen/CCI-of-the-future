import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStage3ReadinessAudit,
  mergeLeadMarkerRows,
  STAGE3_ARTIFACT_SPECS
} from '../src/libs/stage3ReadinessAudit.mjs';

const NOW_ISO = '2026-05-14T12:00:00.000Z';

function buildArtifacts(overrides = {}) {
  return STAGE3_ARTIFACT_SPECS.map((spec) => ({
    ...spec,
    latestValue: overrides[spec.key]?.latestValue || (
      spec.key === 'growth_query_daily_metrics' || spec.key === 'growth_landing_page_scores_daily'
        ? '2026-05-13'
        : '2026-05-14'
    ),
    recentRowCount: overrides[spec.key]?.recentRowCount ?? 12
  }));
}

function buildLead(overrides = {}) {
  return {
    lead_kind: overrides.lead_kind || 'devis',
    id: overrides.id || 'lead-1',
    created_at: overrides.created_at || '2026-05-13T09:00:00.000Z',
    ga_client_id: Object.prototype.hasOwnProperty.call(overrides, 'ga_client_id')
      ? overrides.ga_client_id
      : 'GA1.2.111.222',
    landing_page: Object.prototype.hasOwnProperty.call(overrides, 'landing_page')
      ? overrides.landing_page
      : '/devis',
    normalized_landing_page: Object.prototype.hasOwnProperty.call(overrides, 'normalized_landing_page')
      ? overrides.normalized_landing_page
      : '/devis',
    business_line: overrides.business_line || 'b2c',
    primary_service: overrides.primary_service || 'salon',
    source_class: overrides.source_class || 'organic_search',
    page_type: overrides.page_type || 'quote',
    isControlledTest: overrides.isControlledTest || false
  };
}

function buildBehaviorEvent(overrides = {}) {
  return {
    id: overrides.id || 'event-1',
    occurred_at: overrides.occurred_at || '2026-05-13T08:30:00.000Z',
    event_name: overrides.event_name || 'funnel_step',
    step_name: overrides.step_name || 'submit_success',
    form_name: overrides.form_name || 'devis_form',
    cta_id: overrides.cta_id || null,
    contact_method: overrides.contact_method || 'form',
    ga_client_id: overrides.ga_client_id ?? 'GA1.2.111.222',
    landing_page: overrides.landing_page || '/devis',
    session_source: overrides.session_source || 'google',
    session_medium: overrides.session_medium || 'organic',
    session_campaign: overrides.session_campaign || '(not set)',
    business_line: overrides.business_line || 'b2c',
    service_type: overrides.service_type || 'salon',
    metadata: overrides.metadata || {}
  };
}

test('mergeLeadMarkerRows flags stage 3 test submissions from raw lead markers', () => {
  const merged = mergeLeadMarkerRows(
    [
      {
        lead_kind: 'devis',
        id: 'lead-1',
        created_at: '2026-05-13T09:00:00.000Z'
      }
    ],
    [
      {
        lead_kind: 'devis',
        id: 'lead-1',
        nom: '[STAGE3 TEST] QA',
        prenom: 'User',
        email: 'qa@example.com',
        message: 'Controlled validation'
      }
    ]
  );

  assert.equal(merged[0].isControlledTest, true);
});

test('buildStage3ReadinessAudit returns insufficient evidence and excludes legacy leads', () => {
  const summary = buildStage3ReadinessAudit({
    baselineDate: '2026-05-12T00:00:00+01:00',
    nowIso: NOW_ISO,
    artifacts: buildArtifacts(),
    behaviorEvents: [],
    leads: [
      buildLead({
        id: 'legacy-lead',
        created_at: '2026-04-22T13:38:21.638Z',
        ga_client_id: null,
        landing_page: null,
        normalized_landing_page: '/'
      })
    ]
  });

  assert.equal(summary.status, 'insufficient_evidence');
  assert.deepEqual(summary.legacyExcludedLeadIds, ['devis:legacy-lead']);
  assert.equal(summary.postBaselineLeads.total, 0);
  assert.equal(summary.terminalOutcomes.submitSuccesses, 0);
});

test('buildStage3ReadinessAudit fails when a critical mart is stale', () => {
  const summary = buildStage3ReadinessAudit({
    baselineDate: '2026-05-12T00:00:00+01:00',
    nowIso: NOW_ISO,
    artifacts: buildArtifacts({
      growth_behavior_daily_metrics: {
        latestValue: '2026-05-11'
      }
    }),
    behaviorEvents: [
      buildBehaviorEvent({
        event_name: 'form_validation_failed',
        step_name: null
      })
    ],
    leads: [
      buildLead({
        id: 'controlled-lead',
        isControlledTest: true,
        ga_client_id: null,
        landing_page: null,
        normalized_landing_page: '/'
      })
    ]
  });

  assert.equal(summary.status, 'fail');
  assert.equal(summary.freshness.artifacts.find((artifact) => artifact.key === 'growth_behavior_daily_metrics')?.status, 'fail');
});

test('buildStage3ReadinessAudit passes with fresh marts, controlled validation, and matched organic leads', () => {
  const leads = [
    buildLead({
      id: 'controlled-lead',
      isControlledTest: true,
      ga_client_id: 'GA1.2.100.100'
    }),
    buildLead({
      id: 'organic-1',
      ga_client_id: 'GA1.2.200.200'
    }),
    buildLead({
      id: 'organic-2',
      ga_client_id: 'GA1.2.300.300',
      created_at: '2026-05-13T11:00:00.000Z'
    }),
    buildLead({
      id: 'organic-3',
      ga_client_id: 'GA1.2.400.400',
      created_at: '2026-05-14T09:30:00.000Z'
    })
  ];

  const behaviorEvents = [
    buildBehaviorEvent({
      id: 'validation',
      event_name: 'form_validation_failed',
      step_name: null,
      ga_client_id: 'GA1.2.100.100',
      metadata: {
        stage3_test: true
      }
    }),
    buildBehaviorEvent({
      id: 'controlled-success',
      ga_client_id: 'GA1.2.100.100',
      metadata: {
        stage3_test: true
      }
    }),
    buildBehaviorEvent({
      id: 'organic-success-1',
      ga_client_id: 'GA1.2.200.200'
    }),
    buildBehaviorEvent({
      id: 'organic-success-2',
      ga_client_id: 'GA1.2.300.300',
      occurred_at: '2026-05-13T10:30:00.000Z'
    }),
    buildBehaviorEvent({
      id: 'organic-success-3',
      ga_client_id: 'GA1.2.400.400',
      occurred_at: '2026-05-14T09:00:00.000Z'
    })
  ];

  const summary = buildStage3ReadinessAudit({
    baselineDate: '2026-05-12T00:00:00+01:00',
    nowIso: NOW_ISO,
    artifacts: buildArtifacts(),
    behaviorEvents,
    joinBehaviorEvents: behaviorEvents,
    leads
  });

  assert.equal(summary.status, 'pass');
  assert.equal(summary.postBaselineLeads.organicCount, 3);
  assert.equal(summary.joinability.controlledJoinKeyRate, 100);
  assert.equal(summary.joinability.organicBehaviorMatchRate, 100);
  assert.equal(summary.terminalOutcomes.submitSuccesses, 4);
  assert.equal(summary.terminalOutcomes.formValidationFailed, 1);
});
