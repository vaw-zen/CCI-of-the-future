'use client';

import { useEffect, useMemo, useState } from 'react';
import { createWhatsAppDirectLead } from '@/services/adminLeadService';
import {
  filterWhatsAppServiceOptions,
  WHATSAPP_DIRECT_LEAD_BUSINESS_LINES,
  WHATSAPP_DIRECT_LEAD_SCHEDULE_TYPES
} from '@/libs/whatsappDirectLeads.mjs';
import {
  formatDateTimeLocalInputValue,
  LEAD_STATUSES,
  parseDateTimeLocalInputValue
} from '@/utils/leadLifecycle';
import styles from '@/app/admin/devis/admin.module.css';

const LEAD_STATUS_LABELS = {
  [LEAD_STATUSES.SUBMITTED]: 'Soumis',
  [LEAD_STATUSES.QUALIFIED]: 'Qualifié',
  [LEAD_STATUSES.CLOSED_WON]: 'Gagné',
  [LEAD_STATUSES.CLOSED_LOST]: 'Perdu'
};

function createDefaultFormState(initialValues = {}) {
  return {
    businessLine: 'b2c',
    contactName: '',
    companyName: '',
    telephone: '',
    email: '',
    serviceKey: '',
    leadCapturedAt: formatDateTimeLocalInputValue(new Date().toISOString()),
    scheduledType: '',
    scheduledAt: '',
    notes: '',
    leadOwner: '',
    followUpSlaAt: '',
    leadStatus: LEAD_STATUSES.SUBMITTED,
    ...(initialValues || {})
  };
}

