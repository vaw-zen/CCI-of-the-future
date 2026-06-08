import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildWhatsAppClickDedupeSignature,
  filterTrackedWhatsAppClicks,
  WHATSAPP_MATCH_WINDOW_DAYS,
  WHATSAPP_CLICK_DEDUPE_WINDOW_MS,
  buildWhatsAppManualTagPatch,
  isRecentWhatsAppClickDuplicate,
  getWhatsAppAttributionMode,
  isWithinWhatsAppMatchWindow,
  matchesWhatsAppFilter,
  normalizeWhatsAppClickPayload,
  persistWhatsAppClickEvent,
  shouldTrackWhatsAppClick,
  pickLatestEligibleWhatsAppClick
} from '../src/libs/whatsappAttribution.mjs';
import {
  buildTrackedWhatsAppHref,
  extractGaClientIdFromGaCookie,
  parseSessionAttributionCookie,
  serializeSessionAttributionCookie
} from '../src/libs/whatsappTracking.mjs';
import { getWhatsAppAttributionDiagnosis } from '../src/libs/whatsappAttributionDiagnostics.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, '..');

function createFakeWhatsAppClickSupabase(initialRows = []) {
  const rows = [...initialRows];
  const inserts = [];

  const applyFilters = (inputRows, filters) => inputRows.filter((row) => filters.every((filter) => {
    const value = row[filter.column] ?? null;

    if (filter.type === 'eq') {
      return value === filter.value;
    }

    if (filter.type === 'is') {
      return value === filter.value;
    }

    if (filter.type === 'gte') {
      return String(value || '') >= String(filter.value);
    }

    if (filter.type === 'lte') {
      return String(value || '') <= String(filter.value);
    }

    return true;
  }));

  return {
    inserts,
    rows,
    from(table) {
      assert.equal(table, 'whatsapp_click_events');

      return {
        select() {
          const state = {
            filters: [],
            limitCount: Infinity
          };

          const query = {
            eq(column, value) {
              state.filters.push({ type: 'eq', column, value });
              return query;
            },
            is(column, value) {
              state.filters.push({ type: 'is', column, value });
              return query;
            },
            gte(column, value) {
              state.filters.push({ type: 'gte', column, value });
              return query;
            },
            lte(column, value) {
              state.filters.push({ type: 'lte', column, value });
              return query;
            },
            order() {
              return query;
            },
            limit(limitCount) {
              state.limitCount = limitCount;
              return query;
            },
            then(resolve, reject) {
              try {
                const filteredRows = applyFilters(rows, state.filters)
                  .sort((left, right) => String(right.clicked_at || '').localeCompare(String(left.clicked_at || '')))
                  .slice(0, state.limitCount);
                resolve({ data: filteredRows, error: null });
              } catch (error) {
                if (reject) {
                  reject(error);
                  return;
                }

                throw error;
              }
            }
          };

          return query;
        },
        insert(payload) {
          inserts.push(payload);
          const insertedRow = {
            id: `wa-${rows.length + 1}`,
            created_at: payload.clicked_at,
            ...payload
          };
          rows.push(insertedRow);

          return {
            select() {
              return {
                async single() {
                  return {
                    data: insertedRow,
                    error: null
                  };
                }
              };
            }
          };
        }
      };
    }
  };
}

test('normalizeWhatsAppClickPayload keeps only safe WhatsApp attribution fields', () => {
  const payload = normalizeWhatsAppClickPayload({
    gaClientId: '123.456',
    eventLabel: 'home_hero_whatsapp_main',
    pagePath: '/contact?utm_source=whatsapp',
    sessionSource: 'instagram',
    sessionMedium: 'social',
    sessionCampaign: 'bio_link',
    referrerHost: 'instagram.com',
    email: 'sensitive@example.com',
    linkDestination: 'https://wa.me/21698557766?text=Bonjour'
  }, '2026-05-07T12:00:00.000Z');

  assert.deepEqual(payload, {
    ga_client_id: '123.456',
    event_label: 'home_hero_whatsapp_main',
    page_path: '/contact?utm_source=whatsapp',
    landing_page: '/contact?utm_source=whatsapp',
    session_source: 'instagram',
    session_medium: 'social',
    session_campaign: 'bio_link',
    referrer_host: 'instagram.com',
    clicked_at: '2026-05-07T12:00:00.000Z'
  });
});

