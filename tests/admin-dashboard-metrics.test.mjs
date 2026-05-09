import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdminDashboardData,
  buildCombinedChannelPerformance,
  buildLifecycleTrend,
  getDashboardRange,
  normalizeLead
} from '../src/libs/adminDashboardMetrics.mjs';

function buildDevisRow(overrides = {}) {
  return {
    id: overrides.id || 'devis-1',
    created_at: overrides.created_at || '2026-05-01T10:00:00.000Z',
    type_service: overrides.type_service || 'salon',
    lead_status: overrides.lead_status || 'submitted',
    lead_quality_outcome: overrides.lead_quality_outcome || null,
    lead_owner: overrides.lead_owner || null,
    submitted_at: overrides.submitted_at || overrides.created_at || '2026-05-01T10:00:00.000Z',
    qualified_at: overrides.qualified_at || null,
    closed_at: overrides.closed_at || null,
    follow_up_sla_at: overrides.follow_up_sla_at || null,
    last_worked_at: overrides.last_worked_at || null,
    landing_page: overrides.landing_page || '/salon',
    session_source: overrides.session_source || 'direct',
    session_medium: overrides.session_medium || '(none)',
    session_campaign: overrides.session_campaign || '(not set)',
    referrer_host: overrides.referrer_host || null,
    entry_path: overrides.entry_path || '/salon',
    selected_services: overrides.selected_services || null,
    calculator_estimate: overrides.calculator_estimate || null,
    whatsapp_click_id: overrides.whatsapp_click_id || null,
    whatsapp_clicked_at: overrides.whatsapp_clicked_at || null,
    whatsapp_click_label: overrides.whatsapp_click_label || null,
    whatsapp_click_page: overrides.whatsapp_click_page || null,
    whatsapp_manual_tag: overrides.whatsapp_manual_tag || false,
    whatsapp_manual_tagged_at: overrides.whatsapp_manual_tagged_at || null
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
    lead_quality_outcome: overrides.lead_quality_outcome || null,
    lead_owner: overrides.lead_owner || null,
    submitted_at: overrides.submitted_at || overrides.created_at || '2026-05-03T09:00:00.000Z',
    qualified_at: overrides.qualified_at || null,
    closed_at: overrides.closed_at || null,
    follow_up_sla_at: overrides.follow_up_sla_at || null,
    last_worked_at: overrides.last_worked_at || null,
    landing_page: overrides.landing_page || '/entreprises',
    session_source: overrides.session_source || 'google',
    session_medium: overrides.session_medium || 'organic',
    session_campaign: overrides.session_campaign || '(not set)',
    referrer_host: overrides.referrer_host || 'google.com',
    entry_path: overrides.entry_path || '/entreprises',
    selected_services: overrides.selected_services || null,
    calculator_estimate: overrides.calculator_estimate || null,
    whatsapp_click_id: overrides.whatsapp_click_id || null,
    whatsapp_clicked_at: overrides.whatsapp_clicked_at || null,
    whatsapp_click_label: overrides.whatsapp_click_label || null,
    whatsapp_click_page: overrides.whatsapp_click_page || null,
    whatsapp_manual_tag: overrides.whatsapp_manual_tag || false,
    whatsapp_manual_tagged_at: overrides.whatsapp_manual_tagged_at || null
  };
}

