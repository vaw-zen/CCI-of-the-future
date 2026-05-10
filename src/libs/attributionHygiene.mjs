import {
  extractGaClientIdFromGaCookie,
  getHostnameFromUrl,
  getPathFromUrl,
  getPathnameFromUrl,
  parseSessionAttributionCookie,
  SESSION_ATTRIBUTION_COOKIE_KEY
} from './whatsappTracking.mjs';

export const ATTRIBUTION_DEFAULTS = {
  source: 'direct',
  medium: '(none)',
  campaign: '(not set)',
  landingPage: '/',
  entryPath: '/'
};

const SOCIAL_SOURCE_BY_HOST = new Map([
  ['facebook.com', 'facebook'],
  ['instagram.com', 'instagram'],
  ['linkedin.com', 'linkedin'],
  ['tiktok.com', 'tiktok'],
  ['twitter.com', 'twitter'],
  ['x.com', 'twitter']
]);

function normalizeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeCanonicalToken(value = '', fallback = '') {
  const text = normalizeText(value, fallback)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return text || fallback;
}

function readCookieFromHeader(cookieHeader = '', key = '') {
  const entries = String(cookieHeader || '').split(/;\s*/);
  const match = entries.find((entry) => entry.startsWith(`${key}=`));
  return match ? match.split('=').slice(1).join('=') : '';
}

function normalizeInternalHost(value = '') {
  const host = normalizeText(value, '').toLowerCase().replace(/^www\./, '');
  return host || '';
}