test('shouldTrackWhatsAppClick ignores admin-surface payloads and keeps public ones', () => {
  assert.equal(shouldTrackWhatsAppClick({
    page_path: '/admin/dashboard',
    landing_page: '/admin/dashboard'
  }), false);
  assert.equal(shouldTrackWhatsAppClick({
    page_path: 'https://cciservices.online/admin/whatsapp',
    landing_page: '/salon'
  }), false);
  assert.equal(shouldTrackWhatsAppClick({
    page_path: '/contact',
    landing_page: '/services'
  }), true);

  assert.deepEqual(
    filterTrackedWhatsAppClicks([
      { id: 'admin-1', page_path: '/admin/dashboard', landing_page: '/admin/dashboard' },
      { id: 'public-1', page_path: '/contact', landing_page: '/contact' }
    ]).map((row) => row.id),
    ['public-1']
  );
});

test('pickLatestEligibleWhatsAppClick returns the latest click inside the 30 day match window', () => {
  const leadCreatedAt = '2026-05-07T12:00:00.000Z';
  const matchedClick = pickLatestEligibleWhatsAppClick([
    {
      id: 'too-old',
      clicked_at: '2026-04-01T09:00:00.000Z',
      event_label: 'old',
      page_path: '/'
    },
    {
      id: 'eligible-1',
      clicked_at: '2026-05-01T09:00:00.000Z',
      event_label: 'home',
      page_path: '/'
    },
    {
      id: 'eligible-2',
      clicked_at: '2026-05-06T08:30:00.000Z',
      event_label: 'sticky',
      page_path: '/contact'
    },
    {
      id: 'future',
      clicked_at: '2026-05-08T08:30:00.000Z',
      event_label: 'future',
      page_path: '/contact'
    }
  ], leadCreatedAt);

  assert.equal(WHATSAPP_MATCH_WINDOW_DAYS, 30);
  assert.equal(isWithinWhatsAppMatchWindow('2026-04-07T12:00:00.000Z', leadCreatedAt), true);
  assert.equal(isWithinWhatsAppMatchWindow('2026-04-06T11:59:59.000Z', leadCreatedAt), false);
  assert.equal(matchedClick?.id, 'eligible-2');
});

test('manual tag patch and filter matching distinguish auto, manual, both, and none', () => {
  const autoLead = { whatsapp_click_id: 'wa-1' };
  const manualLead = { whatsapp_manual_tag: true };
  const bothLead = { whatsapp_click_id: 'wa-1', whatsapp_manual_tag: true };
  const noneLead = {};

  assert.deepEqual(buildWhatsAppManualTagPatch(true, '2026-05-07T12:00:00.000Z'), {
    whatsapp_manual_tag: true,
    whatsapp_manual_tagged_at: '2026-05-07T12:00:00.000Z'
  });
  assert.equal(getWhatsAppAttributionMode(autoLead), 'auto');
  assert.equal(getWhatsAppAttributionMode(manualLead), 'manual');
  assert.equal(getWhatsAppAttributionMode(bothLead), 'auto_manual');
  assert.equal(getWhatsAppAttributionMode(noneLead), 'none');
  assert.equal(matchesWhatsAppFilter(autoLead, 'auto'), true);
  assert.equal(matchesWhatsAppFilter(manualLead, 'auto'), false);
  assert.equal(matchesWhatsAppFilter(bothLead, 'manual'), true);
  assert.equal(matchesWhatsAppFilter(noneLead, 'none'), true);
});

