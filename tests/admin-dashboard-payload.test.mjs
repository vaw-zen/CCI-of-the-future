import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdminDashboardData, getDashboardRange } from '../src/libs/adminDashboardMetrics.mjs';

test('dashboard payload exposes sectioned contract and data-health fallbacks', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-07' });
  const data = buildAdminDashboardData({
    currentRows: {
      devis: [],
      conventions: []
    },
    previousRows: {
      devis: [],
      conventions: []
    },
    universeRows: {
      devis: [],
      conventions: []
    },
    externalMetricRows: [],
    sourceHealthRows: [],
    auditEvents: [],
    range: rangeResult.range,
    nowIso: '2026-05-07T06:00:00.000Z'
  });

  assert.ok(data.overview);
  assert.ok(data.pipeline);
  assert.ok(data.acquisition);
  assert.ok(data.seoContent);
  assert.ok(data.operations);
  assert.ok(data.dataHealth);
  assert.equal(data.operations.recentActivityLabel, 'Activité lifecycle récente (globale)');
  assert.equal(data.dataHealth.items.find((item) => item.key === 'supabase_live')?.status, 'fresh');
  assert.equal(data.dataHealth.items.find((item) => item.key === 'ga4')?.status, 'missing');
  assert.equal(data.dataHealth.items.find((item) => item.key === 'search_console')?.status, 'missing');
});
