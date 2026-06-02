function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function roundMetric(value, digits = 1) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const factor = 10 ** digits;
  return Math.round(numericValue * factor) / factor;
}

function getPercentChange(currentValue, previousValue) {
  const currentNumeric = toNumber(currentValue, 0);
  const previousNumeric = toNumber(previousValue, 0);

  if (previousNumeric === 0) {
    if (currentNumeric === 0) {
      return 0;
    }

    return null;
  }

  return roundMetric(((currentNumeric - previousNumeric) / previousNumeric) * 100, 1);
}

function getMetricDelta(currentValue, previousValue) {
  return roundMetric(toNumber(currentValue, 0) - toNumber(previousValue, 0), 1);
}

function isMeaningfulMovement(percentChange, threshold = 10) {
  return percentChange !== null && Math.abs(percentChange) >= threshold;
}

function compareMetric(currentValue, previousValue) {
  return {
    current: toNumber(currentValue, 0),
    previous: toNumber(previousValue, 0),
    delta: getMetricDelta(currentValue, previousValue),
    percentChange: getPercentChange(currentValue, previousValue)
  };
}

function sortByPriority(items = []) {
  return [...items].sort((a, b) => (
    toNumber(b.priority, 0) - toNumber(a.priority, 0)
    || String(a.title || a.action || a.label || '').localeCompare(String(b.title || b.action || b.label || ''))
  ));
}

function formatPercentChange(percentChange) {
  if (percentChange === null) {
    return 'new versus zero baseline';
  }

  if (percentChange === 0) {
    return 'flat';
  }

  return `${percentChange > 0 ? '+' : ''}${percentChange}%`;
}

function getHealthItem(dataHealth, key) {
  return (dataHealth?.items || []).find((item) => item.key === key) || null;
}

function getRangeLabel(range = {}) {
  return `${range.from || 'unknown'} to ${range.to || 'unknown'}`;
}

function normalizeSegmentEntry(entry = {}, fallbackLabel = 'Unknown segment') {
  const current = entry.current || {};
  const previous = entry.previous || {};
  const currentTotals = current.seoContent?.totals || {};
  const previousTotals = previous.seoContent?.totals || {};

  return {
    key: entry.key || entry.value || fallbackLabel,
    label: entry.label || fallbackLabel,
    type: entry.type || 'segment',
    clicks: compareMetric(currentTotals.clicks, previousTotals.clicks),
    sessions: compareMetric(currentTotals.sessions, previousTotals.sessions),
    qualifiedLeads: compareMetric(currentTotals.qualifiedLeads, previousTotals.qualifiedLeads),
    leadRate: compareMetric(currentTotals.leadRate, previousTotals.leadRate),
    current
  };
}

function getSegmentStrengths(segmentSnapshots = {}) {
  return sortByPriority([
    ...(segmentSnapshots.businessLine || []).map((entry) => normalizeSegmentEntry(entry, 'Unknown business line')),
    ...(segmentSnapshots.service || []).map((entry) => normalizeSegmentEntry(entry, 'Unknown service')),
    ...(segmentSnapshots.pageType || []).map((entry) => normalizeSegmentEntry(entry, 'Unknown page type'))
  ])
    .filter((entry) => (
      entry.qualifiedLeads.current > 0
      || entry.clicks.current > 0
      || entry.sessions.current > 0
    ))
    .map((entry) => ({
      ...entry,
      priority: (
        (entry.qualifiedLeads.current * 40)
        + (entry.clicks.current / 5)
        + (entry.sessions.current / 10)
        + Math.max(entry.qualifiedLeads.delta, 0) * 25
      )
    }))
    .sort((a, b) => b.priority - a.priority || a.label.localeCompare(b.label))
    .slice(0, 3);
}

