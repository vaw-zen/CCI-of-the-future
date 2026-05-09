'use client';

import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getConventionRequests } from '@/services/conventionService';
import { updateLeadAttribution, updateLeadOperations, updateLeadStatus } from '@/services/adminLeadService';
import {
  CONVENTION_OPERATIONAL_STATUSES,
  deriveLeadQualityOutcomeFromStatus,
  deriveLeadStatusFromConventionStatus,
  formatDateTimeLocalInputValue,
  isLeadFollowUpOverdue,
  LEAD_QUALITY_OUTCOME_LABELS,
  LEAD_QUALITY_OUTCOME_OPTIONS,
  LEAD_QUALITY_OUTCOMES,
  LEAD_STATUSES,
  parseDateTimeLocalInputValue
} from '@/utils/leadLifecycle';
import { getWhatsAppAttributionSummary, matchesWhatsAppFilter } from '@/libs/whatsappAttribution.mjs';
import styles from '../devis/admin.module.css';

const LEAD_STATUS_LABELS = {
  [LEAD_STATUSES.SUBMITTED]: 'Soumis',
  [LEAD_STATUSES.QUALIFIED]: 'Qualifié',
  [LEAD_STATUSES.CLOSED_WON]: 'Gagné',
  [LEAD_STATUSES.CLOSED_LOST]: 'Perdu'
};

const OPERATIONAL_STATUS_LABELS = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  audit_planifie: 'Audit planifié',
  devis_envoye: 'Devis envoyé',
  signe: 'Signé',
  refuse: 'Refusé'
};

const LEAD_QUALITY_LABELS = LEAD_QUALITY_OUTCOME_LABELS;