test('buildTrackedWhatsAppHref converts a WhatsApp destination into an internal logging redirect', () => {
  const trackedHref = buildTrackedWhatsAppHref({
    href: 'https://wa.me/21698557766?text=Bonjour%20CCI',
    eventLabel: 'home_hero_whatsapp_main'
  });
  const trackedUrl = new URL(trackedHref, 'https://cciservices.online');

  assert.equal(trackedUrl.pathname, '/out/whatsapp');
  assert.equal(trackedUrl.searchParams.get('phone'), '21698557766');
  assert.equal(trackedUrl.searchParams.get('text'), 'Bonjour CCI');
  assert.equal(trackedUrl.searchParams.get('label'), 'home_hero_whatsapp_main');
  assert.equal(extractGaClientIdFromGaCookie('GA1.1.123456789.987654321'), '123456789.987654321');
});

test('session attribution cookie serializer keeps only the non-PII fields needed for server-side redirect logging', () => {
  const serialized = serializeSessionAttributionCookie({
    source: 'instagram',
    medium: 'social',
    campaign: 'bio_link',
    landing_page: '/services',
    referrer_host: 'instagram.com',
    email: 'sensitive@example.com'
  });

  assert.deepEqual(parseSessionAttributionCookie(serialized), {
    source: 'instagram',
    medium: 'social',
    campaign: 'bio_link',
    landing_page: '/services',
    referrer_host: 'instagram.com'
  });
});

test('whatsapp attribution diagnosis distinguishes captured, true direct, fallback direct, and manual direct leads', () => {
  assert.deepEqual(
    getWhatsAppAttributionDiagnosis({
      session_source: 'google',
      session_medium: 'organic',
      session_campaign: '(not set)',
      page_path: '/conseils/tarif-nettoyage-tapis-tunis-2025',
      landing_page: '/conseils/tarif-nettoyage-tapis-tunis-2025',
      referrer_host: 'google.com'
    }),
    {
      key: 'attributed_session',
      label: 'Source capturée',
      detail: 'Source de session capturée sans fallback direct.',
      isFallbackDirect: false
    }
  );

  assert.deepEqual(
    getWhatsAppAttributionDiagnosis({
      session_source: 'direct',
      session_medium: '(none)',
      session_campaign: '(not set)',
      page_path: '/',
      landing_page: '/',
      referrer_host: null
    }),
    {
      key: 'fallback_direct_missing_context',
      label: 'Fallback direct',
      detail: 'Classification directe par défaut car le cookie ou le referrer d’attribution était absent.',
      isFallbackDirect: true
    }
  );

  assert.deepEqual(
    getWhatsAppAttributionDiagnosis({
      session_source: 'direct',
      session_medium: '(none)',
      session_campaign: '(not set)',
      whatsapp_click_page: '/salon',
      landing_page: '/salon',
      referrer_host: null
    }),
    {
      key: 'true_direct',
      label: 'True direct',
      detail: 'Session directe avec contexte de page conservé.',
      isFallbackDirect: false
    }
  );

  assert.deepEqual(
    getWhatsAppAttributionDiagnosis({
      session_source: 'whatsapp',
      session_medium: 'messaging',
      landing_page: '/tapisserie'
    }, {
      manualLead: true
    }),
    {
      key: 'manual_whatsapp',
      label: 'Manual direct lead',
      detail: 'Lead WhatsApp créé sans clic site associé.',
      isFallbackDirect: false
    }
  );
});

test('dedupe signature normalizes query strings away so the same WhatsApp click can be matched across routes', () => {
  const signature = buildWhatsAppClickDedupeSignature({
    ga_client_id: '123.456',
    event_label: 'sticky_header_whatsapp',
    page_path: '/conseils/tarif-nettoyage-tapis-tunis-2025?utm_source=google',
    landing_page: '/conseils/tarif-nettoyage-tapis-tunis-2025?utm_source=google',
    session_source: 'google',
    session_medium: 'organic',
    session_campaign: '(not set)',
    referrer_host: 'google.com',
    clicked_at: '2026-06-08T15:31:00.000Z'
  });

  assert.equal(signature.page_path, '/conseils/tarif-nettoyage-tapis-tunis-2025');
  assert.equal(signature.landing_page, '/conseils/tarif-nettoyage-tapis-tunis-2025');
});

