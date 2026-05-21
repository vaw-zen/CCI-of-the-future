import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMetaAttributionFields,
  deriveMetaFbc,
  isMetaAdsSource,
  isMetaReferralSource,
  normalizeMetaPlatform
} from '../src/libs/metaAttribution.mjs';

test('deriveMetaFbc builds an fbc token from fbclid when the browser cookie is missing', () => {
  assert.equal(
    deriveMetaFbc({
      fbclid: 'test-click-id',
      capturedAt: 1715600000000
    }),
    'fb.1.1715600000000.test-click-id'
  );
});

test('buildMetaAttributionFields preserves first-party Meta ids and infers website lead source', () => {
  const fields = buildMetaAttributionFields({
    fbclid: 'click-1',
    meta_fbp: 'fb.1.browser-id',
    meta_campaign_id: 'cmp_1',
    meta_adset_id: 'adset_1',
    meta_ad_id: 'ad_1'
  }, {
    source: 'facebook',
    referrerHost: 'facebook.com',
    fallbackLeadSource: 'website'
  });

  assert.equal(fields.fbclid, 'click-1');
  assert.match(fields.meta_fbc, /^fb\.1\.\d+\.click-1$/);
  assert.equal(fields.meta_fbp, 'fb.1.browser-id');
  assert.equal(fields.meta_platform, 'facebook');
  assert.equal(fields.meta_lead_source, 'website');
  assert.equal(fields.meta_campaign_id, 'cmp_1');
});

test('Meta source classifiers keep referral and paid website traffic separate', () => {
  assert.equal(isMetaReferralSource({
    source: 'instagram',
    medium: 'social',
    metaPlatform: normalizeMetaPlatform('instagram')
  }), true);

  assert.equal(isMetaAdsSource({
    source: 'facebook',
    medium: 'cpc',
    metaPlatform: normalizeMetaPlatform('facebook'),
    sourceClass: 'paid_social',
    campaign: 'meta_ads_launch'
  }), true);
});
