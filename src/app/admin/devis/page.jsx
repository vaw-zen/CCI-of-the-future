'use client';
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getDevisRequests } from '@/services/devisService';
import styles from './admin.module.css';

export default function AdminDevisPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, error: authError, signOut } = useAdminAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('Auth state:', { user, isAdmin, authLoading, authError });
  }, [user, isAdmin, authLoading, authError]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      console.log('Redirecting to login - user:', user, 'isAdmin:', isAdmin);
      router.push('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  // Load requests when authenticated
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadRequests();
    }
  }, [user, isAdmin, authLoading]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (selectedRequest) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedRequest]);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/admin/login');
    }
  };

  // Don't render anything if not authenticated or still loading
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
        {!authLoading && !user && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Aucun utilisateur connecté. Redirection...
          </div>
        )}
        {!authLoading && user && !isAdmin && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Privilèges administrateur requis. Redirection...
          </div>
        )}
      </div>
    );
  }

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getDevisRequests({ limit: 50 });
      setRequests(data);
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
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
      'salon': 'Nettoyage de salon',
      'tapis': 'Nettoyage de tapis/moquettes',
      'tapisserie': 'Tapisserie',
      'marbre': 'Polissage de marbre',
      'tfc': 'Nettoyage TFC'
    };
    return services[service] || service;
  };

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
        <button onClick={loadRequests} className={styles.retryButton}>
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
            🔄 Actualiser
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>{requests.length}</h3>
          <p>Demandes totales</p>
        </div>
        <div className={styles.statCard}>
          <h3>{requests.filter(r => new Date(r.created_at) > new Date(Date.now() - 24*60*60*1000)).length}</h3>
          <p>Dernières 24h</p>
        </div>
        <div className={styles.statCard}>
          <h3>{requests.filter(r => r.type_personne === 'morale').length}</h3>
          <p>Entreprises</p>
        </div>
        <div className={styles.statCard}>
          <h3>{requests.filter(r => r.type_personne === 'physique').length}</h3>
          <p>Particuliers</p>
        </div>
      </div>

      <div className={styles.requestsList}>
        {requests.map((request) => (
          <div 
            key={request.id} 
            className={styles.requestCard}
            onClick={() => setSelectedRequest(request)}
          >
            <div className={styles.requestHeader}>
              <div className={styles.requestInfo}>
                <h3>{request.nom} {request.prenom}</h3>
                <p className={styles.service}>{formatService(request.type_service)}</p>
              </div>
              <div className={styles.requestMeta}>
                <span className={styles.date}>{formatDate(request.created_at)}</span>
                <span className={`${styles.type} ${styles[request.type_personne]}`}>
                  {request.type_personne === 'physique' ? 'Particulier' : 'Entreprise'}
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
              {request.surface_service && (
                <div className={styles.detail}>
                  <strong>📏</strong> {request.surface_service} m²
                </div>
              )}
              {request.nombre_places && (
                <div className={styles.detail}>
                  <strong>🪑</strong> {request.nombre_places} places
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className={styles.modal} onClick={() => setSelectedRequest(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Détails de la demande</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.section}>
                <h3>👤 Informations personnelles</h3>
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
                <h3>📍 Adresse</h3>
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
                <h3>🧹 Service</h3>
                <p><strong>Service :</strong> {formatService(selectedRequest.type_service)}</p>
                {selectedRequest.nombre_places && (
                  <p><strong>Nombre de places :</strong> {selectedRequest.nombre_places}</p>
                )}
                {selectedRequest.surface_service && (
                  <p><strong>Surface à traiter :</strong> {selectedRequest.surface_service} m²</p>
                )}
              </div>

              <div className={styles.section}>
                <h3>📅 Rendez-vous</h3>
                {selectedRequest.date_preferee ? (
                  <p><strong>Date préférée :</strong> {new Date(selectedRequest.date_preferee).toLocaleDateString('fr-FR')}</p>
                ) : (
                  <p><strong>Date préférée :</strong> Non spécifiée</p>
                )}
                <p><strong>Créneau :</strong> {selectedRequest.heure_preferee}</p>
              </div>

              {selectedRequest.message && (
                <div className={styles.section}>
                  <h3>💬 Message</h3>
                  <p>{selectedRequest.message}</p>
                </div>
              )}

              <div className={styles.section}>
                <h3>📊 Informations système</h3>
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