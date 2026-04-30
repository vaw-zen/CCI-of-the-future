'use client';

import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getDevisRequests } from '@/services/devisService';
import { updateLeadStatus } from '@/services/adminLeadService';
import { LEAD_STATUS_OPTIONS, LEAD_STATUSES } from '@/utils/leadLifecycle';
import styles from './admin.module.css';

const LEAD_STATUS_LABELS = {
  [LEAD_STATUSES.SUBMITTED]: 'Soumis',
  [LEAD_STATUSES.QUALIFIED]: 'Qualifié',
  [LEAD_STATUSES.CLOSED_WON]: 'Gagné',
  [LEAD_STATUSES.CLOSED_LOST]: 'Perdu'
};

export default function AdminDevisPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, error: authError, signOut } = useAdminAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [leadStatusDraft, setLeadStatusDraft] = useState(LEAD_STATUSES.SUBMITTED);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [filters, setFilters] = useState({
    leadStatus: 'all',
    serviceType: 'all',
    sessionSource: '',
    sessionMedium: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
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

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDevisRequests({ limit: 50 });
      setRequests(data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des demandes');
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

  const openRequest = (request) => {
    setSelectedRequest(request);
    setLeadStatusDraft(request.lead_status || LEAD_STATUSES.SUBMITTED);
    setStatusError('');
  };

  const handleStatusSave = async () => {
    if (!selectedRequest || !leadStatusDraft) {
      return;
    }

    try {
      setIsSavingStatus(true);
      setStatusError('');
      const updatedLead = await updateLeadStatus('devis', selectedRequest.id, {
        leadStatus: leadStatusDraft
      });

      setRequests((currentRequests) => currentRequests.map((request) => (
        request.id === updatedLead.id ? updatedLead : request
      )));
      setSelectedRequest(updatedLead);
    } catch (saveError) {
      console.error(saveError);
      setStatusError(saveError.message || 'Impossible de mettre à jour le statut.');
    } finally {
      setIsSavingStatus(false);
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

  const formatService = (service) => {
    const services = {
      salon: 'Nettoyage de salon',
      tapis: 'Nettoyage de tapis/moquettes',
      tapisserie: 'Tapisserie',
      marbre: 'Polissage de marbre',
      tfc: 'Nettoyage TFC'
    };
    return services[service] || service;
  };

  const getLeadStatus = useCallback((request) => request.lead_status || LEAD_STATUSES.SUBMITTED, []);

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      leadStatus: 'all',
      serviceType: 'all',
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

    if (filters.serviceType !== 'all' && request.type_service !== filters.serviceType) {
      return false;
    }

    if (filters.sessionSource && !String(request.session_source || 'direct').toLowerCase().includes(filters.sessionSource.toLowerCase())) {
      return false;
    }

    if (filters.sessionMedium && !String(request.session_medium || '(none)').toLowerCase().includes(filters.sessionMedium.toLowerCase())) {
      return false;
    }

    if (dateFrom && (!requestDate || requestDate < dateFrom)) {
      return false;
    }

    if (dateTo && (!requestDate || requestDate > dateTo)) {
      return false;
    }

    return true;
  }), [requests, filters, getLeadStatus]);

  if (authLoading || !user || !isAdmin) {
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des demandes...</div>
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
      <HeroHeader title={"Administration - Demandes de Devis"} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Administration - Demandes de Devis</h1>
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
          <Link href="/admin/devis" className={`${styles.navLink} ${styles.navLinkActive}`}>
            Devis
          </Link>
          <Link href="/admin/conventions" className={styles.navLink}>
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
        </div>

        <div className={styles.filtersPanel}>
          <div className={styles.filterField}>
            <label htmlFor="devis-lead-status">Statut</label>
            <select
              id="devis-lead-status"
              value={filters.leadStatus}
              onChange={(event) => updateFilter('leadStatus', event.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {LEAD_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="devis-service-type">Service</label>
            <select
              id="devis-service-type"
              value={filters.serviceType}
              onChange={(event) => updateFilter('serviceType', event.target.value)}
            >
              <option value="all">Tous les services</option>
              <option value="salon">Nettoyage de salon</option>
              <option value="tapis">Tapis / moquette</option>
              <option value="tapisserie">Tapisserie</option>
              <option value="marbre">Marbre</option>
              <option value="tfc">TFC</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="devis-session-source">Source</label>
            <input
              id="devis-session-source"
              type="search"
              value={filters.sessionSource}
              onChange={(event) => updateFilter('sessionSource', event.target.value)}
              placeholder="google, facebook, direct..."
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="devis-session-medium">Medium</label>
            <input
              id="devis-session-medium"
              type="search"
              value={filters.sessionMedium}
              onChange={(event) => updateFilter('sessionMedium', event.target.value)}
              placeholder="organic, cpc, social..."
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="devis-date-from">Depuis</label>
            <input
              id="devis-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="devis-date-to">Jusqu&apos;au</label>
            <input
              id="devis-date-to"
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
          {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} affichée{filteredRequests.length > 1 ? 's' : ''}
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
                  <h3>{request.nom} {request.prenom}</h3>
                  <p className={styles.service}>{formatService(request.type_service)}</p>
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
                  <strong>📧</strong> {request.email}
                </div>
                <div className={styles.detail}>
                  <strong>📞</strong> {request.telephone}
                </div>
                <div className={styles.detail}>
                  <strong>📍</strong> {request.ville}
                </div>
                <div className={styles.detail}>
                  <strong>📈</strong> {request.session_source || 'direct'} / {request.session_medium || '(none)'}
                </div>
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <div className={styles.emptyState}>Aucune demande ne correspond aux filtres.</div>
          )}
        </div>

        {selectedRequest && (
          <div className={styles.modal} onClick={() => setSelectedRequest(null)}>
            <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Détails de la demande</h2>
                <button className={styles.closeButton} onClick={() => setSelectedRequest(null)}>
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
                      {LEAD_STATUS_OPTIONS.map((status) => (
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
                  <p><strong>Soumis le :</strong> {formatDate(selectedRequest.submitted_at || selectedRequest.created_at)}</p>
                  <p><strong>Qualifié le :</strong> {formatDate(selectedRequest.qualified_at)}</p>
                  <p><strong>Clôturé le :</strong> {formatDate(selectedRequest.closed_at)}</p>
                </div>

                <div className={styles.section}>
                  <h3>Informations personnelles</h3>
                  <p><strong>Type :</strong> {selectedRequest.type_personne === 'physique' ? 'Particulier' : 'Entreprise'}</p>
                  {selectedRequest.matricule_fiscale && (
                    <p><strong>Matricule fiscale :</strong> {selectedRequest.matricule_fiscale}</p>
                  )}
                  <p><strong>Nom :</strong> {selectedRequest.nom}</p>
                  <p><strong>Prénom :</strong> {selectedRequest.prenom}</p>
                  <p><strong>Email :</strong> <a href={`mailto:${selectedRequest.email}`}>{selectedRequest.email}</a></p>
                  <p><strong>Téléphone :</strong> <a href={`tel:${selectedRequest.telephone}`}>{selectedRequest.telephone}</a></p>
                </div>

                <div className={styles.section}>
                  <h3>Adresse</h3>
                  <p><strong>Adresse :</strong> {selectedRequest.adresse}</p>
                  <p><strong>Ville :</strong> {selectedRequest.ville}</p>
                  {selectedRequest.code_postal && (
                    <p><strong>Code postal :</strong> {selectedRequest.code_postal}</p>
                  )}
                  <p><strong>Type de logement :</strong> {selectedRequest.type_logement}</p>
                  {selectedRequest.surface && (
                    <p><strong>Surface :</strong> {selectedRequest.surface} m²</p>
                  )}
                </div>

                <div className={styles.section}>
                  <h3>Service</h3>
                  <p><strong>Service :</strong> {formatService(selectedRequest.type_service)}</p>
                  {selectedRequest.nombre_places && (
                    <p><strong>Nombre de places :</strong> {selectedRequest.nombre_places}</p>
                  )}
                  {selectedRequest.surface_service && (
                    <p><strong>Surface à traiter :</strong> {selectedRequest.surface_service} m²</p>
                  )}
                  {Array.isArray(selectedRequest.selected_services) && selectedRequest.selected_services.length > 0 && (
                    <p><strong>Services simulés :</strong> {selectedRequest.selected_services.join(', ')}</p>
                  )}
                  {selectedRequest.calculator_estimate && (
                    <p><strong>Estimation calculateur :</strong> {selectedRequest.calculator_estimate} DT</p>
                  )}
                </div>

                <div className={styles.section}>
                  <h3>Attribution</h3>
                  <p><strong>Source / Medium :</strong> {selectedRequest.session_source || 'direct'} / {selectedRequest.session_medium || '(none)'}</p>
                  <p><strong>Campagne :</strong> {selectedRequest.session_campaign || 'Aucune'}</p>
                  <p><strong>Landing page :</strong> {selectedRequest.landing_page || 'Non renseignée'}</p>
                  <p><strong>Referrer host :</strong> {selectedRequest.referrer_host || 'Direct'}</p>
                  <p><strong>Entry path :</strong> {selectedRequest.entry_path || 'Non renseigné'}</p>
                </div>

                {selectedRequest.message && (
                  <div className={styles.section}>
                    <h3>Message</h3>
                    <p>{selectedRequest.message}</p>
                  </div>
                )}

                <div className={styles.section}>
                  <h3>Informations système</h3>
                  <p><strong>Date de création :</strong> {formatDate(selectedRequest.created_at)}</p>
                  <p><strong>Newsletter :</strong> {selectedRequest.newsletter ? 'Oui' : 'Non'}</p>
                  <p><strong>ID :</strong> {selectedRequest.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