function buildKeywordCatalogRow(overrides = {}) {
  return {
    id: overrides.id || 'keyword-1',
    normalized_keyword: overrides.normalized_keyword || 'nettoyage salon tunis',
    display_keyword: overrides.display_keyword || 'Nettoyage salon Tunis',
    canonical_target_url: overrides.canonical_target_url || 'https://cciservices.online/salon',
    canonical_target_path: overrides.canonical_target_path || '/salon',
    target_domain: overrides.target_domain || 'cciservices.online',
    category_tags: overrides.category_tags || ['Salon & Canapé'],
    search_intent_tags: overrides.search_intent_tags || ['Commercial'],
    content_type_tags: overrides.content_type_tags || ['Article'],
    priority_tags: overrides.priority_tags || ['High'],
    trend_tags: overrides.trend_tags || ['Improving'],
    reference_clicks: overrides.reference_clicks || 24,
    reference_impressions: overrides.reference_impressions || 520,
    reference_current_position: overrides.reference_current_position || 7,
    reference_ctr: overrides.reference_ctr || 4.6,
    reference_last_updated: overrides.reference_last_updated || null
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

test('stage-one lead operations use last_worked_at for stale queue and surface SLA and quality summaries', () => {
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
      devis: [
        buildDevisRow({
          id: 'devis-fresh-touch',
          created_at: '2026-05-01T09:00:00.000Z',
          submitted_at: '2026-05-01T09:00:00.000Z',
          qualified_at: '2026-05-02T09:00:00.000Z',
          last_worked_at: '2026-05-07T10:00:00.000Z',
          follow_up_sla_at: '2026-05-06T09:00:00.000Z',
          lead_quality_outcome: 'sales_accepted',
          lead_owner: 'ops@cciservices.online'
        }),
        buildDevisRow({
          id: 'devis-overdue-open',
          created_at: '2026-05-01T07:00:00.000Z',
          submitted_at: '2026-05-01T07:00:00.000Z',
          follow_up_sla_at: '2026-05-03T07:00:00.000Z',
          last_worked_at: '2026-05-02T07:00:00.000Z'
        })
      ],
      conventions: [
        buildConventionRow({
          id: 'conv-unreviewed-open',
          created_at: '2026-05-02T08:00:00.000Z',
          submitted_at: '2026-05-02T08:00:00.000Z',
          follow_up_sla_at: '2026-05-04T08:00:00.000Z',
          last_worked_at: '2026-05-03T08:00:00.000Z'
        })
      ]
    },
    range: rangeResult.range,
    nowIso: '2026-05-07T12:00:00.000Z'
  });

  assert.equal(data.operations.staleQueue.count, 2);
  assert.equal(data.operations.staleQueue.leads.some((lead) => lead.id === 'devis-fresh-touch'), false);
  assert.equal(data.operations.slaBreaches.count, 2);
  assert.equal(data.operations.leadQuality.reviewedCount, 1);
  assert.equal(data.operations.leadQuality.ownerAssignedCount, 1);
  assert.equal(data.operations.leadQuality.breakdown.find((item) => item.key === 'sales_accepted')?.count, 1);
  assert.equal(data.operations.leadQuality.breakdown.find((item) => item.key === 'unreviewed')?.count, 2);
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
  assert.equal(rows[0].sourceClass, 'organic_search');
  assert.equal(rows[0].pageType, 'service');
  assert.equal(rows[0].warnings.costPerLead?.key, 'cost_per_lead_low_sample');
  assert.equal(rows[0].warnings.costPerAcquisition?.key, 'cost_per_acquisition_low_sample');
});

test('normalizeLead derives business line, source class, and page type for stage-one segmentation readiness', () => {
  const b2cLead = normalizeLead(buildDevisRow({
    session_source: 'instagram',
    session_medium: 'social',
    landing_page: '/contact',
    lead_quality_outcome: 'sales_rejected',
    lead_owner: 'ops@cciservices.online',
    follow_up_sla_at: '2026-05-08T12:00:00.000Z',
    last_worked_at: '2026-05-07T08:00:00.000Z'
  }), 'devis', '2026-05-07T12:00:00.000Z');
  const b2bLead = normalizeLead(buildConventionRow({
    session_source: 'google',
    session_medium: 'organic',
    landing_page: '/entreprises'
  }), 'convention', '2026-05-07T12:00:00.000Z');

  assert.equal(b2cLead.businessLine, 'b2c');
  assert.equal(b2cLead.businessLineLabel, 'B2C');
  assert.equal(b2cLead.sourceClass, 'organic_social');
  assert.equal(b2cLead.pageType, 'contact');
  assert.equal(b2cLead.leadQualityOutcome, 'sales_rejected');
  assert.equal(b2cLead.leadOwner, 'ops@cciservices.online');
  assert.equal(b2cLead.followUpSlaAt, '2026-05-08T12:00:00.000Z');
  assert.equal(b2cLead.lastWorkedAt, '2026-05-07T08:00:00.000Z');

  assert.equal(b2bLead.businessLine, 'b2b');
  assert.equal(b2bLead.businessLineLabel, 'B2B');
  assert.equal(b2bLead.sourceClass, 'organic_search');
  assert.equal(b2bLead.pageType, 'service');
});

