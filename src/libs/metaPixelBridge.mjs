function normalizeText(value = '', fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function withCurrency(value) {
  const normalizedValue = normalizeNumber(value);
  if (normalizedValue === null) {
    return {};
  }

  return {
    value: normalizedValue,
    currency: 'TND'
  };
}

function buildContentIdentifiers(payload = {}) {
  const rawId = normalizeText(
    payload.content_id
    || payload.item_id
    || payload.service_type
    || payload.content_name
    || payload.item_name,
    ''
  );

  if (!rawId) {
    return {};
  }

  return {
    content_ids: [rawId]
  };
}

function buildMetaPixelParams(payload = {}, defaults = {}) {
  const contentName = normalizeText(
    payload.content_name
    || payload.item_name
    || payload.page_title
    || payload.service_type
    || payload.lead_type,
    ''
  );
  const contentType = normalizeText(
    payload.content_type
    || defaults.contentType,
    ''
  );
  const contentCategory = normalizeText(
    payload.content_category
    || payload.business_line
    || defaults.contentCategory,
    ''
  );

  return Object.fromEntries(
    Object.entries({
      content_name: contentName || undefined,
      content_type: contentType || undefined,
      content_category: contentCategory || undefined,
      ...buildContentIdentifiers(payload),
      ...withCurrency(payload.value ?? payload.estimated_value)
    }).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

function buildEventOptions(payload = {}) {
  const eventId = normalizeText(payload.meta_event_id || payload.event_id, '');
  return eventId ? { eventID: eventId } : null;
}

export function normalizeMetaPixelId(value = '') {
  return normalizeText(value, '');
}

export function buildMetaPixelBootstrapScript(pixelId = '') {
  const normalizedPixelId = normalizeMetaPixelId(pixelId);
  if (!normalizedPixelId) {
    return '';
  }

  return `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.__cciMetaPixelId = '${normalizedPixelId}';
    window.__cciMetaPixelEnabled = true;
    fbq('init', '${normalizedPixelId}');
    fbq('track', 'PageView');
  `;
}

export function buildMetaPixelNoscriptUrl(pixelId = '') {
  const normalizedPixelId = normalizeMetaPixelId(pixelId);
  if (!normalizedPixelId) {
    return '';
  }

  return `https://www.facebook.com/tr?id=${encodeURIComponent(normalizedPixelId)}&ev=PageView&noscript=1`;
}

export function buildMetaPixelTrackCall(eventName = '', payload = {}) {
  const normalizedEventName = normalizeText(eventName, '');
  const options = buildEventOptions(payload);

  if (normalizedEventName === 'page_view') {
    return {
      method: 'track',
      eventName: 'PageView',
      params: null,
      options
    };
  }

  if (
    normalizedEventName === 'view_item'
    || (normalizedEventName === 'service_interaction' && normalizeText(payload.action_name).toLowerCase() === 'view_service_page')
    || normalizedEventName === 'view_service_page'
  ) {
    return {
      method: 'track',
      eventName: 'ViewContent',
      params: buildMetaPixelParams(payload, {
        contentType: 'service_page',
        contentCategory: 'service'
      }),
      options
    };
  }

  if (normalizedEventName === 'begin_checkout') {
    return {
      method: 'track',
      eventName: 'InitiateCheckout',
      params: buildMetaPixelParams(payload, {
        contentType: 'service_quote',
        contentCategory: 'quote_request'
      }),
      options
    };
  }

  if (normalizedEventName === 'generate_lead') {
    return {
      method: 'track',
      eventName: 'Lead',
      params: buildMetaPixelParams(payload, {
        contentType: 'lead',
        contentCategory: 'lead'
      }),
      options
    };
  }

  return null;
}
