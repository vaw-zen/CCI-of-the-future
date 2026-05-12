#!/usr/bin/env node

import {
  createGrowthServiceClient,
  loadGrowthEnv,
  syncSearchConsoleGrowthReporting,
  upsertGrowthSourceHealth,
  GROWTH_SOURCE_HEALTH_KEYS
} from '../../src/libs/growthReporting.mjs';

async function main() {
  loadGrowthEnv();

  const startDate = process.argv[2];
  const endDate = process.argv[3];
  const startedAt = new Date().toISOString();

  const supabase = createGrowthServiceClient();
  const syncResult = await syncSearchConsoleGrowthReporting({
    startDate,
    endDate,
    supabase
  });

  await upsertGrowthSourceHealth(supabase, [{
    source_key: GROWTH_SOURCE_HEALTH_KEYS.SEARCH_CONSOLE,
    source_label: 'Search Console',
    connector_type: 'api',
    status: 'fresh',
    last_attempt_at: startedAt,
    last_success_at: new Date().toISOString(),
    freshest_metric_date: syncResult.freshestMetricDate || syncResult.syncWindow?.endDate,
    message: `${syncResult.count} lignes Search Console synchronisées (${syncResult.pageRowCount} pages, ${syncResult.queryRowCount} requêtes)`,
    metadata: {
      startDate: syncResult.syncWindow?.startDate || null,
      endDate: syncResult.syncWindow?.endDate || null,
      syncMode: syncResult.syncWindow?.mode || 'custom',
      firstIncompleteDate: syncResult.pageMetadata?.firstIncompleteDate
        || syncResult.queryMetadata?.firstIncompleteDate
        || null,
      pageRowCount: syncResult.pageRowCount,
      queryRowCount: syncResult.queryRowCount,
      matchedCatalogQueryCount: syncResult.matchedCatalogQueryCount,
      keywordCatalogRowCount: syncResult.keywordCatalogRowCount
    }
  }]);

  console.log(`Search Console sync complete: ${syncResult.count} rows (${syncResult.pageRowCount} page rows, ${syncResult.queryRowCount} query rows) (${syncResult.syncWindow?.startDate} -> ${syncResult.syncWindow?.endDate})`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
