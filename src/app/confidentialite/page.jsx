import Link from 'next/link';
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader';
import CookiePreferencesCard from './components/CookiePreferencesCard/CookiePreferencesCard';
import content from './confidentialite.json';
import styles from './page.module.css';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/confidentialite`
    },
    openGraph: {
      title: content.metadata.title,
      description: content.metadata.description,
      url: `${SITE_URL}/confidentialite`,
      type: 'website'
    },
    twitter: {
      title: content.metadata.title,
      description: content.metadata.description
    }
  };
}

export default function ConfidentialitePage() {
  return (
    <main className={styles.page}>
      <HeroHeader title={content.heroTitle} bgAlt="Politique de confidentialité et cookies CCI Services" />

      <section className={styles.section}>
        <div className={styles.introBlock}>
          <p className={styles.eyebrow}>{content.intro.eyebrow}</p>
          <h2 className={styles.title}>{content.intro.title}</h2>
          <p className={styles.description}>{content.intro.description}</p>
          <p className={styles.updatedAt}>Dernière mise à jour: {content.updatedAt}</p>
        </div>

        <div className={styles.summaryGrid}>
          {content.summaryCards.map((card) => (
            <article key={card.title} className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>{card.title}</h3>
              <p className={styles.summaryText}>{card.description}</p>
            </article>
          ))}
        </div>

        <div className={styles.contentGrid}>
          <nav className={styles.sideNav} aria-label="Navigation de la politique de confidentialité">
            {content.sections.map((section) => (
              <Link key={section.id} href={`#${section.id}`} className={styles.sideNavLink}>
                {section.title}
              </Link>
            ))}
          </nav>

          <div className={styles.sections}>
            {content.sections.map((section) => (
              <article key={section.id} id={section.id} className={styles.sectionCard}>
                <p className={styles.sectionEyebrow}>{section.eyebrow}</p>
                <h3 className={styles.sectionTitle}>{section.title}</h3>

                {section.paragraphs?.map((paragraph, index) => (
                  <p key={`${section.id}-paragraph-${index}`} className={styles.sectionText}>
                    {paragraph}
                  </p>
                ))}

                {section.listTitle && <p className={styles.listTitle}>{section.listTitle}</p>}

                {section.items?.length ? (
                  <ul className={styles.sectionList}>
                    {section.items.map((item) => (
                      <li key={item} className={styles.sectionItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.id === 'gerer-mes-cookies' ? <CookiePreferencesCard /> : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
