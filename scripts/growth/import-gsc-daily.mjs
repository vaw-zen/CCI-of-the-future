#!/usr/bin/env node

import {
  createGrowthServiceClient,
  fetchSearchConsoleSnapshotRows,
  getDefaultSnapshotRange,
  loadGrowthEnv,
  upsertGrowthMetricRows,
  upsertGrowthSourceHealth,
  GROWTH_SOURCE_HEALTH_KEYS
} from '../../src/libs/growthReporting.mjs';

async function main() {
  loadGrowthEnv();

  const { startDate, endDate } = getDefaultSnapshotRange();
  const resolvedStartDate = process.argv[2] || startDate;
  const resolvedEndDate = process.argv[3] || resolvedStartDate || endDate;

  const supabase = createGrowthServiceClient();
  const rows = await fetchSearchConsoleSnapshotRows({
    startDate: resolvedStartDate,
    endDate: resolvedEndDate
  });
  const upsertResult = await upsertGrowthMetricRows(supabase, rows);

  await upsertGrowthSourceHealth(supabase, [{
    source_key: GROWTH_SOURCE_HEALTH_KEYS.SEARCH_CONSOLE,
    source_label: 'Search Console',
    connector_type: 'api',
    status: 'fresh',
    last_attempt_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
    freshest_metric_date: upsertResult.freshestMetricDate || resolvedEndDate,
    message: `${upsertResult.count} lignes Search Console synchronisées`,
    metadata: {
      startDate: resolvedStartDate,
      endDate: resolvedEndDate
    }
  }]);

  console.log(`Search Console sync complete: ${upsertResult.count} rows (${resolvedStartDate} -> ${resolvedEndDate})`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