test('stage-two filters segment overview, pipeline, acquisition, seo, and executive summary in one contract', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-07' });
  const data = buildAdminDashboardData({
    currentRows: {
      devis: [
        buildDevisRow({
          id: 'devis-salon-organic',
          created_at: '2026-05-02T10:00:00.000Z',
          last_worked_at: '2026-05-07T08:00:00.000Z',
          landing_page: '/salon',
          entry_path: '/salon',
          session_source: 'google',
          session_medium: 'organic',
          qualified_at: '2026-05-03T10:00:00.000Z',
          calculator_estimate: 320
        }),
        buildDevisRow({
          id: 'devis-marbre-paid',
          created_at: '2026-05-03T10:00:00.000Z',
          landing_page: '/marbre',
          entry_path: '/marbre',
          session_source: 'facebook',
          session_medium: 'paid_social',
          calculator_estimate: 150
        })
      ],
      conventions: [
        buildConventionRow({
          id: 'conv-b2b-organic',
          created_at: '2026-05-04T09:00:00.000Z',
          landing_page: '/entreprises',
          entry_path: '/entreprises',
          session_source: 'google',
          session_medium: 'organic',
          qualified_at: '2026-05-05T09:00:00.000Z'
        })
      ]
    },
    previousRows: {
      devis: [
        buildDevisRow({
          id: 'devis-previous-salon',
          created_at: '2026-04-26T10:00:00.000Z',
          landing_page: '/salon',
          entry_path: '/salon',
          session_source: 'google',
          session_medium: 'organic'
        })
      ],
      conventions: []
    },
    universeRows: {
      devis: [
        buildDevisRow({
          id: 'devis-salon-organic',
          created_at: '2026-05-02T10:00:00.000Z',
          last_worked_at: '2026-05-07T08:00:00.000Z',
          landing_page: '/salon',
          entry_path: '/salon',
          session_source: 'google',
          session_medium: 'organic',
          qualified_at: '2026-05-03T10:00:00.000Z',
          calculator_estimate: 320
        }),
        buildDevisRow({
          id: 'devis-marbre-paid',
          created_at: '2026-05-03T10:00:00.000Z',
          landing_page: '/marbre',
          entry_path: '/marbre',
          session_source: 'facebook',
          session_medium: 'paid_social',
          calculator_estimate: 150
        })
      ],
      conventions: [
        buildConventionRow({
          id: 'conv-b2b-organic',
          created_at: '2026-05-04T09:00:00.000Z',
          landing_page: '/entreprises',
          entry_path: '/entreprises',
          session_source: 'google',
          session_medium: 'organic',
          qualified_at: '2026-05-05T09:00:00.000Z'
        })
      ]
    },
    externalMetricRows: [
      {
        metric_date: '2026-05-07',
        metric_source: 'ga4',
        source: 'google',
        medium: 'organic',
        campaign: '(not set)',
        landing_page: '/salon',
        sessions: 30,
        users: 24,
        clicks: 0,
        impressions: 0,
        spend: 0
      },
      {
        metric_date: '2026-05-07',
        metric_source: 'gsc',
        source: 'google',
        medium: 'organic',
        campaign: '(not set)',
        landing_page: '/salon',
        sessions: 0,
        users: 0,
        clicks: 18,
        impressions: 180,
        spend: 0
      },
      {
        metric_date: '2026-05-07',
        metric_source: 'ga4',
        source: 'facebook',
        medium: 'paid_social',
        campaign: 'retargeting',
        landing_page: '/marbre',
        sessions: 20,
        users: 18,
        clicks: 0,
        impressions: 0,
        spend: 0
      }
    ],
    keywordCatalogRows: [
      buildKeywordCatalogRow({
        id: 'keyword-salon',
        canonical_target_url: 'https://cciservices.online/salon',
        canonical_target_path: '/salon'
      }),
      buildKeywordCatalogRow({
        id: 'keyword-marbre',
        normalized_keyword: 'nettoyage marbre tunis',
        display_keyword: 'Nettoyage marbre Tunis',
        canonical_target_url: 'https://cciservices.online/marbre',
        canonical_target_path: '/marbre',
        category_tags: ['Marbre'],
        priority_tags: ['Medium']
      })
    ],
    keywordRankingRows: [
      {
        keyword_catalog_id: 'keyword-salon',
        metric_date: '2026-05-07',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/salon',
        matched_path: '/salon',
        matched_url: 'https://cciservices.online/salon',
        result_title: 'Nettoyage salon',
        position: 4,
        is_ranked: true,
        device: 'desktop',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      },
      {
        keyword_catalog_id: 'keyword-salon',
        metric_date: '2026-05-07',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/salon',
        matched_path: '/salon',
        matched_url: 'https://cciservices.online/salon',
        result_title: 'Nettoyage salon mobile',
        position: 6,
        is_ranked: true,
        device: 'mobile',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      },
      {
        keyword_catalog_id: 'keyword-marbre',
        metric_date: '2026-05-07',
        keyword: 'nettoyage marbre tunis',
        keyword_label: 'Nettoyage marbre Tunis',
        target_domain: 'cciservices.online',
        target_path: '/marbre',
        matched_path: '/marbre',
        matched_url: 'https://cciservices.online/marbre',
        result_title: 'Nettoyage marbre',
        position: 8,
        is_ranked: true,
        device: 'desktop',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      }
    ],
    filters: {
      businessLine: 'b2c',
      service: 'salon',
      sourceClass: 'organic_search',
      device: 'desktop',
      pageType: 'service'
    },
    range: rangeResult.range,
    nowIso: '2026-05-07T12:00:00.000Z'
  });

  assert.equal(data.filters.applied.businessLine, 'b2c');
  assert.equal(data.filters.applied.service, 'salon');
  assert.equal(data.filters.applied.sourceClass, 'organic_search');
  assert.equal(data.filters.applied.device, 'desktop');
  assert.equal(data.filters.applied.pageType, 'service');
  assert.equal(data.filters.segmentLabel, 'B2C · Salon · Organic search · Service page');
  assert.equal(data.filters.seoDeviceLabel, 'Desktop');
  assert.equal(data.filters.active.length, 5);
  assert.match(data.filters.notes[0], /Business line/);
  assert.match(data.filters.notes[1], /Service slices/);
  assert.match(data.filters.notes[2], /Device currently filters keyword visibility snapshots only/);

  assert.equal(data.overview.cohort.currentLeads, 1);
  assert.equal(data.pipeline.summary.totalLeads, 1);
  assert.equal(data.pipeline.breakdowns.sourceClass[0]?.key, 'organic_search');
  assert.equal(data.pipeline.breakdowns.businessLine[0]?.key, 'b2c');
  assert.equal(data.acquisition.totals.sessions, 30);
  assert.equal(data.acquisition.totals.clicks, 18);
  assert.equal(data.seoContent.landingPages.length, 1);
  assert.equal(data.seoContent.landingPages[0]?.label, '/salon');
  assert.equal(data.seoContent.keywordRankings.totals.trackedKeywords, 1);
  assert.equal(data.seoContent.keywordRankings.totals.desktopRankedKeywords, 1);
  assert.equal(data.seoContent.keywordRankings.totals.mobileRankedKeywords, 0);
  assert.equal(data.operations.latestSubmitted.length, 1);
  assert.equal(data.executiveSummary.segmentLabel, 'B2C · Salon · Organic search · Service page');
  assert.equal(data.executiveSummary.trend.key, 'trend');
  assert.equal(data.executiveSummary.risk.key, 'no_acute_risk');
  assert.equal(data.executiveSummary.opportunity.key, 'seo_landing_page');
  assert.equal(data.executiveSummary.nextAction.owner, 'Growth owner');
});

