'use client';

import HeroHeader from '@/utils/components/reusableHeader/HeroHeader';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getAdminDashboardData } from '@/services/adminLeadService';
import styles from '../devis/admin.module.css';

const STATUS_LABELS = {
  submitted: 'Soumis',
  qualified: 'Qualifié',
  closed_won: 'Gagné',
  closed_lost: 'Perdu'
};

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);

  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to)
  };
}

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(value || 0);
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString('fr-FR', {
    maximumFractionDigits: 1
  })} %`;
}

function formatHours(value) {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (value < 24) {
    return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} h`;
  }

  return `${(value / 24).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} j`;
}

function formatDateTime(value) {
  if (!value) {
    return 'Non renseigné';
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateShort(value) {
  if (!value) {
    return '';
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short'
  });
}

function getDeltaLabel(delta) {
  if (delta === null || delta === undefined) {
    return 'Pas de période précédente';
  }

  if (delta === 0) {
    return 'Stable vs période précédente';
  }

  return `${delta > 0 ? '+' : ''}${formatNumber(delta)} vs période précédente`;
}

function AdminNavTabs() {
  return (
    <div className={styles.navTabs}>
      <Link href="/admin/dashboard" className={`${styles.navLink} ${styles.navLinkActive}`}>
        Dashboard
      </Link>
      <Link href="/admin/devis" className={styles.navLink}>
        Devis
      </Link>
      <Link href="/admin/conventions" className={styles.navLink}>
        Conventions
      </Link>
    </div>
  );
}

function KpiCard({ value, label, meta }) {
  return (
    <div className={styles.statCard}>
      <h3>{value}</h3>
      <p>{label}</p>
      {meta && <span className={styles.statMeta}>{meta}</span>}
    </div>
  );
}

function TrendChart({ points = [] }) {
  const maxValue = Math.max(...points.map((point) => point.total), 1);
  const width = 640;
  const height = 180;
  const padding = 18;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  const step = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;
  const polylinePoints = points.map((point, index) => {
    const x = padding + (index * step);
    const y = padding + chartHeight - ((point.total / maxValue) * chartHeight);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={styles.chartFrame}>
      <svg className={styles.trendChart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tendance quotidienne des leads">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className={styles.chartAxis} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className={styles.chartAxis} />
        {points.map((point, index) => {
          const x = padding + (index * step);
          const y = padding + chartHeight - ((point.total / maxValue) * chartHeight);

          return (
            <g key={point.date}>
              <circle cx={x} cy={y} r="4" className={styles.chartPoint} />
              {index % Math.max(1, Math.ceil(points.length / 6)) === 0 && (
                <text x={x} y={height - 2} textAnchor="middle" className={styles.chartLabel}>
                  {formatDateShort(point.date)}
                </text>
              )}
            </g>
          );
        })}
        <polyline points={polylinePoints} className={styles.chartLine} />
      </svg>
    </div>
  );
}

function FunnelChart({ items = [] }) {
  return (
    <div className={styles.funnelList}>
      {items.map((item) => (
        <div key={item.key} className={styles.funnelRow}>
          <div className={styles.funnelMeta}>
            <span>{item.label}</span>
            <strong>{formatNumber(item.count)}</strong>
          </div>
          <div className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${Math.max(item.rate, item.count > 0 ? 3 : 0)}%` }} />
          </div>
          <span className={styles.rateLabel}>{formatPercent(item.rate)}</span>
        </div>
      ))}
    </div>
  );
}

function BreakdownList({ title, items = [] }) {
  return (
    <div className={styles.panel}>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className={styles.mutedText}>Aucune donnée sur cette période.</p>
      ) : (
        <div className={styles.breakdownList}>
          {items.map((item) => (
            <div key={item.key} className={styles.breakdownRow}>
              <div>
                <strong>{item.label}</strong>
                <span>{formatPercent(item.rate)}</span>
              </div>
              <div className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: `${Math.max(item.rate, item.count > 0 ? 3 : 0)}%` }} />
              </div>
              <b>{formatNumber(item.count)}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LeadSummaryList({ title, leads = [], emptyText }) {
  return (
    <div className={styles.panel}>
      <h2>{title}</h2>
      {leads.length === 0 ? (
        <p className={styles.mutedText}>{emptyText}</p>
      ) : (
        <div className={styles.compactList}>
          {leads.map((lead) => (
            <Link
              key={`${lead.kind}-${lead.id}`}
              href={lead.kind === 'devis' ? '/admin/devis' : '/admin/conventions'}
              className={styles.compactItem}
            >
              <div>
                <strong>{lead.kindLabel} - {lead.serviceLabel}</strong>
                <span>{lead.source} / {lead.medium}</span>
              </div>
              <div className={styles.compactMeta}>
                <span className={`${styles.statusBadge} ${styles[`status_${lead.status}`]}`}>
                  {lead.statusLabel}
                </span>
                <small>{formatHours(lead.ageHours)}</small>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AuditFeed({ events = [] }) {
  return (
    <div className={styles.panel}>
      <h2>Activité lifecycle récente</h2>
      {events.length === 0 ? (
        <p className={styles.mutedText}>Aucune activité récente.</p>
      ) : (
        <div className={styles.auditList}>
          {events.map((event) => (
            <div key={event.id} className={styles.auditItem}>
              <div>
                <strong>
                  {event.leadKind === 'devis' ? 'Devis' : event.leadKind === 'convention' ? 'Convention' : 'Lead'} - {event.actionResult === 'success' ? 'modifié' : 'rejeté'}
                </strong>
                <span>
                  {(STATUS_LABELS[event.previousStatus] || event.previousStatus || 'N/A')} vers {(STATUS_LABELS[event.nextStatus] || event.nextStatus || 'N/A')}
                </span>
                {event.rejectionReason && <small>Motif: {event.rejectionReason}</small>}
              </div>
              <div className={styles.compactMeta}>
                <span className={event.actionResult === 'success' ? styles.auditSuccess : styles.auditRejected}>
                  {event.actionResult === 'success' ? 'Succès' : 'Rejeté'}
                </span>
                <small>{formatDateTime(event.createdAt)}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, error: authError, signOut } = useAdminAuth();
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async (range) => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminDashboardData(range);
      setDashboardData(data);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError.message || 'Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchDashboard(defaultRange);
    }
  }, [user, isAdmin, authLoading, fetchDashboard, defaultRange]);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/admin/login');
    }
  };

  const updateDateRange = (key, value) => {
    setDateRange((currentRange) => ({
      ...currentRange,
      [key]: value
    }));
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Vérification des privilèges administrateur...</div>
        {authError && <div className={styles.error}>Erreur: {authError}</div>}
      </div>
    );
  }

  return (
    <>
      <HeroHeader title="Administration - Dashboard" />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Administration - Dashboard KPI</h1>
          <div className={styles.headerActions}>
            <button onClick={() => fetchDashboard(dateRange)} className={styles.refreshButton}>
              Actualiser
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Déconnexion
            </button>
          </div>
        </div>

        <AdminNavTabs />

        <div className={styles.filtersPanel}>
          <div className={styles.filterField}>
            <label htmlFor="dashboard-from">Début</label>
            <input
              id="dashboard-from"
              type="date"
              value={dateRange.from}
              onChange={(event) => updateDateRange('from', event.target.value)}
            />
          </div>
          <div className={styles.filterField}>
            <label htmlFor="dashboard-to">Fin</label>
            <input
              id="dashboard-to"
              type="date"
              value={dateRange.to}
              onChange={(event) => updateDateRange('to', event.target.value)}
            />
          </div>
          <button onClick={() => fetchDashboard(dateRange)} className={styles.clearFiltersButton}>
            Appliquer
          </button>
        </div>

        {loading && <div className={styles.loading}>Chargement des KPI...</div>}
        {error && (
          <div>
            <div className={styles.error}>{error}</div>
            <button onClick={() => fetchDashboard(dateRange)} className={styles.refreshButton}>
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && dashboardData && (
          <>
            <div className={styles.resultsMeta}>
              Période: {dashboardData.range.from} au {dashboardData.range.to} - {dashboardData.range.days} jours
            </div>

            <div className={styles.stats}>
              <KpiCard value={formatNumber(dashboardData.totals.totalLeads)} label="Leads totaux" meta={getDeltaLabel(dashboardData.comparison.totalDelta)} />
              <KpiCard value={formatNumber(dashboardData.totals.devisLeads)} label="Devis" />
              <KpiCard value={formatNumber(dashboardData.totals.conventionLeads)} label="Conventions" />
              <KpiCard value={formatNumber(dashboardData.totals.submitted)} label="Soumis" />
              <KpiCard value={formatNumber(dashboardData.totals.qualified)} label="Qualifiés actifs" />
              <KpiCard value={formatNumber(dashboardData.totals.closedWon)} label="Gagnés" meta={getDeltaLabel(dashboardData.comparison.closedWonDelta)} />
              <KpiCard value={formatNumber(dashboardData.totals.closedLost)} label="Perdus" />
              <KpiCard value={formatNumber(dashboardData.totals.staleSubmitted)} label="À relancer" meta={`>${dashboardData.range.staleLeadHours}h`} />
            </div>

            <div className={styles.stats}>
              <KpiCard value={formatPercent(dashboardData.totals.qualificationRate)} label="Taux qualification" />
              <KpiCard value={formatPercent(dashboardData.totals.closeRate)} label="Taux clôture" />
              <KpiCard value={formatPercent(dashboardData.totals.winRate)} label="Taux de gain" />
              <KpiCard value={formatHours(dashboardData.totals.avgHoursToQualify)} label="Temps moyen qualification" />
              <KpiCard value={formatHours(dashboardData.totals.avgHoursToClose)} label="Temps moyen clôture" />
            </div>

            <div className={styles.dashboardGrid}>
              <div className={`${styles.panel} ${styles.panelWide}`}>
                <h2>Tendance quotidienne</h2>
                <TrendChart points={dashboardData.trend} />
              </div>

              <div className={styles.panel}>
                <h2>Funnel lifecycle</h2>
                <FunnelChart items={dashboardData.funnel} />
              </div>
            </div>

            <div className={styles.dashboardGrid}>
              <BreakdownList title="Sources" items={dashboardData.breakdowns.source} />
              <BreakdownList title="Mediums" items={dashboardData.breakdowns.medium} />
              <BreakdownList title="Campagnes" items={dashboardData.breakdowns.campaign} />
              <BreakdownList title="Services / catégories" items={dashboardData.breakdowns.service} />
            </div>

            <div className={styles.dashboardGrid}>
              <LeadSummaryList
                title={`Leads à relancer > ${dashboardData.range.staleLeadHours}h`}
                leads={dashboardData.operations.staleLeads}
                emptyText="Aucun lead soumis en retard."
              />
              <LeadSummaryList
                title="Derniers leads soumis"
                leads={dashboardData.operations.latestSubmitted}
                emptyText="Aucun lead soumis sur cette période."
              />
            </div>

            <AuditFeed events={dashboardData.auditEvents} />
          </>
        )}
      </div>
    </>
  );
}