export default function WhatsAppLeadCreateModal({
  isOpen,
  onClose,
  onCreated,
  onSubmitLead,
  initialValues = null,
  payloadOverrides = null,
  title = 'Ajouter lead WhatsApp',
  introNote = '',
  submitLabel = 'Créer le lead'
}) {
  const initialStateSignature = JSON.stringify(initialValues || {});
  const parsedInitialValues = useMemo(
    () => JSON.parse(initialStateSignature),
    [initialStateSignature]
  );
  const [form, setForm] = useState(() => createDefaultFormState(parsedInitialValues));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(createDefaultFormState(parsedInitialValues));
    setError('');
    setIsSaving(false);
  }, [isOpen, parsedInitialValues]);

  const serviceOptions = useMemo(
    () => filterWhatsAppServiceOptions(form.businessLine),
    [form.businessLine]
  );

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'businessLine' && value !== 'b2b' ? { companyName: '' } : {})
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const submitLead = typeof onSubmitLead === 'function'
        ? onSubmitLead
        : createWhatsAppDirectLead;

      const createdLead = await submitLead({
        businessLine: form.businessLine,
        contactName: form.contactName,
        companyName: form.businessLine === 'b2b' ? form.companyName : null,
        telephone: form.telephone,
        email: form.email || null,
        serviceKey: form.serviceKey || null,
        leadCapturedAt: parseDateTimeLocalInputValue(form.leadCapturedAt),
        scheduledType: form.scheduledType || null,
        scheduledAt: parseDateTimeLocalInputValue(form.scheduledAt),
        notes: form.notes || null,
        leadOwner: form.leadOwner || null,
        followUpSlaAt: parseDateTimeLocalInputValue(form.followUpSlaAt),
        leadStatus: form.leadStatus,
        ...(payloadOverrides || {})
      });

      if (typeof onCreated === 'function') {
        await onCreated(createdLead);
      }

      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (saveError) {
      console.error(saveError);
      setError(saveError.message || 'Impossible de créer le lead WhatsApp.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <form className={styles.modalForm} onSubmit={handleSubmit}>
            <div className={styles.section}>
              <h3>Lead direct WhatsApp</h3>
              {introNote && (
                <p className={styles.inlineHelp}>{introNote}</p>
              )}
              <p className={styles.inlineHelp}>
                Le numéro de téléphone restera visible dans la liste, le détail du lead et les drilldowns du dashboard.
              </p>

              <div className={styles.opsGrid}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-business-line">Business line</label>
                  <select
                    id="whatsapp-business-line"
                    className={styles.statusSelect}
                    value={form.businessLine}
                    onChange={(event) => updateField('businessLine', event.target.value)}
                    disabled={isSaving}
                  >
                    {WHATSAPP_DIRECT_LEAD_BUSINESS_LINES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-contact-name">Contact</label>
                  <input
                    id="whatsapp-contact-name"
                    className={styles.textInput}
                    type="text"
                    value={form.contactName}
                    onChange={(event) => updateField('contactName', event.target.value)}
                    placeholder="Nom du contact"
                    required
                    disabled={isSaving}
                  />
                </div>

                {form.businessLine === 'b2b' && (
                  <div className={styles.fieldGroup}>
                    <label htmlFor="whatsapp-company-name">Société</label>
                    <input
                      id="whatsapp-company-name"
                      className={styles.textInput}
                      type="text"
                      value={form.companyName}
                      onChange={(event) => updateField('companyName', event.target.value)}
                      placeholder="Nom de la société"
                      required
                      disabled={isSaving}
                    />
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-phone">Téléphone</label>
                  <input
                    id="whatsapp-phone"
                    className={styles.textInput}
                    type="tel"
                    value={form.telephone}
                    onChange={(event) => updateField('telephone', event.target.value)}
                    placeholder="+216 12 345 678"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-email">Email</label>
                  <input
                    id="whatsapp-email"
                    className={styles.textInput}
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="Optionnel"
                    disabled={isSaving}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-service">Service</label>
                  <select
                    id="whatsapp-service"
                    className={styles.statusSelect}
                    value={form.serviceKey}
                    onChange={(event) => updateField('serviceKey', event.target.value)}
                    disabled={isSaving}
                  >
                    <option value="">Service non renseigné</option>
                    {serviceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-captured-at">Lead capté le</label>
                  <input
                    id="whatsapp-captured-at"
                    className={styles.textInput}
                    type="datetime-local"
                    value={form.leadCapturedAt}
                    onChange={(event) => updateField('leadCapturedAt', event.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-status">Statut initial</label>
                  <select
                    id="whatsapp-status"
                    className={styles.statusSelect}
                    value={form.leadStatus}
                    onChange={(event) => updateField('leadStatus', event.target.value)}
                    disabled={isSaving}
                  >
                    {Object.values(LEAD_STATUSES).map((status) => (
                      <option key={status} value={status}>
                        {LEAD_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-scheduled-type">Type prévu</label>
                  <select
                    id="whatsapp-scheduled-type"
                    className={styles.statusSelect}
                    value={form.scheduledType}
                    onChange={(event) => updateField('scheduledType', event.target.value)}
                    disabled={isSaving}
                  >
                    <option value="">Aucun</option>
                    {WHATSAPP_DIRECT_LEAD_SCHEDULE_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-scheduled-at">Prévu le</label>
                  <input
                    id="whatsapp-scheduled-at"
                    className={styles.textInput}
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(event) => updateField('scheduledAt', event.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-lead-owner">Responsable</label>
                  <input
                    id="whatsapp-lead-owner"
                    className={styles.textInput}
                    type="text"
                    value={form.leadOwner}
                    onChange={(event) => updateField('leadOwner', event.target.value)}
                    placeholder="email ou nom de queue"
                    disabled={isSaving}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="whatsapp-follow-up-sla">SLA suivi</label>
                  <input
                    id="whatsapp-follow-up-sla"
                    className={styles.textInput}
                    type="datetime-local"
                    value={form.followUpSlaAt}
                    onChange={(event) => updateField('followUpSlaAt', event.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="whatsapp-notes">Notes</label>
                <textarea
                  id="whatsapp-notes"
                  className={styles.textareaInput}
                  value={form.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  placeholder="Contexte, promesse faite au client, détails utiles..."
                  rows={5}
                  disabled={isSaving}
                />
              </div>
            </div>

            {error && <p className={styles.statusError}>{error}</p>}

            <div className={styles.lifecycleControls}>
              <button type="submit" className={styles.saveButton} disabled={isSaving}>
                {isSaving ? 'Création...' : submitLabel}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={isSaving}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
