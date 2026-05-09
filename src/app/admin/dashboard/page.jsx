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
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'acquisition', label: 'Acquisition' },
  { key: 'seo', label: 'SEO & Content' },
  { key: 'operations', label: 'Operations' }
];

const FILTER_LABELS = {
  businessLine: 'Business line',
  service: 'Service',
  sourceClass: 'Source class',
  device: 'SEO device',
  pageType: 'Page type'
};

const DEFAULT_FILTER_OPTIONS = {
  businessLine: [],
  service: [],
  sourceClass: [],
  device: [
    { value: 'desktop', label: 'Desktop' },
    { value: 'mobile', label: 'Mobile' }
  ],
  pageType: []
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

function buildInitialDashboardQuery() {
  return {
    ...getDefaultRange(),
    businessLine: '',
    service: '',
    sourceClass: '',
    device: '',
    pageType: ''
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

function formatPosition(value) {
  if (value === null || value === undefined) {
    return 'Non classé';
  }

  return `#${Number(value).toLocaleString('fr-FR', {
    maximumFractionDigits: 1
  })}`;
}

function formatPositionChange(value) {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (value === 0) {
    return 'Stable';
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} places`;
}

function hasReferencePosition(reference = {}) {
  return reference.position !== null && reference.position !== undefined;
}

function formatLiveSnapshotValue(deviceRow) {
  if (!deviceRow || !deviceRow.trackedSnapshots) {
    return 'Aucun snapshot';
  }

  return formatPosition(deviceRow.latestPosition);
}

function formatKeywordDeviceValue(deviceRow, reference = {}, useReferenceFallback = false) {
  if (deviceRow?.trackedSnapshots) {
    return formatPosition(deviceRow.latestPosition);
  }

  if (useReferenceFallback && hasReferencePosition(reference)) {
    return `Réf. ${formatPosition(reference.position)}`;
  }

  return 'Non classé';
}

function formatReferenceSummary(reference = {}) {
  if (!hasReferencePosition(reference)) {
    return 'Réf. importée: non classée';
  }

  const updatedAt = reference.lastUpdated
    ? ` au ${formatDateShort(reference.lastUpdated)}`
    : '';

  return `Réf. importée: ${formatPosition(reference.position)}${updatedAt}`;
}

function formatKeywordDeviceSummary(label, deviceRow, reference = {}, useReferenceFallback = false) {
  if (deviceRow?.trackedSnapshots) {
    return `${label}: ${formatPosition(deviceRow.latestPosition)}`;
  }

  if (useReferenceFallback && hasReferencePosition(reference)) {
    return `${label}: réf. ${formatPosition(reference.position)}`;
  }

  return `${label}: non classé`;
}

function formatKeywordSourceSummary(row, useReferenceFallback = false) {
  if (useReferenceFallback && hasReferencePosition(row.reference)) {
    const updatedAt = row.reference.lastUpdated
      ? ` au ${formatDateShort(row.reference.lastUpdated)}`
      : '';

    return `Source: référence importée${updatedAt}`;
  }

  if (hasReferencePosition(row.reference)) {
    return formatReferenceSummary(row.reference);
  }

  return 'Réf. importée: non classée';
}

function formatKeywordSourceValue(row, useReferenceFallback = false) {
  if (row.hasLiveSnapshots) {
    return hasReferencePosition(row.reference) ? 'Live + réf.' : 'Live SERP';
  }

  if (useReferenceFallback && hasReferencePosition(row.reference)) {
    return row.reference.lastUpdated
      ? `Catalogue ${formatDateShort(row.reference.lastUpdated)}`
      : 'Catalogue';
  }

  if (hasReferencePosition(row.reference)) {
    return 'Réf. importée';
  }

  return 'Aucune position';
}

function formatTagList(tags = []) {
  return tags.filter(Boolean).join(' · ');
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

  if (type === 'position') {
    return formatPosition(value);
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
  const infoTitle = [
    card.canonicalLabel,
    card.owner ? `Owner: ${card.owner}` : null,
    card.decisionIntent ? `Decision: ${card.decisionIntent}` : null
  ].filter(Boolean).join(' | ');

  return (
    <div className={styles.statCard} title={infoTitle || undefined}>
      <h3>{formatMetricValue(card.value, card.type)}</h3>
      <p>{card.label}</p>
      {card.meta && <span className={styles.statMeta}>{card.meta}</span>}
      {formatDelta(card.delta, card.type) && (
        <span className={styles.statDelta}>{formatDelta(card.delta, card.type)}</span>
      )}
      {card.warning && (
        <span className={`${styles.statWarning} ${styles[`statWarning_${card.warning.level}`] || ''}`}>
          {card.warning.message}
        </span>
      )}
    </div>
  );
}

function MultiSeriesTrendChart({
  points = [],
  series = [],
  ariaLabel,
  mode = 'count',
  emptyText = 'Aucune donnée à afficher.'
}) {
  const isPositionChart = mode === 'position';
  const getPointValue = (point, seriesKey) => {
    const value = point[seriesKey];

    if (isPositionChart) {
      return Number.isFinite(value) ? value : null;
    }

    return Number.isFinite(value) ? value : 0;
  };
  const values = points
    .flatMap((point) => series.map((item) => getPointValue(point, item.key)))
    .filter((value) => value !== null);

  if (!points.length || !series.length || values.length === 0) {
    return <p className={styles.mutedText}>{emptyText}</p>;
  }

  const width = 720;
  const height = 220;
  const padding = 20;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  const minValue = isPositionChart ? Math.min(...values) : 0;
  const maxValue = Math.max(...values, isPositionChart ? minValue : 1);
  const valueRange = Math.max(maxValue - minValue, isPositionChart ? 1 : maxValue);
  const step = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;
  const getYCoordinate = (value) => {
    if (value === null) {
      return null;
    }

    if (isPositionChart) {
      return padding + (((value - minValue) / valueRange) * chartHeight);
    }

    return padding + chartHeight - ((value / valueRange) * chartHeight);
  };

  const buildPolyline = (seriesKey) => points.map((point, index) => {
    const value = getPointValue(point, seriesKey);
    const y = getYCoordinate(value);

    if (y === null) {
      return null;
    }

    const x = padding + (index * step);
    return `${x},${y}`;
  }).filter(Boolean).join(' ');

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
                const value = getPointValue(point, item.key);
                const y = getYCoordinate(value);

                if (y === null) {
                  return null;
                }

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

function PositionTrendPanel({
  points = [],
  series = [],
  ariaLabel,
  emptyText = 'Aucune position classée sur cette période.',
  singlePointText = 'Historique insuffisant: il faut au moins 2 snapshots SERP classés sur des dates différentes.'
}) {
  if (!points.length) {
    return <p className={styles.mutedText}>{emptyText}</p>;
  }

  if (points.length < 2) {
    return <p className={styles.mutedText}>{singlePointText}</p>;
  }

  return (
    <MultiSeriesTrendChart
      points={points}
      series={series}
      ariaLabel={ariaLabel}
      mode="position"
    />
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
              {item.metadata?.deviceRowCounts && (
                <span>
                  Devices: D {formatNumber(item.metadata.deviceRowCounts.desktop || 0)} / M {formatNumber(item.metadata.deviceRowCounts.mobile || 0)}
                </span>
              )}
            </div>
            <p className={styles.inlineNote}>{item.message || 'Aucun message.'}</p>
            {item.lastError && <p className={styles.healthError}>{item.lastError}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveSummary({ executiveSummary, filters }) {
  const cards = [
    executiveSummary.trend,
    executiveSummary.risk,
    executiveSummary.opportunity,
    executiveSummary.nextAction
  ].filter(Boolean);
  const activeFilters = filters?.active || [];

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Executive summary</h2>
          <p className={styles.inlineNote}>
            {filters?.segmentLabel || 'All traffic and lead cohorts'}
            {filters?.seoDeviceLabel ? ` · SEO device: ${filters.seoDeviceLabel}` : ''}
          </p>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className={styles.filterChips}>
          {activeFilters.map((item) => (
            <span key={item.key} className={styles.filterChip}>
              <strong>{item.label}</strong> {item.value}
            </span>
          ))}
        </div>
      )}

      {(executiveSummary.notes || []).map((note) => (
        <p key={note} className={styles.inlineNote}>
          {note}
        </p>
      ))}

      <div className={styles.executiveGrid}>
        {cards.map((card) => (
          <div
            key={card.key}
            className={`${styles.executiveCard} ${styles[`executiveCard_${card.tone}`] || ''}`}
          >
            <span className={styles.executiveEyebrow}>{card.title}</span>
            <strong className={styles.executiveHeadline}>{card.headline}</strong>
            <p className={styles.executiveDetail}>{card.detail}</p>
            {card.owner && <span className={styles.executiveOwner}>Owner: {card.owner}</span>}
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

function LeadSummaryList({ title, leads = [], emptyText, note }) {
  return (
    <div className={styles.panel}>
      <h2>{title}</h2>
      {note && <p className={styles.inlineNote}>{note}</p>}
      {leads.length === 0 ? (
        <p className={styles.mutedText}>{emptyText}</p>
      ) : (
        <div className={styles.compactList}>
          {leads.map((lead) => {
            const fallbackOpsMeta = [
              lead.leadQualityLabel || null,
              lead.leadOwner ? `Owner: ${lead.leadOwner}` : null,
              lead.followUpSlaAt ? `SLA: ${formatDateTime(lead.followUpSlaAt)}` : null
            ].filter(Boolean).join(' • ');

            return (
              <Link
                key={`${lead.kind}-${lead.id}`}
                href={lead.drilldownHref || (lead.kind === 'devis' ? `/admin/devis?lead=${lead.id}` : `/admin/conventions?lead=${lead.id}`)}
                className={styles.compactItem}
              >
                <div>
                  <strong>{lead.kindLabel} - {lead.serviceLabel}</strong>
                  <span>{lead.metaLinePrimary || `${lead.source} / ${lead.medium}`}</span>
                  <span>{lead.metaLineSecondary || lead.landingPage}</span>
                  {(lead.metaLineTertiary || fallbackOpsMeta) && <small>{lead.metaLineTertiary || fallbackOpsMeta}</small>}
                </div>
                <div className={styles.compactMeta}>
                  <span className={`${styles.statusBadge} ${styles[`status_${lead.status}`]}`}>
                    {lead.statusLabel}
                  </span>
                  <small>{lead.metaDateTime ? formatDateTime(lead.metaDateTime) : formatHours(lead.ageHours)}</small>
                </div>
              </Link>
            );
          })}
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
          <h2>Filtered cohort</h2>
          <div className={styles.miniStats}>
            <div>
              <strong>{formatNumber(dashboardData.overview.cohort.currentLeads)}</strong>
              <span>Leads créés</span>
            </div>
            <div>
              <strong>{formatNumber(dashboardData.overview.cohort.qualifiedReached)}</strong>
              <span>Qualifiés ou plus</span>
            </div>
            <div>
              <strong>{formatNumber(dashboardData.overview.cohort.won)}</strong>
              <span>Gagnés</span>
            </div>
            <div>
              <strong>{formatNumber(dashboardData.overview.cohort.unattributed)}</strong>
              <span>Non attribués</span>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <h2>Segment context</h2>
          <p className={styles.inlineNote}>
            {dashboardData.filters.segmentLabel}
            {dashboardData.filters.seoDeviceLabel ? ` · SEO device: ${dashboardData.filters.seoDeviceLabel}` : ''}
          </p>
          <div className={styles.metricBadges}>
            {(dashboardData.filters.active || []).length === 0 ? (
              <span className={styles.metricBadge}>
                <strong>Scope</strong> All traffic and lead cohorts
              </span>
            ) : (
              dashboardData.filters.active.map((item) => (
                <span key={item.key} className={styles.metricBadge}>
                  <strong>{item.label}</strong> {item.value}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <BreakdownList title="Business lines" items={dashboardData.pipeline.breakdowns.businessLine} />
        <BreakdownList title="Source classes" items={dashboardData.pipeline.breakdowns.sourceClass} />
        <BreakdownList title="Page types" items={dashboardData.pipeline.breakdowns.pageType} />
      </div>
    </>
  );
}

function PipelineSection({ dashboardData }) {
  return (
    <>
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
        <div className={styles.panel}>
          <h2>Funnel diagnostics</h2>
          <p className={styles.inlineNote}>{dashboardData.funnelDiagnostics.notes.basis}</p>
          <p className={styles.mutedText}>{dashboardData.funnelDiagnostics.notes.coverage}</p>
          <div className={styles.miniStats}>
            <div>
              <strong>{formatNumber(dashboardData.funnelDiagnostics.summary.createdLeads)}</strong>
              <span>Créés</span>
            </div>
            <div>
              <strong>{formatNumber(dashboardData.funnelDiagnostics.summary.qualifiedLeads)}</strong>
              <span>Qualifiés</span>
            </div>
            <div>
              <strong>{formatNumber(dashboardData.funnelDiagnostics.summary.wonLeads)}</strong>
              <span>Gagnés</span>
            </div>
            <div>
              <strong>{formatHours(dashboardData.funnelDiagnostics.summary.avgHoursToQualify)}</strong>
              <span>Temps moyen qualification</span>
            </div>
          </div>
        </div>

        <MetricListPanel
          title="Top drop-offs"
          note="Segments avec le plus de perte entre étapes lifecycle dans la cohorte filtrée."
          rows={dashboardData.funnelDiagnostics.topDropoffs}
          emptyText="Pas assez de volume pour isoler un drop-off dominant."
          renderRow={(row) => (
            <div key={row.key} className={styles.metricRow}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.stageLabel}</span>
                <span>{row.recommendation}</span>
              </div>
              <MetricBadges items={[
                { label: 'From', value: formatNumber(row.fromCount) },
                { label: 'To', value: formatNumber(row.toCount) },
                { label: 'Conv.', value: formatPercent(row.conversionRate) },
                { label: 'Drop-off', value: formatPercent(row.dropoffRate) }
              ]} />
            </div>
          )}
        />
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
  const acquisitionCards = dashboardData.acquisition.cards || [];
  const whatsappData = dashboardData.acquisition.whatsapp;
  const whatsappSourceUnavailable = dashboardData.diagnostics?.reportingWarnings?.includes('whatsapp_click_events_unavailable');

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

      <div className={styles.dashboardGrid}>
        <div className={styles.panel}>
          <h2>WhatsApp summary</h2>
          {whatsappSourceUnavailable && (
            <p className={styles.healthError}>
              Le tracking serveur des clics WhatsApp est actuellement indisponible. Les zéros affichés ici ne sont pas fiables tant que cette source n&apos;est pas rétablie.
            </p>
          )}
          <p className={styles.inlineNote}>{whatsappData.notes.clickBasis}</p>
          <div className={styles.miniStats}>
            <div>
              <strong>{formatNumber(whatsappData.summary.clicks)}</strong>
              <span>Clics</span>
            </div>
            <div>
              <strong>{formatNumber(whatsappData.summary.uniqueClickers)}</strong>
              <span>Navigateurs uniques</span>
            </div>
            <div>
              <strong>{formatNumber(whatsappData.summary.autoAttributedLeads)}</strong>
              <span>Leads auto-attribués</span>
            </div>
            <div>
              <strong>{formatNumber(whatsappData.summary.manualTaggedLeads)}</strong>
              <span>Leads taggés manuellement</span>
            </div>
            <div>
              <strong>{formatNumber(whatsappData.summary.totalAttributedLeads)}</strong>
              <span>Total leads WhatsApp</span>
            </div>
          </div>
          <p className={styles.mutedText}>{whatsappData.notes.autoMatchWindow}</p>
          <p className={styles.mutedText}>{whatsappData.notes.manualTagExplanation}</p>
        </div>

        <div className={styles.panel}>
          <h2>WhatsApp funnel</h2>
          <p className={styles.inlineNote}>{whatsappData.notes.funnelBasis}</p>
          <div className={styles.funnelList}>
            {whatsappData.funnel.map((item) => (
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
        <MetricListPanel
          title="Top touchpoints WhatsApp"
          note={whatsappData.notes.clickBasis}
          rows={whatsappData.touchpoints}
          emptyText="Aucun touchpoint WhatsApp disponible."
          renderRow={(row) => (
            <div key={row.key} className={styles.metricRow}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.pagePath}</span>
              </div>
              <MetricBadges items={[
                { label: 'Clicks', value: formatNumber(row.clicks) },
                { label: 'Uniques', value: formatNumber(row.uniqueClickers) },
                { label: 'Leads auto', value: formatNumber(row.autoAttributedLeads) }
              ]} />
            </div>
          )}
        />

        <LeadSummaryList
          title="Leads WhatsApp récents"
          note={whatsappData.notes.manualTagExplanation}
          leads={whatsappData.recentLeads}
          emptyText="Aucun lead WhatsApp sur la période."
        />
      </div>
    </>
  );
}

function SeoSection({ dashboardData }) {
  const keywordRankings = dashboardData.seoContent.keywordRankings;
  const usingReferenceFallback = keywordRankings.usingReferenceFallback;
  const latestReferenceMetricDate = keywordRankings.snapshotDiagnostics?.latestReferenceMetricDate;
  const referenceDateLabel = latestReferenceMetricDate ? formatDateShort(latestReferenceMetricDate) : '';
  const positionTrendNote = usingReferenceFallback
    ? `Position moyenne issue de la référence importée du catalogue actif${referenceDateLabel ? ` (maj ${referenceDateLabel})` : ''} tant que les snapshots live ne correspondent pas encore au catalogue courant.`
    : 'Position moyenne des mots-clés classés par snapshot SERP du catalogue actif. Plus le chiffre est bas, mieux c&apos;est.';
  const desktopDistributionNote = usingReferenceFallback
    ? `Répartition calculée à partir de la référence importée du catalogue actif${referenceDateLabel ? ` (maj ${referenceDateLabel})` : ''}.`
    : 'Répartition sur le dernier snapshot desktop disponible dans la période.';
  const mobileDistributionNote = usingReferenceFallback
    ? `Répartition calculée à partir de la référence importée du catalogue actif${referenceDateLabel ? ` (maj ${referenceDateLabel})` : ''}.`
    : 'Répartition sur le dernier snapshot mobile disponible dans la période.';
  const positionTrendEmptyText = usingReferenceFallback
    ? 'Aucune date de référence importée exploitable pour tracer une tendance sur le catalogue actif.'
    : 'Aucune position classée sur cette période.';
  const positionTrendSinglePointText = usingReferenceFallback
    ? `Une seule date de référence importée est disponible${referenceDateLabel ? ` (${referenceDateLabel})` : ''}. La tendance se remplira après les prochains snapshots live.`
    : 'Historique insuffisant: il faut au moins 2 snapshots SERP classés sur des dates différentes.';
  const seoCards = dashboardData.seoContent.cards || [];
  const keywordCards = dashboardData.seoContent.keywordCards || [];
  const seoQueryNotes = [
    dashboardData.seoQueries.notes.basis,
    dashboardData.seoQueries.notes.brandedDefinition,
    dashboardData.seoQueries.notes.deviceScope
  ].filter(Boolean);

  return (
    <>
      <div className={styles.stats}>
        {seoCards.map((card) => (
          <KpiCard key={card.key} card={card} />
        ))}
      </div>

      <div className={styles.stats}>
        {keywordCards.map((card) => (
          <KpiCard key={card.key} card={card} />
        ))}
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.panel}>
          <h2>SEO query intelligence</h2>
          {seoQueryNotes.map((note) => (
            <p key={note} className={styles.inlineNote}>{note}</p>
          ))}
          <div className={styles.miniStats}>
            <div>
              <strong>{formatNumber(dashboardData.seoQueries.summary.totalQueries)}</strong>
              <span>Queries</span>
            </div>
            <div>
              <strong>{formatNumber(dashboardData.seoQueries.summary.nonBrandedClicks)}</strong>
              <span>Clicks non-brand</span>
            </div>
            <div>
              <strong>{formatPercent(dashboardData.seoQueries.summary.nonBrandedClickShare)}</strong>
              <span>Part non-brand</span>
            </div>
            <div>
              <strong>{formatNumber(dashboardData.seoQueries.summary.cannibalizedQueryCount)}</strong>
              <span>Queries multi-pages</span>
            </div>
          </div>
        </div>

        <MetricListPanel
          title="Cluster rollup"
          note="Agrégation des requêtes par cluster/service pour repérer les poches de demande à traiter en priorité."
          rows={dashboardData.seoQueries.clusters}
          emptyText="Aucun cluster de requêtes disponible sur cette période."
          renderRow={(row) => (
            <div key={row.key} className={styles.metricRow}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.queryCount} queries • {row.landingPageCount} landing pages</span>
              </div>
              <MetricBadges items={[
                { label: 'Clicks', value: formatNumber(row.clicks) },
                { label: 'Non-brand', value: formatNumber(row.nonBrandedClicks) },
                { label: 'CTR', value: formatPercent(row.ctr) },
                { label: 'Pos.', value: formatPosition(row.position) }
              ]} />
            </div>
          )}
        />
      </div>

      <MetricListPanel
        title="Top non-branded query opportunities"
        note="Requêtes à forte demande et bon levier potentiel sur CTR, ranking window, ou clarification de page cible."
        rows={dashboardData.seoQueries.opportunities}
        emptyText="Aucune opportunité query claire sur cette période."
        renderRow={(row) => (
          <div key={row.key} className={styles.metricRow}>
            <div>
              <strong>{row.label}</strong>
              <span>{row.primaryLandingPage}</span>
              <span>{row.clusterLabel} • {row.landingPageCount} page{row.landingPageCount > 1 ? 's' : ''} cible{row.landingPageCount > 1 ? 's' : ''}</span>
            </div>
            <MetricBadges items={[
              { label: 'Clicks', value: formatNumber(row.clicks) },
              { label: 'Impr.', value: formatNumber(row.impressions) },
              { label: 'CTR', value: formatPercent(row.ctr) },
              { label: 'Pos.', value: formatPosition(row.position) },
              { label: 'Score', value: formatNumber(row.opportunityScore) }
            ]} />
          </div>
        )}
      />

      <MetricListPanel
        title="Content opportunities"
        note={`${dashboardData.contentOpportunities.notes.basis} ${dashboardData.contentOpportunities.notes.decayDefinition}`}
        rows={dashboardData.contentOpportunities.rows}
        emptyText="Aucune opportunité contenu prioritaire sur cette période."
        renderRow={(row) => (
          <div key={row.key} className={styles.metricRow}>
            <div>
              <strong>{row.label}</strong>
              <span>{row.typeLabel}</span>
              <span>{row.detail}</span>
              <span>{row.recommendation}</span>
            </div>
            <MetricBadges items={[
              { label: 'Impr.', value: row.impressions === undefined ? 'N/A' : formatNumber(row.impressions) },
              { label: 'Clicks', value: row.clicks === undefined ? 'N/A' : formatNumber(row.clicks) },
              { label: 'CTR', value: row.ctr === undefined ? 'N/A' : formatPercent(row.ctr) },
              { label: 'Lead rate', value: row.leadRate === undefined ? 'N/A' : formatPercent(row.leadRate) },
              { label: 'Score', value: formatNumber(row.priorityScore) }
            ]} />
          </div>
        )}
      />

      <MetricListPanel
        title="Landing page scorecard"
        note={`${dashboardData.landingPageScorecard.notes.basis} ${dashboardData.landingPageScorecard.notes.scoreDefinition}`}
        rows={dashboardData.landingPageScorecard.rows}
        emptyText="Aucune landing page scorée sur cette période."
        renderRow={(row) => (
          <div key={row.key} className={styles.metricRow}>
            <div>
              <strong>{row.label}</strong>
              <span>{row.businessLineLabel} • {row.pageTypeLabel} • {row.serviceLabel}</span>
              <span>{row.queryCount} queries • {row.dominantClusterLabel}</span>
            </div>
            <MetricBadges items={[
              { label: 'Sessions', value: formatNumber(row.sessions) },
              { label: 'Clicks', value: formatNumber(row.clicks) },
              { label: 'Qual.', value: formatNumber(row.qualifiedLeads) },
              { label: 'Lead rate', value: formatPercent(row.leadRate) },
              { label: 'Value', value: formatCurrency(row.revenueProxy) },
              { label: 'Score', value: formatNumber(row.opportunityScore) }
            ]} />
          </div>
        )}
      />

      <div className={styles.dashboardGrid}>
        <div className={`${styles.panel} ${styles.panelWide}`}>
          <h2>Tendance de visibilité des mots-clés</h2>
          <p className={styles.inlineNote}>
            {dashboardData.seoContent.notes.keywordTrendDefinition} Nombre de mots-clés classés et top 10 par snapshot SERP.
          </p>
          <MultiSeriesTrendChart
            points={keywordRankings.visibilityTrend}
            series={[
              { key: 'desktopRanked', label: 'Desktop classés', color: 'var(--ac-primary)' },
              { key: 'mobileRanked', label: 'Mobile classés', color: '#74b9ff' },
              { key: 'desktopTop10', label: 'Desktop top 10', color: '#7ee787' },
              { key: 'mobileTop10', label: 'Mobile top 10', color: '#ffb86b' }
            ]}
            ariaLabel="Tendance de visibilité des mots-clés"
          />
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={`${styles.panel} ${styles.panelWide}`}>
          <h2>Tendance de position moyenne</h2>
          <p className={styles.inlineNote}>{positionTrendNote}</p>
          <PositionTrendPanel
            points={keywordRankings.positionTrend}
            series={[
              { key: 'desktopAveragePosition', label: 'Desktop moyenne', color: 'var(--ac-primary)' },
              { key: 'mobileAveragePosition', label: 'Mobile moyenne', color: '#74b9ff' }
            ]}
            ariaLabel="Tendance de position moyenne des mots-clés"
            emptyText={positionTrendEmptyText}
            singlePointText={positionTrendSinglePointText}
          />
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <BreakdownList
          title="Visibilité desktop"
          items={keywordRankings.distributionByDevice.desktop}
          note={desktopDistributionNote}
        />
        <BreakdownList
          title="Visibilité mobile"
          items={keywordRankings.distributionByDevice.mobile}
          note={mobileDistributionNote}
        />
      </div>

      <MetricListPanel
        title="Keyword rankings"
        note={dashboardData.seoContent.notes.keywordRowDefinition}
        rows={keywordRankings.rows}
        emptyText="Aucun mot-clé suivi sur cette période."
        renderRow={(row) => {
          const useReferenceDisplay = (!row.hasLiveSnapshots && row.hasReferencePosition) || row.usesReferenceFallback;
          const bestDisplayPosition = row.currentBestPosition ?? (useReferenceDisplay ? row.reference.position : null);

          return (
            <div key={row.key} className={styles.metricRow}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.targetPath === '/' ? 'Site entier' : row.targetPath}</span>
                <span>{[
                  formatTagList(row.categoryTags),
                  row.priorityTags.length > 0 ? `Priorité: ${formatTagList(row.priorityTags)}` : '',
                  row.contentTypeTags.length > 0 ? formatTagList(row.contentTypeTags) : ''
                ].filter(Boolean).join(' • ') || 'Aucune métadonnée catalogue.'}</span>
                <span>{[
                  formatKeywordDeviceSummary('Desktop', row.desktop, row.reference, useReferenceDisplay),
                  formatKeywordDeviceSummary('Mobile', row.mobile, row.reference, useReferenceDisplay),
                  formatKeywordSourceSummary(row, useReferenceDisplay)
                ].join(' • ')}</span>
              </div>
              <MetricBadges items={[
                { label: 'Desktop', value: formatKeywordDeviceValue(row.desktop, row.reference, useReferenceDisplay) },
                { label: 'D delta', value: formatPositionChange(row.desktop.positionChange) },
                { label: 'Mobile', value: formatKeywordDeviceValue(row.mobile, row.reference, useReferenceDisplay) },
                { label: 'M delta', value: formatPositionChange(row.mobile.positionChange) },
                { label: 'Best', value: formatPosition(bestDisplayPosition) },
                { label: 'Source', value: formatKeywordSourceValue(row, useReferenceDisplay) }
              ]} />
            </div>
          );
        }}
      />

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
          note="Basé sur le dernier moment travaillé (`last_worked_at`) lorsqu’il est disponible, sinon sur le dernier jalon lifecycle."
          leads={dashboardData.operations.staleQueue.leads}
          emptyText="Aucun lead ouvert en retard."
        />
        <LeadSummaryList
          title="SLA de suivi dépassé"
          note={`${dashboardData.operations.slaBreaches.count} lead${dashboardData.operations.slaBreaches.count > 1 ? 's' : ''} ouvert${dashboardData.operations.slaBreaches.count > 1 ? 's' : ''} au-delà de la date SLA.`}
          leads={dashboardData.operations.slaBreaches.leads}
          emptyText="Aucun lead ouvert au-delà de la SLA."
        />
      </div>

      <div className={styles.dashboardGrid}>
        <BreakdownList
          title="Qualité des leads ouverts"
          note={`${dashboardData.operations.leadQuality.note} ${dashboardData.operations.openLeadCount > 0 ? `${dashboardData.operations.leadQuality.reviewedCount}/${dashboardData.operations.openLeadCount} revus • ${dashboardData.operations.leadQuality.ownerAssignedCount}/${dashboardData.operations.openLeadCount} assignés` : 'Aucun lead ouvert à répartir.'}`}
          items={dashboardData.operations.leadQuality.breakdown}
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
  const initialDashboardQuery = useMemo(() => buildInitialDashboardQuery(), []);
  const [dashboardQuery, setDashboardQuery] = useState(initialDashboardQuery);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async (query) => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminDashboardData(query);
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
      router.replace('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchDashboard(initialDashboardQuery);
    }
  }, [user, isAdmin, authLoading, fetchDashboard, initialDashboardQuery]);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/admin/login');
    }
  };

  const updateDashboardQuery = (key, value) => {
    setDashboardQuery((currentQuery) => ({
      ...currentQuery,
      [key]: value
    }));
  };

  const availableFilterOptions = dashboardData?.filters?.options || DEFAULT_FILTER_OPTIONS;

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

  return (
    <>
      <HeroHeader title="Administration - Dashboard" />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Administration - Growth Dashboard</h1>
          <div className={styles.headerActions}>
            <button onClick={() => fetchDashboard(dashboardQuery)} className={styles.refreshButton}>
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
              value={dashboardQuery.from}
              onChange={(event) => updateDashboardQuery('from', event.target.value)}
            />
          </div>
          <div className={styles.filterField}>
            <label htmlFor="dashboard-to">Fin</label>
            <input
              id="dashboard-to"
              type="date"
              value={dashboardQuery.to}
              onChange={(event) => updateDashboardQuery('to', event.target.value)}
            />
          </div>
          {Object.entries(FILTER_LABELS).map(([key, label]) => (
            <div key={key} className={styles.filterField}>
              <label htmlFor={`dashboard-filter-${key}`}>{label}</label>
              <select
                id={`dashboard-filter-${key}`}
                value={dashboardQuery[key]}
                onChange={(event) => updateDashboardQuery(key, event.target.value)}
              >
                <option value="">All</option>
                {(availableFilterOptions[key] || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button onClick={() => fetchDashboard(dashboardQuery)} className={styles.clearFiltersButton}>
            Appliquer
          </button>
        </div>

        {loading && <div className={styles.loading}>Chargement des KPI...</div>}
        {error && (
          <div>
            <div className={styles.error}>{error}</div>
            <button onClick={() => fetchDashboard(dashboardQuery)} className={styles.refreshButton}>
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && dashboardData && (
          <>
            <div className={styles.resultsMeta}>
              Période: {dashboardData.range.from} au {dashboardData.range.to} - {dashboardData.range.days} jours
              {' · '}
              Segment: {dashboardData.filters.segmentLabel}
              {dashboardData.filters.seoDeviceLabel ? ` · SEO device: ${dashboardData.filters.seoDeviceLabel}` : ''}
            </div>

            <ExecutiveSummary executiveSummary={dashboardData.executiveSummary} filters={dashboardData.filters} />
            <HealthGrid dataHealth={dashboardData.dataHealth} />
            <SectionTabs activeSection={activeSection} onChange={setActiveSection} />

            {activeSection === 'overview' && <OverviewSection dashboardData={dashboardData} />}
            {activeSection === 'pipeline' && <PipelineSection dashboardData={dashboardData} />}
            {activeSection === 'acquisition' && <AcquisitionSection dashboardData={dashboardData} />}
            {activeSection === 'seo' && <SeoSection dashboardData={dashboardData} />}
            {activeSection === 'operations' && <OperationsSection dashboardData={dashboardData} />}
          </>
        )}
      </div>
    </>
  );
}
