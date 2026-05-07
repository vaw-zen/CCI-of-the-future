import crypto from 'node:crypto';

export const KEYWORD_REFERENCE_HEADERS = [
  'aCategory',
  'Keyword',
  'Search Intent',
  'Competition',
  'Target URL',
  'Optimization Status',
  'Content Type',
  'Priority',
  'Clicks',
  'Impressions',
  'Current Position',
  'CTR',
  'Search Volume',
  'Trend',
  'Last Updated'
];

export const KEYWORD_REFERENCE_TAG_FIELDS = [
  'aCategory',
  'Search Intent',
  'Competition',
  'Optimization Status',
  'Content Type',
  'Priority',
  'Trend'
];

export const KEYWORD_REFERENCE_BASELINE_FIELDS = [
  'Clicks',
  'Impressions',
  'Current Position',
  'CTR',
  'Search Volume',
  'Last Updated'
];

export const KEYWORD_TRACKED_DEVICES = ['desktop', 'mobile'];
export const DEFAULT_KEYWORD_SITE_URL = 'https://cciservices.online';

const BROAD_TARGET_PATHS = new Set(['/', '/services', '/entreprises']);
const BRAND_HOME_KEYWORDS = new Set([
  'cci services',
  'cci tunis',
  'cci tunisie'
]);
const SERVICE_FAMILY_RULES = [
  {
    path: '/marbre',
    patterns: ['marbre', 'granit', 'travertin', 'cristallisation', 'polissage', 'ponçage', 'poncage']
  },
  {
    path: '/tapis',
    patterns: ['tapis', 'moquette', 'moquettes', 'shampouinage', 'injection', 'extraction', 'lavage vapeur']
  },
  {
    path: '/tapisserie',
    patterns: ['tapisserie', 'retapissage', 'rembourrage', 'mousse', 'mousses', 'ignifuge', 'siège', 'sièges', 'siege', 'sieges']
  }
];
const B2B_PATTERNS = [
  'b2b',
  'entreprise',
  'entreprises',
  'bureau',
  'bureaux',
  'immeuble',
  'immeubles',
  'locaux commerciaux',
  'industriel',
  'industrielle',
  'industriels',
  'industrielles',
  'professionnel',
  'professionnelle',
  'professionnels',
  'professionnelles'
];
const LOCAL_BROAD_RULES = [
  {
    path: '/conseils/services-nettoyage-ariana-tunisie-2025',
    patterns: ['ariana']
  },
  {
    path: '/conseils/services-nettoyage-el-aouina-guide-complet',
    patterns: ['el aouina', 'el-aouina', "l'aouina", 'laouina', 'aouina']
  },
  {
    path: '/conseils/services-nettoyage-la-marsa-carthage-2025',
    patterns: ['la marsa', 'la-marsa', 'carthage']
  }
];

