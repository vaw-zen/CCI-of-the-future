const CANONICAL_PAGE_TYPES = new Set([
  'home',
  'service_page',
  'article_page',
  'quote_page',
  'contact_page',
  'b2b_page',
  'faq_page',
  'about_page',
  'team_page',
  'other'
]);

const CANONICAL_BUSINESS_LINES = new Set([
  'b2c',
  'b2b',
  'content',
  'brand'
]);

const CANONICAL_SERVICE_TYPES = new Set([
  'salon',
  'tapis',
  'marbre',
  'tapisserie',
  'tfc',
  'convention',
  'multi_service',
  'unknown'
]);

const CANONICAL_FORM_NAMES = new Set([
  'devis_form',
  'contact_quote_form',
  'convention_form',
  'newsletter_form'
]);

const CANONICAL_FORM_PLACEMENTS = new Set([
  'devis_page',
  'contact_page',
  'entreprises_page',
  'article_inline',
  'modal',
  'footer'
]);

const CANONICAL_FUNNEL_NAMES = new Set([
  'quote_request',
  'convention_request',
  'newsletter_signup'
]);

const CANONICAL_CONTACT_METHODS = new Set([
  'form',
  'phone',
  'email',
  'whatsapp'
]);

const CANONICAL_CTA_TYPES = new Set([
  'primary',
  'secondary',
  'contact',
  'lead_cta',
  'navigation'
]);

const BEHAVIOR_EVENT_NAME_ALIASES = {
  view_promotion: 'cta_impression',
  select_promotion: 'cta_click',
  cta_click: 'cta_click',
  begin_checkout: 'funnel_step',
  checkout_progress: 'funnel_step',
  phone_click: 'phone_click',
  email_click: 'email_click',
  whatsapp_click: 'whatsapp_click',
  page_view: 'page_view',
  utm_arrival: 'utm_arrival',
  view_page_type: 'view_page_type',
  view_service_page: 'view_service_page',
  quote_calculator_started: 'quote_calculator_started',
  quote_calculator_calculated: 'quote_calculator_calculated',
  form_field_focus: 'form_field_focus',
  form_field_complete: 'form_field_complete',
  form_abandonment: 'form_abandonment',
  form_validation_failed: 'form_validation_failed',
  form_submit_failed: 'submit_failed',
  generate_lead: 'generate_lead',
  article_read_progress: 'article_read_progress',
  article_complete: 'article_complete',
  faq_expanded: 'faq_expanded',
  newsletter_signup_started: 'newsletter_signup_started',
  newsletter_signup_submitted: 'newsletter_signup_submitted',
  newsletter_signup_failed: 'newsletter_signup_failed'
};

export const PERSISTED_BEHAVIOR_EVENT_NAMES = new Set(Object.values(BEHAVIOR_EVENT_NAME_ALIASES));

const LEGACY_PAGE_TYPE_ALIASES = {
  home: 'home',
  service: 'service_page',
  service_page: 'service_page',
  article: 'article_page',
  article_page: 'article_page',
  quote: 'quote_page',
  quote_page: 'quote_page',
  contact: 'contact_page',
  contact_page: 'contact_page',
  b2b_page: 'b2b_page',
  faq: 'faq_page',
  faq_page: 'faq_page',
  about: 'about_page',
  about_page: 'about_page',
  team: 'team_page',
  team_page: 'team_page',
  other: 'other'
};

const LEGACY_SERVICE_TYPE_ALIASES = {
  travaux_fin_chantier: 'tfc',
  moquette: 'tapis',
  conseil: 'unknown',
  general: 'unknown',
  autre: 'unknown',
  unknown: 'unknown'
};

const LEGACY_FORM_NAME_ALIASES = {
  contact_form: 'contact_quote_form',
  contact_quote_form: 'contact_quote_form',
  devis_form: 'devis_form',
  convention_form: 'convention_form',
  newsletter_form: 'newsletter_form'
};

const LEGACY_FUNNEL_NAME_ALIASES = {
  devis_form: 'quote_request',
  contact_form: 'quote_request',
  contact_quote_form: 'quote_request',
  quote_request: 'quote_request',
  convention_form: 'convention_request',
  convention_request: 'convention_request',
  newsletter_form: 'newsletter_signup',
  newsletter_signup: 'newsletter_signup'
};