function getSegmentWeaknesses(segmentSnapshots = {}) {
  return [
    ...(segmentSnapshots.businessLine || []).map((entry) => normalizeSegmentEntry(entry, 'Unknown business line')),
    ...(segmentSnapshots.service || []).map((entry) => normalizeSegmentEntry(entry, 'Unknown service')),
    ...(segmentSnapshots.pageType || []).map((entry) => normalizeSegmentEntry(entry, 'Unknown page type'))
  ]
    .filter((entry) => (
      entry.clicks.current > 0
      || entry.sessions.current > 0
      || entry.qualifiedLeads.current > 0
    ))
    .map((entry) => ({
      ...entry,
      weaknessPriority: (
        Math.max(-entry.clicks.delta, 0)
        + (Math.max(-entry.qualifiedLeads.delta, 0) * 40)
        + (entry.clicks.current > 0 && entry.qualifiedLeads.current === 0 ? 35 : 0)
      )
    }))
    .sort((a, b) => b.weaknessPriority - a.weaknessPriority || a.label.localeCompare(b.label))
    .slice(0, 3);
}

export function getLastCompleteDateRange({ now = new Date(), days = 28 } = {}) {
  const endDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1
  ));
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - (Math.max(1, days) - 1));

  return {
    from: startDate.toISOString().slice(0, 10),
    to: endDate.toISOString().slice(0, 10)
  };
}

export function getPriorDateRange(range = {}) {
  const fromDate = new Date(`${range.from}T00:00:00.000Z`);
  const toDate = new Date(`${range.to}T00:00:00.000Z`);
  const days = Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
  const priorToDate = new Date(fromDate);
  priorToDate.setUTCDate(priorToDate.getUTCDate() - 1);
  const priorFromDate = new Date(priorToDate);
  priorFromDate.setUTCDate(priorToDate.getUTCDate() - (days - 1));

  return {
    from: priorFromDate.toISOString().slice(0, 10),
    to: priorToDate.toISOString().slice(0, 10)
  };
}

export function classifyOrganicTrustState({
  currentDashboardData,
  reportingWarnings = []
} = {}) {
  const dataHealth = currentDashboardData?.dataHealth || {};
  const organicEvidence = currentDashboardData?.executiveSummary?.organicEvidence || {};
  const searchConsoleHealth = getHealthItem(dataHealth, 'search_console');
  const ga4Health = getHealthItem(dataHealth, 'ga4');
  const serpHealth = getHealthItem(dataHealth, 'serp_keyword_rankings');
  const blockingReasons = [];
  const caveats = [];

  if (!searchConsoleHealth || ['error', 'stale', 'missing'].includes(searchConsoleHealth.status)) {
    blockingReasons.push('Search Console freshness is not decision-safe.');
  }

  if (['error', 'stale', 'missing'].includes(ga4Health?.status)) {
    caveats.push('GA4 freshness is degraded, so session and engagement conclusions are partially limited.');
  }

  if (['error', 'stale', 'missing'].includes(serpHealth?.status)) {
    caveats.push('SERP keyword snapshots are stale or missing, so device-specific ranking reads stay directional.');
  }

  if (reportingWarnings.includes('growth_query_daily_metrics_unavailable')) {
    blockingReasons.push('Persisted query intelligence is unavailable.');
  }

  if (organicEvidence?.joinHealth?.status === 'warning') {
    caveats.push('Some lead pages have query evidence without page-level organic evidence.');
  } else if (organicEvidence?.joinHealth?.status === 'partial') {
    caveats.push('Some lead pages have no organic page or query evidence in the selected period.');
  }

  if (['unattributed_rate', 'attribution_low_sample'].includes(currentDashboardData?.executiveSummary?.risk?.key)) {
    caveats.push('Attribution quality still needs manual review before strong paid or efficiency conclusions.');
  }

  if (blockingReasons.length > 0) {
    return {
      state: 'not decision-safe',
      blockers: blockingReasons,
      caveats
    };
  }

  if (caveats.length > 0) {
    return {
      state: 'trusted with caveats',
      blockers: [],
      caveats
    };
  }

  return {
    state: 'trusted',
    blockers: [],
    caveats: []
  };
}

