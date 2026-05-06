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

const SECTION_OPTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'acquisition', label: 'Acquisition' },
  { key: 'seo', label: 'SEO & Content' },
  { key: 'operations', label: 'Operations' }
];

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

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 0
  }).format(value);
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

function formatMetricValue(value, type = 'number') {
  if (type === 'percent') {
    return formatPercent(value);
  }

  if (type === 'currency') {
    return formatCurrency(value);
  }

  if (type === 'hours') {
    return formatHours(value);
  }

  return formatNumber(value);
}

function formatDelta(delta, type = 'number') {
  if (delta === null || delta === undefined) {
    return null;
  }

  if (delta === 0) {
    return 'Stable vs période précédente';
  }

  const prefix = delta > 0 ? '+' : '';

  if (type === 'percent') {
    return `${prefix}${delta.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} pts vs période précédente`;
  }

  if (type === 'currency') {
    return `${prefix}${formatCurrency(delta)} vs période précédente`;
  }

  return `${prefix}${formatNumber(delta)} vs période précédente`;
}

function getHealthLabel(status) {
  if (status === 'fresh') {
    return 'À jour';
  }

  if (status === 'stale') {
    return 'À vérifier';
  }

  if (status === 'error') {
    return 'Erreur';
  }

  return 'Manquant';
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

function SectionTabs({ activeSection, onChange }) {
  return (
    <div className={styles.sectionTabs}>
      {SECTION_OPTIONS.map((section) => (
        <button
          key={section.key}
          type="button"
          className={`${styles.sectionTab} ${activeSection === section.key ? styles.sectionTabActive : ''}`}
          onClick={() => onChange(section.key)}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ card }) {
  return (
    <div className={styles.statCard}>
      <h3>{formatMetricValue(card.value, card.type)}</h3>
      <p>{card.label}</p>
      {card.meta && <span className={styles.statMeta}>{card.meta}</span>}
      {formatDelta(card.delta, card.type) && (
        <span className={styles.statDelta}>{formatDelta(card.delta, card.type)}</span>
      )}
    </div>
  );
}

function MultiSeriesTrendChart({ points = [], series = [], ariaLabel }) {
  if (!points.length || !series.length) {
    return <p className={styles.mutedText}>Aucune donnée à afficher.</p>;
  }

  const width = 720;
  const height = 220;
  const padding = 20;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  const values = points.flatMap((point) => series.map((item) => point[item.key] || 0));
  const maxValue = Math.max(...values, 1);
  const step = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;

  const buildPolyline = (seriesKey) => points.map((point, index) => {
    const x = padding + (index * step);
    const y = padding + chartHeight - (((point[seriesKey] || 0) / maxValue) * chartHeight);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={styles.chartFrame}>
      <div className={styles.chartLegend}>
        {series.map((item) => (
          <div key={item.key} className={styles.chartLegendItem}>
            <span className={styles.chartLegendSwatch} style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
      <svg className={styles.trendChart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className={styles.chartAxis} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className={styles.chartAxis} />
        {points.map((point, index) => {
          const x = padding + (index * step);

          return (
            <g key={point.date}>
              {series.map((item) => {
                const y = padding + chartHeight - (((point[item.key] || 0) / maxValue) * chartHeight);

                return (
                  <circle
                    key={`${point.date}-${item.key}`}
                    cx={x}
                    cy={y}
                    r="3"
                    style={{ fill: item.color }}
                  />
                );
              })}
              {index % Math.max(1, Math.ceil(points.length / 6)) === 0 && (
                <text x={x} y={height - 2} textAnchor="middle" className={styles.chartLabel}>
                  {formatDateShort(point.date)}
                </text>
              )}
            </g>
          );
        })}
        {series.map((item) => (
          <polyline
            key={item.key}
            points={buildPolyline(item.key)}
            fill="none"
            stroke={item.color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}

function BreakdownList({ title, items = [], note }) {
  return (
    <div className={styles.panel}>
      <h2>{title}</h2>
      {note && <p className={styles.inlineNote}>{note}</p>}
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

function HealthGrid({ dataHealth }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Data health</h2>
          <p className={styles.inlineNote}>Visibilité immédiate sur la fraîcheur des sources du dashboard.</p>
        </div>
        <span className={`${styles.healthBadge} ${styles[`health_${dataHealth.overallStatus}`]}`}>
          {getHealthLabel(dataHealth.overallStatus)}
        </span>
      </div>
      <div className={styles.healthGrid}>
        {dataHealth.items.map((item) => (
          <div key={item.key} className={styles.healthCard}>
            <div className={styles.healthHeader}>
              <strong>{item.label}</strong>
              <span className={`${styles.healthBadge} ${styles[`health_${item.status}`]}`}>
                {getHealthLabel(item.status)}
              </span>
            </div>
            <div className={styles.healthMeta}>
              <span>Connecteur: {item.connectorType}</span>
              <span>As of: {formatDateTime(item.asOf)}</span>
              <span>Metric date: {item.freshestMetricDate || 'N/A'}</span>
              {Number.isFinite(item.recordCount) && <span>Lignes période: {formatNumber(item.recordCount)}</span>}
            </div>
            <p className={styles.inlineNote}>{item.message || 'Aucun message.'}</p>
            {item.lastError && <p className={styles.healthError}>{item.lastError}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricBadges({ items = [] }) {
  return (
    <div className={styles.metricBadges}>
      {items.map((item) => (
        <span key={item.label} className={styles.metricBadge}>
          <strong>{item.label}</strong> {item.value}
        </span>
      ))}
    </div>
  );
}

function MetricListPanel({ title, note, rows = [], emptyText, renderRow }) {
  return (
    <div className={styles.panel}>
      <h2>{title}</h2>
      {note && <p className={styles.inlineNote}>{note}</p>}
      {rows.length === 0 ? (
        <p className={styles.mutedText}>{emptyText}</p>
      ) : (
        <div className={styles.metricList}>
          {rows.map((row) => renderRow(row))}
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
                <span>{lead.landingPage}</span>
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

function AuditFeed({ title, events = [] }) {
  return (
    <div className={styles.panel}>
      <h2>{title}</h2>
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

function OverviewSection({ dashboardData }) {
  return (
    <>
      <div className={styles.stats}>
        {dashboardData.overview.cards.map((card) => (
          <KpiCard key={card.key} card={card} />
        ))}
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.panel}>
          <h2>Pipeline summary</h2>
          <div className={styles.miniStats}>
            <div>
              <strong>{formatNumber(dashboardData.pipeline.summary.totalLeads)}</strong>
              <span>Leads créés</span>
            </div>
            <div>
              <strong>{formatNumber(dashboardData.pipeline.summary.qualifiedLeads)}</strong>
              <span>Qualifiés ou plus</span>
            </div>
            <div>
              <strong>{formatHours(dashboardData.pipeline.summary.avgHoursToQualify)}</strong>
              <span>Temps moyen qualification</span>
            </div>
            <div>
              <strong>{formatHours(dashboardData.pipeline.summary.avgHoursToClose)}</strong>
              <span>Temps moyen clôture</span>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <h2>Funnel cohort</h2>
          <p className={styles.inlineNote}>{dashboardData.pipeline.notes.funnelBasis}</p>
          <div className={styles.funnelList}>
            {dashboardData.pipeline.funnel.map((item) => (
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
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={`${styles.panel} ${styles.panelWide}`}>
          <h2>Tendance des leads créés</h2>
          <MultiSeriesTrendChart
            points={dashboardData.pipeline.createdTrend}
            series={[{ key: 'created', label: 'Créés', color: 'var(--ac-primary)' }]}
            ariaLabel="Tendance des leads créés"
          />
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <BreakdownList title="Sources" items={dashboardData.pipeline.breakdowns.source} />
        <BreakdownList title="Mediums" items={dashboardData.pipeline.breakdowns.medium} />
        <BreakdownList title="Campagnes" items={dashboardData.pipeline.breakdowns.campaign} />
        <BreakdownList
          title="Services (mentions multi-services)"
          items={dashboardData.pipeline.breakdowns.serviceMentions}
          note={dashboardData.pipeline.notes.serviceBreakdownMode}
        />
      </div>
      <div className={styles.dashboardGrid}>
        <BreakdownList
          title="Service principal"
          items={dashboardData.pipeline.breakdowns.primaryService}
          note={dashboardData.pipeline.notes.primaryServiceMode}
        />
        <BreakdownList title="Type de lead" items={dashboardData.pipeline.breakdowns.kind} />
      </div>
    </>
  );
}

function AcquisitionSection({ dashboardData }) {
  const acquisitionCards = [
    { key: 'sessions', label: 'Sessions', value: dashboardData.acquisition.totals.sessions, type: 'number', meta: 'GA4 snapshots' },
    { key: 'clicks', label: 'Clicks', value: dashboardData.acquisition.totals.clicks, type: 'number', meta: 'GSC + paid/social' },
    { key: 'impressions', label: 'Impressions', value: dashboardData.acquisition.totals.impressions, type: 'number' },
    { key: 'spend', label: 'Spend', value: dashboardData.acquisition.totals.spend, type: 'currency' },
    { key: 'cpl', label: 'CPL', value: dashboardData.acquisition.totals.costPerLead, type: 'currency', meta: 'Spend / leads créés' },
    { key: 'cpa', label: 'CPA', value: dashboardData.acquisition.totals.costPerAcquisition, type: 'currency', meta: 'Spend / gains cohorte' }
  ];

  return (
    <>
      <div className={styles.stats}>
        {acquisitionCards.map((card) => (
          <KpiCard key={card.key} card={card} />
        ))}
      </div>

      <div className={styles.dashboardGrid}>
        <MetricListPanel
          title="Top sources"
          note={dashboardData.acquisition.notes.externalMetricBasis}
          rows={dashboardData.acquisition.sources}
          emptyText="Aucune source disponible."
          renderRow={(row) => (
            <div key={row.key} className={styles.metricRow}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.qualifiedLeads} qualifiés, {row.wonLeads} gagnés</span>
              </div>
              <MetricBadges items={[
                { label: 'Sessions', value: formatNumber(row.sessions) },
                { label: 'Clicks', value: formatNumber(row.clicks) },
                { label: 'Spend', value: formatCurrency(row.spend) },
                { label: 'CPL', value: row.costPerLead === null ? 'N/A' : formatCurrency(row.costPerLead) }
              ]} />
            </div>
          )}
        />

        <MetricListPanel
          title="Top campagnes"
          note={dashboardData.acquisition.notes.leadBasis}
          rows={dashboardData.acquisition.campaigns}
          emptyText="Aucune campagne disponible."
          renderRow={(row) => (
            <div key={row.key} className={styles.metricRow}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.leads} leads, {row.qualifiedLeads} qualifiés, {row.wonLeads} gagnés</span>
              </div>
              <MetricBadges items={[
                { label: 'Clicks', value: formatNumber(row.clicks) },
                { label: 'CTR', value: formatPercent(row.ctr) },
                { label: 'Spend', value: formatCurrency(row.spend) },
                { label: 'CPA', value: row.costPerAcquisition === null ? 'N/A' : formatCurrency(row.costPerAcquisition) }
              ]} />
            </div>
          )}
        />
      </div>
    </>
  );
}

function SeoSection({ dashboardData }) {
  const seoCards = [
    { key: 'pages', label: 'Landing pages suivies', value: dashboardData.seoContent.totals.landingPagesTracked, type: 'number' },
    { key: 'clicks', label: 'Clicks organiques', value: dashboardData.seoContent.totals.clicks, type: 'number' },
    { key: 'impressions', label: 'Impressions organiques', value: dashboardData.seoContent.totals.impressions, type: 'number' },
    { key: 'ctr', label: 'CTR organique', value: dashboardData.seoContent.totals.ctr, type: 'percent' },
    { key: 'leadRate', label: 'Lead rate', value: dashboardData.seoContent.totals.leadRate, type: 'percent', meta: dashboardData.seoContent.notes.leadRateDefinition },
    { key: 'qualifiedLeads', label: 'Qualifiés', value: dashboardData.seoContent.totals.qualifiedLeads, type: 'number' }
  ];

  return (
    <>
      <div className={styles.stats}>
        {seoCards.map((card) => (
          <KpiCard key={card.key} card={card} />
        ))}
      </div>

      <MetricListPanel
        title="Landing pages"
        note={`${dashboardData.seoContent.notes.organicDefinition}. ${dashboardData.seoContent.notes.leadRateDefinition}.`}
        rows={dashboardData.seoContent.landingPages}
        emptyText="Aucune landing page disponible."
        renderRow={(row) => (
          <div key={row.key} className={styles.metricRow}>
            <div>
              <strong>{row.label}</strong>
              <span>{row.qualifiedLeads} qualifiés, {row.wonLeads} gagnés</span>
            </div>
            <MetricBadges items={[
              { label: 'Sessions', value: formatNumber(row.sessions) },
              { label: 'Clicks', value: formatNumber(row.clicks) },
              { label: 'CTR', value: formatPercent(row.ctr) },
              { label: 'Lead rate', value: formatPercent(row.leadRate) }
            ]} />
          </div>
        )}
      />
    </>
  );
}

function OperationsSection({ dashboardData }) {
  return (
    <>
      <div className={styles.dashboardGrid}>
        <div className={`${styles.panel} ${styles.panelWide}`}>
          <h2>Lifecycle trend</h2>
          <MultiSeriesTrendChart
            points={dashboardData.operations.lifecycleTrend}
            series={[
              { key: 'created', label: 'Créés', color: 'var(--ac-primary)' },
              { key: 'qualified', label: 'Qualifiés', color: '#74b9ff' },
              { key: 'won', label: 'Gagnés', color: '#7ee787' },
              { key: 'lost', label: 'Perdus', color: '#ff8a8a' }
            ]}
            ariaLabel="Tendance lifecycle"
          />
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <LeadSummaryList
          title={`Queue à relancer > ${dashboardData.operations.staleLeadHours}h`}
          leads={dashboardData.operations.staleQueue.leads}
          emptyText="Aucun lead ouvert en retard."
        />
        <LeadSummaryList
          title="Dernières soumissions"
          leads={dashboardData.operations.latestSubmitted}
          emptyText="Aucune soumission récente."
        />
      </div>

      <AuditFeed
        title={dashboardData.operations.recentActivityLabel}
        events={dashboardData.operations.auditEvents}
      />
    </>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, error: authError, signOut } = useAdminAuth();
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
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
          <h1>Administration - Growth Dashboard</h1>
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

            <HealthGrid dataHealth={dashboardData.dataHealth} />
            <SectionTabs activeSection={activeSection} onChange={setActiveSection} />

            {activeSection === 'overview' && <OverviewSection dashboardData={dashboardData} />}
            {activeSection === 'acquisition' && <AcquisitionSection dashboardData={dashboardData} />}
            {activeSection === 'seo' && <SeoSection dashboardData={dashboardData} />}
            {activeSection === 'operations' && <OperationsSection dashboardData={dashboardData} />}
          </>
        )}
      </div>
    </>
  );
}