test('whatsapp acquisition summarizes clicks, attributed leads, and drilldown rows', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-07' });
  const data = buildAdminDashboardData({
    currentRows: {
      devis: [
        buildDevisRow({
          id: 'devis-wa-auto',
          created_at: '2026-05-02T10:00:00.000Z',
          whatsapp_click_id: 'wa-1',
          whatsapp_clicked_at: '2026-05-01T09:00:00.000Z',
          whatsapp_click_label: 'home_hero_whatsapp_main',
          whatsapp_click_page: '/',
          session_source: 'google',
          session_medium: 'organic'
        }),
        buildDevisRow({
          id: 'devis-wa-manual',
          created_at: '2026-05-03T11:00:00.000Z',
          whatsapp_manual_tag: true,
          whatsapp_manual_tagged_at: '2026-05-03T12:00:00.000Z'
        })
      ],
      conventions: []
    },
    previousRows: {
      devis: [],
      conventions: []
    },
    universeRows: {
      devis: [
        buildDevisRow({
          id: 'devis-wa-auto',
          created_at: '2026-05-02T10:00:00.000Z',
          whatsapp_click_id: 'wa-1',
          whatsapp_clicked_at: '2026-05-01T09:00:00.000Z',
          whatsapp_click_label: 'home_hero_whatsapp_main',
          whatsapp_click_page: '/',
          session_source: 'google',
          session_medium: 'organic'
        }),
        buildDevisRow({
          id: 'devis-wa-manual',
          created_at: '2026-05-03T11:00:00.000Z',
          whatsapp_manual_tag: true,
          whatsapp_manual_tagged_at: '2026-05-03T12:00:00.000Z'
        })
      ],
      conventions: []
    },
    externalMetricRows: [],
    whatsappClickRows: [
      {
        id: 'wa-1',
        clicked_at: '2026-05-01T09:00:00.000Z',
        ga_client_id: '111.222',
        event_label: 'home_hero_whatsapp_main',
        page_path: '/',
        landing_page: '/',
        session_source: 'google',
        session_medium: 'organic',
        session_campaign: '(not set)',
        referrer_host: 'google.com'
      },
      {
        id: 'wa-2',
        clicked_at: '2026-05-03T09:00:00.000Z',
        ga_client_id: '111.222',
        event_label: 'sticky_header_whatsapp',
        page_path: '/contact',
        landing_page: '/contact',
        session_source: 'direct',
        session_medium: '(none)',
        session_campaign: '(not set)',
        referrer_host: null
      },
      {
        id: 'wa-3',
        clicked_at: '2026-05-04T09:00:00.000Z',
        ga_client_id: '333.444',
        event_label: 'home_hero_whatsapp_main',
        page_path: '/',
        landing_page: '/',
        session_source: 'instagram',
        session_medium: 'social',
        session_campaign: 'bio_link',
        referrer_host: 'instagram.com'
      }
    ],
    range: rangeResult.range,
    nowIso: '2026-05-07T12:00:00.000Z'
  });

  assert.equal(data.acquisition.whatsapp.summary.clicks, 3);
  assert.equal(data.acquisition.whatsapp.summary.uniqueClickers, 2);
  assert.equal(data.acquisition.whatsapp.summary.autoAttributedLeads, 1);
  assert.equal(data.acquisition.whatsapp.summary.manualTaggedLeads, 1);
  assert.equal(data.acquisition.whatsapp.summary.totalAttributedLeads, 2);
  assert.equal(data.acquisition.whatsapp.funnel.find((item) => item.key === 'created')?.count, 2);
  assert.equal(data.acquisition.whatsapp.touchpoints[0]?.label, 'home_hero_whatsapp_main');
  assert.equal(data.acquisition.whatsapp.recentLeads[0]?.drilldownHref, '/admin/devis?lead=devis-wa-manual');
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

test('seo content summarizes latest keyword rankings and ranking changes', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-07' });
  assert.equal(rangeResult.ok, true);

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
    keywordCatalogRows: [
      buildKeywordCatalogRow(),
      buildKeywordCatalogRow({
        id: 'keyword-2',
        normalized_keyword: 'nettoyage tapis tunis',
        display_keyword: 'Nettoyage tapis Tunis',
        canonical_target_url: 'https://cciservices.online/tapis',
        canonical_target_path: '/tapis',
        category_tags: ['Tapis & Moquette'],
        priority_tags: ['Medium']
      })
    ],
    keywordRankingRows: [
      {
        keyword_catalog_id: 'keyword-1',
        metric_date: '2026-05-01',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/salon',
        matched_path: '/salon',
        matched_url: 'https://cciservices.online/salon',
        result_title: 'Nettoyage salon',
        position: 8,
        is_ranked: true,
        device: 'desktop',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      },
      {
        keyword_catalog_id: 'keyword-1',
        metric_date: '2026-05-07',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/salon',
        matched_path: '/salon',
        matched_url: 'https://cciservices.online/salon',
        result_title: 'Nettoyage salon',
        position: 3,
        is_ranked: true,
        device: 'desktop',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      },
      {
        keyword_catalog_id: 'keyword-1',
        metric_date: '2026-05-01',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/salon',
        matched_path: '/salon',
        matched_url: 'https://cciservices.online/salon',
        result_title: 'Nettoyage salon mobile',
        position: 6,
        is_ranked: true,
        device: 'mobile',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      },
      {
        keyword_catalog_id: 'keyword-1',
        metric_date: '2026-05-07',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/salon',
        matched_path: '/salon',
        matched_url: 'https://cciservices.online/salon',
        result_title: 'Nettoyage salon mobile',
        position: 4,
        is_ranked: true,
        device: 'mobile',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      },
      {
        keyword_catalog_id: 'keyword-2',
        metric_date: '2026-05-07',
        keyword: 'nettoyage tapis tunis',
        keyword_label: 'Nettoyage tapis Tunis',
        target_domain: 'cciservices.online',
        target_path: '/tapis',
        matched_path: null,
        matched_url: null,
        result_title: null,
        position: null,
        is_ranked: false,
        device: 'desktop',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      }
    ],
    range: rangeResult.range,
    nowIso: '2026-05-07T06:00:00.000Z'
  });

  assert.equal(data.seoContent.keywordRankings.totals.trackedKeywords, 2);
  assert.equal(data.seoContent.keywordRankings.totals.rankedKeywords, 1);
  assert.equal(data.seoContent.keywordRankings.totals.desktopRankedKeywords, 1);
  assert.equal(data.seoContent.keywordRankings.totals.mobileRankedKeywords, 1);
  assert.equal(data.seoContent.keywordRankings.totals.averagePosition, 3);
  assert.equal(data.seoContent.keywordRankings.totals.top10Count, 1);
  assert.equal(data.seoContent.keywordCards.find((card) => card.key === 'tracked_keywords')?.canonicalLabel, 'Tracked keywords');
  assert.equal(data.seoContent.keywordRankings.rows[0].desktop.positionChange, 5);
  assert.equal(data.seoContent.keywordRankings.rows[0].mobile.positionChange, 2);
  assert.equal(data.seoContent.keywordRankings.rows[0].currentBestPosition, 3);
  assert.equal(data.seoContent.keywordRankings.rows[0].categoryTags[0], 'Salon & Canapé');
  assert.equal(data.seoContent.keywordRankings.distributionByDevice.desktop.find((item) => item.key === 'desktop_not_ranked')?.count, 1);
  assert.deepEqual(data.seoContent.keywordRankings.visibilityTrend, [
    {
      date: '2026-05-01',
      desktopRanked: 1,
      mobileRanked: 1,
      desktopTop10: 1,
      mobileTop10: 1
    },
    {
      date: '2026-05-07',
      desktopRanked: 1,
      mobileRanked: 1,
      desktopTop10: 1,
      mobileTop10: 1
    }
  ]);
  assert.deepEqual(data.seoContent.keywordRankings.positionTrend, [
    {
      date: '2026-05-01',
      desktopAveragePosition: 8,
      mobileAveragePosition: 6,
      desktopBestPosition: 8,
      mobileBestPosition: 6,
      desktopRanked: 1,
      mobileRanked: 1
    },
    {
      date: '2026-05-07',
      desktopAveragePosition: 3,
      mobileAveragePosition: 4,
      desktopBestPosition: 3,
      mobileBestPosition: 4,
      desktopRanked: 1,
      mobileRanked: 1
    }
  ]);
  assert.deepEqual(
    data.seoContent.keywordRankings.trend,
    data.seoContent.keywordRankings.visibilityTrend
  );
  assert.deepEqual(data.seoContent.keywordRankings.snapshotDiagnostics, {
    rawSnapshotCount: 5,
    matchedSnapshotCount: 5,
    unmatchedSnapshotCount: 0,
    earliestRawMetricDate: '2026-05-01',
    latestRawMetricDate: '2026-05-07',
    earliestMatchedMetricDate: '2026-05-01',
    latestMatchedMetricDate: '2026-05-07',
    referenceRankedCount: 2,
    earliestReferenceMetricDate: null,
    latestReferenceMetricDate: null,
    usingReferenceFallback: false
  });
  assert.match(data.seoContent.notes.keywordDefinition, /Snapshots SERP live catalogués/);
  assert.equal(data.seoContent.keywordRankings.rows[0].reference.position, 7);
  assert.equal(data.seoContent.keywordRankings.rows[0].reference.lastUpdated, null);
});