function buildExecutiveSummarySection({
  currentDashboardData,
  previousDashboardData,
  trust
}) {
  const currentTotals = currentDashboardData?.seoContent?.totals || {};
  const previousTotals = previousDashboardData?.seoContent?.totals || {};
  const currentQueries = currentDashboardData?.seoQueries?.summary || {};
  const previousQueries = previousDashboardData?.seoQueries?.summary || {};
  const clicks = compareMetric(currentTotals.clicks, previousTotals.clicks);
  const impressions = compareMetric(currentTotals.impressions, previousTotals.impressions);
  const sessions = compareMetric(currentTotals.sessions, previousTotals.sessions);
  const qualifiedLeads = compareMetric(currentTotals.qualifiedLeads, previousTotals.qualifiedLeads);
  const ctr = compareMetric(currentQueries.organicCtr, previousQueries.organicCtr);
  const nonBrandedClicks = compareMetric(currentQueries.nonBrandedClicks, previousQueries.nonBrandedClicks);

  let overallStatus = 'stable';
  let mainTakeaway = 'Organic search is broadly stable versus the prior comparison window.';

  if (currentTotals.clicks === 0 && currentTotals.sessions === 0 && currentQueries.totalClicks === 0) {
    overallStatus = 'thin-volume';
    mainTakeaway = 'Organic evidence is still too thin in this slice to make a strong growth call.';
  } else if (
    isMeaningfulMovement(clicks.percentChange)
    && clicks.percentChange > 0
    && qualifiedLeads.delta > 0
  ) {
    overallStatus = 'growing';
    mainTakeaway = 'Organic search is growing with better commercial quality, not just more visibility.';
  } else if (
    isMeaningfulMovement(clicks.percentChange)
    && clicks.percentChange > 0
    && qualifiedLeads.current <= qualifiedLeads.previous
  ) {
    overallStatus = 'mixed';
    mainTakeaway = 'Organic traffic is up, but qualified demand is not rising with it, so this is a mixed SEO + CRO situation.';
  } else if (
    isMeaningfulMovement(clicks.percentChange)
    && clicks.percentChange < 0
  ) {
    overallStatus = 'under-pressure';
    mainTakeaway = 'Organic search is under pressure, with click volume lower than the prior comparable window.';
  } else if (currentQueries.cannibalizedQueryCount > 0) {
    overallStatus = 'constrained';
    mainTakeaway = 'Organic demand exists, but cannibalization and page-target clarity are constraining capture.';
  }

  return {
    overallStatus,
    trustState: trust.state,
    mainTakeaway,
    metrics: {
      clicks,
      impressions,
      sessions,
      qualifiedLeads,
      ctr,
      nonBrandedClicks
    }
  };
}

