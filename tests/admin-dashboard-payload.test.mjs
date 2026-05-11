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
    keywordRankingRows: [],
    sourceHealthRows: [],
    auditEvents: [],
    range: rangeResult.range,
    nowIso: '2026-05-07T06:00:00.000Z'
  });

  assert.ok(data.overview);
  assert.ok(Array.isArray(data.overview.cards));
  assert.equal(typeof data.overview.cards[0]?.canonicalLabel, 'string');
  assert.ok(data.filters);
  assert.ok(data.filters.applied);
  assert.ok(Array.isArray(data.filters.active));
  assert.ok(data.filters.options);
  assert.equal(typeof data.filters.segmentLabel, 'string');
  assert.equal(Array.isArray(data.filters.notes), true);
  assert.ok(data.executiveSummary);
  assert.equal(typeof data.executiveSummary.segmentLabel, 'string');
  assert.equal(typeof data.executiveSummary.trend?.headline, 'string');
  assert.equal(typeof data.executiveSummary.risk?.headline, 'string');
  assert.equal(typeof data.executiveSummary.opportunity?.headline, 'string');
  assert.equal(typeof data.executiveSummary.nextAction?.headline, 'string');
  assert.ok(data.pipeline);
  assert.ok(data.acquisition);
  assert.ok(Array.isArray(data.acquisition.cards));
  assert.ok(data.acquisition.whatsapp);
  assert.equal(typeof data.acquisition.whatsapp.summary.siteClicks, 'number');
  assert.equal(typeof data.acquisition.whatsapp.summary.directWhatsAppLeads, 'number');
  assert.equal(typeof data.acquisition.whatsapp.summary.totalWhatsAppLeads, 'number');
  assert.ok(Array.isArray(data.acquisition.whatsapp.funnel));
  assert.ok(Array.isArray(data.acquisition.whatsapp.touchpoints));
  assert.ok(Array.isArray(data.acquisition.whatsapp.recentLeads));
  assert.ok(data.seoContent);
  assert.ok(Array.isArray(data.seoContent.cards));
  assert.ok(Array.isArray(data.seoContent.keywordCards));
  assert.ok(data.seoContent.keywordRankings);
  assert.ok(data.seoContent.keywordRankings.distributionByDevice);
  assert.ok(Array.isArray(data.seoContent.keywordRankings.visibilityTrend));
  assert.ok(Array.isArray(data.seoContent.keywordRankings.positionTrend));
  assert.ok(Array.isArray(data.seoContent.keywordRankings.trend));
  assert.ok(data.seoContent.keywordRankings.snapshotDiagnostics);
  assert.equal(typeof data.seoContent.keywordRankings.usingReferenceFallback, 'boolean');
  assert.equal(typeof data.seoContent.notes.keywordDefinition, 'string');
  assert.equal(typeof data.seoContent.notes.keywordTrendDefinition, 'string');
  assert.equal(typeof data.seoContent.notes.keywordRowDefinition, 'string');
  assert.ok(data.seoQueries);
  assert.ok(data.seoQueries.summary);
  assert.ok(Array.isArray(data.seoQueries.topQueries));
  assert.ok(Array.isArray(data.seoQueries.opportunities));
  assert.ok(Array.isArray(data.seoQueries.clusters));
  assert.equal(typeof data.seoQueries.notes.basis, 'string');
  assert.ok(data.contentOpportunities);
  assert.ok(Array.isArray(data.contentOpportunities.rows));
  assert.equal(typeof data.contentOpportunities.notes.basis, 'string');
  assert.ok(data.landingPageScorecard);
  assert.ok(Array.isArray(data.landingPageScorecard.rows));
  assert.equal(typeof data.landingPageScorecard.notes.basis, 'string');
  assert.ok(data.ctaPerformance);
  assert.ok(data.ctaPerformance.summary);
  assert.ok(Array.isArray(data.ctaPerformance.rows));
  assert.equal(typeof data.ctaPerformance.notes.basis, 'string');
  assert.ok(data.contactIntent);
  assert.ok(data.contactIntent.summary);
  assert.ok(Array.isArray(data.contactIntent.methods));
  assert.ok(Array.isArray(data.contactIntent.touchpoints));
  assert.equal(typeof data.contactIntent.notes.basis, 'string');
  assert.ok(data.formHealth);
  assert.ok(data.formHealth.summary);
  assert.ok(Array.isArray(data.formHealth.rows));
  assert.equal(typeof data.formHealth.notes.basis, 'string');
  assert.ok(data.funnelDiagnostics);
  assert.ok(data.funnelDiagnostics.summary);
  assert.ok(Array.isArray(data.funnelDiagnostics.steps));
  assert.ok(Array.isArray(data.funnelDiagnostics.topDropoffs));
  assert.equal(typeof data.funnelDiagnostics.notes.basis, 'string');
  assert.ok(data.operations);
  assert.ok(data.operations.slaBreaches);
  assert.ok(data.operations.leadQuality);
  assert.ok(Array.isArray(data.operations.leadQuality.breakdown));
  assert.ok(data.dataHealth);
  assert.equal(data.operations.recentActivityLabel, 'Activité lifecycle récente (globale)');
  assert.equal(data.dataHealth.items.find((item) => item.key === 'supabase_live')?.status, 'fresh');
  assert.equal(data.dataHealth.items.find((item) => item.key === 'ga4')?.status, 'missing');
  assert.equal(data.dataHealth.items.find((item) => item.key === 'search_console')?.status, 'missing');
  assert.equal(data.dataHealth.items.find((item) => item.key === 'serp_keyword_rankings')?.status, 'missing');
});