const LEGACY_STEP_NAME_ALIASES = {
  form_start: 'form_start',
  service_selected: 'service_selected',
  secteur_selected: 'service_selected',
  details_completed: 'details_completed',
  validation_failed: 'validation_failed',
  form_submitted: 'submit_success',
  submit_success: 'submit_success',
  submit_failed: 'submit_failed'
};

const DASHBOARD_PAGE_TYPE_ALIASES = {
  home: ['home'],
  service: ['service_page', 'b2b_page'],
  article: ['article_page'],
  quote: ['quote_page'],
  contact: ['contact_page'],
  faq: ['faq_page'],
  about: ['about_page', 'team_page'],
  other: ['other']
};

const B2B_SERVICE_TYPES = new Set(['convention']);
const B2C_SERVICE_TYPES = new Set(['salon', 'tapis', 'marbre', 'tapisserie', 'tfc', 'multi_service']);

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeNullableText(value) {
  const text = normalizeText(value, '');
  return text || null;
}

function normalizeIntegerOrNull(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.round(numericValue);
}

function normalizeNumberOrNull(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.round(numericValue * 100) / 100;
}

function normalizePath(value, fallback = '/') {
  const rawValue = normalizeText(value, fallback);
  if (!rawValue) {
    return fallback;
  }

  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    try {
      const url = new URL(rawValue);
      const normalizedPath = `${url.pathname || '/'}${url.search || ''}`;
      return normalizedPath || fallback;
    } catch (error) {
      return fallback;
    }
  }

  const [pathname, search = ''] = rawValue.split('?');
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return search ? `${normalizedPathname}?${search}` : normalizedPathname;
}

function normalizePathnameOnly(value, fallback = '/') {
  const normalized = normalizePath(value, fallback);
  return normalized.split('?')[0] || fallback;
}

function slugify(value, fallback = '') {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

  return normalized || fallback;
}

function pickFirstNonEmptyValue(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }

    if (value !== undefined && value !== null && String(value).trim()) {
      return value;
    }
  }

  return '';
}

function deriveServiceTypeFromPath(rawPath = '') {
  const normalizedPath = normalizePathnameOnly(rawPath, '/').toLowerCase();

  if (normalizedPath === '/entreprises' || normalizedPath.startsWith('/entreprises/')) {
    return 'convention';
  }

  if (normalizedPath.includes('tapisserie')) {
    return 'tapisserie';
  }

  if (normalizedPath.includes('salon')) {
    return 'salon';
  }

  if (normalizedPath.includes('tapis')) {
    return 'tapis';
  }

  if (normalizedPath.includes('marbre')) {
    return 'marbre';
  }

  if (normalizedPath.includes('tfc') || normalizedPath.includes('chantier')) {
    return 'tfc';
  }

  return null;
}

function derivePageTypeFromPath(rawPath = '') {
  const normalizedPath = normalizePathnameOnly(rawPath, '/').toLowerCase();

  if (normalizedPath === '/') {
    return 'home';
  }

  if (normalizedPath.startsWith('/conseils/')) {
    return 'article_page';
  }

  if (normalizedPath === '/contact') {
    return 'contact_page';
  }

  if (normalizedPath === '/devis') {
    return 'quote_page';
  }

  if (normalizedPath === '/entreprises' || normalizedPath.startsWith('/entreprises/')) {
    return 'b2b_page';
  }

  if (normalizedPath.startsWith('/faq')) {
    return 'faq_page';
  }

  if (normalizedPath.startsWith('/team')) {
    return 'team_page';
  }

  if (normalizedPath.startsWith('/about')) {
    return 'about_page';
  }

  if (
    normalizedPath === '/services'
    || normalizedPath === '/salon'
    || normalizedPath === '/tapis'
    || normalizedPath === '/tapisserie'
    || normalizedPath === '/marbre'
    || normalizedPath === '/tfc'
  ) {
    return 'service_page';
  }

  return 'other';
}

export function getDashboardPageTypeForBehaviorPageType(pageType = '') {
  switch (normalizeText(pageType, 'other')) {
    case 'home':
      return 'home';
    case 'service_page':
    case 'b2b_page':
      return 'service';
    case 'article_page':
      return 'article';
    case 'quote_page':
      return 'quote';
    case 'contact_page':
      return 'contact';
    case 'faq_page':
      return 'faq';
    case 'about_page':
    case 'team_page':
      return 'about';
    default:
      return 'other';
  }
}

