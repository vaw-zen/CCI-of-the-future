import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOrganicSearchReview,
  classifyOrganicTrustState,
  formatOrganicSearchReviewMarkdown
} from '../src/libs/organicSearchReview.mjs';

function buildDashboardData(overrides = {}) {
  return {
    range: {
      from: '2026-05-04',
      to: '2026-05-31',
      days: 28
    },
    dataHealth: {
      items: [
        {
          key: 'search_console',
          status: 'fresh'
        },
        {
          key: 'ga4',
          status: 'fresh'
        },
        {
          key: 'serp_keyword_rankings',
          status: 'fresh'
        }
      ]
    },
    executiveSummary: {
      risk: {
        key: 'no_acute_risk'
      },
      organicEvidence: {
        joinHealth: {
          status: 'clear'
        }
      }
    },
    seoContent: {
      totals: {
        clicks: 80,
        impressions: 1200,
        sessions: 95,
        qualifiedLeads: 3,
        leadRate: 3.2
      },
      landingPages: [
        {
          label: '/tapis',
          clicks: 34,
          sessions: 40,
          qualifiedLeads: 2
        }
      ]
    },
    seoQueries: {
      summary: {
        totalQueries: 20,
        totalClicks: 80,
        totalImpressions: 1200,
        nonBrandedClicks: 55,
        organicCtr: 6.7,
        averagePosition: 9.8,
        cannibalizedQueryCount: 0
      },
      topQueries: [
        {
          key: 'tapis',
          label: 'nettoyage tapis tunis',
          isBranded: false,
          clicks: 20,
          impressions: 240,
          ctr: 8.3,
          position: 7.2,
          primaryLandingPage: '/tapis'
        }
      ],
      opportunities: [
        {
          label: 'nettoyage tapis tunis',
          isBranded: false,
          impressions: 240,
          ctr: 3.8,
          opportunityScore: 110,
          primaryLandingPage: '/tapis'
        }
      ]
    },
    contentOpportunities: {
      rows: [
        {
          key: 'ctr:/tapis',
          type: 'ctr_lift',
          typeLabel: 'CTR lift',
          label: '/tapis',
          detail: 'CTR is lower than it should be.',
          recommendation: 'Rewrite titles and descriptions.',
          priorityScore: 85
        }
      ]
    },
    landingPageScorecard: {
      rows: [
        {
          key: '/tapis',
          label: '/tapis',
          clicks: 34,
          sessions: 40,
          qualifiedLeads: 2,
          effectiveQualifiedLeads: 2,
          whatsappClicks: 0,
          whatsappAttributedLeads: 0,
          whatsappDirectLeads: 0,
          leadRate: 5,
          opportunityScore: 90
        }
      ]
    },
    ctaPerformance: {
      summary: {
        impressions: 40,
        clicks: 6
      }
    },
    formHealth: {
      summary: {
        starts: 5,
        submitSuccesses: 2
      }
    },
    filters: {
      options: {
        businessLine: [
          { value: 'b2c', label: 'B2C' }
        ],
        service: [
          { value: 'tapis', label: 'Tapis / moquettes' }
        ],
        pageType: [
          { value: 'service', label: 'Service page' }
        ]
      }
    },
    ...overrides
  };
}

test('classifyOrganicTrustState marks stale Search Console as not decision-safe', () => {
  const trust = classifyOrganicTrustState({
    currentDashboardData: buildDashboardData({
      dataHealth: {
        items: [
          { key: 'search_console', status: 'stale' },
          { key: 'ga4', status: 'fresh' },
          { key: 'serp_keyword_rankings', status: 'fresh' }
        ]
      }
    })
  });

  assert.equal(trust.state, 'not decision-safe');
  assert.match(trust.blockers[0], /Search Console freshness/);
});

