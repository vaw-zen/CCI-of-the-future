export const META_PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram'
};

export const META_LEAD_SOURCES = {
  WEBSITE: 'website',
  LEAD_AD: 'lead_ad'
};

const META_PAID_MEDIA = new Set([
  'cpc',
  'ppc',
  'paid',
  'paid_social',
  'display',
  'affiliate'
]);

const META_REFERRAL_MEDIA = new Set([
  'social',
  'referral'
]);

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
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

function normalizeAttributionSourceLocal(value = '', fallback = '') {
  const text = normalizeCanonicalToken(value, fallback);
  if (!text) {
    return fallback;
  }

  if (text === '(direct)' || text === 'direct') {
    return 'direct';
  }

  return text;
}

function normalizeAttributionMediumLocal(value = '', fallback = '') {
  const text = normalizeCanonicalToken(value, fallback);
  if (!text) {
    return fallback;
  }

  if (text === 'none' || text === 'not_set') {
    return '(none)';
  }

  if (text === 'paidsocial' || text === 'paidsocialmedia') {
    return 'paid_social';
  }

  return text;
}

function normalizeAttributionHostLocal(value = '') {
  const text = normalizeText(value, '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  return text.split(/[/?#]/)[0] || '';
}

export function normalizeMetaIdentifier(value = '') {
  return normalizeText(value, '');
}

export function normalizeMetaLeadSource(value = '', fallback = '') {
  const normalizedValue = normalizeText(value, fallback).toLowerCase();
  return normalizedValue === META_LEAD_SOURCES.LEAD_AD
    ? META_LEAD_SOURCES.LEAD_AD
    : normalizedValue === META_LEAD_SOURCES.WEBSITE
      ? META_LEAD_SOURCES.WEBSITE
      : (fallback || '');
}

export function normalizeMetaPlatform(value = '', {
  source = '',
  referrerHost = ''
} = {}) {
  const normalizedValue = normalizeText(value, '').toLowerCase();
  if (normalizedValue === META_PLATFORMS.FACEBOOK || normalizedValue === META_PLATFORMS.INSTAGRAM) {
    return normalizedValue;
  }

  const normalizedSource = normalizeAttributionSourceLocal(source, '');
  if (normalizedSource === META_PLATFORMS.FACEBOOK || normalizedSource === META_PLATFORMS.INSTAGRAM) {
    return normalizedSource;
  }

  const normalizedHost = normalizeAttributionHostLocal(referrerHost);
  if (normalizedHost.includes('instagram.')) {
    return META_PLATFORMS.INSTAGRAM;
  }

  if (normalizedHost.includes('facebook.') || normalizedHost.includes('fb.')) {
    return META_PLATFORMS.FACEBOOK;
  }

  return '';
}

export function deriveMetaFbc({
  fbclid = '',
  existingFbc = '',
  capturedAt = Date.now()
} = {}) {
  const normalizedExisting = normalizeText(existingFbc, '');
  if (normalizedExisting) {
    return normalizedExisting;
  }

  const normalizedFbclid = normalizeText(fbclid, '');
  if (!normalizedFbclid) {
    return '';
  }

  const timestamp = Number.isFinite(Number(capturedAt))
    ? Math.round(Number(capturedAt))
    : Date.now();

  return `fb.1.${timestamp}.${normalizedFbclid}`;
}

function readCookieFromHeader(cookieHeader = '', key = '') {
  const entries = String(cookieHeader || '').split(/;\s*/);
  const match = entries.find((entry) => entry.startsWith(`${key}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

export function extractMetaCookieFields(cookieHeader = '') {
  return {
    meta_fbp: normalizeMetaIdentifier(readCookieFromHeader(cookieHeader, '_fbp')),
    meta_fbc: normalizeMetaIdentifier(readCookieFromHeader(cookieHeader, '_fbc'))
  };
}

export function extractMetaQueryFields(searchParams) {
  if (!searchParams?.get) {
    return {};
  }

  return {
    fbclid: normalizeMetaIdentifier(searchParams.get('fbclid')),
    meta_campaign_id: normalizeMetaIdentifier(searchParams.get('campaign_id') || searchParams.get('utm_id')),
    meta_adset_id: normalizeMetaIdentifier(searchParams.get('adset_id') || searchParams.get('adsetid')),
    meta_ad_id: normalizeMetaIdentifier(searchParams.get('ad_id') || searchParams.get('adid'))
  };
}

export function buildMetaAttributionFields(rawValue = {}, {
  source = '',
  referrerHost = '',
  fallbackLeadSource = ''
} = {}) {
  const fbclid = normalizeMetaIdentifier(rawValue.fbclid);
  const metaPlatform = normalizeMetaPlatform(rawValue.meta_platform, {
    source,
    referrerHost
  });
  const metaLeadSource = normalizeMetaLeadSource(rawValue.meta_lead_source, fallbackLeadSource);
  const metaFbc = deriveMetaFbc({
    fbclid,
    existingFbc: rawValue.meta_fbc,
    capturedAt: rawValue.captured_at || Date.now()
  });

  return Object.fromEntries(
    Object.entries({
      fbclid: fbclid || null,
      meta_fbc: normalizeMetaIdentifier(metaFbc) || null,
      meta_fbp: normalizeMetaIdentifier(rawValue.meta_fbp) || null,
      meta_platform: metaPlatform || null,
      meta_lead_source: metaLeadSource || null,
      meta_campaign_id: normalizeMetaIdentifier(rawValue.meta_campaign_id) || null,
      meta_adset_id: normalizeMetaIdentifier(rawValue.meta_adset_id) || null,
      meta_ad_id: normalizeMetaIdentifier(rawValue.meta_ad_id) || null,
      meta_leadgen_id: normalizeMetaIdentifier(rawValue.meta_leadgen_id) || null,
      meta_form_id: normalizeMetaIdentifier(rawValue.meta_form_id) || null,
      meta_page_id: normalizeMetaIdentifier(rawValue.meta_page_id) || null
    }).filter(([, value]) => value !== null)
  );
}

export function isMetaPlatform(value = '') {
  return value === META_PLATFORMS.FACEBOOK || value === META_PLATFORMS.INSTAGRAM;
}

export function isMetaWebsiteLead(row = {}) {
  const leadSource = normalizeMetaLeadSource(row.meta_lead_source, '');
  return leadSource === META_LEAD_SOURCES.WEBSITE;
}

export function isMetaLeadAd(row = {}) {
  const leadSource = normalizeMetaLeadSource(row.meta_lead_source, '');
  return leadSource === META_LEAD_SOURCES.LEAD_AD;
}

export function isMetaReferralSource({
  source = '',
  medium = '',
  metaPlatform = '',
  metaLeadSource = ''
} = {}) {
  if (normalizeMetaLeadSource(metaLeadSource, '') === META_LEAD_SOURCES.LEAD_AD) {
    return false;
  }

  const platform = normalizeMetaPlatform(metaPlatform, { source });
  const normalizedSource = normalizeAttributionSourceLocal(source, '');
  const normalizedMedium = normalizeAttributionMediumLocal(medium, '');
  return (
    (platform || normalizedSource === META_PLATFORMS.FACEBOOK || normalizedSource === META_PLATFORMS.INSTAGRAM)
    && META_REFERRAL_MEDIA.has(normalizedMedium)
  );
}

export function isMetaAdsSource({
  source = '',
  medium = '',
  metaPlatform = '',
  sourceClass = '',
  metaLeadSource = '',
  campaign = ''
} = {}) {
  if (normalizeMetaLeadSource(metaLeadSource, '') === META_LEAD_SOURCES.LEAD_AD) {
    return false;
  }

  const platform = normalizeMetaPlatform(metaPlatform, { source });
  const normalizedSource = normalizeAttributionSourceLocal(source, '');
  const normalizedMedium = normalizeAttributionMediumLocal(medium, '');
  const normalizedCampaign = normalizeText(campaign, '').toLowerCase();
  const normalizedSourceClass = normalizeText(sourceClass, '').toLowerCase();

  return Boolean(
    platform
    || normalizedSource === META_PLATFORMS.FACEBOOK
    || normalizedSource === META_PLATFORMS.INSTAGRAM
  ) && (
    META_PAID_MEDIA.has(normalizedMedium)
    || normalizedSourceClass === 'paid_social'
    || normalizedSourceClass === 'paid_media'
    || normalizedCampaign.includes('facebook_ads')
    || normalizedCampaign.includes('instagram_ads')
    || normalizedCampaign.includes('meta_ads')
  );
}