function extractHostCandidate(value = '') {
  const text = normalizeText(value, '');
  if (!text || text.startsWith('/')) {
    return '';
  }

  const withoutProtocol = text.replace(/^[a-z]+:\/\//i, '');
  const candidate = withoutProtocol.split(/[/?#]/)[0];

  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(candidate)
    ? candidate
    : '';
}

export function normalizeAttributionHost(value = '') {
  const directHost = extractHostCandidate(value);
  if (directHost) {
    return normalizeInternalHost(directHost);
  }

  const fromUrl = getHostnameFromUrl(value);
  if (fromUrl) {
    return normalizeInternalHost(fromUrl);
  }

  return normalizeInternalHost(value);
}

export function normalizeAttributionSource(value = '', fallback = '') {
  const text = normalizeCanonicalToken(value, fallback);

  if (!text) {
    return fallback;
  }

  if (text === '(direct)' || text === 'direct') {
    return 'direct';
  }

  return text;
}

export function normalizeAttributionMedium(value = '', fallback = '') {
  const text = normalizeCanonicalToken(value, fallback);

  if (!text) {
    return fallback;
  }

  if (text === 'none' || text === 'not_set') {
    return '(none)';
  }

  if (text === 'paidsocial') {
    return 'paid_social';
  }

  if (text === 'paidsocialmedia') {
    return 'paid_social';
  }

  return text;
}

export function normalizeCampaignName(value = '', fallback = ATTRIBUTION_DEFAULTS.campaign) {
  const rawValue = normalizeText(value, '');
  if (!rawValue) {
    return fallback;
  }

  const normalized = normalizeCanonicalToken(rawValue, '');
  if (!normalized || normalized === 'not_set') {
    return ATTRIBUTION_DEFAULTS.campaign;
  }

  return normalized;
}

export function normalizeAttributionPath(value = '', fallback = ATTRIBUTION_DEFAULTS.landingPage, {
  includeSearch = false
} = {}) {
  const rawValue = normalizeText(value, '');
  if (!rawValue) {
    return fallback;
  }

  const parsedPath = includeSearch
    ? getPathFromUrl(rawValue)
    : getPathnameFromUrl(rawValue);
  if (parsedPath) {
    return parsedPath;
  }

  let cleanValue = rawValue.split('#')[0];
  if (!includeSearch) {
    cleanValue = cleanValue.split('?')[0];
  }

  if (!cleanValue.startsWith('/')) {
    cleanValue = `/${cleanValue.replace(/^\/+/, '')}`;
  }

  return cleanValue || fallback;
}

export function getAttributionSiteHost(request = null) {
  const configuredHost = normalizeAttributionHost(process.env.NEXT_PUBLIC_SITE_URL || '');
  if (configuredHost) {
    return configuredHost;
  }

  const requestHost = normalizeAttributionHost(
    request?.nextUrl?.hostname
    || request?.headers?.get?.('host')
    || ''
  );

  return requestHost || 'cciservices.online';
}

export function isInternalAttributionHost(host = '', siteHost = '') {
  const normalizedHost = normalizeAttributionHost(host);
  const normalizedSiteHost = normalizeAttributionHost(siteHost);

  if (!normalizedHost || !normalizedSiteHost) {
    return false;
  }

  return normalizedHost === normalizedSiteHost || normalizedHost.endsWith(`.${normalizedSiteHost}`);
}

function inferSocialSourceFromHost(host = '') {
  const normalizedHost = normalizeAttributionHost(host);

  for (const [pattern, source] of SOCIAL_SOURCE_BY_HOST.entries()) {
    if (normalizedHost === pattern || normalizedHost.endsWith(`.${pattern}`)) {
      return source;
    }
  }

  return '';
}

function inferMediumFromSource(source = '', referrerHost = '', siteHost = '') {
  const normalizedSource = normalizeAttributionSource(source, '');
  const normalizedReferrer = normalizeAttributionHost(referrerHost);

  if (!normalizedSource) {
    return normalizedReferrer && !isInternalAttributionHost(normalizedReferrer, siteHost)
      ? 'referral'
      : ATTRIBUTION_DEFAULTS.medium;
  }

  if (normalizedSource === 'direct') {
    return ATTRIBUTION_DEFAULTS.medium;
  }

  if (normalizedSource === 'google' || normalizedSource === 'bing') {
    return 'organic';
  }

  if (normalizedSource === 'whatsapp') {
    return 'messaging';
  }

  if (normalizedSource === 'email' || normalizedSource === 'newsletter') {
    return 'email';
  }

  if (inferSocialSourceFromHost(normalizedSource) || ['facebook', 'instagram', 'linkedin', 'tiktok', 'twitter'].includes(normalizedSource)) {
    return 'social';
  }

  if (normalizedReferrer && normalizedSource === normalizedReferrer) {
    return 'referral';
  }

  if (normalizedSource.includes('.')) {
    return 'referral';
  }

  return ATTRIBUTION_DEFAULTS.medium;
}

export function inferAttributionFromReferrerHost(referrerHost = '', siteHost = '') {
  const normalizedReferrer = normalizeAttributionHost(referrerHost);

  if (!normalizedReferrer || isInternalAttributionHost(normalizedReferrer, siteHost)) {
    return {
      source: ATTRIBUTION_DEFAULTS.source,
      medium: ATTRIBUTION_DEFAULTS.medium,
      campaign: ATTRIBUTION_DEFAULTS.campaign
    };
  }

  if (normalizedReferrer.includes('google.')) {
    return {
      source: 'google',
      medium: 'organic',
      campaign: ATTRIBUTION_DEFAULTS.campaign
    };
  }

  if (normalizedReferrer.includes('bing.')) {
    return {
      source: 'bing',
      medium: 'organic',
      campaign: ATTRIBUTION_DEFAULTS.campaign
    };
  }

  const socialSource = inferSocialSourceFromHost(normalizedReferrer);
  if (socialSource) {
    return {
      source: socialSource,
      medium: 'social',
      campaign: ATTRIBUTION_DEFAULTS.campaign
    };
  }

  if (normalizedReferrer.includes('whatsapp')) {
    return {
      source: 'whatsapp',
      medium: 'messaging',
      campaign: ATTRIBUTION_DEFAULTS.campaign
    };
  }

  return {
    source: normalizedReferrer,
    medium: 'referral',
    campaign: ATTRIBUTION_DEFAULTS.campaign
  };
}

export function resolveCanonicalAttribution({
  source = '',
  medium = '',
  campaign = '',
  referrerHost = '',
  siteHost = ''
} = {}) {
  const normalizedReferrer = normalizeAttributionHost(referrerHost);
  const inferred = inferAttributionFromReferrerHost(normalizedReferrer, siteHost);
  let resolvedSource = normalizeAttributionSource(source, '');
  let resolvedMedium = normalizeAttributionMedium(medium, '');

  if (!resolvedSource && !resolvedMedium) {
    resolvedSource = inferred.source;
    resolvedMedium = inferred.medium;
  } else {
    if (!resolvedSource) {
      resolvedSource = inferred.source !== ATTRIBUTION_DEFAULTS.source
        ? inferred.source
        : ATTRIBUTION_DEFAULTS.source;
    }

    if (!resolvedMedium) {
      resolvedMedium = inferMediumFromSource(resolvedSource, normalizedReferrer, siteHost);
    }

    if (
      resolvedSource === ATTRIBUTION_DEFAULTS.source
      && resolvedMedium === ATTRIBUTION_DEFAULTS.medium
      && inferred.source !== ATTRIBUTION_DEFAULTS.source
    ) {
      resolvedSource = inferred.source;
      resolvedMedium = inferred.medium;
    }
  }

  return {
    source: resolvedSource || ATTRIBUTION_DEFAULTS.source,
    medium: resolvedMedium || ATTRIBUTION_DEFAULTS.medium,
    campaign: normalizeCampaignName(campaign, ATTRIBUTION_DEFAULTS.campaign)
  };
}

export function extractRequestAttributionFallback(request = null) {
  if (!request?.headers?.get) {
    return {};
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const sessionAttribution = parseSessionAttributionCookie(
    readCookieFromHeader(cookieHeader, SESSION_ATTRIBUTION_COOKIE_KEY)
  );
  const gaClientId = extractGaClientIdFromGaCookie(
    readCookieFromHeader(cookieHeader, '_ga')
  );
  const siteHost = getAttributionSiteHost(request);
  const referer = normalizeText(request.headers.get('referer'), '');
  const referrerHost = normalizeAttributionHost(sessionAttribution.referrer_host || referer);
  const resolvedSession = resolveCanonicalAttribution({
    source: sessionAttribution.source,
    medium: sessionAttribution.medium,
    campaign: sessionAttribution.campaign,
    referrerHost,
    siteHost
  });
  const fallbackEntryPath = normalizeAttributionPath(referer, ATTRIBUTION_DEFAULTS.entryPath, {
    includeSearch: true
  });

  return {
    ga_client_id: gaClientId || null,
    landing_page: normalizeAttributionPath(
      sessionAttribution.landing_page || referer,
      ATTRIBUTION_DEFAULTS.landingPage,
      { includeSearch: false }
    ),
    entry_path: fallbackEntryPath || normalizeAttributionPath(
      sessionAttribution.landing_page,
      ATTRIBUTION_DEFAULTS.entryPath,
      { includeSearch: true }
    ),
    referrer_host: referrerHost || null,
    session_source: resolvedSession.source,
    session_medium: resolvedSession.medium,
    session_campaign: resolvedSession.campaign
  };
}

export function normalizeAnalyticsAttributionContext(rawContext = {}, {
  request = null
} = {}) {
  const fallbackContext = request ? extractRequestAttributionFallback(request) : {};
  const siteHost = getAttributionSiteHost(request);
  const referrerHost = normalizeAttributionHost(
    rawContext.referrer_host
    || rawContext.referrerHost
    || fallbackContext.referrer_host
  );
  const canonicalAttribution = resolveCanonicalAttribution({
    source: rawContext.session_source || rawContext.source || fallbackContext.session_source,
    medium: rawContext.session_medium || rawContext.medium || fallbackContext.session_medium,
    campaign: rawContext.session_campaign || rawContext.campaign || fallbackContext.session_campaign,
    referrerHost,
    siteHost
  });
  const landingPage = normalizeAttributionPath(
    rawContext.landing_page
    || rawContext.landingPage
    || rawContext.page_path
    || rawContext.page_location
    || rawContext.landing_location
    || fallbackContext.landing_page
    || fallbackContext.entry_path,
    ATTRIBUTION_DEFAULTS.landingPage,
    { includeSearch: false }
  );
  const entryPath = normalizeAttributionPath(
    rawContext.entry_path
    || rawContext.page_path
    || rawContext.page_location
    || rawContext.landing_location
    || fallbackContext.entry_path
    || rawContext.landing_page
    || landingPage,
    landingPage,
    { includeSearch: true }
  );

  return {
    ga_client_id: normalizeText(rawContext.ga_client_id || fallbackContext.ga_client_id, '') || null,
    landing_page: landingPage,
    session_source: canonicalAttribution.source,
    session_medium: canonicalAttribution.medium,
    session_campaign: canonicalAttribution.campaign,
    referrer_host: referrerHost || null,
    entry_path: entryPath
  };
}

function getCampaignNamingIssue(row = {}) {
  const rawCampaign = normalizeText(row.session_campaign, '');
  if (!rawCampaign || rawCampaign === ATTRIBUTION_DEFAULTS.campaign) {
    return null;
  }

  const normalizedCampaign = normalizeCampaignName(rawCampaign, ATTRIBUTION_DEFAULTS.campaign);
  if (rawCampaign === normalizedCampaign) {
    return null;
  }

  return {
    rawCampaign,
    normalizedCampaign
  };
}

export function buildAttributionAuditSummary(rows = [], {
  siteHost = 'cciservices.online'
} = {}) {
  const normalizedSiteHost = normalizeAttributionHost(siteHost);
  const campaignGroups = new Map();
  let directNoneCount = 0;
  let missingLandingPageCount = 0;
  let missingEntryPathCount = 0;
  let suspiciousDirectCount = 0;
  let campaignNormalizationIssueCount = 0;

  const problematicRows = rows
    .map((row) => {
      const source = normalizeAttributionSource(row.session_source, ATTRIBUTION_DEFAULTS.source);
      const medium = normalizeAttributionMedium(row.session_medium, ATTRIBUTION_DEFAULTS.medium);
      const landingPage = normalizeAttributionPath(row.landing_page, '', { includeSearch: false });
      const entryPath = normalizeAttributionPath(row.entry_path, '', { includeSearch: true });
      const referrerHost = normalizeAttributionHost(row.referrer_host);
      const campaignIssue = getCampaignNamingIssue(row);
      const isDirectNone = source === ATTRIBUTION_DEFAULTS.source && medium === ATTRIBUTION_DEFAULTS.medium;
      const missingLandingPage = !landingPage || landingPage === ATTRIBUTION_DEFAULTS.landingPage && !normalizeText(row.landing_page, '');
      const missingEntryPath = !entryPath || entryPath === ATTRIBUTION_DEFAULTS.entryPath && !normalizeText(row.entry_path, '');
      const suspiciousDirect = isDirectNone && referrerHost && !isInternalAttributionHost(referrerHost, normalizedSiteHost);

      if (isDirectNone) {
        directNoneCount += 1;
      }

      if (missingLandingPage) {
        missingLandingPageCount += 1;
      }

      if (missingEntryPath) {
        missingEntryPathCount += 1;
      }

      if (suspiciousDirect) {
        suspiciousDirectCount += 1;
      }

      if (campaignIssue) {
        campaignNormalizationIssueCount += 1;
        const currentGroup = campaignGroups.get(campaignIssue.normalizedCampaign) || new Set();
        currentGroup.add(campaignIssue.rawCampaign);
        campaignGroups.set(campaignIssue.normalizedCampaign, currentGroup);
      }

      const issues = [
        missingLandingPage ? 'missing_landing_page' : null,
        missingEntryPath ? 'missing_entry_path' : null,
        suspiciousDirect ? 'direct_with_external_referrer' : null,
        campaignIssue ? 'campaign_needs_normalization' : null
      ].filter(Boolean);

      return {
        id: row.id,
        leadKind: row.lead_kind || row.leadKind || 'lead',
        createdAt: row.created_at || row.createdAt || null,
        landingPage: landingPage || ATTRIBUTION_DEFAULTS.landingPage,
        entryPath: entryPath || ATTRIBUTION_DEFAULTS.entryPath,
        source,
        medium,
        campaign: normalizeText(row.session_campaign, ATTRIBUTION_DEFAULTS.campaign),
        normalizedCampaign: normalizeCampaignName(row.session_campaign, ATTRIBUTION_DEFAULTS.campaign),
        referrerHost: referrerHost || null,
        issues
      };
    })
    .filter((row) => row.issues.length > 0)
    .sort((a, b) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()))
    .slice(0, 12);

  const total = rows.length;
  const unattributedRate = total > 0
    ? Math.round((directNoneCount / total) * 1000) / 10
    : 0;

  return {
    totals: {
      leads: total,
      directNoneCount,
      unattributedRate,
      missingLandingPageCount,
      missingEntryPathCount,
      suspiciousDirectCount,
      campaignNormalizationIssueCount
    },
    status: unattributedRate >= 40
      ? 'critical'
      : unattributedRate >= 25 || missingLandingPageCount > 0 || missingEntryPathCount > 0 || suspiciousDirectCount > 0
        ? 'warning'
        : 'pass',
    campaignVariants: Array.from(campaignGroups.entries())
      .map(([normalizedCampaign, rawVariants]) => ({
        normalizedCampaign,
        rawVariants: Array.from(rawVariants).sort()
      }))
      .sort((a, b) => b.rawVariants.length - a.rawVariants.length || a.normalizedCampaign.localeCompare(b.normalizedCampaign)),
    problematicRows
  };
}
