#!/usr/bin/env node

import {
  createGrowthServiceClient,
  getDefaultSnapshotRange,
  loadGrowthEnv,
  syncSearchConsoleGrowthReporting,
  upsertGrowthSourceHealth,
  GROWTH_SOURCE_HEALTH_KEYS
} from '../../src/libs/growthReporting.mjs';

async function main() {
  loadGrowthEnv();

  const { startDate, endDate } = getDefaultSnapshotRange();
  const resolvedStartDate = process.argv[2] || startDate;
  const resolvedEndDate = process.argv[3] || resolvedStartDate || endDate;
  const startedAt = new Date().toISOString();

  const supabase = createGrowthServiceClient();
  const syncResult = await syncSearchConsoleGrowthReporting({
    startDate: resolvedStartDate,
    endDate: resolvedEndDate,
    supabase
  });

  await upsertGrowthSourceHealth(supabase, [{
    source_key: GROWTH_SOURCE_HEALTH_KEYS.SEARCH_CONSOLE,
    source_label: 'Search Console',
    connector_type: 'api',
    status: 'fresh',
    last_attempt_at: startedAt,
    last_success_at: new Date().toISOString(),
    freshest_metric_date: syncResult.freshestMetricDate || resolvedEndDate,
    message: `${syncResult.count} lignes Search Console synchronisées (${syncResult.pageRowCount} pages, ${syncResult.queryRowCount} requêtes)`,
    metadata: {
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
      pageRowCount: syncResult.pageRowCount,
      queryRowCount: syncResult.queryRowCount,
      matchedCatalogQueryCount: syncResult.matchedCatalogQueryCount,
      keywordCatalogRowCount: syncResult.keywordCatalogRowCount
    }
  }]);

  console.log(`Search Console sync complete: ${syncResult.count} rows (${syncResult.pageRowCount} page rows, ${syncResult.queryRowCount} query rows) (${resolvedStartDate} -> ${resolvedEndDate})`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
