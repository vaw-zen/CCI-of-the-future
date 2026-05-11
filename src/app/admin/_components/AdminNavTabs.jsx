'use client';

import Link from 'next/link';
import styles from '@/app/admin/devis/admin.module.css';

const ADMIN_TABS = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin/dashboard' },
  { key: 'devis', label: 'Devis', href: '/admin/devis' },
  { key: 'conventions', label: 'Conventions', href: '/admin/conventions' },
  { key: 'whatsapp', label: 'WhatsApp', href: '/admin/whatsapp' }
];

export default function AdminNavTabs({ active = 'dashboard' }) {
  return (
    <div className={styles.navTabs}>
      {ADMIN_TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`${styles.navLink} ${active === tab.key ? styles.navLinkActive : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