function buildStrongPointsSection({ currentDashboardData, previousDashboardData, segmentSnapshots }) {
  const strengths = [];
  const currentScorecardRows = currentDashboardData?.landingPageScorecard?.rows || [];
  const currentTopQueries = currentDashboardData?.seoQueries?.topQueries || [];
  const currentLandingPages = currentDashboardData?.seoContent?.landingPages || [];

  currentScorecardRows
    .filter((row) => row.qualifiedLeads > 0 || row.clicks > 0 || row.sessions > 0)
    .slice(0, 2)
    .forEach((row) => {
      const classification = row.qualifiedLeads > 0
        ? 'mixed SEO + CRO strength'
        : row.clicks >= 20
          ? 'traffic strength'
          : 'CTR strength';

      strengths.push({
        title: row.label,
        classification,
        evidencePanel: 'landingPageScorecard.rows',
        metric: `${row.clicks} clicks, ${row.sessions} sessions, ${row.qualifiedLeads} qualified leads, ${row.leadRate}% lead rate`,
        detail: `${row.label} is one of the strongest current landing pages for organic capture and commercial density.`,
        priority: (row.qualifiedLeads * 40) + row.clicks + row.sessions
      });
    });

  currentTopQueries
    .filter((row) => !row.isBranded && row.clicks > 0)
    .slice(0, 2)
    .forEach((row) => {
      const previousQuery = (previousDashboardData?.seoQueries?.topQueries || []).find((item) => item.key === row.key);
      strengths.push({
        title: row.label,
        classification: row.position !== null && row.position <= 10 ? 'ranking strength' : 'traffic strength',
        evidencePanel: 'seoQueries.topQueries',
        metric: `${row.clicks} clicks, ${row.impressions} impressions, ${row.ctr}% CTR, position ${row.position ?? 'n/a'}${previousQuery ? ` vs ${previousQuery.position ?? 'n/a'}` : ''}`,
        detail: `The current target page ${row.primaryLandingPage} is already capturing meaningful non-branded demand.`,
        priority: row.clicks + row.impressions / 20
      });
    });

  const segmentStrengths = getSegmentStrengths(segmentSnapshots);
  segmentStrengths.forEach((entry) => {
    strengths.push({
      title: entry.label,
      classification: entry.qualifiedLeads.current > 0 ? 'qualified-demand strength' : 'traffic strength',
      evidencePanel: `${entry.type} segment`,
      metric: `${entry.clicks.current} clicks (${formatPercentChange(entry.clicks.percentChange)}), ${entry.qualifiedLeads.current} qualified leads`,
      detail: `${entry.label} is currently one of the strongest organic segments in the selected window.`,
      priority: entry.priority
    });
  });

  currentLandingPages
    .filter((row) => row.qualifiedLeads > 0 && row.clicks > 0)
    .slice(0, 1)
    .forEach((row) => {
      strengths.push({
        title: row.label,
        classification: 'qualified-demand strength',
        evidencePanel: 'seoContent.landingPages',
        metric: `${row.clicks} clicks, ${row.sessions} sessions, ${row.qualifiedLeads} qualified leads`,
        detail: `${row.label} shows that organic traffic can already convert into qualified demand in the current setup.`,
        priority: (row.qualifiedLeads * 50) + row.clicks
      });
    });

  return sortByPriority(strengths).slice(0, 5);
}

function mapWeaknessType(rowType = '') {
  const mapping = {
    ctr_lift: 'weak CTR',
    decay_risk: 'decay risk',
    cannibalization: 'cannibalization',
    conversion_gap: 'conversion gap'
  };

  return mapping[rowType] || 'low visibility';
}