export function matchesBehaviorDashboardPageType(pageType = '', dashboardPageType = '') {
  if (!dashboardPageType) {
    return true;
  }

  const allowedPageTypes = DASHBOARD_PAGE_TYPE_ALIASES[dashboardPageType] || [dashboardPageType];
  return allowedPageTypes.includes(normalizeText(pageType, 'other'));
}

export function normalizeBehaviorPageType({
  pageType = '',
  pagePath = '',
  landingPage = ''
} = {}) {
  const explicitPageType = LEGACY_PAGE_TYPE_ALIASES[normalizeText(pageType).toLowerCase()];
  if (explicitPageType && CANONICAL_PAGE_TYPES.has(explicitPageType)) {
    return explicitPageType;
  }

  const derivedPageType = derivePageTypeFromPath(pickFirstNonEmptyValue(pagePath, landingPage));
  return CANONICAL_PAGE_TYPES.has(derivedPageType) ? derivedPageType : 'other';
}

export function normalizeBehaviorServiceType({
  serviceType = '',
  pagePath = '',
  landingPage = '',
  leadType = '',
  selectedServices = []
} = {}) {
  const explicitServiceType = normalizeText(serviceType).toLowerCase();
  if (CANONICAL_SERVICE_TYPES.has(explicitServiceType)) {
    return explicitServiceType;
  }

  if (LEGACY_SERVICE_TYPE_ALIASES[explicitServiceType]) {
    return LEGACY_SERVICE_TYPE_ALIASES[explicitServiceType];
  }

  const selectedService = slugify(pickFirstNonEmptyValue(selectedServices));
  if (CANONICAL_SERVICE_TYPES.has(selectedService)) {
    return selectedService;
  }

  const derivedServiceType = deriveServiceTypeFromPath(pickFirstNonEmptyValue(pagePath, landingPage));
  if (derivedServiceType) {
    return derivedServiceType;
  }

  if (normalizeText(leadType).toLowerCase() === 'convention_request') {
    return 'convention';
  }

  return 'unknown';
}

export function normalizeBehaviorBusinessLine({
  businessLine = '',
  pageType = '',
  serviceType = '',
  pagePath = '',
  landingPage = ''
} = {}) {
  const explicitBusinessLine = normalizeText(businessLine).toLowerCase();
  if (CANONICAL_BUSINESS_LINES.has(explicitBusinessLine)) {
    return explicitBusinessLine;
  }

  const canonicalPageType = normalizeBehaviorPageType({
    pageType,
    pagePath,
    landingPage
  });
  const canonicalServiceType = normalizeBehaviorServiceType({
    serviceType,
    pagePath,
    landingPage
  });

  if (canonicalPageType === 'article_page') {
    return 'content';
  }

  if (canonicalPageType === 'b2b_page' || B2B_SERVICE_TYPES.has(canonicalServiceType)) {
    return 'b2b';
  }

  if (
    canonicalPageType === 'service_page'
    || canonicalPageType === 'quote_page'
    || canonicalPageType === 'contact_page'
    || B2C_SERVICE_TYPES.has(canonicalServiceType)
  ) {
    return 'b2c';
  }

  return 'brand';
}

export function normalizeBehaviorFormName(formName = '') {
  const normalizedFormName = normalizeText(formName).toLowerCase();
  if (!normalizedFormName) {
    return null;
  }

  if (CANONICAL_FORM_NAMES.has(normalizedFormName)) {
    return normalizedFormName;
  }

  return LEGACY_FORM_NAME_ALIASES[normalizedFormName] || null;
}

export function normalizeBehaviorFunnelName(funnelName = '', formName = '') {
  const normalizedFunnelName = normalizeText(funnelName).toLowerCase();
  if (CANONICAL_FUNNEL_NAMES.has(normalizedFunnelName)) {
    return normalizedFunnelName;
  }

  if (LEGACY_FUNNEL_NAME_ALIASES[normalizedFunnelName]) {
    return LEGACY_FUNNEL_NAME_ALIASES[normalizedFunnelName];
  }

  const normalizedFormName = normalizeBehaviorFormName(formName);
  if (normalizedFormName && LEGACY_FUNNEL_NAME_ALIASES[normalizedFormName]) {
    return LEGACY_FUNNEL_NAME_ALIASES[normalizedFormName];
  }

  return null;
}

export function normalizeBehaviorStepName(stepName = '') {
  const normalizedStepName = normalizeText(stepName).toLowerCase();
  if (!normalizedStepName) {
    return null;
  }

  return LEGACY_STEP_NAME_ALIASES[normalizedStepName] || normalizedStepName;
}

