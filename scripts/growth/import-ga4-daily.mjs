#!/usr/bin/env node

import {
  createGrowthServiceClient,
  fetchGa4SnapshotRows,
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
  const rows = await fetchGa4SnapshotRows({
    startDate: resolvedStartDate,
    endDate: resolvedEndDate
  });
  const upsertResult = await upsertGrowthMetricRows(supabase, rows);

  await upsertGrowthSourceHealth(supabase, [{
    source_key: GROWTH_SOURCE_HEALTH_KEYS.GA4,
    source_label: 'GA4',
    connector_type: 'api',
    status: 'fresh',
    last_attempt_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
    freshest_metric_date: upsertResult.freshestMetricDate || resolvedEndDate,
    message: `${upsertResult.count} lignes GA4 synchronisées`,
    metadata: {
      startDate: resolvedStartDate,
      endDate: resolvedEndDate
    }
  }]);

  console.log(`GA4 sync complete: ${upsertResult.count} rows (${resolvedStartDate} -> ${resolvedEndDate})`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
