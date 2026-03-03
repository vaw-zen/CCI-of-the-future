'use client';

import React from 'react';
import Link from 'next/link';
import styles from './otherServices.module.css';
import { trackCTAClick } from '@/utils/analytics';

const ALL_SERVICES = [
  { slug: 'tapis', label: 'Nettoyage Tapis & Moquettes', icon: '🧶', href: '/tapis' },
  { slug: 'salon', label: 'Nettoyage Salon & Canapé', icon: '🛋️', href: '/salon' },
  { slug: 'marbre', label: 'Restauration Marbre', icon: '💎', href: '/marbre' },
  { slug: 'tapisserie', label: 'Tapisserie Sur Mesure', icon: '🪑', href: '/tapisserie' },
  { slug: 'tfc', label: 'Nettoyage Fin de Chantier', icon: '🏗️', href: '/tfc' },
  { slug: 'entreprises', label: 'Conventions Entreprises', icon: '🏢', href: '/entreprises' },
];

/**
 * Cross-linking component for SEO internal linking.
 * Renders a grid of links to other services, excluding the current one.
 *
 * @param {string} currentSlug - The slug of the current service page (e.g. "salon")
 */
export default function OtherServices({ currentSlug }) {
  const links = ALL_SERVICES.filter((s) => s.slug !== currentSlug);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Nos Autres Services</h2>
      <p className={styles.subtitle}>Découvrez toute notre gamme de services professionnels</p>
      <div className={styles.grid}>
        {links.map((service) => (
          <Link
            key={service.slug}
            href={service.href}
            className={styles.card}
            onClick={() =>
              trackCTAClick(service.label, `cross_link_${currentSlug}`, service.href, 1)
            }
          >
            <span className={styles.icon}>{service.icon}</span>
            <span className={styles.label}>{service.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
