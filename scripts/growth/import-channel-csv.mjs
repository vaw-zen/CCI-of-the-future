#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import csv from 'csv-parser';
import {
  createGrowthServiceClient,
  loadGrowthEnv,
  normalizeGrowthMetricRow,
  upsertGrowthMetricRows,
  upsertGrowthSourceHealth,
  GROWTH_METRIC_SOURCES,
  GROWTH_SOURCE_HEALTH_KEYS
} from '../../src/libs/growthReporting.mjs';

function resolveHealthKey(rawValue = '') {
  const value = String(rawValue || '').trim().toLowerCase();
  if (value === GROWTH_SOURCE_HEALTH_KEYS.SOCIAL_MEDIA) {
    return GROWTH_SOURCE_HEALTH_KEYS.SOCIAL_MEDIA;
  }

  return GROWTH_SOURCE_HEALTH_KEYS.PAID_MEDIA;
}

function resolveMetricSource(rawValue = '', healthKey = GROWTH_SOURCE_HEALTH_KEYS.PAID_MEDIA) {
  const value = String(rawValue || '').trim().toLowerCase();
  if (value === GROWTH_METRIC_SOURCES.SOCIAL_MANUAL) {
    return GROWTH_METRIC_SOURCES.SOCIAL_MANUAL;
  }

  if (value === GROWTH_METRIC_SOURCES.PAID_MANUAL) {
    return GROWTH_METRIC_SOURCES.PAID_MANUAL;
  }

  return healthKey === GROWTH_SOURCE_HEALTH_KEYS.SOCIAL_MEDIA
    ? GROWTH_METRIC_SOURCES.SOCIAL_MANUAL
    : GROWTH_METRIC_SOURCES.PAID_MANUAL;
}

async function readCsvRows(filePath, metricSource) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(normalizeGrowthMetricRow({
          metric_date: row.metric_date || row.date,
          metric_source: metricSource,
          source: row.source,
          medium: row.medium,
          campaign: row.campaign,
          landing_page: row.landing_page || row.landingPage,
          sessions: row.sessions,
          users: row.users,
          clicks: row.clicks,
          impressions: row.impressions,
          spend: row.spend,
          metadata: {
            import_file: path.basename(filePath)
          }
        }));
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function main() {
  loadGrowthEnv();

  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node scripts/growth/import-channel-csv.mjs <csvPath> [paid_media|social_media] [paid_manual|social_manual]');
    process.exit(1);
  }

  const resolvedFilePath = path.resolve(csvPath);
  const sourceKey = resolveHealthKey(process.argv[3]);
  const metricSource = resolveMetricSource(process.argv[4], sourceKey);
  const rows = await readCsvRows(resolvedFilePath, metricSource);
  const supabase = createGrowthServiceClient();
  const upsertResult = await upsertGrowthMetricRows(supabase, rows);

  await upsertGrowthSourceHealth(supabase, [{
    source_key: sourceKey,
    source_label: sourceKey === GROWTH_SOURCE_HEALTH_KEYS.SOCIAL_MEDIA ? 'Social media (manual)' : 'Paid media (manual)',
    connector_type: 'manual',
    status: 'fresh',
    last_attempt_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
    freshest_metric_date: upsertResult.freshestMetricDate,
    message: `${upsertResult.count} lignes importées depuis ${path.basename(resolvedFilePath)}`,
    metadata: {
      import_file: path.basename(resolvedFilePath),
      metric_source: metricSource
    }
  }]);

  console.log(`Manual import complete: ${upsertResult.count} rows (${path.basename(resolvedFilePath)})`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
