function normalizeOptionalString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function getLegacySafeDevisFieldDefaults(formData = {}) {
  return {
    type_logement: normalizeOptionalString(formData.typeLogement) || 'appartement',
    heure_preferee: normalizeOptionalString(formData.heurePreferee) || 'matin'
  };
}
