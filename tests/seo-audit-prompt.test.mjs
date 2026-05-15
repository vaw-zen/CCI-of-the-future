import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSeoAuditPrompt } from '../src/libs/seoAuditPrompt.mjs';

test('buildSeoAuditPrompt includes active filters, trust context, and required output sections', () => {
  const prompt = buildSeoAuditPrompt({
    query: {
      from: '2026-05-01',
      to: '2026-05-14',
      businessLine: 'b2c',
      service: 'tapis',
      sourceClass: 'organic_search',
      device: 'desktop',
      pageType: 'service'
    },
    dashboardData: {
      range: {
        from: '2026-05-01',
        to: '2026-05-14',
        days: 14
      },
      filters: {
        segmentLabel: 'B2C · Tapis / moquettes · Organic search · Service page',
        applied: {
          businessLine: 'b2c',
          service: 'tapis',
          sourceClass: 'organic_search',
          device: 'desktop',
          pageType: 'service'
        },
        notes: [
          'Device currently filters keyword visibility snapshots only.'
        ]
      },
      loadedSections: ['core', 'seo'],
      diagnostics: {
        reportingWarnings: ['growth_behavior_daily_metrics_unavailable']
      },
      dataHealth: {
        items: [
          {
            label: 'GA4',
            status: 'fresh',
            freshestMetricDate: '2026-05-14',
            asOf: '2026-05-15T06:00:00.000Z',
            message: '120 lignes disponibles sur la période'
          },
          {
            label: 'Search Console',
            status: 'fresh',
            freshestMetricDate: '2026-05-14',
            asOf: '2026-05-15T06:10:00.000Z',
            message: '88 lignes disponibles sur la période'
          }
        ]
      },
      seoQueries: {
        summary: {
          totalQueries: 42,
          nonBrandedClicks: 55,
          nonBrandedClickShare: 78.6,
          totalClicks: 70,
          totalImpressions: 1400,
          averagePosition: 9.3,
          cannibalizedQueryCount: 4
        },
        opportunities: [
          {
            label: 'nettoyage tapis tunis',
            primaryLandingPage: '/tapis',
            clusterLabel: 'Tapis / moquettes',
            clicks: 22,
            impressions: 600,
            ctr: 3.7,
            position: 8.4,
            opportunityScore: 116
          }
        ]
      },
      contentOpportunities: {
        rows: [
          { type: 'ctr_lift' },
          { type: 'cannibalization' }
        ]
      },
      landingPageScorecard: {
        rows: [
          {
            label: '/tapis',
            clicks: 22,
            sessions: 31,
            qualifiedLeads: 2,
            leadRate: 6.5,
            opportunityScore: 94
          }
        ]
      },
      seoContent: {
        totals: {
          clicks: 70,
          impressions: 1400,
          sessions: 85,
          events: 190,
          qualifiedLeads: 3,
          leadRate: 3.5,
          leadRateBase: 'sessions'
        },
        keywordRankings: {
          totals: {
            trackedKeywords: 12,
            rankedKeywords: 8,
            desktopRankedKeywords: 7,
            mobileRankedKeywords: 6,
            top10Count: 3,
            averagePosition: 9.1
          },
          usingReferenceFallback: false,
          latestMetricDate: '2026-05-14',
          rows: [
            {
              label: 'nettoyage tapis tunis',
              targetPath: '/tapis',
              hasLiveSnapshots: true
            }
          ]
        }
      }
    }
  });

  assert.match(prompt, /from=2026-05-01/);
  assert.match(prompt, /service=tapis/);
  assert.match(prompt, /Segment label: B2C · Tapis \/ moquettes · Organic search · Service page\./);
  assert.match(prompt, /Search Console: status=fresh; freshestMetricDate=2026-05-14/);
  assert.match(prompt, /Top non-branded query opportunity currently visible: query="nettoyage tapis tunis"/);
  assert.match(prompt, /Keyword snapshot: trackedKeywords=12; rankedKeywords=8/);
  assert.match(prompt, /growth_behavior_daily_metrics_unavailable/);
  assert.match(prompt, /# Trust audit/);
  assert.match(prompt, /# Priority keyword board/);
  assert.match(prompt, /# Landing-page action board/);
  assert.match(prompt, /# CRO handoffs/);
  assert.match(prompt, /# Measurement plan/);
});

test('buildSeoAuditPrompt falls back gracefully when SEO payload is not loaded', () => {
  const prompt = buildSeoAuditPrompt({
    query: {},
    dashboardData: {
      loadedSections: ['core'],
      filters: {
        segmentLabel: 'All traffic'
      },
      dataHealth: {
        items: []
      }
    }
  });

  assert.match(prompt, /Loaded dashboard sections in the current browser payload: core\./);
  assert.match(prompt, /Query intelligence is not currently loaded in the browser payload/);
  assert.match(prompt, /No data-health items are present in the current payload/);
  assert.match(prompt, /businessLine=all, service=all, sourceClass=all, device=all, pageType=all/);
});