test('dashboard stage-one cards expose canonical semantics and low-sample warnings', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-07' });
  const data = buildAdminDashboardData({
    currentRows: {
      devis: [
        buildDevisRow({
          id: 'devis-critical-direct',
          created_at: '2026-05-02T10:00:00.000Z',
          submitted_at: '2026-05-02T10:00:00.000Z',
          lead_status: 'closed_won',
          closed_at: '2026-05-05T10:00:00.000Z',
          session_source: 'direct',
          session_medium: '(none)',
          calculator_estimate: 900
        })
      ],
      conventions: []
    },
    previousRows: {
      devis: [],
      conventions: []
    },
    universeRows: {
      devis: [
        buildDevisRow({
          id: 'devis-critical-direct',
          created_at: '2026-05-02T10:00:00.000Z',
          submitted_at: '2026-05-02T10:00:00.000Z',
          lead_status: 'closed_won',
          closed_at: '2026-05-05T10:00:00.000Z',
          session_source: 'direct',
          session_medium: '(none)',
          calculator_estimate: 900
        })
      ],
      conventions: []
    },
    externalMetricRows: [
      {
        metric_date: '2026-05-02',
        metric_source: 'ga4',
        source: 'google',
        medium: 'organic',
        campaign: '(not set)',
        landing_page: '/salon',
        sessions: 15,
        users: 12,
        clicks: 0,
        impressions: 0,
        spend: 0
      },
      {
        metric_date: '2026-05-02',
        metric_source: 'gsc',
        source: 'google',
        medium: 'organic',
        campaign: '(not set)',
        landing_page: '/salon',
        sessions: 0,
        users: 0,
        clicks: 15,
        impressions: 120,
        spend: 0
      },
      {
        metric_date: '2026-05-02',
        metric_source: 'paid_manual',
        source: 'direct',
        medium: '(none)',
        campaign: '(not set)',
        landing_page: '/salon',
        sessions: 0,
        users: 0,
        clicks: 0,
        impressions: 0,
        spend: 100
      }
    ],
    keywordCatalogRows: [],
    keywordRankingRows: [],
    range: rangeResult.range,
    nowIso: '2026-05-07T12:00:00.000Z'
  });

  assert.equal(data.overview.cards.find((card) => card.key === 'revenue_proxy')?.label, 'Estimated pipeline value');
  assert.equal(data.overview.cards.find((card) => card.key === 'revenue_proxy')?.canonicalLabel, 'Estimated pipeline value');
  assert.equal(data.overview.cards.find((card) => card.key === 'unattributed_rate')?.warning?.level, 'critical');

  assert.equal(data.acquisition.cards.find((card) => card.key === 'cost_per_lead')?.warning?.key, 'cost_per_lead_low_sample');
  assert.equal(data.acquisition.cards.find((card) => card.key === 'cost_per_acquisition')?.warning?.key, 'cost_per_acquisition_low_sample');

  assert.equal(data.seoContent.cards.find((card) => card.key === 'lead_rate')?.warning?.key, 'lead_rate_low_session_sample');
});

