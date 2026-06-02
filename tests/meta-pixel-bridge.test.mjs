import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMetaPixelBootstrapScript,
  buildMetaPixelNoscriptUrl,
  buildMetaPixelTrackCall
} from '../src/libs/metaPixelBridge.mjs';

test('buildMetaPixelBootstrapScript renders the provided pixel id', () => {
  const script = buildMetaPixelBootstrapScript('557252312692839');

  assert.match(script, /fbq\('init', '557252312692839'\)/);
  assert.match(script, /fbq\('track', 'PageView'\)/);
});

test('buildMetaPixelNoscriptUrl returns the PageView tracking url', () => {
  assert.equal(
    buildMetaPixelNoscriptUrl('557252312692839'),
    'https://www.facebook.com/tr?id=557252312692839&ev=PageView&noscript=1'
  );
});

test('buildMetaPixelTrackCall maps page_view to PageView', () => {
  const trackCall = buildMetaPixelTrackCall('page_view', {
    page_path: '/services'
  });

  assert.deepEqual(trackCall, {
    method: 'track',
    eventName: 'PageView',
    params: null,
    options: null
  });
});

test('buildMetaPixelTrackCall maps service page views to ViewContent', () => {
  const trackCall = buildMetaPixelTrackCall('service_interaction', {
    action_name: 'view_service_page',
    service_type: 'salon',
    page_title: 'Nettoyage Salon'
  });

  assert.equal(trackCall.eventName, 'ViewContent');
  assert.equal(trackCall.params.content_name, 'Nettoyage Salon');
  assert.equal(trackCall.params.content_type, 'service_page');
  assert.deepEqual(trackCall.params.content_ids, ['salon']);
});

test('buildMetaPixelTrackCall maps begin_checkout to InitiateCheckout', () => {
  const trackCall = buildMetaPixelTrackCall('begin_checkout', {
    service_type: 'tapis',
    value: 120
  });

  assert.equal(trackCall.eventName, 'InitiateCheckout');
  assert.equal(trackCall.params.value, 120);
  assert.equal(trackCall.params.currency, 'TND');
  assert.deepEqual(trackCall.params.content_ids, ['tapis']);
});

test('buildMetaPixelTrackCall maps generate_lead to Lead and forwards the Meta event id for dedupe', () => {
  const trackCall = buildMetaPixelTrackCall('generate_lead', {
    lead_type: 'quote_request',
    business_line: 'b2c',
    value: 1,
    meta_event_id: 'meta_lead_123'
  });

  assert.equal(trackCall.eventName, 'Lead');
  assert.equal(trackCall.params.content_name, 'quote_request');
  assert.equal(trackCall.params.content_category, 'b2c');
  assert.deepEqual(trackCall.options, {
    eventID: 'meta_lead_123'
  });
});