test('buildOrganicSearchReview blocks paid when traffic rises but qualified demand stays flat', () => {
  const currentDashboardData = buildDashboardData({
    seoContent: {
      totals: {
        clicks: 120,
        impressions: 2000,
        sessions: 150,
        qualifiedLeads: 0,
        leadRate: 0
      }
    },
    landingPageScorecard: {
      rows: [
        {
          key: '/tapis',
          label: '/tapis',
          clicks: 60,
          sessions: 75,
          qualifiedLeads: 0,
          leadRate: 0,
          opportunityScore: 110
        }
      ]
    },
    contentOpportunities: {
      rows: [
        {
          key: 'conversion:/tapis',
          type: 'conversion_gap',
          typeLabel: 'Conversion gap',
          label: '/tapis',
          detail: 'Traffic is there but qualified demand is missing.',
          recommendation: 'Audit CTA and form flow.',
          priorityScore: 120
        }
      ]
    },
    formHealth: {
      summary: {
        starts: 9,
        submitSuccesses: 0
      }
    }
  });
  const previousDashboardData = buildDashboardData({
    seoContent: {
      totals: {
        clicks: 80,
        impressions: 1400,
        sessions: 95,
        qualifiedLeads: 0,
        leadRate: 0
      }
    }
  });

  const review = buildOrganicSearchReview({
    currentDashboardData,
    previousDashboardData,
    segmentSnapshots: {
      businessLine: [],
      service: [],
      pageType: []
    },
    range: currentDashboardData.range,
    previousRange: previousDashboardData.range
  });

  assert.equal(review.executiveSummary.overallStatus, 'mixed');
  assert.equal(review.paidDecision.state, 'not needed yet');
  assert.match(review.paidDecision.reason, /form completion is not yet proven/);

  const markdown = formatOrganicSearchReviewMarkdown(review);
  assert.match(markdown, /\*\*Paid campaign decision\*\*/);
  assert.match(markdown, /Decision: not needed yet/);
});

test('buildOrganicSearchReview reclassifies WhatsApp-assisted article demand as a strength', () => {
  const articlePath = '/conseils/retapissage-rembourrage-professionnel-tunis-sur-mesure';
  const currentDashboardData = buildDashboardData({
    seoContent: {
      totals: {
        clicks: 96,
        impressions: 1800,
        sessions: 88,
        qualifiedLeads: 0,
        leadRate: 0
      }
    },
    landingPageScorecard: {
      rows: [
        {
          key: articlePath,
          label: articlePath,
          clicks: 44,
          sessions: 39,
          qualifiedLeads: 0,
          effectiveQualifiedLeads: 1,
          whatsappClicks: 6,
          whatsappAttributedLeads: 1,
          whatsappDirectLeads: 1,
          leadRate: 0,
          opportunityScore: 125
        }
      ]
    },
    contentOpportunities: {
      rows: []
    },
    formHealth: {
      summary: {
        starts: 4,
        submitSuccesses: 0
      }
    }
  });
  const previousDashboardData = buildDashboardData({
    seoContent: {
      totals: {
        clicks: 70,
        impressions: 1400,
        sessions: 61,
        qualifiedLeads: 0,
        leadRate: 0
      }
    }
  });

  const review = buildOrganicSearchReview({
    currentDashboardData,
    previousDashboardData,
    segmentSnapshots: {
      businessLine: [],
      service: [],
      pageType: []
    },
    range: currentDashboardData.range,
    previousRange: previousDashboardData.range
  });

  assert.equal(review.executiveSummary.overallStatus, 'assisted-conversion');
  assert.equal(review.strongPoints[0]?.classification, 'mixed SEO + WhatsApp strength');
  assert.match(review.strongPoints[0]?.detail || '', /WhatsApp-assisted paths/i);
  assert.equal(
    review.weakPoints.some((item) => /not turning into qualified demand/i.test(item.title)),
    false
  );
  assert.equal(
    review.paidDecision.blockers.includes('form completion is not yet proven'),
    false
  );

  const markdown = formatOrganicSearchReviewMarkdown(review);
  assert.match(markdown, /WhatsApp-assisted demand: 1 attributed site leads, 1 direct WhatsApp leads/);
});