test('keyword rankings fall back to lookup matching when keyword_catalog_id is stale', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-07' });
  assert.equal(rangeResult.ok, true);

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
    keywordCatalogRows: [
      buildKeywordCatalogRow({
        id: 'keyword-active',
        reference_last_updated: '2025-10-15'
      })
    ],
    keywordRankingRows: [
      {
        keyword_catalog_id: 'keyword-stale-id',
        metric_date: '2026-05-07',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/salon',
        matched_path: '/salon',
        matched_url: 'https://cciservices.online/salon',
        result_title: 'Nettoyage salon',
        position: 4,
        is_ranked: true,
        device: 'desktop',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      },
      {
        keyword_catalog_id: 'keyword-stale-id',
        metric_date: '2026-05-07',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/salon',
        matched_path: '/salon',
        matched_url: 'https://cciservices.online/salon',
        result_title: 'Nettoyage salon mobile',
        position: 6,
        is_ranked: true,
        device: 'mobile',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      },
      {
        keyword_catalog_id: 'keyword-unmatched',
        metric_date: '2026-05-07',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/old-salon',
        matched_path: '/old-salon',
        matched_url: 'https://cciservices.online/old-salon',
        result_title: 'Old salon page',
        position: 12,
        is_ranked: true,
        device: 'desktop',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      }
    ],
    range: rangeResult.range,
    nowIso: '2026-05-07T06:00:00.000Z'
  });

  assert.equal(data.seoContent.keywordRankings.totals.trackedKeywords, 1);
  assert.equal(data.seoContent.keywordRankings.totals.rankedKeywords, 1);
  assert.equal(data.seoContent.keywordRankings.rows[0].desktop.latestPosition, 4);
  assert.equal(data.seoContent.keywordRankings.rows[0].mobile.latestPosition, 6);
  assert.equal(data.seoContent.keywordRankings.rows[0].hasLiveSnapshots, true);
  assert.equal(data.seoContent.keywordRankings.rows[0].reference.lastUpdated, '2025-10-15');
  assert.deepEqual(data.seoContent.keywordRankings.snapshotDiagnostics, {
    rawSnapshotCount: 3,
    matchedSnapshotCount: 2,
    unmatchedSnapshotCount: 1,
    earliestRawMetricDate: '2026-05-07',
    latestRawMetricDate: '2026-05-07',
    earliestMatchedMetricDate: '2026-05-07',
    latestMatchedMetricDate: '2026-05-07',
    referenceRankedCount: 1,
    earliestReferenceMetricDate: '2025-10-15',
    latestReferenceMetricDate: '2025-10-15',
    usingReferenceFallback: false
  });
});