function buildWeakPointsSection({ currentDashboardData, previousDashboardData, trust, segmentSnapshots }) {
  const weaknesses = [];
  const contentRows = currentDashboardData?.contentOpportunities?.rows || [];
  const querySummary = currentDashboardData?.seoQueries?.summary || {};
  const currentTotals = currentDashboardData?.seoContent?.totals || {};
  const previousTotals = previousDashboardData?.seoContent?.totals || {};
  const formHealth = currentDashboardData?.formHealth?.summary || {};

  contentRows.slice(0, 4).forEach((row) => {
    weaknesses.push({
      title: row.label,
      classification: mapWeaknessType(row.type),
      evidencePanel: 'contentOpportunities.rows',
      detail: row.detail,
      whyNow: row.recommendation,
      priority: row.priorityScore || 0
    });
  });

  if (querySummary.cannibalizedQueryCount > 0) {
    weaknesses.push({
      title: 'Cannibalized non-branded queries',
      classification: 'cannibalization',
      evidencePanel: 'seoQueries.summary',
      detail: `${querySummary.cannibalizedQueryCount} queries currently map to more than one landing page.`,
      whyNow: 'That splits authority and makes page-level SEO recommendations less efficient until one primary target page is chosen.',
      priority: querySummary.cannibalizedQueryCount * 25
    });
  }

  if (currentTotals.sessions > 0 && currentTotals.qualifiedLeads === 0) {
    weaknesses.push({
      title: 'Organic traffic is not turning into qualified demand',
      classification: 'conversion gap',
      evidencePanel: 'seoContent.totals',
      detail: `${currentTotals.sessions} sessions and ${currentTotals.clicks} clicks produced no qualified organic leads in the selected period.`,
      whyNow: 'More traffic would likely mask a CRO or qualification issue instead of fixing it.',
      priority: currentTotals.sessions + currentTotals.clicks
    });
  }

  if (formHealth.starts > 0 && formHealth.submitSuccesses === 0) {
    weaknesses.push({
      title: 'Organic traffic reaches forms, but form completion is not proven',
      classification: 'conversion gap',
      evidencePanel: 'formHealth.summary',
      detail: `${formHealth.starts} form starts with ${formHealth.submitSuccesses} submit successes recorded in the current window.`,
      whyNow: 'That blocks a clean SEO read because the bottleneck may be form friction, not traffic quality.',
      priority: formHealth.starts * 5
    });
  }

  if (trust.state !== 'trusted') {
    weaknesses.push({
      title: 'Organic review trust is partially constrained',
      classification: 'query-page mismatch',
      evidencePanel: 'dataHealth + executiveSummary.organicEvidence',
      detail: [...trust.blockers, ...trust.caveats].join(' '),
      whyNow: 'Major SEO or paid decisions should be downgraded until trust blockers are cleared.',
      priority: 90
    });
  }

  const segmentWeaknesses = getSegmentWeaknesses(segmentSnapshots);
  segmentWeaknesses.forEach((entry) => {
    if (entry.weaknessPriority <= 0) {
      return;
    }

    weaknesses.push({
      title: entry.label,
      classification: entry.qualifiedLeads.current === 0 && entry.clicks.current > 0 ? 'conversion gap' : 'low visibility',
      evidencePanel: `${entry.type} segment`,
      detail: `${entry.label} is contributing more drag than lift right now: ${entry.clicks.current} clicks (${formatPercentChange(entry.clicks.percentChange)}), ${entry.qualifiedLeads.current} qualified leads.`,
      whyNow: 'This identifies whether the weakness is concentrated in one service, business line, or page type rather than global.',
      priority: entry.weaknessPriority
    });
  });

  if (isMeaningfulMovement(getPercentChange(currentTotals.clicks, previousTotals.clicks), 15) && currentTotals.clicks < previousTotals.clicks) {
    weaknesses.push({
      title: 'Organic click volume is down materially versus the prior window',
      classification: 'decay risk',
      evidencePanel: 'seoContent.totals',
      detail: `${previousTotals.clicks} clicks in the prior window versus ${currentTotals.clicks} now.`,
      whyNow: 'A broad click decline raises the priority of decay diagnosis before new-page expansion.',
      priority: previousTotals.clicks - currentTotals.clicks
    });
  }

  return sortByPriority(weaknesses).slice(0, 5);
}

function mapOpportunityRoute(row = {}) {
  if (row.type === 'conversion_gap') {
    return 'Mixed SEO + CRO';
  }

  if (row.type === 'ctr_lift' || row.type === 'decay_risk' || row.type === 'cannibalization') {
    return 'SEO-only';
  }

  return 'SEO-only';
}

function buildOpportunityItem(row = {}, fallback = {}) {
  const route = fallback.route || mapOpportunityRoute(row);
  const kpi = row.type === 'conversion_gap'
    ? 'qualified organic leads'
    : row.type === 'ctr_lift'
      ? 'organic CTR'
      : row.type === 'cannibalization'
        ? 'non-branded clicks on the chosen primary page'
        : 'organic clicks';

  return {
    title: row.label || fallback.title,
    route,
    owner: route === 'Mixed SEO + CRO' ? 'Growth owner' : 'SEO owner',
    kpi,
    evidencePanel: fallback.evidencePanel || 'contentOpportunities.rows',
    whyNow: row.recommendation || fallback.whyNow || 'This is one of the highest-leverage organic actions visible in the dashboard right now.',
    priority: row.priorityScore || fallback.priority || 0,
    action: fallback.action || row.typeLabel || 'SEO action'
  };
}

