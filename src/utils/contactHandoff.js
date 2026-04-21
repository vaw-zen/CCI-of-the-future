const SERVICE_CONFIG = {
  salon: {
    slug: 'salon',
    shortLabel: 'Salon',
    label: 'nettoyage de salon et canapes',
    displayLabel: 'nettoyage de salon et canapés',
    pageTitle: 'Nettoyage Salon',
    path: '/salon'
  },
  tapis: {
    slug: 'tapis',
    shortLabel: 'Tapis',
    label: 'nettoyage de tapis et moquettes',
    displayLabel: 'nettoyage de tapis et moquettes',
    pageTitle: 'Nettoyage Tapis & Moquettes',
    path: '/tapis'
  },
  tapisserie: {
    slug: 'tapisserie',
    shortLabel: 'Tapisserie',
    label: 'retapissage et tapisserie sur mesure',
    displayLabel: 'retapissage et tapisserie sur mesure',
    pageTitle: 'Retapissage & Tapisserie',
    path: '/tapisserie'
  },
  marbre: {
    slug: 'marbre',
    shortLabel: 'Marbre',
    label: 'polissage et cristallisation du marbre',
    displayLabel: 'polissage et cristallisation du marbre',
    pageTitle: 'Polissage Marbre',
    path: '/marbre'
  },
  tfc: {
    slug: 'tfc',
    shortLabel: 'Post-chantier',
    label: 'nettoyage post-chantier',
    displayLabel: 'nettoyage post-chantier',
    pageTitle: 'Nettoyage Post-Chantier',
    path: '/tfc'
  }
};

export const PRIORITY_ARTICLE_CONFIGS = {
  'nettoyage-voiture-interieur-tunis-2025': {
    service: 'salon',
    serviceLink: '/salon',
    serviceCtaLabel: 'Voir le service nettoyage salon',
    title: 'Besoin d\'un interieur auto impeccable ?',
    body: 'Expliquez-nous l\'etat de vos sieges et tissus. Nous vous rappelons rapidement avec la bonne methode et un devis adapte.'
  },
  'retapissage-rembourrage-professionnel-tunis-sur-mesure': {
    service: 'tapisserie',
    serviceLink: '/tapisserie',
    serviceCtaLabel: 'Voir le service tapisserie',
    title: 'Parlons de votre projet de retapissage',
    body: 'Decrivez vos meubles, vos tissus ou votre besoin de changement mousse. Nous revenons vers vous avec une solution sur mesure.'
  },
  'prix-nettoyage-tapis-tunis-tarifs-2025': {
    service: 'tapis',
    serviceLink: '/tapis',
    serviceCtaLabel: 'Voir le service tapis',
    title: 'Obtenez un devis clair pour vos tapis',
    body: 'A partir de vos surfaces et de l\'etat des fibres, nous vous confirmons rapidement la bonne methode et le budget reel.'
  }
};

const SOURCE_LABELS = {
  direct: 'Contact direct',
  service_page: 'Page service',
  article: 'Article conseil',
  calculator: 'Simulateur de devis'
};

function humanizeSlug(value = '') {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();
}

function getParam(searchParams, key) {
  if (!searchParams) {
    return '';
  }

  if (typeof searchParams.get === 'function') {
    return searchParams.get(key) || '';
  }

  return searchParams[key] || '';
}

export function normalizeServiceSlug(service = '') {
  const value = String(service).trim().toLowerCase();

  if (!value) {
    return '';
  }

  const aliases = {
    moquette: 'tapis',
    travaux_fin_chantier: 'tfc',
    'post-chantier': 'tfc'
  };

  const normalized = aliases[value] || value;
  return SERVICE_CONFIG[normalized] ? normalized : '';
}

export function parseServicesList(value = '') {
  const source = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(source.map(normalizeServiceSlug).filter(Boolean))];
}

export function getServiceConfig(service = '') {
  return SERVICE_CONFIG[normalizeServiceSlug(service)] || null;
}