test('seo notes and trends fall back to imported references when live snapshots do not match the active catalog', () => {
  const rangeResult = getDashboardRange({ from: '2026-05-01', to: '2026-05-07' });
  assert.equal(rangeResult.ok, true);

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
    keywordCatalogRows: [
      buildKeywordCatalogRow({
        id: 'keyword-active',
        reference_last_updated: '2025-10-15'
      })
    ],
    keywordRankingRows: [
      {
        keyword_catalog_id: 'keyword-stale-id',
        metric_date: '2026-05-07',
        keyword: 'nettoyage salon tunis',
        keyword_label: 'Nettoyage salon Tunis',
        target_domain: 'cciservices.online',
        target_path: '/old-salon',
        matched_path: '/old-salon',
        matched_url: 'https://cciservices.online/old-salon',
        result_title: 'Old salon page',
        position: 12,
        is_ranked: true,
        device: 'desktop',
        google_domain: 'google.com',
        gl: 'tn',
        hl: 'fr',
        location: 'Tunis, Tunisia',
        results_count: 10
      }
    ],
    range: rangeResult.range,
    nowIso: '2026-05-07T06:00:00.000Z'
  });

  assert.deepEqual(data.seoContent.keywordRankings.snapshotDiagnostics, {
    rawSnapshotCount: 1,
    matchedSnapshotCount: 0,
    unmatchedSnapshotCount: 1,
    earliestRawMetricDate: '2026-05-07',
    latestRawMetricDate: '2026-05-07',
    earliestMatchedMetricDate: null,
    latestMatchedMetricDate: null,
    referenceRankedCount: 1,
    earliestReferenceMetricDate: '2025-10-15',
    latestReferenceMetricDate: '2025-10-15',
    usingReferenceFallback: true
  });
  assert.equal(data.seoContent.keywordRankings.rows[0].hasLiveSnapshots, false);
  assert.equal(data.seoContent.keywordRankings.rows[0].reference.position, 7);
  assert.equal(data.seoContent.keywordRankings.rows[0].effectiveBestPosition, 7);
  assert.equal(data.seoContent.keywordRankings.rows[0].usesReferenceFallback, true);
  assert.deepEqual(data.seoContent.keywordRankings.visibilityTrend, [
    {
      date: '2025-10-15',
      desktopRanked: 1,
      mobileRanked: 1,
      desktopTop10: 1,
      mobileTop10: 1
    }
  ]);
  assert.deepEqual(data.seoContent.keywordRankings.positionTrend, [
    {
      date: '2025-10-15',
      desktopAveragePosition: 7,
      mobileAveragePosition: 7,
      desktopBestPosition: 7,
      mobileBestPosition: 7,
      desktopRanked: 1,
      mobileRanked: 1
    }
  ]);
  assert.equal(data.seoContent.keywordRankings.distributionByDevice.desktop.find((item) => item.key === 'desktop_top_10')?.count, 1);
  assert.equal(data.seoContent.keywordRankings.distributionByDevice.mobile.find((item) => item.key === 'mobile_top_10')?.count, 1);
  assert.match(data.seoContent.notes.keywordDefinition, /bascule temporairement sur le catalogue Supabase actif/);
  assert.match(data.seoContent.notes.keywordTrendDefinition, /remap ou une réimportation du catalogue/);
  assert.match(data.seoContent.notes.keywordRowDefinition, /desktop et mobile reprennent la référence importée/);
});
