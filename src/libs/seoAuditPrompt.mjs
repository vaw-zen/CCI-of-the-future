function normalizePromptValue(value, fallback = 'all') {
  const normalized = String(value || '').trim();
  return normalized || fallback;
}

function normalizePromptText(value, fallback = 'unknown') {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function formatPromptMetric(value, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return 'unknown';
  }

  return `${String(value)}${suffix}`;
}

function formatPromptBoolean(value) {
  return value ? 'yes' : 'no';
}

function buildRunContextLines({ query = {}, dashboardData = null } = {}) {
  const range = dashboardData?.range || {};
  const filters = dashboardData?.filters || {};
  const seoQueries = dashboardData?.seoQueries || null;
  const seoContent = dashboardData?.seoContent || null;
  const landingPageScorecard = dashboardData?.landingPageScorecard || null;
  const contentOpportunities = dashboardData?.contentOpportunities || null;
  const keywordRankings = seoContent?.keywordRankings || null;
  const topQueryOpportunity = seoQueries?.opportunities?.[0] || null;
  const topLandingPage = landingPageScorecard?.rows?.[0] || null;
  const topKeywordRow = keywordRankings?.rows?.[0] || null;
  const loadedSections = Array.isArray(dashboardData?.loadedSections) && dashboardData.loadedSections.length > 0
    ? dashboardData.loadedSections.join(', ')
    : 'core only or unknown';
  const reportingWarnings = Array.isArray(dashboardData?.diagnostics?.reportingWarnings)
    ? dashboardData.diagnostics.reportingWarnings
    : [];
  const opportunityTypes = Array.isArray(contentOpportunities?.rows)
    ? Array.from(new Set(contentOpportunities.rows.map((row) => normalizePromptText(row.type, '')).filter(Boolean)))
    : [];
  const dataHealthItems = Array.isArray(dashboardData?.dataHealth?.items)
    ? dashboardData.dataHealth.items
    : [];

  const lines = [
    'Active run context from the current admin dashboard session:',
    `- Review window: ${normalizePromptValue(query.from || range.from, 'last 28 complete days')} to ${normalizePromptValue(query.to || range.to, 'current day')} (${formatPromptMetric(range.days, ' days')}).`,
    `- Segment label: ${normalizePromptText(filters.segmentLabel, 'All traffic')}.`,
    `- Applied filters: businessLine=${normalizePromptValue(query.businessLine || filters?.applied?.businessLine)}, service=${normalizePromptValue(query.service || filters?.applied?.service)}, sourceClass=${normalizePromptValue(query.sourceClass || filters?.applied?.sourceClass)}, device=${normalizePromptValue(query.device || filters?.applied?.device)}, pageType=${normalizePromptValue(query.pageType || filters?.applied?.pageType)}.`,
    `- Loaded dashboard sections in the current browser payload: ${loadedSections}.`
  ];

  if (Array.isArray(filters.notes) && filters.notes.length > 0) {
    lines.push('- Segment caveats from the dashboard:');
    filters.notes.slice(0, 4).forEach((note) => {
      lines.push(`  - ${normalizePromptText(note)}.`);
    });
  }

  if (reportingWarnings.length > 0) {
    lines.push(`- Reporting warnings already present in the payload: ${reportingWarnings.join(', ')}.`);
  } else {
    lines.push('- Reporting warnings already present in the payload: none.');
  }

  lines.push('- Current data-health snapshot:');
  if (dataHealthItems.length === 0) {
    lines.push('  - No data-health items are present in the current payload. Treat trust as unknown until verified.');
  } else {
    dataHealthItems.forEach((item) => {
      lines.push(
        `  - ${normalizePromptText(item.label)}: status=${normalizePromptText(item.status, 'unknown')}; freshestMetricDate=${normalizePromptText(item.freshestMetricDate, 'unknown')}; asOf=${normalizePromptText(item.asOf, 'unknown')}; note=${normalizePromptText(item.message || item.lastError, 'none')}.`
      );
    });
  }

  lines.push('- Current SEO snapshot from the loaded payload:');

  if (seoQueries?.summary) {
    lines.push(
      `  - Query intelligence: totalQueries=${formatPromptMetric(seoQueries.summary.totalQueries)}; nonBrandedClicks=${formatPromptMetric(seoQueries.summary.nonBrandedClicks)}; nonBrandedClickShare=${formatPromptMetric(seoQueries.summary.nonBrandedClickShare, '%')}; totalClicks=${formatPromptMetric(seoQueries.summary.totalClicks)}; totalImpressions=${formatPromptMetric(seoQueries.summary.totalImpressions)}; averagePosition=${formatPromptMetric(seoQueries.summary.averagePosition)}; cannibalizedQueryCount=${formatPromptMetric(seoQueries.summary.cannibalizedQueryCount)}.`
    );
  } else {
    lines.push('  - Query intelligence is not currently loaded in the browser payload. Inspect repo sources or refresh the SEO section before final prioritization.');
  }

  if (topQueryOpportunity) {
    lines.push(
      `  - Top non-branded query opportunity currently visible: query="${normalizePromptText(topQueryOpportunity.label)}"; target="${normalizePromptText(topQueryOpportunity.primaryLandingPage, '/')}"; cluster="${normalizePromptText(topQueryOpportunity.clusterLabel, 'Other')}"; clicks=${formatPromptMetric(topQueryOpportunity.clicks)}; impressions=${formatPromptMetric(topQueryOpportunity.impressions)}; ctr=${formatPromptMetric(topQueryOpportunity.ctr, '%')}; position=${formatPromptMetric(topQueryOpportunity.position)}; opportunityScore=${formatPromptMetric(topQueryOpportunity.opportunityScore)}.`
    );
  }

  if (topLandingPage) {
    lines.push(
      `  - Top landing-page scorecard row currently visible: url="${normalizePromptText(topLandingPage.label, '/')}"; clicks=${formatPromptMetric(topLandingPage.clicks)}; sessions=${formatPromptMetric(topLandingPage.sessions)}; qualifiedLeads=${formatPromptMetric(topLandingPage.qualifiedLeads)}; leadRate=${formatPromptMetric(topLandingPage.leadRate, '%')}; opportunityScore=${formatPromptMetric(topLandingPage.opportunityScore)}.`
    );
  }

  if (seoContent?.totals) {
    lines.push(
      `  - Organic totals: clicks=${formatPromptMetric(seoContent.totals.clicks)}; impressions=${formatPromptMetric(seoContent.totals.impressions)}; sessions=${formatPromptMetric(seoContent.totals.sessions)}; events=${formatPromptMetric(seoContent.totals.events)}; qualifiedLeads=${formatPromptMetric(seoContent.totals.qualifiedLeads)}; leadRate=${formatPromptMetric(seoContent.totals.leadRate, '%')}; leadRateBase=${normalizePromptText(seoContent.totals.leadRateBase, 'unknown')}.`
    );
  }

  if (keywordRankings?.totals) {
    lines.push(
      `  - Keyword snapshot: trackedKeywords=${formatPromptMetric(keywordRankings.totals.trackedKeywords)}; rankedKeywords=${formatPromptMetric(keywordRankings.totals.rankedKeywords)}; desktopRankedKeywords=${formatPromptMetric(keywordRankings.totals.desktopRankedKeywords)}; mobileRankedKeywords=${formatPromptMetric(keywordRankings.totals.mobileRankedKeywords)}; top10Count=${formatPromptMetric(keywordRankings.totals.top10Count)}; averagePosition=${formatPromptMetric(keywordRankings.totals.averagePosition)}; usingReferenceFallback=${formatPromptBoolean(keywordRankings.usingReferenceFallback)}; latestMetricDate=${normalizePromptText(keywordRankings.latestMetricDate, 'unknown')}.`
    );
  }

  if (topKeywordRow) {
    lines.push(
      `  - Top keyword row currently visible: keyword="${normalizePromptText(topKeywordRow.label)}"; targetPath="${normalizePromptText(topKeywordRow.targetPath, '/')}"; hasLiveSnapshots=${formatPromptBoolean(topKeywordRow.hasLiveSnapshots)}.`
    );
  }

  if (opportunityTypes.length > 0) {
    lines.push(`  - Content opportunity buckets already present in the payload: ${opportunityTypes.join(', ')}.`);
  }

  return lines;
}

