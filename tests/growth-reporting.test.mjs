import test from 'node:test';
import assert from 'node:assert/strict';
import {
  combineGrowthMetricRows,
  getSearchConsoleSyncWindow,
  SEARCH_CONSOLE_RECENT_SYNC_WINDOW_DAYS
} from '../src/libs/growthReporting.mjs';

test('combineGrowthMetricRows merges duplicate normalized growth metric keys before upsert', () => {
  const rows = combineGrowthMetricRows([
    {
      metric_date: '2026-05-09',
      metric_source: 'ga4',
      source: 'google',
      medium: 'organic',
      campaign: '(not set)',
      landing_page: '/salon',
      sessions: 3,
      users: 2,
      events: 30,
      metadata: {
        source_connector: 'ga4',
        batch: 'a'
      }
    },
    {
      metric_date: '2026-05-09',
      metric_source: 'ga4',
      source: 'google',
      medium: 'organic',
      campaign: '(not set)',
      landing_page: '/salon',
      sessions: 3,
      users: 3,
      events: 36,
      metadata: {
        source_connector: 'ga4',
        batch: 'b'
      }
    },
    {
      metric_date: '2026-05-09',
      metric_source: 'gsc',
      source: 'google',
      medium: 'organic',
      campaign: '(not set)',
      landing_page: '/salon',
      clicks: 18,
      impressions: 180,
      metadata: {
        source_connector: 'gsc'
      }
    }
  ]);

  assert.equal(rows.length, 2);

  const ga4Row = rows.find((row) => row.metric_source === 'ga4');
  assert.ok(ga4Row);
  assert.equal(ga4Row.sessions, 6);
  assert.equal(ga4Row.users, 5);
  assert.equal(ga4Row.events, 66);
  assert.equal(ga4Row.landing_page, '/salon');
  assert.equal(ga4Row.metadata.source_connector, 'ga4');
  assert.equal(ga4Row.metadata.batch, 'b');

  const gscRow = rows.find((row) => row.metric_source === 'gsc');
  assert.ok(gscRow);
  assert.equal(gscRow.clicks, 18);
  assert.equal(gscRow.impressions, 180);
});

test('getSearchConsoleSyncWindow defaults to a rolling Los Angeles date window', () => {
  const syncWindow = getSearchConsoleSyncWindow({
    now: new Date('2026-05-12T06:30:00.000Z')
  });

  assert.deepEqual(syncWindow, {
    startDate: '2026-05-07',
    endDate: '2026-05-11',
    mode: 'rolling_recent'
  });
  assert.equal(SEARCH_CONSOLE_RECENT_SYNC_WINDOW_DAYS, 5);
});

test('getSearchConsoleSyncWindow preserves explicit dates and normalizes reversed ranges', () => {
  const syncWindow = getSearchConsoleSyncWindow({
    startDate: '2026-05-12',
    endDate: '2026-05-10'
  });

  assert.deepEqual(syncWindow, {
    startDate: '2026-05-10',
    endDate: '2026-05-12',
    mode: 'custom'
  });
});

test('getSearchConsoleSyncWindow collapses a single explicit date into a one-day custom range', () => {
  const syncWindow = getSearchConsoleSyncWindow({
    startDate: '2026-05-12'
  });

  assert.deepEqual(syncWindow, {
    startDate: '2026-05-12',
    endDate: '2026-05-12',
    mode: 'custom'
  });
});
