#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import {
  KEYWORD_REFERENCE_HEADERS,
  buildCatalogUpsertRows,
  deactivateMissingGrowthKeywordCatalogRows,
  insertGrowthKeywordReferenceImport,
  insertGrowthKeywordReferenceRows,
  prepareKeywordReferenceCatalog,
  upsertGrowthKeywordCatalogRows
} from '../../src/libs/growthKeywordCatalog.mjs';
import { buildKeywordSitePathInventory } from '../../src/libs/sitePathInventory.mjs';
import { createGrowthServiceClient, loadGrowthEnv } from '../../src/libs/growthReporting.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DATA_DIR = path.join(REPO_ROOT, 'scripts/growth/data');
const CLEANED_CSV_PATH = path.join(DATA_DIR, 'seo-keywords.cleaned.csv');
const URL_MAP_PATH = path.join(DATA_DIR, 'seo-keywords-url-map.json');

function parseArgs(argv) {
  const args = argv.slice(2);
  const skipSupabase = args.includes('--skip-supabase');
  const csvPath = args.find((arg) => !arg.startsWith('--'));

  if (!csvPath) {
    const error = new Error('Usage: npm run growth:prepare:keyword-csv -- <csvPath> [--skip-supabase]');
    error.code = 'missing_keyword_csv_path';
    throw error;
  }

  return {
    csvPath: path.resolve(csvPath),
    skipSupabase
  };
}

function readCsvRows(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function readUrlMap() {
  return JSON.parse(fs.readFileSync(URL_MAP_PATH, 'utf8'));
}

function ensureDir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function getValidSitePaths() {
  return buildKeywordSitePathInventory().validPaths;
}

function buildSourceHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function writeCleanedCsv(rows) {
  ensureDir(DATA_DIR);

  const csvWriter = createObjectCsvWriter({
    path: CLEANED_CSV_PATH,
    header: KEYWORD_REFERENCE_HEADERS.map((header) => ({
      id: header,
      title: header
    }))
  });

  await csvWriter.writeRecords(rows);
}

async function main() {
  loadGrowthEnv();

  const { csvPath, skipSupabase } = parseArgs(process.argv);
  const inputRows = await readCsvRows(csvPath);
  const missingHeaders = KEYWORD_REFERENCE_HEADERS.filter((header) => !(header in (inputRows[0] || {})));
  if (missingHeaders.length > 0) {
    throw new Error(`CSV headers missing: ${missingHeaders.join(', ')}`);
  }
  const validSitePaths = getValidSitePaths();
  const urlMap = readUrlMap();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const prepared = prepareKeywordReferenceCatalog({
    rows: inputRows,
    urlMap,
    siteUrl,
    validSitePaths
  });

  await writeCleanedCsv(prepared.cleanedRows);

  if (skipSupabase) {
    console.log(`Keyword CSV prepared: ${prepared.stats.rawRowCount} raw rows -> ${prepared.stats.cleanedRowCount} cleaned rows`);
    console.log(`Cleaned CSV written to ${CLEANED_CSV_PATH}`);
    return;
  }

  const supabase = createGrowthServiceClient();
  const sourceHash = buildSourceHash(csvPath);
  const importBatch = await insertGrowthKeywordReferenceImport(supabase, {
    source_filename: path.basename(csvPath),
    source_path: csvPath,
    source_hash: sourceHash,
    raw_row_count: prepared.stats.rawRowCount,
    cleaned_row_count: prepared.stats.cleanedRowCount,
    metadata: {
      duplicateRowCount: prepared.stats.duplicateRowCount,
      cleanedCsvPath: CLEANED_CSV_PATH
    }
  });
  const insertedReferenceRows = await insertGrowthKeywordReferenceRows(
    supabase,
    importBatch.id,
    prepared.rawReferenceRows
  );
  const catalogUpsertRows = buildCatalogUpsertRows({
    catalogRows: prepared.catalogRows,
    insertedReferenceRows,
    importId: importBatch.id
  });
  const upsertResult = await upsertGrowthKeywordCatalogRows(supabase, catalogUpsertRows);
  const deactivationResult = await deactivateMissingGrowthKeywordCatalogRows(supabase, catalogUpsertRows);

  console.log([
    `Keyword CSV prepared: ${prepared.stats.rawRowCount} raw rows -> ${prepared.stats.cleanedRowCount} cleaned rows`,
    `Raw reference rows inserted: ${insertedReferenceRows.length}`,
    `Catalog rows upserted: ${upsertResult.count}`,
    `Catalog rows deactivated: ${deactivationResult.count}`,
    `Cleaned CSV written to ${CLEANED_CSV_PATH}`
  ].join('\n'));
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
