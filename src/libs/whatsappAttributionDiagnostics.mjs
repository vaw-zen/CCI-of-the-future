function normalizeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeNullableText(value) {
  const text = normalizeText(value, '');
  return text || null;
}

function getField(source, snakeKey, camelKey) {
  return source?.[snakeKey] ?? source?.[camelKey];
}

function normalizePath(value) {
  const text = normalizeText(value, '');
  if (!text) {
    return '/';
  }

  try {
    return new URL(text, 'https://cciservices.online').pathname || '/';
  } catch (error) {
    if (text.startsWith('/')) {
      return text.split(/[?#]/, 1)[0] || '/';
    }

    return `/${text.split(/[?#]/, 1)[0] || ''}` || '/';
  }
}

function getLogicalPagePath(value = {}) {
  return normalizePath(
    getField(value, 'whatsapp_click_page', 'whatsappClickPage')
    || getField(value, 'page_path', 'pagePath')
    || getField(value, 'entry_path', 'entryPath')
  );
}

function getLogicalLandingPage(value = {}) {
  return normalizePath(
    getField(value, 'landing_page', 'landingPage')
    || getField(value, 'page_path', 'pagePath')
    || getField(value, 'entry_path', 'entryPath')
    || getField(value, 'whatsapp_click_page', 'whatsappClickPage')
  );
}

function getSourceTriple(value = {}) {
  return {
    source: normalizeText(getField(value, 'session_source', 'sessionSource'), 'direct'),
    medium: normalizeText(getField(value, 'session_medium', 'sessionMedium'), '(none)'),
    campaign: normalizeText(getField(value, 'session_campaign', 'sessionCampaign'), '(not set)')
  };
}

function buildDiagnosis(key, label, detail, isFallbackDirect = false) {
  return {
    key,
    label,
    detail,
    isFallbackDirect
  };
}

export function getWhatsAppAttributionDiagnosis(value = {}, {
  manualLead = false
} = {}) {
  if (manualLead) {
    return buildDiagnosis(
      'manual_whatsapp',
      'Manual direct lead',
      'Lead WhatsApp créé sans clic site associé.',
      false
    );
  }

  const { source, medium, campaign } = getSourceTriple(value);
  const referrerHost = normalizeNullableText(getField(value, 'referrer_host', 'referrerHost'));
  const pagePath = getLogicalPagePath(value);
  const landingPage = getLogicalLandingPage(value);
  const defaultDirect = source === 'direct' && medium === '(none)' && campaign === '(not set)';

  if (!defaultDirect) {
    return buildDiagnosis(
      'attributed_session',
      'Source capturée',
      'Source de session capturée sans fallback direct.',
      false
    );
  }

  if (!referrerHost && pagePath === '/' && landingPage === '/') {
    return buildDiagnosis(
      'fallback_direct_missing_context',
      'Fallback direct',
      'Classification directe par défaut car le cookie ou le referrer d’attribution était absent.',
      true
    );
  }

  return buildDiagnosis(
    'true_direct',
    'True direct',
    'Session directe avec contexte de page conservé.',
    false
  );
}

export function annotateWhatsAppAttributionDiagnosis(value = {}, options = {}) {
  const diagnosis = getWhatsAppAttributionDiagnosis(value, options);

  return {
    attributionDiagnosisKey: diagnosis.key,
    attributionDiagnosisLabel: diagnosis.label,
    attributionDiagnosisDetail: diagnosis.detail,
    isFallbackDirect: diagnosis.isFallbackDirect
  };
}