function buildOpportunitiesSection({ currentDashboardData }) {
  const opportunities = [];
  const contentRows = currentDashboardData?.contentOpportunities?.rows || [];
  const queryOpportunities = currentDashboardData?.seoQueries?.opportunities || [];
  const landingPageRows = currentDashboardData?.landingPageScorecard?.rows || [];

  contentRows.slice(0, 4).forEach((row) => {
    opportunities.push(buildOpportunityItem(row));
  });

  queryOpportunities
    .filter((row) => !row.isBranded && row.impressions >= 50)
    .slice(0, 2)
    .forEach((row) => {
      const isLocalIntent = /tunis|tunisie|tunisia/i.test(row.label);
      opportunities.push({
        title: row.label,
        route: 'SEO-only',
        owner: 'SEO owner',
        kpi: row.ctr < 4 ? 'organic CTR' : 'non-branded clicks',
        evidencePanel: 'seoQueries.opportunities',
        whyNow: isLocalIntent
          ? `Local-intent demand is already visible for ${row.label}, so improving ${row.primaryLandingPage} could unlock faster commercial upside in Tunis or Tunisia.`
          : `The current target ${row.primaryLandingPage} is visible enough to win more traffic without waiting for a brand-new ranking base.`,
        priority: row.opportunityScore || row.impressions || 0,
        action: row.ctr < 4 ? 'title/meta rewrite' : 'content expansion/refresh'
      });
    });

  landingPageRows
    .filter((row) => row.clicks >= 20 && row.qualifiedLeads === 0)
    .slice(0, 2)
    .forEach((row) => {
      opportunities.push({
        title: row.label,
        route: 'Mixed SEO + CRO',
        owner: 'Growth owner',
        kpi: 'qualified organic leads',
        evidencePanel: 'landingPageScorecard.rows',
        whyNow: `${row.clicks} clicks and ${row.sessions} sessions are already landing here, so this page has room for CRO-led improvement before more SEO expansion.`,
        priority: row.opportunityScore || row.clicks || 0,
        action: 'CRO handoff instead of more traffic'
      });
    });

  const uniqueOpportunities = Array.from(
    new Map(opportunities.map((item) => [`${item.title}||${item.route}`, item])).values()
  );

  return sortByPriority(uniqueOpportunities).slice(0, 5);
}

function buildImprovementRoomSection({ currentDashboardData, opportunities }) {
  const takenTitles = new Set(opportunities.map((item) => item.title));
  const landingPageRows = currentDashboardData?.landingPageScorecard?.rows || [];
  const queryRows = currentDashboardData?.seoQueries?.topQueries || [];
  const items = [];

  landingPageRows
    .filter((row) => !takenTitles.has(row.label) && (row.clicks > 0 || row.sessions > 0))
    .slice(0, 2)
    .forEach((row) => {
      items.push({
        title: row.label,
        detail: `${row.clicks} clicks and ${row.sessions} sessions already exist here, but the page is not yet one of the top-ranked opportunities.`,
        evidencePanel: 'landingPageScorecard.rows'
      });
    });

  queryRows
    .filter((row) => !row.isBranded && !takenTitles.has(row.label))
    .slice(0, 2)
    .forEach((row) => {
      items.push({
        title: row.label,
        detail: `${row.impressions} impressions at ${row.ctr}% CTR leave room for improvement without inventing a new keyword target.`,
        evidencePanel: 'seoQueries.topQueries'
      });
    });

  return items.slice(0, 4);
}

