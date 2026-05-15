export const STAGE3_TEST_MARKER = '[STAGE3 TEST]';

function normalizeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

export function hasStage3TestMarker(value = '') {
  return normalizeText(value, '').toUpperCase().includes(STAGE3_TEST_MARKER);
}

export function isStage3TestSubmission(...values) {
  return values.some((value) => hasStage3TestMarker(value));
}
