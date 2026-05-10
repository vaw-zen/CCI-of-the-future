import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAttributionColumns,
  extractAnalyticsContext
} from '../src/libs/analyticsLifecycle.js';
import {
  buildAttributionAuditSummary
} from '../src/libs/attributionHygiene.mjs';
import {
  serializeSessionAttributionCookie,
  SESSION_ATTRIBUTION_COOKIE_KEY
} from '../src/libs/whatsappTracking.mjs';

test('extractAnalyticsContext falls back to request cookies and referer when the client payload is incomplete', () => {
  const attributionCookie = serializeSessionAttributionCookie({
    source: 'instagram',
    medium: 'social',
    campaign: 'Bio Link',
    landing_page: '/salon',
    referrer_host: 'instagram.com'
  });
  const request = new Request('https://cciservices.online/api/devis', {
    headers: {
      cookie: `${SESSION_ATTRIBUTION_COOKIE_KEY}=${attributionCookie}; _ga=GA1.1.12345.67890`,
      referer: 'https://cciservices.online/salon?utm_source=instagram&utm_medium=social&utm_campaign=Bio%20Link'
    }
  });

  const context = extractAnalyticsContext({}, { request });

  assert.equal(context.ga_client_id, '12345.67890');
  assert.equal(context.landing_page, '/salon');
  assert.equal(context.entry_path, '/salon?utm_source=instagram&utm_medium=social&utm_campaign=Bio%20Link');
  assert.equal(context.session_source, 'instagram');
  assert.equal(context.session_medium, 'social');
  assert.equal(context.session_campaign, 'bio_link');
  assert.equal(context.referrer_host, 'instagram.com');
});

test('buildAttributionColumns normalizes suspicious direct attribution, landing-page fallback, and campaign naming', () => {
  const columns = buildAttributionColumns({
    session_source: 'direct',
    session_medium: '(none)',
    session_campaign: 'Spring Sale 2026',
    referrer_host: 'https://instagram.com/p/demo',
    page_path: '/contact?utm_campaign=Spring%20Sale%202026'
  });

  assert.equal(columns.session_source, 'instagram');
  assert.equal(columns.session_medium, 'social');
  assert.equal(columns.session_campaign, 'spring_sale_2026');
  assert.equal(columns.landing_page, '/contact');
  assert.equal(columns.entry_path, '/contact?utm_campaign=Spring%20Sale%202026');
});

test('buildAttributionAuditSummary flags direct none spikes, landing-page gaps, and campaign naming drift', () => {
  const summary = buildAttributionAuditSummary([
    {
      id: 'lead-1',
      lead_kind: 'devis',
      created_at: '2026-05-09T08:00:00.000Z',
      session_source: 'direct',
      session_medium: '(none)',
      session_campaign: 'Spring Sale',
      landing_page: null,
      entry_path: '',
      referrer_host: 'instagram.com'
    },
    {
      id: 'lead-2',
      lead_kind: 'convention',
      created_at: '2026-05-09T09:00:00.000Z',
      session_source: 'google',
      session_medium: 'organic',
      session_campaign: 'spring_sale',
      landing_page: '/entreprises',
      entry_path: '/entreprises?utm_campaign=spring_sale',
      referrer_host: 'google.com'
    }
  ], {
    siteHost: 'cciservices.online'
  });

  assert.equal(summary.totals.leads, 2);
  assert.equal(summary.totals.directNoneCount, 1);
  assert.equal(summary.totals.missingLandingPageCount, 1);
  assert.equal(summary.totals.missingEntryPathCount, 1);
  assert.equal(summary.totals.suspiciousDirectCount, 1);
  assert.equal(summary.totals.campaignNormalizationIssueCount, 1);
  assert.equal(summary.status, 'critical');
  assert.equal(summary.campaignVariants[0]?.normalizedCampaign, 'spring_sale');
  assert.deepEqual(summary.campaignVariants[0]?.rawVariants, ['Spring Sale']);
  assert.equal(summary.problematicRows[0]?.issues.includes('campaign_needs_normalization'), true);
});
