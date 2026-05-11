import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdminDashboardData, getDashboardRange } from '../src/libs/adminDashboardMetrics.mjs';
import {
  getDashboardPageTypeForBehaviorPageType,
  normalizeBehaviorEventPayload
} from '../src/libs/behaviorTracking.mjs';

function buildBehaviorRow(overrides = {}) {
  return {
    event_date: overrides.event_date || '2026-05-05',
    event_name: overrides.event_name || 'cta_click',
    page_type: overrides.page_type || 'service_page',
    dashboard_page_type: overrides.dashboard_page_type || getDashboardPageTypeForBehaviorPageType(overrides.page_type || 'service_page'),
    landing_page: overrides.landing_page || '/salon',
    business_line: overrides.business_line || 'b2c',
    service_type: overrides.service_type || 'salon',
    form_name: overrides.form_name || null,
    form_placement: overrides.form_placement || null,
    funnel_name: overrides.funnel_name || null,
    step_name: overrides.step_name || null,
    step_number: overrides.step_number || null,
    cta_id: overrides.cta_id || null,
    cta_location: overrides.cta_location || null,
    cta_type: overrides.cta_type || null,
    contact_method: overrides.contact_method || null,
    content_type: overrides.content_type || null,
    content_cluster: overrides.content_cluster || null,
    session_source: overrides.session_source || 'google',
    session_medium: overrides.session_medium || 'organic',
    session_campaign: overrides.session_campaign || '(not set)',
    source_class: overrides.source_class || 'organic_search',
    event_count: overrides.event_count ?? 1,
    unique_client_count: overrides.unique_client_count ?? 1
  };
}

test('normalizeBehaviorEventPayload canonicalizes legacy CTA and form tracking values', () => {
  const ctaPayload = normalizeBehaviorEventPayload('select_promotion', {
    promotion_name: 'Devis Gratuit',
    creative_slot: 'service_page_salon',
    cta_id: 'service_quote_primary',
    page_path: '/salon',
    landing_page: '/salon',
    service_type: 'salon',
    business_line: 'b2c',
    session_source: 'google',
    session_medium: 'organic'
  }, '2026-05-11T12:00:00.000Z');

  assert.equal(ctaPayload?.event_name, 'cta_click');
  assert.equal(ctaPayload?.page_type, 'service_page');
  assert.equal(ctaPayload?.cta_id, 'service_quote_primary');
  assert.equal(ctaPayload?.cta_location, 'service_page_salon');

  const formPayload = normalizeBehaviorEventPayload('form_validation_failed', {
    form_name: 'contact_form',
    page_path: '/contact',
    landing_page: '/contact',
    service_type: 'tapis',
    session_source: 'google',
    session_medium: 'organic'
  }, '2026-05-11T12:00:00.000Z');

  assert.equal(formPayload?.form_name, 'contact_quote_form');
  assert.equal(formPayload?.page_type, 'contact_page');
  assert.equal(formPayload?.business_line, 'b2c');
});

test('normalizeBehaviorEventPayload ignores admin-surface events', () => {
  const payload = normalizeBehaviorEventPayload('page_view', {
    page_path: '/admin/dashboard',
    landing_page: '/admin/dashboard',
    session_source: 'direct',
    session_medium: '(none)'
  }, '2026-05-11T12:00:00.000Z');

  assert.equal(payload, null);
});

test('dashboard behavior panels aggregate CTA, contact, and form-health slices', () => {
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
    behaviorMetricRows: [
      buildBehaviorRow({
        event_name: 'cta_impression',
        cta_id: 'service_quote_primary',
        cta_location: 'service_cta_block',
        cta_type: 'lead_cta',
        event_count: 20,
        unique_client_count: 8
      }),
      buildBehaviorRow({
        event_name: 'cta_click',
        cta_id: 'service_quote_primary',
        cta_location: 'service_cta_block',
        cta_type: 'lead_cta',
        event_count: 5,
        unique_client_count: 4
      }),
      buildBehaviorRow({
        event_name: 'phone_click',
        cta_id: 'service_phone_primary',
        cta_location: 'service_cta_block',
        cta_type: 'contact',
        contact_method: 'phone',
        event_count: 2,
        unique_client_count: 2
      }),
      buildBehaviorRow({
        event_name: 'funnel_step',
        page_type: 'quote_page',
        dashboard_page_type: 'quote',
        landing_page: '/devis',
        form_name: 'devis_form',
        form_placement: 'devis_page',
        funnel_name: 'quote_request',
        step_name: 'form_start',
        step_number: 1,
        event_count: 4,
        unique_client_count: 4
      }),
      buildBehaviorRow({
        event_name: 'form_validation_failed',
        page_type: 'quote_page',
        dashboard_page_type: 'quote',
        landing_page: '/devis',
        form_name: 'devis_form',
        form_placement: 'devis_page',
        funnel_name: 'quote_request',
        event_count: 1,
        unique_client_count: 1
      }),
      buildBehaviorRow({
        event_name: 'funnel_step',
        page_type: 'quote_page',
        dashboard_page_type: 'quote',
        landing_page: '/devis',
        form_name: 'devis_form',
        form_placement: 'devis_page',
        funnel_name: 'quote_request',
        step_name: 'submit_success',
        step_number: 3,
        event_count: 2,
        unique_client_count: 2
      }),
      buildBehaviorRow({
        event_name: 'generate_lead',
        page_type: 'quote_page',
        dashboard_page_type: 'quote',
        landing_page: '/devis',
        form_name: 'devis_form',
        form_placement: 'devis_page',
        funnel_name: 'quote_request',
        contact_method: 'form',
        event_count: 2,
        unique_client_count: 2
      })
    ],
    range: rangeResult.range,
    filters: {
      pageType: 'service'
    },
    nowIso: '2026-05-07T12:00:00.000Z'
  });

  assert.equal(data.ctaPerformance.summary.impressions, 20);
  assert.equal(data.ctaPerformance.summary.clicks, 5);
  assert.equal(data.ctaPerformance.rows.some((row) => row.directIntentClicks === 2), true);
  assert.equal(data.contactIntent.summary.phoneClicks, 2);
  assert.equal(data.formHealth.summary.starts, 0);
  assert.equal(data.funnelDiagnostics.notes.coverage.includes('CTA performance'), true);
});

test('dashboard behavior panels respect mapped page-type filters', () => {
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
    behaviorMetricRows: [
      buildBehaviorRow({
        event_name: 'cta_impression',
        page_type: 'service_page',
        dashboard_page_type: 'service',
        cta_id: 'service_quote_primary',
        cta_location: 'service_cta_block',
        event_count: 10
      }),
      buildBehaviorRow({
        event_name: 'cta_impression',
        page_type: 'quote_page',
        dashboard_page_type: 'quote',
        landing_page: '/devis',
        form_name: 'devis_form',
        form_placement: 'devis_page',
        event_count: 7
      })
    ],
    range: rangeResult.range,
    filters: {
      pageType: 'service'
    },
    nowIso: '2026-05-07T12:00:00.000Z'
  });

  assert.equal(data.ctaPerformance.summary.impressions, 10);
  assert.equal(data.formHealth.summary.starts, 0);
});