export function normalizeBehaviorFormPlacement(formPlacement = '', pageType = '', formName = '') {
  const normalizedFormPlacement = normalizeText(formPlacement).toLowerCase();
  if (CANONICAL_FORM_PLACEMENTS.has(normalizedFormPlacement)) {
    return normalizedFormPlacement;
  }

  const canonicalPageType = normalizeBehaviorPageType({ pageType });
  const canonicalFormName = normalizeBehaviorFormName(formName);

  if (canonicalPageType === 'quote_page' || canonicalFormName === 'devis_form') {
    return 'devis_page';
  }

  if (canonicalPageType === 'contact_page' || canonicalFormName === 'contact_quote_form') {
    return 'contact_page';
  }

  if (canonicalPageType === 'b2b_page' || canonicalFormName === 'convention_form') {
    return 'entreprises_page';
  }

  if (canonicalPageType === 'article_page') {
    return 'article_inline';
  }

  return null;
}

export function normalizeBehaviorContactMethod(contactMethod = '', eventName = '') {
  const normalizedContactMethod = normalizeText(contactMethod).toLowerCase();
  if (CANONICAL_CONTACT_METHODS.has(normalizedContactMethod)) {
    return normalizedContactMethod;
  }

  switch (normalizeText(eventName).toLowerCase()) {
    case 'phone_click':
      return 'phone';
    case 'email_click':
      return 'email';
    case 'whatsapp_click':
      return 'whatsapp';
    case 'generate_lead':
    case 'newsletter_signup_submitted':
      return 'form';
    default:
      return null;
  }
}

export function normalizeBehaviorCtaType(ctaType = '', contactMethod = '') {
  const normalizedCtaType = normalizeText(ctaType).toLowerCase();
  if (CANONICAL_CTA_TYPES.has(normalizedCtaType)) {
    return normalizedCtaType;
  }

  if (contactMethod && contactMethod !== 'form') {
    return 'contact';
  }

  return null;
}

export function normalizeBehaviorEventName(rawEventName = '', payload = {}) {
  const normalizedEventName = normalizeText(rawEventName).toLowerCase();

  if (!normalizedEventName) {
    return null;
  }

  if (
    normalizedEventName === 'service_interaction'
    && normalizeText(payload.action_name).toLowerCase() === 'view_service_page'
  ) {
    return 'view_service_page';
  }

  return BEHAVIOR_EVENT_NAME_ALIASES[normalizedEventName] || null;
}

export function shouldPersistBehaviorEvent(rawEventName = '', payload = {}) {
  const normalizedEventName = normalizeBehaviorEventName(rawEventName, payload);
  return Boolean(normalizedEventName && PERSISTED_BEHAVIOR_EVENT_NAMES.has(normalizedEventName));
}

function buildBehaviorMetadata(rawEventName = '', payload = {}) {
  const metadata = {
    raw_event_name: normalizeText(rawEventName, 'unknown')
  };

  const allowlistedFields = [
    'event_category',
    'event_label',
    'link_destination',
    'promotion_name',
    'creative_slot',
    'action_name',
    'field_name',
    'field_type',
    'failure_type',
    'field_names',
    'article_title',
    'article_slug',
    'article_category',
    'read_progress',
    'time_spent',
    'page_title',
    'estimated_value',
    'selected_services',
    'calculator_estimate',
    'company_sector',
    'services_count',
    'number_of_sites',
    'contract_frequency',
    'contract_duration',
    'surface_total',
    'faq_question'
  ];

  allowlistedFields.forEach((field) => {
    const value = payload[field];
    if (value !== undefined && value !== null && value !== '') {
      metadata[field] = value;
    }
  });

  return metadata;
}

function deriveCtaId(payload = {}, normalizedEventName = '', contactMethod = '') {
  const explicitCtaId = normalizeNullableText(payload.cta_id);
  if (explicitCtaId) {
    return slugify(explicitCtaId, explicitCtaId);
  }

  const labelBasedId = slugify(payload.promotion_name || payload.event_label || payload.link_text || '', '');
  if (labelBasedId) {
    return labelBasedId;
  }

  if (contactMethod) {
    return slugify(`${payload.cta_location || payload.creative_slot || 'general'}_${contactMethod}`, '');
  }

  if (normalizedEventName === 'cta_click' || normalizedEventName === 'cta_impression') {
    return 'unnamed_cta';
  }

  return null;
}

