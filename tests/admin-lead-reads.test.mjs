import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_LEAD_KINDS,
  applyAdminLeadListFilters,
  getAdminLeadConfig,
  getSafeAdminLeadCursor,
  getSafeAdminLeadLimit
} from '../src/libs/adminLeadReads.mjs';

function createQueryRecorder() {
  const calls = [];
  const query = {
    calls,
    eq(column, value) {
      calls.push(['eq', column, value]);
      return query;
    },
    ilike(column, value) {
      calls.push(['ilike', column, value]);
      return query;
    },
    gte(column, value) {
      calls.push(['gte', column, value]);
      return query;
    },
    lte(column, value) {
      calls.push(['lte', column, value]);
      return query;
    },
    is(column, value) {
      calls.push(['is', column, value]);
      return query;
    }
  };

  return query;
}

test('admin lead config exposes supported kinds and safe list bounds', () => {
  assert.deepEqual(ADMIN_LEAD_KINDS, ['devis', 'convention', 'whatsapp']);
  assert.equal(getAdminLeadConfig('devis')?.table, 'devis_requests');
  assert.equal(getAdminLeadConfig('convention')?.table, 'convention_requests');
  assert.equal(getAdminLeadConfig('whatsapp')?.listOrderColumn, 'lead_captured_at');
  assert.equal(getAdminLeadConfig('unknown'), null);

  assert.equal(getSafeAdminLeadLimit(undefined), 50);
  assert.equal(getSafeAdminLeadLimit(500), 100);
  assert.equal(getSafeAdminLeadLimit(0), 1);

  assert.equal(getSafeAdminLeadCursor(undefined), 0);
  assert.equal(getSafeAdminLeadCursor(-5), 0);
  assert.equal(getSafeAdminLeadCursor('17.2'), 17);
});

test('devis lead filters map to the authenticated summary query shape', () => {
  const query = createQueryRecorder();

  applyAdminLeadListFilters('devis', query, {
    leadStatus: 'qualified',
    leadQualityOutcome: 'sales_accepted',
    serviceType: 'salon',
    leadOwner: 'ops@cci',
    sessionSource: 'google',
    sessionMedium: 'organic',
    dateFrom: '2026-05-01',
    dateTo: '2026-05-07'
  });

  assert.deepEqual(query.calls, [
    ['eq', 'lead_status', 'qualified'],
    ['eq', 'lead_quality_outcome', 'sales_accepted'],
    ['eq', 'type_service', 'salon'],
    ['ilike', 'lead_owner', '%ops@cci%'],
    ['ilike', 'session_source', '%google%'],
    ['ilike', 'session_medium', '%organic%'],
    ['gte', 'created_at', '2026-05-01T00:00:00.000Z'],
    ['lte', 'created_at', '2026-05-07T23:59:59.999Z']
  ]);
});

test('convention lead filters include lifecycle and sector server filters', () => {
  const query = createQueryRecorder();

  applyAdminLeadListFilters('convention', query, {
    leadStatus: 'submitted',
    leadQualityOutcome: 'needs_review',
    operationalStatus: 'audit_planifie',
    sector: 'hotel',
    leadOwner: 'owner',
    sessionSource: 'meta',
    sessionMedium: 'paid_social',
    dateFrom: '2026-05-10',
    dateTo: '2026-05-12'
  });

  assert.deepEqual(query.calls, [
    ['eq', 'lead_status', 'submitted'],
    ['eq', 'lead_quality_outcome', 'needs_review'],
    ['eq', 'statut', 'audit_planifie'],
    ['eq', 'secteur_activite', 'hotel'],
    ['ilike', 'lead_owner', '%owner%'],
    ['ilike', 'session_source', '%meta%'],
    ['ilike', 'session_medium', '%paid_social%'],
    ['gte', 'created_at', '2026-05-10T00:00:00.000Z'],
    ['lte', 'created_at', '2026-05-12T23:59:59.999Z']
  ]);
});

test('whatsapp lead filters handle scheduled-type none and phone search server-side', () => {
  const query = createQueryRecorder();

  applyAdminLeadListFilters('whatsapp', query, {
    leadStatus: 'submitted',
    businessLine: 'b2b',
    scheduledType: 'none',
    leadQualityOutcome: 'sales_accepted',
    leadOwner: 'owner',
    phone: '22 333',
    dateFrom: '2026-05-08',
    dateTo: '2026-05-09'
  });

  assert.deepEqual(query.calls, [
    ['eq', 'lead_status', 'submitted'],
    ['eq', 'business_line', 'b2b'],
    ['is', 'scheduled_type', null],
    ['eq', 'lead_quality_outcome', 'sales_accepted'],
    ['ilike', 'lead_owner', '%owner%'],
    ['ilike', 'telephone', '%22 333%'],
    ['gte', 'lead_captured_at', '2026-05-08T00:00:00.000Z'],
    ['lte', 'lead_captured_at', '2026-05-09T23:59:59.999Z']
  ]);
});
