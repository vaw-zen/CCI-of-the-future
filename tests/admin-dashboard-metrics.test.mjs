import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdminDashboardData,
  buildCombinedChannelPerformance,
  buildLifecycleTrend,
  getDashboardRange
} from '../src/libs/adminDashboardMetrics.mjs';

function buildDevisRow(overrides = {}) {
  return {
    id: overrides.id || 'devis-1',
    created_at: overrides.created_at || '2026-05-01T10:00:00.000Z',
    type_service: overrides.type_service || 'salon',
    lead_status: overrides.lead_status || 'submitted',
    submitted_at: overrides.submitted_at || overrides.created_at || '2026-05-01T10:00:00.000Z',
    qualified_at: overrides.qualified_at || null,
    closed_at: overrides.closed_at || null,
    landing_page: overrides.landing_page || '/salon',
    session_source: overrides.session_source || 'direct',
    session_medium: overrides.session_medium || '(none)',
    session_campaign: overrides.session_campaign || '(not set)',
    referrer_host: overrides.referrer_host || null,
    entry_path: overrides.entry_path || '/salon',
    selected_services: overrides.selected_services || null,
    calculator_estimate: overrides.calculator_estimate || null
  };
}

function buildConventionRow(overrides = {}) {
  return {
    id: overrides.id || 'conv-1',
    created_at: overrides.created_at || '2026-05-03T09:00:00.000Z',
    secteur_activite: overrides.secteur_activite || 'hotel',
    services_souhaites: overrides.services_souhaites || ['hotel', 'clinique'],
    statut: overrides.statut || 'nouveau',
    lead_status: overrides.lead_status || null,
    submitted_at: overrides.submitted_at || overrides.created_at || '2026-05-03T09:00:00.000Z',
    qualified_at: overrides.qualified_at || null,
    closed_at: overrides.closed_at || null,
    landing_page: overrides.landing_page || '/entreprises',
    session_source: overrides.session_source || 'google',
    session_medium: overrides.session_medium || 'organic',
    session_campaign: overrides.session_campaign || '(not set)',
    referrer_host: overrides.referrer_host || 'google.com',
    entry_path: overrides.entry_path || '/entreprises',
    selected_services: overrides.selected_services || null,
    calculator_estimate: overrides.calculator_estimate || null
  };
}

test('dashboard data uses global open leads for stale queue and keeps service breakdown semantics explicit', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-07' });
  assert.equal(rangeResult.ok, true);

  const data = buildAdminDashboardData({
    currentRows: {
      devis: [
        buildDevisRow({
          id: 'devis-current',
          created_at: '2026-05-02T10:00:00.000Z',
          session_source: 'direct',
          session_medium: '(none)',
          calculator_estimate: 120
        })
      ],
      conventions: [
        buildConventionRow({
          id: 'conv-current',
          created_at: '2026-05-04T09:00:00.000Z',
          services_souhaites: ['hotel', 'clinique'],
          statut: 'contacte',
          qualified_at: '2026-05-05T09:00:00.000Z'
        })
      ]
    },
    previousRows: {
      devis: [],
      conventions: []
    },
    universeRows: {
      devis: [
        buildDevisRow({
          id: 'devis-old-open',
          created_at: '2026-04-20T10:00:00.000Z',
          submitted_at: '2026-04-20T10:00:00.000Z',
          session_source: 'facebook',
          session_medium: 'paid_social'
        }),
        buildDevisRow({
          id: 'devis-current',
          created_at: '2026-05-02T10:00:00.000Z',
          session_source: 'direct',
          session_medium: '(none)',
          calculator_estimate: 120
        })
      ],
      conventions: [
        buildConventionRow({
          id: 'conv-current',
          created_at: '2026-05-04T09:00:00.000Z',
          services_souhaites: ['hotel', 'clinique'],
          statut: 'contacte',
          qualified_at: '2026-05-05T09:00:00.000Z'
        })
      ]
    },
    range: rangeResult.range,
    nowIso: '2026-05-07T12:00:00.000Z'
  });

  assert.equal(data.operations.staleQueue.count, 3);
  assert.equal(data.operations.staleQueue.leads.some((lead) => lead.id === 'devis-old-open'), true);
  assert.equal(data.pipeline.notes.serviceBreakdownMode.includes('mentions multi-services'), true);
  assert.equal(data.pipeline.breakdowns.serviceMentions.find((item) => item.key === 'clinique')?.count, 1);
  assert.equal(data.pipeline.breakdowns.primaryService.find((item) => item.key === 'hotel')?.count, 1);
  assert.equal(data.overview.cards.find((card) => card.key === 'unattributed_rate')?.value, 50);
});

test('combined channel performance merges external metrics with current lead cohort', () => {
  const rows = buildCombinedChannelPerformance(
    [
      {
        id: 'lead-1',
        createdAt: '2026-05-01T10:00:00.000Z',
        source: 'google',
        medium: 'organic',
        campaign: '(not set)',
        landingPage: '/marbre',
        status: 'closed_won',
        calculatorEstimate: 350,
        qualifiedAt: '2026-05-02T10:00:00.000Z'
      }
    ],
    [
      {
        metric_date: '2026-05-01',
        metric_source: 'ga4',
        source: 'google',
        medium: 'organic',
        campaign: '(not set)',
        landing_page: '/marbre',
        sessions: 20,
        users: 18,
        clicks: 0,
        impressions: 0,
        spend: 0
      },
      {
        metric_date: '2026-05-01',
        metric_source: 'gsc',
        source: 'google',
        medium: 'organic',
        campaign: '(not set)',
        landing_page: '/marbre',
        clicks: 10,
        impressions: 100,
        sessions: 0,
        users: 0,
        spend: 0
      }
    ]
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].sessions, 20);
  assert.equal(rows[0].clicks, 10);
  assert.equal(rows[0].leads, 1);
  assert.equal(rows[0].qualifiedLeads, 1);
  assert.equal(rows[0].wonLeads, 1);
  assert.equal(rows[0].ctr, 10);
  assert.equal(rows[0].leadRate, 5);
});

test('lifecycle trend counts created, qualified, won, and lost activity independently', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-03' });
  const trend = buildLifecycleTrend([
    {
      createdAt: '2026-05-01T08:00:00.000Z',
      qualifiedAt: '2026-05-02T08:00:00.000Z',
      closedAt: '2026-05-03T08:00:00.000Z',
      status: 'closed_won'
    },
    {
      createdAt: '2026-05-02T08:00:00.000Z',
      qualifiedAt: '2026-05-03T08:00:00.000Z',
      closedAt: '2026-05-03T10:00:00.000Z',
      status: 'closed_lost'
    }
  ], rangeResult.range);

  assert.deepEqual(trend, [
    { date: '2026-05-01', created: 1, qualified: 0, won: 0, lost: 0 },
    { date: '2026-05-02', created: 1, qualified: 1, won: 0, lost: 0 },
    { date: '2026-05-03', created: 0, qualified: 1, won: 1, lost: 1 }
  ]);
});
