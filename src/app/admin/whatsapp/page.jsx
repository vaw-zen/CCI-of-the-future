'use client';

import HeroHeader from '@/utils/components/reusableHeader/HeroHeader';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  convertWhatsAppIntentToLead,
  getWhatsAppDirectLeads,
  getWhatsAppIntents,
  updateLeadOperations,
  updateLeadStatus
} from '@/services/adminLeadService';
import {
  deriveLeadQualityOutcomeFromStatus,
  formatDateTimeLocalInputValue,
  isLeadFollowUpOverdue,
  LEAD_QUALITY_OUTCOME_LABELS,
  LEAD_QUALITY_OUTCOME_OPTIONS,
  LEAD_QUALITY_OUTCOMES,
  LEAD_STATUSES,
  parseDateTimeLocalInputValue
} from '@/utils/leadLifecycle';
import AdminNavTabs from '@/app/admin/_components/AdminNavTabs';
import WhatsAppLeadCreateModal from '@/app/admin/_components/WhatsAppLeadCreateModal';
import {
  getWhatsAppDirectLeadAttributionLabel,
  matchesWhatsAppDirectPhone,
  WHATSAPP_DIRECT_LEAD_BUSINESS_LINES,
  WHATSAPP_DIRECT_LEAD_SCHEDULE_TYPES,
  filterWhatsAppServiceOptions
} from '@/libs/whatsappDirectLeads.mjs';
import styles from '../devis/admin.module.css';

const LEAD_STATUS_LABELS = {
  [LEAD_STATUSES.SUBMITTED]: 'Soumis',
  [LEAD_STATUSES.QUALIFIED]: 'Qualifié',
  [LEAD_STATUSES.CLOSED_WON]: 'Gagné',
  [LEAD_STATUSES.CLOSED_LOST]: 'Perdu'
};

const BUSINESS_LINE_LABELS = Object.fromEntries(
  WHATSAPP_DIRECT_LEAD_BUSINESS_LINES.map((option) => [option.value, option.label])
);

const SCHEDULE_TYPE_LABELS = Object.fromEntries(
  WHATSAPP_DIRECT_LEAD_SCHEDULE_TYPES.map((option) => [option.value, option.label])
);