function buildPaidDecisionSection({ currentDashboardData, trust, opportunities, weaknesses }) {
  const seoTotals = currentDashboardData?.seoContent?.totals || {};
  const seoSummary = currentDashboardData?.seoQueries?.summary || {};
  const ctaSummary = currentDashboardData?.ctaPerformance?.summary || {};
  const formSummary = currentDashboardData?.formHealth?.summary || {};
  const blockers = [];

  if (trust.state !== 'trusted') {
    blockers.push('organic trust state is not fully clean');
  }

  if (formSummary.starts > 0 && formSummary.submitSuccesses === 0) {
    blockers.push('form completion is not yet proven');
  }

  if (ctaSummary.impressions > 0 && ctaSummary.clicks === 0) {
    blockers.push('CTA engagement is weak');
  }

  if (seoTotals.sessions > 0 && seoTotals.qualifiedLeads === 0) {
    blockers.push('organic traffic is not yet proving qualified demand');
  }

  if (weaknesses.some((item) => item.classification === 'conversion gap')) {
    blockers.push('the current bottleneck still looks like mixed SEO + CRO rather than reach alone');
  }

  const provenCommercialDemand = seoTotals.qualifiedLeads > 0;
  const rankingBottleneck = toNumber(seoSummary.averagePosition, 0) >= 8 && toNumber(seoSummary.nonBrandedClicks, 0) > 0;
  const cheaperSeoWinsRemain = opportunities.some((item) => item.route !== 'CRO-only');

  if (blockers.length > 0) {
    return {
      state: 'not needed yet',
      reason: `Paid should stay blocked because ${blockers.join(', ')}.`,
      blockers
    };
  }

  if (provenCommercialDemand && rankingBottleneck && !cheaperSeoWinsRemain) {
    return {
      state: 'launch pilot',
      reason: 'Organic demand quality is proven, the landing path is healthy, and ranking depth still looks like the main growth bottleneck.',
      blockers: []
    };
  }

  if (provenCommercialDemand && rankingBottleneck) {
    return {
      state: 'test later',
      reason: 'Paid may be justified later, but there are still cheaper SEO wins visible in the dashboard first.',
      blockers: []
    };
  }

  return {
    state: 'not needed yet',
    reason: 'Paid is not justified yet because proven commercial demand from organic is still too thin for a clean pilot decision.',
    blockers: []
  };
}

function buildActionBoard(opportunities = [], trust = null, paidDecision = null) {
  const actions = opportunities.map((item) => ({
    action: item.action,
    segment: item.title,
    evidencePanel: item.evidencePanel,
    owner: item.owner,
    kpi: item.kpi,
    route: item.route,
    whyNow: item.whyNow,
    priority: item.priority
  }));

  if (trust?.state !== 'trusted') {
    actions.unshift({
      action: 'trust and alignment check',
      segment: 'All organic',
      evidencePanel: 'dataHealth + executiveSummary.organicEvidence',
      owner: 'Growth owner',
      kpi: 'decision-safe review state',
      route: 'Operational',
      whyNow: [...trust.blockers, ...trust.caveats].join(' '),
      priority: 999
    });
  }

  if (paidDecision?.state === 'not needed yet' && paidDecision.reason) {
    actions.push({
      action: 'keep paid blocked',
      segment: 'All organic',
      evidencePanel: 'paid campaign decision gate',
      owner: 'Growth owner',
      kpi: 'qualified organic leads',
      route: 'Governance',
      whyNow: paidDecision.reason,
      priority: 1
    });
  }

  return sortByPriority(actions).slice(0, 5);
}

export function buildOrganicSearchReview({
  currentDashboardData,
  previousDashboardData,
  segmentSnapshots = {},
  reportingWarnings = [],
  range = {},
  previousRange = {}
} = {}) {
  const trust = classifyOrganicTrustState({
    currentDashboardData,
    reportingWarnings
  });
  const executiveSummary = buildExecutiveSummarySection({
    currentDashboardData,
    previousDashboardData,
    trust
  });
  const strongPoints = buildStrongPointsSection({
    currentDashboardData,
    previousDashboardData,
    segmentSnapshots
  });
  const weakPoints = buildWeakPointsSection({
    currentDashboardData,
    previousDashboardData,
    trust,
    segmentSnapshots
  });
  const opportunities = buildOpportunitiesSection({
    currentDashboardData
  });
  const improvementRoom = buildImprovementRoomSection({
    currentDashboardData,
    opportunities
  });
  const paidDecision = buildPaidDecisionSection({
    currentDashboardData,
    trust,
    opportunities,
    weaknesses: weakPoints
  });
  const actionBoard = buildActionBoard(opportunities, trust, paidDecision);

  return {
    generatedAt: new Date().toISOString(),
    range,
    previousRange,
    trust,
    executiveSummary,
    strongPoints,
    weakPoints,
    opportunities,
    improvementRoom,
    paidDecision,
    actionBoard
  };
}

