const OPTIONAL_LEAD_TRACKING_FIELDS = [
  'whatsapp_click_id',
  'whatsapp_clicked_at',
  'whatsapp_click_label',
  'whatsapp_click_page',
  'whatsapp_manual_tag',
  'whatsapp_manual_tagged_at'
];
const OPTIONAL_LEAD_OPERATION_FIELDS = [
  'lead_quality_outcome',
  'lead_owner',
  'follow_up_sla_at',
  'last_worked_at'
];
const OPTIONAL_LEAD_COMPAT_FIELDS = [
  ...OPTIONAL_LEAD_TRACKING_FIELDS,
  ...OPTIONAL_LEAD_OPERATION_FIELDS
];

const OPTIONAL_LEAD_TRACKING_FIELD_SET = new Set(OPTIONAL_LEAD_COMPAT_FIELDS);
const OPTIONAL_LEAD_TRACKING_ERROR_PATTERN = new RegExp(`\\b(?:${OPTIONAL_LEAD_COMPAT_FIELDS.join('|')})\\b`, 'i');
const OPTIONAL_LEAD_TRACKING_ONLY_ERROR_PATTERN = new RegExp(`\\b(?:${OPTIONAL_LEAD_TRACKING_FIELDS.join('|')})\\b`, 'i');
const OPTIONAL_LEAD_OPERATIONS_ONLY_ERROR_PATTERN = new RegExp(`\\b(?:${OPTIONAL_LEAD_OPERATION_FIELDS.join('|')})\\b`, 'i');
const LEGACY_LEAD_SELECT_WARNINGS = new Set();

const WHATSAPP_TRACKING_MIGRATION_HINT =
  'Apply supabase/20260507_whatsapp_funnel_attribution.sql to enable WhatsApp attribution fields.';
const LEAD_OPERATIONS_MIGRATION_HINT =
  'Apply supabase/20260509_stage1_lead_quality_dimensions.sql to enable lead operations fields.';

export function withoutOptionalLeadTrackingFields(selectClause = '') {
  return selectClause
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .filter((field) => !OPTIONAL_LEAD_TRACKING_FIELD_SET.has(field))
    .join(',');
}

export function isMissingOptionalLeadTrackingColumnError(error) {
  return error?.code === '42703' && OPTIONAL_LEAD_TRACKING_ERROR_PATTERN.test(String(error?.message || ''));
}

export function withoutOptionalLeadOperationFields(value = {}) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !OPTIONAL_LEAD_OPERATION_FIELDS.includes(key))
  );
}

export function isMissingOptionalLeadOperationFieldError(error) {
  const errorText = [
    error?.message,
    error?.details,
    error?.hint
  ].filter(Boolean).join(' ');

  return OPTIONAL_LEAD_OPERATIONS_ONLY_ERROR_PATTERN.test(errorText);
}

function getOptionalLeadCompatWarning(error) {
  const message = String(error?.message || '');
  const missingTrackingFields = OPTIONAL_LEAD_TRACKING_ONLY_ERROR_PATTERN.test(message);
  const missingOperationFields = OPTIONAL_LEAD_OPERATIONS_ONLY_ERROR_PATTERN.test(message);

  if (missingTrackingFields && missingOperationFields) {
    return {
      summary: 'optional WhatsApp attribution and lead operations columns are missing.',
      hint: `${WHATSAPP_TRACKING_MIGRATION_HINT} ${LEAD_OPERATIONS_MIGRATION_HINT}`
    };
  }

  if (missingOperationFields) {
    return {
      summary: 'optional lead operations columns are missing.',
      hint: LEAD_OPERATIONS_MIGRATION_HINT
    };
  }

  return {
    summary: 'optional WhatsApp tracking columns are missing.',
    hint: WHATSAPP_TRACKING_MIGRATION_HINT
  };
}

export function warnMissingOptionalLeadTrackingColumnsOnce({
  channel = 'dashboard',
  table,
  error = null,
  warn = console.warn
} = {}) {
  const warningKey = `${channel}:${table || 'unknown'}`;

  if (LEGACY_LEAD_SELECT_WARNINGS.has(warningKey)) {
    return false;
  }

  LEGACY_LEAD_SELECT_WARNINGS.add(warningKey);
  const warning = getOptionalLeadCompatWarning(error);
  warn(
    `[admin][${channel}] using legacy lead select for ${table}: ${warning.summary} ${warning.hint}`
  );
  return true;
}

export async function runLeadSelectWithOptionalTrackingFallback({
  supabase,
  table,
  select,
  applyQuery,
  channel = 'dashboard',
  warn = console.warn
}) {
  const primaryResult = await applyQuery(
    supabase
      .from(table)
      .select(select)
  );

  if (!isMissingOptionalLeadTrackingColumnError(primaryResult.error)) {
    return primaryResult;
  }

  warnMissingOptionalLeadTrackingColumnsOnce({
    channel,
    table,
    error: primaryResult.error,
    warn
  });

  return applyQuery(
    supabase
      .from(table)
      .select(withoutOptionalLeadTrackingFields(select))
  );
}

export function resetLeadTrackingSchemaCompatWarningsForTests() {
  LEGACY_LEAD_SELECT_WARNINGS.clear();
}

export {
  OPTIONAL_LEAD_TRACKING_FIELDS,
  OPTIONAL_LEAD_OPERATION_FIELDS,
  LEAD_OPERATIONS_MIGRATION_HINT,
  WHATSAPP_TRACKING_MIGRATION_HINT
};
