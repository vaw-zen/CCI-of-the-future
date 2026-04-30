'use client';

import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getConventionRequests } from '@/services/conventionService';
import { updateLeadStatus } from '@/services/adminLeadService';
import {
  CONVENTION_OPERATIONAL_STATUSES,
  deriveLeadStatusFromConventionStatus,
  LEAD_STATUSES
} from '@/utils/leadLifecycle';
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

export default function AdminConventionsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, error: authError, signOut } = useAdminAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [operationalStatusDraft, setOperationalStatusDraft] = useState('nouveau');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [filters, setFilters] = useState({
    leadStatus: 'all',
    operationalStatus: 'all',
    sector: 'all',
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

  const openRequest = (request) => {
    setSelectedRequest(request);
    setOperationalStatusDraft(request.statut || 'nouveau');
    setStatusError('');
  };

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

  const getLeadStatus = useCallback((request) => request.lead_status || deriveLeadStatusFromConventionStatus(request.statut), []);

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      leadStatus: 'all',
      operationalStatus: 'all',
      sector: 'all',
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

    if (filters.operationalStatus !== 'all' && request.statut !== filters.operationalStatus) {
      return false;
    }

    if (filters.sector !== 'all' && request.secteur_activite !== filters.sector) {
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
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <div className={styles.emptyState}>Aucune convention ne correspond aux filtres.</div>
          )}
        </div>

        {selectedRequest && (
          <div className={styles.modal} onClick={() => setSelectedRequest(null)}>
            <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Détails de la convention</h2>
                <button className={styles.closeButton} onClick={() => setSelectedRequest(null)}>
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