function normalizeWhitespace(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeForMatching(value) {
  return normalizeWhitespace(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`]+/g, ' ')
    .replace(/[^a-z0-9/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeKeywordForKey(value) {
  return normalizeWhitespace(value).toLowerCase();
}

export function normalizeDomain(value) {
  const text = normalizeWhitespace(value);
  if (!text) {
    return '';
  }

  try {
    const parsed = new URL(text.includes('://') ? text : `https://${text}`);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch (error) {
    return text.toLowerCase().replace(/^www\./, '').replace(/\/+$/, '');
  }
}

export function normalizeTargetPath(value, fallback = '/') {
  const text = normalizeWhitespace(value);
  if (!text) {
    return fallback;
  }

  if (text.startsWith('http://') || text.startsWith('https://')) {
    try {
      const parsed = new URL(text);
      const pathname = parsed.pathname || '/';
      const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
      return normalizedPathname === '/'
        ? '/'
        : normalizedPathname.replace(/\/+$/, '') || '/';
    } catch (error) {
      return fallback;
    }
  }

  const normalizedPath = text.startsWith('/') ? text : `/${text}`;
  return normalizedPath === '/'
    ? '/'
    : normalizedPath.replace(/\/+$/, '') || '/';
}

function buildKeywordRoutingText(rawRow = {}) {
  return normalizeForMatching([
    rawRow.Keyword,
    rawRow.aCategory,
    rawRow['Search Intent'],
    rawRow.Competition,
    rawRow['Optimization Status'],
    rawRow['Content Type'],
    rawRow.Priority
  ].join(' '));
}

function includesAnyNormalized(text, patterns = []) {
  const paddedText = ` ${normalizeForMatching(text)} `;

  return patterns.some((pattern) => {
    const normalizedPattern = normalizeForMatching(pattern);
    return normalizedPattern && paddedText.includes(` ${normalizedPattern} `);
  });
}

function buildUnmappedTargetError(rawTarget, resolvedTarget) {
  const error = new Error(
    resolvedTarget
      ? `No canonical target URL mapping for ${rawTarget} (resolved candidate ${resolvedTarget})`
      : `No canonical target URL mapping for ${rawTarget}`
  );
  error.code = 'unmapped_keyword_target';
  error.target = rawTarget;
  if (resolvedTarget) {
    error.resolvedTarget = resolvedTarget;
  }
  return error;
}

function classifyBroadKeywordTargetPath(rawRow = {}) {
  const routingText = buildKeywordRoutingText(rawRow);

  for (const rule of SERVICE_FAMILY_RULES) {
    if (includesAnyNormalized(routingText, rule.patterns)) {
      return rule.path;
    }
  }

  if (includesAnyNormalized(routingText, B2B_PATTERNS)) {
    return '/entreprises';
  }

  for (const rule of LOCAL_BROAD_RULES) {
    if (includesAnyNormalized(routingText, rule.patterns)) {
      return rule.path;
    }
  }

  if (BRAND_HOME_KEYWORDS.has(normalizeKeywordForKey(rawRow.Keyword))) {
    return '/';
  }

  return '/services';
}

function splitPipeValues(value) {
  return normalizeWhitespace(value)
    .split(/\s*\|\s*/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);
}

function mergeUniquePipeValues(...values) {
  const seen = new Set();
  const merged = [];

  values.flatMap(splitPipeValues).forEach((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(value);
  });

  return merged;
}

function toPipeString(values) {
  return values.join(' | ');
}

function parseReferenceNumber(value) {
  const text = normalizeWhitespace(value).replace(/,/g, '.');
  if (!text) {
    return null;
  }

  const numericValue = Number(text.replace(/[^\d.-]/g, ''));
  return Number.isFinite(numericValue) ? numericValue : null;
}

function parseReferenceInteger(value) {
  const numericValue = parseReferenceNumber(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.round(numericValue);
}

function parseReferencePositivePosition(value) {
  const numericValue = parseReferenceNumber(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Math.round(numericValue * 100) / 100;
}

function normalizeDateString(value) {
  const text = normalizeWhitespace(value);
  if (!text) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function getSiteOrigin(siteUrl = DEFAULT_KEYWORD_SITE_URL) {
  try {
    return new URL(siteUrl).origin;
  } catch (error) {
    return DEFAULT_KEYWORD_SITE_URL;
  }
}

export function buildKeywordCatalogUrl(targetPath, siteUrl = DEFAULT_KEYWORD_SITE_URL) {
  return new URL(normalizeTargetPath(targetPath, '/'), getSiteOrigin(siteUrl)).toString();
}

export function buildKeywordCatalogLookupKey({ normalizedKeyword, canonicalTargetUrl }) {
  return `${normalizeWhitespace(normalizedKeyword)}||${normalizeWhitespace(canonicalTargetUrl)}`;
}

export function buildKeywordCatalogLookupKeyFromValues({
  keyword,
  targetPath,
  siteUrl = DEFAULT_KEYWORD_SITE_URL
}) {
  return buildKeywordCatalogLookupKey({
    normalizedKeyword: normalizeKeywordForKey(keyword),
    canonicalTargetUrl: buildKeywordCatalogUrl(targetPath, siteUrl)
  });
}

export function resolveCanonicalTargetPath(rawTargetUrl, {
  urlMap = {},
  validSitePaths = [],
  rawRow = {}
} = {}) {
  const normalizedTarget = normalizeTargetPath(rawTargetUrl, '/');
  const validPathSet = validSitePaths instanceof Set
    ? validSitePaths
    : new Set(validSitePaths.map((value) => normalizeTargetPath(value, '/')));

  if (urlMap[normalizedTarget]) {
    const explicitMappedTarget = normalizeTargetPath(urlMap[normalizedTarget], '/');
    const shouldKeepExplicitMapping = (
      explicitMappedTarget !== normalizedTarget
      || normalizedTarget.startsWith('/blog/')
    );

    if (shouldKeepExplicitMapping && validPathSet.has(explicitMappedTarget)) {
      return explicitMappedTarget;
    }

    if (shouldKeepExplicitMapping) {
      throw buildUnmappedTargetError(normalizedTarget, explicitMappedTarget);
    }
  }

  if (validPathSet.has(normalizedTarget) && !BROAD_TARGET_PATHS.has(normalizedTarget)) {
    return normalizedTarget;
  }

  const resolvedBroadTarget = classifyBroadKeywordTargetPath(rawRow);
  if (validPathSet.has(resolvedBroadTarget)) {
    return resolvedBroadTarget;
  }

  throw buildUnmappedTargetError(normalizedTarget, resolvedBroadTarget);
}

function buildRowHash(rawRow) {
  const payload = KEYWORD_REFERENCE_HEADERS.map((header) => normalizeWhitespace(rawRow[header]));
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function normalizeRawCsvRow(rawRow = {}) {
  return KEYWORD_REFERENCE_HEADERS.reduce((accumulator, header) => {
    accumulator[header] = normalizeWhitespace(rawRow[header]);
    return accumulator;
  }, {});
}

function buildCatalogSeed({
  normalizedKeyword,
  displayKeyword,
  canonicalTargetPath,
  canonicalTargetUrl,
  targetDomain,
  rawRow,
  rowHash,
  rowNumber,
  referenceImpressions
}) {
  return {
    catalogKey: buildKeywordCatalogLookupKey({
      normalizedKeyword,
      canonicalTargetUrl
    }),
    normalizedKeyword,
    displayKeyword,
    canonicalTargetPath,
    canonicalTargetUrl,
    targetDomain,
    tagValues: Object.fromEntries(
      KEYWORD_REFERENCE_TAG_FIELDS.map((field) => [field, mergeUniquePipeValues(rawRow[field])])
    ),
    baselineRow: rawRow,
    bestReferenceImpressions: referenceImpressions,
    rawRowHashes: [rowHash],
    rawRowNumbers: [rowNumber]
  };
}

function mergeCatalogSeed(seed, {
  rawRow,
  rowHash,
  rowNumber,
  referenceImpressions
}) {
  const nextSeed = {
    ...seed,
    tagValues: { ...seed.tagValues },
    rawRowHashes: [...seed.rawRowHashes, rowHash],
    rawRowNumbers: [...seed.rawRowNumbers, rowNumber]
  };

  KEYWORD_REFERENCE_TAG_FIELDS.forEach((field) => {
    nextSeed.tagValues[field] = mergeUniquePipeValues(seed.tagValues[field], rawRow[field]);
  });

  if (referenceImpressions > seed.bestReferenceImpressions) {
    nextSeed.bestReferenceImpressions = referenceImpressions;
    nextSeed.baselineRow = rawRow;
    nextSeed.displayKeyword = normalizeWhitespace(rawRow.Keyword) || seed.displayKeyword;
  }

  return nextSeed;
}

function buildCleanedCsvRow(seed) {
  const cleanedRow = { ...seed.baselineRow };
  cleanedRow.Keyword = seed.displayKeyword;
  cleanedRow['Target URL'] = seed.canonicalTargetPath;

  KEYWORD_REFERENCE_TAG_FIELDS.forEach((field) => {
    cleanedRow[field] = toPipeString(seed.tagValues[field]);
  });

  return KEYWORD_REFERENCE_HEADERS.reduce((accumulator, header) => {
    accumulator[header] = normalizeWhitespace(cleanedRow[header]);
    return accumulator;
  }, {});
}

function buildCatalogRow(seed, siteUrl) {
  const cleanedRow = buildCleanedCsvRow(seed);

  return {
    catalog_key: seed.catalogKey,
    normalized_keyword: seed.normalizedKeyword,
    display_keyword: seed.displayKeyword,
    canonical_target_url: seed.canonicalTargetUrl,
    canonical_target_path: seed.canonicalTargetPath,
    target_domain: seed.targetDomain,
    active: true,
    category_tags: seed.tagValues['aCategory'],
    search_intent_tags: seed.tagValues['Search Intent'],
    competition_tags: seed.tagValues.Competition,
    optimization_status_tags: seed.tagValues['Optimization Status'],
    content_type_tags: seed.tagValues['Content Type'],
    priority_tags: seed.tagValues.Priority,
    trend_tags: seed.tagValues.Trend,
    raw_row_count: seed.rawRowHashes.length,
    reference_clicks: parseReferenceInteger(cleanedRow.Clicks),
    reference_impressions: parseReferenceInteger(cleanedRow.Impressions),
    reference_current_position: parseReferencePositivePosition(cleanedRow['Current Position']),
    reference_ctr: parseReferenceNumber(cleanedRow.CTR),
    reference_search_volume: parseReferenceInteger(cleanedRow['Search Volume']),
    reference_last_updated: normalizeDateString(cleanedRow['Last Updated']),
    metadata: {
      cleanedCsvRow: cleanedRow,
      siteUrl: getSiteOrigin(siteUrl),
      rawRowHashes: seed.rawRowHashes,
      rawRowNumbers: seed.rawRowNumbers
    }
  };
}

export function prepareKeywordReferenceCatalog({
  rows = [],
  urlMap = {},
  siteUrl = DEFAULT_KEYWORD_SITE_URL,
  validSitePaths = []
} = {}) {
  const normalizedSiteUrl = getSiteOrigin(siteUrl);
  const validPathSet = validSitePaths instanceof Set
    ? validSitePaths
    : new Set(validSitePaths.map((value) => normalizeTargetPath(value, '/')));
  const rawReferenceRows = [];
  const groupedCatalogRows = new Map();

  rows.forEach((inputRow, index) => {
    const rawRow = normalizeRawCsvRow(inputRow);
    const rowNumber = index + 1;
    const rowHash = buildRowHash(rawRow);
    const canonicalTargetPath = resolveCanonicalTargetPath(rawRow['Target URL'], {
      urlMap,
      validSitePaths: validPathSet,
      rawRow
    });
    const canonicalTargetUrl = buildKeywordCatalogUrl(canonicalTargetPath, normalizedSiteUrl);
    const normalizedKeyword = normalizeKeywordForKey(rawRow.Keyword);
    const displayKeyword = normalizeWhitespace(rawRow.Keyword);
    const targetDomain = normalizeDomain(normalizedSiteUrl);
    const catalogKey = buildKeywordCatalogLookupKey({
      normalizedKeyword,
      canonicalTargetUrl
    });
    const referenceImpressions = parseReferenceInteger(rawRow.Impressions) ?? -1;

    rawReferenceRows.push({
      row_number: rowNumber,
      row_hash: rowHash,
      catalog_key: catalogKey,
      normalized_keyword: normalizedKeyword,
      display_keyword: displayKeyword,
      original_target_url: normalizeTargetPath(rawRow['Target URL'], '/'),
      canonical_target_url: canonicalTargetUrl,
      canonical_target_path: canonicalTargetPath,
      csv_category: rawRow.aCategory,
      csv_keyword: rawRow.Keyword,
      csv_search_intent: rawRow['Search Intent'],
      csv_competition: rawRow.Competition,
      csv_target_url: rawRow['Target URL'],
      csv_optimization_status: rawRow['Optimization Status'],
      csv_content_type: rawRow['Content Type'],
      csv_priority: rawRow.Priority,
      csv_clicks: rawRow.Clicks,
      csv_impressions: rawRow.Impressions,
      csv_current_position: rawRow['Current Position'],
      csv_ctr: rawRow.CTR,
      csv_search_volume: rawRow['Search Volume'],
      csv_trend: rawRow.Trend,
      csv_last_updated: rawRow['Last Updated'],
      raw_payload: rawRow
    });

    const existingSeed = groupedCatalogRows.get(catalogKey);
    const nextSeed = existingSeed
      ? mergeCatalogSeed(existingSeed, {
          rawRow,
          rowHash,
          rowNumber,
          referenceImpressions
        })
      : buildCatalogSeed({
          normalizedKeyword,
          displayKeyword,
          canonicalTargetPath,
          canonicalTargetUrl,
          targetDomain,
          rawRow,
          rowHash,
          rowNumber,
          referenceImpressions
        });

    groupedCatalogRows.set(catalogKey, nextSeed);
  });

  const groupedSeeds = Array.from(groupedCatalogRows.values())
    .sort((a, b) => (
      a.canonicalTargetPath.localeCompare(b.canonicalTargetPath)
      || a.normalizedKeyword.localeCompare(b.normalizedKeyword)
    ));

  return {
    rawReferenceRows,
    cleanedRows: groupedSeeds.map((seed) => buildCleanedCsvRow(seed)),
    catalogRows: groupedSeeds.map((seed) => buildCatalogRow(seed, normalizedSiteUrl)),
    stats: {
      rawRowCount: rawReferenceRows.length,
      cleanedRowCount: groupedSeeds.length,
      duplicateRowCount: rawReferenceRows.length - groupedSeeds.length
    }
  };
}

export function buildCatalogUpsertRows({
  catalogRows = [],
  insertedReferenceRows = [],
  importId
} = {}) {
  const referenceRowIdsByCatalogKey = insertedReferenceRows.reduce((accumulator, row) => {
    const current = accumulator.get(row.catalog_key) || [];
    current.push(row.id);
    accumulator.set(row.catalog_key, current);
    return accumulator;
  }, new Map());

  return catalogRows.map((row) => ({
    ...row,
    latest_import_id: importId,
    reference_row_ids: referenceRowIdsByCatalogKey.get(row.catalog_key) || [],
    deactivated_at: null,
    metadata: {
      ...row.metadata,
      latestImportId: importId
    }
  }));
}

function ensureTextArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeWhitespace(item)).filter(Boolean);
  }

  return splitPipeValues(value);
}

export function normalizeGrowthKeywordCatalogRow(row = {}) {
  const canonicalTargetPath = normalizeTargetPath(row.canonical_target_path || row.canonical_target_url, '/');
  const siteUrl = row.metadata?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_KEYWORD_SITE_URL;
  const canonicalTargetUrl = normalizeWhitespace(
    row.canonical_target_url || buildKeywordCatalogUrl(canonicalTargetPath, siteUrl)
  );

  return {
    normalized_keyword: normalizeKeywordForKey(row.normalized_keyword || row.display_keyword || ''),
    display_keyword: normalizeWhitespace(row.display_keyword || row.normalized_keyword || ''),
    canonical_target_url: canonicalTargetUrl,
    canonical_target_path: canonicalTargetPath,
    target_domain: normalizeDomain(row.target_domain || canonicalTargetUrl),
    active: row.active !== false,
    category_tags: ensureTextArray(row.category_tags),
    search_intent_tags: ensureTextArray(row.search_intent_tags),
    competition_tags: ensureTextArray(row.competition_tags),
    optimization_status_tags: ensureTextArray(row.optimization_status_tags),
    content_type_tags: ensureTextArray(row.content_type_tags),
    priority_tags: ensureTextArray(row.priority_tags),
    trend_tags: ensureTextArray(row.trend_tags),
    raw_row_count: Number.isFinite(Number(row.raw_row_count)) ? Math.max(0, Math.round(Number(row.raw_row_count))) : 0,
    reference_row_ids: Array.isArray(row.reference_row_ids) ? row.reference_row_ids : [],
    latest_import_id: row.latest_import_id || null,
    reference_clicks: parseReferenceInteger(row.reference_clicks),
    reference_impressions: parseReferenceInteger(row.reference_impressions),
    reference_current_position: parseReferencePositivePosition(row.reference_current_position),
    reference_ctr: parseReferenceNumber(row.reference_ctr),
    reference_search_volume: parseReferenceInteger(row.reference_search_volume),
    reference_last_updated: normalizeDateString(row.reference_last_updated),
    metadata: row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? row.metadata
      : {}
  };
}

export async function insertGrowthKeywordReferenceImport(supabase, {
  source_filename,
  source_path,
  source_hash,
  raw_row_count,
  cleaned_row_count,
  metadata = {}
}) {
  const { data, error } = await supabase
    .from('growth_keyword_reference_imports')
    .insert([{
      source_filename: normalizeWhitespace(source_filename),
      source_path: normalizeWhitespace(source_path),
      source_hash: normalizeWhitespace(source_hash),
      raw_row_count: Math.max(0, Math.round(Number(raw_row_count) || 0)),
      cleaned_row_count: Math.max(0, Math.round(Number(cleaned_row_count) || 0)),
      metadata
    }])
    .select('id, source_filename, source_hash')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function insertGrowthKeywordReferenceRows(supabase, importId, rows = []) {
  if (!importId || rows.length === 0) {
    return [];
  }

  const payload = rows.map((row) => ({
    import_id: importId,
    ...row
  }));

  const { data, error } = await supabase
    .from('growth_keyword_reference_rows')
    .insert(payload)
    .select('id, catalog_key, row_hash');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function upsertGrowthKeywordCatalogRows(supabase, rows = []) {
  const payload = rows
    .map((row) => normalizeGrowthKeywordCatalogRow(row))
    .filter((row) => row.normalized_keyword && row.canonical_target_url);

  if (payload.length === 0) {
    return { count: 0 };
  }

  const { error } = await supabase
    .from('growth_keyword_catalog')
    .upsert(payload, {
      onConflict: 'normalized_keyword,canonical_target_url'
    });

  if (error) {
    throw error;
  }

  return { count: payload.length };
}

export async function deactivateMissingGrowthKeywordCatalogRows(supabase, activeCatalogRows = []) {
  const activeLookup = new Set(
    activeCatalogRows.map((row) => buildKeywordCatalogLookupKey({
      normalizedKeyword: row.normalized_keyword,
      canonicalTargetUrl: row.canonical_target_url
    }))
  );

  const { data, error } = await supabase
    .from('growth_keyword_catalog')
    .select('id, normalized_keyword, canonical_target_url')
    .eq('active', true);

  if (error) {
    throw error;
  }

  const idsToDeactivate = (data || [])
    .filter((row) => !activeLookup.has(buildKeywordCatalogLookupKey({
      normalizedKeyword: row.normalized_keyword,
      canonicalTargetUrl: row.canonical_target_url
    })))
    .map((row) => row.id);

  if (idsToDeactivate.length === 0) {
    return { count: 0 };
  }

  const { error: updateError } = await supabase
    .from('growth_keyword_catalog')
    .update({
      active: false,
      deactivated_at: new Date().toISOString()
    })
    .in('id', idsToDeactivate);

  if (updateError) {
    throw updateError;
  }

  return { count: idsToDeactivate.length };
}

export async function fetchGrowthKeywordCatalogRows(supabase, { activeOnly = true } = {}) {
  let query = supabase
    .from('growth_keyword_catalog')
    .select([
      'id',
      'normalized_keyword',
      'display_keyword',
      'canonical_target_url',
      'canonical_target_path',
      'target_domain',
      'active',
      'category_tags',
      'search_intent_tags',
      'competition_tags',
      'optimization_status_tags',
      'content_type_tags',
      'priority_tags',
      'trend_tags',
      'raw_row_count',
      'reference_row_ids',
      'latest_import_id',
      'reference_clicks',
      'reference_impressions',
      'reference_current_position',
      'reference_ctr',
      'reference_search_volume',
      'reference_last_updated',
      'metadata'
    ].join(','))
    .order('display_keyword', { ascending: true });

  if (activeOnly) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;
  if (error) {
    return {
      rows: [],
      error
    };
  }

  return {
    rows: (data || []).map((row) => ({
      id: row.id,
      ...normalizeGrowthKeywordCatalogRow(row)
    })),
    error: null
  };
}