export function buildSeoAuditPrompt({ query = {}, dashboardData = null } = {}) {
  const from = normalizePromptValue(query.from || dashboardData?.range?.from, 'last 28 complete days');
  const to = normalizePromptValue(query.to || dashboardData?.range?.to, 'current day');
  const businessLine = normalizePromptValue(query.businessLine || dashboardData?.filters?.applied?.businessLine);
  const service = normalizePromptValue(query.service || dashboardData?.filters?.applied?.service);
  const sourceClass = normalizePromptValue(query.sourceClass || dashboardData?.filters?.applied?.sourceClass);
  const device = normalizePromptValue(query.device || dashboardData?.filters?.applied?.device);
  const pageType = normalizePromptValue(query.pageType || dashboardData?.filters?.applied?.pageType);

  return [
    'You are a senior SEO and growth intelligence operator working inside the CCI Services repo and reporting environment.',
    '',
    ...buildRunContextLines({ query, dashboardData }),
    '',
    'Your job is to produce a functional SEO and organic-search action plan based on the real data and dashboard logic already implemented in this codebase.',
    '',
    'Do not give generic SEO advice. Inspect the repo, dashboard logic, reporting tables, and available connectors first, then produce a decision-ready plan.',
    '',
    'Business context:',
    '- Company: CCI Services',
    '- Market: Tunis, Tunisia',
    '- Focus: local-service SEO and commercially relevant organic search growth',
    '- Default goal: improve organic traffic quality, rankings, CTR, and qualified organic demand, not impressions alone',
    '',
    'Required filters:',
    `- from=${from}`,
    `- to=${to}`,
    `- businessLine=${businessLine}`,
    `- service=${service}`,
    `- sourceClass=${sourceClass}`,
    `- device=${device}`,
    `- pageType=${pageType}`,
    '',
    'Filter rules:',
    '- If any filter is blank or unavailable, treat it as all.',
    '- If no date range is supplied, default to the last 28 complete days and compare against the prior 28 days.',
    '- Respect repo semantics: query intelligence is currently cross-device, while device analysis belongs to SERP ranking snapshots.',
    '',
    'Inspect these repo artifacts first if available:',
    '- assist-vault/GROWTH_DASHBOARD_METRIC_DEFINITIONS.md',
    '- assist-vault/GROWTH_DASHBOARD_RUNBOOK.md',
    '- assist-vault/GROWTH_DASHBOARD_STAGE3_SPRINT_SELECTION_WORKFLOW.md',
    '- assist-vault/GROWTH_DASHBOARD_SEO_AUDIT_MASTER_PROMPT.md',
    '- src/app/admin/dashboard/page.jsx',
    '- src/libs/adminDashboardMetrics.mjs',
    '- src/app/api/admin/dashboard/route.js',
    '- src/libs/growthReporting.mjs',
    '',
    'Use these dashboard sections and reporting tables as the primary evidence base when available:',
    '- dataHealth',
    '- seoQueries',
    '- contentOpportunities',
    '- landingPageScorecard',
    '- seoContent',
    '- ctaPerformance',
    '- formHealth',
    '- contactIntent',
    '- growth_reporting_source_health',
    '- growth_query_daily_metrics',
    '- growth_landing_page_scores_daily',
    '- growth_keyword_rankings_daily',
    '- growth_channel_daily_metrics_normalized',
    '- growth_behavior_daily_metrics',
    '',
    'Supplementary evidence:',
    '- GA4 snapshots and engagement data',
    '- GSC inspection or sitemap/indexing outputs if available',
    '- SERP snapshots from SerpApi',
    '',
    'Trust hierarchy:',
    '1. dataHealth and source freshness',
    '2. persisted GSC query data',
    '3. landing-page score data',
    '4. SEO dashboard panels',
    '5. SERP ranking snapshots',
    '6. GA4 traffic and engagement data',
    '7. behavior panels when the page issue may actually be CRO, not SEO',
    '',
    'Trust rules:',
    '- Block or downgrade recommendations when source health is stale, missing, or error.',
    '- Block or downgrade recommendations when attribution is not decision-safe.',
    '- Treat thin-volume segments as directional only.',
    '- If live GSC or SERP access is unavailable, fall back to the latest persisted reporting data, state the freshest metric date, and do not pretend you pulled live data.',
    '- Use the dashboard\'s own evidence model before inventing new heuristics.',
    '',
    'Decision-safety rules:',
    '- Explicitly classify each major section as trusted, trusted with caveats, or not decision-safe.',
    '- If data is not decision-safe, say what is blocked and what can still be acted on safely.',
    '',
    'Keyword prioritization rules:',
    '1. Non-branded queries first.',
    '2. Highest-opportunity queries by demand plus ranking upside.',
    '3. Prefer queries with meaningful impressions and positions in the improvement window.',
    '4. Surface CTR-lift candidates when impressions are high, CTR is weak, and the page already ranks close enough to win more clicks.',
    '5. Surface cannibalization when multiple pages compete for the same intent.',
    '6. Surface decay-risk pages when recent clicks fell materially versus the prior comparable window.',
    '7. Surface conversion-gap pages when traffic exists but qualified demand does not.',
    '8. Do not over-prioritize branded queries, vanity rankings, or thin-volume movement.',
    '',
    'Evidence roles:',
    '- GSC query data is the main source for keyword and query opportunity.',
    '- SERP snapshots validate current ranking movement and desktop/mobile gaps.',
    '- GA4 validates landing-page traffic and engagement; it does not define keyword truth.',
    '- Behavior and CRO panels decide whether a page needs conversion fixes before more SEO work.',
    '',
    'Prioritization logic:',
    '- Use seoQueries, contentOpportunities, landingPageScorecard, seoContent, and dataHealth before making any major recommendation.',
    '- Favor high non-branded demand with clear CTR upside, ranking-window upside, query-page mismatch, decay risk, or conversion leverage.',
    '- When available, use the dashboard\'s opportunity-style scoring and panel logic rather than inventing a separate scoring system.',
    '- For each major query or cluster, identify the primary target page and call out any mismatch between the current landing page and the intended page.',
    '- If a page has traffic but poor qualified-demand evidence or poor behavior evidence, route it to CRO handoff or mixed SEO + CRO, not pure SEO expansion.',
    '',
    'For every priority item, decide the best action type:',
    '- title/meta rewrite',
    '- target-page clarification',
    '- content expansion/refresh',
    '- internal-linking fix',
    '- cannibalization cleanup',
    '- local SEO reinforcement',
    '- technical SEO correction',
    '- CRO handoff instead of more traffic',
    '',
    'Technical and local SEO rules:',
    '- Only recommend technical SEO correction when evidence exists from reporting, indexing, cannibalization, or obvious page-target mismatch.',
    '- Only recommend local SEO reinforcement when the query set, landing page, or business context clearly supports local intent for Tunis or Tunisia.',
    '',
    'Output rules:',
    '- Use the exact section headings listed below.',
    '- Cite exact dashboard panels or table names in every major recommendation.',
    '- Include exact metrics, the selected segment, and the freshest date where relevant.',
    '- Be concrete. Name the query, cluster, or URL, the issue, the fix, the owner, and the KPI expected to move.',
    '- If no decision-safe action exists for a segment, say so explicitly instead of filling space with generic tips.',
    '',
    'Return the answer in this exact structure:',
    '',
    '# Trust audit',
    '| Source or panel | Freshness date | Status | Trust state | What it is safe to use for | Caveat or blocker |',
    '| --- | --- | --- | --- | --- | --- |',
    '',
    '# Priority keyword board',
    '| Priority | Segment | Query or cluster | Non-brand | Primary target page | Current landing page | Evidence panel or table | Key metrics | Issue type | Action type | Owner | Expected impact | Confidence |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    '',
    '# Landing-page action board',
    '| Priority | Segment | URL | Supporting queries or clusters | Evidence panel or table | Traffic and pipeline evidence | Main bottleneck | Recommended action | Owner | Expected impact | Confidence |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    '',
    '# 30/60/90-day execution plan',
    '| Window | Focus | Actions | Dependencies | KPI target or expected movement |',
    '| --- | --- | --- | --- | --- |',
    '| 0-30 days |  |  |  |  |',
    '| 31-60 days |  |  |  |  |',
    '| 61-90 days |  |  |  |  |',
    '',
    '# CRO handoffs',
    '| Page or segment | Why this is not SEO-first | CRO evidence | Required handoff | Owner | KPI to watch |',
    '| --- | --- | --- | --- | --- | --- |',
    '',
    '# Measurement plan',
    '| KPI | Baseline | Target or directional goal | Source | Refresh cadence | Decision rule |',
    '| --- | --- | --- | --- | --- | --- |',
    '',
    'Response requirements:',
    '- In Trust audit, include dataHealth, seoQueries, contentOpportunities, landingPageScorecard, seoContent, and any live GSC or SERP source actually used.',
    '- In Priority keyword board, sort by highest non-branded opportunity first.',
    '- In Priority keyword board, Issue type must be one of: ranking window, CTR lift, cannibalization, decay risk, query-page mismatch, conversion gap, local intent gap, technical SEO issue.',
    '- In Priority keyword board, Action type must be one of: title/meta rewrite, target-page clarification, content expansion/refresh, internal-linking fix, cannibalization cleanup, local SEO reinforcement, technical SEO correction, CRO handoff.',
    '- In Landing-page action board, explicitly state whether the bottleneck is traffic, snippet CTR, ranking, page-target clarity, conversion, or follow-up quality.',
    '- In CRO handoffs, only include rows where behavior or conversion evidence shows that more traffic is not the first fix.',
    '- In Measurement plan, include only KPIs that can actually be measured in the current environment and tie them back to a specific action or action group.',
    '- Prefer qualified organic outcomes over visibility-only metrics when both are available.',
    '',
    'Practical notes:',
    '- If the environment exposes live GSC queries, compare them to persisted growth_query_daily_metrics and note any freshness gap.',
    '- If the environment exposes live SERP rankings, use them to validate current movement, especially device differences, but keep GSC as the demand source.',
    '- If the dashboard shows a conversion-gap page, do not recommend traffic growth blindly; check ctaPerformance, formHealth, and contactIntent first.',
    '- If a page or query is commercially weak, low-volume, or attribution-unclear, downgrade it even if it looks interesting.',
    '- When in doubt, prefer the dashboard\'s existing Stage 3 evidence model over ad hoc SEO folklore.'
  ].join('\n');
}