export function buildContactHref({
  source = 'service_page',
  service = '',
  article = '',
  estimate = '',
  services = []
} = {}) {
  const params = new URLSearchParams();
  const normalizedService = normalizeServiceSlug(service);
  const selectedServices = parseServicesList(services);

  if (source) {
    params.set('source', source);
  }

  if (normalizedService) {
    params.set('service', normalizedService);
  }

  if (article) {
    params.set('article', article);
  }

  if (selectedServices.length > 0) {
    params.set('services', selectedServices.join(','));
  }

  const numericEstimate = Number(estimate);
  if (Number.isFinite(numericEstimate) && numericEstimate > 0) {
    params.set('estimate', String(Math.round(numericEstimate)));
  }

  const query = params.toString();
  return query ? `/contact?${query}` : '/contact';
}

function buildPrefillMessage({ source, article, articleDisplay, serviceInfo, estimate, selectedServicesLabel }) {
  const label = serviceInfo?.displayLabel || 'votre projet';

  if (source === 'calculator') {
    const estimateLine = estimate ? ` avec une estimation autour de ${estimate} DT` : '';
    const serviceLine = selectedServicesLabel ? ` pour ${selectedServicesLabel.toLowerCase()}` : '';
    return `Bonjour, j'ai utilise votre simulateur${serviceLine}${estimateLine}. Je souhaite recevoir un devis confirme et etre rappele rapidement.`;
  }

  if (source === 'article') {
    const articleLine = articleDisplay ? ` a partir de votre guide "${articleDisplay}"` : '';
    return `Bonjour, je souhaite un devis${articleLine} pour ${label}. Merci de me recontacter rapidement.`;
  }

  if (source === 'service_page' && serviceInfo) {
    return `Bonjour, je souhaite un devis pour ${label}. Merci de me recontacter rapidement.`;
  }

  return '';
}

export function getContactContext(searchParams) {
  const rawSource = getParam(searchParams, 'source');
  const source = SOURCE_LABELS[rawSource] ? rawSource : 'direct';
  const service = normalizeServiceSlug(getParam(searchParams, 'service'));
  const article = getParam(searchParams, 'article');
  const articleDisplay = humanizeSlug(article);
  const selectedServices = parseServicesList(getParam(searchParams, 'services'));
  const estimateValue = Number(getParam(searchParams, 'estimate'));
  const estimate = Number.isFinite(estimateValue) && estimateValue > 0 ? Math.round(estimateValue) : null;
  const resolvedServices = selectedServices.length > 0 ? selectedServices : (service ? [service] : []);
  const serviceInfo = getServiceConfig(service || resolvedServices[0]);
  const selectedServicesLabel = resolvedServices
    .map((slug) => getServiceConfig(slug)?.shortLabel || slug)
    .join(', ');

  let eyebrow = SOURCE_LABELS[source];
  let heading = 'Obtenez votre devis personnalise';
  let description = 'Remplissez le formulaire ci-dessous pour recevoir un rappel rapide et un devis adapte a votre besoin.';

  if (source === 'service_page' && serviceInfo) {
    eyebrow = `${SOURCE_LABELS[source]} • ${serviceInfo.pageTitle}`;
    heading = `Recevez votre devis pour ${serviceInfo.displayLabel}`;
    description = 'Nous revenons vers vous rapidement avec une estimation claire, sans engagement, partout dans le Grand Tunis.';
  } else if (source === 'article' && serviceInfo) {
    eyebrow = `${SOURCE_LABELS[source]} • ${serviceInfo.pageTitle}`;
    heading = `Passez du guide au devis pour ${serviceInfo.displayLabel}`;
    description = 'Vous avez deja le contexte. Il ne vous reste qu\'a nous decrire votre cas pour obtenir un diagnostic et un rappel rapide.';
  } else if (source === 'calculator') {
    eyebrow = SOURCE_LABELS[source];
    heading = 'Transformez votre estimation en devis confirme';
    description = estimate
      ? `Votre estimation indicative est d'environ ${estimate} DT. Donnez-nous quelques details pour confirmer le bon service et le budget reel.`
      : 'Vous avez deja une estimation indicative. Donnez-nous quelques details pour confirmer le bon service et le budget reel.';
  }

  return {
    source,
    sourceLabel: SOURCE_LABELS[source],
    service,
    serviceInfo,
    article,
    articleDisplay,
    selectedServices: resolvedServices,
    selectedServicesLabel,
    estimate,
    eyebrow,
    heading,
    description,
    prefillMessage: buildPrefillMessage({
      source,
      article,
      articleDisplay,
      serviceInfo,
      estimate,
      selectedServicesLabel
    })
  };
}
