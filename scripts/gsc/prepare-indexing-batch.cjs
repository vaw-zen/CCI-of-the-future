#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REDIRECT_REPLACEMENTS = new Map([
  [
    'https://cciservices.online/conseils/nettoyage-salons-voiture-tapisseries-tunis',
    'https://cciservices.online/conseils/nettoyage-salon-canape-tunis-2026',
  ],
]);

function normalizeUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  let normalized = rawUrl.trim();
  if (!normalized) {
    return null;
  }

  normalized = normalized.replace(/^http:\/\//i, 'https://');
  normalized = normalized.replace(/^https:\/\/www\./i, 'https://');
  normalized = normalized.replace(/\/+$/, '');

  return REDIRECT_REPLACEMENTS.get(normalized) || normalized;
}

function parseUrlsFromCsv(csvContent) {
  return csvContent
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',')[0])
    .filter(Boolean);
}

function main() {
  const [, , inputPath, outputBaseArg] = process.argv;

  if (!inputPath) {
    console.error('Usage: node scripts/gsc/prepare-indexing-batch.cjs <csvPath> [outputBasePath]');
    process.exit(1);
  }

  const resolvedInputPath = path.resolve(inputPath);
  const outputBase = outputBaseArg
    ? path.resolve(outputBaseArg)
    : path.resolve('scripts/gsc/data/indexing-batch');

  const csvContent = fs.readFileSync(resolvedInputPath, 'utf8');
  const originalUrls = parseUrlsFromCsv(csvContent);

  const manifest = [];
  const uniqueUrls = [];
  const seen = new Set();

  for (const originalUrl of originalUrls) {
    const canonicalUrl = normalizeUrl(originalUrl);
    if (!canonicalUrl) {
      continue;
    }

    manifest.push({
      originalUrl,
      canonicalUrl,
      changed: originalUrl !== canonicalUrl,
    });

    if (!seen.has(canonicalUrl)) {
      seen.add(canonicalUrl);
      uniqueUrls.push(canonicalUrl);
    }
  }

  const outputDir = path.dirname(outputBase);
  fs.mkdirSync(outputDir, { recursive: true });

  const txtPath = `${outputBase}.txt`;
  const jsonPath = `${outputBase}.json`;

  fs.writeFileSync(txtPath, `${uniqueUrls.join('\n')}\n`);
  fs.writeFileSync(
    jsonPath,
    `${JSON.stringify(
      {
        sourceCsv: resolvedInputPath,
        generatedAt: new Date().toISOString(),
        totalInputUrls: originalUrls.length,
        totalCanonicalUrls: uniqueUrls.length,
        urls: manifest,
      },
      null,
      2
    )}\n`
  );

  console.log(`Prepared ${uniqueUrls.length} canonical URLs from ${originalUrls.length} input URLs.`);
  console.log(`TXT output: ${txtPath}`);
  console.log(`JSON output: ${jsonPath}`);
}

main();