export default function AdminConventionsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, error: authError, signOut } = useAdminAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [operationalStatusDraft, setOperationalStatusDraft] = useState('nouveau');
  const [leadQualityDraft, setLeadQualityDraft] = useState(LEAD_QUALITY_OUTCOMES.UNREVIEWED);
  const [leadOwnerDraft, setLeadOwnerDraft] = useState('');
  const [followUpSlaDraft, setFollowUpSlaDraft] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingOperations, setIsSavingOperations] = useState(false);
  const [isSavingAttribution, setIsSavingAttribution] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [operationsError, setOperationsError] = useState('');
  const [attributionError, setAttributionError] = useState('');
  const [filters, setFilters] = useState({
    leadStatus: 'all',
    leadQualityOutcome: 'all',
    operationalStatus: 'all',
    sector: 'all',
    whatsappAttribution: 'all',
    leadOwner: '',
    sessionSource: '',
    sessionMedium: '',
    dateFrom: '',
    dateTo: ''
  });
  const [leadIdParam, setLeadIdParam] = useState('');

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
    document.body.style.overflow = selectedRequest ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedRequest]);

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
      const data = await getConventionRequests({ limit: 50 });
      setRequests(data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des conventions');
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
    setOperationalStatusDraft(request.statut || 'nouveau');
    setStatusError('');
    setLeadQualityDraft(
      request.lead_quality_outcome
      || deriveLeadQualityOutcomeFromStatus(
        request.lead_status || deriveLeadStatusFromConventionStatus(request.statut)
      )
    );
    setLeadOwnerDraft(request.lead_owner || '');
    setFollowUpSlaDraft(formatDateTimeLocalInputValue(request.follow_up_sla_at));
    setOperationsError('');
    setAttributionError('');

    if (syncQuery && leadIdParam !== request.id) {
      syncLeadQuery(request.id);
    }
  }, [leadIdParam, syncLeadQuery]);

  const closeRequest = useCallback(() => {
    setSelectedRequest(null);
    setStatusError('');
    setOperationsError('');
    setAttributionError('');

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

  const handleStatusSave = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setIsSavingStatus(true);
      setStatusError('');

      const updatedLead = await updateLeadStatus('convention', selectedRequest.id, {
        operationalStatus: operationalStatusDraft,
        leadStatus: deriveLeadStatusFromConventionStatus(operationalStatusDraft)
      });

      setRequests((currentRequests) => currentRequests.map((request) => (
        request.id === updatedLead.id ? updatedLead : request
      )));
      setSelectedRequest(updatedLead);
      setLeadQualityDraft(
        updatedLead.lead_quality_outcome
        || deriveLeadQualityOutcomeFromStatus(
          updatedLead.lead_status || deriveLeadStatusFromConventionStatus(updatedLead.statut)
        )
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

  const handleWhatsAppManualTagToggle = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setIsSavingAttribution(true);
      setAttributionError('');
      const updatedLead = await updateLeadAttribution('convention', selectedRequest.id, {
        whatsappManualTag: !Boolean(selectedRequest.whatsapp_manual_tag)
      });

      setRequests((currentRequests) => currentRequests.map((request) => (
        request.id === updatedLead.id ? updatedLead : request
      )));
      setSelectedRequest(updatedLead);
      setLeadQualityDraft(
        updatedLead.lead_quality_outcome
        || deriveLeadQualityOutcomeFromStatus(
          updatedLead.lead_status || deriveLeadStatusFromConventionStatus(updatedLead.statut)
        )
      );
      setLeadOwnerDraft(updatedLead.lead_owner || '');
      setFollowUpSlaDraft(formatDateTimeLocalInputValue(updatedLead.follow_up_sla_at));
    } catch (saveError) {
      console.error(saveError);
      setAttributionError(saveError.message || 'Impossible de mettre à jour l’attribution WhatsApp.');
    } finally {
      setIsSavingAttribution(false);
    }
  };

  const handleOperationsSave = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setIsSavingOperations(true);
      setOperationsError('');
      const updatedLead = await updateLeadOperations('convention', selectedRequest.id, {
        leadQualityOutcome: leadQualityDraft,
        leadOwner: leadOwnerDraft.trim() || null,
        followUpSlaAt: parseDateTimeLocalInputValue(followUpSlaDraft)
      });

      setRequests((currentRequests) => currentRequests.map((request) => (
        request.id === updatedLead.id ? updatedLead : request
      )));
      setSelectedRequest(updatedLead);
      setLeadQualityDraft(
        updatedLead.lead_quality_outcome
        || deriveLeadQualityOutcomeFromStatus(
          updatedLead.lead_status || deriveLeadStatusFromConventionStatus(updatedLead.statut)
        )
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
      const updatedLead = await updateLeadOperations('convention', selectedRequest.id, {
        lastWorkedAt: new Date().toISOString()
      });

      setRequests((currentRequests) => currentRequests.map((request) => (
        request.id === updatedLead.id ? updatedLead : request
      )));
      setSelectedRequest(updatedLead);
      setLeadQualityDraft(
        updatedLead.lead_quality_outcome
        || deriveLeadQualityOutcomeFromStatus(
          updatedLead.lead_status || deriveLeadStatusFromConventionStatus(updatedLead.statut)
        )
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

  const getLeadStatus = useCallback((request) => request.lead_status || deriveLeadStatusFromConventionStatus(request.statut), []);
  const getLeadQualityOutcome = useCallback((request) => (
    request.lead_quality_outcome
    || deriveLeadQualityOutcomeFromStatus(getLeadStatus(request))
  ), [getLeadStatus]);
  const getLeadQualityLabel = useCallback((request) => (
    LEAD_QUALITY_LABELS[getLeadQualityOutcome(request)] || getLeadQualityOutcome(request)
  ), [getLeadQualityOutcome]);
  const getWhatsAppSummary = useCallback((request) => getWhatsAppAttributionSummary(request), []);
  const isFollowUpOverdue = useCallback((request) => isLeadFollowUpOverdue({
    leadStatus: getLeadStatus(request),
    followUpSlaAt: request.follow_up_sla_at,
    lastWorkedAt: request.last_worked_at
  }), [getLeadStatus]);

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      leadStatus: 'all',
      leadQualityOutcome: 'all',
      operationalStatus: 'all',
      sector: 'all',
      whatsappAttribution: 'all',
      leadOwner: '',
      sessionSource: '',
      sessionMedium: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const filteredRequests = useMemo(() => requests.filter((request) => {
    const requestDate = request.created_at ? new Date(request.created_at) : null;
    const dateFrom = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
    const dateTo = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;

    if (filters.leadStatus !== 'all' && getLeadStatus(request) !== filters.leadStatus) {
      return false;
    }

    if (filters.leadQualityOutcome !== 'all' && getLeadQualityOutcome(request) !== filters.leadQualityOutcome) {
      return false;
    }

    if (filters.operationalStatus !== 'all' && request.statut !== filters.operationalStatus) {
      return false;
    }

    if (filters.sector !== 'all' && request.secteur_activite !== filters.sector) {
      return false;
    }

    if (!matchesWhatsAppFilter(request, filters.whatsappAttribution)) {
      return false;
    }

    if (filters.sessionSource && !String(request.session_source || 'direct').toLowerCase().includes(filters.sessionSource.toLowerCase())) {
      return false;
    }

    if (filters.sessionMedium && !String(request.session_medium || '(none)').toLowerCase().includes(filters.sessionMedium.toLowerCase())) {
      return false;
    }

    if (filters.leadOwner && !String(request.lead_owner || '').toLowerCase().includes(filters.leadOwner.toLowerCase())) {
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        gap: '20px',
        padding: '20px'
      }}>
        <div>Vérification des privilèges administrateur...</div>
        {authError && (
          <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
            Erreur: {authError}
          </div>
        )}
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        gap: '20px',
        padding: '20px'
      }}>
        <div>Redirection vers la connexion administrateur...</div>
        {authError && (
          <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
            Erreur: {authError}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des conventions...</div>
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
      <HeroHeader title={"Administration - Conventions"} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Administration - Conventions</h1>
          <div className={styles.headerActions}>
            <button onClick={loadRequests} className={styles.refreshButton}>
              Actualiser
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Déconnexion
            </button>
          </div>
        </div>

        <div className={styles.navTabs}>
          <Link href="/admin/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/admin/devis" className={styles.navLink}>
            Devis
          </Link>
          <Link href="/admin/conventions" className={`${styles.navLink} ${styles.navLinkActive}`}>
            Conventions
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>{requests.length}</h3>
            <p>Demandes totales</p>
          </div>
          <div className={styles.statCard}>
            <h3>{requests.filter((request) => getLeadStatus(request) === LEAD_STATUSES.SUBMITTED).length}</h3>
            <p>Soumises</p>
          </div>
          <div className={styles.statCard}>
            <h3>{requests.filter((request) => getLeadStatus(request) === LEAD_STATUSES.QUALIFIED).length}</h3>
            <p>Qualifiées</p>
          </div>
          <div className={styles.statCard}>
            <h3>{requests.filter((request) => getLeadStatus(request) === LEAD_STATUSES.CLOSED_WON).length}</h3>
            <p>Gagnées</p>
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

        <div className={styles.filtersPanel}>
          <div className={styles.filterField}>
            <label htmlFor="convention-lead-status">Statut lead</label>
            <select
              id="convention-lead-status"
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
            <label htmlFor="convention-operational-status">Statut opérationnel</label>
            <select
              id="convention-operational-status"
              value={filters.operationalStatus}
              onChange={(event) => updateFilter('operationalStatus', event.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {CONVENTION_OPERATIONAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {OPERATIONAL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="convention-sector">Secteur</label>
            <select
              id="convention-sector"
              value={filters.sector}
              onChange={(event) => updateFilter('sector', event.target.value)}
            >
              <option value="all">Tous les secteurs</option>
              <option value="banque">Banque</option>
              <option value="assurance">Assurance</option>
              <option value="clinique">Clinique</option>
              <option value="hotel">Hôtel</option>
              <option value="bureau">Bureau</option>
              <option value="commerce">Commerce</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="convention-lead-quality">Qualité</label>
            <select
              id="convention-lead-quality"
              value={filters.leadQualityOutcome}
              onChange={(event) => updateFilter('leadQualityOutcome', event.target.value)}
            >
              <option value="all">Tous les niveaux</option>
              {LEAD_QUALITY_OUTCOME_OPTIONS.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {LEAD_QUALITY_LABELS[outcome]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="convention-whatsapp-attribution">WhatsApp</label>
            <select
              id="convention-whatsapp-attribution"
              value={filters.whatsappAttribution}
              onChange={(event) => updateFilter('whatsappAttribution', event.target.value)}
            >
              <option value="all">Tous les leads</option>
              <option value="any">Tous les leads WhatsApp</option>
              <option value="auto">Match auto ou mixte</option>
              <option value="manual">Tag manuel ou mixte</option>
              <option value="both">Auto + manuel</option>
              <option value="none">Sans attribution WhatsApp</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="convention-session-source">Source</label>
            <input
              id="convention-session-source"
              type="search"
              value={filters.sessionSource}
              onChange={(event) => updateFilter('sessionSource', event.target.value)}
              placeholder="google, facebook, direct..."
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="convention-session-medium">Medium</label>
            <input
              id="convention-session-medium"
              type="search"
              value={filters.sessionMedium}
              onChange={(event) => updateFilter('sessionMedium', event.target.value)}
              placeholder="organic, cpc, social..."
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="convention-lead-owner">Responsable</label>
            <input
              id="convention-lead-owner"
              type="search"
              value={filters.leadOwner}
              onChange={(event) => updateFilter('leadOwner', event.target.value)}
              placeholder="email ou nom de queue"
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="convention-date-from">Depuis</label>
            <input
              id="convention-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="convention-date-to">Jusqu&apos;au</label>
            <input
              id="convention-date-to"
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
          {filteredRequests.length} convention{filteredRequests.length > 1 ? 's' : ''} affichée{filteredRequests.length > 1 ? 's' : ''}
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
                  <h3>{request.raison_sociale}</h3>
                  <p className={styles.service}>{request.secteur_activite}</p>
                </div>
                <div className={styles.requestMeta}>
                  <span className={styles.date}>{formatDate(request.created_at)}</span>
                  <span className={`${styles.statusBadge} ${styles[`status_${getLeadStatus(request)}`]}`}>
                    {LEAD_STATUS_LABELS[getLeadStatus(request)]}
                  </span>
                </div>
              </div>

              <div className={styles.requestDetails}>
                <div className={styles.detail}>
                  <strong>👤</strong> {request.contact_nom} {request.contact_prenom}
                </div>
                <div className={styles.detail}>
                  <strong>📧</strong> {request.email}
                </div>
                <div className={styles.detail}>
                  <strong>📞</strong> {request.telephone}
                </div>
                <div className={styles.detail}>
                  <strong>📈</strong> {request.session_source || 'direct'} / {request.session_medium || '(none)'}
                </div>
                <div className={styles.detail}>
                  <strong>💬</strong> {getWhatsAppSummary(request).label}
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
            <div className={styles.emptyState}>Aucune convention ne correspond aux filtres.</div>
          )}
        </div>

        {selectedRequest && (
          <div className={styles.modal} onClick={closeRequest}>
            <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Détails de la convention</h2>
                <button className={styles.closeButton} onClick={closeRequest}>
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.section}>
                  <h3>Statuts</h3>
                  <div className={styles.lifecycleControls}>
                    <select
                      className={styles.statusSelect}
                      value={operationalStatusDraft}
                      onChange={(event) => setOperationalStatusDraft(event.target.value)}
                      disabled={isSavingStatus}
                    >
                      {CONVENTION_OPERATIONAL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {OPERATIONAL_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleStatusSave}
                      disabled={isSavingStatus || operationalStatusDraft === selectedRequest.statut}
                    >
                      {isSavingStatus ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                  {statusError && <p className={styles.statusError}>{statusError}</p>}
                  <p><strong>Lead status :</strong> {LEAD_STATUS_LABELS[deriveLeadStatusFromConventionStatus(operationalStatusDraft)]}</p>
                  <p><strong>Soumis le :</strong> {formatDate(selectedRequest.submitted_at || selectedRequest.created_at)}</p>
                  <p><strong>Qualifié le :</strong> {formatDate(selectedRequest.qualified_at)}</p>
                  <p><strong>Clôturé le :</strong> {formatDate(selectedRequest.closed_at)}</p>
                </div>

                <div className={styles.section}>
                  <h3>Suivi commercial</h3>
                  <div className={styles.opsGrid}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="convention-quality-draft">Qualité</label>
                      <select
                        id="convention-quality-draft"
                        className={styles.statusSelect}
                        value={leadQualityDraft}
                        onChange={(event) => setLeadQualityDraft(event.target.value)}
                        disabled={isSavingOperations}
                      >
                        {LEAD_QUALITY_OUTCOME_OPTIONS.map((outcome) => (
                          <option key={outcome} value={outcome}>
                            {LEAD_QUALITY_LABELS[outcome]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="convention-owner-draft">Responsable</label>
                      <input
                        id="convention-owner-draft"
                        className={styles.textInput}
                        type="text"
                        value={leadOwnerDraft}
                        onChange={(event) => setLeadOwnerDraft(event.target.value)}
                        placeholder="email ou nom de queue"
                        disabled={isSavingOperations}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="convention-follow-up-sla">SLA suivi</label>
                      <input
                        id="convention-follow-up-sla"
                        className={styles.textInput}
                        type="datetime-local"
                        value={followUpSlaDraft}
                        onChange={(event) => setFollowUpSlaDraft(event.target.value)}
                        disabled={isSavingOperations}
                      />
                    </div>
                  </div>

                  <div className={styles.lifecycleControls}>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleOperationsSave}
                      disabled={isSavingOperations}
                    >
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
                  <h3>Entreprise</h3>
                  <p><strong>Raison sociale :</strong> {selectedRequest.raison_sociale}</p>
                  <p><strong>Matricule fiscale :</strong> {selectedRequest.matricule_fiscale}</p>
                  <p><strong>Secteur :</strong> {selectedRequest.secteur_activite}</p>
                  <p><strong>Statut opérationnel :</strong> {OPERATIONAL_STATUS_LABELS[selectedRequest.statut] || selectedRequest.statut}</p>
                </div>

                <div className={styles.section}>
                  <h3>Contact</h3>
                  <p><strong>Nom :</strong> {selectedRequest.contact_nom} {selectedRequest.contact_prenom}</p>
                  {selectedRequest.contact_fonction && (
                    <p><strong>Fonction :</strong> {selectedRequest.contact_fonction}</p>
                  )}
                  <p><strong>Email :</strong> <a href={`mailto:${selectedRequest.email}`}>{selectedRequest.email}</a></p>
                  <p><strong>Téléphone :</strong> <a href={`tel:${selectedRequest.telephone}`}>{selectedRequest.telephone}</a></p>
                </div>

                <div className={styles.section}>
                  <h3>Convention</h3>
                  <p><strong>Nombre de sites :</strong> {selectedRequest.nombre_sites || 1}</p>
                  <p><strong>Surface totale :</strong> {selectedRequest.surface_totale || 'Non renseignée'}</p>
                  <p><strong>Fréquence :</strong> {selectedRequest.frequence}</p>
                  <p><strong>Durée contrat :</strong> {selectedRequest.duree_contrat}</p>
                  <p><strong>Services :</strong> {Array.isArray(selectedRequest.services_souhaites) ? selectedRequest.services_souhaites.join(', ') : 'Non renseignés'}</p>
                </div>

                <div className={styles.section}>
                  <h3>Attribution</h3>
                  <p><strong>Source / Medium :</strong> {selectedRequest.session_source || 'direct'} / {selectedRequest.session_medium || '(none)'}</p>
                  <p><strong>Campagne :</strong> {selectedRequest.session_campaign || 'Aucune'}</p>
                  <p><strong>Landing page :</strong> {selectedRequest.landing_page || 'Non renseignée'}</p>
                  <p><strong>Referrer host :</strong> {selectedRequest.referrer_host || 'Direct'}</p>
                  <p><strong>Entry path :</strong> {selectedRequest.entry_path || 'Non renseigné'}</p>
                  <p><strong>Attribution WhatsApp :</strong> {getWhatsAppSummary(selectedRequest).label}</p>
                  {getWhatsAppSummary(selectedRequest).clickLabel && (
                    <p><strong>Touchpoint WhatsApp :</strong> {getWhatsAppSummary(selectedRequest).clickLabel}</p>
                  )}
                  {getWhatsAppSummary(selectedRequest).clickPage && (
                    <p><strong>Page du clic WhatsApp :</strong> {getWhatsAppSummary(selectedRequest).clickPage}</p>
                  )}
                  {getWhatsAppSummary(selectedRequest).clickedAt && (
                    <p><strong>Clic WhatsApp détecté le :</strong> {formatDate(getWhatsAppSummary(selectedRequest).clickedAt)}</p>
                  )}
                  {getWhatsAppSummary(selectedRequest).manualTaggedAt && (
                    <p><strong>Tag manuel le :</strong> {formatDate(getWhatsAppSummary(selectedRequest).manualTaggedAt)}</p>
                  )}
                  <div className={styles.lifecycleControls}>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleWhatsAppManualTagToggle}
                      disabled={isSavingAttribution}
                    >
                      {isSavingAttribution
                        ? 'Enregistrement...'
                        : selectedRequest.whatsapp_manual_tag
                          ? 'Retirer le tag WhatsApp'
                          : 'Marquer comme lead WhatsApp'}
                    </button>
                  </div>
                  {attributionError && <p className={styles.statusError}>{attributionError}</p>}
                </div>

                {selectedRequest.message && (
                  <div className={styles.section}>
                    <h3>Message</h3>
                    <p>{selectedRequest.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