export default function AdminWhatsAppPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, error: authError, signOut } = useAdminAuth();
  const [requests, setRequests] = useState([]);
  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [intentError, setIntentError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [leadStatusDraft, setLeadStatusDraft] = useState(LEAD_STATUSES.SUBMITTED);
  const [leadQualityDraft, setLeadQualityDraft] = useState(LEAD_QUALITY_OUTCOMES.UNREVIEWED);
  const [leadOwnerDraft, setLeadOwnerDraft] = useState('');
  const [followUpSlaDraft, setFollowUpSlaDraft] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingOperations, setIsSavingOperations] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [operationsError, setOperationsError] = useState('');
  const [leadIdParam, setLeadIdParam] = useState('');
  const [phoneCopyState, setPhoneCopyState] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIntentForConversion, setSelectedIntentForConversion] = useState(null);
  const [filters, setFilters] = useState({
    leadStatus: 'all',
    businessLine: 'all',
    scheduledType: 'all',
    leadQualityOutcome: 'all',
    leadOwner: '',
    phone: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadRequests();
    }
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    document.body.style.overflow = selectedRequest || isCreateModalOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedRequest, isCreateModalOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateLeadIdFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      setLeadIdParam(params.get('lead') || '');
    };

    updateLeadIdFromLocation();
    window.addEventListener('popstate', updateLeadIdFromLocation);

    return () => {
      window.removeEventListener('popstate', updateLeadIdFromLocation);
    };
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      setIntentError('');

      const [leadsResult, intentsResult] = await Promise.allSettled([
        getWhatsAppDirectLeads({ limit: 500 }),
        getWhatsAppIntents({ limit: 250 })
      ]);

      if (leadsResult.status !== 'fulfilled') {
        throw leadsResult.reason;
      }

      setRequests(leadsResult.value);

      if (intentsResult.status === 'fulfilled') {
        setIntents(intentsResult.value);
      } else {
        console.error(intentsResult.reason);
        setIntents([]);
        setIntentError(intentsResult.reason?.message || 'Impossible de charger les intentions site WhatsApp.');
      }
    } catch (loadError) {
      console.error(loadError);
      setError(loadError.message || 'Erreur lors du chargement des leads WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/admin/login');
    }
  };

  const syncLeadQuery = useCallback((leadId) => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextParams = new URLSearchParams(window.location.search);
    if (leadId) {
      nextParams.set('lead', leadId);
    } else {
      nextParams.delete('lead');
    }

    const nextQuery = nextParams.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
    window.history.replaceState(window.history.state, '', nextUrl);
    setLeadIdParam(leadId || '');
  }, []);

  const openRequest = useCallback((request, { syncQuery = true } = {}) => {
    setSelectedRequest(request);
    setLeadStatusDraft(request.lead_status || LEAD_STATUSES.SUBMITTED);
    setLeadQualityDraft(
      request.lead_quality_outcome
      || deriveLeadQualityOutcomeFromStatus(request.lead_status || LEAD_STATUSES.SUBMITTED)
    );
    setLeadOwnerDraft(request.lead_owner || '');
    setFollowUpSlaDraft(formatDateTimeLocalInputValue(request.follow_up_sla_at));
    setStatusError('');
    setOperationsError('');
    setPhoneCopyState('');

    if (syncQuery && leadIdParam !== request.id) {
      syncLeadQuery(request.id);
    }
  }, [leadIdParam, syncLeadQuery]);

  const closeRequest = useCallback(() => {
    setSelectedRequest(null);
    setStatusError('');
    setOperationsError('');
    setPhoneCopyState('');

    if (leadIdParam) {
      syncLeadQuery(null);
    }
  }, [leadIdParam, syncLeadQuery]);

  useEffect(() => {
    if (!leadIdParam || requests.length === 0) {
      return;
    }

    const matchedRequest = requests.find((request) => request.id === leadIdParam);
    if (matchedRequest && selectedRequest?.id !== matchedRequest.id) {
      openRequest(matchedRequest, { syncQuery: false });
    }
  }, [leadIdParam, openRequest, requests, selectedRequest?.id]);

  const upsertRequest = useCallback((updatedLead) => {
    setRequests((currentRequests) => {
      const nextRequests = [
        updatedLead,
        ...currentRequests.filter((request) => request.id !== updatedLead.id)
      ];

      return nextRequests.sort(
        (left, right) => new Date(right.lead_captured_at || right.created_at || 0)
          - new Date(left.lead_captured_at || left.created_at || 0)
      );
    });
    setSelectedRequest(updatedLead);
  }, []);

  const handleStatusSave = async () => {
    if (!selectedRequest || !leadStatusDraft) {
      return;
    }

    try {
      setIsSavingStatus(true);
      setStatusError('');

      const updatedLead = await updateLeadStatus('whatsapp', selectedRequest.id, {
        leadStatus: leadStatusDraft
      });

      upsertRequest(updatedLead);
      setLeadQualityDraft(
        updatedLead.lead_quality_outcome
        || deriveLeadQualityOutcomeFromStatus(updatedLead.lead_status || LEAD_STATUSES.SUBMITTED)
      );
      setLeadOwnerDraft(updatedLead.lead_owner || '');
      setFollowUpSlaDraft(formatDateTimeLocalInputValue(updatedLead.follow_up_sla_at));
    } catch (saveError) {
      console.error(saveError);
      setStatusError(saveError.message || 'Impossible de mettre à jour le statut.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleOperationsSave = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setIsSavingOperations(true);
      setOperationsError('');

      const updatedLead = await updateLeadOperations('whatsapp', selectedRequest.id, {
        leadQualityOutcome: leadQualityDraft,
        leadOwner: leadOwnerDraft.trim() || null,
        followUpSlaAt: parseDateTimeLocalInputValue(followUpSlaDraft)
      });

      upsertRequest(updatedLead);
      setLeadQualityDraft(
        updatedLead.lead_quality_outcome
        || deriveLeadQualityOutcomeFromStatus(updatedLead.lead_status || LEAD_STATUSES.SUBMITTED)
      );
      setLeadOwnerDraft(updatedLead.lead_owner || '');
      setFollowUpSlaDraft(formatDateTimeLocalInputValue(updatedLead.follow_up_sla_at));
    } catch (saveError) {
      console.error(saveError);
      setOperationsError(saveError.message || 'Impossible de mettre à jour le suivi du lead.');
    } finally {
      setIsSavingOperations(false);
    }
  };

  const handleMarkWorkedNow = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setIsSavingOperations(true);
      setOperationsError('');
      const updatedLead = await updateLeadOperations('whatsapp', selectedRequest.id, {
        lastWorkedAt: new Date().toISOString()
      });

      upsertRequest(updatedLead);
      setLeadQualityDraft(
        updatedLead.lead_quality_outcome
        || deriveLeadQualityOutcomeFromStatus(updatedLead.lead_status || LEAD_STATUSES.SUBMITTED)
      );
      setLeadOwnerDraft(updatedLead.lead_owner || '');
      setFollowUpSlaDraft(formatDateTimeLocalInputValue(updatedLead.follow_up_sla_at));
    } catch (saveError) {
      console.error(saveError);
      setOperationsError(saveError.message || 'Impossible de marquer le lead comme travaillé.');
    } finally {
      setIsSavingOperations(false);
    }
  };

  const openManualCreateModal = () => {
    setSelectedIntentForConversion(null);
    setIsCreateModalOpen(true);
  };

  const openIntentConversionModal = (intent) => {
    setSelectedIntentForConversion(intent);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedIntentForConversion(null);
  };

  const handleCreateSuccess = async (createdLead) => {
    if (selectedIntentForConversion?.id) {
      setIntents((currentIntents) => currentIntents.filter((intent) => intent.id !== selectedIntentForConversion.id));
    }

    upsertRequest(createdLead);
    closeCreateModal();
    openRequest(createdLead);
  };

  const handleCopyPhone = async () => {
    if (!selectedRequest?.telephone) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedRequest.telephone);
      setPhoneCopyState('Numéro copié');
    } catch (copyError) {
      console.error(copyError);
      setPhoneCopyState('Copie impossible');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Non renseigné';
    }

    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBusinessLineLabel = useCallback((value) => BUSINESS_LINE_LABELS[value] || value || 'Inconnu', []);
  const getScheduleLabel = useCallback((value) => SCHEDULE_TYPE_LABELS[value] || 'Non planifié', []);
  const getServiceLabel = useCallback((serviceKey, businessLine) => (
    filterWhatsAppServiceOptions(businessLine)
      .find((option) => option.value === serviceKey)?.label
    || 'Service non renseigné'
  ), []);
  const getLeadStatus = useCallback((request) => request.lead_status || LEAD_STATUSES.SUBMITTED, []);
  const getLeadQualityOutcome = useCallback((request) => (
    request.lead_quality_outcome
    || deriveLeadQualityOutcomeFromStatus(getLeadStatus(request))
  ), [getLeadStatus]);
  const getLeadQualityLabel = useCallback((request) => (
    LEAD_QUALITY_OUTCOME_LABELS[getLeadQualityOutcome(request)] || getLeadQualityOutcome(request)
  ), [getLeadQualityOutcome]);
  const getAttributionLabel = useCallback(
    (request) => getWhatsAppDirectLeadAttributionLabel(request),
    []
  );
  const isFollowUpOverdue = useCallback((request) => isLeadFollowUpOverdue({
    leadStatus: getLeadStatus(request),
    followUpSlaAt: request.follow_up_sla_at,
    lastWorkedAt: request.last_worked_at
  }), [getLeadStatus]);

  const createModalInitialValues = useMemo(() => {
    if (!selectedIntentForConversion) {
      return null;
    }

    return {
      leadCapturedAt: formatDateTimeLocalInputValue(
        selectedIntentForConversion.clickedAt || selectedIntentForConversion.createdAt || new Date().toISOString()
      )
    };
  }, [selectedIntentForConversion]);

  const createModalPayloadOverrides = useMemo(() => {
    if (!selectedIntentForConversion) {
      return null;
    }

    return {
      clickId: selectedIntentForConversion.id,
      sessionSource: selectedIntentForConversion.sessionSource,
      sessionMedium: selectedIntentForConversion.sessionMedium,
      sessionCampaign: selectedIntentForConversion.sessionCampaign,
      referrerHost: selectedIntentForConversion.referrerHost,
      landingPage: selectedIntentForConversion.landingPage,
      entryPath: selectedIntentForConversion.pagePath
    };
  }, [selectedIntentForConversion]);

  const createModalTitle = selectedIntentForConversion
    ? 'Convertir intention WhatsApp en lead'
    : 'Ajouter lead WhatsApp';
  const createModalIntro = selectedIntentForConversion
    ? `Clic enregistré le ${formatDate(selectedIntentForConversion.clickedAt || selectedIntentForConversion.createdAt)} depuis ${selectedIntentForConversion.pagePath || '/'} (${selectedIntentForConversion.eventLabel || 'unknown'}). Ajoutez le téléphone et le contact avant de créer le lead.`
    : '';
  const createModalSubmitLabel = selectedIntentForConversion
    ? 'Créer le lead depuis le clic'
    : 'Créer le lead';
  const submitWhatsAppLead = selectedIntentForConversion
    ? convertWhatsAppIntentToLead
    : undefined;

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      leadStatus: 'all',
      businessLine: 'all',
      scheduledType: 'all',
      leadQualityOutcome: 'all',
      leadOwner: '',
      phone: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const filteredRequests = useMemo(() => requests.filter((request) => {
    const requestDate = request.lead_captured_at ? new Date(request.lead_captured_at) : null;
    const dateFrom = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
    const dateTo = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;

    if (filters.leadStatus !== 'all' && getLeadStatus(request) !== filters.leadStatus) {
      return false;
    }

    if (filters.businessLine !== 'all' && request.business_line !== filters.businessLine) {
      return false;
    }

    if (filters.scheduledType !== 'all' && (request.scheduled_type || 'none') !== filters.scheduledType) {
      return false;
    }

    if (filters.leadQualityOutcome !== 'all' && getLeadQualityOutcome(request) !== filters.leadQualityOutcome) {
      return false;
    }

    if (filters.leadOwner && !String(request.lead_owner || '').toLowerCase().includes(filters.leadOwner.toLowerCase())) {
      return false;
    }

    if (!matchesWhatsAppDirectPhone(request.telephone, filters.phone)) {
      return false;
    }

    if (dateFrom && (!requestDate || requestDate < dateFrom)) {
      return false;
    }

    if (dateTo && (!requestDate || requestDate > dateTo)) {
      return false;
    }

    return true;
  }), [requests, filters, getLeadQualityOutcome, getLeadStatus]);

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Vérification des privilèges administrateur...</div>
        {authError && <div className={styles.error}>Erreur: {authError}</div>}
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Redirection vers la connexion administrateur...</div>
        {authError && <div className={styles.error}>Erreur: {authError}</div>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des leads WhatsApp...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={loadRequests} className={styles.refreshButton}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <HeroHeader title="Administration - Leads WhatsApp" />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Administration - Leads WhatsApp</h1>
          <div className={styles.headerActions}>
            <button type="button" onClick={openManualCreateModal} className={styles.saveButton}>
              Ajouter lead WhatsApp
            </button>
            <button onClick={loadRequests} className={styles.refreshButton}>
              Actualiser
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Déconnexion
            </button>
          </div>
        </div>

        <AdminNavTabs active="whatsapp" />

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>{requests.length}</h3>
            <p>Leads WhatsApp</p>
          </div>
          <div className={styles.statCard}>
            <h3>{intents.length}</h3>
            <p>Intentions site à traiter</p>
          </div>
          <div className={styles.statCard}>
            <h3>{requests.filter((request) => getLeadStatus(request) === LEAD_STATUSES.SUBMITTED).length}</h3>
            <p>Soumis</p>
          </div>
          <div className={styles.statCard}>
            <h3>{requests.filter((request) => getLeadStatus(request) === LEAD_STATUSES.QUALIFIED).length}</h3>
            <p>Qualifiés</p>
          </div>
          <div className={styles.statCard}>
            <h3>{requests.filter((request) => getLeadStatus(request) === LEAD_STATUSES.CLOSED_WON).length}</h3>
            <p>Gagnés</p>
          </div>
          <div className={styles.statCard}>
            <h3>{requests.filter((request) => getLeadQualityOutcome(request) === LEAD_QUALITY_OUTCOMES.UNREVIEWED).length}</h3>
            <p>Qualité non revue</p>
          </div>
          <div className={styles.statCard}>
            <h3>{requests.filter((request) => isFollowUpOverdue(request)).length}</h3>
            <p>SLA dépassée</p>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          <div className={`${styles.panel} ${styles.panelWide}`}>
            <h2>Intentions site WhatsApp</h2>
            <p className={styles.inlineHelp}>
              Ces clics viennent du site mais ne comptent pas encore comme des leads. Convertissez-les seulement quand une vraie conversation WhatsApp existe et que vous connaissez le téléphone du contact.
            </p>
            {intentError ? (
              <p className={styles.statusError}>{intentError}</p>
            ) : intents.length === 0 ? (
              <p className={styles.mutedText}>Aucune intention site WhatsApp en attente pour le moment.</p>
            ) : (
              <div className={styles.metricList}>
                {intents.map((intent) => (
                  <div key={intent.id} className={styles.metricRow}>
                    <div>
                      <strong>{intent.eventLabel || 'Clic WhatsApp site'}</strong>
                      <span>{intent.pagePath || '/'} • {formatDate(intent.clickedAt || intent.createdAt)}</span>
                      <span>{intent.sessionSource || 'direct'} / {intent.sessionMedium || '(none)'} • {intent.sessionCampaign || '(not set)'}</span>
                      <span>{intent.landingPage || '/'} • {intent.referrerHost || 'Referrer non renseigné'}</span>
                    </div>
                    <div className={styles.metricBadges}>
                      <span className={styles.metricBadge}>
                        <strong>Type</strong> Clic site
                      </span>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => openIntentConversionModal(intent)}
                      >
                        Convertir en lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.filtersPanel}>
          <div className={styles.filterField}>
            <label htmlFor="whatsapp-lead-status">Statut</label>
            <select
              id="whatsapp-lead-status"
              value={filters.leadStatus}
              onChange={(event) => updateFilter('leadStatus', event.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {Object.values(LEAD_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="whatsapp-business-line-filter">Business line</label>
            <select
              id="whatsapp-business-line-filter"
              value={filters.businessLine}
              onChange={(event) => updateFilter('businessLine', event.target.value)}
            >
              <option value="all">Tous</option>
              {WHATSAPP_DIRECT_LEAD_BUSINESS_LINES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="whatsapp-scheduled-type-filter">Type prévu</label>
            <select
              id="whatsapp-scheduled-type-filter"
              value={filters.scheduledType}
              onChange={(event) => updateFilter('scheduledType', event.target.value)}
            >
              <option value="all">Tous</option>
              <option value="none">Non planifié</option>
              {WHATSAPP_DIRECT_LEAD_SCHEDULE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="whatsapp-lead-quality">Qualité</label>
            <select
              id="whatsapp-lead-quality"
              value={filters.leadQualityOutcome}
              onChange={(event) => updateFilter('leadQualityOutcome', event.target.value)}
            >
              <option value="all">Tous les niveaux</option>
              {LEAD_QUALITY_OUTCOME_OPTIONS.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {LEAD_QUALITY_OUTCOME_LABELS[outcome]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="whatsapp-phone-filter">Téléphone</label>
            <input
              id="whatsapp-phone-filter"
              type="search"
              value={filters.phone}
              onChange={(event) => updateFilter('phone', event.target.value)}
              placeholder="Chercher par numéro"
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="whatsapp-lead-owner">Responsable</label>
            <input
              id="whatsapp-lead-owner"
              type="search"
              value={filters.leadOwner}
              onChange={(event) => updateFilter('leadOwner', event.target.value)}
              placeholder="email ou nom de queue"
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="whatsapp-date-from">Depuis</label>
            <input
              id="whatsapp-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="whatsapp-date-to">Jusqu&apos;au</label>
            <input
              id="whatsapp-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter('dateTo', event.target.value)}
            />
          </div>

          <button type="button" className={styles.clearFiltersButton} onClick={resetFilters}>
            Réinitialiser
          </button>
        </div>

        <div className={styles.resultsMeta}>
          {filteredRequests.length} lead{filteredRequests.length > 1 ? 's' : ''} WhatsApp affiché{filteredRequests.length > 1 ? 's' : ''}
        </div>

        <div className={styles.requestsList}>
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={styles.requestCard}
              onClick={() => openRequest(request)}
            >
              <div className={styles.requestHeader}>
                <div className={styles.requestInfo}>
                  <h3>{request.company_name ? `${request.company_name} • ${request.contact_name}` : request.contact_name}</h3>
                  <p className={styles.service}>
                    {getServiceLabel(request.service_key, request.business_line)} • {getBusinessLineLabel(request.business_line)}
                  </p>
                </div>
                <div className={styles.requestMeta}>
                  <span className={styles.date}>{formatDate(request.lead_captured_at || request.created_at)}</span>
                  <span className={`${styles.statusBadge} ${styles[`status_${getLeadStatus(request)}`]}`}>
                    {LEAD_STATUS_LABELS[getLeadStatus(request)]}
                  </span>
                </div>
              </div>

              <div className={styles.requestDetails}>
                <div className={styles.detail}>
                  <strong>📞</strong> {request.telephone}
                </div>
                <div className={styles.detail}>
                  <strong>📧</strong> {request.email || 'Email non renseigné'}
                </div>
                <div className={styles.detail}>
                  <strong>💬</strong> {getAttributionLabel(request)}
                </div>
                <div className={styles.detail}>
                  <strong>📅</strong> {request.scheduled_at ? `${getScheduleLabel(request.scheduled_type)} • ${formatDate(request.scheduled_at)}` : 'Aucun rendez-vous'}
                </div>
                <div className={styles.detail}>
                  <strong>🧭</strong> {getLeadQualityLabel(request)}
                </div>
                <div className={styles.detail}>
                  <strong>👤</strong> {request.lead_owner || 'Non assigné'}
                </div>
                <div className={styles.detail}>
                  <strong>⏱</strong> {isFollowUpOverdue(request) ? 'SLA dépassée' : 'SLA dans les temps'}
                </div>
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <div className={styles.emptyState}>Aucun lead WhatsApp ne correspond aux filtres.</div>
          )}
        </div>

        {selectedRequest && (
          <div className={styles.modal} onClick={closeRequest}>
            <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.headerTitleBlock}>
                  <h2>{selectedRequest.company_name ? `${selectedRequest.company_name} • ${selectedRequest.contact_name}` : selectedRequest.contact_name}</h2>
                  <div className={styles.headerMetaLine}>
                    <a href={`tel:${selectedRequest.telephone}`} className={styles.phoneLink}>
                      {selectedRequest.telephone}
                    </a>
                    <button type="button" className={styles.secondaryButton} onClick={handleCopyPhone}>
                      Copier le numéro
                    </button>
                    {phoneCopyState && <span className={styles.copyStatus}>{phoneCopyState}</span>}
                  </div>
                </div>
                <button className={styles.closeButton} onClick={closeRequest}>
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.section}>
                  <h3>Statut du lead</h3>
                  <div className={styles.lifecycleControls}>
                    <select
                      className={styles.statusSelect}
                      value={leadStatusDraft}
                      onChange={(event) => setLeadStatusDraft(event.target.value)}
                      disabled={isSavingStatus}
                    >
                      {Object.values(LEAD_STATUSES).map((status) => (
                        <option key={status} value={status}>
                          {LEAD_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleStatusSave}
                      disabled={isSavingStatus || leadStatusDraft === getLeadStatus(selectedRequest)}
                    >
                      {isSavingStatus ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                  {statusError && <p className={styles.statusError}>{statusError}</p>}
                  <p><strong>Lead capté le :</strong> {formatDate(selectedRequest.lead_captured_at || selectedRequest.created_at)}</p>
                  <p><strong>Soumis le :</strong> {formatDate(selectedRequest.submitted_at)}</p>
                  <p><strong>Qualifié le :</strong> {formatDate(selectedRequest.qualified_at)}</p>
                  <p><strong>Clôturé le :</strong> {formatDate(selectedRequest.closed_at)}</p>
                </div>

                <div className={styles.section}>
                  <h3>Suivi commercial</h3>
                  <div className={styles.opsGrid}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="whatsapp-quality-draft">Qualité</label>
                      <select
                        id="whatsapp-quality-draft"
                        className={styles.statusSelect}
                        value={leadQualityDraft}
                        onChange={(event) => setLeadQualityDraft(event.target.value)}
                        disabled={isSavingOperations}
                      >
                        {LEAD_QUALITY_OUTCOME_OPTIONS.map((outcome) => (
                          <option key={outcome} value={outcome}>
                            {LEAD_QUALITY_OUTCOME_LABELS[outcome]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="whatsapp-owner-draft">Responsable</label>
                      <input
                        id="whatsapp-owner-draft"
                        className={styles.textInput}
                        type="text"
                        value={leadOwnerDraft}
                        onChange={(event) => setLeadOwnerDraft(event.target.value)}
                        placeholder="email ou nom de queue"
                        disabled={isSavingOperations}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="whatsapp-follow-up-sla">SLA suivi</label>
                      <input
                        id="whatsapp-follow-up-sla"
                        className={styles.textInput}
                        type="datetime-local"
                        value={followUpSlaDraft}
                        onChange={(event) => setFollowUpSlaDraft(event.target.value)}
                        disabled={isSavingOperations}
                      />
                    </div>
                  </div>

                  <div className={styles.lifecycleControls}>
                    <button type="button" className={styles.saveButton} onClick={handleOperationsSave} disabled={isSavingOperations}>
                      {isSavingOperations ? 'Enregistrement...' : 'Enregistrer le suivi'}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => setLeadOwnerDraft(user?.email || '')}
                      disabled={isSavingOperations}
                    >
                      Me l&apos;assigner
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={handleMarkWorkedNow}
                      disabled={isSavingOperations}
                    >
                      Marquer travaillé maintenant
                    </button>
                  </div>
                  {operationsError && <p className={styles.statusError}>{operationsError}</p>}
                  <p><strong>Qualité actuelle :</strong> {getLeadQualityLabel(selectedRequest)}</p>
                  <p><strong>Responsable :</strong> {selectedRequest.lead_owner || 'Non assigné'}</p>
                  <p><strong>SLA de suivi :</strong> {formatDate(selectedRequest.follow_up_sla_at)}</p>
                  <p><strong>Dernier suivi :</strong> {formatDate(selectedRequest.last_worked_at)}</p>
                  <p><strong>État SLA :</strong> {isFollowUpOverdue(selectedRequest) ? 'Dépassée' : 'Dans les temps'}</p>
                </div>

                <div className={styles.section}>
                  <h3>Contact WhatsApp</h3>
                  <p><strong>Contact :</strong> {selectedRequest.contact_name}</p>
                  <p><strong>Business line :</strong> {getBusinessLineLabel(selectedRequest.business_line)}</p>
                  {selectedRequest.company_name && (
                    <p><strong>Société :</strong> {selectedRequest.company_name}</p>
                  )}
                  <p><strong>Téléphone :</strong> <a href={`tel:${selectedRequest.telephone}`}>{selectedRequest.telephone}</a></p>
                  <p><strong>Email :</strong> {selectedRequest.email ? <a href={`mailto:${selectedRequest.email}`}>{selectedRequest.email}</a> : 'Non renseigné'}</p>
                  <p><strong>Service :</strong> {getServiceLabel(selectedRequest.service_key, selectedRequest.business_line)}</p>
                </div>

                <div className={styles.section}>
                  <h3>Planification</h3>
                  <p><strong>Type prévu :</strong> {selectedRequest.scheduled_at ? getScheduleLabel(selectedRequest.scheduled_type) : 'Non planifié'}</p>
                  <p><strong>Prévu le :</strong> {formatDate(selectedRequest.scheduled_at)}</p>
                </div>

                <div className={styles.section}>
                  <h3>Attribution</h3>
                  <p><strong>Source / Medium :</strong> {selectedRequest.session_source || 'whatsapp'} / {selectedRequest.session_medium || 'messaging'}</p>
                  <p><strong>Campagne :</strong> {selectedRequest.session_campaign || 'direct_chat'}</p>
                  <p><strong>Landing page :</strong> {selectedRequest.landing_page || 'Non renseignée'}</p>
                  <p><strong>Referrer host :</strong> {selectedRequest.referrer_host || 'Non renseigné'}</p>
                  <p><strong>Entry path :</strong> {selectedRequest.entry_path || 'Non renseigné'}</p>
                  <p><strong>Attribution WhatsApp :</strong> {getAttributionLabel(selectedRequest)}</p>
                  {selectedRequest.whatsapp_click_label && (
                    <p><strong>Clic site :</strong> {selectedRequest.whatsapp_click_label}{selectedRequest.whatsapp_click_page ? ` • ${selectedRequest.whatsapp_click_page}` : ''}</p>
                  )}
                  {selectedRequest.whatsapp_clicked_at && (
                    <p><strong>Clic enregistré le :</strong> {formatDate(selectedRequest.whatsapp_clicked_at)}</p>
                  )}
                </div>

                {selectedRequest.notes && (
                  <div className={styles.section}>
                    <h3>Notes</h3>
                    <p>{selectedRequest.notes}</p>
                  </div>
                )}

                <div className={styles.section}>
                  <h3>Informations système</h3>
                  <p><strong>Date de création :</strong> {formatDate(selectedRequest.created_at)}</p>
                  <p><strong>Dernière mise à jour :</strong> {formatDate(selectedRequest.updated_at)}</p>
                  <p><strong>ID :</strong> {selectedRequest.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <WhatsAppLeadCreateModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onCreated={handleCreateSuccess}
          onSubmitLead={submitWhatsAppLead}
          initialValues={createModalInitialValues}
          payloadOverrides={createModalPayloadOverrides}
          title={createModalTitle}
          introNote={createModalIntro}
          submitLabel={createModalSubmitLabel}
        />
      </div>
    </>
  );
}