test('recent duplicate detection matches equivalent WhatsApp clicks inside the dedupe window', () => {
  const duplicate = isRecentWhatsAppClickDuplicate({
    ga_client_id: '123.456',
    event_label: 'sticky_header_whatsapp',
    page_path: '/conseils/tarif-nettoyage-tapis-tunis-2025',
    landing_page: '/conseils/tarif-nettoyage-tapis-tunis-2025',
    session_source: 'google',
    session_medium: 'organic',
    session_campaign: '(not set)',
    referrer_host: 'google.com',
    clicked_at: '2026-06-08T15:31:00.000Z'
  }, {
    ga_client_id: '123.456',
    event_label: 'sticky_header_whatsapp',
    page_path: '/conseils/tarif-nettoyage-tapis-tunis-2025?utm_source=google',
    landing_page: '/conseils/tarif-nettoyage-tapis-tunis-2025?utm_source=google',
    session_source: 'google',
    session_medium: 'organic',
    session_campaign: '(not set)',
    referrer_host: 'google.com',
    clicked_at: '2026-06-08T15:31:05.000Z'
  }, WHATSAPP_CLICK_DEDUPE_WINDOW_MS);

  assert.equal(duplicate, true);
});

test('persistWhatsAppClickEvent suppresses duplicate inserts inside the dedupe window', async () => {
  const fakeSupabase = createFakeWhatsAppClickSupabase();

  const firstInsert = await persistWhatsAppClickEvent(fakeSupabase, {
    ga_client_id: '123.456',
    event_label: 'sticky_header_whatsapp',
    page_path: '/conseils/tarif-nettoyage-tapis-tunis-2025',
    landing_page: '/conseils/tarif-nettoyage-tapis-tunis-2025',
    session_source: 'google',
    session_medium: 'organic',
    session_campaign: '(not set)',
    referrer_host: 'google.com',
    clicked_at: '2026-06-08T15:31:00.000Z'
  });

  const secondInsert = await persistWhatsAppClickEvent(fakeSupabase, {
    ga_client_id: '123.456',
    event_label: 'sticky_header_whatsapp',
    page_path: '/conseils/tarif-nettoyage-tapis-tunis-2025?utm_source=google',
    landing_page: '/conseils/tarif-nettoyage-tapis-tunis-2025?utm_source=google',
    session_source: 'google',
    session_medium: 'organic',
    session_campaign: '(not set)',
    referrer_host: 'google.com',
    clicked_at: '2026-06-08T15:31:03.000Z'
  });

  assert.equal(firstInsert.inserted, true);
  assert.equal(firstInsert.duplicate, false);
  assert.equal(secondInsert.inserted, false);
  assert.equal(secondInsert.duplicate, true);
  assert.equal(fakeSupabase.inserts.length, 1);
});

test('main WhatsApp CTA surfaces use analytics-aware links instead of raw wa.me anchors', async () => {
  const auditedFiles = [
    'src/layout/header/header.jsx',
    'src/app/home/sections/1-hero/hero.jsx',
    'src/app/contact/1-actions/actions.jsx',
    'src/app/conseils/components/CTAButton/CTAButtons.jsx'
  ];

  for (const relativePath of auditedFiles) {
    const contents = await readFile(path.join(repoRoot, relativePath), 'utf8');
    assert.match(contents, /AnalyticsLink/);
    assert.doesNotMatch(contents, /<a\s+[^>]*href=["']https:\/\/wa\.me/i);
  }
});

test('admin navigation WhatsApp tab stays internal and never uses tracked outbound WhatsApp links', async () => {
  const contents = await readFile(
    path.join(repoRoot, 'src/app/admin/_components/AdminNavTabs.jsx'),
    'utf8'
  );

  assert.match(contents, /href:\s*['"]\/admin\/whatsapp['"]/);
  assert.doesNotMatch(contents, /AnalyticsLink/);
  assert.doesNotMatch(contents, /buildTrackedWhatsAppHref/);
  assert.doesNotMatch(contents, /wa\.me|api\.whatsapp\.com|\/out\/whatsapp/);
});
