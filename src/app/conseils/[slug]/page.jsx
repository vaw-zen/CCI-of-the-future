import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticles } from '../data/articles';
import styles from './article.module.css';
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader';

// Générer les métadonnées pour chaque article
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);
  
  if (!article) {
    return {
      title: 'Article non trouvé',
      description: 'Cet article n\'existe pas.'
    };
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: article.keywords.join(', '),
    authors: [{ name: article.author }],
    publishedTime: article.publishedDate,
    modifiedTime: article.updatedDate,
    alternates: {
      canonical: `${SITE_URL}/conseils/${resolvedParams.slug}`
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `${SITE_URL}/conseils/${resolvedParams.slug}`,
      siteName: 'CCI Services Tunis',
      images: [
        {
          url: `${SITE_URL}${article.image}`,
          width: 1200,
          height: 630,
          alt: article.imageAlt || article.title,
        },
      ],
      locale: 'fr_TN',
      type: 'article',
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
      authors: ['CCI Services'],
      section: 'Conseils Nettoyage',
      tags: article.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [`${SITE_URL}${article.image}`],
    },
  };
}

// Générer les pages statiques pour tous les articles
export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // Générer le schema Article pour SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription,
    "image": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}${article.image}`,
    "datePublished": article.publishedDate,
    "dateModified": article.updatedDate,
    "author": {
      "@type": "Organization",
      "name": "CCI Services",
      "url": "https://cciservices.online"
    },
    "publisher": {
      "@type": "LocalBusiness",
      "name": "CCI Services",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cciservices.online/logo.png"
      },
      "telephone": "+216-98-557-766",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "06 Rue Galant de nuit",
        "addressLocality": "L'Aouina",
        "addressRegion": "Tunis",
        "postalCode": "2045",
        "addressCountry": "TN"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://cciservices.online/conseils/${resolvedParams.slug}`
    },
    "keywords": article.keywords.join(', '),
    "wordCount": article.content.replace(/<[^>]*>/g, '').split(' ').length,
    "inLanguage": "fr-TN",
    "about": [
      {
        "@type": "Service",
        "name": "Nettoyage Tapis et Moquettes",
        "provider": {
          "@type": "LocalBusiness",
          "name": "CCI Services"
        }
      }
    ]
  };

  // Générer le breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://cciservices.online"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Conseils",
        "item": "https://cciservices.online/conseils"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://cciservices.online/conseils/${resolvedParams.slug}`
      }
    ]
  };

  // FAQ Schema si l'article contient des FAQs
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Combien de temps pour nettoyer un tapis de salon ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Entre 30 minutes et 2 heures selon la taille et l'état. Un tapis standard 2x3m prend environ 45 minutes avec notre méthode injection-extraction."
        }
      },
      {
        "@type": "Question",
        "name": "Le tapis sèche en combien de temps ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Moins d'1 heure avec notre méthode injection-extraction professionnelle, contre 6-12h avec les méthodes traditionnelles."
        }
      },
      {
        "@type": "Question",
        "name": "Intervenez-vous le week-end ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, nous travaillons le samedi de 8h à 13h. Interventions d'urgence possibles le dimanche avec supplément de 50 DT."
        }
      },
      {
        "@type": "Question",
        "name": "Faut-il vider la pièce avant le nettoyage ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Non, nous déplaçons les meubles légers. Pour les gros meubles, nous nettoyons autour et vous pouvez les déplacer après séchage."
        }
      }
    ]
  };

  // Trouver les articles précédent et suivant
  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex(a => a.slug === resolvedParams.slug);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  return (
    <main className={styles.main}>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

        <HeroHeader sty title={article.categoryLabel} />
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <Link href="/">Accueil</Link>
          <span>›</span>
          <Link href="/conseils">Conseils</Link>
          <span>›</span>
          <span>{article.categoryLabel}</span>
          <span>›</span>
          <span>{article.title}</span>
        </nav>

        {/* Header de l'article */}
        <header className={styles.articleHeader}>
          <span className={styles.category}>{article.categoryLabel}</span>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.excerpt}>{article.excerpt}</p>
          
          <div className={styles.meta}>
            <span>👤 {article.author}</span>
            <span>📅 {new Date(article.publishedDate).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>⏱️ {article.readTime}</span>
            <span>🏷️ {article.keywords.slice(0, 2).join(', ')}</span>
          </div>
        </header>

        {/* Image hero */}
        <div className={styles.heroImage}>
          <Image
            src={article.image}
            alt={article.imageAlt || article.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        {/* Table des matières */}
        <nav className={styles.tableOfContents}>
          <h3>📋 Sommaire</h3>
          <ul>
            <li><a href="#pourquoi-nettoyer-professionnellement">Pourquoi nettoyer professionnellement ?</a></li>
            <li><a href="#methode-injection-extraction">Méthode injection-extraction</a></li>
            <li><a href="#types-nettoyage">Types de nettoyage</a></li>
            <li><a href="#tarifs-nettoyage-2025">Tarifs 2025</a></li>
            <li><a href="#zones-intervention">Zones d'intervention</a></li>
            <li><a href="#quand-nettoyer">Quand nettoyer ?</a></li>
            <li><a href="#choisir-professionnel">Choisir son professionnel</a></li>
            <li><a href="#entretien-quotidien">Entretien quotidien</a></li>
            <li><a href="#faq">Questions fréquentes</a></li>
            <li><a href="#urgences">Interventions d'urgence</a></li>
          </ul>
        </nav>

        {/* Contenu de l'article */}
        <article 
          className={styles.articleContent}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Navigation entre articles */}
        <nav className={styles.articleNav}>
          {prevArticle && (
            <Link href={`/conseils/${prevArticle.slug}`} className={`${styles.navLink} ${styles.prev}`}>
              <div className={styles.label}>← Article précédent</div>
              <div className={styles.title}>{prevArticle.title}</div>
            </Link>
          )}
          
          {nextArticle && (
            <Link href={`/conseils/${nextArticle.slug}`} className={`${styles.navLink} ${styles.next}`}>
              <div className={styles.label}>Article suivant →</div>
              <div className={styles.title}>{nextArticle.title}</div>
            </Link>
          )}
        </nav>

        {/* CTA retour à la liste */}
        <div style={{
          textAlign: 'center',
          marginTop: '50px',
          padding: '30px',
          background: 'var(--bg-elevated)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--t-primary)' }}>
            Découvrez Nos Autres Guides
          </h3>
          <Link 
            href="/conseils"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--ac-primary)',
              color: 'var(--bg-base)',
              padding: '12px 25px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'transform 0.2s'
            }}
          >
            📚 Tous les Conseils & Guides
          </Link>
        </div>
      </div>
    </main>
  );
}