export function formatOrganicSearchReviewMarkdown(review = {}) {
  const lines = [
    '# Organic Search Review',
    '',
    `Window: ${getRangeLabel(review.range)} vs ${getRangeLabel(review.previousRange)}`,
    `Generated at: ${review.generatedAt || 'unknown'}`,
    '',
    '**Executive summary**',
    `- Overall organic status: ${review.executiveSummary?.overallStatus || 'unknown'}`,
    `- Trust state: ${review.trust?.state || 'unknown'}`,
    `- Main takeaway: ${review.executiveSummary?.mainTakeaway || 'No summary generated.'}`,
    `- Clicks: ${review.executiveSummary?.metrics?.clicks?.current ?? 0} vs ${review.executiveSummary?.metrics?.clicks?.previous ?? 0} (${formatPercentChange(review.executiveSummary?.metrics?.clicks?.percentChange)})`,
    `- Impressions: ${review.executiveSummary?.metrics?.impressions?.current ?? 0} vs ${review.executiveSummary?.metrics?.impressions?.previous ?? 0} (${formatPercentChange(review.executiveSummary?.metrics?.impressions?.percentChange)})`,
    `- Sessions: ${review.executiveSummary?.metrics?.sessions?.current ?? 0} vs ${review.executiveSummary?.metrics?.sessions?.previous ?? 0} (${formatPercentChange(review.executiveSummary?.metrics?.sessions?.percentChange)})`,
    `- Qualified organic demand: ${review.executiveSummary?.metrics?.qualifiedLeads?.current ?? 0} vs ${review.executiveSummary?.metrics?.qualifiedLeads?.previous ?? 0} (${formatPercentChange(review.executiveSummary?.metrics?.qualifiedLeads?.percentChange)})`
  ];

  if ((review.trust?.blockers || []).length > 0) {
    lines.push('- Trust blockers:');
    review.trust.blockers.forEach((item) => {
      lines.push(`  - ${item}`);
    });
  }

  if ((review.trust?.caveats || []).length > 0) {
    lines.push('- Trust caveats:');
    review.trust.caveats.forEach((item) => {
      lines.push(`  - ${item}`);
    });
  }

  lines.push('', '**Strong points**');
  if ((review.strongPoints || []).length === 0) {
    lines.push('- No decision-safe strengths surfaced yet.');
  } else {
    review.strongPoints.forEach((item) => {
      lines.push(`- ${item.title}: ${item.classification}. ${item.detail} Evidence: ${item.evidencePanel}. KPI: ${item.metric}.`);
    });
  }

  lines.push('', '**Weak points**');
  if ((review.weakPoints || []).length === 0) {
    lines.push('- No acute weak points surfaced from the current dashboard evidence.');
  } else {
    review.weakPoints.forEach((item) => {
      lines.push(`- ${item.title}: ${item.classification}. ${item.detail} Why it matters: ${item.whyNow} Evidence: ${item.evidencePanel}.`);
    });
  }

  lines.push('', '**Opportunities**');
  if ((review.opportunities || []).length === 0) {
    lines.push('- No decision-safe opportunities surfaced yet.');
  } else {
    review.opportunities.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.title} | Route: ${item.route} | Owner: ${item.owner} | KPI: ${item.kpi} | Evidence: ${item.evidencePanel}. Why now: ${item.whyNow}`);
    });
  }

  lines.push('', '**Improvement room**');
  if ((review.improvementRoom || []).length === 0) {
    lines.push('- No secondary improvement room beyond the ranked action list.');
  } else {
    review.improvementRoom.forEach((item) => {
      lines.push(`- ${item.title}: ${item.detail} Evidence: ${item.evidencePanel}.`);
    });
  }

  lines.push('', '**Paid campaign decision**');
  lines.push(`- Decision: ${review.paidDecision?.state || 'unknown'}`);
  lines.push(`- Reason: ${review.paidDecision?.reason || 'No decision reason generated.'}`);

  lines.push('', '**30-day action board**');
  lines.push('| Action | Segment | Evidence panel | Owner | KPI to move | Route | Why now |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');
  (review.actionBoard || []).forEach((item) => {
    lines.push(`| ${item.action} | ${item.segment} | ${item.evidencePanel} | ${item.owner} | ${item.kpi} | ${item.route} | ${item.whyNow} |`);
  });

  return `${lines.join('\n')}\n`;
}