function deriveCtaLocation(payload = {}, pageType = '') {
  const explicitLocation = normalizeNullableText(payload.cta_location || payload.creative_slot);
  if (explicitLocation) {
    return slugify(explicitLocation, explicitLocation);
  }

  const labelLocation = normalizeNullableText(payload.event_label);
  if (labelLocation && (labelLocation.includes('header') || labelLocation.includes('footer') || labelLocation.includes('cta'))) {
    return slugify(labelLocation, labelLocation);
  }

  if (pageType === 'service_page' || pageType === 'b2b_page') {
    return 'service_cta_block';
  }

  return null;
}

export function normalizeBehaviorEventPayload(rawEventName = '', payload = {}, occurredAt = new Date().toISOString()) {
  const normalizedEventName = normalizeBehaviorEventName(rawEventName, payload);
  if (!normalizedEventName || !PERSISTED_BEHAVIOR_EVENT_NAMES.has(normalizedEventName)) {
    return null;
  }

  const pagePath = pickFirstNonEmptyValue(payload.page_path, payload.entry_path, payload.landing_page);
  const landingPage = normalizePath(payload.landing_page || pagePath || '/', '/');
  const entryPath = normalizePath(payload.entry_path || pagePath || landingPage, landingPage);
  const normalizedPagePathname = normalizePathnameOnly(payload.page_path || entryPath || landingPage, '/');
  if (normalizedPagePathname.startsWith('/admin')) {
    return null;
  }
  const selectedServices = Array.isArray(payload.selected_services) ? payload.selected_services : [];
  const formName = normalizeBehaviorFormName(payload.form_name);
  const pageType = normalizeBehaviorPageType({
    pageType: payload.page_type,
    pagePath: payload.page_path,
    landingPage
  });
  const serviceType = normalizeBehaviorServiceType({
    serviceType: pickFirstNonEmptyValue(payload.service_type, payload.primary_service),
    pagePath: payload.page_path,
    landingPage,
    leadType: payload.lead_type,
    selectedServices
  });
  const businessLine = normalizeBehaviorBusinessLine({
    businessLine: payload.business_line,
    pageType,
    serviceType,
    pagePath: payload.page_path,
    landingPage
  });
  const funnelName = normalizeBehaviorFunnelName(payload.funnel_name, formName);
  const stepName = normalizeBehaviorStepName(
    payload.step_name
      || (normalizedEventName === 'form_validation_failed' ? 'validation_failed' : '')
      || (normalizedEventName === 'submit_failed' ? 'submit_failed' : '')
  );
  const contactMethod = normalizeBehaviorContactMethod(payload.contact_method, normalizedEventName);
  const ctaLocation = deriveCtaLocation(payload, pageType);
  const ctaId = deriveCtaId(payload, normalizedEventName, contactMethod);
  const ctaType = normalizeBehaviorCtaType(
    payload.cta_type || payload.promotion_type,
    contactMethod
  );

  return {
    occurred_at: occurredAt,
    transport_event_name: normalizeText(rawEventName, 'unknown'),
    event_name: normalizedEventName,
    page_type: pageType,
    business_line: businessLine,
    service_type: serviceType,
    lead_type: normalizeNullableText(payload.lead_type),
    form_name: formName,
    form_placement: normalizeBehaviorFormPlacement(payload.form_placement, pageType, formName),
    funnel_name: funnelName,
    step_name: stepName,
    step_number: normalizeIntegerOrNull(payload.step_number),
    cta_id: ctaId,
    cta_location: ctaLocation,
    cta_type: ctaType,
    contact_method: contactMethod,
    content_type: normalizeNullableText(payload.content_type || (pageType === 'article_page' ? 'article' : '')),
    content_cluster: normalizeNullableText(
      payload.content_cluster
      || payload.article_category
      || payload.filter_category
    ),
    landing_page: landingPage,
    entry_path: entryPath,
    session_source: normalizeText(payload.session_source, 'direct'),
    session_medium: normalizeText(payload.session_medium, '(none)'),
    session_campaign: normalizeText(payload.session_campaign, '(not set)'),
    ga_client_id: normalizeNullableText(payload.ga_client_id),
    value: normalizeNumberOrNull(payload.value),
    metadata: buildBehaviorMetadata(rawEventName, payload)
  };
}
