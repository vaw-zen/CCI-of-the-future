#!/usr/bin/env node

import {
  buildSerpKeywordDeviceCounts,
  createGrowthServiceClient,
  fetchSerpKeywordRankingRows,
  loadGrowthEnv,
  upsertGrowthKeywordRankingRows,
  upsertGrowthSourceHealth,
  GROWTH_SOURCE_HEALTH_KEYS
} from '../../src/libs/growthReporting.mjs';

async function main() {
  loadGrowthEnv();

  const resolvedMetricDate = process.argv[2] || new Date().toISOString().slice(0, 10);
  const supabase = createGrowthServiceClient();
  let totalRequests = 0;

  console.log(`Starting SERP keyword sync for ${resolvedMetricDate}...`);
  const rows = await fetchSerpKeywordRankingRows({
    metricDate: resolvedMetricDate,
    supabase,
    onProgress: ({
      completedRequests,
      totalRequests: nextTotalRequests,
      keyword,
      device
    }) => {
      totalRequests = nextTotalRequests;
      if (
        completedRequests === 1
        || completedRequests === nextTotalRequests
        || completedRequests % 10 === 0
      ) {
        console.log(`[SERP] ${completedRequests}/${nextTotalRequests} ${device} "${keyword}"`);
      }
    }
  });
  const upsertResult = await upsertGrowthKeywordRankingRows(supabase, rows);
  const trackedKeywordCount = new Set(rows.map((row) => row.keyword_catalog_id).filter(Boolean)).size;

  await upsertGrowthSourceHealth(supabase, [{
    source_key: GROWTH_SOURCE_HEALTH_KEYS.SERP_KEYWORD_RANKINGS,
    source_label: 'SERP keyword rankings',
    connector_type: 'api',
    status: 'fresh',
    last_attempt_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
    freshest_metric_date: upsertResult.freshestMetricDate || resolvedMetricDate,
    message: `${upsertResult.count} lignes keyword rankings synchronisées`,
    metadata: {
      metricDate: resolvedMetricDate,
      trackedKeywords: trackedKeywordCount,
      deviceRowCounts: buildSerpKeywordDeviceCounts(rows)
    }
  }]);

  console.log(`SERP keyword sync complete: ${upsertResult.count} rows (${resolvedMetricDate}, ${trackedKeywordCount} keywords, ${totalRequests} requests)`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
