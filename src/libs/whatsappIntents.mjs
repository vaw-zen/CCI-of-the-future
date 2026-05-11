import {
  normalizeWhatsAppClickRow,
  shouldTrackWhatsAppClick
} from './whatsappAttribution.mjs';

export const WHATSAPP_INTENT_SELECT_FIELDS = [
  'id',
  'created_at',
  'clicked_at',
  'ga_client_id',
  'event_label',
  'page_path',
  'landing_page',
  'session_source',
  'session_medium',
  'session_campaign',
  'referrer_host'
].join(',');

function getClickId(value = {}) {
  return value?.whatsapp_click_id || value?.whatsappClickId || null;
}

export function collectClaimedWhatsAppClickIds(...collections) {
  const claimedIds = new Set();

  collections
    .flat()
    .forEach((row) => {
      const clickId = getClickId(row);
      if (clickId) {
        claimedIds.add(clickId);
      }
    });

  return claimedIds;
}

export function buildUnclaimedWhatsAppIntents(clickRows = [], claimedClickIds = new Set()) {
  const claimedIds = claimedClickIds instanceof Set
    ? claimedClickIds
    : new Set(claimedClickIds || []);

  return (clickRows || [])
    .filter((row) => shouldTrackWhatsAppClick(row))
    .map((row) => normalizeWhatsAppClickRow(row))
    .filter((row) => row.id && !claimedIds.has(row.id))
    .sort((left, right) => (
      String(right.clickedAt || right.createdAt || '').localeCompare(String(left.clickedAt || left.createdAt || ''))
    ));
}
