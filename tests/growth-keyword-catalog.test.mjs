import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import csv from 'csv-parser';
import { buildKeywordSitePathInventory } from '../src/libs/sitePathInventory.mjs';
import {
  normalizeGrowthKeywordCatalogRow,
  prepareKeywordReferenceCatalog
} from '../src/libs/growthKeywordCatalog.mjs';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLEANED_CSV_PATH = path.join(TEST_DIR, '../scripts/growth/data/seo-keywords.cleaned.csv');

function buildCsvRow(overrides = {}) {
  return {
    aCategory: overrides.aCategory || 'Salon',
    Keyword: overrides.Keyword || 'nettoyage canapé tunis',
    'Search Intent': overrides['Search Intent'] || 'Commercial',
    Competition: overrides.Competition || 'Medium',
    'Target URL': overrides['Target URL'] || '/blog/guide-nettoyage-canape',
    'Optimization Status': overrides['Optimization Status'] || 'Optimized',
    'Content Type': overrides['Content Type'] || 'Blog Post',
    Priority: overrides.Priority || 'High',
    Clicks: overrides.Clicks || '4',
    Impressions: overrides.Impressions || '100',
    'Current Position': overrides['Current Position'] || '8',
    CTR: overrides.CTR || '4.00',
    'Search Volume': overrides['Search Volume'] || '140',
    Trend: overrides.Trend || 'Improving',
    'Last Updated': overrides['Last Updated'] || '2025-10-15'
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

test('prepareKeywordReferenceCatalog dedupes rows and rewrites legacy targets to current URLs', () => {
  const prepared = prepareKeywordReferenceCatalog({
    rows: [
      buildCsvRow(),
      buildCsvRow({
        aCategory: 'Global Keywords',
        Priority: 'Medium',
        Clicks: '9',
        Impressions: '250',
        'Current Position': '5',
        CTR: '3.60'
      }),
      buildCsvRow({
        Keyword: 'nettoyage salon tunis',
        'Target URL': '/salon',
        'Content Type': 'Service Page',
        Clicks: '12',
        Impressions: '320'
      })
    ],
    urlMap: {
      '/blog/guide-nettoyage-canape': '/conseils/nettoyage-canape-tunis-2025'
    },
    siteUrl: 'https://cciservices.online',
    validSitePaths: new Set([
      '/conseils/nettoyage-canape-tunis-2025',
      '/salon'
    ])
  });

  assert.equal(prepared.stats.rawRowCount, 3);
  assert.equal(prepared.stats.cleanedRowCount, 2);
  assert.equal(prepared.stats.duplicateRowCount, 1);
  assert.equal(prepared.cleanedRows[0]['Target URL'], '/conseils/nettoyage-canape-tunis-2025');
  assert.match(prepared.cleanedRows[0].aCategory, /Salon/);
  assert.match(prepared.cleanedRows[0].aCategory, /Global Keywords/);
  assert.equal(prepared.cleanedRows[0].Impressions, '250');
  assert.equal(prepared.cleanedRows[0].Clicks, '9');
  assert.equal(prepared.catalogRows[0].reference_impressions, 250);
  assert.deepEqual(prepared.catalogRows[0].priority_tags, ['High', 'Medium']);
});

test('prepareKeywordReferenceCatalog remaps broad targets by service, B2B, local, and brand rules while keeping specific articles', () => {
  const validSitePaths = new Set([
    '/',
    '/services',
    '/entreprises',
    '/marbre',
    '/tapis',
    '/tapisserie',
    '/conseils/services-nettoyage-ariana-tunisie-2025',
    '/conseils/services-nettoyage-el-aouina-guide-complet',
    '/conseils/services-nettoyage-la-marsa-carthage-2025',
    '/conseils/nettoyage-professionnel-el-aouina-cci-services'
  ]);
  const prepared = prepareKeywordReferenceCatalog({
    rows: [
      buildCsvRow({
        Keyword: 'CCI services',
        'Target URL': '/',
        aCategory: 'Brand'
      }),
      buildCsvRow({
        Keyword: 'polissage marbre tunisie',
        'Target URL': '/',
        aCategory: 'Marbre'
      }),
      buildCsvRow({
        Keyword: 'lavage vapeur tapis tunis',
        'Target URL': '/services',
        aCategory: 'Tapis'
      }),
      buildCsvRow({
        Keyword: 'retapissage siège tunis',
        'Target URL': '/services',
        aCategory: 'Tapisserie'
      }),
      buildCsvRow({
        Keyword: 'nettoyage professionnel bureaux options',
        'Target URL': '/services',
        aCategory: 'Entreprise'
      }),
      buildCsvRow({
        Keyword: 'CCI services ariana',
        'Target URL': '/services',
        aCategory: 'Local'
      }),
      buildCsvRow({
        Keyword: 'nettoyage el aouina',
        'Target URL': '/services',
        aCategory: 'Local'
      }),
      buildCsvRow({
        Keyword: 'services carthage',
        'Target URL': '/services',
        aCategory: 'Local'
      }),
      buildCsvRow({
        Keyword: 'nettoyage professionnel el aouina',
        'Target URL': '/conseils/nettoyage-professionnel-el-aouina-cci-services',
        aCategory: 'Article'
      }),
      buildCsvRow({
        Keyword: 'nettoyage matelas tunis',
        'Target URL': '/services',
        aCategory: 'Services'
      })
    ],
    siteUrl: 'https://cciservices.online',
    validSitePaths
  });
  const targetByKeyword = new Map(
    prepared.cleanedRows.map((row) => [row.Keyword, row['Target URL']])
  );

  assert.equal(targetByKeyword.get('CCI services'), '/');
  assert.equal(targetByKeyword.get('polissage marbre tunisie'), '/marbre');
  assert.equal(targetByKeyword.get('lavage vapeur tapis tunis'), '/tapis');
  assert.equal(targetByKeyword.get('retapissage siège tunis'), '/tapisserie');
  assert.equal(targetByKeyword.get('nettoyage professionnel bureaux options'), '/entreprises');
  assert.equal(targetByKeyword.get('CCI services ariana'), '/conseils/services-nettoyage-ariana-tunisie-2025');
  assert.equal(targetByKeyword.get('nettoyage el aouina'), '/conseils/services-nettoyage-el-aouina-guide-complet');
  assert.equal(targetByKeyword.get('services carthage'), '/conseils/services-nettoyage-la-marsa-carthage-2025');
  assert.equal(
    targetByKeyword.get('nettoyage professionnel el aouina'),
    '/conseils/nettoyage-professionnel-el-aouina-cci-services'
  );
  assert.equal(targetByKeyword.get('nettoyage matelas tunis'), '/services');
});

test('prepareKeywordReferenceCatalog is stable across repeated runs with the same input', () => {
  const inputRows = [
    buildCsvRow(),
    buildCsvRow({
      Keyword: 'nettoyage salon tunis',
      'Target URL': '/salon'
    })
  ];
  const options = {
    rows: inputRows,
    urlMap: {
      '/blog/guide-nettoyage-canape': '/conseils/nettoyage-canape-tunis-2025'
    },
    siteUrl: 'https://cciservices.online',
    validSitePaths: new Set([
      '/conseils/nettoyage-canape-tunis-2025',
      '/salon'
    ])
  };

  const firstRun = prepareKeywordReferenceCatalog(options);
  const secondRun = prepareKeywordReferenceCatalog(options);

  assert.deepEqual(firstRun.cleanedRows, secondRun.cleanedRows);
  assert.deepEqual(firstRun.catalogRows, secondRun.catalogRows);
});

test('keyword site inventory includes sitemap paths and live conseils article slugs', () => {
  const inventory = buildKeywordSitePathInventory();

  assert(inventory.validPaths.has('/'));
  assert(inventory.validPaths.has('/services'));
  assert(inventory.validPaths.has('/entreprises'));
  assert(inventory.validPaths.has('/marbre'));
  assert(inventory.validPaths.has('/conseils/services-nettoyage-ariana-tunisie-2025'));
  assert(inventory.validPaths.has('/conseils/services-nettoyage-el-aouina-guide-complet'));
  assert(inventory.validPaths.has('/conseils/services-nettoyage-la-marsa-carthage-2025'));
  assert(inventory.validPaths.has('/conseils/conventions-nettoyage-entreprises-tunisie-contrats-b2b'));
  assert(inventory.articlePaths.includes('/conseils/cristallisation-marbre-tunisie-guide-complet'));
});

test('cleaned keyword CSV keeps targets inside the site inventory and tightens broad mappings', async () => {
  const inventory = buildKeywordSitePathInventory();
  const cleanedRows = await readCsvRows(CLEANED_CSV_PATH);
  const targetByKeyword = new Map(cleanedRows.map((row) => [row.Keyword, row['Target URL']]));
  const homepageKeywords = cleanedRows
    .filter((row) => row['Target URL'] === '/')
    .map((row) => row.Keyword)
    .sort();

  assert(cleanedRows.length > 0);
  cleanedRows.forEach((row) => {
    assert(row['Target URL']);
    assert(inventory.validPaths.has(row['Target URL']));
  });

  assert.deepEqual(homepageKeywords, ['CCI services', 'cci tunis', 'cci tunisie']);
  assert.equal(targetByKeyword.get('cristallisation marbre tunisie'), '/marbre');
  assert.equal(targetByKeyword.get('lustrage marbre tunisie'), '/marbre');
  assert.equal(targetByKeyword.get('polissage marbre tunisie'), '/marbre');
  assert.equal(targetByKeyword.get('ponçage marbre tunisie'), '/marbre');
  assert.equal(targetByKeyword.get('protection marbre tunisie'), '/marbre');
  assert.equal(targetByKeyword.get('contrats nettoyage réguliers immeubles'), '/entreprises');
  assert.equal(targetByKeyword.get('services nettoyage professionnel près de moi'), '/entreprises');
  assert.equal(targetByKeyword.get('CCI services ariana'), '/conseils/services-nettoyage-ariana-tunisie-2025');
  assert.equal(targetByKeyword.get('CCI services el aouina'), '/conseils/services-nettoyage-el-aouina-guide-complet');
  assert.equal(targetByKeyword.get('nettoyage la marsa'), '/conseils/services-nettoyage-la-marsa-carthage-2025');
  assert.equal(targetByKeyword.get('matelas'), '/services');
  assert.equal(targetByKeyword.get('nettoyage rideaux tunis'), '/services');
});

test('normalizeGrowthKeywordCatalogRow derives canonical URL from path when missing', () => {
  const row = normalizeGrowthKeywordCatalogRow({
    display_keyword: 'Nettoyage tapis Tunis',
    canonical_target_path: '/tapis',
    metadata: {
      siteUrl: 'https://cciservices.online'
    }
  });

  assert.equal(row.canonical_target_url, 'https://cciservices.online/tapis');
  assert.equal(row.target_domain, 'cciservices.online');
});
